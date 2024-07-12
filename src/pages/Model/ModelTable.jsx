import React, { useState, useEffect } from 'react';
import { Sidebar } from "../../components/Sidebar";
import TopNavbar from "../TopNavbar/TopNavbar.jsx";
import axiosInstance from "../../api.jsx";
import './ModelTable.css';
import { useParams } from 'react-router-dom';

const getTenantIdFromUrl = () => {
    const pathArray = window.location.pathname.split('/');
    if (pathArray.length >= 2) {
        return pathArray[1]; // Assumes tenant_id is the first part of the path
    }
    return null; 
};



const Models = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const { modelName } = useParams();
    const tenantId = getTenantIdFromUrl();
    const [modelData, setModelData] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modelNameInput, setModelNameInput] = useState('');
    const [fields, setFields] = useState([{ fieldName: '', fieldType: '' }]);
    const [errorMessage, setErrorMessage] = useState('');
    const [newModelName, setNewModelName] = useState('')
    const [formValues, setFormValues] = useState({});
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
   
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await axiosInstance.get('https://webappbaackend.azurewebsites.net/dynamic-models/');
                setModels(response.data);
            
            } catch (error) {
                console.error('Error fetching models:', error);
            }
        };

        fetchModels();
    }, []);

    useEffect(() => {
        if (modelName) {
            const fetchModelData = async () => {
                setLoading(true);
                try {
                    console.log('This is model name:', modelName);
                    const response = await axiosInstance.get(`https://webappbaackend.azurewebsites.net/dynamic-model-data/${modelName}/`);
                    setModelData(response.data);
                    console.log('Model data:', response.data);
                } catch (error) {
                    console.error('Error fetching model data:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchModelData();
        }
    }, [modelName]);
    
    
      const handleModelSelect = (modelName) => {
        setSelectedModel(modelName);
      };

      const handleChange = (e) => {
        setFormValues({
            ...formValues,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`https://webappbaackend.azurewebsites.net/dynamic-model-data/${modelName}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // Include your token here
                    'X-Tenant-Id': tenantId 
                },
                body: JSON.stringify(formValues)
            });

            if (!response.ok) {
                throw new Error('Failed to send data to backend');
            }

            const responseData = await response.json();
            console.log('Data sent successfully:', responseData);
            setShowModal(false); // Close the modal on success
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handleEntryClick = (entry) => {
        setSelectedEntry(entry);
        setShowInfoModal(true);
    };

    

    return(
        <div className="model-page">
        <div className="model_nav">
            <TopNavbar />
        </div>
        <h1>{modelName}</h1>
        <div className="model-display">
            <div className="model_sidebar">
            <Sidebar models={models} onSelectModel={handleModelSelect} />
            </div>
            
            <div className="model_table">
    {loading ? (
        <div>Loading...</div>
    ) : modelData && modelData.length > 0 ? (
        <table>
            <thead>
                <tr>
                    {Object.keys(modelData[0]).map((key, index) => (
                        <th key={index}>{key}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {modelData.map((item, index) => (
                    <tr key={index} onClick={() => handleEntryClick(item)}>
                        {Object.keys(item).map((key, index) => (
                            <td key={index}>{item[key]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    ) : (
        <div>Add Data to Modal</div>
    )}
</div>

                <div className="add-model-popup">
            <button className="edit-model" onClick={() => setShowModal(true)}>Edit Model</button>
            {showModal && (
                <div className="modal-popup">
                    <div className="modal-content-popup">
                        <span className="close-button" onClick={() => setShowModal(false)}>×</span>
                        <form onSubmit={handleSubmit}>
                            {modelData && modelData.length > 0 && Object.keys(modelData[0]).map((key) => (
                                <label key={key}>
                                    {key}:
                                    <input
                                        type="text"
                                        name={key}
                                        value={formValues[key] || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                            ))}
                            <button type="submit">Submit</button>
                        </form>
                        {errorMessage && <p className="error">{errorMessage}</p>}
                    </div>
                </div>
            )}
            </div>
            </div>
            {showInfoModal && selectedEntry && (
                <div className="info-modal-popup">
                    <div className="info-modal-content-popup">
                        <span className="info-close-button" onClick={() => setShowInfoModal(false)}>×</span>
                        <h2>Model Details</h2>
                        {Object.keys(selectedEntry).map((key) => (
                            <p key={key}><strong>{key}:</strong> {selectedEntry[key]}</p>
                        ))}
                    </div>
                </div>
            )}
            </div>
    );
}

export default Models;