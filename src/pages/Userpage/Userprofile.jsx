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
  const { userId } = 3; // Assuming userId is available from authentication context
  const { id } = useParams(); // Assuming the user ID is obtained from URL parameters
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
        setEditedUser(response.data);
        setIsLoading(false);
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

    const fetchProfileImage = async (id) => {
      try {
       
        const imagesRef = ref(storage, `profileImage/${tenantId}/${userId}/`);
        const result = await listAll(imagesRef);
    
        if (result.items.length > 0) {
          const sortedItems = result.items.sort((a, b) => {
            return b.name.localeCompare(a.name); 
          });
    
          
          const latestFileRef = sortedItems[0];
          const url = await getDownloadURL(latestFileRef);
    
          
          setProfileImageUrl(url);
        } else {
          console.log("No profile images found.");
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
       
        setProfileImageUrl(null);
      }
    };

    fetchUserData();
    fetchUserTasks();
    fetchProfileImage();
  }, [id, tenantId]);
  

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

 

  const handleProfileImageUpload = async (e, id) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      try {
        // Create a reference to the user's profile image directory in Firebase Storage
        const profileImageRef = ref(storage, `profileImage/${tenantId}/${file.name}`);
        console.log("Uploading to:", profileImageRef.fullPath);
  
        // Upload the file to Firebase Storage
        const uploadResult = await uploadBytes(profileImageRef, file);
        console.log("Upload result:", uploadResult);
  
        // Get the download URL for the uploaded file
        const url = await getDownloadURL(profileImageRef);
        console.log("File available at:", url);
  
        // Update the profile image URL state
        setProfileImageUrl(url);
      } catch (error) {
        console.error("Error uploading profile image:", error);
      }
    } else {
      console.error("No file selected");
    }
  };
  
  

  const toggleTasksVisibility = () => {
    setShowTasks(prevShowTasks => !prevShowTasks);
};
  return (
    <div className="user-profile-container">
      <div className="home_left_box1" style={{marginTop:"7rem" }}>
        <Sidebar />
      </div>
      <div>
        <div className="right_div">
          <TopNavbar profileImageUrl={profileImageUrl} />
        </div>
        <div>
          <h2 className="user-profile-container1">User Profile</h2>
        </div>
        <div className="user-profile-wrapper">
          {isLoading ? (
            <div>Loading...</div>
          ) : user ? (
            <div className="profile-details">
              <div className="avatar-container">
                <div className="container-behind-avatar">
                  <div className='semi-half-circle'></div>
                  <div className='semi-half-circle2'></div>
                  <div className='semi-half-circle3'></div>
                  <div className='semi-half-circle4'></div>
                </div> 
                <label htmlFor="profile-image" className="avatar" onClick={() => document.getElementById("profile-image")}>
                  {profileImageUrl && <img src={profileImageUrl} alt="Profile" />}
                  <span className=' profile-user'>Profile</span>
                </label>
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  style={{ display: "none" }}
                />
              </div>
              <div className="profile_font">
                <div className='use_mate'>
                  <div className="material-icons-container">
                    <InsertCommentRoundedIcon  style={{ width: '24px', height: '24px', fill: '#6D31EDFF' }}/>
                  </div>
                  <div className="material-icons-container">
                    <MailOutlineRoundedIcon  style={{ width: '24px', height: '24px', fill: '#6D31EDFF' }}/>
                  </div>
                  <div className="material-icons-container">
                    <CallRoundedIcon  style={{ width: '24px', height: '24px', fill: '#6D31EDFF' }}/>
                  </div>
                </div>
                <div className="profile_data" style={{ margin: '20px', fontSize: '18px', marginLeft: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <BadgeRoundedIcon style={{ width: '24px', height: '24px', fill: '#6D31EDFF' }} />
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={editedUser.name}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px', padding: '5px' }}
                      />
                    ) : (
                      <span className="user-info">{user.name}</span>
                    )}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <MailOutlineRoundedIcon style={{ width: '24px', height: '24px', fill: '#6D31EDFF' }} />
                    {isEditing ? (
                      <input
                        type="text"
                        name="email"
                        value={editedUser.email}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px', padding: '5px' }}
                      />
                    ) : (
                      <span className="user-info">{user.email}</span>
                    )}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <CallRoundedIcon style={{ width: '24px', height: '24px', fill: '#6D31EDFF' }} />
                    {isEditing ? (
                      <input
                        type="text"
                        name="phoneNumber"
                        value={editedUser.phoneNumber}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px', padding: '5px' }}
                      />
                    ) : (
                      <span className="user-info">{user.phoneNumber}</span>
                    )}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <LocationOnRoundedIcon style={{ width: '24px', height: '24px', fill: '#6D31EDFF' }} />
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={editedUser.address}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px', padding: '5px' }}
                      />
                    ) : (
                      <span className="user-info">{user.address}</span>
                    )}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <InsertCommentRoundedIcon style={{ width: '24px', height: '24px', fill: '#6D31EDFF' }} />
                    {isEditing ? (
                      <input
                        type="text"
                        name="job_profile"
                        value={editedUser.job_profile}
                        onChange={handleInputChange}
                        style={{ marginLeft: '10px', padding: '5px' }}
                      />
                    ) : (
                      <span className="user-info">{user.job_profile}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>No user data available</div>
          )}
          <div className="edit-profile-form">
            {isEditing ? (
              <>
 <button className="btn_username-save" onClick={handleSaveChanges}>Save</button>
                <button className="btn_username-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
              </>
               ) : (
                <button className="btn_username" onClick={() => setIsEditing(true)}>Edit Profile</button>
              )}
               </div>
               </div>
                 {/* Displaying user tasks */}
      {/* Displaying user tasks */}
      <div className="user-tasks-container">
                    <h2 onClick={toggleTasksVisibility} style={{ cursor: 'pointer' }} className='latest-page'>Latest Tasks</h2>
                    {showTasks && (
                        <div className="task-list">
                            {tasks.length > 0 ? (
                                tasks.map(task => (
                                    <div key={task.id} className="task-item">
                                        <h3>{task.subject}</h3>
                                        <p><strong>Status:</strong> <span className="task-detail">{task.status}</span></p>
                                        <p><strong>Priority:</strong> <span className={`task-priority-${task.priority.toLowerCase()} task-detail`}>{task.priority}</span></p>
                                        <p><strong>Due Date:</strong> <span className="task-detail">{task.due_date}</span></p>
                                        <p><strong>Description:</strong> <span className="task-detail">{task.description}</span></p>
                                    </div>
                                ))
                            ) : (
                                <p>No tasks found for this user.</p>
                            )}
                        </div>
                    )}
                </div>

      </div>
    </div>
  );
};

export default UserProfile;