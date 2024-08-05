import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../../api.jsx";
import { useParams } from 'react-router-dom';
import "./LeadPage.css";

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; 
};

function ConvertLead() {
  const tenantId=getTenantIdFromUrl();
  const { id } = useParams();
  const [leadData, setLeadData] = useState();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeadData();
  }, []);

  const fetchLeadData = async () => {
    try {
      const response = await axiosInstance.get(`/leads/${id}`);
      setLeadData(response.data);
    } catch (error) {
      setError("Error fetching lead data");
      console.log(leadData);
      console.log('this is error', error)
    }
  };

  const convertLead = async () => {
    setLoading(true);
    setError(null);
  
    const accountFormData = {
      Name: leadData.first_name,
      phone: leadData.phone,
      email: leadData.email,
      tenant: tenantId,
      createdBy: 1
    };
  
    const opportunityFormData = {
      name: `${leadData.first_name}'s Opportunity`,
      description: 'Converted from lead',
      tenant: tenantId,
      createdBy: 1,
      stage: 1  // Assuming 1 is the primary key for the "NEEDS ANALYSIS" stage
    };
  
    try {
      await axiosInstance.post('/accounts/', accountFormData);
      await axiosInstance.post('/opportunities/', opportunityFormData);
      await axiosInstance.delete(`/leads/${id}`);
      setLoading(false);
      setSuccess(true);
    } catch (error) {
      setLoading(false);
      setError("Error converting lead: " + (error.response?.data?.stage?.[0] || error.message));
    }
  };

  return (
    <div className="convert-lead-container">
      <h1>Convert Lead</h1>
      {leadData ? (
        <div className="lead-info">
          <h3>Lead Information</h3>
          <p>Name: {leadData.first_name}</p>
          <p>Email: {leadData.email}</p>
          <p>Phone: {leadData.phone}</p>
          <button onClick={convertLead} className="convert-button">Convert to Account and Contact</button>
        </div>
      ) : (
        <div className="no-lead">
          <h3>No Lead Found</h3>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Processing...</div>}
      {success && <div className="success">Lead converted successfully!</div>}
    </div>
  );
}

export default ConvertLead;
