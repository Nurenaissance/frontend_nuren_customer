import React, { useState, useEffect } from 'react';
import { Sidebar } from "../../components/Sidebar";
import axios from 'axios';

import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import axiosInstance from "../../api";
import { useAuth } from "../../authContext";
import { useNavigate } from "react-router-dom";
import './campaignform.css'

const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};

const Popup = ({ errors, onClose }) => (
  <div className="product-popup">
    <div className="product-popup-content">
      <h2>Error</h2>
      <button className="product-popup-close" onClick={onClose}>Ok</button>
      <ul>
        {Object.entries(errors).map(([field, errorList]) => (
          <li key={field}>
            {field.replace(/_/g, ' ')}: {errorList[0]} {/* Assuming single error message per field */}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
const SuccessPopup = ({ message, onClose }) => (
  <div className="product-popup2">
    <div className="product-popup-content2">
      <h2>Product Created Sucessfully</h2>
      <button className="product-popup-ok-button2" onClick={onClose}>OK</button>
    </div>
  </div>
);

const Campaignform = () => {
  const navigate = useNavigate();
  const tenantId = getTenantIdFromUrl();
  const {userId}=useAuth();
  const [campaignData, setCampaignData] = useState({
    campaign_name: "",
    start_date: "",
    end_date: "",
    expected_revenue: "",
    actual_cost: "",
    numbers_sent: "",
    type: "",
    status: "",
    budgeted_cost: "",
    expected_response: "",
    description: "",
    campaign_owner: "",
    message: "",
    expected_count: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorFields, setErrorFields] = useState({});
  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState('');
  const [newFlowName, setNewFlowName] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
 

  const handleChange = (event) => {
    const { name, value } = event.target;

    const updatedErrorFields = { ...errorFields };
    delete updatedErrorFields[name];
    setErrorFields(updatedErrorFields);
    setCampaignData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };
  useEffect(() => {
    // Set initial error fields based on formErrors
    const initialErrorFields = {};
    Object.keys(formErrors).forEach(field => {
      initialErrorFields[field] = true;
    });
    setErrorFields(initialErrorFields);
  }, [formErrors]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosInstance.post('/campaign/', campaignData);
      const campaignId = response.data.id;
      setSuccessMessage(response.data.message);
      setShowSuccessPopup(true);

          const interactionData = {
            entity_type: "campaign",
            entity_id: campaignId,
            interaction_type: "Event",
            tenant_id: tenantId, // Make sure you have tenant_id in movedCard
            notes: `Campaign created with id : ${campaignId} created by user : ${userId}`,
            interaction_datetime: new Date().toISOString(),
          };

          try {
              await axiosInstance.post('/interaction/', interactionData);
              console.log('Interaction logged successfully');
            } catch (error) {
              console.error('Error logging interaction:', error);
            }
      console.log('Form submitted successfully:', response.data);
      setCampaignData({
        
        campaign_name: "",
        start_date: "",
        end_date: "",
        expected_revenue: "",
        actual_cost: "",
        numbers_sent:"" ,
        type: "",
        status: "",
        budgeted_cost: "",
        expected_response: "",
        description: "",
        campaign_owner: ""
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response) {
        // API error (e.g., 400 Bad Request, 500 Internal Server Error)
        setFormErrors(error.response.data || error.message);
      } else {
        // Network or other generic error
        setFormErrors({ networkError: 'Network Error. Please try again later.' });
      }
      setShowPopup(true);
    }
  };



  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      const response = await axiosInstance.get('/flows/');
      setFlows(response.data);
    } catch (error) {
      console.error('Error fetching flows:', error);
      // Set flows to an empty array or some default value
      setFlows([]);
    }
  };
  const handleFlowChange = (event) => {
    setSelectedFlow(event.target.value);
    if (event.target.value !== 'create_new') {
      const selectedFlowData = flows.find(flow => flow.id === event.target.value);
      setCampaignData(prevState => ({
        ...prevState,
        flow: selectedFlowData,
      }));
    }
  };

  const handleCreateNewFlow = async () => {
    if (!newFlowName.trim()) {
      alert('Please enter a name for the new flow');
      return;
    }

    try {
      const response = await axiosInstance.post('/flows/', { name: newFlowName });
      const newFlow = response.data;
      setFlows(prevFlows => [...prevFlows, newFlow]);
      setSelectedFlow(newFlow.id);
      setCampaignData(prevState => ({
        ...prevState,
        flow: newFlow,
      }));
      setNewFlowName('');
    } catch (error) {
      console.error('Error creating new flow:', error);
      alert('Failed to create new flow. Please try again.');
    }
  };
  

  const closePopup = () => {
    setShowPopup(false);
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    navigate(`/${tenantId}/campaign`);

  };

  const handleSocialButtonClick = (type) => {
    setCampaignData(prevState => ({
      ...prevState,
      type: type,
    }));
    if (type === 'Instagram') {
      window.location.href = "/instagramflow";
    }
    else if (type === 'WhatsApp'){
      window.location.href = "/whatsappflow"
    }
  };

  const handleCancel = () => {
    
    const isConfirmed = window.confirm("Are you sure you want to cancel? Any unsaved data will be lost.");
    
  
    if (isConfirmed) {
      localStorage.removeItem('campaignDraft'); 
      console.log("Cancel button clicked");
     
      window.location.href = `../${tenantId}/campaign`;
    }
  };


 
  
  const handleSaveAsDraft = async () => {
    setIsSavingDraft(true);
    try {
      const dataToSend = {
        ...campaignData,
        createdBy: userId,
        tenant: tenantId,
        status: 'Draft',
      };

      console.log('Data to send:', dataToSend);

      // Save draft locally (optional)
      localStorage.setItem('campaignDraft', JSON.stringify(dataToSend));

      // Save draft on backend
      await axiosInstance.post('/campaign/', dataToSend);

      console.log('Draft saved successfully');

      // Navigate to campaign list or wherever appropriate
      navigate(`/${tenantId}/campaign`);
    } catch (error) {
      console.error('Error saving draft:', error);
      if (error.response) {
        setFormErrors(error.response.data || error.message);
      } else {
        setFormErrors({ networkError: 'Network Error. Please try again later.' });
      }
    } finally {
      setIsSavingDraft(false);
    }
  };

  useEffect(() => {
    const draftData = localStorage.getItem('campaignDraft');
    if (draftData) {
      setCampaignData(JSON.parse(draftData));
    }
  }, []);
  const handleSubmitForm = (event) => {
    event.preventDefault(); 
    localStorage.removeItem('campaignDraft'); 
    handleSubmit(event);
  };
  return (
    <div className="cf-container">
    <div className='cf-header'>
      <div className="cf-sidebar">
        <Sidebar />
      </div>
      <h1 className="cf-title">Create Campaigns</h1>
    </div>
    <div className='cf-button-group'>
      <button type="button" onClick={handleCancel} className="cf-btn cf-btn-cancel">Cancel</button>
      <button type="button" onClick={handleSaveAsDraft} className="cf-btn cf-btn-draft">Save as Draft</button>
      <button type="submit" onClick={handleSubmitForm} className="cf-btn cf-btn-submit">Submit</button>
    </div>
    <form onSubmit={handleSubmit} className="cf-form">
      <div className="cf-form-group">
        <label htmlFor="campaign_name" className="cf-label">Campaign Name:</label>
        <input
          type="text"
          id="campaign_name"
          name="campaign_name"
          value={campaignData.campaign_name}
          onChange={handleChange}
          placeholder="Enter Campaign Name"
          className="cf-input"
          style={{ borderColor: errorFields.campaign_name ? 'red' : '' }}
        />
      </div>
      <div className="form-group col-md-6">
          <label htmlFor="text" className='campaign_owner'>Campaign Owner :</label>
          <input
            type="text"
            className="form-campaign_owner"
            id="owner"
            name="campaign_owner"
            value={campaignData.campaign_owner}
            onChange={handleChange}
            placeholder="Enter campaign Owner"
            style={{ borderColor: errorFields.campaign_owner ? 'red' : '' }}
          />
        </div>
        <div className="form-group col-md-6">
                  <label htmlFor="date" className='campaign_start_date'>Starting Date :</label>
                  <input
                    type="date"
                    className="form-campaign_start_date"
                    id="date"
                    name="start_date" // Corrected name
                    value={campaignData.start_date}
                    onChange={handleChange}
                    placeholder="Enter start date"
                    style={{ borderColor: errorFields.start_date ? 'red' : '' }}
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="Date" className='campaign_end_date'>End Date :</label>
                  <input
                    type="date"
                    className="form-campaign_end_date"
                    id="Date"
                    name="end_date" // Corrected name
                    value={campaignData.end_date}
                    onChange={handleChange}
                    placeholder="Enter end date"
                    style={{ borderColor: errorFields.end_date ? 'red' : '' }}
                  />
                </div>

        <div className="form-group col-md-6">
                  <label htmlFor="expected_revenue" className='campaign_expected_revenue'>Expected Revenue :</label>
                  <input
                  type="text"
                    className="form-campaign_expected_revenue"
                    id="expected_revenue"
                    name="expected_revenue"
                    value={campaignData.expected_revenue}
                    onChange={handleChange}
                    placeholder="Enter expected revenue"
                    style={{ borderColor: errorFields.expected_revenue ? 'red' : '' }}
                  />
                </div>
                <div className="cf-form-group">
        <label htmlFor="flow" className="cf-label">Select Flow:</label>
        <select
          id="flow"
          className="cf-flow-select"
          value={selectedFlow}
          onChange={handleFlowChange}
        >
          <option value="">Select a flow</option>
          {flows.map(flow => (
            <option key={flow.id} value={flow.id}>{flow.name}</option>
          ))}
          <option value="create_new">Create New Flow</option>
        </select>
      </div>

      {selectedFlow === 'create_new' && (
        <div className="cf-form-group">
          <input
            type="text"
            placeholder="Enter new flow name"
            value={newFlowName}
            onChange={(e) => setNewFlowName(e.target.value)}
            className="cf-input"
          />
          <button type="button" onClick={handleCreateNewFlow} className="cf-btn cf-btn-draft">
            Create New Flow
          </button>
        </div>
      )}

      {selectedFlow && selectedFlow !== 'create_new' && (
        <div className="cf-form-group">
          <h3>Selected Flow: {flows.find(flow => flow.id === selectedFlow)?.name}</h3>
          {/* Add flow editing components here */}
          {/* For example: */}
          <textarea
            value={JSON.stringify(campaignData.flow, null, 2)}
            onChange={(e) => setCampaignData(prevState => ({
              ...prevState,
              flow: JSON.parse(e.target.value),
            }))}
            className="cf-flow-editor"
          />
        </div>
      )}
         <div className="form-group col-md-6">
                  <label htmlFor="message" className='campaign_message'>Message :</label>
                  <input
                    type="text"
                    className="form-campaign_message"
                    id="message"
                    name="message"
                    value={campaignData.message}
                    onChange={handleChange}
                    placeholder="Enter message"
                    style={{ borderColor: errorFields.message ? 'red' : '' }}
                  />
                </div>
        {/* <div> */}
       
        <h1 className='audience_campaign'>Audience</h1>
        <div className='roundicon'>
        <CreateRoundedIcon />

        </div>
        <div className="form-group col-md-6">
                  <label htmlFor="expected_count" className='campaign_expected_count'>Expected Count :</label>
                  <input
                    type="text"
                    className="form-campaign_expected_count"
                    id="expected_count"
                    name="expected_count"
                    value={campaignData.expected_count}
                    onChange={handleChange}
                    placeholder="Enter expected count"
                    style={{ borderColor: errorFields.expected_count ? 'red' : '' }}
                  />
                </div>
       
        
                <div className="cf-form-group">
          <p className='cf-campaign-type'>Type</p>
          <button 
            className={`cf-social-btn ${campaignData.type === 'Facebook' ? 'active' : ''}`} 
            onClick={() => handleSocialButtonClick('Facebook')}
          >
            <FacebookIcon />
          </button>
          <button 
            className={`cf-social-btn ${campaignData.type === 'Instagram' ? 'active' : ''}`}
            onClick={() => handleSocialButtonClick('Instagram')}
          >
            <InstagramIcon />
          </button>
          <button className={`cf-social-btn ${campaignData.type === 'WhatsApp' ? 'active' : ''}`} onClick={() => handleSocialButtonClick('WhatsApp')}>
            <WhatsAppIcon />
          </button>
          <button className={`cf-social-btn ${campaignData.type === 'Email' ? 'active' : ''}`} onClick={() => handleSocialButtonClick('Email')}>
            <EmailIcon />
          </button>
          <button className={`cf-social-btn ${campaignData.type === 'Message' ? 'active' : ''}`} onClick={() => handleSocialButtonClick('Message')}>
            <ChatBubbleOutlineIcon />
          </button>
          </div>
      </form>
      {showPopup && <Popup errors={formErrors} onClose={closePopup} />}
      {showSuccessPopup && <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />}
    </div>
  );
}

export default Campaignform
