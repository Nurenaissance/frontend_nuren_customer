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
  const [showFlows, setShowFlows] = useState(false);
  const [flows, setFlows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [campaignStats, setCampaignStats] = useState({
    total_campaigns: 0,
    total_revenue: "0.00",
    total_actual_cost: "0.00"
});


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



  const loadTemplate = (template) => {
    if (template && template.node_data) {
      const { nodes: templateNodes, adjacencyList } = template.node_data;
      
      // Transform nodes to ReactFlow format
      const transformedNodes = templateNodes.map(node => ({
        id: node.id.toString(),
        type: node.type,
        data: node.data,
        position: node.position || { x: 0, y: 0 }, // You might need to add position data to your backend
      }));
  
      // Transform adjacencyList to edges
      const transformedEdges = adjacencyList.flatMap((targets, sourceIndex) => 
        targets.map(target => ({
          id: `e${sourceIndex}-${target}`,
          source: sourceIndex.toString(),
          target: target.toString(),
        }))
      );
  
      // You'll need to decide how to use these transformed nodes and edges
      // For now, we'll just log them
      console.log('Transformed Nodes:', transformedNodes);
      console.log('Transformed Edges:', transformedEdges);
  
      setSelectedTemplate(template);
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
      const response = await axiosInstance.get('/flows/');
      const data = await response.data;
      setFlows(data);
    } catch (error) {
      console.log("Error fetching flows:", error);
    }
  };

  const handleFlowsButtonClick = () => {
    setShowFlows(!showFlows);
  };

  const handleTemplateSelect = (templateId) => {
    navigate(`/${tenantId}/flow`, { state: { templateId } });
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
    navigate(`/${tenantId}/email-provider`)
  };
  const handleLinkedInClick = () => {
    navigate(`/${tenantId}/linkedinpost`)
  };
  const handleFlowButtonClick = () => {
    navigate(`/${tenantId}/flow`)
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
      {showFlows
        ? templates.map((template) => (
            <tr key={template.id}>
              <td>{template.name}</td>
              <td>{template.description}</td>
              <td>{template.category}</td>
              <td>{template.createdBy}</td>
              <td>{new Date(template.date_created).toLocaleDateString()}</td>
              <td>
                <button style={{border:"1px red solid", padding:'10px', borderRadius:'8px'}} onClick={() => handleTemplateSelect(template.id)}>
                  Open Flow
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
              <td className="cont_email">{campaign.type}</td>
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
