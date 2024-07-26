/* eslint-disable no-useless-catch */
// src/services/api.js

import axios from 'axios';

const API_BASE_URL = 'https://webappbaackend.azurewebsites.net/'; // Replace this with your actual API base URL when ready

const InstaApis = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Add any other headers you might need, like authentication tokens
  },
});

export const saveDraft = async (draftData) => {
    try {
      const response = await axios.post('drafts/', draftData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  export const fetchDrafts = async (tenantId) => {
    try {
      const response = await InstaApis.get(`drafts/?tenantId=${tenantId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  export const loadDraft = async (draftId, tenantId) => {
    try {
      const response = await InstaApis.get(`drafts/${draftId}?tenantId=${tenantId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  export const deleteDraft = async (draftId, tenantId) => {
    try {
      const response = await InstaApis.delete(`drafts/${draftId}?tenantId=${tenantId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

export default InstaApis;