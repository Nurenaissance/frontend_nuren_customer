import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import axiosInstance from "../../api.jsx";
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
  }, []);

  return (
    <div className="card_wrapper">
      <div className="card_wrapper_inner">
<<<<<<< HEAD
        <NavLink to={{
          pathname: `/${tenantId}/report`,
          state: { reportId: 'total_leads' }
        }}  className="card_1 card">
          <div className="card_one">
            <img src={Icon4} alt="icon" className="card_img" width={100} height={100} />
          </div>
          <div className="card_two">
=======
        <NavLink to={`/${tenantId}/report`} className="card_1 card">
          <div className="card_content">
            <i className="fas fa-users card_icon"></i>
>>>>>>> be7a37f281ffc63e1faf96ffdae63d999b249d74
            <p className="card_text_1">{totalLeads}</p>
            <p className="card_paragraph">Total Leads</p>
          </div>
        </NavLink>
<<<<<<< HEAD
        <NavLink to={{
          pathname: `/${tenantId}/report`,
          state: { reportId: 'this_month_leads' }
        }}  className="card_2 card">
          <div className="card_one">
            <img src={Icon3} alt="icon" className="card_img" width={100} height={100} />
          </div>
          <div className="card_two">
=======
        <NavLink to={`/${tenantId}/contacts`} className="card_2 card">
          <div className="card_content">
            <i className="fas fa-calendar-alt card_icon"></i>
>>>>>>> be7a37f281ffc63e1faf96ffdae63d999b249d74
            <p className="card_text_2">{new Date(createdAt).toLocaleDateString()}</p>
            <p className="card_paragraph">Created At</p>
          </div>
        </NavLink>
<<<<<<< HEAD
        <NavLink to={{
          pathname: `/${tenantId}/report`,
          state: { reportId: 'today_sales' }
        }}  className="card_3 card">
          <div className="card_one">
            <img src={Icon2} alt="icon" className="card_img" width={100} height={100} />
          </div>
          <div className="card_two">
=======
        <NavLink to={`/${tenantId}/opportunities`} className="card_3 card">
          <div className="card_content">
            <i className="fas fa-dollar-sign card_icon"></i>
>>>>>>> be7a37f281ffc63e1faf96ffdae63d999b249d74
            <p className="card_text_3">${parseFloat(leadsAmount).toLocaleString()}</p>
            <p className="card_paragraph">Leads Amount</p>
          </div>
        </NavLink>
<<<<<<< HEAD
        <NavLink to={{
          pathname: `/${tenantId}/report`,
          state: { reportId: 'sales_this_month' }
        }}  className="card_4 card">
          <div className="card_one">
            <img src={Icon1} alt="icon" className="card_img" width={100} height={100} />
          </div>
          <div className="card_two">
=======
        <NavLink to={`/${tenantId}/report`} className="card_4 card">
          <div className="card_content">
            <i className="fas fa-chart-line card_icon"></i>
>>>>>>> be7a37f281ffc63e1faf96ffdae63d999b249d74
            <p className="card_text_4">${parseFloat(revenue).toLocaleString()}</p>
            <p className="card_paragraph">Revenue</p>
          </div>
        </NavLink>
      </div>
    </div>
  );
};