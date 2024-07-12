import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import axiosInstance from "../../api.jsx";

import Icon1 from "../../assets/image1dp.png";
import Icon2 from "../../assets/image2dp.png";
import Icon3 from "../../assets/image3dp.png";
import Icon4 from "../../assets/image4dp.png";
import "./card.css";

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1];
  }
  return null;
};

export const Card = () => {
  const location = useLocation();
  const tenantId = getTenantIdFromUrl();

  const [totalLeads, setTotalLeads] = useState(0);
  const [createdAt, setCreatedAt] = useState("");
  const [leadsAmount, setLeadsAmount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`https://webappbaackend.azurewebsites.net/generate-report/`);
        console.log("API Response:", response.data);
        setTotalLeads(response.data.total_leads);
        setCreatedAt(response.data.created_at);
        setLeadsAmount(response.data.leads_amount);
        setRevenue(response.data.revenue);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to fetch only once on component mount

  return (
    <div className="card_wrapper">
      <div className="card_wrapper_inner">
        <NavLink to={`/${tenantId}/report`} className="card_1 card">
          <div className="card_one">
            <img src={Icon4} alt="icon" className="card_img" width={100} height={100} />
          </div>
          <div className="card_two">
            <p className="card_text_1">{totalLeads}</p>
            <p className="card_paragraph">Total Leads</p>
          </div>
        </NavLink>
        <NavLink to={`/${tenantId}/contacts`} className="card_2 card">
          <div className="card_one">
            <img src={Icon3} alt="icon" className="card_img" width={100} height={100} />
          </div>
          <div className="card_two">
            <p className="card_text_2">{new Date(createdAt).toLocaleDateString()}</p>
            <p className="card_paragraph">Created At</p>
          </div>
        </NavLink>
        <NavLink to={`/${tenantId}/opportunities`} className="card_3 card">
          <div className="card_one">
            <img src={Icon2} alt="icon" className="card_img" width={100} height={100} />
          </div>
          <div className="card_two">
            <p className="card_text_3">${parseFloat(leadsAmount).toLocaleString()}</p>
            <p className="card_paragraph">Leads Amount</p>
          </div>
        </NavLink>
        <NavLink to={`/${tenantId}/report`} className="card_4 card">
          <div className="card_one">
            <img src={Icon1} alt="icon" className="card_img" width={100} height={100} />
          </div>
          <div className="card_two">
            <p className="card_text_4">${parseFloat(revenue).toLocaleString()}</p>
            <p className="card_paragraph">Revenue</p>
          </div>
        </NavLink>
      </div>
    </div>
  );
};
