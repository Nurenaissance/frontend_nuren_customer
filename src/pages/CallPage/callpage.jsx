import React, { useState, useEffect } from "react";
import "./callpage.css";
import { Sidebar } from "../../components/Sidebar";
import axios from "axios";
import { Link } from "react-router-dom";
import { Dropdown,Card, ListGroup } from "react-bootstrap";
import * as XLSX from "xlsx"; 
import jsPDF from "jspdf";
import "jspdf-autotable";
import axiosInstance from "../../api";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';


import { useAuth } from "../../authContext";
import { Call } from "@mui/icons-material";

const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};



export const CallPage = ({handleScheduleMeeting, scheduleData, setScheduleData}) => {

  const tenantId=getTenantIdFromUrl();
  const [modalOpen, setModalOpen] = useState(false);
  const [calls, setCalls] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [meet, setMeet] = useState([]);
  const {userId}=useAuth();
  const [reminders, setReminders] = useState([]);
  const { authenticated,userRole } = useAuth();

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false); 
  
  const modelName = "Calls";


  const [formData, setFormData] = useState({
    call_to: "",
    call_type: "",
    start_time: "",
    to_time: "",
    related_to: "",
    createdBy: "",
    
  });
  
  

 
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach((reminder) => {
        if (reminder.triggerTime <= now) {
          console.log("Reminder:", reminder.message);
          dismissReminder(reminder.id);
        }
      });
    }, 60000); 
    return () => clearInterval(interval);
  }, [reminders]);
