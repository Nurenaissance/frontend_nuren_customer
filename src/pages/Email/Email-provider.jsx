import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoDaddyLogo from '../../pages/Email/GoDaddy-Black-Logo.wine.png';
import ZohoLogo from '../../pages/Email/zoho-logo-512.png';
import HostingerLogo from '../../pages/Email/Hostinger.png';
import OutlookLogo from '../../pages/Email/OutlookLogo.png';
import GmailLogo from '../../pages/Email/GMail.png';
import './Emailss.css';


const getTenantIdFromUrl = () => {
    const pathArray = window.location.pathname.split('/');
    if (pathArray.length >= 2) {
      return pathArray[1]; // Assumes tenant_id is the first part of the path
    }
    return null; 
  };


const EmailProviders = () => {
    const navigate = useNavigate();
    const tenantId = getTenantIdFromUrl();
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [emailUser, setEmailUser] = useState('');
    const [emailPass, setEmailPass] = useState('');

    const handleGmail = () => {
       navigate(`/${tenantId}/email`)
      };

      const handleProviderSelection = (provider) => {
        setSelectedProvider(provider);
        const storedEmailUser = localStorage.getItem(`${provider}_emailUser`);
        const storedEmailPass = localStorage.getItem(`${provider}_emailPass`);

        if (storedEmailUser && storedEmailPass) {
            navigate(`/${tenantId}/emailss`, { state: { provider } });
        } else {
            setShowModal(true);
        }
    };

    const handleSaveCredentials = () => {
        localStorage.setItem(`${selectedProvider}_emailUser`, emailUser);
        localStorage.setItem(`${selectedProvider}_emailPass`, emailPass);
        setShowModal(false);
        navigate(`/${tenantId}/emailss`, { state: { provider: selectedProvider } });
    };
      
    return (
      <div className="Email-provider-page">
      <h1>Select Email Provider</h1>
      <div className="provider-emailss">
          <img src={GmailLogo} alt="Gmail" onClick={handleGmail} />
          <img src={ZohoLogo} alt="Zoho" onClick={() => handleProviderSelection('zoho')} />
          <img src={GoDaddyLogo} alt="GoDaddy" onClick={() => handleProviderSelection('godaddy')} />
          <img src={HostingerLogo} alt="Hostinger" onClick={() => handleProviderSelection('hostinger')} />
          <img src={OutlookLogo} alt="Outlook" onClick={() => handleProviderSelection('outlook')} />
      </div>

      {showModal && (
          <div className="email-modal">
              <div className="email-modal-content">
                  <h2>Enter Credentials</h2>
                  <div>
                      <label>Email User:</label>
                      <input type="text" value={emailUser} onChange={(e) => setEmailUser(e.target.value)} />
                  </div>
                  <div>
                      <label>Email Pass:</label>
                      <input type="password" value={emailPass} onChange={(e) => setEmailPass(e.target.value)} />
                  </div>
                  <button onClick={handleSaveCredentials}>Save</button>
              </div>
          </div>
      )}
  </div>
);
};

  
  export default EmailProviders;

