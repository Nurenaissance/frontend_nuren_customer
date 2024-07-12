import React, { useState, useEffect } from 'react';
import { Sidebar } from "../../../components/Sidebar";
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

const InstagramPost = () => {
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

  const handleInstaAuth = () => {
    window.location.href = 'https://www.facebook.com/v20.0/dialog/oauth?client_id=1546607802575879&redirect_uri=https://crm.nuren.ai/instagramauth/&scope=pages_show_list,instagram_basic&response_type=token';
  };
  useEffect(() => {
    // Check if the access token is present in local storage
    const storedToken = localStorage.getItem('accessToken');
    setAccessToken(storedToken);
    if (!storedToken) {
      // If token is not present, initiate Instagram authentication
      handleInstaAuth();
    }
    // No need to set state or perform further actions here
  }, []);


  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   const postData = {
  //     image_url: imageUrl,
  //     access_token: accessToken,
  //     caption: caption
  //   };

  //   fetch('https://db88-2401-4900-1f3a-6a4b-2da2-bf02-bab1-5803.ngrok-free.app/postImage', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(postData)
  //   })
  //   .then(response => response.json())
  //   .then(data => {
  //     console.log('Success:', data);
  //   })
  //   .catch((error) => {
  //     console.error('Error:', error);
  //   });
  // };


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
  
      // Step 2: Set the image URL in the state
      console.log('Setting image URL in state:', fileURLs[0]);
      setImageUrl(fileURLs[0]); // Assuming you are using the URL of the first uploaded file
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
      return; // Exit early if there's an error
    }
  };
  
  // useEffect to handle post submission once imageUrl is updated
  useEffect(() => {
    if (!imageUrl) return;
  
    const postData = async () => {
      const postData = {
        image_url: imageUrl,
        access_token: accessToken,
        caption: caption
      };
  
      console.log('Posting data to backend:', postData);
  
      try {
        const response = await fetch('https://nuren-insta.vercel.app/postImage', {
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
  
    postData();
  }, [imageUrl]);
  
  
  
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const newFiles = Array.from(e.dataTransfer.files);
    addFiles(newFiles);
  };

  const handleImageUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    addFiles(newFiles);
  };

  const addFiles = (newFiles) => {
    if (files.length + newFiles.length > 10) {
      alert("You can only upload up to 10 files.");
      return;
    }
    const validFiles = newFiles.filter(file => file.type === 'image/png' || file.type === 'image/jpeg');
    setFiles([...files, ...validFiles]);
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
        const storageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
      };
      
  

  

  return (
    <div className="instagram-post-page">
      <div className="sidebar-container">
        <Sidebar />
      </div>
      {!accessToken ? (
        <div className='Instagramauth' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1>Instagram Authentication</h1>
          <button onClick={handleInstaAuth} style={{ padding: '2rem', backgroundColor: 'red', borderRadius: '8px', color: 'white', fontSize: '20px' }}>
            Get Instagram Auth
          </button>
        </div>
      ) : (
        <></> // Optionally, render something else if authenticated
      )}
      <div className="instagram-post-content">
        <div className="instagram-post-form">
          <h1 className="instagram-post-title">Instagram</h1>
          <div className="post-container">
            <div className="post-content">
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
                    <input type="file" accept=".png, .jpg, .jpeg" multiple onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
              {files && files.length > 0 && (
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
            {/* <button onClick={handleFirebaseUpload}>Upload to Firebase</button> */}
            <div className="caption-box">
              <textarea
                value={caption}
                onChange={onCaptionChange}
                placeholder="Write a caption..."
                className="caption-input"
              />
              <div className="caption-footer">
                <div className="emoji-picker-container">
                  <button onClick={() => setShowPicker(!showPicker)}>
                    😀
                  </button>
                  {showPicker && (
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  )}
                </div>
                <span>{letterCount}/{maxLetters}</span>
              </div>
            </div>
          </div>
          <div className="comments-box">
            <h2>Add a comment</h2>
            <textarea
              value={comment}
              onChange={handleCommentChange}
              placeholder="Write a comment..."
            />
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
          </div>
              {/* <a href="https://www.facebook.com/v20.0/dialog/oauth?client_id=1546607802575879&redirect_uri=https://crm.nuren.ai/ll/instagrampost/&scope=pages_show_list,instagram_basic&response_type=token "> Login via Facebook</a> */}
              <button
  style={{
    marginLeft: '3rem',
    marginTop: '2rem',
    padding: '1rem',
    border: '2px solid blue',
    backgroundColor: 'blue',
    color: 'white',
    fontWeight: '600',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s, color 0.3s',
  }}
  onClick={handleSubmit}
  onMouseOver={(e) => {
    e.target.style.backgroundColor = 'darkblue';
  }}
  onMouseOut={(e) => {
    e.target.style.backgroundColor = 'blue';
  }}
>
  Post
</button>
        </div>
        <div className="instagram-post-preview">
          {/* <h2 className='preview-head'>Preview</h2> */}
          <div className="preview-header">
    <img  src="data:image/jpeg;base64,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" alt="Profile Picture" className="profile-picture" />
    <span className="preview-username">nuren.ai</span>
  </div>
          <div className="preview-content">
            {files.length > 0 && (
              <div className="preview-media">
                {files.map((file, index) => (
                  <img key={index} src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
                ))}
              </div>
            )}
            <div className='insta-icons'>
<FavoriteBorderIcon style={{fontSize:'30', marginRight:'10',marginBottom:'10'}}/>
<MapsUgcOutlinedIcon style={{fontSize:'30', marginRight:'10',marginBottom:'10'}}/>
<SendOutlinedIcon style={{fontSize:'30', marginRight:'10',marginBottom:'10'}}/>
            </div>
            <p className="preview-caption"><b>nuren.ai </b>{caption}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramPost;
