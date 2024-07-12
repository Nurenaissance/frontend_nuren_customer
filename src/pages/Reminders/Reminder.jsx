import React, { useEffect,useState } from "react";
import { Link,NavLink } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { Dropdown, Card, ListGroup } from "react-bootstrap";
import axiosInstance from "../../api";
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Reminder.css';
import './createreminder.jsx';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';



const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1];
  }
  return null;
};

const Remind = () => {
  const [reminders, setReminders] = useState([]);
  const tenantId = getTenantIdFromUrl();
  const modelName = "reminder";

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await axiosInstance.get('/reminders/');
        setReminders(response.data);
      } catch (error) {
        console.error("Error fetching reminders:", error);
      }
    };
    fetchReminders();
  }, []);

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reminders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reminders");
    XLSX.writeFile(wb, "reminders.xlsx");
  };

  const handleDownloadPDF = () => {
    const unit = "pt";
    const size = "A4"; // Use A4 size for simplicity
    const orientation = "landscape"; // Landscape orientation for table format
  
    const doc = new jsPDF(orientation, unit, size);
  
    const title = "Reminders Report";
    const headers = [
      [
        "Subject",
        "Trigger Type",
        "Event Date",
        "Created At",
        "Event Time",
        "Status",
        "Created By"
      ]
    ];
  
    const data = reminders.map(reminder => [
      reminder.subject,
      reminder.trigger_type,
      reminder.event_date_time,
      reminder.created_at,
      reminder.time_trigger,
      reminder.is_triggered,
      reminder.createdBy
    ]);
  
    doc.setFontSize(15);
    doc.text(title, 40, 30);
  
    doc.autoTable({
      startY: 40,
      head: headers,
      body: data,
    });
  
    doc.save("reminders_report.pdf");
  };
  

  return (
    <div >
 <div className="Add-reminder-topnav">
        <TopNavbar/>
      </div>
      <div className="remind_page">
      <div className="home_left_box4">
        <Sidebar />
      </div>
      <div>
      <div className="remind-merge">
     <div className="remind-head">
        <h1>Reminders</h1>

        </div>
        <div className="excel_form">
        <div >
        <Dropdown>
            <Dropdown.Toggle variant="primary" id="reminders-dropdown" className="excel-dropdown-menu6-remind">
              Excel File
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>
                <button onClick={handleDownloadExcel}><FaFileExcel/>Download Excel</button>
              </Dropdown.Item>
              <Dropdown.Item>
              <button onClick={handleDownloadPDF}><FaFilePdf/>Download PDF</button>
            </Dropdown.Item>

            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="create-reminder">
                <NavLink to={`/${tenantId}/createreminder`} id="btn5"> CreateReminder</NavLink>
              </div>
        </div>
    
        
     </div>

     <div className="remind-box">
      <div >
        <p className="reminds-box-head">Upcoming Reminders this week</p>
      </div>

      <div className='reminds-boxes'>
      <div className="first-remindbx">
        <div className='rem-box'>
        <div>  <h1 className="first_head_rem">Upcoming Meeting </h1></div>
        <div className="rem">
          In 10 min
        </div>
        
        
        </div>
        <div>
          <h1 className="external_remind">External Meeting-Negotiation</h1>
        </div>
        <div>
          <h1 className="time-remind">  <AccessTimeRoundedIcon/>08:00-09:00 PM</h1>
        </div>
       

</div>
<div className="second-remindbx">
<div className='rem-box'>
        <div>  <h1 className="first_head_rem">Upcoming Meeting </h1></div>
        <div className="rem">
          In 10 min
        </div>
        
        
        </div>
        <div>
          <h1 className="external_remind">External Meeting-Negotiation</h1>
        </div>
        <div>
          <h1 className="time-remind">  <AccessTimeRoundedIcon/>08:00-09:00 PM</h1>
        </div>
</div>
<div className="third-remindbx">
<div className='rem-box'>
        <div>  <h1 className="first_head_rem">Upcoming Meeting </h1></div>
        <div className="rem">
          In 10 min
        </div>
        
        
        </div>
        <div>
          <h1 className="external_remind">External Meeting-Negotiation</h1>
        </div>
        <div>
          <h1 className="time-remind">  <AccessTimeRoundedIcon/>08:00-09:00 PM</h1>
        </div>
</div>

      </div>
     
     </div>

   
     <div className='table_remind'> 
         
         <table >
           <thead>
             <tr   >
               <th  className="table-remind-row" >Subject</th>
               <th  className="table-remind-row" >Trigger Type</th>
               <th  className="table-remind-row">Event Date</th>
               <th  className="table-remind-row" >created at</th>
               <th  className="table-remind-row" >Event time</th>
               <th   className="table-remind-row">Status</th>
               <th  className="table-remind-row">Action</th>
             </tr>
           </thead>
           <tbody>
           {reminders.map((reminder, index) => (
  <tr key={index}>
    <td className="remind-data">{reminder.subject}</td>
    <td className="remind-data1">{reminder.trigger_type}</td>
    <td className="remind-data1">{reminder.event_date_time}</td>
    <td className="remind-data1">{reminder.created_at}</td>
    <td className="remind-data1">{reminder.time_trigger}</td>
    <td className="remind-data2">{reminder.is_triggered}</td>
    <td className="remind-data3">{reminder.createdBy}</td>
  </tr>
))}

           </tbody>
         </table>
      

     </div>
      </div>
     
   
       
      </div>
     
      
   
    </div>
  );
};

export default Remind;
