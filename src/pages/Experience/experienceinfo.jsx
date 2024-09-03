import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './experienceinfo.css';
import uploadFileToAzure from "../../azureUpload.jsx";
import axiosInstance from "../../api.jsx";
import axios from 'axios';

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null;
};

export const ExperienceInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(null);
  const tenantId = getTenantIdFromUrl();

  useEffect(() => {
    console.log('useEffect is running with id:', id);
    
    if (id && tenantId) {
      const fetchExperience = async () => {
        try {
          console.log(`Fetching experience with id: ${id} and tenantId: ${tenantId}`);
          const response = await axiosInstance.get(
            `https://lxx1lctm-8000.inc1.devtunnels.ms/experience/${id}`, 
            {
              headers: {
                'tenant-id': tenantId // Add tenantId to the headers
              }
            }
          );
          setExperience(response.data);
          console.log('This is experience', response.data);
        } catch (error) {
          console.error('Error fetching experience data:', error);
        }
      };
  
      fetchExperience();
    }
  }, [id, tenantId]);
  
  
  

  const handleBackClick = () => {
    navigate(`/${tenantId}/experiencemodel`)
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    console.log('Selected file:', selectedFile);
    
    if (selectedFile) {
      try {
        console.log('Uploading file to Azure Blob Storage...');
        const fileUrl = await uploadFileToAzure(selectedFile);
        console.log('File uploaded to Azure, URL:', fileUrl);

        console.log('Sending POST request to backend...');
        const response = await axiosInstance.post('https://webappbaackend.azurewebsites.net/documents/', {
          name: selectedFile.name,
          document_type: selectedFile.type,
          description: 'Your file description',
          file_url: fileUrl,
          entity_type: 'your_entity_type',
          entity_id: 'your_entity_id',
          tenant: tenantId,
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


  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const dataPairs = [
    { label: 'Experience Name', /*value: experience.experience_name*/},
    { label: 'Highlights', /*value: experience.highlights */},
    { label: 'Slot Timing',/* value: experience.slot_timing */},
    { label: 'Sale Price',/* value: experience.sale_price */},
    { label: 'Tax',/* value: experience.tax*/ },
    { label: 'Duration (hours)', /*value: experience.duration_in_hours */},
    { label: 'Itinerary', /*value: experience.itenerary */},
    { label: 'Itinerary Time', /*value: experience.itenerary_time*/ },
    { label: 'Inclusions & Exclusions',/* value: experience.inclusions_and_exclusions*/ },
    { label: 'Additional Information', /*value: experience.additional_information */},
    { label: 'Time of the Day', /*value: experience.time_of_the_day*/ },
    { label: 'Vendor Owner', /*value: experience.vendor_owner*/ },
    { label: 'Experience Details',/* value: experience.experience*/ },
    { label: 'Eligibility', /*value: experience.eligibility*/ },
    { label: 'Prohibitions & Limitations', /*value: experience.proibitions_and_limitations */},
    { label: 'What to Bring',/* value: experience.what_to_bring*/ },
    { label: 'Terms & Cancellations', /*value: experience.terms_and_cancellations*/ },
    { label: 'Insider Tip', /*value: experience.insider_tip */},
    { label: 'Description', /*value: experience.description */},
    { label: 'Tenant',/* value: experience.tenant*/ }
  ];


  return (
    <div className="experience-info-page">
      <div className="experience-info-sidebar">
        <button className="experience-info-back-button" onClick={handleBackClick}>Back</button>
      </div>
      
      <div className="experience-info-main-content">
        <div className="experience-info-header">
          <div className="experience-info-avatar" style={{ backgroundColor: generateRandomColor() }}>
            <span className="material-icons" style={{ fontSize: "40px", color: "white" }}>person</span>
          </div>
          <div>
            <h1 className="experience-info-title"></h1>
            <p className="experience-info-description"></p>
          </div>
        </div>
        <h2 className="experience-info-section-title">Experience Details</h2>
        <div className="experience-info-section">
      {dataPairs.reduce((result, item, index) => {
        if (index % 2 === 0) {
          result.push([item]);
        } else {
          result[result.length - 1].push(item);
        }
        return result;
      }, []).map((row, rowIndex) => (
        <div key={rowIndex} className="experience-info-detail-row">
          {row.map((item, itemIndex) => (
            <div key={itemIndex} className="experience-info-detail-item">
              <span className="experience-info-detail-label">{item.label}:</span>
              <span className="experience-info-detail-value">{item.value}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
      </div>
    </div>
  );
};

export default ExperienceInfo;
