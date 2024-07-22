import React, { useState, useEffect } from "react";
import './NavbarPopup.css';
import io from 'socket.io-client';

const socket = io('https://whatsappbotserver.azurewebsites.net/');

const NavbarPopup = ({ data, onClose }) => {
    const [show, setShow] = useState(false);
    const [aiAnalysisData, setAiAnalysisData] = useState(null);

    useEffect(() => {
        socket.on('connect', () => {
          console.log('Connected to the server');
        });
    
        socket.on('ai_analysis', (data) => {
          console.log('Received AI Analysis Data:', data);
          setAiAnalysisData(data); // Update state with AI analysis data
          setShow(true); // Show the popup when data is received
        });
    
        // Clean up socket listeners when component unmounts
        return () => {
          socket.off('connect');
          socket.off('ai_analysis');
        };
      }, []); // Empty dependency array ensures the effect runs only once
    
    const handleClose = () => {
        setShow(false); // Hide the popup
        onClose(); // Call the onClose handler passed from parent
    };

    return (
        <div className={`navbar-popup ${show ? 'show' : ''}`}>
            <div className="navbar-popup-content">
                <button className="navbar-popup-close" onClick={handleClose}>x</button>
                <h2>AI Analysis Information</h2>
                <p>{aiAnalysisData || data}</p> {/* Display aiAnalysisData or data prop */}
            </div>
        </div>
    );
};

export default NavbarPopup;
