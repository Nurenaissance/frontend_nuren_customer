import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './LiveChat.css'; // Ensure you create this CSS file


const socket = io('https://hx587qc4-5173.inc1.devtunnels.ms/');
const getTenantIdFromUrl = () => {
    // Example: Extract tenant_id from "/3/home"
    const pathArray = window.location.pathname.split('/');
    if (pathArray.length >= 2) {
      return pathArray[1]; // Assumes tenant_id is the first part of the path
    }
    return null; // Return null if tenant ID is not found or not in the expected place
  };
  const tenantId=getTenantIdFromUrl();

const ChatBox = ({ messages, input, setInput, sendMessage }) => {
    
  return (
    <div style={{width:'100%'}}>
    <div className="chat-box">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${msg.sender === 'bot' ? 'sent' : 'received'}`}
        >
          <pre>{msg.text}</pre>
        </div>
      ))}
    
    </div>
    <div className="input-box" style={{width:'100%'}}>
        <input
          type="text"
          placeholder="Type your message"
          value={input}
          style={{width:'90%'}}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div></div>
  );
};

const LiveChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [recId, setRecId] = useState('');
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentId, setCommentId] = useState('');
  const [showReplies, setShowReplies] = useState({});
  const [mediaId, setMediaId] = useState('');
  const [mediaIds, setMediaIds] = useState([]);
  const [instagramContacts,setInstagramContacts] = useState([]);// Initialize as an empty array
  const [selectedContact, setSelectedContact] = useState(null);
  useEffect(() => {
    const fetchInstagramContacts = async () => {
      try {
        const response = await fetch('https://hx587qc4-5173.inc1.devtunnels.ms/instagram-conversations', {
          method: 'GET',
        
        });

        if (!response.ok) {
          throw new Error('Failed to fetch Instagram contacts');
        }

        const data = await response.json();
        setInstagramContacts(data); // Directly set the fetched data
      
        console.log('Instagram contacts:', data.unique_contact_ids);

      } catch (error) {
        console.error('Error fetching Instagram contacts:', error);
      }
    };

    // Call fetchInstagramContacts when component mounts
    fetchInstagramContacts();

  }, []);
 
  
  // Function to fetch conversation data for a given contact
  const fetchConversation = async (conversationId, accessToken) => {
    try {
      const response = await fetch('https://hx587qc4-5173.inc1.devtunnels.ms/fetch-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId, accessToken })
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch conversation from backend');
      }
  
      const data = await response.json();
      processAndSetMessages(data.data);
  
      console.log('Data fetched from backend successfully:', data);
    } catch (error) {
      console.error('Error fetching conversation from backend:', error);
    }
  };
  
  const processAndSetMessages = (messages) => {
    let transformedMessages = [];
    let recId = null;
  
    transformedMessages = messages.map((message) => {
      const sender = message.from.username === 'nuren_ai' ? 'bot' : 'user';
      recId = sender === 'user' ? message.from.id : recId; // Update recId only if sender is 'user'
  
      return {
        text: message.message,
        sender,
        recId, // Include recId in each message object
      };
    });
  
    // Reverse the order of messages
    transformedMessages.reverse();
  
    // Update state with transformed messages
    setMessages((prevMessages) => [...prevMessages, ...transformedMessages]);
  
    // Set recId state to the last value it was assigned
    setRecId(recId);
  
    console.log("RecId set:", recId); // Verify recId in console
  };
  
  


  const sendMessage = () => {
    if (input && recId) {
      socket.emit('send_message', { rec_id: recId, text: input });
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: input, sender: 'bot' }
      ]);
      setInput('');
    }
  };


  const handleContactClick = (contactId) => {
    // Set selected contact
    fetchConversation(contactId);
    setMessages(['']);
    // Fetch conversation data for selected contact
  };

  return (
    <div className="live-chat">
     
      <div className="main-content" style={{display:'flex'}}>
      <ul>
        {instagramContacts.map(contact => (
          <li key={contact.id} onClick={() => handleContactClick(contact.id)}>
            {contact.name}
          </li>
        ))}
      </ul>
        <div style={{width:'100%'}}>
        <h1>Live Chat</h1>
        <ChatBox
          messages={messages}
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
        />
       
        </div>
      
      </div>
    </div>
  );
};

export default LiveChat;
