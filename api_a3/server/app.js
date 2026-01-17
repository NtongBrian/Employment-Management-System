require('dotenv').config({ path: 'env.env' });
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const { GraphQLDateTime } = require('graphql-scalars');
const { emsConnect, dbListStaff, dbAddStaff, dbGetStaffById, dbUpdateStaff, dbDeleteStaff } = require('./db');
const cors = require('cors');

const app = express();
const PORT = process.env.API_SERVER_PORT || 4000;
const enableCors = process.env.ENABLE_CORS === 'true';

// Apply CORS middleware before Apollo
app.use(cors({
  origin: 'http://localhost:3000', // Allow only the frontend origin
  methods: ['GET', 'POST', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
  credentials: true, // If you need cookies/auth
}));

const staffSchema = gql`
  scalar DateTime

  type Staff {
    _id: ID!
    FirstName: String!
    LastName: String!
    Age: Int!
    DateOfJoining: DateTime!
    Title: String!
    Department: String!
    EmployeeType: String!
    CurrentStatus: Boolean!
  }

  type Query {
    staffList(filter: String): [Staff!]!
    staffById(id: ID!): Staff
  }

  type Mutation {
    createStaff(
      FirstName: String!
      LastName: String!
      Age: Int!
      DateOfJoining: DateTime!
      Title: String!
      Department: String!
      EmployeeType: String!
    ): Staff
    updateStaff(
      id: ID!
      Title: String
      Department: String
      CurrentStatus: Boolean
    ): Staff
    deleteStaff(id: ID!): Boolean
  }
`;

const staffResolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    staffList: async (_, { filter }) => {
      let query = dbListStaff();
      if (filter && filter !== 'All') {
        query = query.where('EmployeeType').equals(filter);
      }
      return await query.lean(); // Execute the query and convert to plain objects
    },
    staffById: async (_, { id }) => await dbGetStaffById(id),
  },
  Mutation: {
    createStaff: async (_, args) => await dbAddStaff(args),
    updateStaff: async (_, { id, Title, Department, CurrentStatus }) => {
      const update = {};
      if (Title) update.Title = Title;
      if (Department) update.Department = Department;
      if (CurrentStatus !== undefined) update.CurrentStatus = CurrentStatus;
      return await dbUpdateStaff(id, update);
    },
    deleteStaff: async (_, { id }) => {
  try {
    return await dbDeleteStaff(id);
  } catch (error) {
    throw new Error(error.message);
  }
},
  },
};

async function launchEMSServer() {
  const server = new ApolloServer({
    typeDefs: staffSchema,
    resolvers: staffResolvers,
    cors: false,
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  await emsConnect();
  app.listen(PORT, () => {
    console.log(`EMS Server running at http://localhost:${PORT}`);
    console.log(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
  });
}

launchEMSServer();