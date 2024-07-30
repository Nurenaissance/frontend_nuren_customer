import React, { useState, useEffect } from 'react';
import './chatbot.css';
import OpenAI from "openai";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api.jsx";
import MailIcon from '@mui/icons-material/Mail';
import SearchIcon from '@mui/icons-material/Search';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import uploadToBlob from "../../azureUpload.jsx";
import Picker from 'emoji-picker-react';

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; 
};

const Chatbot = () => {
  const tenantId=getTenantIdFromUrl();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [messageTemplates, setMessageTemplates] = useState({});
  const [messages, setMessages] = useState({});
  const [showSmileys, setShowSmileys] = useState(false);
  const [profileImage, setProfileImage] = useState(null); 
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

 

  
  const fetchContacts = async () => {
    try {
      const response = await axiosInstance.get('/contacts/', {
        headers: {
          token: localStorage.getItem('token'),
        },
      });
      setContacts(response.data);
     
    } catch (error) {
      console.error("Error fetching contacts data:", error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchProfileImage = async (contactId) => {
    try {
        
        console.log('Tenant ID:', tenantId);
        console.log("this is id", contactId);

        const response = await axiosInstance.get(`/return-documents/10/${contactId}`);
        console.log('GET request successful, response:', response.data);

        const documents = response.data.documents;
        console.log('Documents array:', documents);

        if (documents && documents.length > 0) {
            const profileImage = documents[0].file;
            console.log('Found profile image:', profileImage);
            setProfileImage(profileImage);
        } else {
            console.log('No profile image found.');
            setProfileImage(null); // Set a default image URL or null if no image found
        }
    } catch (error) {
        console.error('Error fetching profile image:', error);
    }
};

  useEffect(() => {
    if ( tenantId) {
        fetchProfileImage();
    }
}, [ tenantId]);

  const generateChatbotMessage = async () => {
    try {
      if (!selectedContact) {
        console.error('No contact selected');
        return;
      }
  
      const name = `${selectedContact.first_name} ${selectedContact.last_name}`;
      const prompts = [
        `Hey ${name}! 😊 Thinking Python for AI. Simple and powerful. What do you think, ${name}?`,
        `Hi ${name}! 😄 Python's great for AI. Let's make something cool!`,
      ];
  
      const randomIndex = Math.floor(Math.random() * prompts.length);
      const prompt = prompts[randomIndex];
  
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: prompt },
        ],
      });
  
      const messageContent = response.choices[0].message.content.trim();
      setMessageTemplates(prevTemplates => ({
        ...prevTemplates,
        [selectedContact.id]: messageContent
      }));
    } catch (error) {
      console.error('Error generating WhatsApp message:', error);
    }
  };

  const handleGenerateMessage = async (e) => {
    e.preventDefault();
    await generateChatbotMessage();
  };

  const handleUploadedFile = async (event, contactId) => {
    const selectedFile = event.target.files[0];
    console.log('Selected file:', selectedFile);
    console.log('this is contactId',contactId);
    if (selectedFile) {
      setFile(selectedFile);
      console.log('File state set:', selectedFile);

      try {
        console.log('Uploading file to Azure Blob Storage...');
        const fileUrl = await uploadToBlob(selectedFile);
        console.log('File uploaded to Azure, URL:', fileUrl);

        console.log('Sending POST request to backend...');
        const response = await axiosInstance.post('/documents/', {
          name: selectedFile.name,
          document_type: selectedFile.type,
          description: 'Your file description',
          file_url: fileUrl,
          entity_type: 10,
          entity_id: contactId,
          tenant: tenantId,
        });
        console.log('POST request successful, response:', response.data);

        setUploadedFiles(prevFiles => [...prevFiles, { name: selectedFile.name, url: fileUrl }]);
        console.log('File uploaded successfully:', response.data);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      console.log('No file selected');
    }
  };

  useEffect(() => {
    const fetchUploadedFiles = async (contactId) => {
      try {
        const response = await axiosInstance.get(`/documents/?entity_type=10&entity_id=${contactId}`);
        setUploadedFiles(response.data);
        
        
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
      }
    };
    fetchUploadedFiles();
  }, );
  const handleSend = () => {
    if (!messageTemplates[selectedContact.id] || !selectedContact) {
      console.error('Message template or contact not selected');
      return;
    }
  
    const newMessage = { sender: 'user', content: messageTemplates[selectedContact.id] };
    setMessages(prevMessages => ({
      ...prevMessages,
      [selectedContact.id]: [...(prevMessages[selectedContact.id] || []), newMessage]
    }));
  
    // Clear the message template after sending
    setMessageTemplates(prevTemplates => ({
      ...prevTemplates,
      [selectedContact.id]: ''  // Clear the message template for the selected contact
    }));
  
    console.log('Sending message to', selectedContact.first_name, ':', messageTemplates[selectedContact.id]);
  };
  

  const handleMailClick = () => {
    console.log('Mail icon clicked');
    // Add functionality for mail click here
  };

  const handleVoiceClick = () => {
    console.log('Voice icon clicked');
    // Add functionality for voice click here
  };

  const handleSearchClick = () => {
    console.log('Search icon clicked');
    // Add functionality for search click here
  };

  const filteredContacts = contacts.filter(contact =>
    contact.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
    contact.last_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleContactSelection = async (contact) => {
    setSelectedContact(contact);
    if (contact && contact.id) {
      await fetchProfileImage(contact.id);
      if (!messages[contact.id]) {
        setMessages(prevMessages => ({
          ...prevMessages,
          [contact.id]: []
        }));
      }
    } else {
      console.error('Invalid contact:', contact);
    }
  };

  const handleToggleSmileys = () => {
    setShowSmileys(!showSmileys);
  };

  const handleSelectSmiley = (emoji) => {
    const newMessageTemplate = (messageTemplates[selectedContact?.id] || '') + emoji.emoji + ' ';
    setMessageTemplates(prevTemplates => ({
      ...prevTemplates,
      [selectedContact?.id]: newMessageTemplate
    }));
  };
  
  

  return (
    <div className="chatbot-container">
      <div className="chatbot-chat-header">
        <h1 className='chatbot-contact'>Contact</h1>
        <div className='chatbot-contain'>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchText}
            className='chatbot-search'
            onChange={(e) => setSearchText(e.target.value)}
          />
          <SearchIcon className="search-icon" style={{ width: '20px', height: '24px' }} />
        </div>
        <h1 className='chatbot-msg'>All messages</h1>
        {filteredContacts.map(contact => (
          <div
            key={contact.id}
            className="chatbot-contacts"
            onClick={() => handleContactSelection(contact)}
            style={{ cursor: 'pointer', padding: '5px' }}
          > 
            {contact.first_name} {contact.last_name}
          </div>
        ))}
      </div>
      <div className="chatbot-messages-container1">
        {selectedContact && (
          <div className="contact-box">
            <div className="chat-header">
              <div className="chat-header-left">
                <div>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="chatbot-profile-icon" />
              ):(
                <span className="account-circle">Profile Image</span>
              )}
              </div>
              <div>
                {selectedContact.first_name} {selectedContact.last_name}
                </div>
              </div>
              <div className="chat-header-right">
                <div className='box-chatbot1'>
                  <MailIcon className="header-icon" style={{ width: '20px', height: '20px' }} />
                </div>
                <div className='box-chatbot1'>
                  <CallRoundedIcon className="header-icon" style={{ width: '20px', height: '20px' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="messages">
          {messages[selectedContact?.id]?.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {message.content}
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <div className="emoji-toggle-container">
            <EmojiEmotionsIcon className="header-icon-smiley" onClick={handleToggleSmileys} />
            {showSmileys && (
              <div className="emoji-picker-container">
                <Picker onEmojiClick={handleSelectSmiley} />
              </div>
            )}
          </div>
          <div className="chatbot-left-icons">
            <EditIcon className="header-icon-edit" style={{ width: '20px', height: '20px' }} />
            <label htmlFor="file-upload">
            <CloudUploadIcon className="header-icon-upload" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
          </label>
          <input
            id="file-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={handleUploadedFile}
          />
          </div>
          <div className="chatbot-typing-area">
          <textarea
            id="message"
            name="message"
            value={messageTemplates[selectedContact?.id] || ''}
            onChange={(e) => setMessageTemplates(prevTemplates => ({
              ...prevTemplates,
              [selectedContact?.id]: e.target.value
            }))}
            placeholder="Type a message"
            className="custom-chatbot-typing"
          />
          </div>
          <div className="chatbot-buttons">
            <button className="chatbot-generatemsg" onClick={handleGenerateMessage}>Generate Message</button>
            <button className='chatbot-sendmsg' onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
      <div className="chatbot-contact-section">
        <h1 className='chatbot-details'>Contact Details</h1>
        {selectedContact && (
          <div className="chatbot-contact-details">
            <div className="profile-info">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="chatbot-profile-image" />
              ) : (
                <span className="account-circle">Profile Image</span>
              )}
              <div>
                <h2>{selectedContact.first_name} {selectedContact.last_name}</h2>
                
              </div>
                <div className="chatbot-contacts-details">
                <p className='chatbot-phone'> <CallRoundedIcon className="header-icon" style={{ width: '20px', height: '20px' }} />{selectedContact.phone}</p>
                <p className='chatbot-mail'><MailIcon className="header-icon" style={{ width: '20px', height: '20px' }} />{selectedContact.email}</p>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;