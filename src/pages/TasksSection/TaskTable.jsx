// import "./accountsSection.css";
import { Sidebar } from "../../components/Sidebar/index.jsx";
import React, { useState, useEffect } from 'react';
import { Card, ListGroup } from "react-bootstrap";
import { NavLink,Link } from 'react-router-dom';
import { Dropdown  } from "react-bootstrap";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';


import axios from "axios";
import "./task.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axiosInstance from "../../api.jsx";
const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};
export const TaskTable = () => {
  const tenantId=getTenantIdFromUrl();
  const handleAllCalls1 = (event) => {
    console.log("Filter by: ", event.target.value);
  };
  const modelName = "tasks";
 

  const handleAction = () => {
    console.log("Action required");
  };

  const handlePlusClick1 = () => {
    console.log("Plus clicked");
  };

  const handleRecords1 = (event) => {
    console.log("Records per page: ", event.target.value);
  };
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // Default view mode is table

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axiosInstance.get('/tasks/');
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(tasks);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "tasks");
    XLSX.writeFile(wb, "tasks.xlsx");
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [
        ['Subject', 'Status', 'Due Date', 'Priority', 'Description', 'Contact']
      ],
      body: tasks.map(task => [
        task.subject,
        task.status,
        task.due_date,
        task.priority,
        task.description,
        task.contact
      ]),
    });
    doc.save('tasks.pdf');
  };




  return (
   <div>
   
    <div className="tasks_main_component">
      
        <div className="home_left_box1" style={{"top":"0rem"}}>

          <Sidebar />
        </div>
      
         <div className="contain1" style={{width:"100%"}}>
         <div className="task__data" style={{marginTop:'-5rem'}}>
      <TopNavbar/>
     </div>
          <div className="meet1" >
         
            <div>
              <h1 className="task_header">Tasks</h1>
            </div>
            <div className="excel_header_task">
            <div>
              <Dropdown>
                  <Dropdown.Toggle variant="primary" id="payments-dropdown6" className="excel-dropdown-menu6-task">
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
                  <button onClick={handleDownloadPdf} className="pdf-download-btn"><FaFilePdf/>PDF</button>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
           
          
             
              <div className="create1">
                <NavLink to={`/${tenantId}/addtask`} id="btn1"> Create Task</NavLink>
              </div>
            </div>
         
            </div>
         
          
          <div>
      <div className="records20" style={{ width: "100%" }}>
   
        <select
          value={viewMode}
          onChange={(e) => handleViewModeChange(e.target.value)}
          className="view-mode-select_task"
        >
          <option value="table">Table View</option>
          <option value="tile">Tile View</option>
          <option value="list">List View</option>
        </select>

      </div>

      <br />
      
      {/* table view */}
      {viewMode === "table" && (
        <div className='table_head'> 
         
          <table >
            <thead>
              <tr  >
                <th className="table_Subject ">Subject</th>
                <th className="table_status">Status</th>
                <th className="table_due">Due Date</th>
                <th className="table_priority">Priority</th>
                <th className="table_description">Description</th>
                <th className="table_contact">Contact</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={task.id}>
                  
                  <td>
                    <Link to={`/${tenantId}/tasks/${task.id}`}>
                      {task.subject}
                    </Link>
                  </td>
                  <td className="task_status">{task.status}</td>
                  <td className="task_due_date">{task.due_date}</td>
                  <td className="task_priority">{task.priority}</td>
                  <td className="task_description">{task.description}</td>
                  <td className="task_contact">{task.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Tile View */}
      {viewMode === "tile" && (
        <div>
        
          <div className="tasks-tiles-container">
            {tasks.map((task, index) => (
              <Card key={task.id} className="task-tile">
                <Card.Body>
                  <Card.Title>
                    <Link to={`/${tenantId}/tasks/${task.id}`}>
                      {task.subject}
                    </Link>
                  </Card.Title>
                  <Card.Text>Status: {task.status}</Card.Text>
                  <Card.Text>Due Date: {task.due_date}</Card.Text>
                  <Card.Text>Description: {task.description}</Card.Text>
                  <Card.Text>Priority: {task.priority}</Card.Text>
                  <Card.Text>Contact: {task.contact}</Card.Text>
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
              {tasks.map((task, index) => (
                <ListGroup.Item key={task.id} className="accounts-list-item">
                  <Link to={`/${tenantId}/tasks/${task.id}`}>{task.subject}</Link>
                  <p>Status: {task.status}</p>
                  <p>Due Date: {task.due_date}</p>
                  <p>Description: {task.description}</p>
                  <p>Priority: {task.priority}</p>
                  <p>Contact: {task.contact}</p>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
   </div>
  );
};
export default TaskTable;