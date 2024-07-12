import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { Card, ListGroup , Dropdown } from "react-bootstrap";  
import './InteractionPage.css';
import InteractionDetailsPage from "./InteractionDetailsPage";  
import axiosInstance from "../../api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};
export const InteractionTable = () => {
  const tenantId=getTenantIdFromUrl();
  const [interactions, setInteractions] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [filteredInteractions, setFilteredInteractions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const modelName = "Interection";

  
  useEffect(() => {
    fetchInteractions();
  }, []);

  const fetchInteractions = async () => {
    try {
      const response = await axiosInstance.get('/interaction/');
      setInteractions(response.data);
      setFilteredInteractions(response.data);
    } catch (error) {
      console.error("Error fetching interactions:", error);
    }
  };
  const entityTypeNames = {
    5: "Account",
    10: "Contact",
    // Add more mappings as needed
  };

  const handleInteractionClick = (interaction) => {
    console.log(interaction);
    setSelectedInteraction(interaction);
  };
  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(interactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "interactions");
    XLSX.writeFile(wb, "interactions.xlsx");
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [
        ['Entity ID', 'Type', 'Interaction Type', 'Interaction Datetime', 'Notes']
      ],
      body: filteredInteractions.map(interaction => [
        interaction.entity_id,
        entityTypeNames[interaction.entity_type] || interaction.entity_type,
        interaction.interaction_type,
        interaction.interaction_datetime,
        interaction.notes
      ]),
    });
    doc.save('interactions.pdf');
  };

  return (
    <div className="interaction-table">

<div className="home_left_box1" style={{"top":"0rem"}}>
        <Sidebar />
      </div>
      <div className="interection_head">
            <div className="int_heading">
              <div>
              <h1>Interaction</h1>
              </div>
             <div style={{display:'flex',flexDirection:'row',marginRight:'50px'}}>
            
           
        
                  <div className="excel_int_drop">
                          <Dropdown>
                          <Dropdown.Toggle variant="primary" id="payments-dropdown6" className="excel-dropdown-int">
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
                            <button onClick={handleDownloadPdf} className="pdf-download-btn"><FaFilePdf/>Download PDF</button>
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                          </div>
                          <div className="add_int"  >
                      
                      <NavLink to={`/${tenantId}/addinteraction`} className="add-interaction-button">Add Interaction</NavLink>           

                    </div>
                          
                        </div>
                  
                </div>
     
      

      <div className="contain1">
        {viewMode === "table" && (
          <div className="table_interection">
            <table>
              <thead>
                <tr>
                  <th>Entity ID</th>
                  <th>Type</th>
                  <th>Interaction Type</th>
                  <th>Interaction Datetime</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredInteractions.map((interaction) => (
                  <tr key={interaction.id}>
                    <td><Link to={`/${tenantId}/interaction/${interaction.id}`} onClick={() => handleInteractionClick(interaction)}>{interaction.entity_id}</Link></td>
                    <td>{entityTypeNames[interaction.entity_type] || interaction.entity_type}</td>
                    <td>{interaction.interaction_type}</td>
                    <td>{interaction.interaction_datetime}</td>
                    <td>{interaction.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedInteraction && <InteractionDetailsPage />}
    </div>
    </div>
  );
};
