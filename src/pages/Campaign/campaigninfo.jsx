
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import './campaigninfo.css'; // Import the CSS file
import axiosInstance from "../../api.jsx";

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1];
  }
  return null;
};

export const CampaignInfo = () => {
  const tenantId = getTenantIdFromUrl();
  const [campaign, setCampaign] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const { id } = useParams();
  const [additionalData, setAdditionalData] = useState({
    instagram: null,
    whatsapp: null,
    email: null,
    call: null,
  }); const [instagramCampaignData, setInstagramCampaignData] = useState({});
  const [emailCampaignData, setEmailCampaignData] = useState({});
  const [callCampaignData, setCallCampaignData] = useState({});
  const [whatsappCampaignData, setWhatsappCampaignData] = useState({});

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const response = await axiosInstance.get(`/campaign/${id}`);
        setCampaign(response.data);
        console.log(campaign);
        
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      }
    };

    fetchCampaignData();
  }, [id]);

  useEffect(() => {
    if (!id || !tenantId) {
      console.warn('No campaign ID or tenant ID provided.');
      return;
    }

    const fetchAdditionalData = async () => {
      try {
        const headers = {
          'X-Tenant-ID': tenantId,
        };

        const [campaignResponse, instagramResponse, whatsappResponse, emailResponse, callResponse] = await Promise.all([
          axiosInstance.get(`/campaign/${id}`, { headers }),
          axiosInstance.get(`/instagram-campaigns/`, { headers }),
          axiosInstance.get(`/whatsapp-campaigns/`, { headers }),
          axiosInstance.get(`/email-campaigns/`, { headers }),
          axiosInstance.get(`/call-campaigns/`, { headers }),
        ]);

        
        setWhatsappCampaignData(whatsappResponse.data);
        setInstagramCampaignData(instagramResponse.data);
        setEmailCampaignData(emailResponse.data);
        setCallCampaignData(callResponse.data);

        console.log('Campaign Data:', campaignResponse.data);
        console.log('Instagram Campaign Data:', instagramResponse.data);
        console.log('Email Campaign Data:', emailResponse.data);
        console.log('Call Campaign Data:', callResponse.data);
        
      } catch (error) {
        console.error("Error fetching additional campaign data:", error);
      }
    };

    fetchAdditionalData();
  }, [id, tenantId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosInstance.patch(`/campaign/${id}`, editedValues);
      console.log('Form submitted successfully:', response.data);
      // Optionally, you can update the local state with the response data
      setCampaign(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    setIsEditing(false);
    const interactionData = {
      entity_type: "Campaign",
      entity_id: id,
      interaction_type: "Note",
      tenant_id: tenantId, 
      notes: `User with ${id} makes changes in the details of the ${id}`,
    };
  
    try {
        await axiosInstance.post('/interaction/', interactionData);
        console.log('Interaction logged successfully');
      } catch (error) {
        console.error('Error logging interaction:', error);
      }
  }

  const handleCancel = () => {
    setIsEditing(false);
    setEditedValues(campaign); // Reset edited values to original opportunity data
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
      <div className="info-box">
        <div className="info-row">
          <div className="info-pair-campaign">
            <label htmlFor="campaign_name">Campaign Name:</label>
            <input
              type="text"
              id="campaign_name"
              name="campaign_name"
              value={isEditing ? editedValues.campaign_name : campaign.campaign_name}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
          <div className="info-pair-campaign">
            <label htmlFor="campaign_owner">Campaign Owner:</label>
            <input
              type="text"
              id="campaign_owner"
              name="campaign_owner"
              value={isEditing ? editedValues.campaign_owner : campaign.campaign_owner}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
        </div>
        <div className="info-row">
          <div className="info-pair-campaign">
            <label htmlFor="start_date">Start Date:</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={isEditing ? editedValues.start_date : campaign.start_date}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
          <div className="info-pair-campaign">
            <label htmlFor="end_date">End Date:</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={isEditing ? editedValues.end_date : campaign.end_date}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
        </div>
        <div className="info-row">
          <div className="info-pair-campaign">
            <label htmlFor="expected_revenue">Expected Revenue:</label>
            <input
              type="text"
              id="expected_revenue"
              name="expected_revenue"
              value={isEditing ? editedValues.expected_revenue : campaign.expected_revenue}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
          <div className="info-pair-campaign">
            <label htmlFor="actual_cost">Actual Cost:</label>
            <input
              type="text"
              id="actual_cost"
              name="actual_cost"
              value={isEditing ? editedValues.actual_cost : campaign.actual_cost}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
        </div>
      </div>
      <div className="info-box">
        <div className="info-row">
          <div className="info-pair-campaign">
            <label htmlFor="numbers_sent">Numbers Sent:</label>
            <input
              type="text"
              id="numbers_sent"
              name="numbers_sent"
              value={isEditing ? editedValues.numbers_sent : campaign.numbers_sent}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
          <div className="info-pair-campaign">
            <label htmlFor="type">Type:</label>
            <input
              type="text"
              id="type"
              name="type"
              value={isEditing ? editedValues.type : campaign.type}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
        </div>
        <div className="info-row">
          <div className="info-pair-campaign">
            <label htmlFor="status">Status:</label>
            <input
              type="text"
              id="status"
              name="status"
              value={isEditing ? editedValues.status : campaign.status}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
          <div className="info-pair-campaign">
            <label htmlFor="budgeted_cost">Budgeted Cost:</label>
            <input
              type="text"
              id="budgeted_cost"
              name="budgeted_cost"
              value={isEditing ? editedValues.budgeted_cost : campaign.budgeted_cost}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
        </div>
        <div className="info-row">
          <div className="info-pair-campaign">
            <label htmlFor="expected_response">Expected Response:</label>
            <input
              type="text"
              id="expected_response"
              name="expected_response"
              value={isEditing ? editedValues.expected_response : campaign.expected_response}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
          <div className="info-pair-campaign">
            <label htmlFor="tenant">Tenant:</label>
            <input
              type="text"
              id="tenant"
              name="tenant"
              value={isEditing ? editedValues.tenant : campaign.tenant}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
        </div>
        <div className="info-row">
          <div className="info-pair-campaign">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={isEditing ? editedValues.description : campaign.description}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
        </div>
            </div>
          </div>
          <div className="additional-campaign-whatsappinfo">
      <h2>Whatsapp Campaign Information</h2>
      {whatsappCampaignData ? (
        <div>
            <p><strong>Broadcast Message:</strong> {whatsappCampaignData.broadcast_message}</p>
            <p><strong>Chatbot Enabled:</strong> {whatsappCampaignData.chatbot_enabled ? 'Yes' : 'No'}</p>
            <p><strong>Chatbot Script:</strong> {whatsappCampaignData.chatbot_script}</p>
            <p><strong>AI Integration:</strong> {whatsappCampaignData.ai_integration ? 'Yes' : 'No'}</p>
            <p><strong>AI Features:</strong> {whatsappCampaignData.ai_features}</p>
            <p><strong>Target Audience:</strong> {whatsappCampaignData.target_audience}</p>
            <p><strong>Message Template:</strong> {whatsappCampaignData.message_template}</p>
            <p><strong>Number of Recipients:</strong> {whatsappCampaignData.number_of_recipients}</p>
            <p><strong>Scheduling Time:</strong> {new Date(whatsappCampaignData.scheduling_time).toLocaleString()}</p>
            <p><strong>Engagement Goal:</strong> {whatsappCampaignData.engagement_goal}</p>
            <p><strong>Actual Engagement:</strong> {whatsappCampaignData.actual_engagement}</p>
            <p><strong>Notes:</strong> {whatsappCampaignData.notes}</p>
        </div>
      ) : (
        <p>No Whatsapp campaign data available.</p>
      )}
    </div>
    <div className="additional-campaign-instainfo">
  <h2>Instagram Campaign Information</h2>
  {instagramCampaignData ? (
    <div>
        <p><strong>Campaign Tone:</strong> {instagramCampaignData.campaign_tone}</p>
        <p><strong>Number of Posts:</strong> {instagramCampaignData.number_of_posts}</p>
        <p><strong>Target Hashtags:</strong> {instagramCampaignData.target_hashtags}</p>
        <p><strong>Duration:</strong> {instagramCampaignData.duration}</p>
        <p><strong>Audience Targeting:</strong> {instagramCampaignData.audience_targeting}</p>
        <p><strong>Call to Action:</strong> {instagramCampaignData.call_to_action}</p>
        <p><strong>Engagement Goal:</strong> {instagramCampaignData.engagement_goal}</p>
        <p><strong>Actual Engagement:</strong> {instagramCampaignData.actual_engagement}</p>
        <p><strong>Notes:</strong> {instagramCampaignData.notes}</p>

    </div>
  ) : (
    <p>No Instagram campaign data available.</p>
  )}
</div>
<div className="additional-campaign-emailinfo">
  <h2>Email Campaign Information</h2>
  {emailCampaignData ? (
    <div>
        <p><strong>Subject Line:</strong> {emailCampaignData.subject_line}</p>
        <p><strong>Email Body:</strong> {emailCampaignData.email_body}</p>
        <p><strong>Sender Email:</strong> {emailCampaignData.sender_email}</p>
        <p><strong>Recipient List:</strong> {emailCampaignData.recipient_list}</p>
        <p><strong>Scheduled Time:</strong> {new Date(emailCampaignData.scheduled_time).toLocaleString()}</p>
        <p><strong>Email Template:</strong> {emailCampaignData.email_template}</p>
        <p><strong>Emails Sent:</strong> {emailCampaignData.emails_sent}</p>
        <p><strong>Emails Opened:</strong> {emailCampaignData.emails_opened}</p>
        <p><strong>Clicks:</strong> {emailCampaignData.clicks}</p>
        <p><strong>Bounces:</strong> {emailCampaignData.bounces}</p>
        <p><strong>Unsubscribes:</strong> {emailCampaignData.unsubscribes}</p>
        <p><strong>Engagement Rate:</strong> {emailCampaignData.engagement_rate}</p>
        <p><strong>Notes:</strong> {emailCampaignData.notes}</p>
    </div>
  ) : (
    <p>No Email campaign data available.</p>
  )}
</div>
<div className="additional-campaign-callinfo">
  <h2>Call Campaign Information</h2>
  {callCampaignData ? (
    <div>
        <p><strong>Campaign Type:</strong> {callCampaignData.campaign_type}</p>
        <p><strong>Call Script:</strong> {callCampaignData.call_script}</p>
        <p><strong>Contacts:</strong> {callCampaignData.contacts}</p>
        <p><strong>Scheduled Time:</strong> {new Date(callCampaignData.scheduled_time).toLocaleString()}</p>
        <p><strong>Duration:</strong> {callCampaignData.duration}</p>
        <p><strong>Status:</strong> {callCampaignData.status}</p>
        <p><strong>Notes:</strong> {callCampaignData.notes}</p>
    </div>
  ) : (
    <p>No Call campaign data available.</p>
  )}
</div>
        </div>
      </div>
    </div>
  );
};

export default CampaignInfo;
