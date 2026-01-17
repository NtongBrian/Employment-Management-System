import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Alert, Spinner, Breadcrumb } from 'react-bootstrap';
import StaffGrid from './StaffGrid.jsx';

const UpcomingRetirement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, [filter]);

  const fetchEmployees = async () => {
    setLoading(true);
    const query = `
      query {
        staffList(filter: "${filter}") {
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
      const allEmployees = result.data.staffList || [];
      const retirementAge = 65;
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      const filteredEmployees = allEmployees.filter((employee) => {
        const currentDate = new Date();
        const birthYear = currentDate.getFullYear() - employee.Age;
        const retirementDate = new Date(birthYear + retirementAge, currentDate.getMonth(), currentDate.getDate());
        return retirementDate <= sixMonthsFromNow;
      });
      setEmployees(filteredEmployees);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    const mutation = `
      mutation {
        deleteStaff(id: "${id}")
      }
    `;
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: mutation }),
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      if (result.data.deleteStaff) {
        await fetchEmployees();
        setSuccess('Employee deleted successfully!');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id) => navigate(`/employees/${id}`);

  return (
    <>
      
      <Container className="mt-4">
        <h2 className="text-center text-success mb-4">Upcoming Retirement</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        {loading && <div className="text-center"><Spinner animation="border" variant="success" /></div>}
        <Form.Group className="mb-3">
          <Form.Label>Filter by Employee Type</Form.Label>
          <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="FullTime">FullTime</option>
            <option value="PartTime">PartTime</option>
            <option value="Contract">Contract</option>
            <option value="Seasonal">Seasonal</option>
          </Form.Select>
        </Form.Group>
        <StaffGrid
          employees={employees}
          loading={loading}
          error={error}
          onRowClick={handleRowClick}
          onDelete={handleDelete}
        />
      </Container>
    </>
  );
};

export default UpcomingRetirement;