import React from 'react';
import { useState,useEffect } from 'react';
import './individualform.css';
const AdditionalCampaignFields = ({ additionalFields }) => {
     // State for Instagram Campaign
  const [instagramCampaignData, setInstagramCampaignData] = useState({
    campaign_tone: 'Promotional',
    number_of_posts: 1,
    target_hashtags: '',
    duration: '',
    audience_targeting: '',
    call_to_action: '',
    engagement_goal: '',
    actual_engagement: '',
    notes: '',
  });
  const [emailCampaignData, setEmailCampaignData] = useState({
    subject_line: '',
    email_body: '',
    sender_email: '',
    recipient_list: '',
    scheduled_time: '',
    email_template: '',
    emails_sent: 0,
    emails_opened: 0,
    clicks: 0,
    bounces: 0,
    unsubscribes: 0,
    engagement_rate: '',
    notes: '',
  });
    
    const [callCampaignData, setCallCampaignData] = useState({
        campaign_type: 'Outbound',
        call_script: '',
        contacts: [],
        scheduled_time: '',
        duration: '',
        status: 'Pending',
        notes: '',
      });
      const [whatsappCampaignData, setWhatsappCampaignData] = useState({
        broadcast_message: '',
        chatbot_enabled: false,
        chatbot_script: '',
        ai_integration: false,
        ai_features: '',
        target_audience: '',
        message_template: '',
        number_of_recipients: 0,
        scheduling_time: '',
        engagement_goal: '',
        actual_engagement: '',
        notes: '',
      });
      const handleWhatsAppCampaignChange = (e) => {
        const { name, value, type, checked } = e.target;
        setWhatsappCampaignData((prevData) => ({
          ...prevData,
          [name]: type === 'checkbox' ? checked : value,
        }));
      };
      const handleCallCampaignChange = (e) => {
        const { name, value } = e.target;
        setCallCampaignData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      };

      const handleInstagramCampaignChange = (e) => {
        const { name, value } = e.target;
        setInstagramCampaignData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      };
      const handleEmailCampaignChange = (e) => {
        const { name, value } = e.target;
        setEmailCampaignData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      };
      const handleSubmitInstagramCampaign = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('http://127.0.0.1:8000/instagram-campaigns/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(instagramCampaignData),
          });
          if (response.ok) {
            // Handle successful response
            const data = await response.json();
            console.log('Instagram Campaign Created:', data);
          } else {
            // Handle error response
            console.error('Error creating Instagram Campaign:', response.statusText);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      
      const handleSubmitWhatsAppCampaign = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('http://127.0.0.1:8000/whatsapp-campaigns/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(whatsappCampaignData),
          });
          if (response.ok) {
            const data = await response.json();
            console.log('WhatsApp Campaign Created:', data);
          } else {
            console.error('Error creating WhatsApp Campaign:', response.statusText);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      
      const handleSubmitEmailCampaign = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('http://127.0.0.1:8000/email-campaigns/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailCampaignData),
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Email Campaign Created:', data);
          } else {
            console.error('Error creating Email Campaign:', response.statusText);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      
      const handleSubmitCallCampaign = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('http://127.0.0.1:8000/call-campaigns/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Tenant-Id':'ll',
            },
            body: JSON.stringify(callCampaignData),
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Call Campaign Created:', data);
          } else {
            console.error('Error creating Call Campaign:', response.statusText);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      
  return (
    <>
   
    <div className="campaign-additional-page">
      {additionalFields.instagram && (
        <div className="insta-additional-fields">
          <h3>Instagram Campaign Details</h3>
          <form onSubmit={handleSubmitInstagramCampaign}>
            <div className="form-group">
              <label htmlFor="campaign_tone">Campaign Tone:</label>
              <select
                name="campaign_tone"
                value={instagramCampaignData.campaign_tone}
                onChange={handleInstagramCampaignChange}
              >
                <option value="Informative">Informative</option>
                <option value="Promotional">Promotional</option>
                <option value="Engaging">Engaging</option>
                <option value="Storytelling">Storytelling</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="number_of_posts">Number of Posts:</label>
              <input
                type="number"
                name="number_of_posts"
                value={instagramCampaignData.number_of_posts}
                onChange={handleInstagramCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="target_hashtags">Target Hashtags:</label>
              <textarea
                name="target_hashtags"
                value={instagramCampaignData.target_hashtags}
                onChange={handleInstagramCampaignChange}
                placeholder="Enter target hashtags"
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Campaign Duration:</label>
              <input
                type="text"
                name="duration"
                value={instagramCampaignData.duration}
                onChange={handleInstagramCampaignChange}
                placeholder="Enter duration (e.g., 3 days)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="audience_targeting">Audience Targeting:</label>
              <input
                type="text"
                name="audience_targeting"
                value={instagramCampaignData.audience_targeting}
                onChange={handleInstagramCampaignChange}
                placeholder="Describe the target audience"
              />
            </div>

            <div className="form-group">
              <label htmlFor="call_to_action">Call to Action:</label>
              <input
                type="text"
                name="call_to_action"
                value={instagramCampaignData.call_to_action}
                onChange={handleInstagramCampaignChange}
                placeholder="Enter the call to action"
              />
            </div>

            <div className="form-group">
              <label htmlFor="engagement_goal">Engagement Goal (%):</label>
              <input
                type="number"
                name="engagement_goal"
                step="0.01"
                value={instagramCampaignData.engagement_goal}
                onChange={handleInstagramCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="actual_engagement">Actual Engagement (%):</label>
              <input
                type="number"
                name="actual_engagement"
                step="0.01"
                value={instagramCampaignData.actual_engagement}
                onChange={handleInstagramCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes:</label>
              <textarea
                name="notes"
                value={instagramCampaignData.notes}
                onChange={handleInstagramCampaignChange}
                placeholder="Additional notes"
              />
            </div>
            <button className='button'type="submit">Add Instagram Campaign</button>
          </form>
        </div>
      )}

      {additionalFields.whatsapp && (
        <div className="whatsapp-additional-fields">
          <h3>WhatsApp Campaign Details</h3>
          <form onSubmit={handleSubmitWhatsAppCampaign}>
            <div className="form-group">
              <label htmlFor="broadcast_message">Broadcast Message:</label>
              <textarea
                name="broadcast_message"
                value={whatsappCampaignData.broadcast_message}
                onChange={handleWhatsAppCampaignChange}
                placeholder="Enter the broadcast message"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="chatbot_enabled"
                  checked={whatsappCampaignData.chatbot_enabled}
                  onChange={handleWhatsAppCampaignChange}
                />
                Enable Chatbot
              </label>
            </div>

            {whatsappCampaignData.chatbot_enabled && (
              <div className="form-group">
                <label htmlFor="chatbot_script">Chatbot Script:</label>
                <textarea
                  name="chatbot_script"
                  value={whatsappCampaignData.chatbot_script}
                  onChange={handleWhatsAppCampaignChange}
                  placeholder="Enter the chatbot script"
                />
              </div>
            )}

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="ai_integration"
                  checked={whatsappCampaignData.ai_integration}
                  onChange={handleWhatsAppCampaignChange}
                />
                Enable AI Integration
              </label>
            </div>

            {whatsappCampaignData.ai_integration && (
              <div className="form-group">
                <label htmlFor="ai_features">AI Features:</label>
                <textarea
                  name="ai_features"
                  value={whatsappCampaignData.ai_features}
                  onChange={handleWhatsAppCampaignChange}
                  placeholder="Describe AI features"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="target_audience">Target Audience:</label>
              <input
                type="text"
                name="target_audience"
                value={whatsappCampaignData.target_audience}
                onChange={handleWhatsAppCampaignChange}
                placeholder="Describe target audience"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message_template">Message Template:</label>
              <textarea
                name="message_template"
                value={whatsappCampaignData.message_template}
                onChange={handleWhatsAppCampaignChange}
                placeholder="Enter message template"
              />
            </div>

            <div className="form-group">
              <label htmlFor="number_of_recipients">Number of Recipients:</label>
              <input
                type="number"
                name="number_of_recipients"
                value={whatsappCampaignData.number_of_recipients}
                onChange={handleWhatsAppCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="scheduling_time">Scheduling Time:</label>
              <input
                type="datetime-local"
                name="scheduling_time"
                value={whatsappCampaignData.scheduling_time}
                onChange={handleWhatsAppCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="engagement_goal">Engagement Goal (%):</label>
              <input
                type="number"
                name="engagement_goal"
                step="0.01"
                value={whatsappCampaignData.engagement_goal}
                onChange={handleWhatsAppCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="actual_engagement">Actual Engagement (%):</label>
              <input
                type="number"
                name="actual_engagement"
                step="0.01"
                value={whatsappCampaignData.actual_engagement}
                onChange={handleWhatsAppCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes:</label>
              <textarea
                name="notes"
                value={whatsappCampaignData.notes}
                onChange={handleWhatsAppCampaignChange}
                placeholder="Additional notes"
              />
            </div>
            <button className='button'type="submit">Add WhatsApp Campaign</button>
          </form>
        </div>
      )}

      {additionalFields.email && (
        <div className="email-additional-fields">
          <h3>Email Campaign Details</h3>
          <form onSubmit={handleSubmitEmailCampaign}>
            <div className="form-group">
              <label htmlFor="subject_line">Subject Line:</label>
              <input
                type="text"
                name="subject_line"
                value={emailCampaignData.subject_line}
                onChange={handleEmailCampaignChange}
                placeholder="Enter subject line"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email_body">Email Body:</label>
              <textarea
                name="email_body"
                value={emailCampaignData.email_body}
                onChange={handleEmailCampaignChange}
                placeholder="Enter email body"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sender_email">Sender Email:</label>
              <input
                type="email"
                name="sender_email"
                value={emailCampaignData.sender_email}
                onChange={handleEmailCampaignChange}
                placeholder="Enter sender's email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipient_list">Recipient List:</label>
              <textarea
                name="recipient_list"
                value={emailCampaignData.recipient_list}
                onChange={handleEmailCampaignChange}
                placeholder="Enter comma-separated email addresses"
              />
            </div>

            <div className="form-group">
              <label htmlFor="scheduled_time">Scheduled Time:</label>
              <input
                type="datetime-local"
                name="scheduled_time"
                value={emailCampaignData.scheduled_time}
                onChange={handleEmailCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email_template">Email Template:</label>
              <textarea
                name="email_template"
                value={emailCampaignData.email_template}
                onChange={handleEmailCampaignChange}
                placeholder="Enter email template"
              />
            </div>

            <div className="form-group">
              <label htmlFor="emails_sent">Emails Sent:</label>
              <input
                type="number"
                name="emails_sent"
                value={emailCampaignData.emails_sent}
                onChange={handleEmailCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="emails_opened">Emails Opened:</label>
              <input
                type="number"
                name="emails_opened"
                value={emailCampaignData.emails_opened}
                onChange={handleEmailCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="clicks">Clicks:</label>
              <input
                type="number"
                name="clicks"
                value={emailCampaignData.clicks}
                onChange={handleEmailCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bounces">Bounces:</label>
              <input
                type="number"
                name="bounces"
                value={emailCampaignData.bounces}
                onChange={handleEmailCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="unsubscribes">Unsubscribes:</label>
              <input
                type="number"
                name="unsubscribes"
                value={emailCampaignData.unsubscribes}
                onChange={handleEmailCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="engagement_rate">Engagement Rate (%):</label>
              <input
                type="number"
                name="engagement_rate"
                step="0.01"
                value={emailCampaignData.engagement_rate}
                onChange={handleEmailCampaignChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes:</label>
              <textarea
                name="notes"
                value={emailCampaignData.notes}
                onChange={handleEmailCampaignChange}
                placeholder="Additional notes"
              />
            </div>
            <button className='button'type="submit">Add Email Campaign</button>
          </form>
        </div>
      )}

      {additionalFields.call && (
       <div className="call-additional-fields">
       <h3>Call Campaign Details</h3>
       <form onSubmit={handleSubmitCallCampaign}>
         <div className="form-group">
           <label htmlFor="campaign_type">Type:</label>
           <select
             name="campaign_type"
             value={callCampaignData.campaign_type}
             onChange={handleCallCampaignChange}
           >
             <option value="Outbound">Outbound</option>
             <option value="Inbound">Inbound</option>
             <option value="Follow-Up">Follow-Up</option>
             <option value="Survey">Survey</option>
             <option value="Sales">Sales</option>
           </select>
         </div>

         <div className="form-group">
           <label htmlFor="call_script">Script:</label>
           <textarea
             name="call_script"
             value={callCampaignData.call_script}
             onChange={handleCallCampaignChange}
             placeholder="Enter call script"
           />
         </div>

         <div className="form-group">
           <label htmlFor="contacts">Contacts (IDs):</label>
           <input
             type="text"
             name="contacts"
             value={callCampaignData.contacts}
             onChange={handleCallCampaignChange}
             placeholder="Comma-separated IDs"
           />
         </div>

         <div className="form-group">
           <label htmlFor="scheduled_time">Scheduled:</label>
           <input
             type="datetime-local"
             name="scheduled_time"
             value={callCampaignData.scheduled_time}
             onChange={handleCallCampaignChange}
           />
         </div>

         <div className="form-group">
           <label htmlFor="status">Status:</label>
           <select
             name="status"
             value={callCampaignData.status}
             onChange={handleCallCampaignChange}
           >
             <option value="Pending">Pending</option>
             <option value="In Progress">In Progress</option>
             <option value="Completed">Completed</option>
             <option value="Cancelled">Cancelled</option>
           </select>
         </div>

         <div className="form-group">
           <label htmlFor="notes">Notes:</label>
           <textarea
             name="notes"
             value={callCampaignData.notes}
             onChange={handleCallCampaignChange}
             placeholder="Additional notes"
           />
         </div>
         <button className='button'type="submit">Add Call Campaign</button>
       </form>
     </div>
      )}
      </div>
    </>
  );
};

export default AdditionalCampaignFields;