console.log(authenticated)

 
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  }; const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(calls);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "calls");
    XLSX.writeFile(wb, "callls.xlsx");
  };

  const handleDownloadPDF = () => {
    const unit = "pt";
    const size = "A4"; // Use A4 size for simplicity
    const orientation = "landscape"; // Landscape orientation for table format

    const doc = new jsPDF(orientation, unit, size);

    const title = "Calls Report";
    const headers = [
      ["Contact Name", "Call Type", "Call Start Time", "Call Duration", "Related To", "Location", "Recording"]
    ];

    const data = calls.map(call => [call.call_to, call.call_type, call.start_time, call.call_duration, call.related_to, call.location, call.voice_recording]);

    doc.setFontSize(15);
    doc.text(title, 40, 30);

    doc.autoTable({
      startY: 40,
      head: headers,
      body: data,
    });

    doc.save("calls_report.pdf");
  };


  
  const handleDropDownChange = (e) => {
    const selectedOption = e.target.value;
    if (selectedOption === "log") {
      setModalOpen(true);
    } else if (selectedOption === "schedule") {
      setScheduleModalOpen(true);
    } else {
      
    }
  };
  const closeModal = () => {
    setModalOpen(false);
    setScheduleModalOpen(false);

  };

  const fetchCalls = async () => {
    try {
      const response = await axiosInstance.get('/calls/', {
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      setCalls(response.data);
    } catch (error) {
      console.error("Error fetching calls:", error);
    }
  };
    useEffect(() => {
      fetchCalls();
    }, []);
   
  

  

 

useEffect(() => {
  const modal1 = document.querySelector("#modal1");
  const openModal = document.querySelector("#openModal");
  const closeModal = document.querySelector("#closeModal");

  if (modal1 && openModal && closeModal) {
    openModal.addEventListener("click", () => setModalOpen(true));
    closeModal.addEventListener("click", () => setModalOpen(false));
  }

  return () => {
    if (modal1 && openModal && closeModal) {
      openModal.removeEventListener("click", () => setModalOpen(true));
      closeModal.removeEventListener("click", () => setModalOpen(false));
    }
  };
}, []);





const handleCreateMeeting = async (e) => {
  e.preventDefault();
  console.log("Form submit event:", e);

  /*const apptValue = e.target.appt?.value || "";
  const timeValue = e.target.time?.value || "";

  if (!apptValue || !timeValue) {
    console.error("Missing appt or time value");
    return;
  }*/

  /*const startTime = new Date(apptValue).toISOString();
  const toTime = new Date(new Date().setHours(...timeValue.split(":"))).toISOString();
*/
  /*const formData = {
    location: e.target.location?.value || "",
    call_type: e.target.related_to?.value || "",
    start_time: startTime,
    to_time: toTime,
    related_to: e.target.related_to ? e.target.related_to.value : "",
    createdBy: e.target.createdBy ? e.target.createdBy.value : "",
    outgoing_status: e.target.repeat ? e.target.repeat.value : "",
  };*/

  try {
    const dataToSend = {
      ...formData,
      createdBy: userId, // Pass userId as createdBy
      tenant: tenantId,
      start_time: "2024-05-27T14:34:00Z", 
      to_time: "2024-05-27T15:15:00Z",
    };
    const response = await axiosInstance.post('/calls/',dataToSend);
    const callId = response.data.id;
      const interactionData = {
        entity_type: "calls",
        entity_id: callId,
        interaction_type: "Event",
        tenant_id: tenantId, // Make sure you have tenant_id in movedCard
        notes: `Call created with id : ${callId} created by user : ${userId}`,
        interaction_datetime: new Date().toISOString(),
      };

      try {
          await axiosInstance.post('/interaction/', interactionData);
          console.log('Interaction logged successfully');
        } catch (error) {
          console.error('Error logging interaction:', error);
        }
    console.log("Call logged successfully:", response.data);
    closeModal();
    fetchCalls();
  } catch (error) {
    console.error("Error logging call:", error);
  }
};




 const handleAllCalls = (event) => {
    console.log("Filter by: ", event.target.value);
  };

 
  
  const handlePlusClick = () => {
    console.log("Plus clicked");
  };

  const handleRecords = (event) => {
    console.log("Records per page: ", event.target.value);
  };

  return (
    <div>
       <div className="call_nav">
    <TopNavbar/>
  </div>
    <div className="calls">
      <div className="home_left_box">
        <Sidebar />
      </div>
     
      <div className="contain1">
     
        <div className="meet1" style={{display:'flex',flexDirection:'row'}}>
        <h1 className="call_head"> Calls </h1>
        <div className="menu_call">
        <Dropdown >
          <Dropdown.Toggle variant="primary" id="payments-dropdown" className="excel-dropdown-menu_call">
            Excel File
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item>
              <Link
                to={`/bulk-import?model=${modelName}`}
                className="import-excel-btn5"
              >
              <FaFileExcel/>  Import Excel
              </Link>
            </Dropdown.Item>
            <Dropdown.Item>
              <button
                onClick={handleDownloadExcel}
                className="excel-download-btn1"
              >
               <FaFileExcel/> Excel
              </button>
            </Dropdown.Item>
            <Dropdown.Item>
            <button onClick={handleDownloadPDF} className="pdf-download-btn">
            <FaFilePdf/>  Download PDF
            </button>
          </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        </div>
          {/* <div className="Addcalls">
            <select onChange={handleAllCalls}>
              <option value="">All Calls</option>
              <option value="1">Log in</option>
              <option value="2">Log out</option>
            </select>
          </div> */}
          <div className="handle">
            {/* <select onChange={handlePlusClick}>
              <option value="">!!!</option>
              <option value="1">Log in</option>
              <option value="2">Log out</option>
            </select> */}
            < div style ={{display:'flex',flexDirection:'column'}}>
              <div>
            <select  className="create4" onChange={handleDropDownChange}>
              <option value="">Select Action</option>
              <option value="schedule">Schedule a Call</option>
              <option value="log">Log a Call</option>
            </select>
          
           
            <dialog id="modal1" open={modalOpen}>
  <div className="meeting-form-container10">
    <form onSubmit={handleCreateMeeting} id="meeting-form">
      <fieldset className="form-fieldset">
        <legend className="form-legend_log">Log a Call</legend>
        <label className="labelcall-location" htmlFor="location">
          Call To:
        </label>
        <input
          type="text"
          name="location"
          id="location"
          className="form-input_logAcall"
          required
        />
        <label className="form-Related_to" htmlFor="participants">
          Related To:
        </label>
        <input
          type="text"
          name="participants"
          id="participants"
          className="form-input_torelated"
          required
        />
        <label className="form-label_callType" htmlFor="related-to">
          Call Type:
        </label>
        <input
          type="text"
          name="related-to"
          id="related-to"
          className="form-input_calltype"
          required
        />
        <label className="form-label_call_Status" htmlFor="repeat">
          Outgoing Call Status:
        </label>
        <input
          type="text"
          name="repeat"
          id="repeat"
          className="form-callsStatus"
          required
        />
        <label  className='form-label_select' htmlFor="appt">
          Select a time:
        </label>
        <input
          type="datetime-local"
          name="appt"
          id="appt"
          className="form-selectTime"
          required
        />
        <label className="form-label_duration" htmlFor="time"> CallDuration:</label>
        <input
          type="time"
          name="time"
          id="time"
          className="form-input_duration"
          required
        />
        {/* <label className="form-descriCall" htmlFor="description">
          Voice Recording
        </label>
        <textarea
          type="text"
          name="description"
          id="description"
          className="form-call_descri"
          required
        /> */}
      </fieldset>
      <div className="form-button-container30">
        <button
          type="button"
          className="form-button cancel-button"
          onClick={closeModal}
        >
          Close
        </button>
        <button type="submit" className="form-button save-button">
          Save
        </button>
      </div>
    </form>
  </div>
</dialog>
              <dialog id="scheduleModal" open={scheduleModalOpen}>
        <div className="call-form-container"> 
          <form onSubmit={handleScheduleMeeting} id="schedule-form">
            <fieldset className="form-fieldset">
              <legend className="form-legend-schedule">Schedule Call</legend>
              <label className="form-subject" htmlFor="subject">
               Subject :
              </label>
              <input
                type="text"
                name="subject"
                id="subject"
                className="form-input_subjectcall"
                value={scheduleData.subject}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, subject : e.target.value })
                }
                required
              />
              <label className="form-DateTime" htmlFor="eventDateTime">
              Event Date Time:
              </label>
              <input
                type="datetime-local"
                name="eventDateTime"
                id="eventDateTime"
                className="form-input_dateTime"
                 value={scheduleData.event_date_time}
                 onChange={(e) => setScheduleData({ ...scheduleData, event_date_time: e.target.value })}
                 required
                
              />
            
                          
                          <label className="form-timeTrigeer" htmlFor="timeTrigger">Time Trigger:</label>
              <input
                type="datetime-local"
                name="timeTrigger"
                id="timeTrigger"
                className="form-input_timetrigger"
                value={scheduleData.time_trigger}
                onChange={(e) => setScheduleData({ ...scheduleData, time_trigger: e.target.value })}
                required
              />
                       <label className="form-CreatedBy" htmlFor="createdBy">Created By : </label>
              <input
                type="createdBy"
                name="createdBy"
                id="createdBy"
                className="form-input_createdBy"
                value={scheduleData.createdBy}
                onChange={(e) => setScheduleData({ ...scheduleData, createdBy: e.target.value })}
                required
              />
                
               
             
              
            </fieldset>
            <div className="form-button-container_call">
              <button
                type="button"
                className="form-button cancel-button1"
                onClick={closeModal}
              >
                Close
              </button>
              <button type="submit" className="form-button save-button1">
                Schedule
              </button>
            </div>
          </form>
         
        </div>
      </dialog>
            </div>
            <div className="recordss" style={{ width: "100%" }}>
       
          <select
              value={viewMode}
              onChange={(e) => handleViewModeChange(e.target.value)}
              className="view-mode-select"
            >
              <option value="">View!</option>
              <option value="table">Table View</option>
              <option value="tile">Tile View</option>
              <option value="list">List View</option>
            </select>
        </div>
            {/* <select onChange={handleCreateMeeting}>
              <option value="">Action</option>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
            </select> */}
            </div>
          </div>
        </div>
        

        {/* table view */}
        {viewMode === "table" && (
          <div className="table_call">
            <table>
              <thead>
                <tr className="calls_row_head">
                  <th>Contact Name</th>
                  <th>Call Type</th>
                  <th>Call Start Time</th>
                  <th>Call Duration</th>
                  <th>Related To</th>
                  <th>Location</th>
                  <th>Recording</th>
                </tr>
              </thead>
              <tbody>
              {calls.map((call) => (
    <tr key={call.id}>
        <td className="call_to">{call.call_to}</td>
        <td className='call_to'>
            <Link to={`/${tenantId}/callpage/${call.id}`}>
                {call.call_type}
            </Link>
        </td>
        <td className="call_start">{call.start_time}</td>
        <td className="call_duration">{call.call_duration}</td>
        <td className="call_related">{call.related_to}</td>
        <td className="call_location">{call.location}</td>
        <td className="call_record">{call.voice_recording}</td>
    </tr>
))}

              </tbody>
            </table>
          </div>
        )}

        {/* Tile View */}
        {viewMode === "tile" && (
          <div>
     
            {/* Implement your Kanban view here */}
            <div className="calls-tiles-container">
              {calls.map((call, index) => (
                <Card key={call.id} className="calls-tile">
                  <Card.Body>
                    <Card.Title>
                      <Link to={`/${tenantId}/calls/${call.id}`}>{call.call_to}</Link>
                    </Card.Title>
                    <Card.Text>Call Type: {call.call_type}</Card.Text>
                    <Card.Text>Start Time: {call.start_time}</Card.Text>
                    <Card.Text>Call Duration: {call.call_duration}</Card.Text>
                    <Card.Text>Related To: {call.related_to}</Card.Text>
                    <Card.Text>Location: {call.location}</Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        )}
        {viewMode === "list" && (
          <div>
            <h2>List View</h2>
            <div className="accounts-list-container">
              <ListGroup>
                {calls.map((call, index) => (
                  <ListGroup.Item key={call.id} className="accounts-list-item">
                    <Link to={`/${tenantId}/calls/${call.id}`}>{call.Name}</Link>
                    <p>Call Type: {call.call_type}</p>
                    <p>Start Time: {call.start_time}</p>
                    <p>Call Duration: {call.call_duration}</p>
                    <p>Related To: {call.related_to}</p>
                    <p>Location: {call.location}</p>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </div>
        )}
         {/*{reminders.map((reminder) => (
          <Reminder
            key={reminder.id}
            message={reminder.message}
            onClose={() => dismissReminder(reminder.id)}
          />
        ))}*/}
        {/*{reminderMessage && (
        <Reminder message={reminderMessage} onClose={() => setReminderMessage("")} />
      )}*/ } 
      </div>
    </div>
    </div>
   
  );
};

export default CallPage;