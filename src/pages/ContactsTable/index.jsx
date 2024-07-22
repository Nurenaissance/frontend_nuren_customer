import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { Dropdown,Card, ListGroup } from "react-bootstrap";
import axiosInstance from "../../api";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path
import './contactsTable.css';
import * as XLSX from "xlsx"; // Importing xlsx library
import jsPDF from "jspdf"; // Importing jsPDF library
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";

const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null;
};
export const ContactsTable = () => {
  const [contacts, setContacts] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const tenantId=getTenantIdFromUrl();
  const [activeContacts, setActiveContacts] = useState([]);
  const navigate = useNavigate();

  const [inactiveContacts, setInactiveContacts] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]); // New state for recent contacts


  const [newContact, setNewContact] = useState({
    first_name: "",
    account: "",
    email: "",
    phone: "",
    createdBy: "",
   
  });
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAccountTerm, setSearchAccountTerm] = useState(""); // New state for account dropdown search
  const modelName = "contacts";
  const [activeButton, setActiveButton] = useState("All Contacts");
  const [draftContacts, setDraftContacts] = useState([]);

  const handleButtonClick = (status) => {
    console.log("Clicked:", status);

    setActiveButton(status);
  };

 

 

  const fetchContacts = async () => {
    try {
      const response = await axiosInstance.get('/contacts/');
      const data = response.data;
      setContacts(data);
      setFilteredContacts(data);
      const drafts = data.filter(contact => contact.status === "Draft");
      setDraftContacts(drafts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchActiveContacts = async () => {
    try {
      const response = await axiosInstance.get('/active_contacts/');
      const data = response.data.most_active_contacts;
  
      if (Array.isArray(data)) {
        
        
        const inactive = data.filter(contact => contact.isActive);
        const active = data.filter(contact => !contact.isActive);
        console.log("@@@@@",inactive);

      

        setActiveContacts(active);

        setInactiveContacts(inactive);
      } else {
        console.error("Data received from server is not an array:", data);

      }
    } catch (error) {
      console.error("Error fetching active contacts:", error);
    }
  };

  const handleRowClick = (contact) => {
    if (contact.status === 'Draft') {
      navigate(`/${tenantId}/addcontact`, { state: { contact } });
    } else {
      navigate(`/${tenantId}/contactinfo/${contact.id}`);
    }
  };
  
  
  


  useEffect(() => {
    fetchContacts();
    fetchActiveContacts();

  }, []);
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewContact((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      // Your form submission logic here
    } catch (error) {
      console.error("Error creating new contact:", error);
    }
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredContacts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contacts");
    XLSX.writeFile(wb, "contacts.xlsx");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [
        ["First Name", "Last Name", "Email", "Phone", "Address"],
      ],
      body: filteredContacts.map((contact) => [
        contact.first_name,
        contact.last_name,
        contact.email,
        contact.phone,
        contact.address,
      ]),
    });
    doc.save("contacts.pdf");
  };

  const handleAllCalls1 = (event) => {
    console.log("Filter by: ", event.target.value);
  };

  const handleAction = () => {
    console.log("Action required");
  };

  const handlePlusClick1 = () => {
    console.log("Plus clicked");
  };

  const handleRecords1 = (event) => {
    console.log("Records per page: ", event.target.value);
  };

  const handleFilterChange = (event) => {
    const filterBy = event.target.value;
    if (filterBy === "first_name") {
      setFilteredContacts(
        contacts.slice().sort((a, b) =>
          a.first_name.toLowerCase() > b.first_name.toLowerCase() ? 1 : -1
        )
      );
    } else if (filterBy === "createdBy") {
      setFilteredContacts(
        contacts.filter((contact) =>
          contact.createdBy.toLowerCase().includes(event.target.value.toLowerCase())
        )
      );
    } else {
      setFilteredContacts(contacts);
    }
  };


  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value === "") {
      setFilteredContacts(contacts);
    } else {
      setFilteredContacts(
        contacts.filter((contact) =>
          contact.first_name.toLowerCase().includes(event.target.value.toLowerCase())
        )
      );
    }
  };

  const handleAccountSearch = (event) => {
    setSearchAccountTerm(event.target.value);
    // Filter dropdown options based on the search term
    // Assuming your dropdown options are stored in `contacts`
    const filteredOptions = contacts.filter((contact) =>
      contact.account.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setFilteredContacts(filteredOptions);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  
  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const generateSmiley = (color) => (
    <div className="colored-circle" style={{ backgroundColor: color }}>
      <span className="material-symbols-outlined">sentiment_satisfied</span>
    </div>
  );
  const generateSmiley1 = (color) => (
    <div className="colored-circle1" style={{ backgroundColor: color }}>
      <i className="far fa-smile fa-lg"  style={{ fontSize: "38px" }}></i> 
    </div>
  );
 

  const fetchRecentData = async () => {
    try {
      const response = await axiosInstance.get('/recent_request/contacts/');
      setContacts(response.data);
      console.log("*##########",response);

    } catch (error) {
      console.error("Error fetching recent contacts:", error);
    }
  };
  const handleRecentButtonClick = () => {
    fetchRecentData();
  }; 


  
  const renderTableRows = () => {
    switch (activeButton) {
      case "All Contacts":
        return contacts.map((contact, index) => (
          <tr className="contacttablerow" key={contact.id}>
            <td>
              {generateSmiley(generateRandomColor())}
              <div className="cont-first_name">
                <Link to={`/${tenantId}/contactinfo/${contact.id}`}>
                  {contact.first_name}
                </Link>
              </div>
            </td>
            <td className="contlast_name">{contact.last_name}</td>
            <td className="cont_email">
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </td>
            <td className="cont_phone">{contact.phone}</td>
            <td className="cont_phone">{contact.address}</td>
          </tr>
        ));
      case "Active":
        return activeContacts.map((contact, index) => (
          <tr className="contacttablerow" key={contact.id}>
            <td>
              {generateSmiley(generateRandomColor())}
              <div className="cont-first_name">
                <Link to={`/${tenantId}/contactinfo/${contact.id}`}>
                  {contact.first_name}
                </Link>
              </div>
            </td>
            <td className="contlast_name">{contact.last_name}</td>
            <td className="cont_email">
              <a href={`mailto:{contact.email}`}>{contact.email}</a>
            </td>
            <td className="cont_phone">{contact.phone}</td>
            <td className="cont_phone">{contact.address}</td>
          </tr>
        ));
      case "Inactive":
        return inactiveContacts.map((contact, index) => (
          <tr className="contacttablerow" key={contact.id}>
            <td>
              {generateSmiley(generateRandomColor())}
              <div className="cont-first_name">
                <Link to={`/${tenantId}/contactinfo/${contact.id}`}>
                  {contact.first_name}
                </Link>
              </div>
            </td>
            <td className="contlast_name">{contact.last_name}</td>
            <td className="cont_email">
              <a href={`mailto:{contact.email}`}>{contact.email}</a>
            </td>
            <td className="cont_phone">{contact.phone}</td>
            <td className="cont_phone">{contact.address}</td>
          </tr>
        ));
        case "Draft":
          return draftContacts.map((contact, index) => (
            <tr className="contacttablerow" key={contact.id}>
              <td>
                {generateSmiley(generateRandomColor())}
                <div className="cont-first_name">
                  <Link to={`/${tenantId}/contactinfo/${contact.id}`}>
                    {contact.first_name}
                  </Link>
                </div>
              </td>
              <td className="contlast_name">{contact.last_name}</td>
              <td className="cont_email">
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </td>
              <td className="cont_phone">{contact.phone}</td>
              <td className="cont_phone">{contact.address}</td>
            </tr>
          ));
      case "Recent":
        return recentContacts.map((contact, index) => (
          <tr className="contacttablerow" key={contact.id}>
            <td>
              {generateSmiley(generateRandomColor())}
              <div className="cont-first_name">
                <Link to={`/${tenantId}/contactinfo/${contact.id}`}>
                  {contact.first_name}
                </Link>
              </div>
            </td>
            <td className="contlast_name">{contact.last_name}</td>
            <td className="cont_email">
              <a href={`mailto:{contact.email}`}>{contact.email}</a>
            </td>
            <td className="cont_phone">{contact.createdOn}</td>
            <td className="cont_phone">{contact.address}</td>
          </tr>
        ));
      default:
        return null;
    }
  };



  
  return (
 <div>
     <div className="contact_nav">
    <TopNavbar/>
  </div>
  <div className="Contacts_main_page">
    <div className="home_left_box1">
      <Sidebar />
    </div>

   

    <div className="contain1" style={{width:"100%"}}>
              <div className="contactlist">
                <h1 >Contact list</h1>
                </div>
              <div className="meet1">
            
  
            <div>
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="payments-dropdown1" className="excel-dropdown-menu1">
               Excel File
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>
                  <Link
                    to={`/${tenantId}/bulk-import/?model=${modelName}`}
                    className="import-excel-btn5"
                  >
                  <FaFileExcel />  Import Excel
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <button
                    onClick={handleDownloadExcel}
                    className="excel-download-btn1"
                  >
                  <FaFileExcel />  Excel
                  </button>
                </Dropdown.Item>
                <Dropdown.Item onClick={handleDownloadPDF}>
                <FaFilePdf />  PDF
                      </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            </div>
          <div className="handle4">
          <NavLink to={`/${tenantId}/addcontact`} id="btn10">
                +CreateContact
              </NavLink>
            {/* <select onChange={handlePlusClick1} className="view-mode-select">
              <option value="">!!!</option>
              <option value="1">Log in</option>
              <option value="2">Log out</option>
            </select> */}
          
             
            

            {/* <select className="view-mode-select1" onChange={handleAction}>
              <option value="">Action</option>
              <option value="1">Log in</option>
              <option value="2">Log out</option>
            </select> */}
          </div>
        </div>

        <div className="contact-boxes">
        <div className="contact-bigboxes">
              <h1 className="newcontact">New contacts this Week</h1>
              <Link to={`/${tenantId}/contactinfo/${contacts[0]?.id}`} className="firstcontact-box">
               <h1 className="heading1">{contacts.length > 0 && contacts[0].first_name}</h1>
                <p className="paragraph1">{contacts.length > 0 && contacts[0].description}</p>
                {/* Smiley */}
                <div className="smiley1">
                  {generateSmiley1(generateRandomColor())}
                </div>
              </Link>
              <Link to={`/${tenantId}/contactinfo/${contacts[1]?.id}`} className="secondcontact-box">
                <h1 className="heading2">{contacts.length > 1 && contacts[1].first_name}</h1>
                <p className="paragraph2">{contacts.length > 1 && contacts[1].description}</p>
                {/* Smiley */}
                <div className="smiley2">
                  {generateSmiley1(generateRandomColor())}
                </div>
              </Link>
              <Link to={`/${tenantId}/contactinfo/${contacts[2]?.id}`} className="thirdcontact-box">
                <h1 className="heading3">{contacts.length > 2 && contacts[2].first_name}</h1>
                <p className="paragraph3">{contacts.length > 2 && contacts[2].description}</p>
                {/* Smiley */}
                <div className="smiley3">
                  {generateSmiley1(generateRandomColor())}
                </div>
              </Link>
          </div>

        </div>
  <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
    <div className="activeInactivebtn">
              <div className="activeInactivebtn1">
                <button
                  className={`${activeButton === "All Contacts" ? "activeinactive " : ""}`}
                  onClick={() => handleButtonClick("All Contacts")}
                >
                  All Contacts
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
        <div className="activeInactivebtn5">
        <button
                        className={`button ${
                          activeButton === "Draft" ? "active" : ""
                        }`}
                        onClick={() => setActiveButton("Draft")}
                      >
                        Draft
                      </button>
        </div>
            
                
      </div>

   
      <div style={{marginRight:'110px'}}>
                   <select
                      value={viewMode}
                      onChange={(e) => handleViewModeChange(e.target.value)}
                      className="view-mode-select7"
                    >
                      <option value="">View!</option>
                      <option value="table">Table View</option>
                      <option value="tile">Tile View</option>
                      <option value="list">List View</option>
                    </select>
      </div>
    </div>

      
          <div className="records10">
                           
                    
                    <select className="view-mode-select3" onChange={handleRecords1}>
                      <option value="">10 Records per page</option>
                      <option value="1">Option 1</option>
                      <option value="2">Option 2</option>
                    </select>
            
                
              

  

          </div>
        <div className="bugs10">

        {viewMode === "table" && (
  <div>
    <div className="table4">
      <table className="contacttable">
        <thead>
          <tr>
            <th className="user1">USER</th>
            <th className="username1">USER NAME</th>
            <th className="useremail1">EMAIL</th>
            <th className="useraccount1">ROLE</th>
            <th className="usercontact1">Contact Name</th>
          </tr>
        </thead>
        <tbody>
          {activeButton === "All Accounts"
            ? contacts.map((contact, index) => (
                <tr className="contacttablerow" key={contact.id}>
                  <td onClick={() => handleRowClick(contact)}>
                    {generateSmiley(generateRandomColor())}
                    <div className="cont-first_name">
                        {contact.first_name}
                     
                    </div>
                  </td>
                  <td className="contlast_name">{contact.last_name}</td>
                  <td className="cont_email">
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </td>
                  <td className="cont_phone">{contact.phone}</td>
                  <td className="cont_phone">{contact.address}</td>
                </tr>
              ))
            : activeButton === "Active"
            ? activeContacts.map((contact, index) => (
                <tr className="contacttablerow" key={contact.id}>
                  <td>
                    {generateSmiley(generateRandomColor())}
                    <div className="cont-first_name" onClick={handleRowClick}>
                      
                        {contact.first_name}
                      
                    </div>
                  </td>
                  <td className="contlast_name">{contact.last_name}</td>
                  <td className="cont_email">
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </td>
                  <td className="cont_phone">{contact.phone}</td>
                  <td className="cont_phone">{contact.address}</td>
                </tr>
              ))
//   : inactiveContacts.map((contact, index) => (
//       <tr className="contacttablerow" key={contact.id}>
//     <td>
//     {generateSmiley(generateRandomColor())}
//     <div className="cont-first_name">
//       <Link to={`/${tenantId}/contactinfo/${contact.id}`}>
//         {contact.first_name}
//       </Link>
//     </div>
//   </td>
//   <td className="contlast_name">{contact.last_name}</td>
//   <td className="cont_email">
//     <a href={`mailto:${contact.email}`}>{contact.email}</a>
//   </td>
//   <td className="cont_phone">{contact.phone}</td>
//   <td className="cont_phone">{contact.address}</td>
// </tr>
//        ))


            : contacts.map((contact, index) => (
                <tr className="contacttablerow" key={contact.id}>
                  <td>
                    {generateSmiley(generateRandomColor())}
                    <div className="cont-first_name">
                      <Link to={`/${tenantId}/contactinfo/${contact.id}`}>
                        {contact.first_name}
                      </Link>
                    </div>
                  </td>
                  <td className="contlast_name">{contact.last_name}</td>
                  <td className="cont_email">
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </td>
                  <td className="cont_phone">{contact.id}</td>
                  <td className="cont_phone">{contact.created_on}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  </div>
)}

          


     
          {viewMode === "tile" && (
          <div className="contact-tile-view">
            {/* Implement your Kanban view here */}
            <div className="contacts-tiles-container">
              <div className="contact-index">
              {contacts.map((contact, index) => (
                <div className={`contact-tile tile-${index + 1}`} key={contact.id}>
                  <Link to={`/${tenantId}/contactinfo/${contact.id}`} className="contact-link">
                  
                    <div className="tile-header1"><p> {contact.first_name+" "+contact.last_name}</p></div>
                  </Link>
                  <div className="smiley4">
                  {generateSmiley1(generateRandomColor())}

                  </div>
                  <div className="tile-content">
                    <p className="contactphone">
                   
                    {contact.phone}
                    </p>
                   
                  </div>
                  <div className="contfirst-name">
                    <p> {contact.first_name} </p>
                    </div>
                  <div className="tile-footer">
                  <p className="contactaddress">
                      
                      {contact.address}
                      </p>
                    <p className="contactemail">
                    {contact.email}
                      
                    </p>
                  </div>

                </div>
              ))}

              </div>
             
            </div>
          </div>
        )}
          {/* List View */}
          {viewMode==='list' &&(
            <div>
            <h2>List View</h2>
            <div className="accounts-list-container" style={{width:"180%"}}>
              <ListGroup >
                {contacts.map((contact, index) => (
                  <ListGroup.Item key={contact.id} className="accounts-list-item" >
                    <Link to={`/${tenantId}/contactinfo/${contact.id}`}>{contact.first_name+" "+contact.last_name}</Link>
                    <p>Phone Number: {contact.phone}</p>
                    <p>Description: {contact.description}</p>
                    <p>Address: {contact.address}</p>
                    <p>Email: {contact.email}</p>
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
    }