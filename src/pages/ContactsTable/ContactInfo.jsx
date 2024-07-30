import axios from "axios";
import React, { useEffect, useState } from "react";
import {Link, useParams } from "react-router-dom";
import RelatedList from "./RelatedList.jsx";
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import uploadToBlob from "../../azureUpload.jsx";
import axiosInstance from "../../api.jsx";
import "./contactsTable.css";
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path
import TextSnippetRoundedIcon from '@mui/icons-material/TextSnippetRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';

import "./index.jsx";
const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; 
};

const ContactInfo = ( ) => {
const tenantId=getTenantIdFromUrl();
  // const [showCadence, setShowCadence] = useState(false);
  const handleAddCadence = () => {
    setShowCadence(true);
  };

  const [contactinfo, setContactInfo] = useState({
    first_name: "",
    ContactName: "",
    email: "",
    emailOptOut: "",
    phone: "",
    address: "",
    account: "",
    title: "",
    leadSource: "",
    accountName: "",
    vendorName: "",
    HomePhone: "",
    Fax: "",
    DateOfBirth: "",
    AsstPhone: "",
    SkypeId: "",
    ModifiedBy: "",
    Currency1: "",
    Twitter: "",
    MailingStreet: "",
    secondaryEmail: "",
    MailingCity: "",
    MailingState: "",
    MailingZip: "",
    MailingCountry: "",
    OtherStreet: "",
    OtherCity: "",
    OtherState: "",
    OtherPhone: "",
    OtherZip: "",
    OtherCountry: "",
    Notes: "",
    AddCadence: "",
    assistant: "",
    Description: "",
    RecentNotes: [],
    CadenceName: "",
    Modules: "",
    CreatedDate: "",
    createdBy: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingContactInfo, setIsEditingContactInfo] = useState(false);
const [isEditingInfo, setIsEditingInfo] = useState(false);
const [isEditingInfoNote, setIsEditingInfoNote] = useState(false);
const [photoColor, setPhotoColor] = useState("blue");
const [timeline, setTimeline] = useState([]); // New state variable for timeline data
const [showTimeline, setShowTimeline] = useState(false); 
const [profileImage, setProfileImage] = useState(null);
const { id } = useParams();


const [file, setFile] = useState(null);
const [selectedFile, setSelectedFile] = useState(null);




  const [editedEmail, setEditedEmail] = useState('');
  const[editedAccountName,setEditedAccountName] =useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedOtherPhone, setEditedOtherPhone] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showAllFiles, setShowAllFiles] = useState(false);

  const[editedLeadSource, setEditedLeadSource]= useState('');
  const[editedvendorName, seteditedVendorName]=useState('');
  const[editedContactName,setEditedContactName]=useState('');
  const[editedassistant,setEditedAssistant]=useState('');
  const[editecreatedby,setCreatedBy]=useState('');
  const[editemodifieddby,setModifiedBy]=useState('');
  const[editecurrency,setEditedCurrency]=useState('');
  const[editfax,setEditFax]=useState('');
  const[editDOB, setEditDOB]= useState('');
  const[editAsstphone, setEditAsstphone]= useState('');
  const[editemailOptOut, setEmailOptOut]=useState('');
  const[editskypeid, setSkypeID]=useState('');
  const[editsecondaryEmail,setSecondaryEmail] =useState('');
  const[editTwitter,seteditTwitter]  =useState('');
  const[editmailingstreet,seteditmailingStreet]=useState('');
  const[editmailingzip,seteditmailingZip]=useState('');
  const[editmailingcountry,seteditmailingCountry]=useState('');
  const[editmailingcity,seteditmailingCity]=useState('');
  const[editothercountry,seteditotherCountry]=useState('');
  const[editothercity,seteditotherCity]=useState('');
  const[editotherstate,seteditotherState]=useState('');
  const[editotherzip,seteditotherZip]=useState('');
  const[editnote,seteditNote]=useState('');




  const handleMoreClick = () => {
    setShowAllFiles(!showAllFiles);
  };
  const handleFileClick = (file) => {
    setSelectedFile(file);
    console.log(selectedFile)
    setShowAllFiles(false);
  };


  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = selectedFile.file_url;
    link.download = selectedFile.name;
    link.click();
  };
  const closePopup = () => {
    setSelectedFile(null);
  };

  

  const [editedAddress, setEditedAddress] = useState(contactinfo.address);
  const [editedAccount, setEditedAccount] = useState(contactinfo.account);


  // Get the account ID from the URL parameter
  
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

 

  const [meetings, setMeetings] = useState([]);

  // const [modalOpen1, setModalOpen1] = useState(false);
  useEffect(() => {
    const fetchcontactData = async () => {
      try {
        const response = await axiosInstance.get(`/contacts/${id}`);
        setContactInfo(response.data);
      } catch (error) {
        console.error("Error fetching account data:", error);
      }
    };
   

    fetchcontactData();
   
  }, [id]);

  const handleProfileImageUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      try {
        const fileUrl = await uploadToBlob(selectedFile);
        setProfileImage(fileUrl);
        console.log(profileImage);
        console.log(fileUrl);
  
        // Save the profile image URL to the backend
        await axiosInstance.patch(`/contacts/${id}/`, { profile_image_url: fileUrl });
  
        // Optionally, fetch the updated account data to update the state
        console.log('Sending POST request to backend...');
        const response = await axiosInstance.post('/documents/', {
            name: selectedFile.name,
            document_type: selectedFile.type,
            description: 'Your file description',
            file_url: fileUrl,
            entity_type: 10,
            entity_id: id,
            tenant: tenantId,
        });
        console.log('POST request successful, response:', response.data);
       
      } catch (error) {
        console.error('Error uploading profile image:', error);
      }
    }
  };

  useEffect(() => {
    const fetchProfileImage = async () => {
        try {
            console.log('Fetching profile image for account:', id);
            console.log('Tenant ID:', tenantId);

            const response = await axiosInstance.get(`/return-documents/10/${id}`);
            console.log('GET request successful, response:', response.data);

            const documents = response.data.documents;
            console.log('Documents array:', documents);

            if (documents && documents.length > 0) {
                const profileImage = documents[0].file;
                console.log('Found profile image:', profileImage);
                setProfileImage(profileImage);
            } else {
                console.log('No profile image found.');
                setProfileImage(null); // Set a default image URL or null if no image found
            }
        } catch (error) {
            console.error('Error fetching profile image:', error);
        }
    };

    if (id && tenantId) {
        fetchProfileImage();
    }
}, [id, tenantId]);
 
  const fetchTimeline = async () => {
    try {
      const response = await axiosInstance.get(`/interaction/5/${id}/`);
      setTimeline(response.data.interactions); // Set the timeline with interactions array
      console.log('Timeline data fetched successfully:', response.data);
    } catch (error) {
      console.error('Error fetching timeline data:', error);
    }
  };
  const toggleTimeline = async () => {
    setShowTimeline(prevShowTimeline => !prevShowTimeline);
    if (!showTimeline && timeline.length === 0) { // Check if timeline is empty
      await fetchTimeline();
    }
  };
  
 


 
  
  const handleScrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      const response = await axiosInstance.get(`/documents/?entity_type=10&entity_id=${id}&tenant=${tenantId}&userId=3`);
      setUploadedFiles(response.data);
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
    }
  };
  
  // Assuming fetchUploadedFiles is called within a useEffect hook
  useEffect(() => {
    fetchUploadedFiles();
  }, [id, tenantId]);
  

  const relatedListItems = [
    "Notes",
    "Cadences",
    "Attachments",
    "Deals",
    "Open Activities",
    "Closed Activities",
    "Invited Meetings",
    "Products",
    "Cases",
    "Quotes",
    "Sales Orders",
    "Purchase Orders",
    "Emails",
    "Invoices",
  ];
  
  const handleUploadedFile = async (event) => {
    const selectedFile = event.target.files[0];
    console.log('Selected file:', selectedFile);
    
    if (selectedFile) {
      setFile(selectedFile);
      console.log('File state set:', selectedFile);
  
      try {
        console.log('Uploading file to Azure Blob Storage...');
        const fileUrl = await uploadToBlob(selectedFile);
        console.log('File uploaded to Azure, URL:', fileUrl);
  
        console.log('Sending POST request to backend...');
        const response = await axiosInstance.post('/documents/', {
          name: selectedFile.name,
          document_type: selectedFile.type,
          description: 'Your file description',
          file_url: fileUrl,
          entity_type: 1,
          entity_id: id,
          tenant: tenantId,
          userId: 3,  // hardcoded user ID
        });
        console.log('POST request successful, response:', response.data);
  
        setUploadedFiles(prevFiles => [...prevFiles, { name: selectedFile.name, url: fileUrl }]);
        console.log('File uploaded successfully:', response.data);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      console.log('No file selected');
    }
  };
  
  
  

  const handleChange = (e, field) => {
    // Handle input changes and update corresponding state variables
    const value = e.target.value;
    setContactInfo(prevState => ({
      ...prevState,
      [field]: value
    }));
  };
  const handleAddNote = (event) => {
    event.preventDefault();
    const newNote = {
      id: new Date().getTime(),
      text: contactinfo.Notes,
    };

    setContactInfo({
      ...contactinfo,
      RecentNotes: [newNote, ...contactinfo.RecentNotes],
      Notes: "",
    });
  };
  const handleSaveButtonClick = async () => {
    const interactionData = {
      entity_type: "Contact", // Change the entity type as needed (e.g., "Account")
      entity_id: id, // Change the entity ID to match the current entity
      interaction_type: "Note",
      tenant_id: tenantId, // Make sure you have tenant_id available
      notes: "Account info changed in contact", 
      interaction_datetime: new Date().toISOString(),
    };
  
    try {
      await axiosInstance.post('/interaction/', interactionData);
      console.log('Interaction logged successfully');
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  };
  

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.put(`/contacts/${id}/`, contactinfo);
      console.log("Contact information updated:", response.data);
      setIsEditing(false); 
      setIsEditingContactInfo(false); // Add this line to reset editing state

      await handleSaveButtonClick();

    } catch (error) {
      console.error("Error updating contact information:", error);
    }
  };
  const handleAttach = () => {
    console.log("Attach happened");
  };
  const handleNew = () => {
    console.log("Add New happened");
  };

  const toggleAdditionalDetails = () => {
    setContactInfo(!contactinfo);
  };

  const handleAddMeeting = (event) => {
    event.preventDefault();
    const newMeeting = {
      CadenceName: contactinfo.CadenceName,
      Modules: contactinfo.Modules,
      CreatedDate: contactinfo.CreatedDate,
      CreatedBy: contactinfo.createdBy,
    };
    setMeetings([...meetings, newMeeting]);
    setContactInfo({
      ...contactinfo,
      CadenceName: "",
      Modules: "",
      CreatedDate: "",
      createdBy: "",
    });
    setModalOpen1(false);
  };
  useEffect(() => {
    const generateRandomColor = () => {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    if (!photoColor) {
      setPhotoColor(generateRandomColor());
    }
  }, [photoColor]); 
  const generateSmiley2 = (color) => (
    <div className="colored-circle2" style={{ backgroundColor: color, color:"white" }}>
      <span className="material-icons" style={{ fontSize: "60px", fontFamily: "'Material Symbols Outlined'" }}>person</span>
    </div>
  );

  const handleOtherNoted=()=>{
    setIsEditingInfoNote(true);
   seteditNote(contactinfo.Notes);

  }
  const handleOtherNotedCancel=()=>{
    setIsEditingInfoNote(false);
   seteditNote(contactinfo.Notes);

  }

  const handleOtherInfo=()=>{
    setIsEditingInfo(true);
    seteditmailingStreet(contactinfo.MailingStreet);
    seteditmailingZip(contactinfo.MailingZip);
    seteditmailingCountry(contactinfo.MailingCountry);
    seteditmailingCity(contactinfo.MailingCity);
    seteditotherCountry(contactinfo.OtherCountry);
    seteditotherCity(contactinfo.OtherCity);
    seteditotherState(contactinfo.OtherState);
    seteditotherZip(contactinfo.OtherZip);

  }
  const handleCancelOtherInfo=()=>{
    setIsEditingInfo(false);
    seteditmailingStreet(contactinfo.MailingStreet);
    seteditmailingZip(contactinfo.MailingZip);
    seteditmailingCountry(contactinfo.MailingCountry);
    seteditmailingCity(contactinfo.MailingCity);
    seteditotherCountry(contactinfo.OtherCountry);
    seteditotherCity(contactinfo.OtherCity);
    seteditotherState(contactinfo.OtherState);
    seteditotherZip(contactinfo.OtherZip);

  }
  const handleEditContactInfo = () => {
    setIsEditingContactInfo(true);
    // Set edited values for contact info
    setEditedEmail(contactinfo.email);
    setEditedPhone(contactinfo.phone);
    setEditedAddress(contactinfo.address);
    setEditedAccount(contactinfo.account);
  };
  const handleCancelContactInfo = () => {
    setIsEditingContactInfo(false);
    // Reset edited values for contact info
    setEditedEmail(contactinfo.email);
    setEditedPhone(contactinfo.phone);
    
    setEditedAddress(contactinfo.address);
    setEditedAccount(contactinfo.account);
    
  };
  const handleEdit = () => {
    setIsEditing(true);
  setEditedOtherPhone(contactinfo.OtherPhone)
  setEditedAccount(contactinfo.account);
  setEditedAccountName(contactinfo.accountName);
  setEditedLeadSource(contactinfo.leadSource);
  seteditedVendorName(contactinfo.vendorName);
  setEditedContactName(contactinfo.ContactName);
  setEditedAssistant(contactinfo.assistant);
  setCreatedBy(contactinfo.createdBy);
  setModifiedBy(contactinfo.ModifiedBy);
  setEditedCurrency(contactinfo.Currency1);
  setEditFax(contactinfo.Fax);
  setEditDOB(contactinfo.DateOfBirth);
  setEditAsstphone(contactinfo.AsstPhone);
  setEmailOptOut(contactinfo.emailOptOut);
  setSkypeID(contactinfo.SkypeId);
  setSecondaryEmail(contactinfo.secondaryEmail);
  seteditTwitter(contactinfo.Twitter);
  


  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset edited values to the original values
    setEditedEmail(contactinfo.email);
    setEditedPhone(contactinfo.phone);
    setEditedOtherPhone(contactinfo.OtherPhone)

    setEditedAddress(contactinfo.address);
    setEditedAccount(contactinfo.account);
    setEditedAccountName(contactinfo.accountName);
    setEditedLeadSource(contactinfo.leadSource);
    seteditedVendorName(contactinfo.vendorName);
    setEditedContactName(contactinfo.ContactName);
    setEditedAssistant(contactinfo.assistant);
    setCreatedBy(contactinfo.createdBy);
    setModifiedBy(contactinfo.ModifiedBy);
    setEditedCurrency(contactinfo.Currency1);
    setEditFax(contactinfo.Fax);
    setEditDOB(contactinfo.DateOfBirth);
    setEditAsstphone(contactinfo.AsstPhone);
    setEmailOptOut(contactinfo.emailOptOut);
    setSkypeID(contactinfo.SkypeId);
    setSecondaryEmail(contactinfo.secondaryEmail);
    seteditTwitter(contactinfo.Twitter);
  };


  const renderFiles = (files) => {
    return files.map((file, index) => (
      <li key={index} className="account-file-item">
        <span className="file-icon">📄</span>
        <a href={file.url} target="_blank" rel="noopener noreferrer"  onClick={() => handleFileClick(file)}>{file.name}</a>
      </li>
    ));
  };


 
  return (
    <div>
    <div className="contact_nav">
  <TopNavbar/>
</div>
  <div className="cont__info">
    <div className="classs">
     
    </div>
    

    <div className="pages">
      
     <div className="sidebar1">
      <ul>
        {relatedListItems.map((item) => (
          <li key={item}>
            <a href={`#${item}`} onClick={() => handleScrollToSection(item)}>
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>

      <div className="relatedList-Contacts">
            <Link to={`../${tenantId}/contacts`}> Back</Link>
          </div>


      
      <div></div>
      <div className="blank-page" >
        <div className="contact-details">
          <h1>
            Contact Details
          </h1>
          <div>
          <h2 className="detail-owner1"> {contactinfo.first_name}</h2>
          <h2 className="owner3"> {contactinfo.address}</h2>
          <div className="photo11">
            
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="contact-profile-image" />
          ) : (
            generateSmiley2(photoColor)
          )}
          <label htmlFor="profile-image-upload" className="profile-upload-button">
            Upload Image
            <input
              type="file"
              id="profile-image-upload"
              onChange={handleProfileImageUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
          <a
              className="visitLinkedin"
              href={contactinfo.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Linkedin link
            </a>
          </div>
       
        </div>
    


        <div className="info-contactOwner" >
          <h2 className="owner">Contact Owner</h2>
       
          <div className="para1">
      {isEditingContactInfo  ? (
        <>
          <p>
            <strong className="contactinfo-para1">Email:</strong>
            <input
              type="text"
              value={contactinfo.email}

              onChange={(e) => handleChange(e, 'email')}
              className="contactinfo_email"
            />
          </p>
          <p>
            <strong className="contactinfo-para2">Phone:</strong>
            <input
              type="text"
              value={contactinfo.phone}
              onChange={(e) => handleChange(e, 'phone')}
              className="contactinfo_phone"
            />
          </p>
          <p>
            <strong className="contactinfo-para3">Address:</strong>
            <input
              type="text"
              value={contactinfo.address}
              onChange={(e) => handleChange(e, 'address')}
              className="contactinfo_address"
            />
          </p>
          <p>
            <strong className="contactinfo-para4">Account:</strong>
            <input
              type="text"
              value={contactinfo.account}
              onChange={(e) => handleChange(e, 'account')}
              className="contactinfo_account"
            />
          </p>
          <button onClick={handleSubmit} className="button-save1box">
            Save
          </button>
          <button onClick={handleCancelContactInfo} className="button-cancel1box">
            Cancel
          </button>
        </>
      ) : (
        <>
          <p>
            <strong className="contactinfo-para1">Email:</strong>
            <div className="contactinfo_email">{contactinfo.email}</div>
          </p>
          <p>
            <strong className="contactinfo-para2">Phone:</strong>
            <div className="contactinfo_phone">{contactinfo.phone}</div>
          </p>
          <p>
            <strong className="contactinfo-para3">Address:</strong>
            <div className="contactinfo_address">{contactinfo.address}</div>
          </p>
          <p>
            <strong className="contactinfo-para4">Account:</strong>
            <div className="contactinfo_account">{contactinfo.account}</div>
          </p>
          <button onClick={handleEditContactInfo} className="edit-box1">
            Edit
          </button>
        </>
      )}
    </div>

        </div>

        <div className="button-group">
  <div>
    <button className="button-overview">Overview</button>
  </div>
  <div>
    <button className="button-timeline" onClick={toggleTimeline}>
            {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
          </button>
  </div>
</div>

 <div>
 {!showTimeline && (
    <div>

      
    <div className="info-hideandshowDetail">

<div className="hidedetail">
<button onClick={toggleAdditionalDetails}>
             {contactinfo ? "Hide Details" : "Show Details"}
           </button>
</div>
<div className="showdetails">
 <div className="showdetailsdata">
 {isEditing ? (
     <>
     <p>
         <strong className="contactdetails-para2">Account Name:</strong>
         <input
           type="text"
           value={contactinfo.accountName}
           onChange={(e) => handleChange(e, 'accountName')}
           className="contactinfo_accountName1"
         />
       </p>
       <p>
         <strong className="contactdetails-para1">Email:</strong>
         <input
           type="text"
           value={contactinfo.email}
           onChange={(e) => handleChange(e, 'email')}
           className="contactinfo_email1"
         />
       </p>
       
       <p>
         <strong className="contactdetails-para3">Lead Source:</strong>
         <input
           type="text"
           value={contactinfo.leadSource}
           onChange={(e) => handleChange(e, 'leadSource')}
           className="contactinfo_leadSource1"
         />

       </p>
     
     
       <button onClick={handleSubmit} className="button-saves">
         Save
       </button>
       <button onClick={handleCancel} className="button-cancels">
         Cancel
       </button>
     </>
   ) : (
   <>
   <p>
     <strong className="contactdetails-para1">Account Name: </strong>
     <div className="contactinfo_accountName">{contactinfo.accountName}</div>
   </p>
   <p>
     <strong className="contactdetails-para2">Email: </strong>
     <div className="contactinfo_Email">{contactinfo.email}</div>
   </p>
   <p>
     <strong className="contactdetails-para3">Lead Source: </strong>
     <div className="contactinfo_leadSource">{contactinfo.leadSource}</div>
   </p>
 
   </>
     )}
 </div>
 <div className="show-hideDetails">
 {isEditing ? (
     <>
     <p>
         <strong className="contactdetails-para4">Contact Name:</strong>
         <input
           type="text"
           value={contactinfo.ContactName}
           onChange={(e) => handleChange(e, 'ContactName')}
           className="contactinfo_leadSource1"
         />
       </p>
       <p>
         <strong className="contactdetails-para5">Vendor Name:</strong>
         <input
           type="text"
           value={contactinfo.vendorName}
           onChange={(e) => handleChange(e, 'vendorName')}
           className="contactinfo_leadSource1"
         />
       </p>
       
       <p>
         <strong className="contactdetails-para6">Other Phone:</strong>
         <input
           type="text"
           value={contactinfo.OtherPhone}
           onChange={(e) => handleChange(e, 'OtherPhone')}
           className="contactinfo_leadSource1"
         />
       </p>
       <p>
         <strong className="contactdetails-para7">Address:</strong>
         <input
           type="text"
           value={contactinfo.address}
           onChange={(e) => handleChange(e, 'address')}
           className="contactinfo_leadSource1"
         />
       </p>
     
       
     </>
   ) : (

   <>
   <p>
     <strong className="contactdetails-para4">Contact Name:</strong>
     <div className="contactinfo_ContactName">{contactinfo.ContactName}</div>
   </p>
   <p>
     <strong className="contactdetails-para5">Vendor Name:</strong>
     <div className="contactinfo_vendorName">{contactinfo.vendorName}</div>
   </p>
   <p>
     <strong className="contactdetails-para6">Other Phone: </strong>
     <div className="contactinfo_OtherPhone">{contactinfo.OtherPhone}</div>
   </p>
   <p>
     <strong className="contactdetails-para7">Address: </strong>
     <div className="contactinfo_Address">{contactinfo.address}</div>
   </p>
   <button onClick={handleEdit} className="edit-box2">
         Edit
       </button>
   </>

   )}
 </div>
</div>
{contactinfo && (
 <div className="detail">
   <h3 className="additional">Additional Details:</h3>
   <div className="add">
     <div className="adddetail_1">
     {isEditing ? (
     <>
     <p>
         <strong className="contactdetails-para8">Assistant:</strong>
         <input
           type="text"
           value={contactinfo.assistant}
           onChange={(e) => handleChange(e, 'assistant')}
           className="contactinfo_leadSource1"
         />
       </p>
       <p>
         <strong className="contactdetails-para9">Created By:</strong>
         <input
           type="text"
           value={contactinfo.createdBy}
           onChange={(e) => handleChange(e, 'createdBy')}
           className="contactinfo_leadSource1"
         />
       </p>
       
       <p>
         <strong className="contactdetails-para10">Modified By:</strong>
         <input
           type="text"
           value={contactinfo.ModifiedBy}
           onChange={(e) => handleChange(e, 'ModifiedBy')}
           className="contactinfo_leadSource1"
         />
       </p>
       <p>
         <strong className="contactdetails-para11"> Currency :</strong>
         <input
           type="text"
           value={contactinfo.Currency1}
           onChange={(e) => handleChange(e, 'Currency1')}
           className="contactinfo_leadSource1"
         />
       </p>
       <p>
         <strong className="contactdetails-para12">Account:</strong>
         <input
           type="text"
           value={contactinfo.account}
           onChange={(e) => handleChange(e, 'account')}
           className="contactinfo_leadSource1"
         />
       </p>
       <p>
         <strong className="contactdetails-para13"> Fax :</strong>
         <input
           type="text"
           value={contactinfo.Fax}
           onChange={(e) => handleChange(e, 'Fax')}
           className="contactinfo_leadSource1"
         />
       </p>
     
     
     </>
   ) : (

       <>
       <p>
         <strong className="contactdetails-para8">Assistant: </strong>
         <div className="contactinfo_assistant">{contactinfo.assistant}</div>
       </p>
       <p>
         <strong className="contactdetails-para9">Created By: </strong>
         <div className="contactinfo_createdBy">{contactinfo.createdBy}</div>
       </p>
       <p>
         <strong className="contactdetails-para10">Modified By: </strong>
         <div className="contactinfo_modifiedBy">{contactinfo.ModifiedBy}</div>
       </p>
      

       </>
   )}
    
     </div>
     <div className="hide_show">
     {isEditing ? (
     <>
     <p>
         <strong className="contactdetails-para14">Date of Birth:</strong>
         <input
           type="text"
           value={contactinfo.DateOfBirth}
           onChange={(e) => handleChange(e, 'DateOfBirth')}
           className="contactinfo_leadSource1"
         />
       </p>
       <p>
         <strong className="contactdetails-para15">Asst Phone:</strong>
         <input
           type="text"
           value={contactinfo.AsstPhone}
           onChange={(e) => handleChange(e, 'AsstPhone')}
           className="contactinfo_leadSource1"
         />
       </p>
       
       <p>
         <strong className="contactdetails-para16">Email Opt Out:</strong>
         <input
           type="text"
           value={contactinfo.emailOptOut}
           onChange={(e) => handleChange(e, 'emailOptOut')}
           className="contactinfo_leadSource1"
         />
       </p>
  
       
     
      
     </>
   ) : (
       <>
       <p>
         <strong className="contactdetails-para14">Date of Birth: </strong>
         <div className="contactinfo_DOB">{contactinfo.DateOfBirth}</div>
       </p>
       <p>
         <strong className="contactdetails-para15">Asst Phone: </strong>
         <div className="contactinfo_Asst">{contactinfo.AsstPhone}</div>
       </p>
       <p>
         <strong className="contactdetails-para16"> Email Opt Out: </strong>
         <div className="contactinfo_emailopt">{contactinfo.emailOptOut ? "Yes" : "No"}</div>
       </p>
   
     
       </>
   )}
      
     </div>
   </div>
 </div>
)}
</div>








        <div className="info_AdditionalDetails">
          <h2 className="addinfo1"> Additional Information</h2>
         
          <div className="locate-map-button-container">
            <button className="locate-map-button">
              <span className="locate-map-button-text">Locate Map</span>
            </button>
          </div>

          <div className="add">
            <div className="OtherMailing">
            {isEditingInfo ? (
        <>
        <p>
            <strong className="contactdetails-para20">Mailing Street:</strong>
            <input
              type="text"
              value={contactinfo.MailingStreet}
              onChange={(e) => handleChange(e, 'MailingStreet')}
              className="contactinfo_leadSource1"
            />
          </p>
          <p>
            <strong className="contactdetails-para21">Mailing Zip :</strong>
            <input
              type="text"
              value={contactinfo.MailingZip}
              onChange={(e) => handleChange(e, 'MailingZip')}
              className="contactinfo_leadSource1"
            />
          </p>
          
          <p>
            <strong className="contactdetails-para22">Mailing Country :</strong>
            <input
              type="text"
              value={contactinfo.MailingCountry}
              onChange={(e) => handleChange(e, 'MailingCountry')}
              className="contactinfo_leadSource1"
            />
          </p>
          <p>
            <strong className="contactdetails-para23"> Mailing City:</strong>
            <input
              type="text"
              value={contactinfo.MailingCity}
              onChange={(e) => handleChange(e, 'MailingCity')}
              className="contactinfo_leadSource1"
            />
          </p>
         
        
          <button onClick={handleSubmit} className="button-saves1">
            Save
          </button>
          <button onClick={handleCancelOtherInfo} className="button-cancels1">
            Cancel
          </button>
        </>
      ) : (  
              <>
              <p>
                <strong className="contactdetails-para20"> Mailing Street: </strong>
                <div className="contactinfo_mailingstreet"> {contactinfo.MailingStreet}</div>
              </p>
              <p>
                <strong className="contactdetails-para21"> Mailing Zip: </strong>
                <div className="contactinfo_mailingzip"> {contactinfo.MailingZip}</div>
              </p>
              <p>
                <strong className="contactdetails-para22"> Mailing Country: </strong>
                <div className="contactinfo_mailingcountry"> {contactinfo.MailingCountry}</div>
              </p>
              <p>
                <strong className="contactdetails-para23"> Mailing City: </strong>
                <div className="contactinfo_mailingcity"> {contactinfo.MailingCity}</div>
              </p>
            
              </>
      )}
                           
            </div>
            <div className="othercontactinfo">
            {isEditingInfo ? (
        <>
        <p>
            <strong className="contactdetails-para24">Other Country:</strong>
            <input
              type="text"
              value={contactinfo.OtherCountry}
              onChange={(e) => handleChange(e, 'OtherCountry')}
              className="contactinfo_leadSource1"
            />
          </p>
          <p>
            <strong className="contactdetails-para25">Other City :</strong>
            <input
              type="text"
              value={contactinfo.OtherCity}
              onChange={(e) => handleChange(e, 'OtherCity')}
              className="contactinfo_leadSource1"
            />
          </p>
          
          <p>
            <strong className="contactdetails-para26">Other State :</strong>
            <input
              type="text"
              value={contactinfo.OtherState}
              onChange={(e) => handleChange(e, 'OtherState')}
              className="contactinfo_leadSource1"
            />
          </p>
          <p>
            <strong className="contactdetails-para27"> Other Zip:</strong>
            <input
              type="text"
              value={contactinfo.OtherZip}
              onChange={(e) => handleChange(e, 'OtherZip')}
              className="contactinfo_leadSource1"
            />
          </p>
         
        
          <button onClick={handleSubmit} className="button-save2">
            Save
          </button>
          <button onClick={handleCancelOtherInfo} className="button-cancel2">
            Cancel
          </button>
        </>
      ) : ( 
              <>
              <p>
                <strong className="contactdetails-para24"> Other Country: </strong>
                <div className="contactinfo_othercountry"> {contactinfo.OtherCountry}</div>
              </p>
              <p>
                <strong className="contactdetails-para25"> Other City: </strong>
                <div className="contactinfo_othercity"> {contactinfo.OtherCity}</div>
              </p>
              <p>
                <strong className="contactdetails-para26"> Other State: </strong>
                <div className="contactinfo_otherstate"> {contactinfo.OtherState}</div>
              </p>
              <p>
                <strong className="contactdetails-para27"> Other Zip: </strong>
                <div className="contactinfo_otherzip"> {contactinfo.OtherZip}</div>
              </p>
              <button onClick={handleOtherInfo} className="button-editmail">
            Edit
          </button>

              </>
      )}
             
            </div>
          </div>
         
        </div>
        <div  id="Notes" className="info_notes">
          <div className="notes-container">
            <div className="recent">
              <div className="notes">
                <h1 className="note-head-contact">Notes</h1>
              </div>

              <div className="Noted-head">
                <button className="recent-notes-button"> Recent Notes</button>

                <ul className="recent-notes-list">
                  {/* {contactinfo.RecentNotes.map(note => (
                    <li key={note.id}>{note.text}</li>
                  ))} */}
                </ul>
              </div>
            </div>
            {isEditingInfoNote ? (
        <>
        <p>
            <input
              type="text"
              value={contactinfo.Notes}
              onChange={(e) => handleChange(e, 'Noted')}
              className="notes-textarea"
            />
          </p>
        
         
        
          <button onClick={handleSubmit} className="button-save2">
            Save
          </button>
          <button onClick={handleOtherNotedCancel} className="button-cancel2">
            Cancel
          </button>
        </>
      ) : ( 

          <>
          <form onSubmit={handleAddNote}>
              <textarea
                name="Notes"
                value={contactinfo.Notes}
                onChange={handleChange}
                className="notes-textarea"
                placeholder="Add Notes........"
              >

              </textarea>
              
            </form>
            <button onClick={handleOtherNoted} className="button-editmail1">
            Edit
          </button>
          </>
      )}
          </div>
        </div>
        

        <div className="info_Attach" id="Attachments">
      <div className="info1">
        <div>
          <h2 className="heads_Attach">Attachments</h2>
        </div>
        <div className="attachment-upload1">
          <input
            type="file"
            id="attachment-input"
            onChange={handleUploadedFile}
            style={{ display: 'none' }}
          />
          <label htmlFor="attachment-input">
            <div className="clicktoupload1">click to upload</div>
          </label>
        </div>
        <div className="uploaded-files">
          <ul>
            {renderFiles(uploadedFiles.slice(0, 3))}
          </ul>
          {uploadedFiles.length > 3 && (
            <a href="#" className="show-more-button" onClick={handleMoreClick}>
              Show More
              {showAllFiles ? ' Show Less' : ''}
            </a>
          )}
        </div>
        {showAllFiles && (
          <div className="popup">
            <div className="popup-content">
              <h2>Uploaded Files</h2>
              <button className="close-button" onClick={handleMoreClick}>Close</button>
              <ul>
                {renderFiles(uploadedFiles)}
              </ul>
            </div>
          </div>
        )}
      </div>
      {selectedFile && (
        <div className="file-popup">
          <div className="file-popup-content">
            <div className="file-popup-header">
              <h2>{selectedFile.name}</h2>
              <button onClick={handleDownload}>Download</button>
              <button onClick={closePopup}>Close</button>
            </div>
            <TransformWrapper>
              <TransformComponent>
                <iframe
                  src={selectedFile.file_url}
                  style={{ width: '100%', height: '500px' }}
                  title={selectedFile.name}
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}
    </div>
        <div className="info_deals" id='Deals'>
          <h2 className="info_deals2">Deals</h2>
          <div className="deal">
            <button>+New Deal</button>
          </div>
        </div>

        <div className="info_activities">
          <div className="actvities" id='Open Activities'>
            <div>
              <h2 className='open_activity'>Open Activities</h2>
            </div>
            <div className="added">
              <select onChange={handleNew}>
                <option value="">+Add New Activity</option>

                <option value="1">Task</option>
                <option value="2"> meeting </option>
                <option value="3">call</option>
              </select>
            </div>
          </div>
        </div>
        <div className="info_closed"  id='Closed Activities'>
          <h2 className="closed_activity">Closed Activities</h2>
        </div>
        <div className="info_meeting" id='Invited Meetings'>
          <h2 className="invite_meet">Invite Meetings</h2>
          <div className="meeting_cont"
          >
         
            <div className="meeting_container">
            <h1 className="meet_title">Meeting title</h1>
            <div>
              <p className="timing"> 10:00 - 11:00 AM</p>
              <p className="rooms"> Room 20</p>
           <h1 className="externals"> External
            </h1>
            </div>
            </div>
            <div className="meeting_container1">
            <h1 className="meet_title">Meeting title</h1>
            <div>
              <p className="timing"> 10:00 - 11:00 AM</p>
              <p className="rooms"> Room 20</p>
           <h1 className="externals"> External
            </h1>
            </div>
            </div>
          </div>
        </div>
        <div className="info_product" id='Products'>
          <h2 className="info-pro">Products</h2>
          <div className="productsbtn">
            <button>+Add Products</button>
          </div>
        </div>
       
    
    

   
     <div className="info_cop">
       <h2 className="infi-campi">campaigns</h2>
       <div className="productsbtn">
         {" "}
         <button>Add Compaigns</button>
       </div>
     </div>
     <div className="info_social">
<h2 className="infi-campi">Social</h2>
<div className="facebook" style={{ color: "#9095A1FF" }}>
<FacebookRoundedIcon className="facebook-icon" style={{ fontSize: 30  }} />
</div>
<div className="twitter" style={{ color: "#9095A1FF" }}>
<TwitterIcon className="twitter-icon" style={{ fontSize: 30 }} />
</div>
<div className="whatsapp" style={{ color: "#9095A1FF" }}>
<WhatsAppIcon className="whatsapp-icon" style={{ fontSize: 30 }} />
</div>
</div>

    </div>
 )}
    {showTimeline && timeline.length > 0 && (
  <div className="timeline-contact">
    <div className='timeline-btn-contact'>
      <button className='timeline-btn1-contact'>Deals</button>
      <button className='timeline-btn2-contact'>Messages</button>
      <button className='timeline-btn3-contact'>Schedule</button>
      <button className='timeline-btn4-contact'>Activity Log </button>
    </div>
    <ul>
      {timeline.map((interaction, index) => (
        <li className='timeline-oopo1' key={index} >
        <div>
        <div className='data-timeline-contact'>
            <p className='textdesign-contact'>  <TextSnippetRoundedIcon style={{height:'40px',width:'30px',fill:'#F9623EFF',marginLeft:'7px'  }}/>   </p>
            <h1 className='contract-contact'>Signed Contract</h1>
          </div>

        
          <div className='timeline_data1-contact'>
          {interaction.interaction_type}

          </div>
        </div>
        <div className='dotted-line'></div>

         <div className='time-box2-contact'>
         <div className='data-timeline-contact'>
            <p className='textdesign1-contact'>  <CallRoundedIcon style={{height:'40px',width:'30px',fill:'#6D31EDFF',marginLeft:'7px'  }}/>   </p>
            <h1 className='contract-contact'>Made Call</h1>
          </div>
          <div className='timeline_data1-contact'>
          {interaction.datetime}

          </div>
         </div>
         <div className='dotted-line'></div>
         <div className='time-box2-contact'>
         <div className='data-timeline-contact'>
            <p className='textdesign1-contact'>  <FactCheckRoundedIcon style={{height:'40px',width:'30px',fill:'#3D31EDFF',marginLeft:'7px'  }}/>   </p>
            <h1 className='contract-contact'>Sent email</h1>
          </div>
          <div className='timeline_data1-contact'>
          {interaction.datetime}

          </div>

         </div>
         <div className='dotted-line'></div>
         <div className='time-box2-contact'>
         <div className='data-timeline-contact'>
            <p className='textdesign1-contact'>  <MailOutlineRoundedIcon style={{height:'40px',width:'30px',fill:'#FF56A5FF',marginLeft:'7px'  }}/>   </p>
            <h1 className='contract-contact'>Called</h1>
          </div>
          <div className='timeline_data1-contact'>
          {interaction.interaction_type}

          </div>
         </div>
        </li>
      ))}
    </ul>
  </div>
)}

 </div>
        
    
      </div>
    </div>
  </div>
</div>


  );
};

export default ContactInfo;
