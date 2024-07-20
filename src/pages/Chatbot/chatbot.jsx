const flowData = {
  "nodes": [
    { "id": 0, "type": "button", "body": "Hi user, Welcome to our hospital. How can we help you today?" },
    { "id": 1, "type": "button_element", "body": "Book an appointment" },
    { "id": 2, "type": "button_element", "body": "Know Clinic Address" },
    { "id": 3, "type": "button_element", "body": "Learn about us" },
    { "id": 4, "type": "Input", "body": "Please share your appointment date." },
    { "id": 5, "type": "string", "body": "Our Clinic address is" },
    { "id": 6, "type": "string", "body": "about us" },
    { "id": 7, "type": "Input", "body": "What time?" },
    { "id": 8, "type": "Input", "body": "Name of the patient?" },
    { "id": 9, "type": "button", "body": "Great! choose doctor" },
    { "id": 10, "type": "button_element", "body": "Dr. Ira" },
    { "id": 11, "type": "button_element", "body": "Dr. John" },
    { "id": 12, "type": "string", "body": "Congrats, appointment booked." },
    { "id": 13, "type": "button", "body": "Do you want to book an appointment?" },
    { "id": 14, "type": "button_element", "body": "Yes" },
    { "id": 15, "type": "button_element", "body": "No" },
    { "id": 16, "type": "button_element", "body": "Talk to AI" },
    { "id": 17, "type": "Input", "body": "Sure, directing you to AI section." },
    { "id": 18, "type": "string", "body": "Thank you! Have a great day. Please visit again!" }
  ],
  "adjacencyList": [[1, 2, 3], [4], [5], [6], [7], [13], [13], [8], [9], [10, 11], [12], [12], [], [14, 15, 16], [4], [18], [17], [], []]
};

import React, { useState, useEffect } from 'react';
import './chatbot.css';
import OpenAI from "openai";
import { useParams, useNavigate } from "react-router-dom"; 
import axiosInstance from "../../api.jsx";
import MailIcon from '@mui/icons-material/Mail';
import SearchIcon from '@mui/icons-material/Search';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import uploadToBlob from "../../azureUpload.jsx";
import Picker from 'emoji-picker-react';
import ImageEditorComponent from "../../pages/documenteditpage/imageeditor.jsx";
//import {getdata} from './chatfirebase';
import axios from 'axios';
//import { getFirestore, collection, getDocs, doc, addDoc } from 'firebase/firestore';
//import { app, db } from '../socialmedia/instagram/firebase.js';
//import { onSnapshot } from "firebase/firestore";
import io from 'socket.io-client';

const socket = io('https://whatsappbotserver.azurewebsites.net/');


const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; 
};

const Chatbot = () => {
  const tenantId=getTenantIdFromUrl();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [messageTemplates, setMessageTemplates] = useState({});
  const [messages, setMessages] = useState({});
  const [showSmileys, setShowSmileys] = useState(false);
  const [firebaseContacts, setFirebaseContacts] = useState([]);
  const [profileImage, setProfileImage] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [conversation, setConversation] = useState(['']);
  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState('');
  const [previousContact, setPreviousContact] = useState(null);
  const [newMessages, setNewMessages] = useState(['']);
 
  const [showPopup, setShowPopup] = useState(false);


  const openPopup = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  
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
 /* const fetchFirebaseContacts = async () => {
    try {
      const dataMap = new Map();
      await getdata(dataMap);
      // Convert Map to array of objects for easier manipulation
      const extractedContacts = Array.from(dataMap).map(([id, [user_replies, bot_replies, name, phoneNumber]]) => ({
        id,
        user_replies,
        bot_replies,
        name,
        phoneNumber
      }));
      setFirebaseContacts(extractedContacts); 
      console.log(firebaseContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  useEffect(() => {
    fetchFirebaseContacts();
  }, []);*/

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
  /*const fetchConversation = async () => {
    try {
      const response = await axios.get(`https://whatsappbotserver.azurewebsites.net/get-map?phone=919643393874`);
      const { bot_replies, user_replies } = response.data;
      const newConversation = [];
      for (let i = 0; i < bot_replies.length; i++) {
        if (bot_replies[i] !== '.') {
          newConversation.push({ text: bot_replies[i], sender: 'bot' });
        }
        if (user_replies[i] && user_replies[i] !== '.') {
          newConversation.push({ text: user_replies[i], sender: 'user' });
        }
      }
      setConversation(newConversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };*/

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to the server');
    });

    /*socket.on('latestMessage', (message) => {
      if (message) {
        console.log('Got New hahahahahah',message.body);
        setConversation(prevMessages => [...prevMessages, { text: message.body, sender: 'bot' }]);
      }
    });*/
    

    socket.on('new-message', (message) => {
      if (message) {
        console.log('Got New Message', selectedContact.phone);
       
  {
        if (parseInt(message.contactPhone.wa_id) == parseInt(selectedContact.phone)) {
          console.log("hogyaaaaaaaaaaaaaaaaaaaaaaaaaaaa");  
          setConversation(prevMessages => [...prevMessages, { text: message.message, sender: 'user'}]);
          setNewMessages(prevMessages => [...prevMessages, { text: message.message, sender: 'user'}]);
        }
      }}
    });

