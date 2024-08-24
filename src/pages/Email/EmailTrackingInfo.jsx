import React, { useState, useMemo, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Box,
  Typography,
  Container
} from '@mui/material';
import { styled } from '@mui/system';
import axiosInstance from '../../api';

// Styled components
const StyledContainer = styled(Container)({
  marginTop: 40,
  marginBottom: 40,
});

const StyledTableContainer = styled(TableContainer)({
  maxHeight: 600,
  marginTop: 30,
  boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
});

const StyledTable = styled(Table)({
  minWidth: 650,
});

const StyledTableHeaderCell = styled(TableCell)({
  backgroundColor: '#1976d2',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  padding: '16px',
});

const StyledTableCell = styled(TableCell)({
  fontSize: '1rem',
  padding: '16px',
});

const FilterContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 30,
  flexWrap: 'wrap',
  gap: '20px',
});

const StyledFormControl = styled(FormControl)({
  minWidth: 200,
});

const StyledTextField = styled(TextField)({
  minWidth: 300,
});

// Dummy data (same as before)
const dummyData = [
  { id: 1, emailId: 'user1@example.com', subject: 'Meeting Tomorrow', sentTime: '2024-08-22T10:00:00', status: 'Opened', openedTime: '2024-08-22T10:15:00' },
  { id: 2, emailId: 'user2@example.com', subject: 'Project Update', sentTime: '2024-08-22T11:30:00', status: 'Not Opened', openedTime: null },
  { id: 3, emailId: 'user3@example.com', subject: 'Urgent: Please Review', sentTime: '2024-08-22T09:15:00', status: 'Opened', openedTime: '2024-08-22T09:20:00' },
  { id: 4, emailId: 'user4@example.com', subject: 'Weekly Newsletter', sentTime: '2024-08-21T16:00:00', status: 'Opened', openedTime: '2024-08-21T18:30:00' },
  { id: 5, emailId: 'user5@example.com', subject: 'Invitation to Company Event', sentTime: '2024-08-20T14:45:00', status: 'Not Opened', openedTime: null },
];

const EmailTracking = () => {
    const [emails, setEmails] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPeriod, setFilterPeriod] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
  
    useEffect(() => {
      fetchEmails();
    }, []);
  
    const fetchEmails = async () => {
      try {
        const response = await axiosInstance.get('https://lxx1lctm-8000.inc1.devtunnels.ms/emails/');
        setEmails(response.data);
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };
  
    const filteredData = useMemo(() => {
      return emails.filter(email => {
        const matchesStatus = filterStatus === 'All' || 
          (filterStatus === 'Opened' && email.is_open) || 
          (filterStatus === 'Not Opened' && !email.is_open);
        const matchesPeriod = filterPeriod === 'All' || 
          (filterPeriod === 'Today' && new Date(email.time).toDateString() === new Date().toDateString()) ||
          (filterPeriod === 'This Week' && new Date(email.time) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesStatus && matchesPeriod && matchesSearch;
      });
    }, [emails, filterStatus, filterPeriod, searchTerm]);
  

  return (
    <StyledContainer maxWidth="lg">
      <Typography variant="h3" gutterBottom fontWeight="bold" color="primary">
        Email Tracking
      </Typography>
      <FilterContainer>
        <StyledFormControl variant="outlined">
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Opened">Opened</MenuItem>
            <MenuItem value="Not Opened">Not Opened</MenuItem>
          </Select>
        </StyledFormControl>
        <StyledFormControl variant="outlined">
          <InputLabel>Period</InputLabel>
          <Select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            label="Period"
          >
            <MenuItem value="All">All Time</MenuItem>
            <MenuItem value="Today">Today</MenuItem>
            <MenuItem value="This Week">This Week</MenuItem>
          </Select>
        </StyledFormControl>
        <StyledTextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FilterContainer>
      <StyledTableContainer component={Paper}>
        <StyledTable stickyHeader aria-label="email tracking table">
          <TableHead>
            <TableRow>
              <StyledTableHeaderCell>Email ID</StyledTableHeaderCell>
              <StyledTableHeaderCell>Subject</StyledTableHeaderCell>
              <StyledTableHeaderCell>Sent Time</StyledTableHeaderCell>
              <StyledTableHeaderCell>Status</StyledTableHeaderCell>
              <StyledTableHeaderCell>Opened Time</StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id} hover>
                <StyledTableCell>{row.emailId}</StyledTableCell>
                <StyledTableCell>{row.subject}</StyledTableCell>
                <StyledTableCell>{new Date(row.sentTime).toLocaleString()}</StyledTableCell>
                <StyledTableCell>{row.status}</StyledTableCell>
                <StyledTableCell>{row.openedTime ? new Date(row.openedTime).toLocaleString() : 'N/A'}</StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    </StyledContainer>
  );
};

export default EmailTracking;