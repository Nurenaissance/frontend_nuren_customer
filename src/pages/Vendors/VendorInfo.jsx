import axios from "axios";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { Link, useParams } from "react-router-dom";
import "./vendors.jsx";
import axiosInstance from "../../api.jsx";
import './vendorinfo.css';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded'; // Importing the icon
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path




const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; 
  }
  return null;
};
const VendorInfo = () => {

  const tenantId = getTenantIdFromUrl();
  const [vendor, setVendor] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [vendorInfo, setVendorInfo] = useState({
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
  });
  const { id } = useParams();
  const [meetings, setMeetings] = useState([]);
  const [photoColor, setPhotoColor] = useState('');

  useEffect(() => {
      const fetchVendorData = async () => {
        try {
          const response = await axiosInstance.get(`/vendor/${id}`);
        
          setVendorInfo(response.data);
        } catch (error) {
          console.error("Error fetching account data:", error);
        }
      };
  
      fetchVendorData();
    }, [id]);
    const handleScrollToSection = (sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    };
  

    const relatedListItems = [
      "Notes",
      "Cadences",
      "Attachments",
      "Deals",
      "Open Activities",
      "Closed Activities",
      "Invited Meetings",
      "Products",
      "Cases",
      "Quotes",
      "Sales Orders",
      "Purchase Orders",
      "Emails",
      "Invoices",
    ];
    const handleChange = (event) => {
      setVendorInfo({
        ...vendorInfo,
        [event.target.name]: event.target.value,
      });
    };
    const handleAddNote = (event) => {
      event.preventDefault();
      const newNote = {
        id: new Date().getTime(),
        text: vendorInfo.Notes,
      };
      setAddTaskTable({
          ...vendorInfo,
          RecentNotes: [newNote, ...vendorInfo.RecentNotes],
          Notes: "",
        });
      };
      const toggleAdditionalDetails = () => {
        setVendorInfo(!vendorInfo);
      };
      const handleAddMeeting = (event) => {
        event.preventDefault();
        const newMeeting = {
          CadenceName: vendorInfo.CadenceName,
          Modules: vendorInfo.Modules,
          CreatedDate: vendorInfo.CreatedDate,
          CreatedBy: vendorInfo.createdBy,
        };
        setMeetings([...meetings, newMeeting]);
        setVendorInfo({
          ...vendorInfo,
          CadenceName: "",
          Modules: "",
          CreatedDate: "",
          createdBy: "",
        });
        setIsModalOpen(false);
      };
      const handleCloseTask = () => {
        setIsModalOpen(true);
      };
      const handleCancelCloseTask = () => {
        setIsModalOpen(false);
      };
     
      const handleConfirmCloseTask = () => {
        setIsCompleted(true); // Mark the task as completed
        setIsModalOpen(false);
      };

      const generateRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      };
    
      const generateSmiley310 = () => (
        <div className="colored-circle301" style={{ backgroundColor: photoColor, color:"white" }}>
          <span className="material-icons" style={{ fontSize: "50px", fontFamily: "'Material Symbols Outlined'" }}>person</span>
        </div>
      );
      
//   return (
//     <div className="vendorinfo-page">
//     <div className="vendorinfo-left-sidebar">
//       <div className="vendorinfo-back-link">
//         <Link to={`/${tenantId}/vendors`}>Back</Link>
//       </div>
//       <nav className="vendorinfo-nav">
//         <ul>
//           {relatedListItems.map((item) => (
//             <li key={item}>
//               <a href={`#${item}`} onClick={() => handleScrollToSection(item)}>
//                 {item}
//               </a>
//             </li>
//           ))}
//         </ul>
//       </nav>
//     </div>

//     <div className="vendorinfo-right-content">
//       <div className="vendorinfo-top-navbar">
//         <TopNavbar />
//       </div>

//       <div className="vendorinfo-header">
//         <h1 className="vendorinfo-title">Vendor Details</h1>
//         <div className="vendorinfo-profile-photo">
//           {generateSmiley310()}
//           <div className="vendorinfo-upload-btn">
//             <button className="vendorinfo-button">Upload Image</button>
//           </div>
//         </div>
//       </div>

