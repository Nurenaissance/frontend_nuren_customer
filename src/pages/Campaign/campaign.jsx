import './campaign.css';
import { NavLink, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';

import { Dropdown,Card, ListGroup } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { FaLinkedin, FaInstagram, FaWhatsapp, FaEnvelope, FaPhone } from 'react-icons/fa';

import { Sidebar } from "../../components/Sidebar";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import CallIcon from '@mui/icons-material/Call';
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
  const [showFlows, setShowFlows] = useState(false);
  const [flows, setFlows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [campaignStats, setCampaignStats] = useState({
    total_campaigns: 0,
    total_revenue: "0.00",
    total_actual_cost: "0.00"
});
const [selectedChannels, setSelectedChannels] = useState([]);
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

  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    const applyFilter = () => {
      if (filterType === "") {
        setFilteredCampaigns(campaign);
      } else {
        const filteredData = campaign.filter(campaign => {
          switch (filterType) {
            case "1":
              return new Date(campaign.start_date).toLocaleDateString() === new Date().toLocaleDateString();
            case "2":
              return campaign.status === "Active";
            case "3":
              return parseFloat(campaign.expected_revenue) > 1000;
            default:
              return true;
          }
        });
        setFilteredCampaigns(filteredData);
      }
    };
    applyFilter();
  }, [filterType, campaign]);
  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, []);


  useEffect(() => {
    const fetchCampaignStats = async () => {
        try {
            const response = await axiosInstance.get('/campaign/stats/');
            setCampaignStats(response.data); // Use response.data directly
        } catch (error) {
            console.error('Error fetching campaign stats:', error);
        }
    };

    fetchCampaignStats();
}, []);


const fetchTemplates = async () => {
  try {
    const response = await axiosInstance.get('/node-templates/');
    setTemplates(response.data);
  } catch (error) {
    console.error("Error fetching templates:", error);
  }
};


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

  useEffect(() => {
    fetchCampaigns();
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      const response = await axiosInstance.get('/node-templates/');
      setFlows(response.data);
    } catch (error) {
      console.log("Error fetching flows:", error);
    }
  };

// Usage:
fetchFlows([1, 2, 3]); // Replace with actual IDs

const handleFlowsButtonClick = () => {
  setShowFlows(!showFlows);
};

