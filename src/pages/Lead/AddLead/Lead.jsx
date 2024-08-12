import React from 'react'
import AddLead from '../../../components/AddLead/AddLead'
import { Sidebar } from '../../../components/Sidebar'
import { Header } from '../../../components/Header'
import { Link } from 'react-router-dom';


import "./lead.css"

const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};

function Lead() {
  const tenantId = getTenantIdFromUrl();

  return (
    <>
      <div className="lead">
      <div className="container">
        <div className="lead_inner">
          <div className="lead_left_box">
          <Link to={`../${tenantId}/lead`}>Back</Link>
          </div>
          <div className="lead_right_box">
            <Header name="Create Lead" />
            
            <div className="lead_right_box_inner">
              <AddLead/>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Lead