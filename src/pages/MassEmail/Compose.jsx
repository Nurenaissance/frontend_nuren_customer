import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ComposeEmailComponent from './ComposeEmail';
import './email.css'
import MassEmailComponent from './MassEmail';

const CLIENT_ID =  "667498046930-3df54a3fajc619jhqoumfn6go8cplpcj.apps.googleusercontent.com"; 
const REDIRECT_URI = 'http://localhost:5174/3/compose'; // Update with your redirect URI
const SCOPES = 'https://www.googleapis.com/auth/gmail.send'; // Scopes required for Gmail API access

const ComposeEmail = () => {
  const [accessToken, setAccessToken] = useState('');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isComposeMode, setIsComposeMode] = useState(true);
  useEffect(() => {
    const parseAccessToken = () => {
      const hash = window.location.hash.substr(1);
      const queryParams = new URLSearchParams(hash);
      const accessToken = queryParams.get('access_token');
      localStorage.setItem("customTokenName", accessToken);

      if (accessToken) {
        setAccessToken(accessToken);
        
      }
    };

    if (window.location.hash) {
      parseAccessToken();
    }
  }, []);

  const handleAuthClick = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(
      SCOPES
    )}&response_type=token`;

    window.location.href = authUrl;
  };

  const handleSendEmail = async () => {
    try {
      const trackingId = uuidv4();
      const trackingPixelUrl = `https://webappbaackend.azurewebsites.net/track_open/${trackingId}/`;
      const emailBodyWithTracker = `${body}<img src="${trackingPixelUrl}" alt="" style="display:none;" />`;

      const response = await axios.post(
        'https://www.googleapis.com/gmail/v1/users/me/messages/send',
        {
          raw: btoa(`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${emailBodyWithTracker}`),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Email sent:', response.data);
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    }
  };
  const toggleMode = () => {
    setIsComposeMode((prevMode) => !prevMode);
  };

  return (
    <div className='oauth-container'>
      {!accessToken ? (
        <button className='authorize-button' onClick={handleAuthClick}>Authorize Google!</button>
      ) : (
        <div>
          
          <button className='mode-toggle' onClick={toggleMode}>{isComposeMode ? 'Switch to Mass Email' : 'Switch to Compose Email'}</button>
          {isComposeMode ? (
            <ComposeEmailComponent
              accessToken={accessToken}
              to={to}
              setTo={setTo}
              subject={subject}
              setSubject={setSubject}
              body={body}
              setBody={setBody}
              handleSendEmail={handleSendEmail}
              
            />
          ) : (
            <MassEmailComponent accessToken={accessToken} />
          )}
        </div>
        
      )}
    </div>
  );
};



export default ComposeEmail;


        