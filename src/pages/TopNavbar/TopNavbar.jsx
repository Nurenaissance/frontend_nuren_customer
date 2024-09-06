import React, { useState, useEffect } from "react";
import './TopNavbar.css';
import axiosInstance from "../../api.jsx";
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import InsertCommentRoundedIcon from '@mui/icons-material/InsertCommentRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import SearchTable from './SearchTable';
import SearchIcon from '@mui/icons-material/Search'; 
import Chatbot from "../Chatbot/chatbot"; 
import AddIcon from '@mui/icons-material/Add';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import zIndex from "@mui/material/styles/zIndex.js";
import io from 'socket.io-client';
import NavbarPopup from './NavbarPopup.jsx';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { ref, uploadBytes, getDownloadURL,listAll } from "firebase/storage";
import { storage, firestore } from '../../pages/Userpage/profilefirebase.jsx';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EditNoteIcon from '@mui/icons-material/EditNote';
import axios from "axios";
import Loader from "../../components/Loader/Loader.jsx";



const socket = io('https://whatsappbotserver.azurewebsites.net/');


const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  return pathArray.length >= 2 ? pathArray[1] : null;
};

const TopNavbar = ({ openMeetingForm, openCallForm, totalCoins = 0 }) => {


  const tenantId = getTenantIdFromUrl();
  const [notificationCount, setNotificationCount] = useState(0);
  const userId  = 3;
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCallForm, setShowCallForm] = useState(false); // State to toggle call form
  const navigate = useNavigate();
  const [popupVisible, setPopupVisible] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [aiAnalysisData, setAiAnalysisData] = useState(null);
  const [coinCount, setCoinCount] = useState(0);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  // const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    from_time: '',
    to_time: '',
    related_to: '',
  });

 

  const documentTypes = [
    'Lead',
    'Account',
    'Contact',
    'Opportunity',
    'Task',
    'Interaction',
    'Campaign',
    'I don\'t know'
  ];

  const [callFormData, setCallFormData] = useState({
    call_to: '',
    call_type: '',
    start_time: '',
    to_time: '',
    related_to: '',
    outgoing_status: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCallFormChange = (e) => {
    setCallFormData({
      ...callFormData,
      [e.target.name]: e.target.value,
    });
  };


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDocumentTypeChange = (e) => {
    setSelectedDocumentType(e.target.value);
  };


  const handleUpload = async () => {
    if (!file || !selectedDocumentType) {
      alert('Please select a file and document type');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_name', selectedDocumentType);

    try {
      const response = await axiosInstance.post('https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload successful:', response.data);
      alert('Document uploaded successfully!');
      setFile(null);
      setSelectedDocumentType('');
      setShowDocumentUpload(false);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };




  //const userId = 3;


  const fetchCoinCount = async () => {
    try {
      const response = await axiosInstance.get(`wallet/balance?user_id=${userId}`);
      if (response.data && response.data.balance !== undefined) {
        setCoinCount(response.data.balance);
      } else {
        console.error('Error: Unexpected response structure', response.data);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };
  




  const fetchNotificationCount = async () => {
    try {
      const response = await axiosInstance.get(`/interaction`);
      const data = response.data;
      if (data && data.length > 0) {
        const lastEntry = data[data.length - 1];
        const lastId = lastEntry.id;
        setNotificationCount(parseInt(lastId, 10));
        setNotifications(data.slice(-5));
      } else {
        setNotificationCount(0);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  const handleAddClick = () => {
    setShowAddDropdown(!showAddDropdown);
    setShowDocumentUpload(false);
    setShowManualEntry(false);
  };

  const handleDocumentUploadClick = () => {
    setShowDocumentUpload(!showDocumentUpload);
    setShowManualEntry(false);
  };

  const handleManualEntryClick = () => {
    setShowManualEntry(!showManualEntry);
    setShowDocumentUpload(false);
  };

  const handleMeetingClick = () => {
    setShowMeetingForm(!showMeetingForm);
  };

  const handleCallClick = () => {
    setShowCallForm(!showCallForm);
  };

  const handleDirectCallClick = () => {
    navigate(`/${tenantId}/callpage`);
  };
  const handleCallFormSubmit = (e) => {
    e.preventDefault();
    // Logic to submit call form data
    openCallForm(callFormData); // Assuming this function is passed from parent component
    setShowCallForm(false); // Close the modal after form submission
  };
  const handleSearchChange=(event)=>{
    setSearchQuery(event.target.value);
  }

  useEffect(() => {


    const fetchProfileImage = async (id) => {
      try {
       
        const imagesRef = ref(storage, `profileImage/${tenantId}/${userId}/`);
        const result = await listAll(imagesRef);
    
        if (result.items.length > 0) {
          const sortedItems = result.items.sort((a, b) => {
            return b.name.localeCompare(a.name); 
          });
    
          
          const latestFileRef = sortedItems[0];
          const url = await getDownloadURL(latestFileRef);
    
          
          setProfileImageUrl(url);
        } else {
          console.log("No profile images found.");
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
       
        setProfileImageUrl(null);
      }
    };


    fetchProfileImage();
  }, [tenantId]);
  
  
  const handleSearchClick = async () => {
    console.log('Search button clicked');
    console.log('Search Query:', searchQuery);
  
    setIsLoading(true); // Start the loader
  
    try {
<<<<<<< HEAD
      const tenant = tenantId;
      const response = await fetch('https://webappbaackend.azurewebsites.net/execute-query/', {
=======
      const tenant = tenantId
      const response = await fetch('https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/execute-query/', {
>>>>>>> 5d3c8da9bf8efae318135bd98b2b9772d3437f67
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenant,
        },
        body: JSON.stringify({ prompt: searchQuery }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('Response from backend:', data);
      setTableData(data);
      setPopupVisible(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false); // Stop the loader regardless of success or failure
    }
  };
  
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };
  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  const handleCoinClick = () => {
    navigate(`/${tenantId}/coins`);
  };
 
  
   useEffect(() => {
    fetchNotificationCount();
    fetchCoinCount();
    socket.on('connect', () => {
      
    });
    socket.on('ai-analysis', (analysisData) => {
     
      setPopupVisible(true); 
    });

    return () => {
      socket.off('ai-analysis');
    };
  }, []);
  TopNavbar.propTypes = {
    openMeetingForm: PropTypes.func.isRequired,
    openCallForm: PropTypes.func.isRequired,
  };

  const triggerAIAnalysis = () => {
    // Simulating data received from server
    const mockData = "AI Analysis Data"; // Replace with actual data logic
    setAiAnalysisData(mockData);
};

return (
  <div className='topNavbar-head'>
    <div className="topNavbar1">
  <div className="search-container">
    <input
      type="text"
      className="search-bar"
      placeholder="Search..."
      onChange={handleSearchChange}
      onKeyPress={handleKeyPress}
    />
    <div className="search-icon-container" onClick={handleSearchClick}>
      <SearchIcon className="search-icon-header" />
    </div>
  </div>
</div>
    
    <div className="navbar-icon-group">
      <CallRoundedIcon className='navbar-icon' onClick={handleDirectCallClick} />
      <Link to={`/${tenantId}/chatbot`}>
        <InsertCommentRoundedIcon className='navbar-icon' />
      </Link>
      
      <div className='notification-icon-container' onClick={handleNotificationClick}>
        <NotificationsNoneRoundedIcon className='navbar-icon' />
        {notificationCount > 0 && (
          <div className='notification-count'>{notificationCount}</div>
        )}
        {showNotificationDropdown && (
          <div className='notification-dropdown'>
            {notifications.map((notification, index) => (
              <div key={index} className='notification-item'>
                {notification.notes}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className='add-icon-container'>
        <AddIcon className='navbar-icon' onClick={handleAddClick} />
        {showAddDropdown && (
          <div className='add-dropdown'>
            <div className='dropdown-option' onClick={handleDocumentUploadClick}>
              <UploadFileIcon />
              <span>Document Upload</span>
            </div>
            <div className='dropdown-option' onClick={handleManualEntryClick}>
              <EditNoteIcon />
              <span>Manual Entry</span>
            </div>
          </div>
        )}
         {showDocumentUpload && (
        <div className='document-upload-dropdown'>
          <h3>Upload Document</h3>
          <input type="file" onChange={handleFileChange} />
          <select 
            value={selectedDocumentType} 
            onChange={handleDocumentTypeChange}
            className="document-type-dropdown"
          >
            <option className="doc-typ-drop" value="">Select document type</option>
            {documentTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
          <button className="upload-btn" onClick={handleUpload}>Upload</button>
        </div>
      )}
        {showManualEntry && (
          <div className='manual-entry-dropdown'>
            <h3>Manual Entry</h3>
            <div className='entry-option' onClick={handleCallClick}>Call</div>
            <div className='entry-option' onClick={handleMeetingClick}>Meeting</div>
            <div className='entry-option'>
              <Link to={`../${tenantId}/addlead`}>Lead</Link>
            </div>
            <div className='entry-option'>
              <Link to={`../${tenantId}/addaccount`}>Account</Link>
            </div>
            <div className='entry-option'>
              <Link to={`../${tenantId}/addcontact`}>Contact</Link>
            </div>
            <div className='entry-option'>
              <Link to={`../${tenantId}/opportunity`}>Opportunity</Link>
            </div>
            <div className='entry-option'>
              <Link to={`../${tenantId}/addtask`}>Tasks</Link>
            </div>
            <div className='entry-option'>
              <Link to={`../${tenantId}/addinteraction`}>Interaction</Link>
            </div>
            <div className='entry-option'>
              <Link to={`../${tenantId}/campaignform`}>Campaign</Link>
            </div>
          </div>
        )}
      </div>
        
        <div className="coin-container" onClick={handleCoinClick}>
        <div className="coin-shine"></div>
        <MonetizationOnIcon className="coin-icon" />
        <span className="coin-count1">{coinCount}</span>
      </div>

<Link to={`/${tenantId}/user_id`}>
  {profileImageUrl ? (
    <img src={profileImageUrl} className="navbar-icon" alt="Profile" />
  ) : (
    <AccountCircleRoundedIcon className='navbar-icon' />
  )}
</Link>


      </div>

      {showMeetingForm && (
        <div className="modal-overlay">
          <div className="modal-content_meet">
            <div className="meeting-form-container">
              <form onSubmit={openMeetingForm}>
                <fieldset className="form-fieldset">
                  <legend className="form-legend">Create A Meeting</legend>
                  <label className="form-label-title" htmlFor="title">
                    Title:
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="form-input-title"
                    required
                    value={formData.title}
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
                    value={formData.location}
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
                    value={formData.from_time}
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
                    value={formData.to_time}
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
                    value={formData.related_to}
                    onChange={handleChange}
                  />
                </fieldset>
                <div className="form-button-container1">
                  <button
                    type="button"
                    className="form-button cancel-button"
                    onClick={() => setShowMeetingForm(false)}
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
  {showCallForm && (
        <div className="modal-overlay">
          <div className="modal-content_call">
            <form onSubmit={handleCallFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="call_to">Call To:</label>
                <input
                  type="text"
                  name="call_to"
                  id="call_to"
                  className="form-input"
                  value={callFormData.call_to}
                  onChange={(e) => setCallFormData({ ...callFormData, call_to: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="call_type">Call Type:</label>
                <input
                  type="text"
                  name="call_type"
                  id="call_type"
                  className="form-input"
                  value={callFormData.call_type}
                  onChange={(e) => setCallFormData({ ...callFormData, call_type: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="start_time">Start Time:</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  id="start_time"
                  className="form-input"
                  value={callFormData.start_time}
                  onChange={(e) => setCallFormData({ ...callFormData, start_time: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="to_time">End Time:</label>
                <input
                  type="datetime-local"
                  name="to_time"
                  id="to_time"
                  className="form-input"
                  value={callFormData.to_time}
                  onChange={(e) => setCallFormData({ ...callFormData, to_time: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="related_to">Related To:</label>
                <input
                  type="text"
                  name="related_to"
                  id="related_to"
                  className="form-input"
                  value={callFormData.related_to}
                  onChange={(e) => setCallFormData({ ...callFormData, related_to: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="outgoing_status">Status:</label>
                <input
                  type="text"
                  name="outgoing_status"
                  id="outgoing_status"
                  className="form-input"
                  value={callFormData.outgoing_status}
                  onChange={(e) => setCallFormData({ ...callFormData, outgoing_status: e.target.value })}
                />
              </div>
              <div className="form-button-container">
                <button type="button" className="form-button cancel-button" onClick={() => setShowCallForm(false)}>
                  Close
                </button>
                <button type="submit" className="form-button submit-button1">
                  Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
       {isLoading && (
      <div className="loader-overlay">
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      </div>
    )}
     
      {popupVisible && ( 
        <NavbarPopup data={tableData} onClose={handleClosePopup} />
      )}
     
    </div>
  );
};

export default TopNavbar;