import React from 'react';


const LinkedInAuthPage = () => {
 


  
  const handleLinkedInAuth = () => {
    window.location.href = 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86fem8trnl7dfl&redirect_uri=http://localhost:5174/ll/linkedinpost&state=foobar&scope=openid%20profile%20email%20w_member_social';
  };

  

  return (
    <div className='LinkedINauth'>
      <h1>LinkedIn Authentication</h1>
      
        <button onClick={handleLinkedInAuth}>Get LinkedIn Auth</button>
    
    </div>
  );
}

export default LinkedInAuthPage;
