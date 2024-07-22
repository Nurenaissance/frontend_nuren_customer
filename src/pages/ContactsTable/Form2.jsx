import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import CreateNewAccountForm from "./CreateNewAccountForm";
import Select from "react-select"; 
import { Link, useParams } from "react-router-dom";
import SentimentSatisfiedRoundedIcon from '@mui/icons-material/SentimentSatisfiedRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import axiosInstance from "../../api";
import { useAuth } from "../../authContext";
import { useNavigate } from "react-router-dom";
import "./contactsTable.css";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path

const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};

const Popup = ({ errors, onClose }) => (
  <div className="product-popup">
    <div className="product-popup-content">
      <h2>Error</h2>
      <button className="product-popup-close" onClick={onClose}>Ok</button>
      <ul>
        {Object.entries(errors).map(([field, errorList]) => (
          <li key={field}>
            {field.replace(/_/g, ' ')}: {errorList[0]} {/* Assuming single error message per field */}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
const SuccessPopup = ({ message, onClose }) => (
  <div className="product-popup2">
    <div className="product-popup-content2">
      <h2>Contact Created Sucessfully</h2>
      <button className="product-popup-ok-button2" onClick={onClose}>OK</button>
    </div>
  </div>
);

function Form2() {
  const navigate = useNavigate();
  const tenantId = getTenantIdFromUrl();
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
  };

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [contacts, setContacts] = useState([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftedContact, setDraftedContact] = useState(null);
  const [contactData, setContactData] = useState({
    ContactOwner: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    OtherPhone: "",
    Mobile: "",
    Assistant: "",
    Currency1: "",
    address: "",
    MailingStreet: "",
    MailingCity: "",
    MailingState: "",
    MailingZip: "",
    MailingCountry: "",
    Fax: "",
    DateOfBirth: "",
    AsstPhone: "",
    SkypeId: "",
    SecondaryEmail: "",
    Twitter: "",
    ReportingTo: "",
    createdBy: "",
    description: "",
    AccountName: "",
    name: "",
    account: "",
  });

  const [accountOptions, setAccountOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const { userId } = useAuth();
  const [formErrors, setFormErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorFields, setErrorFields] = useState({});

  const [photoColor, setPhotoColor] = useState(""); // Declare photoColor state variable

  useEffect(() => {
    fetchAccountOptions();
  }, []);

  useEffect(() => {
    // Generate a random color when the component mounts
    const randomColor = generateRandomColor();
    setPhotoColor(randomColor);
  }, []);

  const fetchAccountOptions = async () => {
    try {
      const response = await axiosInstance.get('/accounts/');
      setAccountOptions(response.data);
      setFilteredOptions(response.data);
    } catch (error) {
      console.error("Error fetching account options:", error);
    }
  };

  const [showCreateNewAccountForm, setShowCreateNewAccountForm] = useState(false);

  const handleChange = (event) => {
    if (event && event.target) {
      const { name, value } = event.target;
      const updatedErrorFields = { ...errorFields };
      delete updatedErrorFields[name];
      setErrorFields(updatedErrorFields);
      setContactData({
        ...contactData,
        [name]: value,
      });
      if (name === "name") {
        const filtered = accountOptions.filter((option) =>
          option.Name.toUpperCase().startsWith(value.toUpperCase())
        );
        setFilteredOptions(filtered);
      }
    } else {
      // Handle changes from Select component
      setContactData({
        ...contactData,
        account: event.value,
      });
      if (event.value === "create-new-account") {
        handleOpen();
      }
    }
  };

  useEffect(() => {
    // Set initial error fields based on formErrors
    const initialErrorFields = {};
    Object.keys(formErrors).forEach(field => {
      initialErrorFields[field] = true;
    });
    setErrorFields(initialErrorFields);
  }, [formErrors]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const tenantId = getTenantIdFromUrl(); // Get tenant ID from the URL
      const dataToSend = {
        ...contactData,
        createdBy: userId, // Pass userId as createdBy
        tenant: tenantId,

      };
      const response = await axiosInstance.post('/contacts/',dataToSend);
      const contactId = response.data.id;
      const interactionData = {
        entity_type: "Contact",
        entity_id: contactId,
        interaction_type: "Note",
        tenant_id: tenantId, // Make sure you have tenant_id in movedCard
        notes: `Contact created with id : ${contactId} created by user : ${userId}`,
        interaction_datetime: new Date().toISOString(),
      };

      setShowSuccessPopup(true);
      setSuccessMessage(true);

      try {
          await axiosInstance.post('/interaction/', interactionData);
          console.log('Interaction logged successfully');
        } catch (error) {
          console.error('Error logging interaction:', error);
        }
      console.log("Form submitted successfully:", response.data);
      setContactData({
        ContactOwner: "",
        first_name: "",
        last_name: "",
        AccountName: "",
        email: "",
        phone: "",
        OtherPhone: "",
        Mobile: "",
        address: "",
        Assistant: "",
        Currency1: "",
        MailingStreet: "",
        MailingCity: "",
        MailingState: "",
        MailingZip: "",
        MailingCountry: "",
        Fax: "",
        DateOfBirth: "",
        AsstPhone: "",
        SkypeId: "",
        SecondaryEmail: "",
        Twitter: "",
        ReportingTo: "",
        createdBy: "",
        description: "",
        account: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response) {
        // API error (e.g., 400 Bad Request, 500 Internal Server Error)
        setFormErrors(error.response.data || error.message);
      } else {
        // Network or other generic error
        setFormErrors({ networkError: 'Network Error. Please try again later.' });
      }
      setShowPopup(true);
    }
  };

  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleCancel = () => {
    const isConfirmed = window.confirm("Are you sure you want to cancel? Any unsaved data will be lost.");
    if (isConfirmed) {
      console.log("Cancel button clicked");
      localStorage.removeItem('contactDraft'); // Clear draft data
      window.location.href = `../${tenantId}/contacts`;
    }
  };
  
  const handleSubmitForm = (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    localStorage.removeItem('contactDraft'); // Clear draft data
    handleSubmit(event);
  };
  

  const generateSmiley4 = (color) => (
    <div className="colored-circle4" style={{ backgroundColor: color, color: "white" }}>
      <SentimentSatisfiedRoundedIcon style={{ fontSize: "50px" }} />
    </div>
  );
  const handleSaveAsDraft = async () => {
    setIsSavingDraft(true); // Set loading state
    
    try {
      const tenantId = getTenantIdFromUrl(); // Assuming you have a function to get tenantId from URL
      const dataToSend = {
        ...contactData, // Assuming contactData is your form data state
        createdBy: userId, // Assuming userId is available in scope
        tenant: tenantId,
        status: "Draft",
      };
  
      console.log('Data to send:', dataToSend);
  
      // Save draft data to localStorage
      localStorage.setItem('contactDraft', JSON.stringify(dataToSend));
  
      // Assuming axiosInstance is your Axios instance configured with baseURL
      await axiosInstance.post('/contacts/', dataToSend); // POST request to save draft
  
      console.log("Draft saved successfully");
  
      // Redirect to contacts list after saving draft
      navigate(`/${tenantId}/contacts`);
    } catch (error) {
      console.error("Error saving draft:", error);
  
      // Handle specific error cases
      if (error.response) {
        setFormErrors(error.response.data || error.message); // Set form errors from server response
      } else {
        setFormErrors({ networkError: 'Network Error. Please try again later.' }); // Handle network errors
      }
    } finally {
      setIsSavingDraft(false); // Reset loading state regardless of success or failure
    }
  };

  useEffect(() => {
    const draftData = localStorage.getItem('contactDraft');
    if (draftData) {
      setContactData(JSON.parse(draftData));
    }
  }, []);
  
  return (
   <div>
     <div className="contact_nav">
    <TopNavbar/>
  </div>
    <div className="contactfill_forms">
      {showCreateNewAccountForm && <CreateNewAccountForm />}
      <div className="back_container111">
        <div className="relatedList-Contacts3">
          <Link to={`../${tenantId}/contacts`}> Back</Link>
        </div>
      </div>
      <div>
        <Header name="Create Contact" />
        <div className='btnsss1'>
          <button type="button" onClick={handleCancel} className="btn-submit5">Cancel</button>
          <button type="save" onClick={handleSaveAsDraft} className="btn-submit4">Save as Draft</button>
          <button type="submit" onClick={handleSubmitForm} className="btn-submit6">Submit</button>
        </div>
        <div className="photo">
          {generateSmiley4(photoColor)}
        </div>
        <FileUploadRoundedIcon className="upload_icon1_contact" />
        <button className="upload_button1-image">Upload Image</button>
        <h1 className="cont_infoo">Contact Information</h1>
        <form onSubmit={handleSubmit}>
        <div className="contact_form_fill">
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="ContactOwner" className="contact_owner_form">Contact Owner:</label>
            <input
              type="text"
              className="form-control_contact-owner"
              id="ContactOwner"
              name="ContactOwner"
              value={contactData.ContactOwner}
              onChange={handleChange}
              placeholder="Enter contact Owner"
              style={{ borderColor: errorFields.ContactOwner ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="first_name" className="contact_first_name">First Name:</label>
            <input
              type="text"
              className="form-control_first_name"
              id="first_name"
              name="first_name"
              value={contactData.first_name}
              onChange={handleChange}
              placeholder="Enter First Name"
              style={{ borderColor: errorFields.first_name ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="last_name" className="contact_last_name">Last Name:</label>
            <input
              type="text"
              className="form-control_last_name"
              id="last_name"
              name="last_name"
              value={contactData.last_name}
              onChange={handleChange}
              placeholder="Enter last Name"
              style={{ borderColor: errorFields.last_name ? 'red' : '' }}
            />
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="email" className="contact_email">Email:</label>
            <input
              type="text"
              className="form-control-email"
              id="email"
              name="email"
              value={contactData.email}
              onChange={handleChange}
              placeholder="Enter email"
              style={{ borderColor: errorFields.email ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
  <label htmlFor="account" className="contact_account" style={{ backgroundColor: "#F3F4F6FF" }}>Account:</label>
  <div className="form-control_account3">
    <Select 
      options={[
        ...filteredOptions.map((option) => ({
          value: option.Name,
          label: option.Name,
        })),
        { value: "create-new-account", label: "Create New Account" },
      ]}
      onChange={handleChange}
      styles={{
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected ? "#F3F4F6FF" : "white",
          color: "black",
        }),
      }}
    />
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <CreateNewAccountForm />
      </Box>
    </Modal>
  </div>
</div>


          <div className="form-group col-md-6">
            <label htmlFor="phone" className="contact_phone">Phone:</label>
            <input
              type="text"
              className="form-control_contact-owner"
              id="phone"
              name="phone"
              value={contactData.phone}
              onChange={handleChange}
              placeholder="Enter phone"
              style={{ borderColor: errorFields.phone ? 'red' : '' }}
            />
          </div>
          
          <div className="form-group col-md-6">
            <label htmlFor="Mobile" className="other_mobile">Mobile:</label>
            <input
              type="text"
              className="form-control_mobil"
              id="Mobile"
              name="Mobile"
              value={contactData.Mobile}
              onChange={handleChange}
              placeholder="Enter Mobile "
              style={{ borderColor: errorFields.Mobile ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="address" className="other_addres">Address:</label>
            <input
              type="text"
              className="form-control-address"
              id="address"
              name="address"
              value={contactData.address}
              onChange={handleChange}
              placeholder="Enter address"
              style={{ borderColor: errorFields.address ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="description" className="other_description">description:</label>
            <input
              type="text"
              className="form-control-description1"
              id="description"
              name="description"
              value={contactData.description}
              onChange={handleChange}
              placeholder="Enter description"
              style={{ borderColor: errorFields.description ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="Assistant" className="other_assistant">Assistant:</label>
            <input
              type="text"
              className="form-control-assistantt"
              id="Assistant"
              name="Assistant"
              value={contactData.Assistant}
              onChange={handleChange}
              placeholder="Enter Assistant "
              style={{ borderColor: errorFields.Assistant ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="Currency1" className="other_currency">Currency:</label>
            <input
              type="text"
              className="form-control-currency2"
              id="Currency1"
              name="Currency1"
              value={contactData.Currency1}
              onChange={handleChange}
              placeholder="Enter Currency1 "
              style={{ borderColor: errorFields.Currency1 ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="Fax" className="other_fax"> Fax:</label>
            <input
              type="text"
              className="form-control_faxx"
              id="Fax"
              name="Fax"
              value={contactData.Fax}
              onChange={handleChange}
              placeholder="Enter Fax "
              style={{ borderColor: errorFields.Fax ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="DateOfBirth" className="other_DOB"> Date Of Birth:</label>
            <input
              type="date"
              className="form-control-DOBB"
              id="DateOfBirth"
              name="DateOfBirth"
              value={contactData.DateOfBirth}
              onChange={handleChange}
              placeholder="Enter DateOfBirth "
              style={{ borderColor: errorFields.DateOfBirth ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="AsstPhone" className="other_asst"> Asst Phone:</label>
            <input
              type="text"
              className="form-control-Asst-phone"
              id="AsstPhone"
              name="AsstPhone"
              value={contactData.AsstPhone}
              onChange={handleChange}
              placeholder="Enter AsstPhone "
              style={{ borderColor: errorFields.AsstPhone ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="SkypeId" className="other_skype"> Skype ID:</label>
            <input
              type="text"
              className="form-control-skype-id"
              id="SkypeId"
              name="SkypeId"
              value={contactData.SkypeId}
              onChange={handleChange}
              placeholder="Enter SkypeId "
              style={{ borderColor: errorFields.SkypeId ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="SecondaryEmail" className="other_secondaryemail"> Secondary Email:</label>
            <input
              type="text"
              className="form-control-secondary_mail"
              id="SecondaryEmail"
              name="SecondaryEmail"
              value={contactData.SecondaryEmail}
              onChange={handleChange}
              placeholder="Enter SecondaryEmail "
              style={{ borderColor: errorFields.SecondaryEmail ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="Twitter" className="other_Twitter"> Twitter:</label>
            <input
              type="text"
              className="form-control_twitter"
              id="Twitter"
              name="Twitter"
              value={contactData.Twitter}
              onChange={handleChange}
              placeholder="Enter Twitter "
              style={{ borderColor: errorFields.Twitter ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="createdBy" className="other_createdBy"> Created By:</label>
            <input
              type="text"
              className="form-control-createdBy"
              id="createdBy"
              name="createdBy"
              value={contactData.createdBy}
              onChange={handleChange}
              placeholder="Enter Created By "
              style={{ borderColor: errorFields.createdBy ? 'red' : '' }}
            />
          </div>
         
        </div>
        </div>
        

        <h1 className="info_address_info" style={{ textAlign: "center" }}>
          Address Information
        </h1>
        <div className='contanct_mailing_form'>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="MailingStreet" className='mailing_cont_street'>Mailing Street:</label>
            <input
              type="text"
              className="form-control_street_mail"
              id="MailingStreet"
              name="MailingStreet"
              value={contactData.MailingStreet}
              onChange={handleChange}
              placeholder="Enter  mailing street"
              style={{ borderColor: errorFields.MailingStreet ? 'red' : '' }}
            />
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="MailingCity" className='mailing_cont_city'> Mailing City:</label>
            <input
              type="text"
              className="form-control_city_mail"
              id="MailingCity"
              name="MailingCity"
              value={contactData.MailingCity}
              onChange={handleChange}
              placeholder="Enter Mailing City "
              style={{ borderColor: errorFields.MailingCity ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="MailingState" className='mailing-cont-state'> Mailing State:</label>
            <input
              type="text"
              className="form-control_state_mail"
              id="MailingState"
              name="MailingState"
              value={contactData.MailingState}
              onChange={handleChange}
              placeholder="Enter Mailing state "
              style={{ borderColor: errorFields.MailingState ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="MailingZip" className="mailing-cont-zip"> Mailing Zip:</label>
            <input
              type="text"
              className="form-control_zip_mail"
              id="MailingZip"
              name="MailingZip"
              value={contactData.MailingZip}
              onChange={handleChange}
              placeholder="Enter Mailing zip "
              style={{ borderColor: errorFields.MailingZip ? 'red' : '' }}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="MailingCountry" className="mailing-cont-country"> Mailing Country:</label>
            <input
              type="text"
              className="form-control_country_mail"
              id="MailingCountry"
              name="MailingCountry"
              value={contactData.MailingCountry}
              onChange={handleChange}
              placeholder="Enter Mailing country "
              style={{ borderColor: errorFields.MailingCountry ? 'red' : '' }}
            />
          </div>
        </div>

        </div>
        

        <div className="submit_to_contact">
          <button type="submit" className="btn btn-primary_submit_contact">
            Submit
          </button>
        </div>
      </form>
      </div>
    </div>
    {showPopup && <Popup errors={formErrors} onClose={closePopup} />}
      {showSuccessPopup && <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />}
   </div>
  );
}

export default Form2;
