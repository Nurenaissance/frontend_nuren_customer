import React, { useState, useEffect } from 'react';
import { Sidebar } from "../../../components/Sidebar";
import ImageEditorComponent from '../../documenteditpage/imageeditor';
import EmojiPicker from 'emoji-picker-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import './instagrampost.css';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase'; // Import the storage from your firebase.js file
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MapsUgcOutlinedIcon from '@mui/icons-material/MapsUgcOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';

import { useNavigate } from 'react-router-dom';
import LiveChat from './instachat';


const urlToFile = async (url, filename, mimeType) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: mimeType });
};


const InstagramPost = ({ uploadedImageUrl }) => {
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
  const [files, setFiles] = useState([]);
  const [isCommentVisible, setIsCommentVisible] = useState(true);
  const [isPromoteVisible, setIsPromoteVisible] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [imageUrl, setImageUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [isStory, setIsStory] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isReel, setIsReel] = useState(true);
  

  
  const [showPopup, setShowPopup] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [imageurl, setimageUrl] = useState('');
  const [editorimageurl, setEditorImageUrl] = useState('');


  useEffect(() => {
    if (uploadedImageUrl) {
      setImageUrl(uploadedImageUrl);
    }
  }, [uploadedImageUrl]);


  const handleInstaAuth = () => {
    window.location.href = 'https://www.facebook.com/v20.0/dialog/oauth?client_id=1546607802575879&redirect_uri=https://crm.nuren.ai/instagramauth/&scope=pages_show_list,instagram_basic&response_type=token';
  };
  useEffect(() => {
    // Check if the access token is present in local storage
    const storedToken = localStorage.getItem('accessToken');
    setAccessToken(storedToken);
    console.log("tiken is",storedToken);
    if (!storedToken) {
      // If token is not present, initiate Instagram authentication
      //handleInstaAuth();
    }
    // No need to set state or perform further actions here
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    console.log('Form submission started');
  
    // Step 1: Upload files to Firebase
    const uploadPromises = files.map(file => {
      console.log('Uploading file:', file.name);
      return uploadFileToFirebase(file);
    });
  
    try {
      const fileURLs = await Promise.all(uploadPromises);
      console.log('Uploaded file URLs:', fileURLs);
  
      // Step 2: Post data based on file type
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileUrl = fileURLs[i];
        if (files.length > 1) {
          await postCarouselImages(fileURLs);
          return;
        }
        if (file.type.startsWith('image/')) {
          // Call endpoint for single image upload
          await postSingleImage(fileUrl, isStory);
        } else if (file.type.startsWith('video/')) {
          // Call endpoint for single video upload
          await postSingleVideo(fileUrl, isReel);
        }
      }
  
      // If there are multiple files, call the carousel endpoint
      if (files.length > 1) {
        await postCarouselImages(fileURLs);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
      return; // Exit early if there's an error
    }
  };
  const postSingleVideo = async (videoUrl, isReel) => {
    const postData = {
      video_url: videoUrl,
      access_token: accessToken,
      upload_type:"resumable",
      caption: caption,
      is_reel: isReel
    };
  
    console.log('Posting data to backend:', postData);
  
    try {
      const response = await fetch('https://hx587qc4-5173.inc1.devtunnels.ms/post-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
  
      if (!response.ok) {
        throw new Error('Error posting video');
      }
  
      const data = await response.json();
      console.log('Success:', data);
      alert('Video posted successfully!');
      // Optionally, you can reset form fields or perform other actions after successful post
    } catch (error) {
      console.error('Error posting video:', error);
      alert('Error posting video');
    }
  };
  const postSingleImage = async (imageUrl,isStory) => {
    const postData = {
      image_url: imageUrl,
      access_token: accessToken,
      caption: caption,
      isStory:isStory
    };
  
    console.log('Posting data to backend:', postData);
  
    try {
      const response = await fetch('https://hx587qc4-5173.inc1.devtunnels.ms/postImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
  
      if (!response.ok) {
        throw new Error('Error posting image');
      }
  
      const data = await response.json();
      console.log('Success:', data);
      alert('Image posted successfully!');
      // Optionally, you can reset form fields or perform other actions after successful post
    } catch (error) {
      console.error('Error posting image:', error);
      alert('Error posting image');
    }
  };
  
  const postCarouselImages = async (fileURLs) => {
    const postData = {
      image_urls: fileURLs,
      access_token: accessToken,
      caption: caption
    };
  
    console.log('Posting carousel images to backend:', postData);
  
    try {
      const response = await fetch('https://hx587qc4-5173.inc1.devtunnels.ms/uploadCarousel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
  
      if (!response.ok) {
        throw new Error('Error posting carousel images');
      }
  
      const data = await response.json();
      console.log('Success:', data);
      alert('Carousel images posted successfully!');
      // Optionally, you can reset form fields or perform other actions after successful post
    } catch (error) {
      console.error('Error posting carousel images:', error);
      alert('Error posting carousel images');
    }
  };
  
  
  
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const openPopup = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false); 
    const newFiles = Array.from(e.dataTransfer.files);
    addFiles(newFiles);
  };
  const addFiles = (newFiles) => {
    if (files.length + newFiles.length > 10) {
      alert("You can only upload up to 10 files.");
      return;
    }
    if (!Array.isArray(newFiles)) {
      console.error('addFiles expects an array, received:', newFiles);
      return;
    }
    const validFiles = newFiles.filter(file => 
      file.type === 'image/png' || 
      file.type === 'image/jpeg' || 
      file.type === 'video/mp4' || 
      file.type === 'video/quicktime' || 
      file.type === 'video/x-msvideo' || 
      file.type === 'video/x-ms-wmv'
    );
    setFiles([...files, ...validFiles]);
  };

  const handleImageUpload = async (e) => {
    // Assuming 'addFiles' function is defined in your component
    
    const newFiles = Array.from(e.target.files);
    // Add new files to the state
    addFiles(newFiles);
  
    // Handle showing the uploaded image or image from editor here
    if (newFiles.length > 0) {
      const file = newFiles[0]; // Assuming you want to handle only the first file here
      const url = URL.createObjectURL(file);
      await loadImageFromURL(url); // Replace with your function to handle this
      uploadedImageUrl(url); // Assuming 'setUploadedImageUrl' updates state for showing uploaded image
    } else {
      // Handle showing the image from the editor (replace with your logic)
       // Replace with your function to get image from editor
       setEditorImageUrl(uploadedImageUrl); // Set state to show image from editor
    }
  
    setShowPopup(false); // Close popup or modal after handling upload
  };
  
  



  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
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

  const handleEmojiClick = (event, emojiObject) => {
    setCaption(prevCaption => prevCaption + emojiObject.emoji);
    setShowPicker(false); // Close the picker after selecting an emoji
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleAddCampaign = () => {
    alert('Add campaign functionality');
  };

  const handleConnectAdManager = () => {
    alert('Connect Ad Manager functionality');
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  const handleSchedulePost = () => {
    console.log('Scheduled Date:', selectedDate);
    console.log('Scheduled Time:', selectedTime);
  };

  const uploadFileToFirebase = async (file) => {
    try {
      console.log("Starting file upload...");
  
      const storageRef = ref(storage, `images/${file.name}`);
      console.log("Storage reference created:", storageRef);
  
      await uploadBytes(storageRef, file);
      console.log("File uploaded successfully.");
  
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL retrieved:", downloadURL);
  
      return downloadURL;
    } catch (error) {
      console.error("Error during file upload:", error);
      throw error; // Re-throw the error after logging it
    }
  };
  

  return (
    <div className="instagram-post-page">
    <div className="sidebar-container">
      <Sidebar />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {accessToken ? (
        <div className="Instagramauth" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1>Instagram Authentication</h1>
          <button onClick={handleInstaAuth} style={{ padding: '2rem', backgroundColor: 'red', borderRadius: '8px', color: 'white', fontSize: '20px' }}>
            Get Instagram Auth
          </button>
        </div>
      ) : (
        <>
          <button style={{ backgroundColor: 'Red' }} onClick={() => setShowLiveChat(!showLiveChat)}>
            {showLiveChat ? 'Send Post' : 'Instagram Chat'}
          </button>
        </>
      )}
      <div className="instagram-post-content">
        {showLiveChat ? (
          <div style={{ width: '100%' }}>
            <LiveChat />
          </div>
        ) : (
          <>
            <div className="instagram-post-form">
              <button>All Posts</button>
              <h1 className="instagram-post-title">Instagram</h1>
              <div className="post-container">
                <div className="post-content">
                  <textarea value={text} onChange={handleChange} />
                  {showSuggestions && (
                    <ul className="suggestions">
                      {suggestions.map((user) => (
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
                    Share photos and videos on Instagram. Posts can’t exceed 10 photos or videos.
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
                        <input
                          type="file"
                          accept=".png, .jpg, .jpeg, .mp4, .mov, .avi, .wmv"
                          multiple
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="content">
                    {showPopup && (
                      <div className="editimage-popup">
                        <div className="editimage-popup-overlay" onClick={handlePopupClose}></div>
                        <div className="editimage-popup-container">
                          <div className="editimage-popup-content">
                            <ImageEditorComponent onClose={handlePopupClose} onUpload={handleImageUpload} />
                          </div>
                          <button onClick={handlePopupClose} className="close-popup-button">
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {files && files.length > 0 && (
                    <div className="attached-media">
                      <h3>Attached Media</h3>
                      <div className="media-grid">
                        {files.map((file, index) => (
                          <div key={index} className="media-item">
                            {file.type.startsWith('image/') ? (
                              <img src={URL.createObjectURL(file)} alt={`file preview ${index + 1}`} />
                            ) : (
                              <video key={index} controls>
                                <source src={URL.createObjectURL(file)} type={file.type} />
                                Your browser does not support the video tag.
                              </video>
                            )}
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
                    placeholder="Write a caption..."
                    className="caption-input"
                  />
                  <div className="caption-footer">
                    <div className="emoji-picker-container">
                      <button onClick={() => setShowPicker(!showPicker)}>😀</button>
                      {showPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
                    </div>
                    <span>
                      {letterCount}/{maxLetters}
                    </span>
                  </div>
                </div>
              </div>
              <div className="comments-box">
                <h2>Add a comment</h2>
                <textarea value={comment} onChange={handleCommentChange} placeholder="Write a comment..." />
              </div>
              <div className="promote-box">
                <h2>Promote</h2>
                <button onClick={handleAddCampaign}>Add campaign</button>
                <button onClick={handleConnectAdManager}>Connect Ad Manager</button>
              </div>
              <div className="schedule-box">
                <h2>Schedule</h2>
                <DatePicker selected={selectedDate} onChange={handleDateChange} />
                <TimePicker value={selectedTime} onChange={handleTimeChange} />
                <button onClick={handleSchedulePost}>Schedule Post</button>
                <div>
                  <button onClick={() => setIsStory(!isStory)}>
                    {isStory ? 'Send as Post' : 'Send as Story'}
                  </button>
                </div>
              </div>
              <button className="post_button" onClick={handleSubmit}>
                Post
              </button>
            </div>
            <div className="imageeditor">
              <button onClick={openPopup} className="open-popup-button">
                Image Editor
              </button>
              <div className="instagram-post-preview">
                <div className="preview-header">
                  <img src="" alt="profile" />
                  <span className="preview-username">nuren.ai</span>
                </div>
                <div className="preview-content">
                  {files.length > 0 && (
                    <div className="preview-media">
                      {files.map((file, index) =>
                        file.type.startsWith('image/') ? (
                          <img key={index} src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
                        ) : (
                          <video key={index} controls>
                            <source src={URL.createObjectURL(file)} type={file.type} />
                            Your browser does not support the video tag.
                          </video>
                        )
                      )}
                    </div>
                  )}
                  <div className="insta-icons">
                    <FavoriteBorderIcon style={{ fontSize: '30', marginRight: '10', marginBottom: '10' }} />
                    <MapsUgcOutlinedIcon style={{ fontSize: '30', marginRight: '10', marginBottom: '10' }} />
                    <SendOutlinedIcon style={{ fontSize: '30', marginRight: '10', marginBottom: '10' }} />
                  </div>
                  <p className="preview-caption">
                    <b>nuren.ai </b>
                    {caption}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
  );
};

export default InstagramPost;
