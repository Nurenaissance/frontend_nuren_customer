

import React, { useState, useEffect } from 'react';
import './report.css';
import GraphPage from './GraphPage.jsx'; // Import the new GraphPage component
import axiosInstance from "../../api.jsx";
import TopNavbar from "../TopNavbar/TopNavbar.jsx";
import { Dropdown } from "react-bootstrap";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip, Line, BarChart, Bar, LabelList, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from "../../authContext";
import { Link, NavLink } from 'react-router-dom';

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1];
  }
  return null;
};

const Report = () => {
    const { userRole } = useAuth(); // Destructure userRole from useAuth hook

    const tenantId = getTenantIdFromUrl();
    const modelName = "reports";
    const [reportData, setReportData] = useState([]);
    const [reportId, setReportId] = useState(""); 
    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [barChartData, setBarChartData] = useState([]);
    const [donutChartData, setDonutChartData] = useState([]);
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#d94a49', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


    useEffect(() => {
        const fetchReportData = async () => {
            if (reportId) {
                setIsLoading(true);
                try {
                    const response = await axiosInstance.get(`/report/${reportId}/`);
                    console.log('Response:', response);
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
                    setReportData([]);
                } finally {
                    setIsLoading(false);
                }
            }
        };
    
        fetchReportData();
    }, [reportId]);


    
    const reportListItems = [
        'total_leads',
        'this_month_leads',
        'converted_leads',
        'lead_source',
        'total_calls',
        'total_opportunities',
        'total_meetings',
        'top_users',
        'Contact_mailing_list',
        'call_email',
        'total_campaign',
        'total_interaction',
        'today_lead',
        'leads_account_name',
        'campaign_status',
        'today_sales',
        'lead_by_source',
        'sales_this_month',
        'vendor_owner',
    ];

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
            default:
                return null;
        }
    };

    const renderReportRows = () => {
        console.log('reportData:', reportData);
        console.log('reportId:', reportId);
    
        if (!reportData) {
            return (
                <tr>
                    <td colSpan="6">No data available</td>
                </tr>
            );
        }
    
        switch (reportId) {
            case 'total_leads':
                console.log('Rendering total_leads:', reportData.leads);
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
                if (typeof reportData !== 'object' || !reportData  || !reportData.first_name) {
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
                if (!Array.isArray(reportData.contacts) || reportData.contacts.length === 0) {
                    return (
                        <tr>
                            <td colSpan="2">No data available</td>
                        </tr>
                    );
                }
                return reportData.contacts.map((contact, index) => (
                    <tr key={index}>
                        <td>{contact.first_name || 'N/A'}</td>
                        <td>{contact.last_name || 'N/A'}</td>
                    </tr>
                ));
    
                case 'call_email':
                    if (!Array.isArray(reportData.emails) || reportData.emails.length === 0) {
                        return (
                            <tr>
                                <td colSpan="3">No data available</td>
                            </tr>
                        );
                    }
                    return reportData.emails.map((email, index) => (
                        <tr key={index}>
                            <td>{email.address || 'N/A'}</td>
                            <td>{email.email || 'N/A'}</td>
                            <td>{email.phone || 'N/A'}</td>
                        </tr>
                    ));
                
                default:
                    return null;
                }
                };

                if (userRole !== 'Admin') {
                    return (
                        <div>
                            <p>You do not have permission to view this page.</p>
                        </div>
                    );
                }
                
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
                
                return (
                <div className='report-page'>
                    <div className="report-sidebar1">
                        <ul className='report-sidebardata'>
                            {reportListItems.map((item, index) => (
                                <li key={index} onClick={() => setReportId(item)}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='report-merge-excel'>
                        <div className="report_nav">
                            <TopNavbar />
                        </div>
                        <div className='report-excel'>
                            <div>
                                <Dropdown>
                                    <Dropdown.Toggle variant="primary" id="payments-dropdown6" className="excel-dropdown-menu6-report">
                                        Excel File
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item>
                                            <Link to={`/bulk-import?model=${modelName}`} className="import-excel-btn5">
                                                Import Excel
                                            </Link>
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            <button className="excel-download-btn1">
                                                Excel
                                            </button>
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                            <div className="createreport">
                                <NavLink to={`/${tenantId}/reportform`} id="btn1"> +Create Report</NavLink>
                            </div>
                        </div>
                        <div>
                            <h1 className='report-head'>
                                Reports
                            </h1>
                        </div>
                       
                        <div>
                            <h1 className="text-heading-line">Line chart </h1>
                            <ResponsiveContainer width="100%" aspect={3}>
                            <LineChart data={chartData} margin={{ right: 300 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="value" stroke="#8884d8" />
</LineChart>

                            </ResponsiveContainer>
                        </div>
                        <div className='merge-chart'>
                        <div>
                            <h1 className="text-heading-bar">Bar Chart</h1>
                            <ResponsiveContainer width="60%" height={250} aspect={3}>
                            <BarChart data={formatBarChartData()} margin={{ right: 300 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="value" fill="#8884d8">
        <LabelList dataKey="value" position="top" />
    </Bar>
</BarChart>

                            </ResponsiveContainer>
                        </div>
                        <div className="chart-item">
            <h1 className="text-heading-chart">Donut Chart</h1>
            <ResponsiveContainer width="60%" height={300} aspect={4}>
            <PieChart>
    <Pie
        data={donutChartData}
        dataKey="value"
        cx="50%"
        cy="50%"
        outerRadius={100}
        innerRadius={70}
        fill="#8884d8"
        label
    >
        {donutChartData.map((entry, index) => (
            <Cell
                key={`cell-${index}`}
                fill={index === 0 ? '#FF6984' : '#76A8D6'} 
            />
        ))}
    </Pie>
    <Tooltip />
</PieChart>

            </ResponsiveContainer>
        </div>
                        </div>
                        <div>
                            <table className='report-table'>
                                <thead >
                                    {renderTableHeadings()}
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="3">Loading...</td>
                                        </tr>
                                    ) : (
                                        renderReportRows()
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                );
                }
                
                export default Report;
                

