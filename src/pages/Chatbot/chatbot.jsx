const flowData = {
  nodes: [
    {
      id: 0,
      type: "button",
      body: "Hi user, Welcome to our hospital. How can we help you today?",
    },
    { id: 1, type: "button_element", body: "Book an appointment" },
    { id: 2, type: "button_element", body: "Know Clinic Address" },
    { id: 3, type: "button_element", body: "Learn about us" },
    { id: 4, type: "Input", body: "Please share your appointment date." },
    { id: 5, type: "string", body: "Our Clinic address is" },
    { id: 6, type: "string", body: "about us" },
    { id: 7, type: "Input", body: "What time?" },
    { id: 8, type: "Input", body: "Name of the patient?" },
    { id: 9, type: "button", body: "Great! choose doctor" },
    { id: 10, type: "button_element", body: "Dr. Ira" },
    { id: 11, type: "button_element", body: "Dr. John" },
    { id: 12, type: "string", body: "Congrats, appointment booked." },
    { id: 13, type: "button", body: "Do you want to book an appointment?" },
    { id: 14, type: "button_element", body: "Yes" },
    { id: 15, type: "button_element", body: "No" },
    { id: 16, type: "button_element", body: "Talk to AI" },
    { id: 17, type: "AI", body: "Sure, directing you to AI section." },
    {
      id: 18,
      type: "string",
      body: "Thank you! Have a great day. Please visit again!",
    },
  ],
  adjacencyList: [
    [1, 2, 3],
    [4],
    [5],
    [6],
    [7],
    [13],
    [13],
    [8],
    [9],
    [10, 11],
    [12],
    [12],
    [],
    [14, 15, 16],
    [4],
    [18],
    [17],
    [],
    [],
  ],
};

import React, { useState, useEffect } from "react";
import "./chatbot.css";
import OpenAI from "openai";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api.jsx";
import MailIcon from "@mui/icons-material/Mail";
import SearchIcon from "@mui/icons-material/Search";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import uploadToBlob from "../../azureUpload.jsx";
import Picker from "emoji-picker-react";
import { getdata } from "./chatfirebase";
import axios from "axios";
import Person2Icon from '@mui/icons-material/Person2';
import ChatSidebar from "./ChatSidebar.jsx";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
} from "firebase/firestore";
import { app, db } from "../socialmedia/instagram/firebase.js";
import { onSnapshot } from "firebase/firestore";
import io from "socket.io-client";
import ChatDetailsSidebar from "./ChatDetailsSidebar.jsx";

const socket = io("https://whatsappbotserver.azurewebsites.net/");

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split("/");
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null;
};

