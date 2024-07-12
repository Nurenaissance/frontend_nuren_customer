import axios from "axios";
import React, { useEffect, useState } from "react";
import { Dropdown, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import call from "../../assets/call.jpg";
import mail from "../../assets/mail.webp";
import person from "../../assets/person.png";
import industry from "../../assets/industry.png";
import msg from "../../assets/msg.webp";
import "./accountsTableContent.css";
import axiosInstance from '../../api';
import { useAuth } from "../../authContext";
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};
const AccountsTable1 = () => {

  const [accounts, setAccounts] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [activeButton, setActiveButton] = useState("All Accounts");
  const [activeAccounts, setActiveAccounts] = useState([]);

  const [inactiveAccounts, setInactiveAccounts] = useState([]);
 

  const handleButtonClick = (status) => {
    console.log("Clicked:", status);
    setActiveButton(status);
  };

  console.log("Active Button:", activeButton);

  const tenantId = getTenantIdFromUrl();
  const modelName = "accounts";

  const fetchAccounts = async () => {
    try {
      const response = await axiosInstance.get('accounts/'); 
  
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };




  const fetchActiveAccounts = async () => {
    try {
      const response = await axiosInstance.get('/active_accounts/');
      const data = response.data.most_active_accounts;

      if (Array.isArray(data)) {
        const active = data.filter(account => !account.isActive); 
        console.log("%%%%%%%", active);
        const inactive = [...active].reverse(); // Inverted the filter condition
        console.log("22222", inactive);

        setActiveAccounts(active);
        setInactiveAccounts(inactive);
      } else {
        console.error("Data received from server is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching active contacts:", error);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchActiveAccounts();
  }, []);
  


  useEffect(() => {
  
    fetchAccounts();
    fetchActiveAccounts();
  }, []);
  
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log(excelData); // Process your Excel data here
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(accounts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "accounts");
    XLSX.writeFile(wb, "accounts.xlsx");
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Account Name', 'Phone Number', 'Industry', 'Account Owner', 'Email']],
      body: accounts.map(account => [
        account.company,
        account.phone,
        account.industry,
        account.Name,
        account.email
      ]),
    });
    doc.save('accounts.pdf');
  };

  const getCircleColor = (letter) => {
    if (letter && letter.length > 0) {
      const colors = ['#ff6347', '#32cd32', '#1e90ff', '#ff69b4', '#ffd700']; // Define your color palette
      const index = letter.charCodeAt(0) % colors.length;
      return colors[index];
    } else {
      // If letter is undefined or an empty string, return a default color
      return '#000000'; // You can choose any default color here
    }
  };

 
   
  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const fetchRecentData = async () => {
    try {
      const response = await axiosInstance.get(`/recent_request/accounts/`);
      setAccounts(response.data);
      
      console.log("*##########",response);
    } catch (error) {
      console.error('Error fetching recent data:', error);
    }
  };

  const handleRecentButtonClick = () => {
    fetchRecentData();
  }; 
  const generateSmiley2 = (color) => (
    <div className="colored-circle1" style={{ backgroundColor: color }}>
      <i className="far fa-smile fa-lg"  style={{ fontSize: "38px" }}></i> 
    </div>
  );

