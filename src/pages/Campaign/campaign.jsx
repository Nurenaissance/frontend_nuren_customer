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
import ComposeButton from '../Email/ComposeButton.jsx';
// import DraftTable from './DraftsTable.jsx';
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
  const [draftEmails, setDraftEmails] = useState([]);
  const [showDraftEmails, setShowDraftEmails] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [campaignStats, setCampaignStats] = useState({
    total_campaigns: 0,
    total_revenue: "0.00",
    total_actual_cost: "0.00"
});
const [selectedChannels, setSelectedChannels] = useState([]);
const [showLinkedInTable, setShowLinkedInTable] = useState(false);
const [showInstagramTable, setShowInstagramTable] = useState(false);
const [showWhatsAppTable, setShowWhatsAppTable] = useState(false);
const [showDraftsTable, setShowDraftsTable] = useState(false);
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
  const [selectedFilters, setSelectedFilters] = useState([]);

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


useEffect(() => {
  if (selectedChannels.includes('email')) {
    fetchDraftEmails();
  }
}, [selectedChannels]);

const fetchDraftEmails = async () => {
  try {
    const response = await axiosInstance.get('/emails/?email_type=draft');
    setDraftEmails(response.data);
    setShowDraftEmails(true);
  } catch (error) {
    console.error("Error fetching draft emails:", error);
  }
};

const handleDeleteEmailDraft = async (draftId) => {
  try {
    await axiosInstance.delete(`/emails/${draftId}/`);
    setDraftEmails(draftEmails.filter(draft => draft.id !== draftId));
  } catch (error) {
    console.error("Error deleting draft:", error);
  }
};

