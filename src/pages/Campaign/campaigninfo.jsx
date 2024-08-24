import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import './campaigninfo.css';
import axiosInstance from "../../api.jsx";

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  return pathArray.length >= 2 ? pathArray[1] : null;
};

export const CampaignInfo = () => {
  const tenantId = getTenantIdFromUrl();
  const [campaign, setCampaign] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const { id } = useParams();
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [instagramCampaigns, setInstagramCampaigns] = useState([]);
  const [whatsappCampaigns, setWhatsappCampaigns] = useState([]);
  const [callCampaigns, setCallCampaigns] = useState([]);
  const [linkedinCampaigns, setLinkedinCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const response = await axiosInstance.get(`/campaign/${id}`);
        setCampaign(response.data.campaign);
        setEmailCampaigns(response.data.attached_data.email_campaigns || []);
        setInstagramCampaigns(response.data.attached_data.instagram_campaigns || []);
        setWhatsappCampaigns(response.data.attached_data.whatsapp_campaigns || []);
        setCallCampaigns(response.data.attached_data.call_campaigns || []);
        setLinkedinCampaigns(response.data.attached_data.linkedin_campaigns || []);
        setEditedValues(response.data.campaign);
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      }
    };

    fetchCampaignData();
  }, [id]);

  const handleEdit = () => setIsEditing(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosInstance.patch(`/campaign/${id}`, editedValues);
      setCampaign(response.data);
      setIsEditing(false);
      // Log interaction here
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedValues(campaign);
  };

  return (
    <div className="campaign-info-page">
      <div className="campaign-sidebar">
        <Link to={`/${tenantId}/campaign`}>Back</Link>
      </div>
      <div className="campaigninformation">
        <div className="campaign-button">
          <button className="edit-button" onClick={handleEdit} disabled={isEditing}>Edit</button>
          {isEditing && (
            <>
              <button className="save-button" onClick={handleSubmit}>Save</button>
              <button className="cancel-button" onClick={handleCancel}>Cancel</button>
            </>
          )}
        </div>
        <div className="campaign-info">
          <h1>{campaign.campaign_name}</h1>
          <div className="content">
          {Object.entries(campaign).length > 0 && (
            <div className="info-box">
              {/* Campaign Details */}
              {Object.entries(campaign).map(([key, value]) => (
                key !== 'id' && key !== 'type' && (
                  <div className="info-pair-campaign" key={key}>
                    <label htmlFor={key}>{key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}:</label>
                    <input
                      type={key.includes('date') ? 'date' : 'text'}
                      id={key}
                      name={key}
                      value={isEditing ? editedValues[key] : value}
                      onChange={handleChange}
                      readOnly={!isEditing}
                    />
                  </div>
                )
              ))}
              {/* Campaign Type */}
              <div className="info-pair-campaign">
                <label htmlFor="type">Type:</label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  value={isEditing ? editedValues.type : (campaign.type ? campaign.type.join(', ') : '')}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />
              </div>
            </div>
            )}
          </div>
          
          {/* Email Campaigns */}
          {emailCampaigns.length > 0 && (
          <div className="additional-campaign-emailinfo">
            <h2>Email Campaign Information</h2>
            {emailCampaigns.map((emailCampaign, index) => (
              <div key={index}>
                <h3>Email Campaign {index + 1}</h3>
                {Object.entries(emailCampaign).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}:</strong> 
                    {value !== null ? value.toString() : 'N/A'}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

          {/* Instagram Campaigns */}
          {instagramCampaigns.length > 0 && (
          <div className="additional-campaign-instainfo">
            <h2>Instagram Campaign Information</h2>
            {instagramCampaigns.map((instagramCampaign, index) => (
              <div key={index}>
                <h3>Instagram Campaign {index + 1}</h3>
                {Object.entries(instagramCampaign).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}:</strong> 
                    {value !== null ? value.toString() : 'N/A'}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

          {/* WhatsApp Campaigns */}
          {whatsappCampaigns.length > 0 && (
          <div className="additional-campaign-whatsappinfo">
            <h2>WhatsApp Campaign Information</h2>
            {whatsappCampaigns.map((whatsappCampaign, index) => (
              <div key={index}>
                <h3>WhatsApp Campaign {index + 1}</h3>
                {Object.entries(whatsappCampaign).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}:</strong> 
                    {value !== null ? value.toString() : 'N/A'}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

          {/* Call Campaigns */}
          {callCampaigns.length > 0 && (
  <div className="additional-campaign-callinfo">
    <h2>Call Campaign Information</h2>
    {callCampaigns.map((callCampaign, index) => (
      <div key={index}>
        <h3>Call Campaign {index + 1}</h3>
        {Object.entries(callCampaign).map(([key, value]) => (
          <p key={key}><strong>{key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}:</strong> {value}</p>
        ))}
      </div>
    ))}
  </div>
)}

          {/* LinkedIn Campaigns */}
          {linkedinCampaigns.length > 0 && (
  <div className="additional-campaign-linkedininfo">
    <h2>LinkedIn Campaign Information</h2>
    {linkedinCampaigns.map((linkedinCampaign, index) => (
      <div key={index}>
        <h3>LinkedIn Campaign {index + 1}</h3>
        {Object.entries(linkedinCampaign).map(([key, value]) => (
          <p key={key}><strong>{key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}:</strong> {value}</p>
        ))}
      </div>
    ))}
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default CampaignInfo;