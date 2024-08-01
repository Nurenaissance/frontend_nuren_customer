import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from "../../api.jsx";
import './Ticketform.css';
import TopNavbar from "../TopNavbar/TopNavbar.jsx";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from "react-router-dom";

const CASE_NUMBER_START = 1000;

const getTenantIdFromUrl = () => {
    const pathArray = window.location.pathname.split('/');
    if (pathArray.length >= 2) {
      return pathArray[1]; // Assumes tenant_id is the first part of the path
    }
    return null; 
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
        <h2>Product Created Sucessfully</h2>
        <button className="product-popup-ok-button2" onClick={onClose}>OK</button>
      </div>
    </div>
  );

const CASE_STATUS_CHOICES = [
    { value: 'open', label: 'Open' },
    { value: 'pending', label: 'Pending' },
    { value: 'closed', label: 'Closed' }
];

const PRIORITY_CHOICES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
];

const TYPE_CHOICES = [
    { value: 'bug', label: 'Bug' },
    { value: 'issue', label: 'Issue' },
    { value: 'request', label: 'Request' },
];

const CASE_ORIGIN_CHOICES = [
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
    { value: 'web', label: 'Web' }
];

const SUBJECT_CHOICES = [
    { value: 'support', label: 'Support Request' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'other', label: 'Other' }
];