socket.on('node-message', (message) => {
  if (message) {
    
    console.log('Got New NOde Message',message);
  {
    if (message.contactPhone.wa_id === selectedContact.phone) {
    setConversation(prevMessages => [...prevMessages, { text: message.message, sender: 'bot' }]);
    }}
  }
});
/*
if(previousContact.phone){
sendDataToBackend(previousContact.phone, conversation);}
setConversation(['']);
fetchConversation(selectedContact.phone);*/

    return () => {
      socket.off('node-message');
      socket.off('new-message');
    };
  }, [selectedContact]);
  
    
    /*useEffect(() => {
      // Firestore listener setup
      
      const unsubscribe = onSnapshot(doc(db, "whatsapp", "919643393874"), (doc) => {
        fetchConversation();
        console.log("Current data: ", doc.data());
    });
    

      // Clean up listener when component unmounts
      return () => unsubscribe();
    }, []);*/
 /* useEffect(() => {
    const fetchUploadedFiles = async (contactId) => {
      try {
        const response = await axiosInstance.get(`/documents/?entity_type=10&entity_id=${contactId}`);
        setUploadedFiles(response.data);
        
        
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
      }
    };
    fetchUploadedFiles();
  }, );*/
  const handleSend = async () => {
    setMessageTemplates('');
    if (!selectedContact || !messageTemplates[selectedContact.id]) {
      console.error('Message template or contact not selected');
      return;
    }
  
    const newMessage = { content: messageTemplates[selectedContact.id] };
  
    try {
      const payload = {
        phoneNumber: selectedContact.phone,
        message: newMessage.content,
      };
  
      const response = await axiosInstance.post(
        'https://whatsappbotserver.azurewebsites.net/send-message',
        payload,  // Let Axios handle the JSON conversion
        {/*
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem('token'),
          },
          */
        }
      );
  
      // Update local state with the new message
      setConversation(prevConversation => [
        ...prevConversation,
        { text: newMessage.content, sender: 'bot' }
      ]);
      setNewMessages(prevMessages => [...prevMessages, { text: newMessage.content, sender: 'bot'}]);
      console.log("hry GPT this is a convo",conversation);
  
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  
  
  
  

  const handleMailClick = () => {
    console.log('Mail icon clicked');
    // Add functionality for mail click here
  };

  const handleVoiceClick = () => {
    console.log('Voice icon clicked');
    // Add functionality for voice click here
  };


  const filteredContacts = [
    ...contacts,
    ...firebaseContacts
  ].filter(contact => {
    const firstName = contact.first_name?.toLowerCase() || '';
    const lastName = contact.last_name?.toLowerCase() || '';
   const firebaseName= contact.name?.toLowerCase() || '';
    const search = searchText.toLowerCase();
    return firstName.includes(search) || lastName.includes(search);
  });
  

  const sendDataToBackend = async (contactPhone, conversation) => {
    try {
      const formattedConversation = conversation
        .filter(msg => msg.text && msg.text.trim() !== '') // Ensure text exists and is not empty
        .map(msg => ({
          text: msg.text,
          sender: msg.sender,
        }));
  
      if (formattedConversation.length === 0) return; // No valid messages to send
      // Example POST request using fetch API
      const response = await fetch(`http://127.0.0.1:8000/whatsapp_convo_post/${contactPhone}/?source=whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId
        },
        body: JSON.stringify({
          contact_id: contactPhone,
          conversations: formattedConversation,
          tenant:'ll', // Assuming conversation is the array of messages
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send data to backend');
      }
  
      console.log('Data sent to backend successfully');
  
    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };
  
  // Function to fetch conversation data for a given contact
  const fetchConversation = async (contactPhone) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/whatsapp_convo_get/${contactPhone}/?source=whatsapp`,{
        method: 'GET',
        headers: {
          'X-Tenant-Id': tenantId
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch data from backend');
      }
  
      const data = await response.json();
      setConversation(data); // Update conversation state with fetched data
  
      console.log('Data fetched from backend successfully:', data);
  
    } catch (error) {
      console.error('Error fetching data from backend:', error);
    }
  };
  useEffect(() => {
    if (previousContact) {
      // Save conversation data for the previous contact
      console.log("commentsdsdsd::::::::::::::::::::::::::::::::::::",conversation);
      sendDataToBackend(previousContact.phone, newMessages);
    }
    
    // Clear current conversation
    setConversation(['']);
    setNewMessages(['']);
  
    // Fetch conversation data for the new selected contact
    if(selectedContact){
    fetchConversation(selectedContact.phone);}
    
  }, [selectedContact]);
  const handleContactSelection = async (contact) => {
    if(selectedContact){
    setPreviousContact(selectedContact);}
    console.log("contactthatiamsetting",contact);
    setSelectedContact(contact);
   
   /* if (contact && contact.id) {
      await fetchProfileImage(contact.id);
      if (!messages[contact.id]) {
        setMessages(prevMessages => ({
          ...prevMessages,
          [contact.id]: []
        }));
      }
    } else {
      console.error('Invalid contact:', contact);
    }*/
   // fetchConversation(contact.id);
  };
 /* const handleContactSelection = async (contact) => {
    if (selectedContact) {
      console.log("idhardekjhh",selectedContact.phone);
      // Store data for the previous contact
      await sendDataToBackend(selectedContact.phone, conversation);
      setPreviousContact(selectedContact);
    }
  
    // Set the previous contact to the current selected contact before updating selected contact

  
    // Update the selected contact
    setSelectedContact(contact);
  
    // Fetch profile image and conversation data for the new contact
    
    if (contact && contact.id) {
      await fetchProfileImage(contact.id);
      if (!messages[contact.id]) {
        setMessages(prevMessages => ({
          ...prevMessages,
          [contact.id]: []
        }));
      }
      // Fetch conversation data for the new contact
      //await fetchConversation(contact.phone);
    } else {
      console.error('Invalid contact:', contact);
    }
  }; */

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

  {/*const handleSendFlowData = async () => {
    const flowData = {
      "nodes": [
        { "id": 0, "type": "button", "body": "Hi user, Welcome to our hospital. How can we help you today?" },
        { "id": 1, "type": "button_element", "body": "Book an appointment" },
        { "id": 2, "type": "button_element", "body": "Know Clinic Address" },
        { "id": 3, "type": "button_element", "body": "Learn about us" },
        { "id": 4, "type": "Input", "body": "Please share your appointment date." },
        { "id": 5, "type": "string", "body": "Our Clinic address is" },
        { "id": 6, "type": "string", "body": "about us" },
        { "id": 7, "type": "Input", "body": "What time?" },
        { "id": 8, "type": "Input", "body": "Name of the patient?" },
        { "id": 9, "type": "button", "body": "Great! choose doctor" },
        { "id": 10, "type": "button_element", "body": "Dr. Ira" },
        { "id": 11, "type": "button_element", "body": "Dr. John" },
        { "id": 12, "type": "string", "body": "Congrats, appointment booked." },
        { "id": 13, "type": "button", "body": "Do you want to book an appointment?" },
        { "id": 14, "type": "button_element", "body": "Yes" },
        { "id": 15, "type": "button_element", "body": "No" },
        { "id": 16, "type": "button_element", "body": "Talk to AI" },
        { "id": 17, "type": "AI", "body": "Sure, directing you to AI section." },
        { "id": 18, "type": "string", "body": "Thank you! Have a great day. Please visit again!" }
      ],
      "adjacencyList": [[1, 2, 3], [4], [5], [6], [7], [13], [13], [8], [9], [10, 11], [12], [12], [], [14, 15, 16], [4], [18], [17], [], []]
    };

    try {
      // Send flow data to backend
      await axiosInstance.post('https://whatsappbotserver.azurewebsites.net/flowdata', flowData, {
        headers: {
          token: localStorage.getItem('token'),
        },
      });

      console.log('Flow data sent successfully');
    } catch (error) {
      console.error('Error sending flow data:', error);
    }
  };*/}

    const handleRedirect = () => {
      window.location.href = 'https://www.facebook.com/v18.0/dialog/oauth?client_id=1546607802575879&redirect_uri=https%3A%2F%2Fcrm.nuren.ai%2Fll%2Fchatbot&response_type=code&config_id=1573657073196264&state=pass-through%20value';
    };

    const handleCreateFlow = () => {
      navigate(`/${tenantId}/flow`); // Use navigate instead of history.push
    };
  
    const fetchFlows = async () => {
      try {
        const response = await axiosInstance.get('https://webappbaackend.azurewebsites.net/node-templates/', {
          headers: { token: localStorage.getItem('token') },
        });
        setFlows(response.data);
        console.log('this is flow',flows);
      } catch (error) {
        console.error("Error fetching flows:", error);
      }
    };
  
    useEffect(() => {
      fetchFlows();
    }, []);
  
    const handleFlowChange = (event) => {
      const selectedValue = event.target.value;
      console.log("Selected flow ID:", selectedValue);
      setSelectedFlow(selectedValue);
    };
  
    useEffect(() => {
      console.log("Selected flow has changed:", selectedFlow);
    }, [selectedFlow]);

    const handleSendFlowData = async () => {
      const selectedFlowData = flows.find(flow => flow.id === selectedFlow);
      console.log('this is selected flow', selectedFlowData);
      try {
        await axiosInstance.post('https://whatsappbotserver.azurewebsites.net/flowdata', flowData, {
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem('token'),
          },
        });
        console.log('this is selected flow', selectedFlowData);
        console.log('Flow data sent successfully');
      } catch (error) {
        console.error('Error sending flow data:', error);
      }
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
        <div className="scrollable-contacts">
        <h1 className='chatbot-msg'>All messages</h1>
        {filteredContacts.map(contact => (
          <div
            key={contact.id}
            className="chatbot-contacts"
            onClick={() => handleContactSelection(contact)}
            style={{ cursor: 'pointer', padding: '5px' }}
          > 
            {contact.first_name} {contact.last_name} {contact.name}
          </div>
        ))}
      </div>
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
                {selectedContact.first_name} {selectedContact.last_name}{selectedContact.name}
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
        {selectedContact && (
          <div className="conversation-text">
            {conversation.map((message, index) => (
              <div key={index} className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                {message.text !== '.' && message.text}
              </div>
            ))}
            </div>
          )}
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
      <button className="chatbot-signupbutton" onClick={handleRedirect}>Sign Up</button>
      <div className="content">
      {/* Your existing content here */}
      <button onClick={openPopup} className="open-popup-button">
       Image Editor
      </button>

      {showPopup && (
        <div className="editimage-popup">
          <div className="editimage-popup-overlay" onClick={handlePopupClose}></div>
          <div className="editimage-popup-container">
            <div className="editimage-popup-content">
              <ImageEditorComponent onClose={handlePopupClose}/>
            </div>
            <button onClick={handlePopupClose} className="close-popup-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
        <h1 className='chatbot-details'>Contact Details</h1>
        <div>
          <button onClick={handleCreateFlow}>Create Flow</button>
          <select value={selectedFlow} onChange={handleFlowChange}>
              <option value="" disabled>Select a flow</option>
              {flows.map(flow => (
                <option key={flow.id} value={flow.id}>
                  {flow.name}
                </option>
              ))}
            </select>
            <button onClick={handleSendFlowData}>Send Flow Data</button>
          </div>
        {selectedContact && (
          <div className="chatbot-contact-details">
            <div className="profile-info">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="chatbot-profile-image" />
              ) : (
                <span className="account-circle">Profile Image</span>
              )}
              <div>
                <h2>{selectedContact.first_name} {selectedContact.last_name} {selectedContact.name}</h2>
                
              </div>
              
                <div className="chatbot-contacts-details">
                <p className='chatbot-phone'> <CallRoundedIcon className="header-icon" style={{ width: '20px', height: '20px' }} />{selectedContact.phone}{selectedContact.id}</p>
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