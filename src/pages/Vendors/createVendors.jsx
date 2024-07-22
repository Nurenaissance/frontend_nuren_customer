
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Modal from "@mui/material/Modal";
import { Header } from "../../components/Header";
import Select from "react-select";
import axiosInstance from "../../api.jsx";
import './vendors.css';
import './vendors.jsx';
import { useAuth } from "../../authContext.jsx";
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded'; // Importing the icon
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path
import { Navbar } from "react-bootstrap";
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
        <h2>Vendors Created Sucessfully</h2>
        <button className="product-popup-ok-button2" onClick={onClose}>OK</button>
      </div>
    </div>
  );

  
const Vendorsform = () => {

  const navigate = useNavigate();
    const tenantId=getTenantIdFromUrl();
    const {userId}=useAuth();
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

    const [photoColor, setPhotoColor] = useState('');
    const [formErrors, setFormErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorFields, setErrorFields] = useState({});

    useEffect(() => {
      setPhotoColor(generateRandomColor());
    }, []); // Empty dependency array ensures that this effect runs only once, when the component mounts
  

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [vendorData, setVendorData] = useState({
        vendor_name: "",
        vendor_owner: "",
        email: "",
        phone: "",
        website: "",     
        state:"",
        city:"",
        country:"",
        description:"",
        street:"",
        zipcode:"",
        category:"",
        tenant:tenantId,
      });

     
      const handleSubmit = async (e) => {

      
        e.preventDefault();
        try {
          const response = await axiosInstance.post('/vendors', vendorData);
          console.log("Form submitted:", response.data);
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
          // Optionally, handle errors or display error message to the user
        }
      };
      const handleSaveAsDraft = async (e) => {
        e.preventDefault();
        try {
          const draftData = {
            ...vendorData,
            status: "Draft",
          };
          const response = await axiosInstance.post('/vendors', draftData);
          console.log("Form saved as draft:", response.data);
        } catch (error) {
          console.error("Error saving draft:", error);
          if (error.response) {
            setFormErrors(error.response.data || error.message);
          } else {
            setFormErrors({ networkError: 'Network Error. Please try again later.' });
          }
          setShowPopup(true);
        }
      };
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updatedErrorFields = { ...errorFields };
        delete updatedErrorFields[name];
        setErrorFields(updatedErrorFields);
        setVendorData({ ... vendorData, [name]: value });
      };
      const handleCancel = () => {
    
        const isConfirmed = window.confirm("Are you sure you want to cancel? Any unsaved data will be lost.");
        
      
        if (isConfirmed) {
          localStorage.removeItem('vendorDraft'); 
          console.log("Cancel button clicked");
         
          window.location.href = `../${tenantId}/vendors`;
        }
      };

      useEffect(() => {
        const draftData = localStorage.getItem('vendorDraft');
        if (draftData) {
          setOppourtunityData(JSON.parse(draftData));
        }
      }, []);
      const generateRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      };
      useEffect(() => {
        // Set initial error fields based on formErrors
        const initialErrorFields = {};
        Object.keys(formErrors).forEach(field => {
          initialErrorFields[field] = true;
        });
        setErrorFields(initialErrorFields);
      }, [formErrors]);
    
      const generateSmiley31 = () => (
        <div className="colored-circle31" style={{ backgroundColor: photoColor, color:"white" }}>
          <span className="material-icons" style={{ fontSize: "50px", fontFamily: "'Material Symbols Outlined'" }}>person</span>
        </div>
      );
      
      
      
      const handleSubmitForm = (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        localStorage.removeItem('vendorDraft'); 
        handleSubmit(event);
      };

      const closePopup = () => {
        setShowPopup(false);
      };
    
      const closeSuccessPopup = () => {
        setShowSuccessPopup(false);
        navigate(`/${tenantId}/vendors`);
    
      };

  return (
  <div>
      <div className="toppp">
      <TopNavbar/>
      </div>
      <div className="vendor_form_page">
       
      <div className="relatedvendor_back">
             <Link className='task_back' to={`/${tenantId}/vendors`}>Back</Link>
           </div>
          
         
           <div>
          
          
  
           <div>
          
  
         
           <div>
          
            
         <h1 className="create_form_vendor"  >Create Vendors</h1>
     </div>
     <div className="photo100">
            {generateSmiley31()}
            <div className='pic_btn1'>
            <FileUploadRoundedIcon  className="upload_icon133"   />
            <button className="upload_button1">Upload Image</button>
            </div>
         
          </div>
          
     
     <div>
     <div className='btnsss_vendor'>
                 <button type="button" onClick={handleCancel} className="btn-submit_cancel_vendor">Cancel</button>
                 <button type="button"   onClick={handleSaveAsDraft}  className="btn-submit_save_vendor">Save as Draft</button>
                 <button type="submit"  onClick={handleSubmitForm} className="btn-submit_submit_vendor">Submit</button>
               </div>
     </div>
           </div>
     
     
     
             <div className='form-vendor'>
             
             <form onSubmit={handleSubmit}>
             <div>
              <h1 className='ad-vendor_ad' >Vendor Information</h1>
           </div>
           <div className="front_section-vendor" >
             <div className="left-section-vendor">
               <label   className='vendor_sub' htmlFor="vendor_owner">Vendor Owner</label>
               <input 
                 type="text" 
                 id="vendor_owner" 
                 className="form-control-remind"
     
                 name="vendor_owner" 
                 value={vendorData.vendor_owner} 
                 onChange={handleInputChange} 
                 placeholder="Enter vendor Owner"
                 style={{ borderColor: errorFields.vendor_owner ? 'red' : '' }}
     
               />
               <label className='vendor_sub' htmlFor="phone">Phone :</label>
               <input 
                 type="text" 
                 id="phone" 
                 className="form-control-vendor"
     
                 name="phone" 
                 value={vendorData.phone} 
                 onChange={handleInputChange} 
                 placeholder="Enter phone number"
                 style={{ borderColor: errorFields.phone ? 'red' : '' }}
     
               />
               <label className='vendor_sub' htmlFor="website">Website :</label>
               <input 
                 type="text" 
                 id="website"
                 className="form-control-vendor"
      
                 name="website" 
                 value={vendorData.website} 
                 onChange={handleInputChange} 
                 placeholder="Enter website"
                 style={{ borderColor: errorFields.website ? 'red' : '' }}
     
               />
               <label className='vendor_sub' htmlFor="category">GL Account :</label>
               <input 
                 type="text" 
                 id="category"
                 className="form-control-vendor"
      
                 name="category" 
                 value={vendorData.category} 
                 onChange={handleInputChange} 
                 placeholder="Enter account"
                 style={{ borderColor: errorFields.category ? 'red' : '' }}
     
               />
        
  
             </div>
             <div className="right-section-vendor">
               <label htmlFor="vendor_name" className='vendor_sub'>Vendor Name:</label>
               <input 
                 type="text" 
                 id="vendor_name" 
                 className="form-control-vendor"
                 name="vendor_name" 
                 value={vendorData.vendor_name} 
                 onChange={handleInputChange} 
                 placeholder="Enter vendor_name"
                 style={{ borderColor: errorFields.vendor_name ? 'red' : '' }}
     
               />
               <label htmlFor="email" className='vendor_sub'>Email :</label>
               <input 
                 type="text" 
                 id="email" 
                 name="email"
                 className="form-control-vendor" 
                 value={vendorData.email} 
                 onChange={handleInputChange} 
                 placeholder="Enter email"
                 style={{ borderColor: errorFields.email ? 'red' : '' }}
     
               />
               <label htmlFor="category" className='vendor_sub'>Catagory :</label>
               <input 
                 type="text" 
                 id="category" 
                 className="form-control-vendor"
                 name="category" 
                 value={vendorData.category} 
                 onChange={handleInputChange} 
                 placeholder="Enter category"
                 style={{ borderColor: errorFields.category ? 'red' : '' }}
     
               />
                 <label htmlFor="email" className='vendor_sub'>Email Opt Out :</label>
               <input 
                 type="text" 
                 id="email" 
                 className="form-control-vendor"
                 name="email" 
                 value={vendorData.email} 
                 onChange={handleInputChange} 
                 placeholder="Enter email opt "
                 style={{ borderColor: errorFields.email ? 'red' : '' }}
     
               />
             </div>
           </div>
           <div>
              <h1 className="ad-vendor">Address Information</h1>
           </div>
           <div className="second_vendor_form">
           <div className="front_section-vendor" >
             <div className="left-section-vendor">
               <label   className='vendor_sub' htmlFor="street">Street</label>
               <input 
                 type="text" 
                 id="street" 
                 className="form-control-vendor"
     
                 name="street" 
                 value={vendorData.street} 
                 onChange={handleInputChange} 
                 placeholder="Enter street"
                 style={{ borderColor: errorFields.street ? 'red' : '' }}
     
               />
               <label className='vendor_sub' htmlFor="state">State :</label>
               <input 
                 type="text" 
                 id="state" 
                 className="form-control-vendor"
     
                 name="state" 
                 value={vendorData.state} 
                 onChange={handleInputChange} 
                 placeholder="Enter state"
                 style={{ borderColor: errorFields.state ? 'red' : '' }}
               />
             
        
  
             </div>
             <div className="right-section-vendor">
               <label htmlFor="city" className='vendor_sub'>City :</label>
               <input 
                 type="text" 
                 id="city" 
                 className="form-control-vendor"
                 name="city" 
                 value={vendorData.city} 
                 onChange={handleInputChange} 
                 placeholder="Enter city"
                 style={{ borderColor: errorFields.city ? 'red' : '' }}
     
               />
               <label htmlFor="zipcode" className='vendor_sub'>Zip code :</label>
               <input 
                 type="text" 
                 id="zipcode" 
                 name="zipcode"
                 className="form-control-vendor" 
                 value={vendorData.zipcode} 
                 onChange={handleInputChange} 
                 placeholder="Enter zipcode"
                 style={{ borderColor: errorFields.zipcode ? 'red' : '' }}
               />
               <label htmlFor="country" className='vendor_sub'>Country :</label>
               <input 
                 type="text" 
                 id="country" 
                 className="form-control-vendor"
                 name="country" 
                 value={vendorData.country} 
                 onChange={handleInputChange} 
                 placeholder="Enter country"
                 style={{ borderColor: errorFields.country ? 'red' : '' }}
               />
              
             </div>
           </div>
  
           </div>
          
           <div>
           <label   className='ad-vendor-des' htmlFor="description">Description:</label>
               <input 
                 type="text" 
                 id="description" 
                 className="form-vend-desc"
     
                 name="description" 
                 value={vendorData.description} 
                 onChange={handleInputChange} 
                 placeholder="Enter description"
                 style={{ borderColor: errorFields.description ? 'red' : '' }}
               />
              </div>
              <div className="tanent-vendor">
  <div>
  <label   className='ad-vendor-ten' htmlFor="tenantId">Tanent:</label>
               <input 
                 type="text" 
                 id="tenantId" 
                 className="form-vend-tanent"
     
                 name="tenantId" 
                 value={tenantId}
                 onChange={handleInputChange} 
               
     
               />   
  </div>
              </div>
     
           <button className="submit-vendor" type="submit">Submit</button>
         </form>
             </div>
           </div>
         
         
       </div>
       {showPopup && <Popup errors={formErrors} onClose={closePopup} />}

{showSuccessPopup && <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />}
  </div>
  )
}

export default Vendorsform
