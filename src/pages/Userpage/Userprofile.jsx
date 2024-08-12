import React, { useState, useEffect } from "react";
import axiosInstance from "../../api.jsx";
import { Sidebar } from "../../components/Sidebar/index.jsx";
import { useAuth } from "../../authContext";
import InsertCommentRoundedIcon from '@mui/icons-material/InsertCommentRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import { useParams } from "react-router-dom";
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import "./Userprofile.css";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; 
import uploadToBlob from "../../azureUpload.jsx";
import { storage, firestore } from "./profilefirebase.jsx";
import { ref, uploadBytes, getDownloadURL,listAll } from "firebase/storage";



const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};




const UserProfile = () => {

  
  const {userId}=useAuth();
  const { id } = useParams(); 
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [profileImageFile, setProfileImageFile] = useState(null); 
  const [profileImageUrl, setProfileImageUrl] = useState(null); 
  const [tasks, setTasks] = useState([]); // New state for tasks
  const [showTasks, setShowTasks] = useState(false); // Add state for showing tasks
  const tenantId=getTenantIdFromUrl();


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/get-user/${tenantId}`);
        setUser(response.data);
        
        console.log("user data", response.data);
        setEditedUser(response.data);
        setIsLoading(false);
        console.log(userId);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    const fetchUserTasks = async () => {
      try {
        const response = await axiosInstance.get(`/user/7/tasks/`);
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching user tasks:", error);
      }
    };

   
    fetchUserData();
    fetchUserTasks();
  }, [id, tenantId, userId]);
  

  const handleSaveChanges = async () => {
    try {
      let updatedUser = { ...editedUser }; // Create a copy of editedUser
    
      // Upload the profile image if it exists
      if (profileImageFile) {
        const formData = new FormData();
        formData.append('file', profileImageFile);
        const response = await axiosInstance.post(`/get-user/${tenantId}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Upload success:', response.data);
        updatedUser.profile_image = response.data.url; 
      }
      
      await axiosInstance.put(`/get-user/${tenantId}/`, updatedUser); 
      
      setEditedUser(updatedUser);
      
      const notes = `User profile updated with new data: <describe the changes made>`;
      setIsEditing(false); 
      console.log("User data updated successfully!");
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleProfileImageUpload = async (e) => {
    const selectedFile = e.target.files[0];
    console.log('Selected file:', selectedFile);
  
    if (selectedFile) {
      try {
        // Upload the new profile image
        console.log('Uploading file to Azure Blob Storage...');
        const fileUrl = await uploadToBlob(selectedFile, userId, tenantId);
        console.log('File uploaded to Azure, URL:', fileUrl);
  
        // Fetch all existing profile images to delete old ones
        console.log('Fetching existing profile images...');
        const response = await axiosInstance.get(`/return-documents/3/2`, {
          params: {
            model: 'Profile_Image',
            entity_type: 3, // Ensure this matches the correct entity_type
            entity_id: 2,   // Use the correct entity_id if needed
            tenant: tenantId,
            userId: userId
          }
        });
  
        const documents = response.data.documents || [];
        if (documents.length > 0) {
          console.log('Documents to delete:', documents);
  
          // Delete previous profile images
          for (const doc of documents) {
            await axiosInstance.delete(`/documents/${doc.id}`, {
              params: {
                model: 'Profile_Image',
                entity_type: 3, // Ensure this matches the correct entity_type
                entity_id: 2,   // Use the correct entity_id if needed
                tenant: tenantId,
                userId: userId
              }
            });
            console.log(`Deleted previous profile image: ${doc.name}`);
          }
        } else {
          console.log('No previous profile images found.');
        }
  
        // Save the new profile image
        console.log('Saving new profile image...');
        await axiosInstance.post(`/documents/`, {
          name: selectedFile.name,
          document_type: selectedFile.type,
          description: 'Your file description',
          entity_type: 3, // Assuming entity_type 3 is for Profile Images
          entity_id: 2,
          file_url: fileUrl,
          tenant: tenantId,
          userId: userId,
          model: 'Profile_Image'
        });
  
        // Fetch and set the latest profile image
        await fetchProfileImage();
  
        console.log('Profile image uploaded and updated successfully.');
      } catch (error) {
        console.error('Error uploading profile image:', error);
      }
    } else {
      console.error('No file selected');
    }
  };
  
  
  const fetchProfileImage = async () => {
    try {
      console.log('Fetching profile images...');
      // Fetch all documents with the specified model
      const response = await axiosInstance.get(`/return-documents/3/2`, {
        params: {
          model: 'Profile_Image',
          entity_type: 3, // Ensure this matches the correct entity_type
          entity_id: 2,   // Use the correct entity_id if needed
          tenant: tenantId,
          userId: userId
        }
      });
  
      // Check the API response
      console.log('API Response:', response.data);
  
      const documents = response.data.documents || [];
      if (documents.length > 0) {
        // Log documents for debugging
        console.log('Documents:', documents);
  
        // Sort documents by creation date or other property to get the latest one
        const sortedDocuments = documents.sort((a, b) => {
          // Adjust sorting logic if needed
          return new Date(b.created_at) - new Date(a.created_at); // Assuming 'created_at' is the date property
        });
  
        // Get the latest document
        const latestDocument = sortedDocuments[0];
        const url = latestDocument.file_url; // Adjust according to your API response
  
        // Set the profile image URL
        setProfileImageUrl(url);
        console.log('Latest profile image URL:', url);
      } else {
        console.log('No profile images found.');
        setProfileImageUrl(null);
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
      setProfileImageUrl(null);
    }
  };
  

    useEffect(() => {
      // Fetch profile image when component mounts or when userId or tenantId changes
      fetchProfileImage();
    }, [userId, tenantId]);
  

  
  

  const toggleTasksVisibility = () => {
    setShowTasks(prevShowTasks => !prevShowTasks);
};


return (
  <div className={`up-container ${isEditing ? 'up-editing' : ''}`}>
  <div className="up-sidebar">
    <Sidebar />
  </div>
  <div className="up-main-content">
    <div className="up-top-nav">
      <TopNavbar profileImageUrl={profileImageUrl} userId={userId} />
    </div>
    <div>
      <h2 className="user-profile-container1">User Profile</h2>
      <div className="user-profile-wrapper">
        {isLoading ? (
          <div>Loading...</div>
        ) : user ? (
          <div className="profile-details" style={{marginLeft:'350px'}}>
            <div className="avatar-container">
              <div className="container-behind-avatar">
                <div className='semi-half-circle'></div>
                <div className='semi-half-circle2'></div>
                <div className='semi-half-circle3'></div>
                <div className='semi-half-circle4'></div>
              </div> 
              <label htmlFor="profile-image" className="avatar">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" />
                ) : (
                  <div className="up-avatar-placeholder">Upload Image</div>
                )}
                <span className='profile-user'>Profile</span>
              </label>
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="up-file-input"
                style={{ display: 'none' }}
              />
              <button className="up-upload-btn" onClick={() => document.getElementById("profile-image").click()}>
                +
              </button>
            </div>
            <div className="up-profile-actions">
              <button className="up-action-btn up-message-btn">
                <InsertCommentRoundedIcon />
              </button>
              <button className="up-action-btn up-email-btn">
                <MailOutlineRoundedIcon />
              </button>
              <button className="up-action-btn up-call-btn">
                <CallRoundedIcon />
              </button>
            </div>
            <div className="up-profile-details">
              <div className="up-detail-item">
                <BadgeRoundedIcon className="up-detail-icon" />
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editedUser.name}
                    onChange={handleInputChange}
                    className="up-edit-input"
                  />
                ) : (
                  <span className="up-detail-text">{user.name}</span>
                )}
              </div>
              <div className="up-detail-item">
                <MailOutlineRoundedIcon className="up-detail-icon" />
                {isEditing ? (
                  <input
                    type="text"
                    name="email"
                    value={editedUser.email}
                    onChange={handleInputChange}
                    className="up-edit-input"
                  />
                ) : (
                  <span className="up-detail-text">{user.email}</span>
                )}
              </div>
              <div className="up-detail-item">
                <CallRoundedIcon className="up-detail-icon" />
                {isEditing ? (
                  <input
                    type="text"
                    name="phoneNumber"
                    value={editedUser.phoneNumber}
                    onChange={handleInputChange}
                    className="up-edit-input"
                  />
                ) : (
                  <span className="up-detail-text">{user.phoneNumber}</span>
                )}
              </div>
              <div className="up-detail-item">
                <LocationOnRoundedIcon className="up-detail-icon" />
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={editedUser.address}
                    onChange={handleInputChange}
                    className="up-edit-input"
                  />
                ) : (
                  <span className="up-detail-text">{user.address}</span>
                )}
              </div>
              <div className="up-detail-item">
                <InsertCommentRoundedIcon className="up-detail-icon" />
                {isEditing ? (
                  <input
                    type="text"
                    name="job_profile"
                    value={editedUser.job_profile}
                    onChange={handleInputChange}
                    className="up-edit-input"
                  />
                ) : (
                  <span className="up-detail-text">{user.job_profile}</span>
                )}
              </div>
            </div>
            <div className="up-edit-actions">
              {isEditing ? (
                <>
                  <button className="up-btn up-save-btn" onClick={handleSaveChanges}>Save</button>
                  <button className="up-btn up-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                </>
              ) : (
                <button className="up-btn up-edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
              )}
            </div>
          </div>
        ) : (
          <div className="up-no-data">No user data available</div>
        )}
      </div>
    </div>
    <div className="up-tasks-section">
      <h2 className="up-tasks-title" onClick={toggleTasksVisibility}>
        Latest Tasks
      </h2>
      {showTasks && (
        <div className="up-task-list">
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div key={task.id} className="up-task-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <h3 className="up-task-subject">{task.subject}</h3>
                <p className="up-task-detail">
                  <strong>Status:</strong> <span>{task.status}</span>
                </p>
                <p className="up-task-detail">
                  <strong>Priority:</strong> 
                  <span className={`up-priority up-priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </p>
                <p className="up-task-detail">
                  <strong>Due Date:</strong> <span>{task.due_date}</span>
                </p>
                <p className="up-task-detail">
                  <strong>Description:</strong> <span>{task.description}</span>
                </p>
              </div>
            ))
          ) : (
            <p className="up-no-tasks">No tasks found for this user.</p>
          )}
        </div>
      )}
    </div>
  </div>
</div>);
};
export default UserProfile;