const Chatbot = () => {
  const tenantId = getTenantIdFromUrl();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [messageTemplates, setMessageTemplates] = useState({});
  const [messages, setMessages] = useState({});
  const [showSmileys, setShowSmileys] = useState(false);
  const [firebaseContacts, setFirebaseContacts] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [conversation, setConversation] = useState([""]);
  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState("");
  const [isClicked, setIsClicked] = useState(false);

  const fetchContacts = async () => {
    try {
      const response = await axiosInstance.get("/contacts/", {
        headers: {
          token: localStorage.getItem("token"),
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
      console.log("Tenant ID:", tenantId);
      console.log("this is id", contactId);

      const response = await axiosInstance.get(
        `/return-documents/10/${contactId}`
      );
      console.log("GET request successful, response:", response.data);

      const documents = response.data.documents;
      console.log("Documents array:", documents);

      if (documents && documents.length > 0) {
        const profileImage = documents[0].file;
        console.log("Found profile image:", profileImage);
        setProfileImage(profileImage);
      } else {
        console.log("No profile image found.");
        setProfileImage(null); // Set a default image URL or null if no image found
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchProfileImage();
    }
  }, [tenantId]);

  const generateChatbotMessage = async () => {
    try {
      if (!selectedContact) {
        console.error("No contact selected");
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
        messages: [{ role: "system", content: prompt }],
      });

      const messageContent = response.choices[0].message.content.trim();
      setMessageTemplates((prevTemplates) => ({
        ...prevTemplates,
        [selectedContact.id]: messageContent,
      }));
    } catch (error) {
      console.error("Error generating WhatsApp message:", error);
    }
  };

  const handleGenerateMessage = async (e) => {
    e.preventDefault();
    await generateChatbotMessage();
  };


  useEffect(() => {
    if (selectedContact) {
      const fetchMessages = async () => {
        try {
          const response = await axiosInstance.get(`/messages/${selectedContact.id}`, {
            headers: {
              token: localStorage.getItem("token"),
            },
          });
          setMessages({
            ...messages,
            [selectedContact.id]: response.data.messages,
          });
          setConversation(response.data.messages.map((message) => ({
            text: message.body,
            sender: message.sender,
          })));
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
  
      fetchMessages();
    }
  }, [selectedContact]);
  

  const handleUploadedFile = async (event, contactId) => {
    const selectedFile = event.target.files[0];
    console.log("Selected file:", selectedFile);
    console.log("this is contactId", contactId);
    if (selectedFile) {
      setFile(selectedFile);
      console.log("File state set:", selectedFile);

      try {
        console.log("Uploading file to Azure Blob Storage...");
        const fileUrl = await uploadToBlob(selectedFile);
        console.log("File uploaded to Azure, URL:", fileUrl);

        console.log("Sending POST request to backend...");
        const response = await axiosInstance.post("/documents/", {
          name: selectedFile.name,
          document_type: selectedFile.type,
          description: "Your file description",
          file_url: fileUrl,
          entity_type: 10,
          entity_id: contactId,
          tenant: tenantId,
        });
        console.log("POST request successful, response:", response.data);

        setUploadedFiles((prevFiles) => [
          ...prevFiles,
          { name: selectedFile.name, url: fileUrl },
        ]);
        console.log("File uploaded successfully:", response.data);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    } else {
      console.log("No file selected");
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to the server");
    });

    socket.on("latestMessage", (message) => {
      if (message) {
        console.log("Got New Message", message.body);
        setConversation((prevMessages) => [
          ...prevMessages,
          { text: message.body, sender: "bot" },
        ]);
      }
    });

    socket.on("new-message", (message) => {
      if (message) {
        console.log("Got New Message", message);

        setConversation((prevMessages) => [
          ...prevMessages,
          { text: message.message, sender: "user" },
        ]);
      }
    });

    socket.on("node-message", (message) => {
      if (message) {
        console.log("Got New NOde Message", message);

        setConversation((prevMessages) => [
          ...prevMessages,
          { text: message.message, sender: "bot" },
        ]);
      }
    });
    return () => {
      socket.off("latestMessage");
      socket.off("newMessage");
    };
  }, []);
  useEffect(() => {
    // Firestore listener setup

    const unsubscribe = onSnapshot(
      doc(db, "whatsapp", "919643393874"),
      (doc) => {
        fetchConversation();
        console.log("Current data: ", doc.data());
      }
    );

    // Clean up listener when component unmounts
    return () => unsubscribe();
  }, []);
  const handleSend = async () => {
    setMessageTemplates("");
    if (!selectedContact || !messageTemplates[selectedContact.id]) {
      console.error("Message template or contact not selected");
      return;
    }

    const newMessage = { content: messageTemplates[selectedContact.id] };

    try {
      const payload = {
        phoneNumber: selectedContact.phone,
        message: newMessage.content,
      };

      const response = await axiosInstance.post(
        "https://whatsappbotserver.azurewebsites.net/send-message",
        payload // Let Axios handle the JSON conversion
      );

      // Update local state with the new message
      setConversation((prevConversation) => [
        ...prevConversation,
        { text: newMessage.content, sender: "bot" },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredContacts = [...contacts, ...firebaseContacts].filter(
    (contact) => {
      const firstName = contact.first_name?.toLowerCase() || "";
      const lastName = contact.last_name?.toLowerCase() || "";
      const firebaseName = contact.name?.toLowerCase() || "";
      const search = searchText.toLowerCase();
      return firstName.includes(search) || lastName.includes(search);
    }
  );

  const handleContactSelection = async (contact) => {
    setSelectedContact(contact);
  
    try {
      const response = await axiosInstance.get(`/messages/${contact.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setMessages({
        ...messages,
        [contact.id]: response.data.messages,
      });
      setConversation(response.data.messages.map((message) => ({
        text: message.body,
        sender: message.sender,
      })));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  
  const renderMessages = () => {
    if (selectedContact && messages[selectedContact.id]) {
      return messages[selectedContact.id].map((message, index) => (
        <div
          key={index}
          className={message.sender === "user" ? "user-message" : "bot-message"}
        >
          {message.text}
        </div>
      ));
    }
    return null;
  };
  

  const handleToggleSmileys = () => {
    setShowSmileys(!showSmileys);
  };

  const handleSelectSmiley = (emoji) => {
    const newMessageTemplate =
      (messageTemplates[selectedContact?.id] || "") + emoji.emoji + " ";
    setMessageTemplates((prevTemplates) => ({
      ...prevTemplates,
      [selectedContact?.id]: newMessageTemplate,
    }));
  };

  const fetchFlows = async () => {
    try {
      const response = await axiosInstance.get(
        "https://webappbaackend.azurewebsites.net/node-templates/",
        {
          headers: { token: localStorage.getItem("token") },
        }
      );
      setFlows(response.data);
      console.log("this is flow", flows);
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
    const selectedFlowData = flows.find((flow) => flow.id === selectedFlow);
    console.log("this is selected flow", selectedFlowData);
    try {
      await axiosInstance.post(
        "https://whatsappbotserver.azurewebsites.net/flowdata",
        flowData,
        {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      console.log("this is selected flow", selectedFlowData);
      console.log("Flow data sent successfully");
    } catch (error) {
      console.error("Error sending flow data:", error);
    }
  };

  return (
    <div className="chatbot-container">
      <ChatSidebar
        contacts={contacts}
        firebaseContacts={firebaseContacts}
        searchText={searchText}
        setSearchText={setSearchText}
        handleContactSelection={handleContactSelection}
        profileImage={profileImage}
        selectedContact={selectedContact}
      />
      <div className="chatbot-messages-container1">
        {selectedContact && (
          <div className="contact-box">
            <div className="chat-header">
              <div className="chat-header-left">
                <div className="profile-name">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="chatbot-profile-icon"
                    />
                  ) : (
                    <span className="account-circle"><Person2Icon/></span>
                  )}
                </div>
                <div>
                  {selectedContact.first_name} {selectedContact.last_name}
                  {selectedContact.name}
                </div>
              </div>
              <div className="chat-header-right">
                <div className="box-chatbot1">
                  <MailIcon
                    className="header-icon"
                    style={{ width: "20px", height: "20px" }}
                  />
                </div>
                <div className="box-chatbot1">
                  <CallRoundedIcon
                    className="header-icon"
                    style={{ width: "20px", height: "20px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="messages">
          {selectedContact && (
            <div className="conversation-text">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`message ${
                    message.sender === "user" ? "user-message" : "bot-message"
                  }`}
                >
                  {message.text !== "." && message.text}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="chat-input-container">
          <div className="emoji-toggle-container">
            <EmojiEmotionsIcon
              className="header-icon-smiley"
              onClick={handleToggleSmileys}
            />
            {showSmileys && (
              <div className="emoji-picker-container">
                <Picker onEmojiClick={handleSelectSmiley} />
              </div>
            )}
          </div>
          <div className="chatbot-left-icons">
            <EditIcon
              className="header-icon-edit"
              style={{ width: "20px", height: "20px" }}
            />
            <label htmlFor="file-upload">
              <CloudUploadIcon
                className="header-icon-upload"
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
            </label>
            <input
              id="file-upload"
              type="file"
              style={{ display: "none" }}
              onChange={handleUploadedFile}
            />
          </div>
          <div className="chatbot-typing-area">
            <textarea
              id="message"
              name="message"
              value={messageTemplates[selectedContact?.id] || ""}
              onChange={(e) =>
                setMessageTemplates((prevTemplates) => ({
                  ...prevTemplates,
                  [selectedContact?.id]: e.target.value,
                }))
              }
              placeholder="Type a message"
              className="custom-chatbot-typing"
            />
          </div>
          <div className="chatbot-buttons">
            <button
              className="chatbot-generatemsg"
              onClick={handleGenerateMessage}
            >
              Generate Message
            </button>
            <button className="chatbot-sendmsg" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </div>
      <div className="chatbot-contact-section">
        <ChatDetailsSidebar
          selectedContact={selectedContact}
          profileImage={profileImage}
          selectedFlow={selectedFlow}
          handleFlowChange={handleFlowChange}
          handleSendFlowData={handleSendFlowData}
        />
      </div>
    </div>
  );
};

export default Chatbot;
