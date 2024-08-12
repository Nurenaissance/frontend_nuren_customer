import axios from "axios";
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

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const response = await axiosInstance.get(`/campaign/${id}`);
        setCampaign(response.data);
        console.log(response.data);
        
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      }
    };

    fetchCampaignData();
  }, [id]);

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
        </div>
      </div>
    </div>
  );
};

export default CampaignInfo;
