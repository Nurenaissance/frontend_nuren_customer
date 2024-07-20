import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Ensure you are using react-router-dom v6 or higher

const InstaAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Parse the fragment identifier (everything after the #)
    const hash = window.location.hash;
    // Remove the # at the beginning of the fragment identifier
    const hashParams = new URLSearchParams(hash.slice(1));
    // Get the access token
    const token = hashParams.get('access_token');

    if (token) {
      // Store the token in local storage
      localStorage.setItem('accessToken', token);
      
      // Get tenantId from local storage
      const storedTenantId = localStorage.getItem("tenant_id");
      const tenantId = storedTenantId ? JSON.parse(storedTenantId) : null;

      if (tenantId) {
        // Redirect to the tenant-specific instapost page
        navigate(`/${tenantId}/instagrampost`);
      } else {
        // Handle the case where tenantId is not found
        console.error("Tenant ID not found in local storage");
        // Optionally, redirect to a default page or show an error message
      }
    } else {
      // No token found, execute handleInstaAuth
      alert('No Token found');
      handleInstaAuth();
    }
  }, [navigate]);
  const handleInstaAuth = () => {
    window.location.href =
      'https://www.facebook.com/v20.0/dialog/oauth?client_id=1546607802575879&redirect_uri=https://crm.nuren.ai/instagramauth/&scope=pages_show_list,instagram_basic&response_type=token';
  };

  return (
    <div className='Instagramauth' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Optionally, you can add some loading text or spinner here */}
      <p>Authenticating...</p>
    </div>
  );
};

export default InstaAuth;
