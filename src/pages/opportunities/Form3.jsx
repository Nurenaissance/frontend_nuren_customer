import axios from "axios";
import Box from "@mui/material/Box";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Modal from "@mui/material/Modal";
import { Header } from "../../components/Header";
import CreateNewAccountForm from "../ContactsTable/CreateNewAccountForm.jsx";
import Select from "react-select";
import "./opportunities.css";
import "./index.jsx";
import axiosInstance from "../../api.jsx";
import { useAuth } from "../../authContext.jsx";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path
import { useNavigate } from "react-router-dom";




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
      <h2>Opportunity Created Sucessfully</h2>
      <button className="product-popup-ok-button2" onClick={onClose}>OK</button>
    </div>
  </div>
);

const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};

const Form3 = () => {
  const navigate = useNavigate();
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
    const {userId}=useAuth();
    const tenantId = getTenantIdFromUrl(); // Get tenantId from route params

    const [open, setOpen] = React.useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [formErrors, setFormErrors] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorFields, setErrorFields] = useState({});
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    const [oppourtunityData, setOppourtunityData] = useState({
        name: "",
        account: "",
        amount: "",
        
        contacts: [''],
        createdOn: "",
        closedBy: "",
        closedOn: "",
        stage: "",
        lead_source: "",
        probability: "",
        description: "",
        isActive: "",
    });

    const leadSourceOptions = [
        { id: 1, value: "NONE", label: "NONE" },
        { id: 2, value: "CALL", label: "CALL" },
        { id: 3, value: "EMAIL", label: "EMAIL" },
        { id: 4, value: "EXISTING CUSTOMER", label: "EXISTING CUSTOMER" },
        { id: 5, value: "PARTNER", label: "PARTNER" },
        { id: 6, value: "PUBLIC RELATIONS", label: "PUBLIC RELATIONS" },
        { id: 7, value: "CAMPAIGN", label: "CAMPAIGN" },
        { id: 8, value: "WEBSITE", label: "WEBSITE" },
        { id: 9, value: "OTHER", label: "OTHER" },
    ];

    const STAGES = [
      {id: 1,value:'QUALIFICATION', label:'QUALIFICATION'},
      {id: 2,value:'NEEDS ANALYSIS', label:'NEEDS ANALYSIS'},
      {id: 3,value:'VALUE PROPOSITION', label:'VALUE PROPOSITION'},
      {id: 4,value:'ID.DECISION MAKERS', label:'ID.DECISION MAKERS'},
      {id: 5,value:'PERCEPTION ANALYSIS', label:'PERCEPTION ANALYSIS'},
      {id: 6,value:'PROPOSAL/PRICE QUOTE', label: 'PROPOSAL/PRICE QUOTE'},
      {id: 7,value:'NEGOTIATION/REVIEW',label: 'NEGOTIATION/REVIEW'},
      {id: 8,value:'CLOSED WON', label:'CLOSED WON'},
      {id: 9,value:'CLOSED LOST', label:'CLOSED LOST'},
    ];

    

    const [accountOptions, setAccountOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    
  const [showCreateNewAccountForm, setShowCreateNewAccountForm] = useState(false);

    const fetchAccountOptions = async () => {
        try {
          const response = await axiosInstance.get('/accounts/');
      
            console.log("Account options response:", response.data);
            setAccountOptions(response.data);
            setFilteredOptions(response.data);
            
        } catch (error) {
            console.error("Error fetching account options:", error);
        }
    };

    useEffect(() => {
        fetchAccountOptions();
    }, []);

    const handleAccountSearch = (event) => {
        const searchQuery = event.target.value.toUpperCase();
        const filteredOptions = accountOptions.filter((option) =>
            option.Name.toUpperCase().startsWith(searchQuery)
        );
        setFilteredOptions(filteredOptions);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        const updatedErrorFields = { ...errorFields };
        delete updatedErrorFields[name];
        setErrorFields(updatedErrorFields);
        setOppourtunityData({ ...oppourtunityData, [name]: value });
    };

    useEffect(() => {
      // Set initial error fields based on formErrors
      const initialErrorFields = {};
      Object.keys(formErrors).forEach(field => {
        initialErrorFields[field] = true;
      });
      setErrorFields(initialErrorFields);
    }, [formErrors]);
  

    const handleSaveAsDraft = async () => {
      setIsSavingDraft(true);
      try {
        const dataToSend = {
          ...oppourtunityData,
          createdBy: userId,
          tenant: tenantId,
          status: "Draft",
        };
  
        console.log('Data to send:', dataToSend);
  
        localStorage.setItem('opportunityDraft', JSON.stringify(dataToSend));
  
        await axiosInstance.post('/opportunities/', dataToSend);
  
        console.log("Draft saved successfully");
  
        navigate(`/${tenantId}/opportunities`);
      } catch (error) {
        console.error("Error saving draft:", error);
  
        if (error.response) {
          setFormErrors(error.response.data || error.message);
        } else {
          setFormErrors({ networkError: 'Network Error. Please try again later.' });
        }
      } finally {
        setIsSavingDraft(false);
      }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
          const dataToSend = {
            ...oppourtunityData,
            createdBy: userId, // Pass userId as createdBy
            tenant: tenantId,
          };
          const response = await axiosInstance.post('/opportunities/',dataToSend);
          const opportunityId = response.data.id;
          const interactionData = {
            entity_type: "opportunity",
            entity_id: opportunityId,
            interaction_type: "Event",
            tenant_id: tenantId, // Make sure you have tenant_id in movedCard
            notes: `Opportunity created with id : ${opportunityId} created by user : ${userId}`,
            interaction_datetime: new Date().toISOString(),
          };

          try {
              await axiosInstance.post('/interaction/', interactionData);
              console.log('Interaction logged successfully');
            } catch (error) {
              console.error('Error logging interaction:', error);
            }
           
            console.log("Form submitted successfully:", response.data);
            setOppourtunityData({
                name: "",
                account: "",
                amount: "",
               
                contacts: [''],
                closedBy: "",
                closedOn: "",
                stage: "",
                lead_source: "",
                probability: "",
                description: "",
                isActive: "",
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

    
    const handleInputChange = (event) => {
      const { name, value } = event.target;
      setOppourtunityData({ ...oppourtunityData, [name]: value });
  };
  const handleSelectChange = (selectedOption) => {
    if (selectedOption && selectedOption.value === "create-new-account") {
        handleOpen();
    } else {
        // Extract the account ID from the selected option
        const accountId = selectedOption ? selectedOption.id : null;
        setOppourtunityData((prevData) => ({
            ...prevData,
            account: accountId,
        }));
    }
};
const handleCancel = () => {
    
  const isConfirmed = window.confirm("Are you sure you want to cancel? Any unsaved data will be lost.");
  

  if (isConfirmed) {
    localStorage.removeItem('opportunityDraft'); 
    console.log("Cancel button clicked");
   
    window.location.href = `../${tenantId}/opportunities`;
  }
};



const handleSubmitForm = (event) => {
  event.preventDefault(); 
  localStorage.removeItem('opportunityDraft'); 
  handleSubmit(event);
};

const closePopup = () => {
  setShowPopup(false);
};

const closeSuccessPopup = () => {
  setShowSuccessPopup(false);
  navigate(`/${tenantId}/opportunties`);

};

useEffect(() => {
  const draftData = localStorage.getItem('opportunityDraft');
  if (draftData) {
    setOppourtunityData(JSON.parse(draftData));
  }
}, []);



    return (
    <div>
        <div className="oops_navform">
      <TopNavbar/>
    </div>
      <div className="opportunityfill_forms">
      {showCreateNewAccountForm && <CreateNewAccountForm />}
     

      <div className="relatedOppo_back">
        {/* <Link className='oppo_back' to="/opportunities"> Back</Link> */}
        <Link className='task_back' to={`/${tenantId}/opportunities`}>Back</Link>

      </div>

      <div className="Oppo_contain_form">
        <div className="flex-container_oppo">
          <div>
            
          </div>
          <div className='btnsss_oopo'>
            <button type="cancel" onClick={handleCancel} className="btn-submit_cancel">Cancel</button>
            <button type="save" onClick={handleSaveAsDraft}   className="btn-submit_save">Save as Draft</button>
            <button type="submit" onClick={handleSubmitForm}  className="btn-submit_submit">Submit</button>
          </div>
        </div>
        <h1 className="oppo_form">Create Opportunity</h1>
        <div className='oppo_form_contain'>
          
          <form onSubmit={handleSubmit} className="oppo_form_fill">
            <div className="form-row">
              <div className="form-group col-md-6">
                <label className="oppo_form_name" htmlFor="name">Contact Owner</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={oppourtunityData.name}
                  onChange={handleInputChange}
                  placeholder="Enter contact Owner"
                  style={{ borderColor: errorFields.name ? 'red' : '' }}
                />
              </div>

              <div className="form-group col-md-6">
                <label className="oppo_form_contact" htmlFor="contacts">Contacts</label>
                <input
                  type="text"
                  className="form-control"
                  id="contacts"
                  name="contacts"
                  value={oppourtunityData.contacts}
                  onChange={handleInputChange}
                  placeholder="Enter contacts"
                  style={{ borderColor: errorFields.contacts ? 'red' : '' }}
                />
              </div>
              <div className="form-group col-md-6">
                <label className="oppo_form_lead" htmlFor="contacts">Lead Source</label>
                <select
                  id="lead_source"
                  name="lead_source"
                  value={oppourtunityData.lead_source}
                  onChange={handleInputChange}
                  style={{ borderColor: errorFields.lead_source ? 'red' : '' }}
                  className="form-control"
                >
                  <option value="">Select Lead Source</option>
                  {leadSourceOptions.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group col-md-6">
                <label className="oppo_form_isActive" htmlFor="isActive">Is Active</label>
                <input
                  type="text"
                  className="form-control"
                  id="isActive"
                  name="isActive"
                  value={oppourtunityData.isActive}
                  onChange={handleInputChange}
                  placeholder="Enter isActive"
                  style={{ borderColor: errorFields.isActive ? 'red' : '' }}
                />
              </div>
              <div className="form-group col-md-6">
                <label className="oppo_form_createdOn" htmlFor="createdOn"> createdOn</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="createdOn"
                  name="createdOn"
                  value={oppourtunityData.createdOn}
                  onChange={handleInputChange}
                  placeholder="Enter created On"
                  style={{ borderColor: errorFields.createdOn ? 'red' : '' }}
                />
              </div>
              <div className="form-group col-md-6">
                <label className="oppo_form_amount" htmlFor="amount">Amount</label>
                <input
                  type="text"
                  className="form-control"
                  id="amount"
                  name="amount"
                  value={oppourtunityData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  style={{ borderColor: errorFields.amount ? 'red' : '' }}
                />
              </div>
              <div className="form-group col-md-6">
                <label className="oppo_form_probability" htmlFor="probability">Probability</label>
                <input
                  type="text"
                  className="form-control"
                  id="probability"
                  name="probability"
                  value={oppourtunityData.probability}
                  onChange={handleInputChange}
                  placeholder="Enter probability"
                  style={{ borderColor: errorFields.probability ? 'red' : '' }}
                />
              </div>
              <div className="form-group col-md-6">
  <label htmlFor="stage" className="oppo_form_stage">Stage</label>
  <select
    className="form-control"
    id="stage"
    name="stage"
    value={oppourtunityData.stage}
    onChange={handleInputChange}
    style={{ borderColor: errorFields.stage ? 'red' : '' }}
  >
    <option value="">Select Lead Source</option>
                  {STAGES.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
  </select>
</div>


              <div className="form-group col-md-6">
                <label htmlFor="account" className="oppo_form_account">Account</label>
                <div className="account_form_data">
                <Select
  className="oppo_data_form"
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
      backgroundColor: state.isSelected ? "#6D31EDFF" : "white",
      color: state.isSelected ? "white" : "black",
    }),
    control: (provided) => ({
      ...provided,
      
      width: "260px",
      height: "36px",
      fontFamily: "Manrope",
      fontSize: "16px",
      lineHeight: "22px",
      fontWeight: "400",
      background: "#F3F4F6FF",
      borderRadius: "4px",
      borderWidth: "1px",
      borderColor: "#DEE1E645",
      outline: "none",
     
   
     
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "black",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9095A1FF",
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
                <label htmlFor="closedOn" className="oppo_form_closedon">closed On</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="closedOn"
                  name="closedOn"
                  value={oppourtunityData.closedOn}
                  onChange={handleInputChange}
                  placeholder="Enter time"
                  style={{ borderColor: errorFields.closedOn ? 'red' : '' }}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="description" className="oppo_form_description">Description</label>
                <input
                  type="text"
                  className="form-control_oopo_desc"
                  id="description"
                  name="description"
                  value={oppourtunityData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  style={{ borderColor: errorFields.description ? 'red' : '' }}
                />
              </div>
              {/* <div className="form-group col-md-6">
                <label htmlFor="stage" className="oppo_form_stage">Stage</label>
                <input
                  type="text"
                  className="form-control"
                  id="stage"
                  name="stage"
                  value={oppourtunityData.stage}
                  onChange={handleInputChange}
                  placeholder="Enter stage "
                />
              </div> */}
              {/* <div className="form-group col-md-6">
                <label htmlFor="createdBy" className="oppo_form_createdBy">created By </label>
                <input
                  type="text"
                  className="form-control"
                  id="createdBy"
                  name="createdBy"
                  value={oppourtunityData.createdBy}
                  onChange={handleInputChange}
                  placeholder="Enter createdBy"
                />
              </div> */}
              {/* <div className="form-group col-md-6">
                <label htmlFor="ClosedBy" className="oppo_form_closedBy">closed By</label>
                <input
                  type="text"
                  className="form-control"
                  id="ClosedBy"
                  name="ClosedBy"
                  value={oppourtunityData.closedBy}
                  onChange={handleInputChange}
                  placeholder="Enter time"
                />
              </div> */}
             
              
            </div>

            <div className="oppo_submit">
              <button type="submit" className="btn btn-primary1">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    {showPopup && <Popup errors={formErrors} onClose={closePopup} />}

{showSuccessPopup && <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />}
    </div>
        );
      };

export default Form3;

