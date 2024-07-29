/* eslint-disable no-useless-catch */
/* eslint-disable no-undef */
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
import logo from '../../../assets/logo.png'

import { useNavigate } from 'react-router-dom';
import LiveChat from './instachat';
import { Delete } from '@mui/icons-material';
import { Button, TextField } from '@mui/material';
import axios from 'axios';

import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import WorkIcon from '@mui/icons-material/Work';
import BrushIcon from '@mui/icons-material/Brush';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SettingsIcon from '@mui/icons-material/Settings';
import DraftsIcon from '@mui/icons-material/Drafts';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from '../../../api';
import TopNavbar from '../../TopNavbar/TopNavbar';



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
  // const [caption, setCaption] = useState('');
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
  const [showPreview, setShowPreview] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);

  
  const [showPopup, setShowPopup] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [imageurl, setimageUrl] = useState('');
  const [editorimageurl, setEditorImageUrl] = useState('');
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [captionCategory, setCaptionCategory] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [draftImageUrl, setDraftImageUrl] = useState('');
  const [showDraftsPopup, setShowDraftsPopup] = useState(false);
  const categories = [
    { name: 'Gen Z', icon: <EmojiEmotionsIcon /> },
    { name: 'Professional', icon: <WorkIcon /> },
    { name: 'Creative', icon: <BrushIcon /> },
    { name: 'Meme', icon: <SentimentVerySatisfiedIcon /> },
  ];

  useEffect(() => {
    const storedTenantId = localStorage.getItem('tenant_Id');
    if (storedTenantId) {
      setTenantId(storedTenantId);
      console.log(storedTenantId)
    } else {
      // If no tenant ID is stored, you might want to redirect to a login page
      // or show an error message
    }
  }, []);


  const saveDraft = async (draftData) => {
    try {
      const response = await axiosInstance.post('drafts/', {
        ...draftData,
        image_urls: draftData.image_urls, // Send the array of image URLs
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  const fetchDrafts = async () => {
    try {
      const response = await axiosInstance.get('drafts/');
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  const loadDraft = async (draftId) => {
    try {
      const response = await axiosInstance.get(`drafts/${draftId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  const deleteDraft = async (draftId) => {
    try {
      const response = await axiosInstance.delete(`drafts/${draftId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };



  const handleSaveDraft = async () => {
    try {
      console.log('Draft saving started');
  
      // Step 1: Upload files to Firebase
      const uploadPromises = files.map(file => {
        console.log('Uploading file for draft:', file.name);
        return uploadFileToFirebase(file);
      });
  
      const fileURLs = await Promise.all(uploadPromises);
      console.log('Uploaded file URLs for draft:', fileURLs);
  
      const draftData = {
        image_url: fileURLs, // Send the array of image URLs
        caption: caption,
        access_token: "enter axis token",
        timestamp: new Date().toISOString(),
        isStory: isStory,
        isReel: isReel,
        scheduledDate: selectedDate.toISOString(),
        scheduledTime: selectedTime,
      };
  
      console.log('Sending draft data:', draftData);
      const savedDraft = await saveDraft(draftData);
      alert('Draft saved successfully!');
      setDrafts([...drafts, savedDraft]);
    } catch (error) {
      console.error('Error saving draft:', error);
      console.error('Error response:', error.response?.data);
      alert('Error saving draft');
    }
  };


  const handleFetchDrafts = async () => {
    try {
      const fetchedDrafts = await fetchDrafts();
      setDrafts(fetchedDrafts);
      setShowDraftsPopup(true);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      alert('Error fetching drafts');
    }
  };

  const handleLoadDraft = async (draftId) => {
    try {
      const loadedDraft = await loadDraft(draftId);
      setCaption(loadedDraft.caption);
      setIsStory(loadedDraft.isStory);
      setIsReel(loadedDraft.isReel);
      setSelectedDate(new Date(loadedDraft.scheduledDate));
      setSelectedTime(loadedDraft.scheduledTime);
      if (loadedDraft.image_urls && loadedDraft.image_urls.length > 0) {
        const filePromises = loadedDraft.image_urls.map(url => 
          urlToFile(url, `draftImage_${Date.now()}.jpg`, 'image/jpeg')
        );
        const loadedFiles = await Promise.all(filePromises);
        setFiles(loadedFiles);
        setImage(loadedFiles[0]); // Set the first image as the main image
      }
      setShowDrafts(false);
    } catch (error) {
      console.error('Error loading draft:', error);
      alert('Error loading draft');
    }
  };

  const handleDeleteDraft = async (draftId) => {
    try {
      await deleteDraft(draftId);
      setDrafts(drafts.filter(draft => draft.id !== draftId));
      alert('Draft deleted successfully!');
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Error deleting draft');
    }
  };

  
  const openPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    if (files.length > 0) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [files]);


  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };


  const handleGenerateCaption = async () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }
  
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = async () => {
        const base64Image = reader.result.split(',')[1];
  
        let promptText = `Generate a caption for this image.`;
        if (captionCategory) {
          promptText += ` The caption should be in the style of ${captionCategory}.`;
        }
        if (prompt) {
          promptText += ` Additional context or requirements: ${prompt}`;
        }
  
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: promptText
                },
                { 
                  type: "image_url", 
                  image_url: { 
                    url: `data:image/jpeg;base64,${base64Image}` 
                  } 
                }
              ]
            }
          ],
          max_tokens: 300
        }, {
          headers: {
            'Authorization': `Bearer api-key`,
            'Content-Type': 'application/json'
          }
        });
  
        const generatedCaption = response.data.choices[0].message.content.trim();
        setCaption(generatedCaption);
      };
    } catch (error) {
      console.error('Error generating caption:', error);
      setCaption('Failed to generate caption.');
      if (error.response) {
        console.error('API Error:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };




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
    const newFiles = Array.from(e.target.files);
    addFiles(newFiles);
  
    if (newFiles.length > 0) {
      setImage(newFiles[0]);
      const url = URL.createObjectURL(newFiles[0]);
      setDraftImageUrl(url); // Set the draft image URL here
      await loadImageFromURL(url);
    }
  
    setShowPopup(false);
  };
  


  const DraftsPopup = ({ drafts, onClose, onLoadDraft, onDeleteDraft }) => (
    <div className="drafts-popup-overlay">
      <div className="drafts-popup">
        <h2>Your Drafts</h2>
        <button onClick={onClose} className="close-popup-button" style={{backgroundColor:'red'}}>Close</button>
        <div className="drafts-list">
          {drafts.map((draft) => (
            <div key={draft.id} className="draft-item">
              {draft.imageUrl && <img src={draft.imageUrl} alt="Draft preview" className="draft-image" />}
              <div className="draft-details">
                <p><strong>Caption:</strong> {draft.caption}</p>
                <p><strong>Created:</strong> {new Date(draft.timestamp).toLocaleString()}</p>
                <p><strong>Type:</strong> {draft.isStory ? 'Story' : draft.isReel ? 'Reel' : 'Post'}</p>
                {draft.scheduledDate && (
                  <p><strong>Scheduled:</strong> {new Date(draft.scheduledDate).toLocaleDateString()} at {draft.scheduledTime}</p>
                )}
              </div>
              <div className="draft-actions">
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => onLoadDraft(draft.id)}
                >
                  Load Draft
                </Button>
                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={() => onDeleteDraft(draft.id)}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );







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
      <div className="insta-top-navbar">
        <TopNavbar/>
      </div>
      {accessToken ? (
        <div className="Instagramauth" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1>Instagram Authentication</h1>
          <button onClick={handleInstaAuth} style={{ padding: '2rem', backgroundColor: 'red', borderRadius: '8px', color: 'white', fontSize: '20px' }}>
            Get Instagram Auth
          </button>
        </div>
      ) : (
        <div style={{
          padding: '2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          // borderRadius: '12px'
        }}>
          <button style={{  backgroundColor: 'white',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
       background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease' }} onClick={() => setShowLiveChat(!showLiveChat)}>
            {showLiveChat ? 'Send Post' : 'Instagram Chat'}
          </button>
        </div>
      )}
      <div className="instagram-post-content">
        {showLiveChat ? (
          <div style={{ width: '100vw' }}>
            <LiveChat />
          </div>
        ) : (
          <>
            <div className="instagram-post-form">
              <div className="insta-top-buton" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <button>All Posts</button>
              <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleFetchDrafts}
          startIcon={<DraftsIcon />}
          style={{backgroundColor:'black'}}
          >
          Show All Drafts
        </Button>
          </div>
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
                            <button onClick={() => removeFile(index)}><Delete/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="caption-box">
  <textarea
    value={caption}
    onChange={(e) => setCaption(e.target.value)}
    placeholder="Write a caption..."
    className="caption-input"
  />
  <div className="caption-footer">
  <div className="caption-categories">
  {categories.map((category) => (
    <button
      key={category.name}
      className={`category-button ${captionCategory === category.name ? "active" : ""}`}
      onClick={() => setCaptionCategory(category.name)}
    >
      <span className="category-icon">{category.icon}</span>
      {category.name}
    </button>
  ))}
  <button
    className={`category-button customize-button ${showCustomPrompt ? "active" : ""}`}
    onClick={() => setShowCustomPrompt(!showCustomPrompt)}
  >
    <span className="category-icon"><SettingsIcon /></span>
    Customize
  </button>
</div>
    {showCustomPrompt && (
      <TextField
        label="Custom prompt for caption"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        multiline
        rows={3}
        variant="outlined"
        fullWidth
        margin="normal"
        className="custom-prompt-input"
      />
    )}
    <Button 
      variant="contained" 
      color="primary" 
      onClick={handleGenerateCaption} 
      disabled={loading || !image}
      className="generate-caption-button"
    >
      {loading ? 'Generating...' : 'Generate Caption'}
    </Button>
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
              <div className="post-buttons" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <button className="post_button" style={{backgroundColor:'Green'}} onClick={handleSubmit}>
          Post
        </button>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleSaveDraft}
          startIcon={<DraftsIcon />}
          style={{backgroundColor:'red'}}
        >
          Save as Draft
        </Button>
      </div>

      {showDraftsPopup && (
  <DraftsPopup
    drafts={drafts}
    onClose={() => setShowDraftsPopup(false)}
    onLoadDraft={handleLoadDraft}
    onDeleteDraft={handleDeleteDraft}
  />
)}
            </div>
            <div className="imageeditor">
              <button onClick={openPopup} className="open-popup-button">
                Image Editor
              </button>
              {showPopup && (
        <div className="overlay">
          <div className="popup">
            <button onClick={closePopup} className="close-popup-button">
              Close
            </button>
            <ImageEditorComponent onClose={closePopup} onUpload={handleImageUpload} />
          </div>
        </div>
      )}
              {showPreview && (
          <div className={`instagram-post-preview ${showPreview ? 'visible' : ''}`}>
                <div className="preview-header">
                  <img src={logo} alt="profile" />
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
                 )}
            </div>
          </>
        )}
      </div>
    </div>
  </div>
  );
};

export default InstagramPost;
