import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import TopNavbar from '../TopNavbar/TopNavbar';
import './EmailList.css';
import ComposeButton from "./ComposeButton"
import axios from 'axios';
import RefreshIcon from '@mui/icons-material/Refresh';

function EmailList() {
  const location = useLocation();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const popupRef = useRef(null);
  const { provider, emailUser, emailPass } = location.state || {};



  useEffect(() => {
    console.log("Provider:", provider);
    console.log("Email User:", emailUser);
    console.log("Email Pass:", emailPass);
    fetchEmails();
  }, []);

  

  useEffect(() => {
    fetchEmails();
  }, []);

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
      } else {
        setError('Received invalid data from server');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError(`Failed to fetch emails: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };


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
    const parts = textContent.split(/--[a-fA-F0-9]+/);
    let content = parts.find(part => part.includes('Content-Type: text/html'));

    if (!content) {
      content = parts.find(part => part.includes('Content-Type: text/plain'));
    }

    if (!content) {
      return 'No readable content found';
    }

    content = content.replace(/Content-Type:.*?\r\n/g, '');
    content = content.replace(/Content-Transfer-Encoding:.*?\r\n/g, '');
    content = content.replace(/Content-Disposition:.*?\r\n/g, '');

    content = content.replace(/=\r\n/g, '');
    content = content.replace(/=([a-fA-F0-9]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));

    return content;
  };

  const extractAttachments = (email) => {
    const attachments = [];
    const attachmentRegex = /filename="([^"]+)"[\s\S]*?Content-Transfer-Encoding: base64[\s\S]*?([\w\d+/=]+)\s/g;
    let match;

    while ((match = attachmentRegex.exec(email.text)) !== null) {
      const [, filename, encodedContent] = match;
      attachments.push({ filename, encodedContent });
    }

    return attachments;
  };

  const validateBase64 = (base64) => {
    return base64.replace(/[^A-Za-z0-9+/=]/g, '');
  };

  const base64ToBlob = (base64, type) => {
    try {
      // Remove any non-base64 characters (like newlines) that might be present
      const cleanedBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');
      const byteCharacters = atob(cleanedBase64);
      const byteArrays = [];
  
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
  
      return new Blob(byteArrays, { type });
    } catch (error) {
      console.error('Failed to decode base64 string:', error);
      throw error;
    }
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
      const base64String = attachment.encodedContent.replace(/\s/g, '');
      const blob = base64ToBlob(base64String, `application/${extension}`);
      const url = URL.createObjectURL(blob);
  
      return (
        <div key={attachment.filename} className="attachment">
          <span className="attachment-icon">{icon}</span>
          <a 
            href={url} 
            download={attachment.filename} 
            onClick={(e) => {
              e.preventDefault();
              const link = document.createElement('a');
              link.href = url;
              link.download = attachment.filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
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
          <span>Error decoding {attachment.filename}</span>
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
          <button className="compose-button" onClick={() => setShowComposeModal(true)}>Compose</button>
          <button className="refresh-button" onClick={fetchEmails}><RefreshIcon/></button>
        </div>
        <h1 className="email-header">Inbox</h1>
        {isLoading ? (
          <p>Loading emails...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <table className="email-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {emails.length > 0 ? (
                emails.map((email, index) => (
                  <tr key={index} onClick={() => openEmailPopup(email)} className="email-row">
                    <td>{email.from}</td>
                    <td>{email.subject}</td>
                    <td>{new Date(email.date).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No emails to display</td>
                </tr>
              )}
            </tbody>
          </table>
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