import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Modal from "@mui/material/Modal";
import { Header } from "../../components/Header";
import Select from "react-select";
import "./Reminder.css";
import axiosInstance from "../../api.jsx";
import "./Reminder.jsx";
import { useAuth } from "../../authContext.jsx";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path




const getTenantIdFromUrl = () => {
    // Example: Extract tenant_id from "/3/home"
    const pathArray = window.location.pathname.split('/');
    if (pathArray.length >= 2) {
      return pathArray[1]; // Assumes tenant_id is the first part of the path
    }
    return null; // Return null if tenant ID is not found or not in the expected place
  };


const Reminderform = () => {
    const tenantId=getTenantIdFromUrl();
    const {userId}=useAuth();
    const style = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 400,
      bgcolor: "background.paper",
      border: "2px solid #000",
      boxShadow: 24,
      pt: 2,
      px: 4,
      pb: 3,
    };

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [reminderOptions, setReminderOptions] = useState([]);

    const [remindData, setRemindData] = useState({
      subject:"",
      event_date_time:"",
      time_trigger:"",
      createdBy:"",
      trigger_type: "time",
      tenant: tenantId,
      is_triggered: false,
      created_at: "2024-06-25T08:21:33.075616Z",
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axiosInstance.post('/reminders/', remindData);
        console.log("Form submitted:", response.data);
        // Optionally, perform any action upon successful form submission
      } catch (error) {
        console.error("Error submitting form:", error);
        // Optionally, handle errors or display error message to the user
      }
    };
  
    
      // useEffect(() => {
      //   fetchRemindOptions();
      // }, []);
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRemindData({ ...remindData, [name]: value });
      };
      // const handleSubmit = (e) => {
      //   e.preventDefault();
      //   console.log("Form submitted:", remindData);
      // };
      const handleCancel = () => {
    
        const isConfirmed = window.confirm("Are you sure you want to cancel? Any unsaved data will be lost.");
        
      
        if (isConfirmed) {
          console.log("Cancel button clicked");
         
          window.location.href = `../${tenantId}/reminders`;
        }
      };
      
      
      const handleSaveAsDraft = () => {
        // Implement save as draft logic here
        console.log("Save as Draft button clicked");
      
      };
      const handleSubmitForm = (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        // Call your submit logic here
        handleSubmit(event);
      };
  return (
   <div>
     <div className="remind_topNave">
      <TopNavbar/>
      </div>
      <div className="reminder_form_page">
        
   <div className="relatedremind_back">
          <Link  to={`/${tenantId}/reminder`}>Back</Link>
        </div>
       
        <div>
        
        <div>
        <div>
      <h1 className="create_form_head"  >Create  Reminder</h1>
  </div>
  
  <div>
  <div className='btnsss_remind'>
              <button type="button" onClick={handleCancel} className="btn-submit_cancel_remind">Cancel</button>
              <button type="button"   onClick={handleSaveAsDraft}  className="btn-submit_save_remind">Save as Draft</button>
              <button type="submit"  onClick={handleSubmitForm} className="btn-submit_submit_remind">Submit</button>
            </div>
  </div>
        </div>
  
  
  
          <div className='form-remind'>
          <form onSubmit={handleSubmit}>
        <div className="front_section" >
          <div className="left-section">
            <label   className='remind_sub' htmlFor="subject">Subject:</label>
            <input 
              type="text" 
              id="subject" 
              className="form-control-remind"
  
              name="subject" 
              value={remindData.subject} 
              onChange={handleInputChange} 
              placeholder="Enter subject"
  
            />
            <label className='remind_sub' htmlFor="event_date_time">Event Date Time:</label>
            <input 
              type="datetime-local" 
              id="event_date_time" 
              className="form-control-remind"
  
              name="event_date_time" 
              value={remindData.event_date_time} 
              onChange={handleInputChange} 
              placeholder="Enter event date"
  
            />
            <label className='remind_sub' htmlFor="time_trigger">Time Trigger:</label>
            <input 
              type="datetime-local" 
              id="time_trigger"
              className="form-control-remind"
   
              name="time_trigger" 
              value={remindData.time_trigger} 
              onChange={handleInputChange} 
              placeholder="Enter time"
  
            />
  
          </div>
          <div className="right-section">
            <label htmlFor="trigger_type" className='remind_sub'>Trigger Type:</label>
            <input 
              type="text" 
              id="trigger_type" 
              className="form-control-remind"
              name="trigger_type" 
              value={remindData.trigger_type} 
              onChange={handleInputChange} 
              placeholder="Enter trigger"
  
            />
            <label htmlFor="is_triggered" className='remind_sub'>Is Triggered:</label>
            <input 
              type="text" 
              id="is_triggered" 
              name="is_triggered"
              className="form-control-remind" 
              value={remindData.is_triggered} 
              onChange={handleInputChange} 
              placeholder="Enter is trigger"
  
            />
            <label htmlFor="createdBy" className='remind_sub'>Created By:</label>
            <input 
              type="text" 
              id="createdBy" 
              className="form-control-remind"
              name="createdBy" 
              value={remindData.createdBy} 
              onChange={handleInputChange} 
              placeholder="Enter created"
  
            />
          </div>
        </div>
  
        <button className="submit-remind" type="submit">Submit</button>
      </form>
          </div>
        </div>
      
      
    </div>
   </div>
  )
}

export default Reminderform
