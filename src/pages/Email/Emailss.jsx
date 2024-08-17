import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Emailss.css';
import GoDaddyLogo from '../../pages/Email/GoDaddy-Black-Logo.wine.png';
import ZohoLogo from '../../pages/Email/zoho-logo-512.png';
import HostingerLogo from '../../pages/Email/Hostinger.png';
import OutlookLogo from '../../pages/Email/OutlookLogo.png';
import GmailLogo from '../../pages/Email/GMail.png';


const CLIENT_ID = "667498046930-3df54a3fajc619jhqoumfn6go8cplpcj.apps.googleusercontent.com";
const REDIRECT_URI = 'http://localhost:5174/3/compose'; // Update with your redirect URI
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';



const getTenantIdFromUrl = () => {
    const pathArray = window.location.pathname.split('/');
    return pathArray.length >= 2 ? pathArray[1] : null;
};

function EmailApp() {
    const navigate = useNavigate();
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [showCredentialModal, setShowCredentialModal] = useState(false);
    const [emailUser, setEmailUser] = useState('');
    const [emailPass, setEmailPass] = useState('');
    const tenantId = getTenantIdFromUrl();

    const emailProviders = {
        gmail: { host: 'smtp.gmail.com', port: 465 },
        outlook: { host: 'smtp-mail.outlook.com', port: 465 },
        zoho: { host: 'smtp.zoho.com', port: 465 },
        godaddy: { host: 'smtpout.secureserver.net', port: 465 },
        hostinger: { host: 'smtp.hostinger.com', port: 465 },
    };

    const handleProviderSelection = (provider) => {
        setSelectedProvider(provider);
     //   if (provider === 'gmail') {
     //       handleGmailAuthorization();
     //   } else{
    
        const storedEmailUser = localStorage.getItem(`${provider}_emailUser`);
        const storedEmailPass = localStorage.getItem(`${provider}_emailPass`);
        if (storedEmailUser && storedEmailPass) {
            setEmailUser(storedEmailUser);
            setEmailPass(storedEmailPass);
            navigateToEmailList(provider, storedEmailUser, storedEmailPass);
        } else {
            setShowCredentialModal(true);
        }
    
    };
    const handleGmailAuthorization = () => {
        const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(SCOPES)}&response_type=token&access_type=offline`;
        window.location.href = authUrl;
    };

    const handleSaveCredentials = () => {
        localStorage.setItem(`${selectedProvider}_emailUser`, emailUser);
        localStorage.setItem(`${selectedProvider}_emailPass`, emailPass);
        setShowCredentialModal(false);
        navigateToEmailList(selectedProvider, emailUser, emailPass);
    };

    const navigateToEmailList = (provider, user, pass) => {
        const providerMapping = {
            'google': 'gmail',
            'microsoft': 'outlook',
        };
        const mappedProvider = providerMapping[provider] || provider;

        navigate(`/${tenantId}/email-list`, { 
            state: { 
                provider: mappedProvider,
                emailUser: user,
                emailPass: pass
            } 
        });
    };

    const getProviderLogo = (provider) => {
        switch (provider) {
            case 'gmail': return GmailLogo;
            case 'zoho': return ZohoLogo;
            case 'godaddy': return GoDaddyLogo;
            case 'hostinger': return HostingerLogo;
            case 'outlook': return OutlookLogo;
            default: return null;
        }
    };

    return (
        <div className='emailApp'>
            <div className='emailProvider'>
                <h1>Select Email Provider</h1>
                <div className='providerGrid'>
                    {Object.keys(emailProviders).map((provider) => (
                        <div key={provider} className='providerItem' onClick={() => handleProviderSelection(provider)}>
                            <img
                                src={getProviderLogo(provider)}
                                alt={provider}
                                className='emailProviderLogo'
                            />
                            <span className='providerName'>{provider}</span>
                        </div>
                    ))}
                </div>
            </div>
            {showCredentialModal && (
                <div className="email-modal">
                    <div className="email-modal-content">
                        <h2>Enter Credentials for {selectedProvider}</h2>
                        <div>
                            <label>Email User:</label>
                            <input type="text" value={emailUser} onChange={(e) => setEmailUser(e.target.value)} />
                        </div>
                        <div>
                            <label>Email Pass:</label>
                            <input type="password" value={emailPass} onChange={(e) => setEmailPass(e.target.value)} />
                        </div>
                        <button onClick={handleSaveCredentials}>Save and Login</button>
                        <button onClick={() => setShowCredentialModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}


export default EmailApp;






// import axios from 'axios';
// import { useNavigate, useLocation } from 'react-router-dom';
// import './Emailss.css';
// import GoDaddyLogo from '../../pages/Email/GoDaddy-Black-Logo.wine.png';
// import ZohoLogo from '../../pages/Email/zoho-logo-512.png';
// import HostingerLogo from '../../pages/Email/Hostinger.png';
// import OutlookLogo from '../../pages/Email/OutlookLogo.png';
// import GmailLogo from '../../pages/Email/GMail.png';

// const getTenantIdFromUrl = () => {
//     const pathArray = window.location.pathname.split('/');
//     return pathArray.length >= 2 ? pathArray[1] : null;
// };

// function EmailApp() {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [emailUser, setEmailUser] = useState('');
//     const [emailPass, setEmailPass] = useState('');
//     const [to, setTo] = useState('');
//     const [subject, setSubject] = useState('');
//     const [text, setText] = useState('');
//     const [message, setMessage] = useState('');
//     const [emails, setEmails] = useState([]);
//     const [selectedProvider, setSelectedProvider] = useState(location.state?.provider || null);
//     const [showCredentialModal, setShowCredentialModal] = useState(false);
//     const tenantId = getTenantIdFromUrl();

//     const emailProviders = {
//         gmail: { host: 'smtp.gmail.com', port: 587 },
//         outlook: { host: 'smtp-mail.outlook.com', port: 465 },
//         zoho: { host: 'smtp.zoho.com', port: 465 },
//         godaddy: { host: 'smtpout.secureserver.net', port: 465 },
//         hostinger: { host: 'smtp.hostinger.com', port: 465 },
//     };

//     const imapConfig = {
//         gmail: { host: 'imap.gmail.com', port: 993 },
//         outlook: { host: 'outlook.office365.com', port: 993 },
//         zoho: { host: 'imap.zoho.com', port: 993 },
//         hostinger: { host: 'imap.hostinger.com', port: 993 },
//         godaddy: { host: 'imap.secureserver.net', port: 993 },
//     };

//     useEffect(() => {
//         if (selectedProvider) {
//             const storedEmailUser = localStorage.getItem(`${selectedProvider}_emailUser`);
//             const storedEmailPass = localStorage.getItem(`${selectedProvider}_emailPass`);
//             if (storedEmailUser && storedEmailPass) {
//                 setEmailUser(storedEmailUser);
//                 setEmailPass(storedEmailPass);
//             }
//         }
//     }, [selectedProvider]);

//     const handleProviderSelection = (provider) => {
//         setSelectedProvider(provider);
//         const storedEmailUser = localStorage.getItem(`${provider}_emailUser`);
//         const storedEmailPass = localStorage.getItem(`${provider}_emailPass`);
//         if (storedEmailUser && storedEmailPass) {
//             setEmailUser(storedEmailUser);
//             setEmailPass(storedEmailPass);
//             handleReceiveEmails();
//         } else {
//             setShowCredentialModal(true);
//         }
//     };

//     const handleSaveCredentials = () => {
//         localStorage.setItem(`${selectedProvider}_emailUser`, emailUser);
//         localStorage.setItem(`${selectedProvider}_emailPass`, emailPass);
//         setShowCredentialModal(false);
//     };

//     const handleSendEmail = async (e) => {
//         e.preventDefault();
//         const provider = emailProviders[selectedProvider];
//         if (!provider) {
//             setMessage('Please select an email provider');
//             return;
//         }

//         try {
//             const response = await axios.post('https://emailserver-lake.vercel.app/send-email', {
//                 smtpUser: emailUser,
//                 smtpPass: emailPass,
//                 to,
//                 subject,
//                 text,
//                 host: provider.host,
//                 port: provider.port,
//             });
//             setMessage('Email sent successfully');
//         } catch (error) {
//             setMessage('Error sending email');
//             console.error('Error sending email', error);
//         }
//     };

//     const handleReceiveEmails = async (e) => {
//         e.preventDefault();
//         const provider = imapConfig[selectedProvider];
//         if (!provider) {
//             setMessage('Please select an email provider');
//             return;
//         }

//         try {
//             const response = await axios.post('https://emailserver-lake.vercel.app/receive-emails', {
//                 imapUser: emailUser,
//                 imapPass: emailPass,
//                 host: provider.host,
//                 port: provider.port,
//             });
//             setEmails(response.data);
//             setMessage('Emails received successfully');
//             navigate(`/${tenantId}/email-list`, { state: { emails: response.data } });
//         } catch (error) {
//             setMessage('Error receiving emails');
//             console.error('Error receiving emails', error);
//         }
//     };

//     const getProviderLogo = (provider) => {
//         switch (provider) {
//             case 'gmail': return GmailLogo;
//             case 'zoho': return ZohoLogo;
//             case 'godaddy': return GoDaddyLogo;
//             case 'hostinger': return HostingerLogo;
//             case 'outlook': return OutlookLogo;
//             default: return null;
//         }
//     };

//     return (
//         <div className='emailApp'>
//             {!selectedProvider ? (
//                 <div className='emailProvider'>
//                     <h1>Select Email Provider</h1>
//                     <div className='providerGrid'>
//                         {Object.keys(emailProviders).map((provider) => (
//                             <div key={provider} className='providerItem' onClick={() => handleProviderSelection(provider)}>
//                                 <img
//                                     src={getProviderLogo(provider)}
//                                     alt={provider}
//                                     className='emailProviderLogo'
//                                 />
//                                 <span className='providerName'>{provider}</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             ) : (
//                 <div className='formContainer formContainerActive'>
//                      <div className='emailForm'>
//     <h2>Send Email</h2>
//     <form onSubmit={handleSendEmail}>
//                         <div className='formGroup'>
//                             <label className='label'>To:</label>
//                             <input type="email" value={to} onChange={(e) => setTo(e.target.value)} className='input' />
//                         </div>
//                         <div className='formGroup'>
//                             <label className='label'>Subject:</label>
//                             <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className='input' />
//                         </div>
//                         <div className='formGroup'>
//                             <label className='label'>Text:</label>
//                             <textarea value={text} onChange={(e) => setText(e.target.value)} className='textarea'></textarea>
//                         </div>
//                         <button type="submit" className='button'>Send Email</button>
//                         </form>
//   </div>
//   <div className='emailForm'>
//     <h2>Receive Emails</h2>
//     <form onSubmit={handleReceiveEmails}>
//     </form>
//     <button onClick={handleReceiveEmails} className='button'>Receive Emails</button>
//   </div>
//                     {message && <p className='message'>{message}</p>}
//                 </div>
//             )}
//             {showCredentialModal && (
//                 <div className="email-modal">
//                     <div className="email-modal-content">
//                         <h2>Enter Credentials</h2>
//                         <div>
//                             <label>Email User:</label>
//                             <input type="text" value={emailUser} onChange={(e) => setEmailUser(e.target.value)} />
//                         </div>
//                         <div>
//                             <label>Email Pass:</label>
//                             <input type="password" value={emailPass} onChange={(e) => setEmailPass(e.target.value)} />
//                         </div>
//                         <button onClick={handleSaveCredentials}>Save</button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default EmailApp;

