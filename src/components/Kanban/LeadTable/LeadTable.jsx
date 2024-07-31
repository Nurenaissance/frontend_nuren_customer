import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api";
import "./LeadTable.css";

const LeadTable = () => {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/leads/");
        setLeads(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "in process":
        return "status-lightpink";
      case "converted":
        return "status-lightgreen";
      case "assigned":
        return "status-lightpurple";
      default:
        return "status-gray";
    }
  };

  const getCircleColor = (index) => {
    const colors = [
      "circle-purple",
      "circle-blue",
      "circle-orange",
      "circle-red",
      "circle-green"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="lead-table-container">
      <table className="lead-table">
        <thead>
          <tr>
            <th className="lead-table-header"></th>
            <th className="lead-table-header">Name</th>
            <th className="lead-table-header">Account Name</th>
            <th className="lead-table-header">Email</th>
            <th className="lead-table-header">Enquiry Type</th>
            <th className="lead-table-header">Created on</th>
            <th className="lead-table-header">Status</th>
            <th className="lead-table-header">Assigned to</th>
            <th className="lead-table-header">Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, index) => (
            <tr key={lead.id} className="lead-table-row">
              <td className="icon-cell">
                <div className={`icon ${getCircleColor(index)}`}>$</div>
              </td>
              <td className="name-cell">
                {`${lead.first_name} ${lead.last_name}`}
              </td>
              <td>{lead.account_name}</td>
              <td>{lead.email}</td>
              <td className="lead-enquiry">{lead.enquery_type}</td>
              <td>{new Date(lead.createdOn).toLocaleDateString()}</td>
              <td>
                <span className={`status-label ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </td>
              <td>{lead.assigned_to}</td>
              <td>...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
