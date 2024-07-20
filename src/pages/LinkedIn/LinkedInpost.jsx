import React, { useState, useEffect } from 'react';
import { Sidebar } from "../../components/Sidebar";
import EmojiPicker from 'emoji-picker-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import ImageEditorComponent from "../../pages/documenteditpage/imageeditor.jsx";
import './LinkedInpost.css';


const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};

const LinkedInPost = () => {
  const tenantId=getTenantIdFromUrl();
  const [text, setText] = useState('');
  const [dragging, setDragging] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const maxLetters = 2200;
  const [caption, setCaption] = useState('');
  const [letterCount, setLetterCount] = useState(0);
  const [comment, setComment] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [files, setFile] = useState([]);
  const [isCommentVisible, setIsCommentVisible] = useState(true);
  const [isPromoteVisible, setIsPromoteVisible] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [showComment, setShowComment] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [profilePost, setProfilePost] = useState(null);
  const [profileInfo, setProfileInfo] = useState({ name: '', profilePicture: '' });
  const [authCode, setAuthCode] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  
  useEffect(() => {
    const handleAccessToken = async () => {
      // Get authorization code from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      console.log('Authorization code:', code);
      console.log('Authorization state:', state);

      if (!code) {
        console.error('Authorization code not found in URL');
        return;
      }

      setAuthCode(code);

      try {
        // Send code to get access token
        const response = await fetch('https://hx587qc4-3000.inc1.devtunnels.ms/getAccessToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Access token response:', data);
          setAuthenticatedUser(data.access_token);
        } else {
          console.error('Failed to get access token', response.status, response.statusText);
          const errorData = await response.json();
          console.error('Error details:', errorData);
        }
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };

    handleAccessToken();
  }, []);

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const openPopup = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const newFiles = Array.from(e.dataTransfer.files);
    addFiles(newFiles);
  };

  const handleImageUpload = async (e) => {
    const newFiles = Array.from(e.target.files);
    addFiles(newFiles);
    var code='';

    // Iterate over each file to read it as binary data and upload to Firebase
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const binaryData = reader.result; // Binary data of the uploaded image
        console.log('Binary data:', binaryData);

        // Convert binary string to a suitable format if needed
        const binaryBuffer = new Uint8Array(binaryData.split("").map(char => char.charCodeAt(0)));
        const binaryNumber = Array.from(binaryBuffer).map(byte => byte.toString(2).padStart(8, '0')).join('');

        // Prepare the payload
        const payload = {
          imageBinary: binaryNumber,
          imageURL:" imageURL",
          textBody: 'This is a sample text body.',
          title: 'Sample Title',
          subtitle: 'Sample Subtitle',
          shareText:'this is random text',
          code: authCode

        };

        // Make the POST request
        const result = await postData('https://8twdg37p-3000.inc1.devtunnels.ms/postImage', payload);
        console.log(result);
      };
      reader.readAsBinaryString(file);
    });
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    console.log('Selected file:', selectedFile);
    
    if (selectedFile) {
      setFile(selectedFile);
      console.log('File state set:', selectedFile);
  
      try {
        // Upload the file to Azure Blob Storage
        console.log('Uploading file to Azure Blob Storage...');
      const fileUrl = await uploadToBlob(selectedFile);
        console.log('File uploaded to Azure, URL:', fileUrl);

       
  
        // Send a POST request to your backend with the file URL
        console.log('Sending POST request to backend...');
        const response = await axiosInstance.post('/documents/', {
          name: selectedFile.name,
          document_type: selectedFile.type,
          description: 'Your file description',
          file_url: fileUrl,
          entity_type: 7,
          tenant : tenantId,
        });
        console.log('POST request successful, response:', response.data);
  
        console.log('File uploaded successfully:', response.data);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      console.log('No file selected');
    }
  };

  useEffect(() => {
    const fetchProfilePost = async () => {
      try {
       
        console.log('Tenant ID:', tenantId);
  
        const response = await axiosInstance.get(`/return-documents/`);
        console.log('GET request successful, response:', response.data);
  
        const documents = response.data.documents;
    if (documents && documents.length > 0) {
        const profileImage = documents[0].file;
        console.log('Found profile image:', profileImage);
        setProfilePost(profileImage);
    } else {
        console.log('No profile image found.');
        setProfilePost(null); // Set a default image URL or null if no image found
    }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };
  
    if (tenantId) {
      fetchProfilePost();
    }
  }, [tenantId]);

 /* const uploadImageToFirebase = async (file) => {
    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };*/

  const postData = async (url = '', data = {}) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  };

  const addFiles = (newFiles) => {
    if (files.length + newFiles.length > 10) {
      alert("You can only upload up to 10 files.");
      return;
    }
    const validFiles = newFiles.filter(file => file.type === 'image/png' || file.type === 'image/jpeg');
    setFile([...files, ...validFiles]);
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFile(updatedFiles);
  };
 

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    const mentionMatch = value.match(/@(\w+)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
    } else {
      setMentionQuery('');
    }
  };

  const handleSuggestionClick = (user) => {
    const mentionRegex = /@\w*$/;
    const newText = text.replace(mentionRegex, `@${user} `);
    setText(newText);
    setShowSuggestions(false);
    setMentionQuery('');
  };

  const onCaptionChange = (e) => {
    const value = e.target.value;

    if (value.length <= maxLetters) {
      setCaption(value);
      setLetterCount(value.length);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setCaption(prevCaption => prevCaption + emojiObject.emoji);
    setShowPicker(false); // Close the picker after selecting an emoji
  };

  const handleUploadOptionClick = async (option) => {
    setShowUploadOptions(false);
    switch (option) {
      case 'Upload Image(s)':
        await handleUploadImage();
        break;
      case 'Upload Video':
        await handleUploadVideo();
        break;
      case 'Bynder':
        await handleBynderUpload();
        break;
      case 'Design on Canva':
        await handleDesignOnCanva();
        break;
      case 'Dropbox':
        await handleDropboxUpload();
        break;
      case 'Google Drive':
        await handleGoogleDriveUpload();
        break;
      case 'Shared Media':
        await handleSharedMediaUpload();
        break;
      case 'Asset Library':
        await handleAssetLibraryUpload();
        break;
      default:
        break;
    }
  };

  const handleUploadImage = async () => {
    // Implement your image upload logic here
    alert('Image upload functionality');
  };

  const handleUploadVideo = async () => {
    // Implement your video upload logic here
    alert('Video upload functionality');
  };

  const handleBynderUpload = async () => {
    // Implement Bynder upload logic here
    alert('Bynder upload functionality');
  };

  const handleDesignOnCanva = async () => {
    // Implement design on Canva logic here
    alert('Design on Canva functionality');
  };

  const handleDropboxUpload = async () => {
    // Implement Dropbox upload logic here
    alert('Dropbox upload functionality');
  };

  const handleGoogleDriveUpload = async () => {
    // Implement Google Drive upload logic here
    alert('Google Drive upload functionality');
  };

  const handleSharedMediaUpload = async () => {
    // Implement shared media upload logic here
    alert('Shared media upload functionality');
  };

  const handleAssetLibraryUpload = async () => {
    // Implement asset library upload logic here
    alert('Asset library upload functionality');
  };


  const handleFileUpload = () => {
    // Logic to handle file upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      // Handle the uploaded file
      alert('File upload successful: ' + file.name);
    };
    input.click();
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleAddCampaign = () => {
    alert('Add campaign functionality');
    // Logic to add a new campaign
  };
  const handleConnectAdManager = () => {
    alert('Connect Ad Manager functionality');
    // Logic to connect ad manager
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  const handleSchedulePost = () => {
    // Logic to handle scheduling the post
    console.log('Scheduled Date:', selectedDate);
    console.log('Scheduled Time:', selectedTime);
  };

 



  
  return (
    <div className="LinkedIn_post">
      <div className="sidebar_container_for_LinkedIn">
       <Sidebar/>
      </div>
      <div className="LinkedIn-header">
        <h1 className='meeting_head'>LinkedIn</h1>
          <div className="LinkedIn_main_left">
          <div className="post-container">
            <div className="LinkedIn_content">
              <textarea
                value={text}
                onChange={handleChange}
              />
              {showSuggestions && (
                <ul className="suggestions">
                  {suggestions.map(user => (
                    <li key={user} onClick={() => handleSuggestionClick(user)}>
                      {user}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="upload-media-container">
      <h2 className="upload-media-heading">Upload Media</h2>
      <p className="upload-media-description">
        Share photos and videos on LinkedIn. Posts can’t exceed 10 photos or videos.
      </p>
      <div
        className={`upload-media-box ${dragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>➤ Upload files here</p>
        <p>Supported format: PNG, JPG</p>
        <div className="upload-actions">
          <label className="upload-button">
            Browse files
            <input type="file" accept=".png, .jpg, .jpeg" multiple onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      <div className="content">
      {/* Your existing content here */}
      <button onClick={openPopup} className="open-popup-button">
       Image Editor
      </button>

      {showPopup && (
        <div className="editimage-popup">
          <div className="editimage-popup-overlay" onClick={handlePopupClose}></div>
          <div className="editimage-popup-container">
            <div className="editimage-popup-content">
              <ImageEditorComponent onClose={handlePopupClose}/>
            </div>
            <button onClick={handlePopupClose} className="close-popup-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>

      {files.length > 0 && (
        <div className="attached-media">
          <h3>Attached Media</h3>
          <div className="media-grid">
            {files.map((file, index) => (
              <div key={index} className="media-item">
                <img src={URL.createObjectURL(file)} alt={`file preview ${index + 1}`} />
                <button onClick={() => removeFile(index)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
            <div className="caption-box">
      <textarea
        value={caption}
        onChange={onCaptionChange}
        placeholder="Type your caption here..."
      />
      <div className="caption-options">
        <div className="emoji-picker-component">
          <span className="emoji-icon" onClick={() => setShowPicker(!showPicker)}>😊</span>
          {showPicker && (
            <div className="emoji-picker-dropdown">
              <EmojiPicker onEmojiClick={(event, emojiObject) => handleEmojiClick(emojiObject)} />
            </div>
          )}
        </div>
        <div className="upload-option-component">
          <span className="upload-camera-option" onClick={() => setShowUploadOptions(!showUploadOptions)}>📷</span>
          {showUploadOptions && (
            <ul className="upload-options-dropdown">
              {['Upload Image(s)', 'Upload Video', 'Bynder', 'Design on Canva', 'Dropbox', 'Google Drive', 'Shared Media', 'Asset Library'].map(option => (
                <li key={option} onClick={() => handleUploadOptionClick(option)}>{option}</li>
              ))}
            </ul>
          )}
        </div>
        <div className={`letter-count ${letterCount > maxLetters ? 'exceeded' : ''}`}>
          {letterCount} / {maxLetters}
        </div>
      </div>
    </div>
    </div>  
          </div>  
          <div className="LinkedIn-option-box">
          <div className="first-comment-box">
            <div className="comment-heading">LinkedIn First Comment</div>
            <div className="toggle-comment-visibility" onClick={() => setIsCommentVisible(!isCommentVisible)}>
          {isCommentVisible ? '⬆️' : '⬇️'} 
        </div>
              {isCommentVisible && (
            <div className="comment-input">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your comment here..."
              />
            </div>
            )}
          </div>
          <div className="LinkedIn-campaign">
        <h2>Add Campaign</h2>
       <div className="campaign-box">
          <p>Track and report on your social marketing campaigns with the Campaign Planner, notes and more.</p>
          <hr />
          <button onClick={handleAddCampaign} className="add-campaign-button">Add a campaign</button>
        </div>
        <div className="promote-option-box">
        <div className="promote-heading">
          Promote
          <div className="toggle-promote-visibility" onClick={() => setIsPromoteVisible(!isPromoteVisible)}>
            {isPromoteVisible ? '⬆️' : '⬇️'}
          </div>
        </div>
        {isPromoteVisible && (
          <div className="promote-content">
            <p>Promote this post to a larger audience by connecting an ad account.</p>
            <button onClick={handleConnectAdManager} className="connect-ad-manager-button">Connect Ad Manager</button>
          </div>
        )}
      </div>
      </div> 
    <div className="schedule-post-box">
      <h2 onclick={handleImageUpload}>Schedule a Post</h2>
      <div className="date-time-box">
        <div className="date-picker-box">
          <label>Date:</label>
          <DatePicker selected={selectedDate} onChange={handleDateChange} />
        </div>
        <div className="time-picker-box">
          <label>Time:</label>
          <TimePicker value={selectedTime} onChange={handleTimeChange} />
        </div>
      </div>
      <div>
        <button onClick={handleSchedulePost}>Schedule Post</button>
      </div>
    </div>
      </div>
      </div>
      <div className="Post-preview">
        <h1>Network Preview</h1>
        <p>Preview approximates how your content will display when published. Tests and updates by social networks may affect the final appearance. Report a difference you notice.</p>
        {caption || files.length > 0 ? (
        <div className="preview-area-content">
        <div className="preview-option-box">
        <div className="Preview-heading">
          LinkedIn
          <div className="toggle-preview-visibility" onClick={() => setIsPreviewVisible(!isPreviewVisible)}>
            {isPromoteVisible ? '⬆️' : '⬇️'}
          </div>
        </div>
        <div className="preview-box">
        {isPreviewVisible && (
          <div className="preview-content">
            <div className="user-info">
        <h2 className="user-name">User Name</h2>
      </div>
      <div className="caption-preview">
          <p>{caption}</p>
        </div>
      <div className="post-media-grid">
        {files.map((file, index) => (
          <div key={index} className="post-media-item">
            <img src={URL.createObjectURL(file)} alt={`file preview ${index + 1}`} />
          </div>
        ))}
      </div>
      <div className="interaction-buttons">
        <button className="like-button">Like</button>
        <button className="comment-button" onClick={() => setShowComment(!showComment)}>Comment</button>
        <button className="share-button">Share</button>
      </div>
      {showComment && (
        <div className="comment-input">
          <p>{comment}</p>
      </div>
      )}
          </div>
        )}
        </div>
        </div>
      </div>
       ) : null}
      </div>
        </div>
  );
};

export default LinkedInPost;
