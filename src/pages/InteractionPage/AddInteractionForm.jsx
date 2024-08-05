import React, { useState, useEffect } from 'react';
import axiosInstance from "../../api";
import "./AddInteractionForm.css";
import { useNavigate } from "react-router-dom";

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
      <h2>Product Created Sucessfully</h2>
      <button className="product-popup-ok-button2" onClick={onClose}>OK</button>
    </div>
  </div>
);
const AddInteractionForm = () => {
  const navigate = useNavigate();
  const tenantId=getTenantIdFromUrl();
  const [formData, setFormData] = useState({
    id: "",
    entity_id: "",
    interaction_type: "",
    interaction_datetime: "",
    notes: "",
    entity_type: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorFields, setErrorFields] = useState({});

  const entityTypes = [
    'Account',
    'calls',
    'Lead',
    'meetings',
    'Opportunity',
    'Contact',
    'Tasks',
    'Reminder',
    'Campaign'
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    const updatedErrorFields = { ...errorFields };
    delete updatedErrorFields[name];
    setErrorFields(updatedErrorFields);
    setFormData({ ...formData, [name]: value });
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
    const dataToSend = {
      ...formData,
      
      tenant_id: tenantId,
    };
    event.preventDefault();
    try {
      setLoading(true);
      // Send a POST request to the backend API with the form data
      const response = await axiosInstance.post("/interaction/", dataToSend);

      setSuccessMessage(response.data.message);
      setShowSuccessPopup(true);

      if (response.status === 200 || response.status === 201) {
        // Navigate to the interaction page after successful form submission
        window.location.href = `/${tenantId}/interaction`; // Replace "/interaction" with the actual URL of the interaction page
      } else {
        console.error("Error submitting form:", response.statusText);
      }
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    navigate(`/${tenantId}/interaction`);

  };

  return (
    <div className="interaction-form-container">
      <h1 className="form-title">Add Interaction Form</h1>
      <form onSubmit={handleSubmit}>
      <div className="form-field">
          <label htmlFor="entity_type" className="labelforinteraction">
            Entity Type:
          </label>
          <select
            id="entity_type"
            name="entity_type"
            value={formData.entity_type}
            onChange={handleChange}
            className="input-field"
            required
            style={{ borderColor: errorFields.entity_type ? 'red' : '' }}
          >
            <option value="">Select Entity Type</option>
            {entityTypes.map((entityType) => (
              <option key={entityType} value={entityType}>
                {entityType}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="entity_id" className="labelforinteraction">
            Entity ID:
          </label>
          <input
            type="text"
            id="entity_id"
            name="entity_id"
            value={formData.entity_id}
            onChange={handleChange}
            className="input-field"
            style={{ borderColor: errorFields.entity_id ? 'red' : '' }}
          />
        </div>
        <div className="form-field">
          <label htmlFor="interaction_type" className="labelforinteraction">
            Interaction Type:
          </label>
          <select
            id="interaction_type"
            name="interaction_type"
            value={formData.interaction_type}
            onChange={handleChange}
            className="input-field"
            required
            style={{ borderColor: errorFields.interaction_type ? 'red' : '' }}
          >
            <option value="">Select Interaction Type</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
            <option value="Note">Note</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="interaction_datetime" className="labelforinteraction">
            Interaction Datetime:
          </label>
          <input
            type="datetime-local"
            id="interaction_datetime"
            name="interaction_datetime"
            value={formData.interaction_datetime}
            onChange={handleChange}
            className="input-field"
            style={{ borderColor: errorFields.interaction_datetime ? 'red' : '' }}
          />
        </div>
        <div className="form-field">
          <label htmlFor="notes" className="labelforinteraction">
            Notes:
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="textarea-field"
            style={{ borderColor: errorFields.notes ? 'red' : '' }}
          />
        </div>
       
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
        {error && <div className="error-message">Error: {error}</div>}
      </form>
    </div>
  );
};

export default AddInteractionForm;
