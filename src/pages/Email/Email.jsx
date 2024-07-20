import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './Emailss.css';
import GoDaddyLogo from '../../pages/Email/GoDaddy-Black-Logo.wine.png';
import ZohoLogo from '../../pages/Email/zoho-logo-512.png';
import HostingerLogo from '../../pages/Email/Hostinger.png';
import OutlookLogo from '../../pages/Email/OutlookLogo.png';

const getTenantIdFromUrl = () => {
    const pathArray = window.location.pathname.split('/');
    if (pathArray.length >= 2) {
      return pathArray[1]; // Assumes tenant_id is the first part of the path
    }
    return null; 
};

function Appa() {
    const navigate = useNavigate();
    const location = useLocation();
    const [emailUser, setEmailUser] = useState('');
    const [emailPass, setEmailPass] = useState('');
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const tenantId = getTenantIdFromUrl();
    const [text, setText] = useState('');
    const [message, setMessage] = useState('');
    const [emails, setEmails] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState(location.state?.provider || null);
    const [providerClicked, setProviderClicked] = useState(false);

    const emailProviders = {
        gmail: { host: 'smtp.gmail.com', port: 587 },
        outlook: { host: 'smtp-mail.outlook.com', port: 465 },
        zoho: { host: 'smtp.zoho.com', port: 465 },
        protonmail: { host: 'smtp.protonmail.com', port: 587 },
        yahoo: { host: 'smtp.mail.yahoo.com', port: 587 },
        fastmail: { host: 'smtp.fastmail.com', port: 587 },
        icloud: { host: 'smtp.mail.me.com', port: 587 },
        rackspace: { host: 'smtp.emailsrvr.com', port: 587 },
        bluehost: { host: 'smtp.bluehost.com', port: 587 },
        godaddy: { host: 'smtpout.secureserver.net', port: 465 },
        hostinger: { host: 'smtp.hostinger.com', port: 465 },
    };

    const imapConfig = {
        gmail: { host: 'imap.gmail.com', port: 993 },
        outlook: { host: 'outlook.office365.com', port: 993 },
        zoho: { host: 'imap.zoho.com', port: 993 },
        hostinger: { host: 'imap.hostinger.com', port: 993 },
        // Add more IMAP configurations as needed
    };

    useEffect(() => {
        const storedEmailUser = localStorage.getItem(`${selectedProvider}_emailUser`);
        const storedEmailPass = localStorage.getItem(`${selectedProvider}_emailPass`);

        if (storedEmailUser && storedEmailPass) {
            setEmailUser(storedEmailUser);
            setEmailPass(storedEmailPass);
        }
    }, [selectedProvider]);

    const handleSendEmail = async (e) => {
        e.preventDefault();
        const provider = emailProviders[selectedProvider];
        if (!provider) {
            setMessage('Please select an email provider');
            return;
        }

        try {
            const response = await axios.post('https://emailserver-lake.vercel.app/send-email', {
                smtpUser: emailUser,
                smtpPass: emailPass,
                to,
                subject,
                text,
                host: provider.host,
                port: provider.port,
            });
            console.log('Response:', response);
            setMessage('Email sent successfully');
        } catch (error) {
            setMessage('Error sending email');
            console.log('Error sending email', error);
        }
    };

    const handleReceiveEmails = async (e) => {
        e.preventDefault();
        const provider = imapConfig[selectedProvider];
        if (!provider) {
            setMessage('Please select an email provider');
            return;
        }

        try {
            const response = await axios.post('https://emailserver-lake.vercel.app/receive-emails', {
                imapUser: emailUser,
                imapPass: emailPass,
                host: provider.host,
                port: provider.port,
            });
            console.log('this is email', emailUser);
            console.log('this is password', emailPass);
            setEmails(response.data);
            setMessage('Emails received successfully');
            navigate(`/${tenantId}/email-list`, { state: { emails: response.data } });
        } catch (error) {
            setMessage('Error receiving emails');
        }
    };

    const handleProviderClick = () => {
        setProviderClicked(true);
    };

    const getProviderLogo = (provider) => {
        switch (provider) {
            case 'zoho':
                return ZohoLogo;
            case 'godaddy':
                return GoDaddyLogo;
            case 'hostinger':
                return HostingerLogo;
            case 'outlook':
                return OutlookLogo;
            default:
                return null;
        }
    };

    return (
        <div className="Appa">
            {!providerClicked ? (
                <div className="email-provider">
                   {selectedProvider && (
                        <>
                            <img
                                src={getProviderLogo(selectedProvider)}
                                alt={selectedProvider}
                                width="60"
                                height="50"
                                onClick={handleProviderClick}
                                style={{ cursor: 'pointer', }}
                            />
                            <p style={{ textAlign: 'center', marginTop: '15rem', fontSize: '12px' }}>
                                Click on Image to Send or Receive Emails
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <>
                    <h1>Send Email</h1>
                    <form onSubmit={handleSendEmail}>
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
                </>
            )}
        </div>
    );
}

export default Appa;
