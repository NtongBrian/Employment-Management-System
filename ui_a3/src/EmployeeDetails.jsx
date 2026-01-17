import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      const query = `
        query {
          staffById(id: "${id}") {
            _id
            FirstName
            LastName
            Age
            DateOfJoining
            Title
            Department
            EmployeeType
            CurrentStatus
          }
        }
      `;
      try {
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
        if (!result.data.staffById) throw new Error('Employee not found');
        setEmployee(result.data.staffById);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="msg-error">Error: {error}</p>;
  if (!employee) return <p className="msg-error">Employee not found</p>;

  return (
    <div>
      <style>
        {`
          .employee-details {
            max-width: 400px;
            width: 90%;
            margin: 20px auto;
            padding: 20px;
            background: #ffffff;
            border: 1px solid #d0d0d0;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .employee-details h2 {
            text-align: center;
            color: #1b5e20;
            margin-bottom: 15px;
            font-size: 1.5rem;
          }
          .employee-details p {
            margin: 10px 0;
            font-size: 0.9rem;
            color: #333;
          }
          .employee-details .label {
            font-weight: 500;
            color: #1b5e20;
            margin-right: 5px;
          }
          .employee-details button {
            background: #2e7d32;
            color: #fff;
            padding: 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
            font-size: 0.9rem;
            transition: background-color 0.3s ease;
            margin-top: 3px;
          }
          .employee-details button:hover {
            background: #1b5e20;
          }
          .msg-error {
            color: rgb(193, 37, 37);
            font-size: 0.85rem;
            text-align: center;
            margin: 10px 0;
          }
          @media (max-width: 600px) {
            .employee-details {
              width: 95%;
              padding: 15px;
            }
            .employee-details h2 {
              font-size: 1.2rem;
            }
            .employee-details p {
              font-size: 0.85rem;
            }
            .employee-details button {
              font-size: 0.85rem;
              padding: 8px;
            }
          }
        `}
      </style>
      <div className="employee-details">
        <h2>{employee.FirstName} {employee.LastName}</h2>
        <p><span className="label">Age:</span> {employee.Age}</p>
        <p><span className="label">Join Date:</span> {new Date(employee.DateOfJoining).toLocaleDateString()}</p>
        <p><span className="label">Title:</span> {employee.Title}</p>
        <p><span className="label">Department:</span> {employee.Department}</p>
        <p><span className="label">Type:</span> {employee.EmployeeType}</p>
        <p><span className="label">Status:</span> {employee.CurrentStatus ? 'Active' : 'Inactive'}</p>
        <Link to={`/employees/${id}/update`} style={{ textDecoration: 'none' }}>
          <button>Edit Employee</button>
        </Link>
      </div>
    </div>
  );
};

export default EmployeeDetails;