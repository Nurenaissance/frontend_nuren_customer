import { NavLink, Link } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { Dropdown, Card, ListGroup } from "react-bootstrap";
import axiosInstance from "../../api";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path
import './loyalty.css';
import React, { useState, useEffect } from 'react';

const getTenantIdFromUrl = () => {
    const pathArray = window.location.pathname.split('/');
    if (pathArray.length >= 2) {
        return pathArray[1]; // Assumes tenant_id is the first part of the path
    }
    return null;
};

const Loyalityform = () => {
    const tenantId = getTenantIdFromUrl();
    const [formData, setFormData] = useState({
        minimum_quantity: '',
        minimum_purchase: '',
        grant_loyalty_points: '',
        selection_option: '',
        reward_type: '',
        discount: '',
        max_discount: '',
        exchange_description: '',
        discount_option: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleCancel = () => {
        const isConfirmed = window.confirm("Are you sure you want to cancel? Any unsaved data will be lost.");
        if (isConfirmed) {
            console.log("Cancel button clicked");
            window.location.href = `../${tenantId}/loyalty`;
        }
    };

    const handleSaveAsDraft = () => {
        console.log("Save as Draft button clicked");
    };

    const handleSubmitForm = async (event) => {
    event.preventDefault();
    console.log("Form data submitted:", formData);

    try {
        const response = await axiosInstance.post(`/loyalty_programs/`, formData); // Use the same URL
        console.log('Form submitted successfully:', response.data);
        window.location.href = `../${tenantId}/loyaltyinfo`;
    } catch (error) {
        console.error('Error submitting form:', error);
    }
};
    return (
        <div className='loyal_page-form'>
            <div className="home_left_box-loyal">
                <Sidebar />
            </div>
            <div>
                <div className="home_right_box-loyal">

                <div className='loyal_topbar'>
                    <TopNavbar />
                </div>
                <div>
                    <div className="form-head-loyal">
                        <div>
                            <h1 className='loyal-head'>Loyalty Program</h1>
                        </div>
                        <div className='btnsss-form-loyal'>
                            <button type="button" onClick={handleCancel} className="btn-submit-loyalcancel">Cancel</button>
                            <button type="button" onClick={handleSaveAsDraft} className="btn-submit-loyaldraft">Save as Draft</button>
                            <button type="submit" onClick={handleSubmitForm} className="btn-submit-loyalsave">Submit</button>
                        </div>
                    </div>
                    <div>
                        <h1 className="form_condition">Conditional Rules & Rewards</h1>
                    </div>
                    <div>
                        <h1 className="form_condition">Conditions</h1>
                    </div>
                    <div className="form-loyal-box">
                        <div className="form-loyal-box--">
                            <div className="form-loyal-box--data">
                                <ul>
                                    <h1 className="loyal-table-d">CONDITIONS</h1>
                                    <li className="loyal-table-d">
                                        Minimum Quantity
                                        <input
                                            type="number"
                                            name="minimum_quantity"
                                            value={formData.minimum_quantity}
                                            className='form-data-loyal'
                                            onChange={handleInputChange}
                                            style={{ position:'relative',bottom:'25px', left:'130px'}}
                                        />
                                    </li>
                                    <li className="loyal-table-d">
                                        Minimum Purchase
                                        <input
                                            type="number"
                                            name="minimum_purchase"
                                            value={formData.minimum_purchase}
                                             className='form-data-loyal'
                                            onChange={handleInputChange}
                                            style={{ position:'relative',bottom:'25px', left:'130px'}}
                                        />
                                    </li>
                                    <li className="loyal-table-d">
                                        Content type
                                        <input
                                            type="text"
                                            name="content_type"
                                            value={formData.content_type}
                                             className='form-data-loyal'
                                            onChange={handleInputChange}
                                            style={{ position:'relative',bottom:'25px', left:'100px'}}
                                        />
                                    </li>
                                   
                                </ul>
                            </div>
                            <div>
                                <ul>
                                    <h1 className="loyal-table-d">Points(S)</h1>
                                    <li className="loyal-table-d">
                                        Grant
                                        <input
                                            type="number"
                                            placeholder="Loyalty Points"
                                            name="grant_loyalty_points"
                                            value={formData.grant_loyalty_points}
                                            onChange={handleInputChange}
                                             className='form-data-loyal'
                                            style={{ marginLeft: '10px' }}
                                        />
                                    </li>
                                    <li className="loyal-table-d">
                                        <label>
                                            <input
                                                type="radio"
                                                name="selection_option"
                                                value="per_dollar"
                                                checked={formData.selection_option === 'per_dollar'}
                                                onChange={handleInputChange}
                                            />
                                            Per $ Spent
                                        </label>
                                    </li>
                                    <li className="loyal-table-d">
                                        <label>
                                            <input
                                                type="radio"
                                                name="selection_option"
                                                value="per_unit"
                                                checked={formData.selection_option === 'per_unit'}
                                                onChange={handleInputChange}
                                            />
                                            Per Unit Paid
                                        </label>
                                    </li>
                                    <li className="loyal-table-d">
                                        <label>
                                            <input
                                                type="radio"
                                                name="selection_option"
                                                value="per_order"
                                                checked={formData.selection_option === 'per_order'}
                                                onChange={handleInputChange}
                                            />
                                            Per Order
                                        </label>
                                    </li>
                                  
                                <li className="loyal-table-d">
                                        Company
                                        <input
                                            type="text"
                                            placeholder="company name"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                             className='form-data-loyal'
                                            style={{ marginLeft: '100px', position:'relative',bottom:'25px'}}
                                        />
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h1 className="form_condition">Rewards</h1>
                    </div>
                    <div className="form-loyal-box1">
                        <div>
                            <ul>
                                <h1 className="loyal-table-d2">Rewards</h1>
                                <li className="loyal-table-d">
                                    Reward Type
                                    <input
                                        type="text"
                                        name="reward_type"
                                        value={formData.reward_type}
                                         className='form-data-loyal'
                                        onChange={handleInputChange}
                                    />
                                </li>
                                <li className="loyal-table-d">
                                    Discount
                                    <input
                                        type="number"
                                        name="discount"
                                        value={formData.discount}
                                         className='form-data-loyal'
                                        onChange={handleInputChange}
                                    />
                                </li>
                                <li className="loyal-table-d">
                                Loyality Program
                                    <input
                                        type="text"
                                        name="loyalty_program"
                                        value={formData.loyalty_program}
                                         className='form-data-loyal'
                                        onChange={handleInputChange}
                                    />
                                </li>
                                <li className="loyal-table-d">
                                    start Date
                                    <input
                                        type="date"
                                        name="start_date"
                                        className='form-data-loyal'

                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                    />
                                </li>
                                <li className="loyal-table-d">
                                    End Date
                                    <input
                                        type="date"
                                        name="end_date"
                                        className='form-data-loyal'

                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                    />
                                </li>
                            </ul>
                        </div>
                        <div className='loyal-form--'>
                            <ul>
                                <h1 className="loyal-table-d1">DISCOUNT</h1>
                                <li className="loyal-table-d">
                                    Max Discount?
                                    <input
                                        type="number"
                                        name="max_discount"
                                        value={formData.max_discount}
                                         className='form-data-loyal'
                                        onChange={handleInputChange}
                                    />
                                </li>
                                <li className="loyal-table-d">
                                    <label>
                                        <input
                                            type="radio"
                                            name="discount_option"
                                            value="cheapest_product"
                                            checked={formData.discount_option === 'cheapest_product'}
                                            onChange={handleInputChange}
                                        />
                                        Cheapest Product
                                    </label>
                                </li>
                                <li className="loyal-table-d">
                                    <label>
                                        <input
                                            type="radio"
                                            name="discount_option"
                                            value="specific_products"
                                            checked={formData.discount_option === 'specific_products'}
                                            onChange={handleInputChange}
                                        />
                                        Specific Products
                                    </label>
                                </li>
                                <li className="loyal-table-d">
                                    <label>
                                        <input
                                            type="radio"
                                            name="discount_option"
                                            value="order"
                                            checked={formData.discount_option === 'order'}
                                            onChange={handleInputChange}
                                        />
                                        Order
                                    </label>
                                </li>
                                <li className="loyal-table-d">
                                    Contacts
                                        <input
                                            type="text"
                                            name="contacts"
                                            value={formData.contacts}
                                             className='form-data-loyal'
                                            onChange={handleInputChange}
                                            style={{ position:'relative',bottom:'1px', left:'10px'}}
                                            placeholder="contact"
                                        />
                                    </li>
                              
                              
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Loyalityform;