const handleLoadEmailDraft = (draft) => {
  setDraftToLoad(draft);
  setShowComposeModal(true);
};


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

    const cleanedData = data.map(campaign => ({
      ...campaign,
      type: Array.isArray(campaign.type) 
        ? campaign.type.map(t => t.toLowerCase()) 
        : [campaign.type.toLowerCase()]
    }));

    setCampaigns(cleanedData);
    setFilteredCampaigns(cleanedData);
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
// fetchFlows([]); // Replace with actual IDs

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

  

  const handleFilterSelect = (channel) => {
    setSelectedFilters(prev => 
      prev.includes(channel.toLowerCase())
        ? prev.filter(c => c !== channel.toLowerCase())
        : [...prev, channel.toLowerCase()]
    );
  };
  useEffect(() => {
    const applyFilter = () => {
      if (selectedFilters.length === 0) {
        setFilteredCampaigns(campaign);
      } else {
        const filteredData = campaign.filter(camp => 
          camp.type.some(type => 
            selectedFilters.includes(type.toLowerCase())
          )
        );
        setFilteredCampaigns(filteredData);
      }
    };
    applyFilter();
  }, [selectedFilters, campaign]);

  const fetchDrafts = async () => {
    try {
      const response = await axiosInstance.get('/drafts/');
      setDrafts(response.data);
    } catch (error) {
      console.error("Error fetching drafts:", error);
    }
  };

  const handleChannelClick = (channel) => {
    if (channel.toLowerCase() === 'instagram') {
      setShowDraftsTable(!showDraftsTable);
      if (!showDraftsTable) {
        fetchDrafts();
      }
    } else {
      setSelectedChannels([channel]);
      fetchCampaigns();
    }
  };

  const handleDeleteDraft = async (draftId) => {
    try {
      await axiosInstance.delete(`/drafts/${draftId}/`);
      setDrafts(drafts.filter(draft => draft.id !== draftId));
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  };

  const handleLoadDraft = (draft) => {
    navigate(`/${tenantId}/instagrampost`, { state: { draftData: draft } });
  };
  
  useEffect(() => {
    const applyFilter = () => {
      fetchCampaigns(); // Fetch new data after channel selection changes
    };
    applyFilter();
  }, [selectedChannels]);


  // const handleLoadDraft = async (draftId) => {
  //   try {
  //     const loadedDraft = await loadDraft(draftId);
  //     if (!loadedDraft) {
  //       throw new Error('Failed to load draft');
  //     }
  
  //     // Navigate to InstagramPost page with draft data
  //     navigate(`/${tenantId}/instagrampost`, { 
  //       state: { 
  //         draftData: loadedDraft 
  //       } 
  //     });
  //   } catch (error) {
  //     console.error('Error loading draft:', error);
  //     alert('Error loading draft: ' + error.message);
  //   }
  // };


  const getChannelIcon = (type) => {
    const renderIcon = (singleType) => {
      switch (singleType.toLowerCase()) {
        case 'linkedin':
          return <LinkedInIcon style={{ color: "#0077B5" }} />;
        case 'instagram':
          return <InstagramIcon style={{ color: "#E1306C" }} />;
        case 'whatsapp':
          return <WhatsAppIcon style={{ color: "#25D366" }} />;
        case 'email':
          return <EmailIcon style={{ color: "#D44638" }} />;
        case 'call':
          return <CallIcon style={{ color: "#4285F4" }} />;
        default:
          return <ChatBubbleOutlineIcon style={{ color: "#808080" }} />;
      }
    };
  
    if (Array.isArray(type)) {
      return type.map((t, index) => <span key={index} style={{marginRight: '5px'}}>{renderIcon(t)}</span>);
    }
    return renderIcon(type);
  };

  // const DraftsTable = ({ drafts, onLoadDraft, onDeleteDraft }) => (
  //   <table className="drafts-table">
  //     <thead>
  //       <tr>
  //         <th>Caption</th>
  //         <th>Created On</th>
  //         <th>Type</th>
  //         <th>Scheduled</th>
  //         <th>Actions</th>
  //       </tr>
  //     </thead>
  //     <tbody>
  //       {drafts.map((draft) => (
  //         <tr key={draft.id}>
  //           <td>{draft.caption.substring(0, 50)}...</td>
  //           <td>{new Date(draft.timestamp).toLocaleString()}</td>
  //           <td>{draft.is_story ? 'Story' : draft.is_reel ? 'Reel' : 'Post'}</td>
  //           <td>
  //             {draft.scheduled_date
  //               ? `${new Date(draft.scheduled_date).toLocaleDateString()} at ${draft.scheduled_time}`
  //               : 'Not scheduled'}
  //           </td>
  //           <td>
  //             <button onClick={() => onLoadDraft(draft.id)}>Load Draft</button>
  //             <button onClick={() => onDeleteDraft(draft.id)}>Delete Draft</button>
  //           </td>
  //         </tr>
  //       ))}
  //     </tbody>
  //   </table>
  // );

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

  console.log('Campaign types:', filteredCampaigns.map(c => c.type));
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
  <Dropdown>
    <Dropdown.Toggle variant="success" id="dropdown-basic">
      Filter by Channel
    </Dropdown.Toggle>

    <Dropdown.Menu>
      {['LinkedIn', 'Instagram', 'WhatsApp', 'Email', 'Call'].map((channel) => (
        <Dropdown.Item  key={channel} as="button" onClick={() => handleFilterSelect(channel)}>
          <input
            type="checkbox"
            checked={selectedFilters.includes(channel.toLowerCase())}
            onChange={() => {}}
          />
          {' '}
          {channel}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  </Dropdown>
</div>
        </div>
        
      <div>
      {showDraftEmails ? (
              <div className="drafts-table-container">
                <h2>Email Drafts</h2>
                <table className="drafts-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Created On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftEmails.map((draft) => (
                      <tr key={draft.id}>
                        <td>{draft.subject}</td>
                        <td>{new Date(draft.time).toLocaleString()}</td>
                        <td>
                          <button onClick={() => handleLoadDraft(draft)}>Load</button>
                          <button onClick={() => handleDeleteDraft(draft.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : showDraftsTable ? (
              <div className="drafts-table-container">
                <h2>Instagram Drafts</h2>``
    <table className="drafts-table">
      <thead>
        <tr>
          <th>Caption</th>
          <th>Created On</th>
          <th>Type</th>
          <th>Scheduled</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {drafts.map((draft) => (
          <tr key={draft.id}>
            <td>{draft.caption.substring(0, 50)}...</td>
            <td>{new Date(draft.timestamp).toLocaleString()}</td>
            <td>{draft.is_story ? 'Story' : draft.is_reel ? 'Reel' : 'Post'}</td>
            <td>
              {draft.scheduled_date
                ? `${new Date(draft.scheduled_date).toLocaleDateString()} at ${draft.scheduled_time}`
                : 'Not scheduled'}
            </td>
            <td>
              <button onClick={() => handleLoadDraft(draft)}>Load</button>
              <button onClick={() => handleDeleteDraft(draft.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : (
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
      <span className="sr-only">{campaign.type.join(', ')}</span>
    </td>
              <td className="campaign_data_cost">{campaign.start_date}</td>
              <td className="campaign_data_status">{campaign.status}</td>
              <td className='campaign_data_revenue'>{campaign.expected_revenue}</td>
            </tr>
          ))}
    </tbody>
  </table>
</div>
)}

        </div>
      </div>
    </div>
   </div>
  )
}

export default Campaign
