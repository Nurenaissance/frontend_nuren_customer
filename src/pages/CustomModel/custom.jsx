import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api';
import { Sidebar } from '../../components/Sidebar';
import TopNavbar from '../TopNavbar/TopNavbar.jsx'; 
import './custom.css';
import { useAuth } from "../../authContext";


const Custom = () => {
    const [models, setModels] = useState([]);
    const { userRole } = useAuth(); // Destructure userRole from useAuth hook

    const [loading, setLoading] = useState(true);
    const [fields, setFields] = useState([{ fieldName: '', fieldType: '' }]);
    const [modelName, setModelName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await axiosInstance.get('https://webappbaackend.azurewebsites.net/dynamic-models/');
                setModels(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching models:', error);
                setLoading(false);
            }
        };

        fetchModels();
    }, []);

    const addField = () => {
        setFields([...fields, { fieldName: '', fieldType: '' }]);
    };

    const removeField = (index) => {
        const updatedFields = [...fields];
        updatedFields.splice(index, 1);
        setFields(updatedFields);
    };

    const handleFieldChange = (index, event) => {
        const updatedFields = [...fields];
        updatedFields[index][event.target.name] = event.target.value;
        setFields(updatedFields);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage(''); // Reset error message
        try {
            const newModel = {
                model_name: modelName,
                fields: fields.map(field => ({ field_name: field.fieldName, field_type: field.fieldType }))
            };
            const response = await axiosInstance.post('https://webappbaackend.azurewebsites.net/create-dynamic-model/', newModel);
            if (response.data.success) {
                setFields([{ fieldName: '', fieldType: '' }]); // Reset fields
                setModelName(''); // Reset model name
                console.log('this is model', modelName);
                alert('Custom model created successfully!');
            } else {
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            console.error('Error creating model:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Failed to create custom model. Please try again later.');
            }
        }
    };
    if (userRole !== 'Admin') {
        return (
            <div>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className='custom-page'>
            <div className="home_left_box-loyal">
            <Sidebar model={models.length > 0 ? models[0] : null} />
            </div>
            <div>
                <div className='custom_topbar'>
                    <TopNavbar />
                </div>
                <div className='custom-form-btn'>
                    <div>
                        <h1 className='custom-head'>Custom Model</h1>
                    </div>
                    <div className="create-custom" onClick={addField}>
                        +Add Field
                    </div>
                </div>
                <div className='custom-box'>
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    <form onSubmit={handleSubmit}>
                        <div>
                            <input
                                type="text"
                                placeholder="Model Name"
                                value={modelName}
                                onChange={(event) => setModelName(event.target.value)}
                                required
                            />
                        </div>
                        {fields.map((field, index) => (
                            <div className="field-container" key={index}>
                                <input
                                    type="text"
                                    name="fieldName"
                                    placeholder="Field Name"
                                    value={field.fieldName}
                                    onChange={(event) => handleFieldChange(index, event)}
                                    required
                                />
                                <select
                                    name="fieldType"
                                    value={field.fieldType}
                                    onChange={(event) => handleFieldChange(index, event)}
                                    required
                                >
                                    <option value="">Select Data Type</option>
                                    <option value="string">String</option>
                                    <option value="text">Text</option>
                                    <option value="integer">Integer</option>
                                    <option value="boolean">Boolean</option>
                                    <option value="date">Date</option>
                                </select>
                                <button type="button" onClick={() => removeField(index)}>Remove</button>
                            </div>
                        ))}
                        <button type="submit">Create Model</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Custom;
