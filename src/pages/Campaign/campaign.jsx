import './campaign.css';
import { NavLink, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';

import { Dropdown,Card, ListGroup } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';


import { Sidebar } from "../../components/Sidebar";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import axiosInstance from '../../api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};
const Campaign = () => {
  const tenantId=getTenantIdFromUrl();
  const navigate = useNavigate();
  const modelName = "campaigns";
  const [campaign, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);

  const [newCampaign, setNewCampaign] = useState({
    id:"",
    campaign_name: "",
    start_date: "",
    end_date: "",
    expected_revenue: "",
    actual_cost: "",
    numbers_sent:"" ,
    type: "",
    status: "",
    budgeted_cost: "",
    expected_response: "",
    description: "",
    campaign_owner: ""
  });
  useEffect(() => {
    fetchCampaigns();
  }, []);
  const fetchCampaigns = async () => {
    try {
      const response = await axiosInstance.get('/campaign/');
      const data = await response.data;
     
      setCampaigns(data);
      setFilteredCampaigns(data);
    } catch (error) {
      console.log("Error fetching campaigns:", error);
    }
  };
  const handleRecords3 = (event) => {
    console.log("Records per page: ", event.target.value);
  };

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredCampaigns);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Campaigns");
    XLSX.writeFile(wb, "campaigns.xlsx");
  };

  const handleDownloadPDF = () => {
    const unit = "pt";
    const size = "A4"; // Use A4 size for simplicity
    const orientation = "landscape"; // Landscape orientation for table format
  
    const doc = new jsPDF(orientation, unit, size);
  
    const title = "Campaigns Report";
    const headers = [
      [
        "Campaign Name",
        "Campaign Owner",
        "Channel",
        "Created On",
        "Status",
        "Est. Revenue"
      ]
    ];
  
    const data = filteredCampaigns.map(campaign => [
      campaign.campaign_name,
      campaign.campaign_owner,
      campaign.type,
      campaign.start_date,
      campaign.status,
      campaign.expected_revenue
    ]);
  
    doc.setFontSize(15);
    doc.text(title, 40, 30);
  
    doc.autoTable({
      startY: 40,
      head: headers,
      body: data,
    });
  
    doc.save("campaigns_report.pdf");
  };

  const handleInstagramButtonClick = () => {
    navigate(`/${tenantId}/instagrampost`)
  };
  const handleWhatsappButtonClick = () => {
    navigate(`/${tenantId}/chatbot`)
  };
  const handleEmailClick = () => {
    navigate(`/${tenantId}/email`)
  };
  const handleLinkedInClick = () => {
    navigate(`/${tenantId}/linkedinpost`)
  };
  


  return (
   <div>
     <div className="campaign_nav">
    <TopNavbar/>
  </div>
    <div className='campaign_page'>
      <div className="home_left_box1">
        <Sidebar />
      </div>
      <div style={{display:'flex',flexDirection:'column'}}>
   <div className='cap_head'>
   <div>
        <h1 className="campaign_heading">Campaigns</h1>
      </div>
      <div className='campaign_excelbtn'>
            <div>
                    <Dropdown>
                      <Dropdown.Toggle variant="primary" id="payments-dropdown2" className="excel-dropdown-menu3">
                        Excel File
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item>
                          <Link
                            to={`/bulk-import?model=${modelName}`}
                            className="import-excel-btn5"
                          >
                          <FaFileExcel/>  Import Excel
                          </Link>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <button
                            onClick={handleDownloadExcel}
                            className="excel-download-btn1"
                          >
                          <FaFileExcel/>  Excel
                          </button>
                        </Dropdown.Item>
                        <Dropdown.Item>
                    <button onClick={handleDownloadPDF}><FaFilePdf/>Download PDF</button>
                  </Dropdown.Item>

                      </Dropdown.Menu>
                    </Dropdown>
              </div>
              <div>
              <NavLink to={`/${tenantId}/campaignform`} id="btn11">
                      +CreateCampaign
                    </NavLink>
              </div>
      </div>
   </div>



        <div className="campaign-boxes">
                <div className="campaign-bigboxes">
                            <div className='campaign_firstbox'>
                              <h1 className='total_campaign'> Total Campaigns</h1>
                              <p className='total_campaign1'>20</p>
                            </div>
                            <div className='campaign_secondbox'><h1 className='total_send'>Total Sent</h1>
                            <p className='total_sended1'>2340</p></div>
                            <div className='campaign_thirdbox'><h1 className='total_clicks'>Total Clicks</h1>
                            <p className='total_clicks1'>243340</p></div>
                            <div className='campaign_fourthbox'><h1 className='Total_revenue'>Total Revenue</h1>
                            <p className='total_revenue1'>$2,3430</p></div>
                </div>

        </div>
        <div className='campaign_filter_btn'>
               <div className='social_btn'> 
                    <button className="campanign_btn1"   onClick={handleLinkedInClick}>
                      <LinkedInIcon />
                    </button>
                    <button  className="campaign_btn2"    onClick={handleInstagramButtonClick}>
                      <InstagramIcon />
                    </button>
                    <button  className="campaign_btn3"      onClick={handleWhatsappButtonClick}>
                      <WhatsAppIcon />
                    </button>
                    <button   className="campaign_btn4"       onClick={handleEmailClick}>
                      <EmailIcon />
                    </button>
              </div>
              <div className='filter_campaign'>
              <select className="view-mode-select_campaign" onChange={handleRecords3}>
                    <option value="">Filter by:Type</option>
                    <option value="1">Date</option>
                    <option value="2">Status</option>
                    <option value="3">Value</option>

                  </select>
              </div>
        </div>
      <div>
              <div className="table_camp">
                  <table className="campaign_table">
                     <thead>
                       <tr>
                          <th className="Campaign_table_name">Campaign Name</th>
                          <th className="Campaign_table_owner">Campaign Owner</th>
                          <th className="Campaign_table_channel">Channel</th>
                          <th className="Campaign_table_created">Created On</th>
                          <th className="Campaign_table_status">Status</th>
                          <th className="Campaign_table_est">Est. Revenue</th>



                        </tr>
                      </thead>
             
                     <tbody>
                      {filteredCampaigns?.map &&
                        filteredCampaigns.map((campaign) => (
                          <tr className="campaign_table_row" key={campaign.id}>
                            <td classname='campaign_data_name'>
                            <Link to={`/${tenantId}/campaigninfo/${campaign.id}`}>
                            {campaign.campaign_name}
                            </Link>
                            </td>
                            <td className="campaign_data_owner">
                              
                              {campaign.campaign_owner}
                              </td>
                            <td className="cont_email">
                            {campaign.type}
                            </td>
                            <td className="campaign_data_cost">{campaign.start_date}</td>
                            <td className="campaign_data_status">{campaign.status}</td>
                            <td className='campaign_data_revenue'>{campaign.expected_revenue}</td>
                          </tr>
                        ))}
                  </tbody>
              </table>
          </div>
        </div>
      </div>
    </div>
   </div>
  )
}

export default Campaign