//       <div className="vendorinfo-tabs">
//         <button className="vendorinfo-tab-button vendorinfo-tab-active">Overview</button>
//         <button className="vendorinfo-tab-button">Timeline</button>
//       </div>

//       <div className="vendorinfo-details">
//         <section className="vendorinfo-section vendorinfo-basic-info">
//           <h2 className="vendorinfo-section-title">Basic Information</h2>
//           <div className="vendorinfo-field">
//             <span className="vendorinfo-field-label">Email:</span>
//             <span className="vendorinfo-field-value">{vendorInfo.email}</span>
//           </div>
//           <div className="vendorinfo-field">
//             <span className="vendorinfo-field-label">Phone:</span>
//             <span className="vendorinfo-field-value">{vendorInfo.phone}</span>
//           </div>
//           <div className="vendorinfo-field">
//             <span className="vendorinfo-field-label">Website:</span>
//             <span className="vendorinfo-field-value">{vendorInfo.website}</span>
//           </div>
//           <div className="vendorinfo-field">
//             <span className="vendorinfo-field-label">Category:</span>
//             <span className="vendorinfo-field-value">{vendorInfo.category}</span>
//           </div>
//           <div className="vendorinfo-field">
//             <span className="vendorinfo-field-label">GL Account:</span>
//             <span className="vendorinfo-field-value">{vendorInfo.category}</span>
//           </div>
//         </section>

//         <section className="vendorinfo-section vendorinfo-product-details">
//           <h2 className="vendorinfo-section-title">Product Details</h2>
//           <p className="vendorinfo-product-description">{vendorInfo.category}</p>
//         </section>

//         <section className="vendorinfo-section vendorinfo-additional-info">
//           <div className="vendorinfo-section-header">
//             <h2 className="vendorinfo-section-title">Vendor Information</h2>
//             <button onClick={toggleAdditionalDetails} className="vendorinfo-toggle-btn">
//               {vendorInfo ? "Hide Details" : "Show Details"}
//             </button>
//           </div>
//           {vendorInfo && (
//             <div className="vendorinfo-additional-details">
//               <div className="vendorinfo-field">
//                 <span className="vendorinfo-field-label">Vendor Owner:</span>
//                 <span className="vendorinfo-field-value">{vendorInfo.vendor_owner}</span>
//               </div>
//               <div className="vendorinfo-field">
//                 <span className="vendorinfo-field-label">Vendor Name:</span>
//                 <span className="vendorinfo-field-value">{vendorInfo.vendor_name}</span>
//               </div>
//               <div className="vendorinfo-field">
//                 <span className="vendorinfo-field-label">Email:</span>
//                 <span className="vendorinfo-field-value">{vendorInfo.email}</span>
//               </div>
//               <div className="vendorinfo-field">
//                 <span className="vendorinfo-field-label">Google Account:</span>
//                 <span className="vendorinfo-field-value">{vendorInfo.website}</span>
//               </div>
//               <div className="vendorinfo-field">
//                 <span className="vendorinfo-field-label">Created By:</span>
//                 <span className="vendorinfo-field-value">{vendorInfo.createdBy}</span>
//               </div>

//             </div>
//             )}
//         </section>
            
             
               
            
             
//           <div className='vendor_infobox4'>
//           <h1  className="vendor_detail-address">Address Information</h1>
//           <div className="vendor_detail-merge">
//           <div>
//             <ul>
//             <li className="vendor_box_data">Street :<span className='vend_boxdata'>{vendorInfo.street}</span> </li>
//             <li className="vendor_box_data">State :<span className='vend_boxdata'>{vendorInfo.state}</span> </li>
//             <li className="vendor_box_data">Country : <span className='vend_boxdata'>{vendorInfo.country}</span></li>
//             </ul>

//           </div>
//           <div>
//             <ul>
//             <li className="vendor_box_data">City : <span className='vend_boxdata'>{vendorInfo.city}</span></li>
//             <li className="vendor_box_data">Zip Code : <span className='vend_boxdata'>{vendorInfo.zipcode}</span></li>
          
//             </ul>

//           </div>
//           </div>
         
