import React, { useState, useEffect } from "react";
import axios from "axios";
import { Sidebar } from "../../components/Sidebar";
import "./meetings.css";
import { Dropdown, Card, ListGroup } from "react-bootstrap";
import { Link } from 'react-router-dom';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import axiosInstance from "../../api";
import * as XLSX from "xlsx"; 
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import io from 'socket.io-client';
import { useAuth } from "../../authContext";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path


export const ReminderPopup = ({ subject }) => {
  return (
      <div className="reminder-popup">
          <p>{subject}</p>
      </div>
  );
};
const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};
const Met = ({handleScheduleMeeting, scheduleData, setScheduleData}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    from_time: '',
    to_time: '',
    related_to: '',
    createdBy: '',
  });

  const tenantId = getTenantIdFromUrl(); // Ensure getTenantIdFromUrl is defined
  const modelName = 'Meetings';
  const { userId } = useAuth(); // Assuming useAuth is correctly implemented
 

 
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        createdBy: userId,
        tenant: tenantId,
        participants: 1,
      };
      const response = await axiosInstance.post('/meetings/', dataToSend);
      const meetingsId = response.data.id;
      const interactionData = {
        entity_type: 'meetings',
        entity_id: meetingsId,
        interaction_type: 'Event',
        tenant_id: tenantId,
        notes: `Meeting created with id : ${meetingsId} created by user : ${userId}`,
        interaction_datetime: new Date().toISOString(),
      };

      try {
        await axiosInstance.post('/interaction/', interactionData);
        console.log('Interaction logged successfully');
      } catch (error) {
        console.error('Error logging interaction:', error);
      }

      console.log('Meeting created successfully:', response.data);
      setMeetings([...meetings, response.data]);
      setModalOpen(false);
      setFormData({
        title: '',
        location: '',
        from_time: '',
        to_time: '',
        related_to: '',
        createdBy: '',
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  
  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(meetings);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'meetings');
    XLSX.writeFile(wb, 'meetings.xlsx');
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Title', 'From', 'To', 'Related To', 'Contact Name', 'Host']],
      body: meetings.map(meeting => [
        meeting.title,
        meeting.from_time,
        meeting.to_time,
        meeting.related_to,
        meeting.contact_name,
        meeting.host
      ]),
    });
    doc.save('meetings.pdf');
  };

  const openMeetingForm = () => {
    setModalOpen(true); // Example function to open modal
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    // Clear form data or perform other actions on modal close if needed
  };

  return (
   <div>
     <div className="oppo_nav">
     <TopNavbar openMeetingForm={openMeetingForm} />


  </div>
    <div className="calls">
      
      <div className="home_left_box">
        <Sidebar />
      </div>
<div className="meetings-header">
   <h1 className='meeting_head'>Meetings</h1>
   <div className="meeting-header-buttons">
    <div>
    <Dropdown>
              <Dropdown.Toggle variant="primary" id="payments-dropdown6" className="excel-dropdown-menu6">
                Excel File
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>
                  <Link to={`/bulk-import?model=${modelName}`} className="import-excel-btn5">
                  <FaFileExcel/>  Import Excel
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <button onClick={handleDownloadExcel} className="excel-download-btn1">
                  <FaFileExcel/>  Excel
                  </button>
                </Dropdown.Item>
                <Dropdown.Item>
                    <button onClick={handleDownloadPdf} className="pdf-download-btn1">
                    <FaFilePdf/> Pdf
                    </button>
                    </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
    </div>
           
            <div className='meet_client_meet'>
            <button id="openModal" onClick={() => setModalOpen(true)}>+Client Meetings</button>

            </div>

          </div>
</div>
     
      <div className="contain">
        <div className="meet">
          
          <div className="create">
            {modalOpen && (
              <div className="modal-overlay">
                <div className="modal-content_meet">
                  <div className="meeting-form-container">
                    <form onSubmit={handleScheduleMeeting}>
                      <fieldset className="form-fieldset">
                        <legend className="form-legend">Create A meeting</legend>
                        <label className="form-label-title" htmlFor="title">
                          Title:
                        </label>
                        <input
                          type="text"
                          name="title"
                          id="title"
                          className="form-input-title"
                          required
                          value={scheduleData.title}
                          onChange={handleChange}
                        />
                        <label className="form-label-location" htmlFor="location">
                          Location:
                        </label>
                        <input
                          type="text"
                          name="location"
                          id="location"
                          className="form-input-location"
                          required
                          value={scheduleData.location}
                          onChange={handleChange}
                        />
                        <label className="form-label-time" htmlFor="from_time">
                          From:
                        </label>
                        <input
                          type="datetime-local"
                          name="from_time"
                          id="from_time"
                          className="form-input-fromtime"
                          required
                          value={scheduleData.from_time}
                          onChange={handleChange}
                        />
                        <label className="form-label-to_time" htmlFor="to_time">
                          To:
                        </label>
                        <input
                          type="datetime-local"
                          name="to_time"
                          id="to_time"
                          className="form-input-totime"
                          required
                          value={scheduleData.to_time}
                          onChange={handleChange}
                        />
                        <label className="form-label-related_to" htmlFor="related_to">
                          Related To:
                        </label>
                        <input
                          type="text"
                          name="related_to"
                          id="related_to"
                          className="form-input-related"
                          required
                          value={scheduleData.related_to}
                          onChange={handleChange}
                        />
                         <input
                          type="text"
                          name="subject"
                          id="subject"
                          className="form-input-subject"
                          required
                          value={scheduleData.subject}
                          onChange={handleChange}
                        />
                        <label className="form-label-subject" htmlFor="location">
                          Subject:
                        </label>
                        <input
                          type="text"
                          name="createdBy"
                          id="createdBy"
                          className="form-input-createdBy"
                          required
                          value={scheduleData.createdBy}
                          onChange={handleChange}
                        />
                        <label className="form-label-createdBy" htmlFor="location">
                          Created By:
                        </label>
                        <input
                          type="datetime-local"
                          name="event_date_time"
                          id="event_date_time"
                          className="form-input-event_date_time"
                          required
                          value={scheduleData.event_date_time}
                          onChange={handleChange}
                        />
                        <label className="form-label-event_date_time" htmlFor="location">
                          Event Date Time:
                        </label>
                        {/* <label className="form-label" htmlFor="contactName">Contact Name:</label>
                        <input type="text" name="contactName" id="contactName" className="form-input" required value={formData.contactName} onChange={handleChange} />
                         */}
                        {/* <label className="form-label" htmlFor="host">Host</label> 
                        <input type="text" name="host" id="host" className="form-input" required value={formData.host} onChange={handleChange} /> 
                      */}
                      </fieldset>
                      <div className="form-button-container1">
                        <button
                          type="button"
                          className="form-button cancel-button"
                          id="closeModal"
                          onClick={() => setModalOpen(false)}
                        >
                          Close
                        </button>
                        <button type="submit" className="form-button save-button">
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="record5">
          
          <select
            value={viewMode}
            onChange={(e) => handleViewModeChange(e.target.value)}
            className="view-mode-select-meet"
          >
            <option value="">View!</option>
            <option value="table">Table View</option>
            <option value="tile">Tile View</option>
            <option value="list">List View</option>
          </select>
        </div>
        {viewMode === 'table' && (
  <div className="table10">
    <table>
      <thead>
        <tr className="host">
          <th className="title-meet">Title</th>
          <th className="from_meet">From</th>
          <th className="To_meet">To</th>
          <th className="related_meet">Related To</th>
          <th className="name_meet">Contact Name</th>
          <th className="host_meet">Host</th>
          <th className="action_meet">Action</th>
        </tr>
      </thead>
      <tbody>
    
        {meetings.map((meeting) => (
          <tr key={meeting.id}>
           
            <td className='title_row_data'>
            <Link to={`/${tenantId}/meetings/${meeting.id}`}>
            {meeting.title}
                    </Link></td>
            <td className="from_row_data">{meeting.from_time}</td>
            <td className="to_row_data">{meeting.to_time}</td>
            <td className="related_row_data">{meeting.related_to}</td>
            <td className="contact_row_data">{meeting.contact_name}</td> 
            <td className="host_meet_data">{meeting.host}</td> 
            <td className='action_data'></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

         {viewMode==='tile' &&(
          <div>
          <div className="meetings-tiles-container">
            {meetings.map((meeting, index) => (
              <Card key={meeting.id} className="meeting-tile">
                <Card.Body >
                  <Card.Title>
                    <Link to={`/${tenantId}/meetings/${meeting.id}`}>
                      {meeting.title}
                    </Link>
                  </Card.Title>
                  <Card.Text>From: {meeting.from_time}</Card.Text>
                  <Card.Text>To: {meeting.to_time}</Card.Text>
                  <Card.Text>Related To: {meeting.related_to}</Card.Text>
                  <Card.Text>Host Name: {meeting.host}</Card.Text>
                  <Card.Text>Contact Name: {meeting.contact_name}</Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
        )}
{viewMode==='list' &&(
          <div>
          <h2>List View</h2>
          <div className="meeting-list-container">
            <ListGroup>
              {meetings.map((meeting, index) => (
                <ListGroup.Item key={meeting.id} className="accounts-list-item">
                  <Link to={`/${tenantId}/meetings/${meeting.id}`}>{meeting.title}</Link>
                  <p>From: {meeting.from_time}</p>
                  <p>To: {meeting.to_time}</p>
                  <p>Related To: {meeting.related_to}</p>
                  <p>Host Name: {meeting.host}</p>
                  <p>Contact Name: {meeting.contact_name}</p>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </div>
        )}
        
      </div>
    </div>
   </div>
  );
};

export default Met;
