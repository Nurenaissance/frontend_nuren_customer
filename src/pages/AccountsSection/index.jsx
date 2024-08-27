import "./accountsSection.css";
import { Sidebar } from "../../components/Sidebar/index.jsx";
import AccountsTable1 from "../../components/AccountsTableContent/Table.jsx";
import React, { useState, useEffect } from 'react';
import './AccountForm.jsx';
import { NavLink } from 'react-router-dom';
import Loader from "../../components/Loader/Loader.jsx";


import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path

const getTenantIdFromUrl = () => {

  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; 
  }
  return null; 
};


export const AccountsTable = () => {
  const tenantId = getTenantIdFromUrl();
  const [isLoading, setIsLoading] = useState(true);

  
  const handleAction = (event) => {
    const selectedValue = event.target.value;
    console.log("Action required:", selectedValue);

    
    if (selectedValue === "1") {
      // Redirect to the bulk import page
      navigate('/bulk-import');
    } else if (selectedValue === "2") {
      // Handle other actions as needed
      console.log("Logging out...");
    }
  };

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds delay for demonstration
  }, []);
  const handlePlusClick1 = () => {
    console.log("Plus clicked");
  };

  const handleRecords1 = (event) => {
    console.log("Records per page: ", event.target.value);
  };
 

  return (
    <div>
      <div className="account_nav">
    <TopNavbar/>
  </div>
  <Loader isLoading={isLoading}>
    <div className='accounts_main_page'>
              <div className="home_left_box1">
                <Sidebar />
              </div>
              <div className="accounts_containerofcomp_accountstable1">
              <AccountsTable1/>
              </div>
    </div>
    </Loader>
    </div>
    
  );
};