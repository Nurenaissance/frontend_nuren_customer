import React, { useState, useEffect, useRef } from 'react';
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
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; 

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
  const [showBroadcastPopup, setShowBroadcastPopup] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedPhones, setSelectedPhones] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
const [groupName, setGroupName] = useState('');
const [groups, setGroups] = useState([]);
  
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);


  const openPopup = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };


  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to the server');
      fetchAllMessages();
    });
  
    socket.on('new-message', handleNewMessage);
  
    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  

  const renderInteractiveMessage = (parsedMessage) => {
    try {
      const { type, interactive, text } = parsedMessage;
  
      if (type === 'interactive') {
        if (interactive.type === 'list') {
          // Handle list type interactive messages
          return (
            <div className="interactive-message">
              <div className="message-text">{interactive.body.text}</div>
              <div className="message-buttons">
                {interactive.action.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="section">
                    {section.rows.map((row) => (
                      <button key={row.id} className="button_interactive">
                        {row.title}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        } else if (interactive.type === 'button') {
          // Handle button type interactive messages
          return (
            <div className="interactive-message">
              <div className="message-text">{interactive.body.text}</div>
              <div className="message-buttons">
                {interactive.action.buttons.map((button, buttonIndex) => (
                  <button key={buttonIndex} className="button_interactive">
                    {button.reply.title}
                  </button>
                ))}
              </div>
            </div>
          );
        } else if (interactive.type === 'text') {
          // Handle text type interactive messages
          return (
            <div className="interactive-message">
              <div className="message-text">
                {interactive.text.body}
              </div>
            </div>
          );
        }
      } else if (type === 'text') {
        // Handle plain text messages
        return (
          <div className="plain-message">
            {text.body}
          </div>
        );
      }
  
      return <div className="error">Unsupported message type</div>;
    } catch (e) {
      console.error('Error rendering message:', e);
      return <div className="error">Failed to render message</div>;
    }
  };
  
  const fixJsonString = (jsonString) => {
    try {
      // Replace single quotes with double quotes
      let fixedString = jsonString.replace(/'/g, '"');
      // Ensure proper escape sequences
      fixedString = fixedString.replace(/\\"/g, '\\\\"');
      return fixedString;
    } catch (e) {
      console.error('Error fixing JSON string:', e);
      return jsonString; // Return as-is if fixing fails
    }
  };
  const fetchAllMessages = () => {
    socket.emit('get-all-messages', {}, (response) => {
      if (response && response.messages && Array.isArray(response.messages)) {
        const newMessages = response.messages;
        
        setAllMessages(prevMessages => {
          const combinedMessages = [...prevMessages, ...newMessages];
          const uniqueMessages = combinedMessages.filter((message, index, self) =>
            index === self.findIndex((t) => t.id === message.id)
          );
          return uniqueMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });

        const newLastMessageTimes = {};
        const newUnreadCounts = {};
        newMessages.forEach(message => {
          if (message.contactPhone && message.timestamp) {
            newLastMessageTimes[message.contactPhone] = message.timestamp;
            newUnreadCounts[message.contactPhone] = (newUnreadCounts[message.contactPhone] || 0) + 1;
          }
        });

        setLastMessageTimes(prev => ({...prev, ...newLastMessageTimes}));
        setUnreadCounts(prev => ({...prev, ...newUnreadCounts}));

        updateContactsWithNewMessages(newMessages);
      } else {
        console.error('Invalid response format for messages:', response);
      }
    });
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
    socket.on('connect', () => {
      console.log('Connected to the server');
    });
    

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

    return () => {
      socket.off('node-message');
      socket.off('new-message');
    };
  }, [selectedContact]);
  
  
  const handleSend = async () => {
    setMessageTemplates('');
    if (!selectedContact || !messageTemplates[selectedContact.id]) {
      console.error('Message template or contact not selected');
      return;
    }
  
    const newMessage = { content: messageTemplates[selectedContact.id] };
  
    try {
      if (selectedContact.isGroup) {
        // Send message to all group members
        const sendPromises = selectedContact.members.map(memberId => {
          const member = contacts.find(c => c.id === memberId);
          let phoneNumber = member.phone;
  if (phoneNumber.startsWith("91")) {
    phoneNumber = phoneNumber.slice(2); // Remove the first two characters
  }
    
  
          return axiosInstance.post(
            'https://whatsappbotserver.azurewebsites.net/send-message',
            {
              phoneNumbers: [phoneNumber],
              message: newMessage.content,
              business_phone_number_id: "241683569037594",
              messageType: "text",
            }
          );
        });
        await Promise.all(sendPromises);
      } else {
        // Send message to individual contact
        let phoneNumber = selectedContact.phone;
  if (phoneNumber.startsWith("91")) {
    phoneNumber = phoneNumber.slice(2); // Remove the first two characters
  }
        await axiosInstance.post(
          'https://whatsappbotserver.azurewebsites.net/send-message',
          {
            phoneNumbers: [phoneNumber],
            message: newMessage.content,
            business_phone_number_id: "241683569037594",
            messageType: "text",
          }
        );
      }
  
      // Update local state with the new message
      setConversation(prevConversation => [
        ...prevConversation,
        { text: newMessage.content, sender: 'bot' }
      ]);
      setNewMessages(prevMessages => [...prevMessages, { text: newMessage.content, sender: 'bot'}]);
      console.log("Message sent successfully");
    } catch (error) {
      console.error('Error sending message:', error);
    }
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
      const response = await fetch(`https://webappbaackend.azurewebsites.net/whatsapp_convo_post/${contactPhone}/?source=whatsapp`, {
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
  const fetchConversation = async (contactId) => {
    try {
      const response = await fetch(`https://webappbaackend.azurewebsites.net/whatsapp_convo_get/${contactId}/?source=whatsapp`,{
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
      setPreviousContact(selectedContact);
    }
    setSelectedContact({...contact, isGroup: false});
    console.log("contactthatiamsetting",contact);
    setSelectedContact(contact);
   
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


  const renderMessageContent = (messageData) => {
    if (typeof messageData === 'string') {
      try {
        const parsedMessage = JSON.parse(messageData);
        return renderParsedMessage(parsedMessage);
      } catch (error) {
        // If parsing fails, it's likely a plain text message
        return messageData;
      }
    } else if (typeof messageData === 'object') {
      return renderParsedMessage(messageData);
    } else {
      return String(messageData); // Convert to string if it's neither object nor string
    }
  };

  const renderParsedMessage = (parsedMessage) => {
    switch (parsedMessage.type) {
      case 'text':
        return parsedMessage.text.body;
      case 'interactive':
        switch (parsedMessage.interactive.type) {
          case 'button':
            return (
              <div>
                <p>{parsedMessage.interactive.body.text}</p>
                <div className="button-container">
                  {parsedMessage.interactive.action.buttons.map((button, index) => (
                    <button key={index} onClick={() => handleButtonClick(button.reply.id)}>
                      {button.reply.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          case 'list':
            return (
              <div>
                <p>{parsedMessage.interactive.body.text}</p>
                <button onClick={() => handleListButtonClick(parsedMessage.interactive.action.button)}>
                  {parsedMessage.interactive.action.button}
                </button>
                {parsedMessage.interactive.action.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <h4>{section.title}</h4>
                    <ul>
                      {section.rows.map((row) => (
                        <li key={row.id} onClick={() => handleListItemClick(row.id, row.title)}>
                          {row.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            );
          default:
            return JSON.stringify(parsedMessage);
        }
      default:
        return JSON.stringify(parsedMessage);
    }
  };

  const handleButtonClick = (id) => {
    console.log(`Button clicked with id: ${id}`);
    // Here you can add logic to handle the button click
  };

  const handleListButtonClick = (buttonText) => {
    console.log(`List button clicked: ${buttonText}`);
    // Here you can add logic to handle the list button click
  };

  const handleListItemClick = (id, title) => {
    console.log(`List item clicked: ${id} - ${title}`);
    // Here you can add logic to handle the list item click
  };
  

    const handleRedirect = () => {
      window.location.href = 'https://www.facebook.com/v18.0/dialog/oauth?client_id=1546607802575879&redirect_uri=https%3A%2F%2Fcrm.nuren.ai%2Fchatbotredirect&response_type=code&config_id=1573657073196264&state=pass-through%20value';
    };

    const handleCreateFlow = () => {
      navigate(`/${tenantId}/flow`); // Use navigate instead of history.push
    };
  
    const fetchFlows = async () => {
      try {
        const response = await axiosInstance.get('https://webappbaackend.azurewebsites.net/node-templates/', {
          headers: { token: localStorage.getItem('token') },
        });
        // Ensure each flow has an id property
        const flowsWithIds = response.data.map(flow => ({
          ...flow,
          id: flow.id.toString() // Ensure id is a string for consistency
        }));
        setFlows(flowsWithIds);
        console.log('Fetched flows:', flowsWithIds);
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
      const selectedFlowData = flows.find(flow => flow.id === selectedValue);
      console.log("Selected flow data:", selectedFlowData);
    };
  
    useEffect(() => {
      console.log("Selected flow has changed:", selectedFlow);
    }, [selectedFlow]);
    const [isSending, setIsSending] = useState(false);

    const handleSendFlowData = async () => {
      if (!selectedFlow) {
        console.error('No flow selected');
        return;
      }
    
      const selectedFlowData = flows.find(flow => flow.id === selectedFlow);
      if (!selectedFlowData) {
        console.error('Selected flow data not found');
        console.log('Current flows:', flows);
        console.log('Selected flow ID:', selectedFlow);
        return;
      }
    
      try {
        setIsSending(true);
        const dataToSend = {
          ...selectedFlowData,
          accountID: accountID,
          access_token:'EAAVZBobCt7AcBO8trGDsP8t4bTe2mRA7sNdZCQ346G9ZANwsi4CVdKM5MwYwaPlirOHAcpDQ63LoHxPfx81tN9h2SUIHc1LUeEByCzS8eQGH2J7wwe9tqAxZAdwr4SxkXGku2l7imqWY16qemnlOBrjYH3dMjN4gamsTikIROudOL3ScvBzwkuShhth0rR9P',
          firstInsert:'8',
          business_phone_number_id:'241683569037594'
        };
        console.log('Sending flow data:', dataToSend);
        const response = await axiosInstance.post('https://whatsappbotserver.azurewebsites.net/insert_data/', dataToSend, {
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem('token'),
          },
        });
        console.log('Flow data sent successfully:', response.data);
        if (response.status === 200) {
          // Add user feedback here (e.g., success message)
          console.log('Flow data sent successfully');
        }
      } catch (error) {
        console.error('Error sending flow data:', error);
        // Add user feedback here (e.g., error message)
      } finally {
        setIsSending(false);
      }
    };
    useEffect(() => {
      return () => {
        // This cleanup function will run when the component unmounts
        setIsSending(false);
        const savedGroups = JSON.parse(localStorage.getItem('broadcastGroups') || '[]');
        setGroups(savedGroups);
      };
    }, []);
    const handleBroadcastMessage = () => {
      setShowBroadcastPopup(true);
    };

    const handleCloseBroadcastPopup = () => {
      setShowBroadcastPopup(false);
      setBroadcastMessage('');
      setSelectedPhones([]);
      setGroupName('');
      setIsSendingBroadcast(false);
    };

    const handleGroupSelection = (group) => {
      console.log("Selected group:", group);
      setSelectedContact({
        id: group.id,
        phone: `Group: ${group.name}`,
        first_name: group.name,
        last_name: '',
        isGroup: true,
        members: group.members
      });
      
      // Fetch or set the group conversation
      const groupConversation = [
        { text: "Welcome to the group!", sender: 'bot' },
        { text: "Last broadcast message: " + broadcastMessage, sender: 'bot' }
      ];
      setConversation(groupConversation);
    };
    
   
    const handleSendBroadcast = async () => {
      if (selectedPhones.length === 0 || !broadcastMessage.trim()) {
        alert("Please select at least one contact and enter a message.");
        return;
      }
    
      setIsSendingBroadcast(true);
    
      try {
        // Create a new group and save it to local storage
        const newGroup = {
          id: uuidv4(),
          name: groupName || `Broadcast Group ${new Date().toISOString()}`,
          members: selectedPhones
        };
        saveGroupToLocalStorage(newGroup);
    
        // Prepare the data in the specified format
        const phoneNumbers = selectedPhones.map(contactId => {
          const contact = contacts.find(c => c.id === contactId);
          return parseInt(contact.phone); // Ensure the phone number is an integer
        });
    
        const payload = {
          phoneNumbers: phoneNumbers,
          message: broadcastMessage,
           business_phone_number_id: "241683569037594",
           messageType: "text",
        };
    
        // Send the broadcast message
        const response = await axiosInstance.post('https://whatsappbotserver.azurewebsites.net/send-message/', payload);
    
        if (response.status === 200) {
          console.log("Broadcast sent successfully");
          alert("Broadcast message sent successfully!");
          handleCloseBroadcastPopup();
        } else {
          throw new Error("Failed to send broadcast");
        }

        const broadcastMessageObj = { text: broadcastMessage, sender: 'bot' };
        setGroups(prevGroups => prevGroups.map(group => ({
          ...group,
          conversation: [...(group.conversation || []), broadcastMessageObj]
        })));
    
        // If the current selected contact is a group, update the conversation
        if (selectedContact && selectedContact.isGroup) {
          setConversation(prevConversation => [...prevConversation, broadcastMessageObj]);
        }

      } catch (error) {
        console.error("Error sending broadcast:", error);
        alert("Failed to send broadcast message. Please try again.");
      } finally {
        setIsSendingBroadcast(false);
      }
    };


const handlePhoneSelection = (contactId) => {
  setSelectedPhones(prevSelected => 
    prevSelected.includes(contactId)
      ? prevSelected.filter(id => id !== contactId)
      : [...prevSelected, contactId]
  );
};

const saveGroupToLocalStorage = (group) => {
  const existingGroups = JSON.parse(localStorage.getItem('broadcastGroups') || '[]');
  const updatedGroups = [...existingGroups, group];
  localStorage.setItem('broadcastGroups', JSON.stringify(updatedGroups));
};


 return (
    <div className="cb-container">
      <div className="cb-sidebar">
        <h1 className='cb-sidebar-title'>Contacts</h1>
        <div className='cb-search-container'>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchText}
            className='cb-search-input'
            onChange={(e) => setSearchText(e.target.value)}
          />
          <SearchIcon className="cb-search-icon" />
        </div>
        <div className="cb-contact-list">
          <h2 className='cb-group-title'>Groups</h2>
          {groups.map(group => (
            <div
              key={group.id}
              className="cb-group-item"
              onClick={() => handleGroupSelection(group)}
            >
              {group.name} ({group.members.length})
            </div>
          ))}
          <h2 className='cb-contact-title'>Contacts</h2>
          {filteredContacts.map(contact => (
  <div
    key={contact.id}
    className={`cb-contact-item ${selectedContact?.id === contact.id ? 'cb-selected' : ''}`}
    onClick={() => handleContactSelection(contact)}
  >
    <div className="cb-contact-info">
      <span className="cb-contact-name">{contact.first_name} {contact.last_name}</span>
      <span className="cb-contact-phone">{contact.phone}</span>
    </div>
  </div>
))}
        </div>
      </div>
      <div className="cb-main">
      {selectedContact && (
  <div className="cb-chat-header">
    <div className="cb-chat-contact-info">
      {profileImage ? (
        <img src={profileImage} alt="Profile" className="cb-profile-icon" />
      ) : (
        <span className="cb-default-avatar">{selectedContact.first_name && selectedContact.first_name[0]}</span>
      )}
      <div className="cb-contact-details">
        <span className="cb-contact-name">{selectedContact.first_name} {selectedContact.last_name}</span>
        <span className="cb-contact-phone">{selectedContact.phone}</span>
      </div>
    </div>
  </div>
)}
       <div className="cb-message-container">
      {conversation.map((message, index) => (
        <div
          key={index}
          className={`cb-message ${message.sender === 'user' ? 'cb-user-message' : 'cb-bot-message'}`}
        >
          {(() => {
            if (typeof message.text === 'string') {
              if (message.text.trim().startsWith('{') || message.text.trim().startsWith('[')) {
                try {
                  const fixedMessage = fixJsonString(message.text);
                  const parsedMessage = JSON.parse(fixedMessage);
                  console.log('Parsed Message:', parsedMessage); // Debugging line
                  return renderInteractiveMessage(parsedMessage);
                } catch (e) {
                  console.error('Failed to parse JSON message:', e);
                  return <div className="error">Failed to parse message</div>;
                }
              }
              return message.text || <div className="error">Message content is undefined</div>;
            }
            return <div className="error">Invalid message format</div>;
          })()}
        </div>
      ))}
    </div>
        <div className="cb-input-container">
          <div className="cb-emoji-container">
            <EmojiEmotionsIcon className="cb-emoji-icon" onClick={handleToggleSmileys} />
            {showSmileys && (
              <div className="cb-emoji-picker">
                <Picker onEmojiClick={handleSelectSmiley} />
              </div>
            )}
          </div>
          <div className="cb-input-actions">
            <label htmlFor="file-upload">
              <CloudUploadIcon className="cb-action-icon" />
            </label>
            <input
              id="file-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleUploadedFile}
            />
          </div>
          <textarea
  value={selectedContact && messageTemplates[selectedContact.id] || ''}
  onChange={(e) => {
    if (selectedContact) {
      setMessageTemplates(prevTemplates => ({
        ...prevTemplates,
        [selectedContact.id]: e.target.value
      }));
    }
  }}
  placeholder="Type a message"
  className="cb-input-field"
/>
          <div className="cb-send-actions">
            <button className="cb-generate-btn" onClick={handleGenerateMessage}>Generate</button>
            <button className='cb-send-btn' onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
      <div className="cb-details-panel">
        <div className="cb-img-pop">
      <button className="cb-signup-btn" onClick={handleRedirect}>Sign Up</button>
      <button onClick={openPopup} className="open-popup-button-cb">
       Image Editor
       </button>
       </div>
       {showPopup && (
  <div className="cb-image-editor-popup">
    <div className="cb-image-editor-overlay" onClick={handlePopupClose}></div>
    <div className="cb-image-editor-container">
      <div className="cb-image-editor-content">
        <ImageEditorComponent onClose={handlePopupClose}/>
      </div>
      <button onClick={handlePopupClose} className="cb-close-popup-btn">
        Close
      </button>
    </div>
  </div>
)}
        <h1 className='cb-details-title'>Contact Details</h1>
        {selectedContact && (
  <div className="cb-contact-full-details">
    <div className="cb-profile-section">
      {profileImage ? (
        <img src={profileImage} alt="Profile" className="cb-profile-image" />
      ) : (
        <span className="cb-default-avatar-large">{selectedContact.first_name && selectedContact.first_name[0]}</span>
      )}
      <h2>{selectedContact.first_name} {selectedContact.last_name}</h2>
    </div>
    <div className="cb-contact-info-details">
      <p className='cb-info-item'>
        <CallRoundedIcon className="cb-info-icon" />
        {selectedContact.phone}
      </p>
      <p className='cb-info-item'>
        <MailIcon className="cb-info-icon" />
        {selectedContact.email}
      </p>
    </div>
  </div>
)}
        <div className="cb-actions">
          <button onClick={handleCreateFlow} className="cb-action-btn">Create Flow</button>
          <select value={selectedFlow} onChange={handleFlowChange} className="cb-flow-select">
            <option value="" disabled>Select a flow</option>
            {flows.map(flow => (
              <option key={flow.id} value={flow.id}>
                {flow.name || flow.id}
              </option>
            ))}
          </select>
          <button 
            onClick={handleSendFlowData} 
            className="cb-flow-btn"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send Flow Data"}
          </button>
          <button 
            onClick={handleBroadcastMessage} 
            className="cb-broadcast-btn"
          >
            Broadcast Message
          </button>
        </div>
      </div>
      {showBroadcastPopup && (
        <div className="cb-broadcast-popup">
          <div className="cb-broadcast-content">
            <h2>Broadcast Message</h2>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name (optional)"
              className="cb-group-name-input"
            />
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Type your broadcast message here..."
              className="cb-broadcast-message-input"
            />
            <div className="cb-broadcast-contact-list">
              <h3>Select Contacts:</h3>
              {contacts.map(contact => (
                <div key={contact.id} className="cb-broadcast-contact-item">
                  <input
                    type="checkbox"
                    id={`contact-${contact.id}`}
                    checked={selectedPhones.includes(contact.id)}
                    onChange={() => handlePhoneSelection(contact.id)}
                  />
                  <label htmlFor={`contact-${contact.id}`}>
                    {contact.first_name} {contact.last_name} ({contact.phone})
                  </label>
                </div>
              ))}
            </div>
            <div className="cb-broadcast-actions">
              <button 
                onClick={handleSendBroadcast} 
                disabled={isSendingBroadcast || selectedPhones.length === 0 || !broadcastMessage.trim()}
                className="cb-send-broadcast-btn"
              >
                {isSendingBroadcast ? "Sending..." : "Send Broadcast"}
              </button>
              <button onClick={handleCloseBroadcastPopup} className="cb-cancel-broadcast-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