//           </div>
//           <div className='vendor_infobox5'>
//           <h1  className="vendor_detail-address">Description Information</h1>
//           <div className="vend-description">{vendorInfo.description}</div>
//             </div>
//             <div className="vendor_infobox5">
//               <h1 className="vendor_detail-notes">Notes</h1>
//               <div>
//                   <button className="vendor-notes-button"> Recent Notes</button>

//                   <ul className="recent-notes-list">
                  
//                   </ul>
//                   <form onSubmit={handleAddNote}>
//                 <textarea
//                   name="Notes"
//                   value={vendorInfo.Notes}
//                   onChange={handleChange}
//                   className="notes-textarea-vendor"
//                   placeholder="Add Notes........"
//                 ></textarea>
                
//               </form>
//                 </div>
//             </div>
//             <div className="vendor_infobox5">
//               <h1 className="vendor_detail-notes">Cadences</h1>
//               <div className="addcadencebtn-vend">
//               <button onClick={() => setIsModalOpen(true)}>+Add Cadence</button>

//               </div>

//             </div>
//             <div className="vendor_infobox5">
//               <h1 className="vendor_detail-notes">Attachments</h1>
//               <div class="attachment-upload1vend">
//                 <input type="file" id="attachment-input" />
//                 <label for="attachment-input">
//                   <div className="clicktoupload1">clicktoupload</div>
//                 </label>
//               </div>
//             </div>
//             <div className="vendor_infobox5">
//               <h1 className="vendor_detail-notes">Products</h1>
//               {/* <table>
//         <thead  className='table_vend'>
//           <tr>
//             <th>Product Name</th>
//             <th>Product Code</th>
//             <th>Product Active</th>
//           </tr>
//         </thead>
//         <tbody>
//           <td>Cookies</td>
//           <td>334455</td>
//           <td>yes</td>
//           </tbody>
//       </table> */}
//             </div>
//             <div className="vendor_infobox5">
//               <h1 className="vendor_detail-notes">Perchase Orders</h1>
//             </div>
//             <div className="vendor_infobox5">
//               <h1 className="vendor_detail-notes">Contacts</h1>
//               <div className="Assignnewvend">
//               <div className="assign1vend">
//                 {" "}
//                 <button>Assign</button>
//               </div>
//               <div className="assign2vend">
//                 {" "}
//                 <button>+New</button>
//               </div>
//             </div>
//             </div>
//             <div className="vendor_infobox5">
//               <h1 className="vendor_detail-notes">Open Activities</h1>
//               <div className="addcadencebtn-vend">
//               <button onClick={() => setIsModalOpen(true)}>+Add New Activity</button>

//               </div>
//             </div>
//             <div className="vendor_infobox5">
//               <h1 className="vendor_detail-notes">Email</h1>
//             </div>
//             <div className="vendor_infobox5">
//               <h1 className="vendor_detail-notes">Closed Activities</h1>
//             </div>
//             <div className="vendor_infobox5">
//               <h1 className="vendor_detail-notes">Survey</h1>
//               <div className="Assignnewvend">
//               <div className="assign1vend">
//                 {" "}
//                 <button>Assign</button>
//               </div>
//               <div className="assign2vend">
//                 {" "}
//                 <button>+New</button>
//               </div>
//             </div>
//             </div>
//  </div>
// </div>
// </div>

