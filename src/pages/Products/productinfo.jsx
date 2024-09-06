import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './productinfo.css';
import uploadFileToAzure from "../../azureUpload.jsx";
import axiosInstance from "../../api.jsx";

const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};

export const ProductInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const tenantId = getTenantIdFromUrl();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/product/${id}/`);
        setProduct(response.data);
        console.log(product);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBackClick = () => {
    navigate(`/${tenantId}/product`);
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    console.log('Selected file:', selectedFile);
    
    if (selectedFile) {
      try {
        // Upload the file to Azure Blob Storage
        console.log('Uploading file to Azure Blob Storage...');
        const fileUrl = await uploadFileToAzure(selectedFile);
        console.log('File uploaded to Azure, URL:', fileUrl);

        // Send a POST request to your backend with the file URL
        console.log('Sending POST request to backend...');
        const response = await axiosInstance.post('https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/documents/', {
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

  if (!product) {
    return <div>Loading...</div>;
  }

  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const generateSmiley2 = (color) => (
    <div className="colored-circle2" style={{ backgroundColor: color, color:"white" }}>
      <span className="material-icons" style={{ fontSize: "60px", fontFamily: "'Material Symbols Outlined'" }}>person</span>
    </div>
  );



  return (
    <div className="product-info-page">
      <div className="product-info-sidebar">
        <button className="product-info-back-button" onClick={handleBackClick}>Back</button>
        <h2>Related List</h2>
        <ul className="product-info-sidebar-list">
          {['Notes', 'Cadences', 'Attachments', 'Deals', 'Emails', 'Open Activities', 'Closed Activities', 'Inviting meetings', 'Quotes', 'Sales Orders', 'Invoices', 'Purchase Orders', 'Cases', 'Social'].map((item, index) => (
            <li key={index} className="product-info-sidebar-item">{item}</li>
          ))}
        </ul>
      </div>
      
      <div className="product-info-main-content">
        <div className="product-info-header">
          <div className="product-info-avatar" style={{ backgroundColor: generateRandomColor() }}>
            <span className="material-icons" style={{ fontSize: "40px", color: "white" }}>person</span>
          </div>
          <div>
            <h1 className="product-info-title">{product.product_name}</h1>
            <p className="product-info-description">{product.description}</p>
          </div>
        </div>

        <div className="product-info-button-group">
          <button className="product-info-button product-info-button-overview">Overview</button>
          <button className="product-info-button product-info-button-timeline">Timeline</button>
        </div>

        <div className="product-info-section">
          <h2 className="product-info-section-title">Product Details</h2>
          {['Product Category', 'Unit Price', 'Vendor Name', 'Quantity Ordered', 'Quantity In Stock'].map((label, index) => (
            <div key={index} className="product-info-detail-row">
              <span className="product-info-detail-label">{label}:</span>
              <span className="product-info-detail-value">{product[label.toLowerCase().replace(' ', '_')]}</span>
            </div>
          ))}
        </div>

        {/* Repeat the above pattern for Vendor Details, Product Information, and Stock Information sections */}

        <div className="product-info-section">
          <h2 className="product-info-section-title">Notes</h2>
          <textarea className="product-info-notes-textarea" placeholder="Enter your notes here..."></textarea>
        </div>

        <div className="product-info-section">
          <h2 className="product-info-section-title">Attachments</h2>
          <div className="product-info-attachment-section">
            <input type="file" id="attachment-input" onChange={handleFileChange} style={{ display: 'none' }} />
            <label htmlFor="attachment-input">Click to upload</label>
          </div>
        </div>

        {['Price Books', 'Open Activities', 'Closed Activities', 'Cases', 'Solutions', 'Contacts', 'Leads', 'Deals', 'Accounts', 'Invoices'].map((section, index) => (
          <div key={index} className="product-info-section">
            <h2 className="product-info-section-title">{section}</h2>
            <button className="product-info-action-button">+ Add New {section}</button>
          </div>
        ))}
      </div>
    </div>
  );


  // return (
  //   <div className="productpageinfo">
  //     <div className="product-info-page">
  //       <div className="product-info-sidebar">
  //         <button className="productinfo-back-button" onClick={handleBackClick}>Back</button>
  //         <h2>Related List</h2>
  //         <ul>
  //           <li>Notes</li>
  //           <li>Cadences</li>
  //           <li>Attachments</li>
  //           <li>Deals</li>
  //           <li>Emails</li>
  //           <li>Open Activities</li>
  //           <li>Closed Activities</li>
  //           <li>Inviting meetings</li>
  //           <li>Quotes</li>
  //           <li>Sales Orders</li>
  //           <li>Invoices</li>
  //           <li>Purchase Orders</li>
  //           <li>Cases</li>
  //           <li>Social</li>
  //         </ul>
  //       </div>
  //       <div className="product-info-content">
  //         <h1>Product Details</h1>
  //         <h2 className="product-owner-name">{product.product_owner}</h2>
  //         <h2 className="product-details-des">{product.description}</h2>
  //         <div className="product-photo">
  //           {generateSmiley2(generateRandomColor())}
  //         </div>
  //         <div className="product-details">
  //           <h2>{product.product_name}</h2>
  //           <p>{product.description}</p>
  //           <a href={product.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
  //         </div>
  //         <div className="button-group">
  //           <div>
  //             <button className="button-overview">Overview</button>
  //           </div>
  //           <div>
  //             <button className="button-timeline">Timeline</button>
  //           </div>
  //         </div>
  //         <div className="product-details-box">
  //           <h2>Product Details</h2>
  //           <div className="product-detail-row">
  //             <span className="product-detail-label">Product Category:</span>
  //             <span className="product-detail-value">{product.product_category}</span>
  //           </div>
  //           <div className="product-detail-row">
  //             <span className="product-detail-label">Unit Price:</span>
  //             <span className="product-detail-value">${product.unit_price}</span>
  //           </div>
  //           <div className="product-detail-row">
  //             <span className="product-detail-label">Vendor Name:</span>
  //             <span className="product-detail-value">{product.vendor_name}</span>
  //           </div>
  //           <div className="product-detail-row">
  //             <span className="product-detail-label">Quantity Ordered:</span>
  //             <span className="product-detail-value">{product.qtyOrdered}</span>
  //           </div>
  //           <div className="product-detail-row">
  //             <span className="product-detail-label">Quantity In Stock:</span>
  //             <span className="product-detail-value">{product.quantityInStock}</span>
  //           </div>
  //         </div>
  //         <div className="vendor-details-box">
  //           <h2>Vendor Details</h2>
  //           <div className="product-vendordetail-row">
  //             <span className="product-vendor-detail-label">Vendor Name:</span>
  //             <span className="product-vendor-detail-value">{product.vendor_name}</span>
  //           </div>
  //         </div>
  //         <div className="product-information-box">
  //           <h2>Product Information</h2>
  //           <div className="information-product">
  //             <div className="product-informationdetail-row">
  //               <span className="product-informationdetail-label">Product Owner:</span>
  //               <span className="product-informationdetail-value">{product.product_owner}</span>
  //             </div>
  //             <div className="product-informationdetail-row">
  //               <span className="product-informationdetail-label">Product Name:</span>
  //               <span className="product-informationdetail-value">{product.product_name}</span>
  //             </div>
  //           </div>
  //           <div className="information-product">
  //             <div className="product-informationdetail-row">
  //               <span className="product-informationdetail-label">Product Code:</span>
  //               <span className="product-informationdetail-value">{product.product_code}</span>
  //             </div>
  //             <div className="product-informationdetail-row">
  //               <span className="product-informationdetail-label">Vendor Name:</span>
  //               <span className="product-informationdetail-value">{product.vendor_name}</span>
  //             </div>
  //           </div>
  //           <div className="information-product">
  //             <div className="product-informationdetail-row">
  //               <span className="product-informationdetail-label">Product Active:</span>
  //               <span className="product-informationdetail-value">{product.productActive}</span>
  //             </div>
  //             <div className="product-informationdetail-row">
  //               <span className="product-informationdetail-label">Manufacturer:</span>
  //               <span className="product-informationdetail-value">{product.manufacturer}</span>
  //             </div>
  //           </div>
  //           <div className="information-product">
  //             <div className="product-informationdetail-row">
  //               <span className="product-informationdetail-label">Sale Start Date:</span>
  //               <span className="product-informationdetail-value">{product.salesStartDate}</span>
  //             </div>
  //             <div className="product-informationdetail-row">
  //               <span className="product-informationdetail-label">Sale End Date:</span>
  //               <span className="product-informationdetail-value">{product.salesEndDate}</span>
  //             </div>
  //           </div>
  //           <div className="information-product">
  //             <div className="product-informationdetail-row">
  //               <span className="product-informationdetail-label">Support Start Date:</span>
  //               <span className="product-informationdetail-value">{product.supportStartDate}</span>
  //             </div>
  //             <div className="product-informationdetail-row">
  //               <span className="product-informationdetail-label">Support End Date:</span>
  //               <span className="product-informationdetail-value">{product.supportEndDate}</span>
  //             </div>
  //           </div>
  //           <div className="information-product">
  //             <div className="product-informationdetail-row">
  //               <span className="product-informationdetail-label">Tax:</span>
  //               <span className="product-informationdetail-value">{product.tax}</span>
  //             </div>
  //             <div className="product-informationdetail-row">
  //               <span className="product-informationdetail-label">Commission Rate:</span>
  //               <span className="product-informationdetail-value">{product.commission_rate}</span>
  //             </div>
  //           </div>
  //         </div>
  //         <div className="stock-information-box">
  //           <h2>Stock Information</h2>
  //           <div className="stock-product">
  //             <div className="stockdetail-row">
  //               <span className="stockdetail-label">Usage Unit:</span>
  //               <span className="stockdetail-value">{product.usage_unit}</span>
  //             </div>
  //             <div className="stockdetail-row">
  //               <span className="stockdetail-label">Reorder Level:</span>
  //               <span className="stockdetail-value">{product.reorderLevel}</span>
  //             </div>
  //           </div>
  //           <div className="stock-product">
  //             <div className="stockdetail-row">
  //               <span className="stockdetail-label">Quantity of Stock:</span>
  //               <span className="stockdetail-value">{product.quantityInStock}</span>
  //             </div>
  //             <div className="stockdetail-row">
  //               <span className="stockdetail-label">Quantity Ordered:</span>
  //               <span className="stockdetail-value">{product.qtyOrdered}</span>
  //             </div>
  //           </div>
  //           <div className="stock-product">
  //             <div className="stockdetail-row">
  //               <span className="stockdetail-label">Handler:</span>
  //               <span className="stockdetail-value">{product.handler}</span>
  //             </div>
  //             <div className="stockdetail-row">
  //               <span className="stockdetail-label">Quantity in Demand:</span>
  //               <span className="stockdetail-value">{product.quantityInDemand}</span>
  //             </div>
  //           </div>
  //           <div className="stockdetail-row">
  //             <span className="stockdetail-label">Description:</span>
  //             <span className="stockdetail-value">{product.description}</span>
  //           </div>
  //         </div>
  //         <div className="product-notes-box">
  //           <h2>Notes</h2>
  //           <textarea className="product-notes-textarea" placeholder="Enter your notes here..."></textarea>
  //         </div>
  //         <div className="product-attachment-section" id='Attachments'>
  //           <div className="product-attachments">Attachments</div>
  //           <div className="product-attachment-upload">
  //             <input type="file" id="attachment-input" onChange={handleFileChange} style={{ display: 'none' }} />
  //             <label htmlFor="attachment-input">
  //               <div className="product-clicktoupload">clicktoupload</div>
  //             </label>
  //           </div>
  //         </div>
  //         <div className="product-price-books-box">
  //           <h2>Price Books</h2>
  //           <div className="product-new-deals-button">
  //             <button className="product-button-add-content">+New Deals</button>
  //           </div>
  //         </div>
  //         <div className="product-price-books-box">
  //           <h2>Open Actitivities</h2>
  //           <div className="product-new-deals-button">
  //             <button className="product-button-add-content">+Add New Activity</button>
  //           </div>
  //         </div>
  //         <div className="product-price-books-box">
  //           <h2>Closed Activities</h2>
  //         </div>
  //         <div className="product-price-books-box">
  //           <h2>Cases</h2>
  //           <div className="product-new-deals-button">
  //             <button className="product-button-add-content">+Add New Case</button>
  //           </div>
  //         </div>
  //         <div className="product-price-books-box">
  //           <h2>Solutions</h2>
  //           <div className="product-new-deals-button">
  //             <button className="product-button-add-content">+Add Solutions</button>
  //           </div>
  //         </div>
  //         <div className="product-price-books-box">
  //           <h2>Contacts</h2>
  //           <div className="product-new-deals-button">
  //             <button className="product-button-add-content">Assign</button>
  //             <button className="product-button-add-content">New</button>
  //           </div>
  //         </div>
  //         <div className="product-price-books-box">
  //           <h2>Leads</h2>
  //           <div className="product-new-deals-button">
  //             <button className="product-button-add-content">Assign</button>
  //             <button className="product-button-add-content">New</button>
  //           </div>
  //         </div>
  //         <div className="product-price-books-box">
  //           <h2>Deals</h2>
  //           <div className="product-new-deals-button">
  //             <button className="product-button-add-content">Assign</button>
  //             <button className="product-button-add-content">New</button>
  //           </div>
  //         </div>
  //         <div className="product-price-books-box">
  //           <h2>Accounts</h2>
  //           <div className="product-new-deals-button">
  //             <button className="product-button-add-content">Assign</button>
  //             <button className="product-button-add-content">New</button>
  //           </div>
  //         </div>
  //         <div className="product-price-books-box">
  //           <h2>Invoices</h2>
  //           <div className="product-new-deals-button">
  //             <button className="product-button-add-content">Assign</button>
  //             <button className="product-button-add-content">New</button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default ProductInfo;