const handleTemplateSelect = (template) => {
  navigate(`/${tenantId}/flow`, { state: { template } });
};


  const handleDeleteFlow = async (templateId) => {
    if (window.confirm("Are you sure you want to delete this flow?")) {
      try {
        await axiosInstance.delete(`/node-templates/${templateId}/`);
        // Refresh the templates list after deletion
        fetchTemplates();
      } catch (error) {
        console.error("Error deleting flow:", error);
      }
    }
  };

  // useEffect(() => {
  //   const applyFilter = () => {
  //     console.log('Campaigns:', campaign); // Log all campaigns
  //     if (!selectedChannel) {
  //       setFilteredCampaigns(campaign);
  //     } else {
  //       const filteredData = campaign.filter(camp => {
  //         console.log('Campaign type:', camp.type); // Log each campaign's type
  //         if (typeof camp.type === 'string') {
  //           return camp.type.toLowerCase() === selectedChannel.toLowerCase();
  //         }
  //         return false;
  //       });
  //       setFilteredCampaigns(filteredData);
  //     }
  //   };
  //   applyFilter();
  // }, [selectedChannel, campaign]);

  const handleChannelClick = (channel) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel) 
        : [...prev, channel]
    );
  };
  
  useEffect(() => {
    const applyFilter = () => {
      console.log('Campaigns:', campaign.map(c => ({ id: c.id, type: c.type })));
      if (selectedChannels.length === 0) {
        setFilteredCampaigns(campaign);
      } else {
        const filteredData = campaign.filter(camp => 
          selectedChannels.some(channel => {
            if (typeof camp.type !== 'string') {
              console.warn(`Unexpected type for campaign ${camp.id}: ${camp.type}`);
              return false;
            }
            return camp.type.toLowerCase().includes(channel.toLowerCase());
          })
        );
        setFilteredCampaigns(filteredData);
      }
    };
    applyFilter();
  }, [selectedChannels, campaign]);

  const getChannelIcon = (type) => {
    if (typeof type !== 'string') {
      console.warn(`Unexpected type for channel: ${type}`);
      return <span>{String(type)}</span>; // Display the type as text if it's not a string
    }
  
    switch (type.toLowerCase()) {
      case 'linkedin': return <FaLinkedin color="#0077B5" size={24} />;
      case 'instagram': return <FaInstagram color="#E1306C" size={24} />;
      case 'whatsapp': return <FaWhatsapp color="#25D366" size={24} />;
      case 'email': return <FaEnvelope color="#D44638" size={24} />;
      case 'call': return <FaPhone color="#4285F4" size={24} />;
      default: return <span>{type}</span>; // Display unknown types as text
    }
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
    + Create Campaign
  </NavLink>
  {selectedTemplate && (
    <button onClick={() => navigate(`/${tenantId}/campaignform`, { state: { template: selectedTemplate } })}>
      Create Campaign from Template
    </button>
  )}
</div>

    
      </div>
   </div>



          <div className="campaign-boxes">
          <div className="campaign-bigboxes">
              <div className='campaign_firstbox'>
                  <h1 className='total_campaign'>Total Campaigns</h1>
                  <p className='total_campaign1'>{campaignStats.total_campaigns}</p>
              </div>
              <div className='campaign_secondbox'>
                  <h1 className='total_send'>Total Sent</h1>
                  <p className='total_sended1'>2340</p> {/* Replace with actual data if available */}
              </div>
              <div className='campaign_thirdbox'>
                  <h1 className='total_clicks'>Total Cost</h1>
                  <p className='total_clicks1'>${campaignStats.total_actual_cost}</p> {/* Replace with actual data if available */}
              </div>
              <div className='campaign_fourthbox'>
                  <h1 className='Total_revenue'>Total Revenue</h1>
                  <p className='total_revenue1'>${campaignStats.total_revenue}</p>
              </div>
          </div>

          </div>
        <div className='campaign_filter_btn'>
        <div className='social_btn'> 
  {['linkedin', 'instagram', 'whatsapp', 'email', 'call'].map(channel => (
    <button 
      key={channel}
      className={`campaign_btn ${selectedChannels.includes(channel) ? 'active' : ''}`} 
      onClick={() => handleChannelClick(channel)}
    >
      {getChannelIcon(channel)}
    </button>
  ))}
</div>
              <div className="flow-button">
  <button className="campaign_flow_btn" onClick={handleFlowsButtonClick}>
    {showFlows ? "Show Campaigns" : "Show Flows"}
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
        {showFlows ? (
          <>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Created By</th>
            <th>Date Created</th>
            <th>Actions</th>
          </>
        ) : (
          <>
            <th className="Campaign_table_name">Campaign Name</th>
            <th className="Campaign_table_owner">Campaign Owner</th>
            <th className="Campaign_table_channel">Channel</th>
            <th className="Campaign_table_created">Created On</th>
            <th className="Campaign_table_status">Status</th>
            <th className="Campaign_table_est">Est. Revenue</th>
          </>
        )}
      </tr>
    </thead>
    <tbody>
      {showFlows ? flows.map((flow) => (
            <tr key={flow.id}>
            <td>{flow.name}</td>
            <td>{flow.description}</td>
            <td>{flow.category}</td>
            <td>{flow.createdBy}</td>
            <td>{new Date(flow.date_created).toLocaleDateString()}</td>
            <td>
              <button 
                style={{border:"1px blue solid", padding:'10px', borderRadius:'8px', marginRight: '10px'}} 
                onClick={() => handleTemplateSelect(flow)}
              >
                Open Flow
              </button>
              <button 
                style={{border:"1px red solid", padding:'10px', borderRadius:'8px'}} 
                onClick={() => handleDeleteFlow(flow.id)}
              >
                Delete
              </button>
            </td>
          </tr>
          ))
        : filteredCampaigns.map((campaign) => (
            <tr className="campaign_table_row" key={campaign.id}>
              <td className='campaign_data_name'>
                <Link to={`/${tenantId}/campaigninfo/${campaign.id}`}>
                  {campaign.campaign_name}
                </Link>
              </td>
              <td className="campaign_data_owner">{campaign.campaign_owner}</td>
              <td className="cont_email">
  {getChannelIcon(campaign.type)}
  <span className="sr-only">{String(campaign.type)}</span>
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