//     </div>
//   )


  return (
    <div className="vendorinfo-page">
      <div className="vendorinfo-left-sidebar">
        <div className="vendorinfo-back-link">
          <Link to={`/${tenantId}/vendors`}>Back</Link>
        </div>
        <nav className="vendorinfo-nav">
          <ul>
            {relatedListItems.map((item) => (
              <li key={item}>
                <a href={`#${item}`} onClick={() => handleScrollToSection(item)}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
  
      <div className="vendorinfo-right-content">
        <div className="vendorinfo-top-navbar">
          <TopNavbar />
        </div>
  
        <div className="vendorinfo-header">
          <h1 className="vendorinfo-title">Vendor Details</h1>
          <div className="vendorinfo-profile-photo">
            {generateSmiley310()}
            <div className="vendorinfo-upload-btn">
              <button className="vendorinfo-button">Upload Image</button>
            </div>
          </div>
        </div>
  
        <div className="vendorinfo-tabs">
          <button className="vendorinfo-tab-button vendorinfo-tab-active">Overview</button>
          <button className="vendorinfo-tab-button">Timeline</button>
        </div>
  
        <div className="vendorinfo-details">
          <section className="vendorinfo-section vendorinfo-basic-info">
            <h2 className="vendorinfo-section-title">Basic Information</h2>
            <div className="vendorinfo-field">
              <span className="vendorinfo-field-label">Email:</span>
              <span className="vendorinfo-field-value">{vendorInfo.email}</span>
            </div>
            <div className="vendorinfo-field">
              <span className="vendorinfo-field-label">Phone:</span>
              <span className="vendorinfo-field-value">{vendorInfo.phone}</span>
            </div>
            <div className="vendorinfo-field">
              <span className="vendorinfo-field-label">Website:</span>
              <span className="vendorinfo-field-value">{vendorInfo.website}</span>
            </div>
            <div className="vendorinfo-field">
              <span className="vendorinfo-field-label">Category:</span>
              <span className="vendorinfo-field-value">{vendorInfo.category}</span>
            </div>
            <div className="vendorinfo-field">
              <span className="vendorinfo-field-label">GL Account:</span>
              <span className="vendorinfo-field-value">{vendorInfo.category}</span>
            </div>
          </section>
  
          <section className="vendorinfo-section vendorinfo-product-details">
            <h2 className="vendorinfo-section-title">Product Details</h2>
            <p className="vendorinfo-product-description">{vendorInfo.category}</p>
          </section>
  
          <section className="vendorinfo-section vendorinfo-additional-info">
            <div className="vendorinfo-section-header">
              <h2 className="vendorinfo-section-title">Vendor Information</h2>
              <button onClick={toggleAdditionalDetails} className="vendorinfo-toggle-btn">
                {vendorInfo ? "Hide Details" : "Show Details"}
              </button>
            </div>
            {vendorInfo && (
              <div className="vendorinfo-additional-details">
                <div className="vendorinfo-field">
                  <span className="vendorinfo-field-label">Vendor Owner:</span>
                  <span className="vendorinfo-field-value">{vendorInfo.vendor_owner}</span>
                </div>
                <div className="vendorinfo-field">
                  <span className="vendorinfo-field-label">Phone:</span>
                  <span className="vendorinfo-field-value">{vendorInfo.phone}</span>
                </div>
                <div className="vendorinfo-field">
                  <span className="vendorinfo-field-label">Website:</span>
                  <span className="vendorinfo-field-value">{vendorInfo.website}</span>
                </div>
                <div className="vendorinfo-field">
                  <span className="vendorinfo-field-label">Category:</span>
                  <span className="vendorinfo-field-value">{vendorInfo.category}</span>
                </div>
                <div className="vendorinfo-field">
                  <span className="vendorinfo-field-label">Vendor Name:</span>
                  <span className="vendorinfo-field-value">{vendorInfo.vendor_name}</span>
                </div>
                <div className="vendorinfo-field">
                  <span className="vendorinfo-field-label">Email:</span>
                  <span className="vendorinfo-field-value">{vendorInfo.email}</span>
                </div>
                <div className="vendorinfo-field">
                  <span className="vendorinfo-field-label">GL account:</span>
                  <span className="vendorinfo-field-value">{vendorInfo.website}</span>
                </div>
                <div className="vendorinfo-field">
                  <span className="vendorinfo-field-label">Created By:</span>
                  <span className="vendorinfo-field-value">{vendorInfo.createdBy}</span>
                </div>
              </div>
            )}
          </section>
  
          <section className="vendorinfo-section vendorinfo-address">
            <h2 className="vendorinfo-section-title">Address Information</h2>
            <div className="vendorinfo-address-details">
              <div className="vendorinfo-field">
                <span className="vendorinfo-field-label">Street:</span>
                <span className="vendorinfo-field-value">{vendorInfo.street}</span>
              </div>
              <div className="vendorinfo-field">
                <span className="vendorinfo-field-label">State:</span>
                <span className="vendorinfo-field-value">{vendorInfo.state}</span>
              </div>
              <div className="vendorinfo-field">
                <span className="vendorinfo-field-label">Country:</span>
                <span className="vendorinfo-field-value">{vendorInfo.country}</span>
              </div>
              <div className="vendorinfo-field">
                <span className="vendorinfo-field-label">City:</span>
                <span className="vendorinfo-field-value">{vendorInfo.city}</span>
              </div>
              <div className="vendorinfo-field">
                <span className="vendorinfo-field-label">Zip Code:</span>
                <span className="vendorinfo-field-value">{vendorInfo.zipcode}</span>
              </div>
            </div>
          </section>
  
          <section className="vendorinfo-section vendorinfo-description">
            <h2 className="vendorinfo-section-title">Description Information</h2>
            <p className="vendorinfo-description-text">{vendorInfo.description}</p>
          </section>
  
          <section className="vendorinfo-section vendorinfo-notes">
            <h2 className="vendorinfo-section-title">Notes</h2>
            <button className="vendorinfo-button">Recent Notes</button>
            <ul className="vendorinfo-recent-notes-list">
              {/* Add recent notes here if available */}
            </ul>
            <form onSubmit={handleAddNote}>
              <textarea
                name="Notes"
                value={vendorInfo.Notes}
                onChange={handleChange}
                className="vendorinfo-textarea"
                placeholder="Add Notes..."
              ></textarea>
            </form>
          </section>
  
          <section className="vendorinfo-section vendorinfo-cadences">
            <h2 className="vendorinfo-section-title">Cadences</h2>
            <div className="vendorinfo-add-cadence">
              <button onClick={() => setIsModalOpen(true)} className="vendorinfo-button">+Add Cadence</button>
            </div>
          </section>
  
          <section className="vendorinfo-section vendorinfo-attachments">
            <h2 className="vendorinfo-section-title">Attachments</h2>
            <div className="vendorinfo-attachment-upload">
              <input type="file" id="attachment-input" className="vendorinfo-file-input" />
              <label htmlFor="attachment-input" className="vendorinfo-upload-label">
                Click to upload
              </label>
            </div>
          </section>
  
          <section className="vendorinfo-section vendorinfo-products">
            <h2 className="vendorinfo-section-title">Products</h2>
            {/* Add product table or list here */}
          </section>
  
          <section className="vendorinfo-section vendorinfo-purchase-orders">
            <h2 className="vendorinfo-section-title">Purchase Orders</h2>
            {/* Add purchase orders information here */}
          </section>
  
          <section className="vendorinfo-section vendorinfo-contacts">
            <h2 className="vendorinfo-section-title">Contacts</h2>
            <div className="vendorinfo-contact-actions">
              <button className="vendorinfo-button">Assign</button>
              <button className="vendorinfo-button">+New</button>
            </div>
          </section>
  
          <section className="vendorinfo-section vendorinfo-open-activities">
            <h2 className="vendorinfo-section-title">Open Activities</h2>
            <div className="vendorinfo-add-activity">
              <button onClick={() => setIsModalOpen(true)} className="vendorinfo-button">+Add New Activity</button>
            </div>
          </section>
  
          <section className="vendorinfo-section vendorinfo-emails">
            <h2 className="vendorinfo-section-title">Email</h2>
            {/* Add email information or functionality here */}
          </section>
  
          <section className="vendorinfo-section vendorinfo-closed-activities">
            <h2 className="vendorinfo-section-title">Closed Activities</h2>
            {/* Add closed activities information here */}
          </section>
  
          <section className="vendorinfo-section vendorinfo-survey">
            <h2 className="vendorinfo-section-title">Survey</h2>
            <div className="vendorinfo-survey-actions">
              <button className="vendorinfo-button">Assign</button>
              <button className="vendorinfo-button">+New</button>
            </div>
          </section>
        </div>
      </div>
  
      {/* Modal for adding cadence or activity */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="vendorinfo-modal"
      >
        {/* Add modal content here */}
        <h2>Add New Cadence/Activity</h2>
        {/* Add form fields for new cadence or activity */}
        <button onClick={() => setIsModalOpen(false)}>Close</button>
      </Modal>
    </div>
  );
}

export default VendorInfo