const Ticketform = () => {
    const navigate = useNavigate();
    const tenantId = getTenantIdFromUrl();
    console.log('Extracted tenant ID:', tenantId);
    const [formData, setFormData] = useState({
        tenant: tenantId,
        contactName: '',
        accountName: '',
        webemail: '',
        case_reason: '',
        comment: '',
        file: null,
        casenumber: '23452',
        subject: '',
        description: '',
        status: '',
        date: '',
        owner: '',
        priority: '',
        type: '',
        case_origin: ''
    });
    const [formErrors, setFormErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorFields, setErrorFields] = useState({});


  useEffect(() => {
    // Generate new case number
    const lastCaseNumber = parseInt(localStorage.getItem('lastCaseNumber') || CASE_NUMBER_START, 10);
    const newCaseNumber = (lastCaseNumber + 1).toString();
    setFormData(prevFormData => ({ ...prevFormData, casenumber: newCaseNumber }));

    // Update local storage
    localStorage.setItem('lastCaseNumber', newCaseNumber);
}, []);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updatedErrorFields = { ...errorFields };
    delete updatedErrorFields[name];
    setErrorFields(updatedErrorFields);
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            file: e.target.files[0],
        });
    };
    const handleDateChange = (e) => {
        setFormData({
            ...formData,
            date: e.target.value,
        });
    };

    const handleSubjectChange = (e) => {
        const { value } = e.target;
        setFormData({
            ...formData,
            subject: value,
        });
    };

    useEffect(() => {
        // Set initial error fields based on formErrors
        const initialErrorFields = {};
        Object.keys(formErrors).forEach(field => {
          initialErrorFields[field] = true;
        });
        setErrorFields(initialErrorFields);
      }, [formErrors]);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = new FormData();
        for (const key in formData) {
            dataToSend.append(key, formData[key]);
        }

        console.log('Data to send:', dataToSend);

        try {
            const response = await axiosInstance.post('/tickets/', dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Ticket created:', response.data);
            setSuccessMessage(response.data.message);
      setShowSuccessPopup(true);

           
            setFormData({
                tenant: tenantId,
                contactName: '',
                accountName: '',
                webemail: '',
                case_reason: '',
                comment: '',
                file: null,
                casenumber: '981234',
                subject: '',
                description: '',
                status: '',
                date: '',
                owner: '',
                priority: '',
                type: '',
                case_origin: ''

            });

            navigate(`/${tenantId}/ticket`);

        } catch (error) {
            console.error('Error creating ticket:', error);
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

    const closePopup = () => {
        setShowPopup(false);
      };
    
      const closeSuccessPopup = () => {
        setShowSuccessPopup(false);
        navigate(`/${tenantId}/product`);
    
      };
      

    return (
        <div className="ticket-form-page">
            <div className="call_nav">
                <TopNavbar />
            </div>
            <div className="ticketform">
                <div className="ticket-sidebar">
                    <Link to={`/${tenantId}/ticket`}>Back</Link>
                </div>
                <div className="form-ticket">
                    <div className="ticket-form-header">
                        <h1>Generate a Ticket</h1>
                        <button className="newticket-button">+Create a new ticket</button>
                    </div>
                    <div className="ticket-box">
                        <h2>Create new Ticket</h2>
                        <div className="ticket-input-flex-container">
                            <div className="ticket-input-group">
                                <label htmlFor="contactName">Enter contact Name</label>
                                <input
                                    type="text"
                                    id="contactName"
                                    name="contactName"
                                    placeholder="Enter the contact name"
                                    value={formData.contactName}
                                    onChange={handleInputChange}
                                    style={{ borderColor: errorFields.contactName ? 'red' : '' }}
                                />
                            </div>
                            <div className="ticket-input-group">
                                <label htmlFor="accountName">Enter Account Name</label>
                                <input
                                    type="text"
                                    id="owner"
                                    name="owner"
                                    placeholder="Enter the account name"
                                    value={formData.owner}
                                    onChange={handleInputChange}
                                    style={{ borderColor: errorFields.owner ? 'red' : '' }}
                                />
                            </div>
                        </div>
                        <div className="ticket-input-flex-container">
                            <div className="ticket-input-group">
                                <label htmlFor="webemail">Enter Contact mail</label>
                                <input
                                    type="email"
                                    id="webemail"
                                    name="webemail"
                                    placeholder="Enter the contact email"
                                    value={formData.webemail}
                                    onChange={handleInputChange}
                                    style={{ borderColor: errorFields.webemail ? 'red' : '' }}
                                />
                            </div>
                            <div className="ticket-input-group">
                                <label htmlFor="case_reason">Select the Reason of Raising Ticket</label>
                                <select
                                    className="ticket-select"
                                    id="case_reason"
                                    name="case_reason"
                                    value={formData.case_reason}
                                    onChange={handleInputChange}
                                    style={{ borderColor: errorFields.case_reason ? 'red' : '' }}
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="Technical Issue">Technical Issue</option>
                                    <option value="Account Inquiry">Account Inquiry</option>
                                    <option value="Billing Issue">Billing Issue</option>
                                    <option value="Feature Request">Feature Request</option>
                                </select>
                            </div>
                        </div>
                        <div className="ticket-input-flex-container">
                            <div className="ticket-input-group">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    style={{ borderColor: errorFields.status ? 'red' : '' }}
                                >
                                    <option value="">Select a status...</option>
                                    {CASE_STATUS_CHOICES.map(status => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="ticket-input-group">
                                <label htmlFor="priority">Priority</label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    style={{ borderColor: errorFields.priority ? 'red' : '' }}
                                >
                                    <option value="">Select a priority...</option>
                                    {PRIORITY_CHOICES.map(priority => (
                                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="ticket-input-flex-container">
                            <div className="ticket-input-group">
                                <label htmlFor="type">Type</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    style={{ borderColor: errorFields.type ? 'red' : '' }}
                                >
                                    <option value="">Select a type...</option>
                                    {TYPE_CHOICES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="ticket-input-group">
                                <label htmlFor="case_origin">Case Origin</label>
                                <select
                                    id="case_origin"
                                    name="case_origin"
                                    value={formData.case_origin}
                                    onChange={handleInputChange}
                                    style={{ borderColor: errorFields.case_origin ? 'red' : '' }}
                                >
                                    <option value="">Select a case origin...</option>
                                    {CASE_ORIGIN_CHOICES.map(origin => (
                                        <option key={origin.value} value={origin.value}>{origin.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="ticket-input-flex-container">
                            <div className="ticket-input-group">
                                <label htmlFor="date">Date</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleDateChange}
                                    style={{ borderColor: errorFields.date ? 'red' : '' }}
                                />
                            </div>
                            <div className="ticket-input-group">
                                <label htmlFor="subject">Subject</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleSubjectChange}
                                    style={{ borderColor: errorFields.subject ? 'red' : '' }}
                                >
                                    <option value="">Select a subject...</option>
                                    {SUBJECT_CHOICES.map(subject => (
                                        <option key={subject.value} value={subject.value}>{subject.label}</option>
                                    ))}
                                </select>
                            </div>
                            </div>
                        <div className="ticket-input-flex-container">
                            <div className="ticket-input-group">
                                <label htmlFor="file-upload" className="ticket-upload-label">Upload Related Documents</label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    name="file"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    className="ticket-input-button"
                                    onClick={() => document.getElementById('file-upload').click()}
                                >
                                    Upload File
                                </button>
                                {formData.file && <span>{formData.file.name}</span>}
                            </div>
                            <div className="ticket-input-group">
                                <div className="ticket-addcomment">
                                    <label htmlFor="comment">Add Comment</label>
                                    <textarea
                                        type="text"
                                        id="description"
                                        name="description"
                                        rows="4"
                                        cols="50"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        style={{ borderColor: errorFields.description ? 'red' : '' }}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="generate-ticket-container">
                            <button className="generate-ticket-button" onClick={handleSubmit}>
                                <AddCircleOutlineIcon className="generate-ticket-icon" /> Generate Ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showPopup && <Popup errors={formErrors} onClose={closePopup} />}
      {showSuccessPopup && <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />}
        </div>
    );
}

export default Ticketform;
