import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './experienceform.css';

const ExperienceForm = () => {
  const { tenantId } = useParams(); // Get tenantId from the URL parameters
  const navigate = useNavigate();   // Hook to navigate programmatically

  const [formData, setFormData] = useState({
    experience_name: '',
    highlights: '',
    slot_timing: '',
    sale_price: '',
    tax: '',
    duration_in_hours: '',
    itenerary: '',
    itenerary_time: '',
    inclusions_and_exclusions: '',
    additional_information: '',
    time_of_the_day: '',
    vendor_owner: '',
    experience: '',
    eligibility: '',
    proibitions_and_limitations: '',
    what_to_bring: '',
    terms_and_cancellations: '',
    insider_tip: '',
    description: '',
    tenant: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send data to backend
    fetch('https://your-api-endpoint.com/experience', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        // Handle success, such as redirecting or displaying a success message
      })
      .catch((error) => {
        console.error('Error:', error);
        // Handle error, such as displaying an error message
      });
  };

  const handleBackClick = () => {
    navigate(`/${tenantId}/experiencemodel`);
  };

  return (
    <div className="experience-form-container">
      <div className="experience-sidebar">
        <button className="experience-back-button" onClick={handleBackClick}>
          Back
        </button>
      </div>
      <div className="experience-form-content">
        <h2>Create New Experience</h2>
        <form onSubmit={handleSubmit}>
          {Object.keys(formData).map((key) => (
            <div key={key} className="experience-form-group">
              <label htmlFor={key}>{key.replace(/_/g, ' ').toUpperCase()}</label>
              <input
                type="text"
                id={key}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <button type="submit" className="experience-submit-button">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ExperienceForm;
