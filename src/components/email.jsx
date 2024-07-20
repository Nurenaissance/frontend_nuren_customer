import React, { useState } from 'react';
import axios from 'axios';

function Appa() {
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [imapUser, setImapUser] = useState('');
  const [imapPass, setImapPass] = useState('');
  const [emails, setEmails] = useState([]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/send-email', {
        smtpUser,
        smtpPass,
        to,
        subject,
        text,
        host,
        port,
      });
      setMessage('Email sent successfully');
    } catch (error) {
      setMessage('Error sending email');
    }
  };

  const handleReceiveEmails = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/receive-emails', {
        imapUser,
        imapPass,
        host,
        port,
      });
      setEmails(response.data);
      setMessage('Emails received successfully');
    } catch (error) {
      setMessage('Error receiving emails');
    }
  };

  return (
    <div className="App">
      <h1>Send Email</h1>
      <form onSubmit={handleSendEmail}>
        <div>
          <label>Email:</label>
          <input type="text" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} />
        </div>
        <div>
          <label>To:</label>
          <input type="email" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <label>Subject:</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <label>Text:</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)}></textarea>
        </div>
        <button type="submit">Send Email</button>
      </form>
      {message && <p>{message}</p>}
      
      <h1>Receive Emails</h1>
      <form onSubmit={handleReceiveEmails}>
        <div>
          <label>Email:</label>
          <input type="text" value={imapUser} onChange={(e) => setImapUser(e.target.value)} />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={imapPass} onChange={(e) => setImapPass(e.target.value)} />
        </div>
        <button type="submit">Receive Emails</button>
      </form>
      {message && <p>{message}</p>}
      <div>
        {emails.map((email, index) => (
          <div key={index}>
            <h3>From: {email.from}</h3>
            <p>Subject: {email.subject}</p>
            <p>{email.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Appa;
