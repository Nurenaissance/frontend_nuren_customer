import { Sidebar } from "../../components/Sidebar";
import { Header } from "../../components/Header";
import { Dropdown, Card, ListGroup } from "react-bootstrap";
import "./LeadPage.css";
import Kanban from "../../components/Kanban/Kanban";
import { NavLink, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import LeadTable from "../../components/Kanban/LeadTable/LeadTable";
import { useAuth } from "../../authContext";
import axiosInstance from "../../api";
import TopNavbar from "../TopNavbar/TopNavbar.jsx";
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1];
  }
  return null;
};

export const LeadPage = () => {
  const tenantId = getTenantIdFromUrl();
  const { userId } = useAuth();
  const modelName = "leads";
  const [isLoading, setIsLoading] = useState(true);
  const [leadData, setLeadData] = useState([]);
  const [viewMode, setViewMode] = useState("kanban");

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await axiosInstance.get('/leads/');
        setLeadData(response.data);
      } catch (error) {
        console.error("Error fetching lead data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadData();
  }, []);

  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(leadData);
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "leads.xlsx");
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(leadData);
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "leads.xlsx");
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "kanban" ? "table" : "kanban");
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Lead Name', 'Phone Number', 'Email', 'Status']],
      body: leadData.map(lead => [
        lead.name,
        lead.phone,
        lead.email,
        lead.status
      ]),
    });
    doc.save('leads.pdf');
  };

 

  return (
    <div>
      <div className="lead_nav">
        <TopNavbar />
      </div>
      <div className="head-section">
        <div className="pay_left_box">
          <Sidebar />
        </div>
        <div className="lead-head">
          <Header name="Leads" />
          <h1 className="leads-heading">Leads</h1>

          <div className="lead_add_btn">
          
            <div className="btn-container">
              <Dropdown>
                <Dropdown.Toggle variant="primary" id="payments-dropdown" className="excel-dropdown-menu_lead" style={{marginLeft:'1rem', marginRight:'1rem'}}>
                  Excel File
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>
                    <Link to={`/bulk-import?model=${modelName}`} className="import-excel-btn5">
                      <FaFileExcel /> Import Excel
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <button onClick={handleDownloadExcel} className="excel-download-btn3"><FaFileExcel />Excel</button>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <button onClick={handleDownloadPdf} className="pdf-download-btn"><FaFilePdf />PDF</button>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="navlinks">
              <NavLink to={`/${tenantId}/addlead`} style={{ backgroundColor: '#62CD14FF',color:'white', padding:'1rem', borderRadius:'4px', marginRight:'2rem' }}>+ New</NavLink>
              <button onClick={toggleViewMode} className="view-mode-btn">
                {viewMode === "kanban" ? "Table View" : "Kanban View"}
              </button>
            </div>
           
          </div>
          {viewMode === "kanban" ? (
  <div className="kanban-container">
    {isLoading ? (
      <div className="loading-container">
        <div className="loading-element"></div>
        <div className="loading-element"></div>
        <div className="loading-element"></div>
      </div>
    ) : (
      <Kanban />
    )}
  </div>
) : (
  <div className="table-container">
    {isLoading ? (
      <div className="loading-container">
        <div className="loading-element"></div>
        <div className="loading-element"></div>
        <div className="loading-element"></div>
      </div>
    ) : (
      <LeadTable />
    )}
  </div>
)}
        </div>
      </div>
    </div>
  );
};