import React, { useState, useEffect } from 'react';
import './report.css';
import GraphPage from './GraphPage'; // Corrected import path
import axiosInstance from '../../api';
import TopNavbar from '../TopNavbar/TopNavbar';
import { Dropdown } from 'react-bootstrap';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip, Line, BarChart, Bar, LabelList, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../authContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1];
  }
  return null;
};

const Report = () => {
  const { userRole } = useAuth();
  const tenantId = getTenantIdFromUrl();
  const [reportData, setReportData] = useState(null); // Initialize with null
  const [reportId, setReportId] = useState('total_leads'); // Set default reportId
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [donutChartData, setDonutChartData] = useState([]);
  const [selectedHeading, setSelectedHeading] = useState('Total Leads'); // Default heading
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#d94a49', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const navigate = useNavigate();


  const reportHeadings = {
    total_leads: 'Total Leads',
    this_month_leads: 'This Month Leads',
    converted_leads: 'Converted Leads',
    lead_source: 'Lead Source',
    total_calls: 'Total Calls',
    total_opportunities: 'Total Opportunities',
    total_meetings: 'Total Meetings',
    top_users: 'Top Users',
    Contact_mailing_list: 'Contact Mailing List',
    call_email: 'Call Email',
    total_campaign: 'Total Campaign',
    total_interaction: 'Total Interaction',
    today_lead: 'Today Lead',
    leads_account_name: 'Leads Account Name',
    campaign_status: 'Campaign Status',
    today_sales: 'Today Sales',
    lead_by_source: 'Lead By Source',
    sales_this_month: 'Sales This Month',
    vendor_owner: 'Vendor Owner',
  };

  
  const handleBackClick = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/report/${reportId}/`);
        console.log('Response:', response.data);
        setReportData(response.data);

        let dataForChart = [];
        let barData = [];

        if (Array.isArray(response.data)) {
          dataForChart = response.data;
          barData = response.data.map(item => ({
            name: item.name,
            value: item.value
          }));
        } else if (typeof response.data === 'object') {
          dataForChart = Object.entries(response.data).map(([key, value]) => ({
            name: key,
            value: value
          }));
          barData = Object.entries(response.data).map(([key, value]) => ({
            name: key,
            value: value
          }));
        }

        setChartData(dataForChart);
        setBarChartData(barData);
        setDonutChartData(formatDonutChartData(barData)); // Format data for donut chart
      } catch (error) {
        console.error('Error fetching report data:', error);
        setReportData(null); // Set reportData back to null on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [reportId]);

  const formatBarChartData = () => {
    if (!Array.isArray(barChartData)) {
      console.error('Error: barChartData is not an array.');
      return [];
    }

    const formattedData = barChartData.map((item, index) => ({
      name: item.name,
      value: item.value // Adjust this based on the structure of your barChartData
    }));
    return formattedData;
  };

  const formatDonutChartData = (data) => {
    if (!Array.isArray(data)) {
      console.error('Error: data is not an array.');
      return [];
    }

    const formattedData = data.map((item, index) => ({
      name: item.name,
      value: item.value
    }));
    return formattedData;
  };

  const renderTableHeadings = () => {
    switch (reportId) {
      case 'total_leads':
        return (
          <tr>
            <th>Email</th>
            <th>Created On</th>
            <th>Title</th>
            <th>Created By</th>
            <th>First Name</th>
            <th>Last Name</th>
          </tr>
        );
      case 'this_month_leads':
        return (
          <tr>
            <th>Attribute</th>
            <th>Value</th>
          </tr>
        );
      case 'converted_leads':
        return (
          <tr>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
        );
      case 'lead_source':
        return (
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Account Name</th>
            <th>Source</th>
          </tr>
        );
      case 'total_calls':
        return (
          <tr>
            <th>Related To</th>
            <th>Call Type</th>
            <th>Outgoing Status</th>
          </tr>
        );
      case 'total_opportunities':
        return (
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Stage</th>
            <th>Probability</th>
          </tr>
        );
      case 'total_meetings':
        return (
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Related To</th>
            <th>Location</th>
            <th>From Time</th>
            <th>To Time</th>
          </tr>
        );
      case 'Contact_mailing_list':
        return (
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
          </tr>
        );
      case 'call_email':
        return (
          <tr>
            <th>Address</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        );
        case 'total_campaign':
        return (
          <tr>
            <th>Campaign Owner</th>
            <th>Campaign Name</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderReportRows = () => {
    if (!reportData) {
      return (
        <tr>
          <td colSpan="6">No data available</td>
        </tr>
      );
    }

    switch (reportId) {
      case 'total_leads':
        if (!Array.isArray(reportData.leads) || reportData.leads.length === 0) {
          return (
            <tr>
              <td colSpan="6">No data available</td>
            </tr>
          );
        }
        return reportData.leads.map((lead, index) => (
          <tr key={index}>
            <td>{lead.email || 'N/A'}</td>
            <td>{lead.createdOn || 'N/A'}</td>
            <td>{lead.title || 'N/A'}</td>
            <td>{lead.createdBy || 'N/A'}</td>
            <td>{lead.first_name || 'N/A'}</td>
            <td>{lead.last_name || 'N/A'}</td>
          </tr>
        ));

      case 'this_month_leads':
        return (
          <tr>
            <td>New Leads Count</td>
            <td>{reportData.total_leads ? reportData.total_leads : 'N/A'}</td>
          </tr>
        );

      case 'converted_leads':
        if (typeof reportData !== 'object' || !reportData || !reportData.first_name) {
          return (
            <tr>
              <td colSpan="3">No data available</td>
            </tr>
          );
        }
        return (
          <tr>
            <td>{reportData.first_name || 'N/A'}</td>
            <td>{reportData.phone || 'N/A'}</td>
            <td>{reportData.status || 'N/A'}</td>
          </tr>
        );

      case 'lead_source':
        if (!Array.isArray(reportData.source) || reportData.source.length === 0) {
          return (
            <tr>
              <td colSpan="5">No data available</td>
            </tr>
          );
        }
        return reportData.source.map((lead, index) => (
          <tr key={index}>
            <td>{lead.first_name || 'N/A'}</td>
            <td>{lead.last_name || 'N/A'}</td>
            <td>{lead.email || 'N/A'}</td>
            <td>{lead.account_name || 'N/A'}</td>
            <td>{lead.source || 'N/A'}</td>
          </tr>
        ));

      case 'total_calls':
        if (!Array.isArray(reportData.calls) || reportData.calls.length === 0) {
          return (
            <tr>
              <td colSpan="3">No data available</td>
            </tr>
          );
        }
        return reportData.calls.map((call, index) => (
          <tr key={index}>
            <td>{call.related_to || 'N/A'}</td>
            <td>{call.call_type || 'N/A'}</td>
            <td>{call.outgoing_status || 'N/A'}</td>
          </tr>
        ));

      case 'total_opportunities':
        if (!Array.isArray(reportData.opportunity) || reportData.opportunity.length === 0) {
          return (
            <tr>
              <td colSpan="4">No data available</td>
            </tr>
          );
        }
        return reportData.opportunity.map((opportunity, index) => (
          <tr key={index}>
            <td>{opportunity.name || 'N/A'}</td>
            <td>{opportunity.amount || 'N/A'}</td>
            <td>{opportunity.stage || 'N/A'}</td>
            <td>{opportunity.probability || 'N/A'}</td>
          </tr>
        ));

      case 'total_meetings':
        if (!Array.isArray(reportData.meetings) || reportData.meetings.length === 0) {
          return (
            <tr>
              <td colSpan="6">No data available</td>
            </tr>
          );
        }
        return reportData.meetings.map((meeting, index) => (
          <tr key={index}>
            <td>{meeting.title || 'N/A'}</td>
            <td>{meeting.description || 'N/A'}</td>
            <td>{meeting.related_to || 'N/A'}</td>
            <td>{meeting.location || 'N/A'}</td>
            <td>{meeting.from_time || 'N/A'}</td>
            <td>{meeting.to_time || 'N/A'}</td>
          </tr>
        ));

      case 'Contact_mailing_list':
        if (!Array.isArray(reportData.mailing_list) || reportData.mailing_list.length === 0) {
          return (
            <tr>
              <td colSpan="6">No data available</td>
            </tr>
          );
        }
        return reportData.mailing_list.map((Contacts, index) => (
          <tr key={index}>
            <td>{Contacts.first_name || 'N/A'}</td>
            <td>{Contacts.last_name || 'N/A'}</td>
          </tr>
        ));

      case 'call_email':
        if (!Array.isArray(reportData.mailing_list) || reportData.mailing_list.length === 0) {
          return (
            <tr>
              <td colSpan="6">No data available</td>
            </tr>
          );
        }
        return reportData.call_email.map((Contacts, index) => (
          <tr>
            <td>{reportData.address || 'N/A'}</td>
            <td>{reportData.email || 'N/A'}</td>
            <td>{reportData.phone || 'N/A'}</td>
          </tr>
         ) );
         case 'total_campaign':
          console.log('Total Campaign Data:', reportData.total_campaign);
          if (!Array.isArray(reportData.total_campaign) || reportData.length === 0) {
            return (
              <tr>
                <td colSpan="2">No data available</td>
              </tr>
            );
          }
          return reportData.map((campaign, index) => (
            <tr key={index}>
              <td>{campaign.campaign_owner || 'N/A'}</td>
              <td>{campaign.campaign_name || 'N/A'}</td>
            </tr>
          ));

      default:
        return null;
    }
  };

  const handleReportChange = (eventKey) => {
    setReportId(eventKey);
    setSelectedHeading(reportHeadings[reportId]);

  };


  return (
    <div className="report-page">
      <div className="report-page__container">
        <div className="report-page__sidebar">
          <button onClick={handleBackClick} className="report-page__back-btn">
            &larr; Back
          </button>
          <h2 className="report-page__sidebar-title">Reports</h2>
          <input type="text" placeholder="Search reports..." className="report-page__search-input" />
          <ul className="report-page__report-list">
            {Object.entries(reportHeadings).map(([key, value]) => (
              <li key={key} className={reportId === key ? 'report-page__report-item--active' : 'report-page__report-item'}>
                <button onClick={() => handleReportChange(key)}>{value}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="report-page__main-content">
          <TopNavbar />
          <div className="report-page__breadcrumb">
            <span>Reports</span> &gt; <span>{reportHeadings[reportId]}</span>
          </div>
          <h1 className="report-page__title">{reportHeadings[reportId]}</h1>
          {isLoading ? (
            <div className="report-page__loading">Loading...</div>
          ) : (
            <>
              <div className="report-page__graph-container">
                <GraphPage
                  chartData={chartData}
                  barChartData={barChartData}
                  donutChartData={donutChartData}
                  COLORS={COLORS}
                  userRole={userRole}
                />
              </div>
              <div className="report-page__table-container">
                <table className="report-page__table">
                  <thead>{renderTableHeadings()}</thead>
                  <tbody>{renderReportRows()}</tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;
