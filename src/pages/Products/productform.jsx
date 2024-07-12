import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './productform.css';
import axiosInstance from "../../api.jsx";
import { useNavigate } from "react-router-dom";


const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; 
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
      <h2>Product Created Sucessfully</h2>
      <button className="product-popup-ok-button2" onClick={onClose}>OK</button>
    </div>
  </div>
);

const ProductForm = () => {
  const navigate = useNavigate();
  const tenantId = getTenantIdFromUrl();
  const [formData, setFormData] = useState({
    tenant:tenantId,
    productImage: '',
    product_owner: '',
    product_code: '',
    productActive: false,
    product_category: '',
    salesEndDate: '',
    supportEndDate: '',
    product_name: '',
    vendor_name: '',
    manufacturer: '',
    salesStartDate: '',
    supportStartDate: '',
    unit_price: '',
    tax: '',
    commission_rate: '',
    usage_unit: '',
    quantityInStock: '',
    handler: '',
    qtyOrdered: '',
    reorderLevel: '',
    quantityInDemand: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorFields, setErrorFields] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

      const updatedErrorFields = { ...errorFields };
    delete updatedErrorFields[name];
    setErrorFields(updatedErrorFields);
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
  };

  useEffect(() => {
    // Set initial error fields based on formErrors
    const initialErrorFields = {};
    Object.keys(formErrors).forEach(field => {
      initialErrorFields[field] = true;
    });
    setErrorFields(initialErrorFields);
  }, [formErrors]);


  const validateTax = (tax) => {
    const taxRegex = /^\d{1,3}(\.\d{1,2})?$/;
    if (!taxRegex.test(tax)) {
      return "Ensure that there are no more than 3 digits before the decimal point.";
    }
    return null;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      const response = await axiosInstance.post('/products/', formData);
      console.log('Form submitted successfully:', response.data);

      setSuccessMessage(response.data.message);
      setShowSuccessPopup(true);


    } catch (error) {
      console.error('Error submitting form:', error);
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

  const closePopup = () => {
    setShowPopup(false);
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    navigate(`/${tenantId}/product`);

  };
  

  return (
    <div className="product-forms-page">
      <div className="product-Sidebar">
        <Link to={`/${tenantId}/product`}>Back</Link>
      </div>
      <div className="product-form-container">
        <h1 className="product-form-heading">Create Product</h1>
        <div className="form-buttons-container">
          <button type="submit" className="product-form-button product-form-button-submit" onClick={handleSubmit}>Submit</button>
          <button type="button" className="product-form-button product-form-button-savedraft">Save as Draft</button>
          <button type="button" className="product-form-button product-form-button-cancel">Cancel</button>
        </div>

        <form>
          <div className="product-section">
            <h2 className="product-section-heading">Product Image</h2>
            <div className="product-header">
              <input type="file" name="productImage" className="product-form-input" onChange={handleChange} />
            </div>
          </div>

          <div className="product-section">
            <div className="product-section-heading">
              <h2>Product Information</h2>
            </div>
            <div className="product-forms">
              <div className="product-form-group col-md-6">
                <label htmlFor="product_owner" className='product_anual_ownership'>Product Owner:</label>
                <input
                  type="text"
                  className="form-control_account1"
                  id="product_owner"
                  name="product_owner"
                  value={formData.product_owner}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.product_owner ? 'red' : '' }}
                  placeholder="Enter Account Owner"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="product_name" className='product_anual_name'>Product Name:</label>
                <input
                  type="text"
                  className="form-control_email"
                  id="product_name"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.product_name ? 'red' : '' }}
                  placeholder="Enter product name"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="product_code" className='product_code'>Product Code:</label>
                <input
                  type="text"
                  className="form-control_product-code"
                  id="product_code"
                  name="product_code"
                  value={formData.product_code}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.product_code ? 'red' : '' }}
                  placeholder="Enter Product Code"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="vendor_name" className='vendor-name'>Vendor Name:</label>
                <input
                  type="text"
                  className="form-control_vendor-name"
                  id="vendor_name"
                  name="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.vendor_name ? 'red' : '' }}
                  placeholder="Enter Vendor Name"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="productActive" className='product-active'>Product Active:</label>
                <input
                  type="checkbox"
                  className="form-control_product-active"
                  id="productActive"
                  name="productActive"
                  checked={formData.productActive}
                  onChange={handleChange}
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="manufacturer" className='manufacturer'>Manufacturer:</label>
                <input
                  type="text"
                  className="form-control_manufacturer"
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.manufacturer ? 'red' : '' }}
                  placeholder="Enter Manufacturer"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="product_category" className='product_category'>Product Category: </label>
                <input
                  type="text"
                  className="form-control_product-category"
                  id="product_category"
                  name="product_category"
                  value={formData.product_category}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.product_category ? 'red' : '' }}
                  placeholder="Enter product category"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="salesStartDate" className='SalesStartDate'>Sales Start Date:</label>
                <input
                  type="date"
                  className="form-control_salesstartdate"
                  id="salesStartDate"
                  name="salesStartDate"
                  value={formData.salesStartDate}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.salesStartDate ? 'red' : '' }}
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="salesEndDate" className='SalesEndDate'>Sales End Date:</label>
                <input
                  type="date"
                  className="form-control_salesenddate"
                  id="salesEndDate"
                  name="salesEndDate"
                  value={formData.salesEndDate}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.salesEndDate ? 'red' : '' }}
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="supportStartDate" className='supportStartDate'>Support Start Date:</label>
                <input
                  type="date"
                  className="form-control_supportstartdate"
                  id="supportStartDate"
                  name="supportStartDate"
                  value={formData.supportStartDate}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.supportStartDate ? 'red' : '' }}
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="supportEndDate" className='supportEndDate'>Support End Date:</label>
                <input
                  type="date"
                  className="form-control_supportenddate"
                  id="supportEndDate"
                  name="supportEndDate"
                  value={formData.supportEndDate}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.supportEndDate ? 'red' : '' }}
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="unit_price" className='unit_price'>Unit Price:</label>
                <input
                  type="text"
                  className="form-control_unit-price"
                  id="unit_price"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.unit_price ? 'red' : '' }}
                  placeholder="Enter Unit Price"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="tax" className='tax'>Tax:</label>
                <input
                  type="text"
                  className="form-control_tax"
                  id="tax"
                  name="tax"
                  value={formData.tax}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.tax ? 'red' : '' }}
                  placeholder="Enter Tax"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="commission_rate" className='commission_rate'>Commission Rate:</label>
                <input
                  type="text"
                  className="form-control_commission-rate"
                  id="commission_rate"
                  name="commission_rate"
                  value={formData.commission_rate}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.commission_rate ? 'red' : '' }}
                  placeholder="Enter Commission Rate"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="usage_unit" className='usage_unit'>Usage Unit:</label>
                <input
                  type="text"
                  className="form-control_usage-unit"
                  id="usage_unit"
                  name="usage_unit"
                  value={formData.usage_unit}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.usage_unit ? 'red' : '' }}
                  placeholder="Enter Usage Unit"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="quantityInStock" className='quantityInStock'>Quantity in Stock:</label>
                <input
                  type="text"
                  className="form-control_quantity-in-stock"
                  id="quantityInStock"
                  name="quantityInStock"
                  value={formData.quantityInStock}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.quantityInStock ? 'red' : '' }}
                  placeholder="Enter Quantity in Stock"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="handler" className='handler'>Handler:</label>
                <input
                  type="text"
                  className="form-control_handler"
                  id="handler"
                  name="handler"
                  value={formData.handler}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.handler ? 'red' : '' }}
                  placeholder="Enter Handler"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="qtyOrdered" className='qtyOrdered'>Quantity Ordered:</label>
                <input
                  type="text"
                  className="form-control_quantity-ordered"
                  id="qtyOrdered"
                  name="qtyOrdered"
                  value={formData.qtyOrdered}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.qtyOrdered ? 'red' : '' }}
                  placeholder="Enter Quantity Ordered"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="reorderLevel" className='reorderLevel'>Reorder Level:</label>
                <input
                  type="text"
                  className="form-control_reorder-level"
                  id="reorderLevel"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.reorderLevel ? 'red' : '' }}
                  placeholder="Enter Reorder Level"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="quantityInDemand" className='quantityInDemand'>Quantity in Demand:</label>
                <input
                  type="text"
                  className="form-control_quantity-in-demand"
                  id="quantityInDemand"
                  name="quantityInDemand"
                  value={formData.quantityInDemand}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.quantityInDemand ? 'red' : '' }}
                  placeholder="Enter Quantity in Demand"
                />
              </div>
              <div className="product-form-group col-md-6">
                <label htmlFor="description" className='description'>Description:</label>
                <input
                  type="text"
                  className="form-control_description"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{ borderColor: errorFields.description ? 'red' : '' }}
                  placeholder="Enter Description"
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      {showPopup && <Popup errors={formErrors} onClose={closePopup} />}
      {showSuccessPopup && <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />}
    </div>
  );
};


export default ProductForm;