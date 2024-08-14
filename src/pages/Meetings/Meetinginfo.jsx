import React, { useState, useEffect } from "react";
import axiosInstance from "../../api";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path
import './meetings.css'

import { Link, useParams } from "react-router-dom";

const getTenantIdFromUrl = () => {
    const pathArray = window.location.pathname.split('/');
    if (pathArray.length >= 2) {
      return pathArray[1]; 
    }
    return null;
  };

const MeetingInfo = () => {
  const { id } = useParams();
  const tenantId = getTenantIdFromUrl();
  const [modalOpen, setModalOpen] = useState(false);

  const [meetingInfo, setMeetingInfo] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isEditing1, setIsEditing1] = useState(false); // State for meeting_infobox1

  const [editedValues, setEditedValues] = useState({});
  const [editedValues1, setEditedValues1] = useState({}); // Edited values for meeting_infobox2


  useEffect(() => {
    fetchMeetingInfo();
  }, [id]);

  const fetchMeetingInfo = async () => {
    try {
      const response = await axiosInstance.get(`/meetings/${id}`);
      setMeetingInfo(response.data);
      setEditedValues(response.data);
      setEditedValues1(response.data); // Initialize edited values for meeting_infobox2

      console.log("Meeting details fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching meeting details:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };
  const handleEdit1 = () => {
    setIsEditing1(true);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedValues((prev) => ({ ...prev, [name]: value }));
  };
  const handleChange1 = (e) => {
    const { name, value } = e.target;
    setEditedValues1((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.put(`/meetings/${id}/`, editedValues);
      setMeetingInfo(response.data);
      setIsEditing(false);
      console.log("Meeting information updated successfully:", response.data);
  
      const interactionData = {
        entity_type: "meetings",
        entity_id: id,
        interaction_type: "Meeting Update",
        tenant_id: tenantId,
        notes: `Meeting updated. New details - Title: ${editedValues.title}, From: ${editedValues.from_time}, To: ${editedValues.to_time}, Related To: ${editedValues.related_to}, Contact Name: ${editedValues.contact_name}, Host Name: ${editedValues.host}, Description: ${editedValues.description}, Assigned To: ${editedValues.assigned_to}, Created By: ${editedValues.createdBy}`,
        interaction_datetime: new Date().toISOString(),
      };
  
      // Send POST request to interactions endpoint
      await axiosInstance.post('/interaction/', interactionData);
      console.log('Interaction logged successfully');
    } catch (error) {
      console.error("Error updating meeting information:", error);
    }
  };
  
  const handleSubmit1 = async () => {
    try {
      const response = await axiosInstance.put(`/meetings/${id}/`, editedValues1);
      setMeetingInfo(response.data);
      setIsEditing1(false);
      console.log("Meeting information for meeting_infobox1 updated successfully:", response.data);
  
      const interactionData = {
        entity_type: "meetings",
        entity_id: id,
        interaction_type: "Meeting Update",
        tenant_id: tenantId,
        notes: `Meeting updated for meeting_infobox1. New details - Description: ${editedValues1.description}, Assigned To: ${editedValues1.assigned_to}, Created By: ${editedValues1.createdBy}`,
        interaction_datetime: new Date().toISOString(),
      };
  
      await axiosInstance.post('/interaction/', interactionData);
      console.log('Interaction logged successfully');
    } catch (error) {
      console.error("Error updating meeting information for meeting_infobox1:", error);
    }
  };
  

  const handleCancel1 = () => {
    setIsEditing1(false);
    setEditedValues1(meetingInfo);
  };
  const handleCancel = () => {
    setIsEditing(false);
    setEditedValues(meetingInfo);
  };

  if (!meetingInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
     <div className="oppo_nav">
    <TopNavbar/>
  </div>
      <div className="meet-head">
      
      <div className="meetinglist">
        <Link to={`../${tenantId}/meetings`} id='back-inter-task'>
          Back
        </Link>
      </div>
      <div className="meettt-info">
      <div>
      <h1 className='meeting-infohead'>Meeting Info</h1>
      </div>
    <div className="meeting_infobox1">
    <ul className="meetingpage_list">
      
            <li className="meet-list">
              <strong>Title:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  className="meetingpage_list_data"
                  value={editedValues.title}
                  onChange={handleChange}
                />
              ) : (
                <span className="meet-list-data">{meetingInfo.title}</span>
              )}
            </li>
            <li className="meet-list">
              <strong>From:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="from_time"
                  className="meetingpage_list_data"
                  value={editedValues.from_time}
                  onChange={handleChange}
                />
              ) : (
                <span className="meet-list-data1">{meetingInfo.from_time}</span>
              )}
            </li>
            <li className="meet-list">
              <strong>To:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="to_time"
                  className="meetingpage_list_data"
                  value={editedValues.to_time}
                  onChange={handleChange}
                />
              ) : (
                <span className="meet-list-data2">{meetingInfo.to_time}</span>
              )}
            </li>
            <li className="meet-list">
              <strong>Related To:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="related_to"
                  className="meetingpage_list_data"
                  value={editedValues.related_to}
                  onChange={handleChange}
                />
              ) : (
                <span className="meet-list-data3">{meetingInfo.related_to}</span>
              )}
            </li>
            <li className="meet-list">
              <strong>Contact Name:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="contact_name"
                  className="meetingpage_list_data"
                  value={editedValues.contact_name}
                  onChange={handleChange}
                />
              ) : (
                <span className="meet-list-data4">{meetingInfo.contact_name}</span>
              )}
            </li>
            <li className="meet-list">
              <strong>Host Name:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="host"
                  className="meetingpage_list_data"
                  value={editedValues.host}
                  onChange={handleChange}
                />
              ) : (
                <span className="meet-list-data5">{meetingInfo.host}</span>
              )}
            </li>
            </ul>
            <div className="button-container">
            {!isEditing ? (
              <button className="edit-meeting" onClick={handleEdit}>Edit</button>
            ) : (
              <>
                <button className="edit-meeting-save" onClick={handleSubmit}>Save</button>
                <button className="edit-meeting-cancel" onClick={handleCancel}>Cancel</button>
              </>
            )}
          </div>

    </div>
      <div className="meeting_infobox2">
     <ul>
     <li className="meet-list">
              <strong>Description:</strong>
              {isEditing1 ? (
                <input
                  type="text"
                  name="description"
                  className="meetingpage_list_data"
                  value={editedValues.description}
                  onChange={handleChange1}
                />
              ) : (
                <span className="meet-list-data">{meetingInfo.description}</span>
              )}
            </li>
            <li className="meet-list">
              <strong>Assigned To:</strong>
              {isEditing1 ? (
                <input
                  type="text"
                  name="assigned_to"
                  className="meetingpage_list_data"
                  value={editedValues.assigned_to}
                  onChange={handleChange1}
                />
              ) : (
                <span className="meet-list-data1">{meetingInfo.assigned_to}</span>
              )}
            </li>
            <li className="meet-list">
              <strong>Created By:</strong>
              {isEditing1 ? (
                <input
                  type="text"
                  name="createdBy"
                  className="meetingpage_list_data"
                  value={editedValues.createdBy}
                  onChange={handleChange1}
                />
              ) : (
                <span className="meet-list-data2">{meetingInfo.createdBy}</span>
              )}
            </li>
     </ul>
     <div className="button-container">
            {!isEditing1 ? (
              <button className="edit-meeting1" onClick={handleEdit1}>Edit</button>
            ) : (
              <>
                <button className="edit-meeting-save1" onClick={handleSubmit1}>Save</button>
                <button className="edit-meeting-cancel1" onClick={handleCancel1}>Cancel</button>
              </>
            )}
          </div>
      </div>
      </div>
     
      </div>
 
        
      
      
    </div>
  );
};

export default MeetingInfo;
