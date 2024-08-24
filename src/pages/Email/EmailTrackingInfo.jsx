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
  Container,
  Chip
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

const StyledChip = styled(Chip)({
    margin: '2px',
  });


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
          const response = await axiosInstance.get('emails/');
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
          const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                email.email_id.toLowerCase().includes(searchTerm.toLowerCase());
          
          return matchesStatus && matchesPeriod && matchesSearch;
        });
      }, [emails, filterStatus, filterPeriod, searchTerm]);
  
      const calculateTimeSpent = (email) => {
        if (!email.is_open || !email.time_open) return '0s';
        
        const openTime = new Date(email.time_open);
        const clickedLink = email.links.find(link => link.is_clicked && link.time_clicked);
        
        if (!clickedLink) return '0s';
        
        const clickTime = new Date(clickedLink.time_clicked);
        const timeDiff = Math.max(0, clickTime - openTime);
  
        const hours = Math.floor(timeDiff / 3600000);
        const minutes = Math.floor((timeDiff % 3600000) / 60000);
        const seconds = Math.floor((timeDiff % 60000) / 1000);
  
        let timeSpent = '';
        if (hours > 0) timeSpent += `${hours}h `;
        if (minutes > 0 || hours > 0) timeSpent += `${minutes}m `;
        timeSpent += `${seconds}s`;
  
        return timeSpent.trim() || '0s';
      };
  

      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
      };
  
      const getClickedButtons = (links) => {
        return links.filter(link => link.is_clicked).length;
      };

  return (
    <StyledContainer maxWidth="lg">
      {/* <Typography variant="h3" gutterBottom fontWeight="bold" color="primary">
        Email Tracking
      </Typography> */}
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
              <StyledTableHeaderCell>Time Spent</StyledTableHeaderCell>
              <StyledTableHeaderCell>Buttons Clicked</StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((email) => (
              <TableRow key={email.id} hover>
                <StyledTableCell>{email.email_id}</StyledTableCell>
                <StyledTableCell>{email.subject}</StyledTableCell>
                <StyledTableCell>{formatDate(email.time)}</StyledTableCell>
                <StyledTableCell>
                  <StyledChip 
                    label={email.is_open ? 'Opened' : 'Not Opened'} 
                    color={email.is_open ? 'success' : 'default'}
                  />
                </StyledTableCell>
                <StyledTableCell>{formatDate(email.time_open)}</StyledTableCell>
                <StyledTableCell>{calculateTimeSpent(email)}</StyledTableCell>
                <StyledTableCell>
                  {getClickedButtons(email.links)} / {email.links.length}
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    </StyledContainer>
  );
};

export default EmailTracking;