const renderTableRows = () => {
  switch (activeButton) {
    case "All Accounts":
      return accounts.map((account, index) => (
        <tr className="tablerows" key={account.id}>
        <td>
          <Link to={`/${tenantId}/accounts/${account.id}`}>
          <span className="account-circle" style={{ backgroundColor: getCircleColor(account.company.charAt(0)) }}>

              {account.company.charAt(0).toUpperCase()}
            </span>
          </Link>
        </td>
        <td>
          <Link to={`/${tenantId}/accounts/${account.id}`}>
            {account.company}
          </Link>
        </td>
        <td>{account.phone}</td>
        <td className="accountIndus">{account.industry}</td>
        <td className="accountnames">{account.Name}</td>
        <td className="accountems">{account.email}</td>
      </tr>
      ));
    case "Active":
      return activeAccounts.map((account, index) => (
        <tr className="tablerows" key={account.id}>
        {/* Circle in table data cell */}
        <td>
          <Link to={`/${tenantId}/accounts/${account.id}`}>
            <span className="account-circle" style={{ backgroundColor: getCircleColor(account.company.charAt(0)) }}>
              {account.company.charAt(0).toUpperCase()}
            </span>
          </Link>
        </td>
        <td>
          <Link to={`/${tenantId}/accounts/${account.id}`}>
            {account.company}
          </Link>
        </td>
        <td>{account.phone}</td>
        <td className="accountIndus">{account.industry}</td>
        <td className="accountnames">{account.Name}</td>
        <td className="accountems">{account.email}</td>
      </tr>
      ));
    case "Inactive":
      return inactiveAccounts.map((account, index) => (
        <tr className="tablerows" key={account.id}>
        {/* Circle in table data cell */}
        <td>
          <Link to={`/${tenantId}/accounts/${account.id}`}>
            <span className="account-circle" style={{ backgroundColor: getCircleColor(account.company.charAt(0)) }}>
              {account.company.charAt(0).toUpperCase()}
            </span>
          </Link>
        </td>
        <td>
          <Link to={`/${tenantId}/accounts/${account.id}`}>
            {account.company}
          </Link>
        </td>
        <td>{account.phone}</td>
        <td className="accountIndus">{account.industry}</td>
        <td className="accountnames">{account.Name}</td>
        <td className="accountems">{account.email}</td>
      </tr>
      ));
    case "Recent":
      return accounts.map((account, index) => (
      
        <tr className="tablerows" key={account.id}>
          <td>
            <Link to={`/${tenantId}/accounts/${account.id}`}>
              
            </Link>
          </td>
          <td>
            <Link to={`/${tenantId}/accounts/${account.id}`}>
              {account.company}
            </Link>
          </td>
          <td>{account.id}</td>
          <td className="accountIndus">{account.created_on}</td>
          <td className="accountnames">{account.Name}</td>
          <td className="accountems">{account.email}</td>
        </tr>
      ));
    
    default:
      return null;
  }
};


  return (
  <div className="account_right_page_data">
    <div className="account_page_top_header">
              <div className="contactlist">
              <h1 style={{paddingBottom:'100px'}}>Account list</h1>
              </div>
              <div style={{display:'flex',flexDirection:'row',marginTop:'90px'}}>
              <div  style={{marginRight:'10px'}}>
                          <Dropdown>
                            <Dropdown.Toggle variant="primary" id="payments-dropdown" className="excel-dropdown-menu">
                              Excel File
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item>
                                <Link
                                  to={`/bulk-import?model=${modelName}`}
                                  className="import-excel-btn4"
                                >
                                 <FaFileExcel/> Import Excel
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
                              <Dropdown.Item onClick={handleDownloadPdf}>
                       <FaFilePdf/> PDF
                      </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                    </div>
                    <div className="create1">
                      <NavLink to={`/${tenantId}/addaccount`} id="btn3">+CreateAccount</NavLink>
                    </div>
              </div>

    </div>
    <div className="account-boxes">
        <div className="account-bigboxes">
                <h1 className="newcontact">New Accounts this Week</h1>
                <Link to={`/${tenantId}/accounts/${accounts[0]?.id}`} className="firstaccount-box">
                    <h1 className="heading1">{accounts.length > 0 && accounts[0].Name}</h1>
                    <p className="paragraph1">{accounts.length > 0 && accounts[0].description}</p>
                    {/* Smiley */}
                    <div className="smiley1">
                      {generateSmiley2(generateRandomColor())}
                    </div>
                 </Link>
              <Link to={`/${tenantId}/accounts/${accounts[1]?.id}`} className="secondaccount-box">
                    <h1 className="heading2">{accounts.length > 1 && accounts[1].Name}</h1>
                    <p className="paragraph2">{accounts.length > 1 && accounts[1].description}</p>
                    {/* Smiley */}
                    <div className="smiley2">
                      {generateSmiley2(generateRandomColor())}
                    </div>
              </Link>{/** */}
              <Link to={`/${tenantId}/accounts/${accounts[2]?.id}`} className="thirdaccount-box">
                    <h1 className="heading3">{accounts.length > 2 && accounts[2].Name}</h1>
                    <p className="paragraph3">{accounts.length > 2 && accounts[2].description}</p>
                    {/* Smiley */}
                    <div className="smiley3">
                      {generateSmiley2(generateRandomColor())}
                    </div>
              </Link>
             
        </div>
      </div>


    <div style={{display:'flex',flexDirection:'row',justifyContent: 'space-between'}}>
      
      <div className="activeInactivebtn">
              <div className="activeInactivebtn1">
                <button
                  className={`${activeButton === "All Accounts" ? "activeinactive " : ""}`}
                  onClick={() => handleButtonClick("All Accounts")}
                >
                  All Accounts
                </button>
              </div>
              <div className="activeInactivebtn2">
                <button
                  className={`${activeButton === "Active" ? "activeinactive " : ""}`}
                  onClick={() => handleButtonClick("Active")}
                >
                  Active
                </button>
              </div>
              <div className="activeInactivebtn3">
                <button
                  className={`${activeButton === "Inactive" ? "activeinactive " : ""}`}
                  onClick={() => handleButtonClick("Inactive")}
                >
                  Inactive
                </button>
              </div>

              <div className="activeInactivebtn4">
          <button
            className={`${activeButton === "Recent" ? "activeinactive " : ""}`}
            onClick={() => {
              handleButtonClick("Recent");
              handleRecentButtonClick();
            }}
          >
            Recent
          </button>
        </div>
            
      </div>
      <select
        value={viewMode}
        onChange={(e) => handleViewModeChange(e.target.value)}
        className="view-mode-select1"
      >
        <option value="">View!</option>
        <option value="table">Table View</option>
        <option value="tile">Tile View</option>
        <option value="list">List View</option>
      </select>
    </div>
  
    <div className="accounts-container">
        <div className="accounts-header" style={{ width: "100%" }}>
          <h2 className="accountTableCenter">Accounts </h2>
        
        </div>
        {viewMode === "table" && (
  <div className="accounts-table-wrapper">
    <table>
      <thead className="thead1">
        <tr>
          <th></th> {/* Empty th for alignment */}
          <th>Account Name</th>
          <th>Phone Number</th>
          <th>Industry</th>
          <th>Account Owner</th>
          <th>Email</th>
        </tr>
      </thead>
   <tbody>
   {renderTableRows()}

   </tbody>
    </table>
  </div>
)}


        {viewMode === "tile" && (
          <div className='accounts-tiles-wrapper'>
            {/* Implement your Kanban view here */}
            <div className="accounts-tiles-container">
              {accounts.map((account, index) => (
                <div className={`account-tile tile-${index + 1}`} key={account.id}>
                  <Link to={`/${tenantId}/accounts/${account.id}`} className="account-link">
                    <div className="tile-icon" style={{ backgroundColor: getCircleColor(account.company.charAt(0)) }}>
                      {account.company.charAt(0)} {/* First letter of company name */}
                    </div>
                    <div className="tile-header">{account.company}<img src={msg} width={30} height={30} className="msg-icon" /></div>
                  </Link>
                  <div className="tile-content">
                    <p className="accountphone">
                      {" "}
                      <span style={{ display: "flex" }}>
                        <img src={call} width={30} height={30} />
                      </span>{" "}
                      {account.phone}
                    </p>
                    <p className="accountIndustry">
                      <span style={{ display: "flex" }}>
                        <img src={industry} width={30} height={30} />
                      </span>{" "}
                      {account.industry}
                    </p>
                  </div>
                  <div className="tile-footer">
                    <p className="accountName">
                      <span style={{ display: "flex" }}>
                        <img src={person} width={25} height={25} />
                      </span>{" "}
                      {account.Name}
                    </p>
                    <p className="accountemail">
                      <span style={{ display: "flex" }}>
                        <img src={mail} width={30} height={30} />
                      </span>{" "}
                      {account.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {viewMode === "list" && (
          <div>
            <h2>List View</h2>
            <div className="accounts-list-container">
              <ListGroup>
                {accounts.map((account, index) => (
                  <ListGroup.Item key={account.id} className="accounts-list-item">
                    <Link to={`/${tenantId}/accounts/${account.id}`}>{account.Name}</Link>
                    <p>Phone Number: {account.phone}</p>
                    <p>Industry: {account.industry}</p>
                    <p>Company Name: {account.company}</p>
                    <p>Email: {account.email}</p>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsTable1;
