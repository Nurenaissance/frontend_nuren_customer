import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import TopNavbar from '../TopNavbar/TopNavbar';
import './EmailList.css';
import ComposeButton from "./ComposeButton"
import axios from 'axios';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailTracking from './EmailTrackingInfo';
import { Button, FormControlLabel, Switch, Tab, Tabs } from '@mui/material';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import DrawIcon from '@mui/icons-material/Draw';
import OutboxIcon from '@mui/icons-material/Outbox';
import { Card, CardContent, Typography } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import axiosInstance from '../../api';

function EmailList() {
  const location = useLocation();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const popupRef = useRef(null);
  const { provider, emailUser, emailPass,fromContacts } = location.state || {};
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [storedEmails, setStoredEmails] = useState([]);
  const [showTracking, setShowTracking] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [totalMails, setTotalMails] = useState(0);
  const [sentEmails, setSentEmails] = useState([]);
  const [receivedEmails, setReceivedEmails] = useState([]);
  const [sentMails, setSentMails] = useState(0);
  const [openedMails, setOpenedMails] = useState(0);
  const [clickedMails, setClickedMails] = useState(0);
  const cardData = [
    { icon: <EmailIcon />, value: totalMails, label: "Total Mails", color: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)" },
    { icon: <SendIcon />, value: sentMails, label: "Sent Mails", color: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)" },
    { icon: <VisibilityIcon />, value: openedMails, label: "Opened Mails", color: "linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)" },
    { icon: <TouchAppIcon />, value: clickedMails, label: "Clicked Mails", color: "linear-gradient(45deg, #9C27B0 30%, #E1BEE7 90%)" },
  ];
  const tenantId='ll';
  const getNewlySelectedEmails = (selected, stored) => {
    return [...selected].filter(emailId => !stored.includes(emailId));
  };
  
  useEffect(() => {
    if (fromContacts) {
      setShowComposeModal(true);
    }
    console.log(fromContacts);
  }, [fromContacts]);


  const handleCheckboxChange = (emailId) => {
    setSelectedEmails((prevSelected) => {
      const newSelected = new Set(prevSelected);
  
      // Toggle selection
      if (newSelected.has(emailId)) {
        newSelected.delete(emailId); // Deselect if already selected
      } else {
        newSelected.add(emailId); // Select if not selected
      }
  
      // Get newly selected emails
      const newlySelected = getNewlySelectedEmails(newSelected, storedEmails.map(email => email.email_id));
      
      console.log('Newly selected emails:', newlySelected); // Log the newly selected emails
      
      return newSelected; // Return the updated set
    });
  };
    const handleSelectAllChange = () => {
      if (selectedEmails.size === emails.length && emails.length > 0) {
        // If all emails are selected, clear the selection
        setSelectedEmail(new Set());
      } else {
        // If not all emails are selected, add all email IDs to the selection
        const allEmailIds = new Set(emails.map(email => email.id)); // Assuming each email object has a unique 'id'
        setSelectedEmail(allEmailIds);
      }
    };

    const handleTabChange = (event, newValue) => {
      setActiveTab(newValue);
    };
  
  
    
  const fetchEmails = async () => {
    setIsLoading(true);
    setError(null);

    const imapConfig = {
        gmail: { host: 'imap.gmail.com', port: 993 },
        outlook: { host: 'outlook.office365.com', port: 993 },
        zoho: { host: 'imap.zoho.com', port: 993 },
        hostinger: { host: 'imap.hostinger.com', port: 993 },
        godaddy: { host: 'imap.secureserver.net', port: 993 },
    };

    if (!provider) {
        setError('No email provider specified');
        setIsLoading(false);
        return;
    }

    const config = imapConfig[provider.toLowerCase()];

    if (!config) {
        setError(`Invalid email provider: ${provider}`);
        setIsLoading(false);
        return;
    }

    if (!emailUser || !emailPass) {
        setError('Email credentials are missing');
        setIsLoading(false);
        return;
    }

    try {
      const response = await axios.post('https://emailserver-lake.vercel.app/receive-emails', {
        imapUser: emailUser,
        imapPass: emailPass,
        host: config.host,
        port: config.port,
      });
  
      if (response.data && Array.isArray(response.data)) {
        setEmails(response.data);
        return response.data;
      } else {
        throw new Error('Received invalid data from server');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  };

useEffect(() => {
  const savedSelections = JSON.parse(localStorage.getItem('selectedEmails')) || [];
  setSelectedRows(new Set(savedSelections));
  // fetchEmailStats();
}, []);

useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      await fetchEmails();
      const stats = await fetchEmailStats();
      setTotalMails(stats.totalMails);
      setSentMails(stats.sentMails);
      setOpenedMails(stats.openedMails);
      setClickedMails(stats.clickedMails);
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closeEmailPopup();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const openEmailPopup = (email) => {
    setSelectedEmail(email);
  };

  const closeEmailPopup = () => {
    setSelectedEmail(null);
  };

  const extractHumanReadableContent = (textContent) => {
    // Split the email content by unique delimiters
    const parts = textContent.split(/--[a-fA-F0-9]+/);
    
    // Initialize variables to hold extracted content
    let htmlContent = '';
    let plainTextContent = '';

    // Loop through the parts to find HTML and plain text content
    for (let part of parts) {
        if (part.includes('Content-Type: text/html')) {
            htmlContent = part;
        } else if (part.includes('Content-Type: text/plain')) {
            plainTextContent = part;
        }
    }

    // Choose the preferred content to return (HTML > Plain Text)
    let content = htmlContent || plainTextContent;

    if (!content) {
        return {
            combinedContent: 'No readable content found',
        };
    }

    // Clean up the extracted content
    content = content
        .replace(/Content-Type:.*?\r\n/g, '') // Remove Content-Type headers
        .replace(/Content-Transfer-Encoding:.*?\r\n/g, '') // Remove Transfer-Encoding headers
        .replace(/Content-Disposition:.*?\r\n/g, '') // Remove Content-Disposition headers
        .replace(/=\r\n/g, '') // Decode quoted-printable encoding
        .replace(/=([\r\n])/g, '') // Remove line breaks
        .replace(/=([a-fA-F0-9]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))) // Convert hex to characters
        .replace(/[\r\n]+/g, ' ') // Replace multiple newlines with a space
        .trim(); // Trim whitespace

    // Combine the subject and cleaned content
    const combinedContent = `\n\n${content}`;

    return {
        combinedContent,
    };
};



const fetchEmailStats = async () => {
  try {
    const sentResponse = await axiosInstance.get('emails/');
    return {
      totalMails: emails.length,
      sentMails: sentResponse.data.length,
      openedMails: sentResponse.data.filter(email => email.is_open).length,
      clickedMails: sentResponse.data.filter(email => email.links.some(link => link.is_clicked)).length
    };
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

  
  const extractPdfData = (multipartData) => {
    // Split the multipart data into sections
    const parts = multipartData.split('--00000000000018b182061ce07879');
  
    // Find the PDF part
    const pdfPart = parts.find(part => part.includes('Content-Type: application/pdf'));
  
    if (pdfPart) {
      // Extract the base64 data
      const base64Data = pdfPart.split('\r\n\r\n')[1].trim();
      return base64Data;
    } else {
      console.log("PDF part not found.");
      return null;
    }
  };
  useEffect(() => {
    const fetchStoredEmails = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/fetch-all-emails', {
          headers: {
            'X-Tenant-ID': tenantId // Attach the tenant ID in a custom header
          }
        }); 
        const emailData = response.data;
        const storedEmailSet = new Set(emailData.map(email => email.id));
        setStoredEmails(emailData);
        setSelectedEmails(storedEmailSet);
        
      } catch (error) {
        console.error('Error fetching stored emails:', error);
      }
    };

    fetchStoredEmails();
  }, []);
  function extractInnerText(htmlString) {
    // Create a new DOMParser instance
    const parser = new DOMParser();
    // Parse the HTML string into a Document
    const doc = parser.parseFromString(htmlString, 'text/html');
    // Extract and return the inner text
    return doc.body.innerText.trim(); // Use trim() to remove any leading or trailing whitespace
}
function extractMainText(emailContent) {
  // Split the content into lines
  const lines = emailContent.split('\n');

  // Filter lines to find the main text part
  const mainTextLines = lines.filter(line => {
      // Exclude lines that are likely to be part of the header or footer
      return line.trim() !== '' && !line.startsWith('--ZZZ') && !line.startsWith('DISCLAIMER:');
  });

  // Join the filtered lines back into a single string
  const mainText = mainTextLines.join('\n').trim();
  return mainText;
}
  const storeSelectedEmails = async () => {
    // Convert selectedEmails Set to an array
    const selectedEmailIds = Array.from(selectedEmails);
  
    // Get the email IDs that were fetched from the backend
    const fetchedEmailIds = storedEmails.map(email => email.id);
  
    // Filter to get newly selected emails (those not in fetchedEmailIds)
    const newlySelectedEmails = selectedEmailIds.filter(emailId => !fetchedEmailIds.includes(emailId));
  
    // Prepare the selected email list for storage
    const selectedEmailList = newlySelectedEmails.map(emailId => ({
      email_id: emailId,  // Use the emailId directly
      from: 'dummy@example.com',  // Dummy data for from
      subject: 'Dummy Subject',    // Dummy data for subject
      text: 'Dummy text content'    // Dummy data for text
    }));
  
    // First try-catch block for storing selected emails
    try {
      // Store the newly selected emails
      await axios.post('http://127.0.0.1:8000/store-selected-emails/', selectedEmailList, {
        headers: {
          'X-Tenant-ID': tenantId // Attach the tenant ID in a custom header
        }
      });
      console.log('Selected emails stored successfully');
    } catch (error) {
      console.error('Error storing selected emails:', error);
      // Optionally return early or handle the error further if needed
      return; // Exit the function if storing emails fails
    }
  
    // Prepare emails to send
    const emailsToSend = emails
      .filter(email => newlySelectedEmails.includes(email.id)) // Only include newly selected emails
      .map(email => {
        const { combinedContent, subject } = extractHumanReadableContent(email.text);
        const combineContent2=extractInnerText(combinedContent);
        const combineContent3=extractMainText(combineContent2);// Use your existing function
        return {
          sender: email.from,  // Email sender
          content: subject + combineContent3, // Combined content
          sent_at: new Date().toISOString(), // Current date/time in ISO format
          platform: 'email', // Set platform to 'email'
          userid: emailUser, // Adjust this if you have a different user ID
        };
      });
  
    // Second try-catch block for sending email messages
    try {
      // Send a POST request to your Django API to store all email content
      await axios.post('http://127.0.0.1:8000/save-email-messages/', { emails: emailsToSend }, {
        headers: {
          'X-Tenant-ID': tenantId // Attach the tenant ID in a custom header
        }
      });
      console.log('Emails sent successfully');
    } catch (error) {
      console.error('Error sending emails:', error);
    }
  };
  
  // Modify the extractAttachments function to include PDF extraction
  const extractAttachments = (email) => {
    const attachments = [];
    
    // Extract PDF data if available
    const pdfData = extractPdfData(email.text);
    if (pdfData) {
      attachments.push({ filename: 'attachment.pdf', encodedContent: pdfData });
    }
  
    // Original attachment extraction logic remains
    const attachmentRegex = /filename="([^"]+)"[\s\S]*?Content-Transfer-Encoding: base64[\s\S]*?([\w\d+/=]+)\s/g;
    let match;
  
    while ((match = attachmentRegex.exec(email.text)) !== null) {
      const [, filename, encodedContent] = match;
      // Remove newlines and carriage returns from the base64 content
      const cleanedContent = encodedContent.replace(/[\n\r]/g, '');
      attachments.push({ filename, encodedContent: cleanedContent });
    }
  
    return attachments;
  };
 
  
  const renderAttachmentIcon = (attachment) => {
    const extension = attachment.filename.split('.').pop().toLowerCase();
    let icon = '📎'; // Default icon
  
    // Set icon based on file type
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) icon = '🖼️';
    else if (extension === 'pdf') icon = '📄';
    else if (['doc', 'docx'].includes(extension)) icon = '📄';
    else if (['xls', 'xlsx'].includes(extension)) icon = '📊';
  
    try {
      const base64String = attachment.encodedContent;
      const dataUrl = `data:application/${extension};base64,${base64String}`;
  
      return (
        <div key={attachment.filename} className="attachment">
          <span className="attachment-icon">{icon}</span>
          <a 
            href={dataUrl} 
            download={attachment.filename} 
          >
            {attachment.filename}
          </a>
        </div>
      );
    } catch (error) {
      console.error('Error rendering attachment:', error);
      return (
        <div key={attachment.filename} className="attachment attachment-error">
          <span className="attachment-icon">{icon}</span>
          <span>Error rendering {attachment.filename}</span>
        </div>
      );
    }
  };
  return (
    <div className="email-container">
      <div className='email-sidebar-main'>
        <Sidebar/>
      </div>
      <div className="email-content-area">
        <div className="email_topnavbar">
          <TopNavbar/>
        </div>
        <div className="email-actions">
        <Button
            variant="contained"
            color="primary"
            startIcon={<DrawIcon />}
            className="compose-button"
            onClick={() => setShowComposeModal(true)}
          >
            Compose
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            className="refresh-button"
            onClick={fetchEmails}
          >
            Refresh
          </Button>
        </div>
        <div className="email-stats">
  {cardData.map((card, index) => (
    <Card key={index} className="stat-card" style={{ background: card.color }}>
      <CardContent>
        {React.cloneElement(card.icon, { className: "stat-icon" })}
        <Typography variant="h6" style={{ color: 'white' }}>{card.value}</Typography>
        <Typography variant="subtitle1" style={{ color: 'white' }}>{card.label}</Typography>
      </CardContent>
    </Card>
  ))}
</div>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className="email-tabs"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<AllInboxIcon />} label="Inbox" />
          <Tab icon={<OutboxIcon />} label="Sent Mails" />
        </Tabs>
        {isLoading ? (
          <p className="loading-message">Loading emails...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : activeTab === 0 ? (
          <div className="inbox-container">
            <Button
              variant="contained"
              color="secondary"
              className="store-selected-button"
              onClick={storeSelectedEmails}
            >
              Store Selected Emails
            </Button>
          <table className="email-table">
            <thead>
              <tr>
              <th>
  <input
    type="checkbox"
    checked={selectedEmails.size === emails.length && emails.length > 0} // Check if all emails are selected
    onChange={handleSelectAllChange}
  />
</th>
                <th>From</th>
                <th>Subject</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {emails.length > 0 ? (
                emails.map((email, index) => (
                  <tr key={index} className="email-row" >
                    <td>
                    <input
        type="checkbox"
        checked={selectedEmails.has(email.id)}
        onChange={() => handleCheckboxChange(email.id)}
        disabled={storedEmails.map(e => e.email_id).includes(email.id)} // Disable if email is fetched
      />
                    </td>
                    <td onClick={() => openEmailPopup(email)}>{email.from}</td>
                    <td>{email.subject}</td>
                    <td>{new Date(email.date).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No emails to display</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
           ) : (
            <EmailTracking />
        )}
      </div>

      {selectedEmail && (
        <div className="email-popup-overlay">
          <div className="email-popup" ref={popupRef}>
            <button className="close-button" onClick={closeEmailPopup}>&times;</button>
            <h2>{selectedEmail.subject}</h2>
            <div className="email-metadata">
              <p><strong>From:</strong> {selectedEmail.from}</p>
              <p><strong>Date:</strong> {new Date(selectedEmail.date).toLocaleString()}</p>
            </div>
            <div className="email-content">
              <div dangerouslySetInnerHTML={{ __html: extractHumanReadableContent(selectedEmail.text) }} />
            </div>
            {extractAttachments(selectedEmail).length > 0 && (
              <div className="attachments">
                <h3>Attachments</h3>
                <div className="attachment-list">
                  {extractAttachments(selectedEmail).map(renderAttachmentIcon)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showComposeModal && (
        <ComposeButton
          onClose={() => setShowComposeModal(false)}
          emailUser={location.state.emailUser}
          provider={location.state.provider}
          contactemails={location.state.fromContacts}
        />
      )}
    </div>
  );
}

export default EmailList;


// import { useLocation } from 'react-router-dom';
// import { Sidebar } from '../../components/Sidebar';
// import TopNavbar from '../TopNavbar/TopNavbar';
// import './EmailList.css';

// function EmailList() {
//   const location = useLocation();
//   const { emails } = location.state || { emails: [] };
//   const [selectedEmail, setSelectedEmail] = useState(null);
//   const popupRef = useRef(null);


//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (popupRef.current && !popupRef.current.contains(event.target)) {
//         closeEmailPopup();
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);


//   const openEmailPopup = (email) => {
//     setSelectedEmail(email);
//   };

//   const closeEmailPopup = () => {
//     setSelectedEmail(null);
//   };

//   const extractHumanReadableContent = (textContent) => {
//     const parts = textContent.split(/--[a-fA-F0-9]+/);
//     let content = parts.find(part => part.includes('Content-Type: text/html'));

//     if (!content) {
//       content = parts.find(part => part.includes('Content-Type: text/plain'));
//     }

//     if (!content) {
//       return 'No readable content found';
//     }

//     content = content.replace(/Content-Type:.*?\r\n/g, '');
//     content = content.replace(/Content-Transfer-Encoding:.*?\r\n/g, '');
//     content = content.replace(/Content-Disposition:.*?\r\n/g, '');

//     content = content.replace(/=\r\n/g, '');
//     content = content.replace(/=([a-fA-F0-9]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));

//     return content;
//   };

//   const extractAttachments = (email) => {
//     const attachments = [];
//     const attachmentRegex = /filename="([^"]+)"[\s\S]*?Content-Transfer-Encoding: base64[\s\S]*?([\w\d+/=]+)\s/g;
//     let match;

//     while ((match = attachmentRegex.exec(email.text)) !== null) {
//       const [, filename, encodedContent] = match;
//       attachments.push({ filename, encodedContent });
//     }

//     return attachments;
//   };

//   const validateBase64 = (base64) => {
//     return base64.replace(/[^A-Za-z0-9+/=]/g, '');
//   };

//   const base64ToBlob = (base64, type) => {
//     try {
//       const byteCharacters = atob(base64);
//       const byteArrays = [];
  
//       for (let offset = 0; offset < byteCharacters.length; offset += 512) {
//         const slice = byteCharacters.slice(offset, offset + 512);
//         const byteNumbers = new Array(slice.length);
//         for (let i = 0; i < slice.length; i++) {
//           byteNumbers[i] = slice.charCodeAt(i);
//         }
//         const byteArray = new Uint8Array(byteNumbers);
//         byteArrays.push(byteArray);
//       }
  
//       return new Blob(byteArrays, { type });
//     } catch (error) {
//       console.error('Failed to decode base64 string:', error);
//       throw error; // Rethrow the error to handle it in the calling function
//     }
//   };

//   const renderAttachmentIcon = (attachment) => {
//     const extension = attachment.filename.split('.').pop().toLowerCase();
//     let icon;

//     switch (extension) {
//       case 'jpg':
//       case 'jpeg':
//       case 'png':
//       case 'gif':
//         icon = '🖼️'; // Image icon
//         break;
//       case 'pdf':
//         icon = '📄'; // PDF icon
//         break;
//       case 'doc':
//       case 'docx':
//         icon = '📄'; // Word document icon
//         break;
//       case 'xls':
//       case 'xlsx':
//         icon = '📊'; // Excel icon
//         break;
//       default:
//         icon = '📎'; // Generic attachment icon
//         break;
//     }

//     try {
//       if (extension === 'pdf') {
//         const base64String = validateBase64(attachment.encodedContent);
//         const blob = base64ToBlob(base64String, 'application/pdf');
//         const url = URL.createObjectURL(blob);
  
//         return (
//           <div key={attachment.filename} className="attachment">
//             <span className="attachment-icon">{icon}</span>
//             <a href={url} download={attachment.filename} target="_blank" rel="noopener noreferrer">{attachment.filename}</a>
//           </div>
//         );
//       } else {
//         return (
//           <div key={attachment.filename} className="attachment">
//             <span className="attachment-icon">{icon}</span>
//             <span>{attachment.filename}</span>
//           </div>
//         );
//       }
//     } catch (error) {
//       console.error('Error rendering attachment:', error);
//       return (
//         <div key={attachment.filename} className="attachment attachment-error">
//           <span className="attachment-icon">{icon}</span>
//           <span>Error decoding {attachment.filename}</span>
//         </div>
//       );
//     }
//   };

//    return (
//     <div className="email-container">
//       <div className='email-sidebar-main'>
//         <Sidebar/>
//       </div>
//       <div className="email_topnavbar">
//         <TopNavbar/>
//       </div>
//       <h1 className="email-header">Email List</h1>
//       <table className="email-table">
//         <thead>
//           <tr>
//             <th>From</th>
//             <th>Subject</th>
//             <th>Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {emails.map((email, index) => (
//             <tr key={index} onClick={() => openEmailPopup(email)} className="email-row">
//               <td>{email.from}</td>
//               <td>{email.subject}</td>
//               <td>{new Date(email.date).toLocaleString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {selectedEmail && (
//         <div className="email-popup-overlay">
//           <div className="email-popup" ref={popupRef}>
//             <button className="close-button" onClick={closeEmailPopup}>&times;</button>
//             <h2>{selectedEmail.subject}</h2>
//             <div className="email-metadata">
//               <p><strong>From:</strong> {selectedEmail.from}</p>
//               <p><strong>Date:</strong> {new Date(selectedEmail.date).toLocaleString()}</p>
//             </div>
//             <div className="email-content">
//               <div dangerouslySetInnerHTML={{ __html: extractHumanReadableContent(selectedEmail.text) }} />
//             </div>
//             {extractAttachments(selectedEmail).length > 0 && (
//               <div className="attachments">
//                 <h3>Attachments</h3>
//                 <div className="attachment-list">
//                   {extractAttachments(selectedEmail).map(renderAttachmentIcon)}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default EmailList;