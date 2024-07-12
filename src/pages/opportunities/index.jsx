import React, { useEffect, useState } from "react";

import { Sidebar } from "../../components/Sidebar";
import { OpportunitiesContent } from "../../components/OpportunitiesContent";
import "./Form3.jsx";
import { NavLink,Link ,useParams} from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Dropdown } from "react-bootstrap";
import axiosInstance from "../../api.jsx";
import Kanban2 from "../../components/Kanban/Kanban2"; // Adjust the path as needed
import OpportunitiesTable from "./opportunitiesTable.jsx";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path

export const Opportunities = () => {
  
  const { pathname } = useLocation();
  const tenantId = getTenantIdFromUrl();
  const [viewMode, setViewMode] = useState("kanban");

  const toggleViewMode = () => {
    setViewMode(viewMode === "kanban" ? "table" : "kanban");
  };
  function getTenantIdFromUrl() {
    const pathArray = pathname.split('/');
    if (pathArray.length >= 2) {
      return pathArray[1]; // Assumes tenant_id is the first part of the path
    }
    return null; // Return null if tenant ID is not found or not in the expected place
  }

  const [oppourtunity, setOppourtunity] = useState([]);

  useEffect(() => {
    fetchOppourtunity();
  }, []);

  const fetchOppourtunity = async () => {
    try {
      const response = await axiosInstance.get('/opportunities/');
      setOppourtunity(response.data);
      console.log('Opportunity fetched successfully:', response.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(oppourtunity);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "opportunity");
    XLSX.writeFile(wb, "opportunity.xlsx");
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["ID", "Name", "Amount", "Status", "Close Date"]],
      body: opportunities.map((opportunity) => [
        opportunity.id,
        opportunity.name,
        opportunity.amount,
        opportunity.status,
        opportunity.close_date,
      ]),
    });
    doc.save("opportunities.pdf");
  };

  const handleRecords = (event) => {
    console.log("Records per page: ", event.target.value);
  };

  const handleOpportunityClick = (id) => {
    const tenantId = getTenantIdFromUrl();
    navigate(`/${tenantId}/ShowOpportunity/${id}`);
  };

  return (
    <div>
      <div className="oppo_nav">
    <TopNavbar/>
  </div>
    <div className="opportunities-container">
     
      <div className="opportunities-sidebar">
        <Sidebar />
      </div>
     
      <div>
      <div className="opportunities-content">
        <div className="opportunities-header">
          <h1 className="opportunities-heading">Opportunities</h1>
          <div className="opportunities-actions">
            <div className="opportunity_excel">
              <Dropdown>
                <Dropdown.Toggle variant="primary22" id="payments-dropdown9">
                  Excel File
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>
                    <Link to={`/bulk-import?model=opportunity`}>
                     <FaFileExcel/> Import Excel
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <button onClick={handleDownloadExcel}><FaFileExcel/>Download Excel</button>
                  </Dropdown.Item>
                  <Dropdown.Item>
                  <button onClick={handleDownloadPdf} className="pdf-download-btn">
                 <FaFilePdf/> Download PDF
                </button>
                </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="create1">
              <NavLink to={`/${tenantId}/opportunity`} id="btn3">
                Create Opportunity
              </NavLink>
            </div>
            <button onClick={toggleViewMode} className="view-mode-btn">
            {viewMode === "kanban" ? "Table View" : "Kanban View"}
          </button>
          </div>
        </div>

       
        
      </div>
      <div>
      {viewMode === "kanban" ? <Kanban2 /> : <OpportunitiesTable opportunities={oppourtunity} handleOpportunityClick={handleOpportunityClick} />}
      </div>
      </div>
    </div>
    </div>
  );
};

export default Opportunities;