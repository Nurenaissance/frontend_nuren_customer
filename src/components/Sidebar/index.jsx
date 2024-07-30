import React, { useState,useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../../assets/logo.png';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import PeopleIcon from '@mui/icons-material/People';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import BusinessIcon from '@mui/icons-material/Business';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import InstagramIcon from '@mui/icons-material/Instagram';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import AlarmIcon from '@mui/icons-material/Alarm';
import LayersIcon from '@mui/icons-material/Layers';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import CallIcon from '@mui/icons-material/Call';
import BarChartIcon from '@mui/icons-material/BarChart';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ContactPhoneRoundedIcon from '@mui/icons-material/ContactPhoneRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import './sidebar.css';
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../../authContext';
import axiosInstance from '../../api';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';


import EditIcon from '@mui/icons-material/Edit';



const NurenSidebarItem = ({ to, icon, text, onClick }) => (
  <li className="nuren-sidebar__item">
    <NavLink 
      to={to}
      className={({ isActive }) => 
        `nuren-sidebar__link ${isActive ? 'nuren-sidebar__link--active' : ''}`
      }
      onClick={onClick}
    >
      {icon}
      <span className="nuren-sidebar__link-text">{text}</span>
    </NavLink>
  </li>
);

const NurenSidebarDropdown = ({ text, icon, isOpen, toggleDropdown, children, className = '' }) => (
  <li className={`nuren-sidebar__item ${className}`}>
    <button className="nuren-sidebar__dropdown-toggle" onClick={toggleDropdown}>
      {icon}
      <span className="nuren-sidebar__link-text">{text}</span>
      <i className={`bx ${isOpen ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
    </button>
    {isOpen && (
      <ul className="nuren-sidebar__dropdown-menu">
        {children}
      </ul>
    )}
  </li>
);


export const Sidebar = ({ onSelectModel }) => {
  const { authenticated, setAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const tenantId = getTenantIdFromUrl();


  function getTenantIdFromUrl() {
    const pathArray = pathname.split('/');
    if (pathArray.length >= 2) {
      return pathArray[1]; // Assumes tenant_id is the first part of the path
    }
    return null; // Return null if tenant ID is not found or not in the expected place
  }
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [lockedFeature, setLockedFeature] = useState('');
  const [activeMoreItem, setActiveMoreItem] = useState(null);
  const [isModelListVisible, setIsModelListVisible] = useState(false);


  const [clientsDropdownOpen, setClientsDropdownOpen] = useState(false);
  const [taskDropdownOpen, setTaskDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false); 
  const [socialDropdownOpen, setSocialDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const sidebarRef = useRef(null);

  const [accessToken, setAccessToken] = useState('');
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setAccessToken(token);
  }, []);
  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post('/logout/');
  
      if (response.status === 200) {
        setAuthenticated(false);
        window.location.href = '/login';
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    closeAllDropdowns();
  }, [pathname]);

  const closeAllDropdowns = () => {
    setClientsDropdownOpen(false);
    setTaskDropdownOpen(false);
    setMoreDropdownOpen(false);
    setSocialDropdownOpen(false);
    setIsModelDropdownOpen(false);
    setIsModelListVisible(false);
    setShowBackdrop(false);
  };

  const toggleMoreDropdown = () => {
    setMoreDropdownOpen(!moreDropdownOpen);
    setIsModelListVisible(false);
    setShowBackdrop(!moreDropdownOpen);
    // Close other dropdowns
    setClientsDropdownOpen(false);
    setTaskDropdownOpen(false);
    setSocialDropdownOpen(false);
  };

  const handleMoreItemClick = (item) => {
    if (item === 'Model') {
      setIsModelListVisible(!isModelListVisible);
    } else {
      setIsModelListVisible(false);
    }
  };



  const handleLockedFeatureClick = (e, feature) => {
    e.preventDefault();
    setLockedFeature(feature);
    setShowOverlay(true);
  };
  const handleBuyClick = () => {
    // Implement your buy logic here
    console.log("User wants to buy Plus membership");
    setShowOverlay(false);
  };

  useEffect(() => {
    const fetchModels = async () => {
        try {
            const response = await axiosInstance.get('https://webappbaackend.azurewebsites.net/dynamic-models/');
            setModels(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching models:', error);
            setLoading(false);
        }
    };

    fetchModels();
}, []);

  const toggleClientsDropdown = () => {
    setClientsDropdownOpen(!clientsDropdownOpen);
    setTaskDropdownOpen(false);
    setMoreDropdownOpen(false);
    setSocialDropdownOpen(false);
  };

  const toggleTaskDropdown = () => {
    setTaskDropdownOpen(!taskDropdownOpen);
    // Close other dropdowns if open
    setClientsDropdownOpen(false);
    setMoreDropdownOpen(false);
    setSocialDropdownOpen(false);
  };
  
  const toggleSocialDropdown = () => {
    setSocialDropdownOpen(!socialDropdownOpen);
    setTaskDropdownOpen(false);
    setMoreDropdownOpen(false);
    setClientsDropdownOpen(false);
  };


  const formatLink = (link) => {
    if (tenantId) {
      return `/${tenantId}${link}`;
    }
    return link;
  };

  const linkTo = accessToken ? '/instagrampost' : '/instagramauth';

  console.log('Sidebar model:', models);


  const formatmewLink = (accessToken) => {
    if (accessToken) {
      return `/${tenantId}/instagrampost`; // Relative path
    } else {
      return 'https://crm.nuren.ai/instagramauth'; // External URL
    }
  };

 
  const toggleDropdown = (setter) => () => {
    setter(prev => !prev);
    // Close other dropdowns
    [setClientsDropdownOpen, setTaskDropdownOpen, setMoreDropdownOpen, setSocialDropdownOpen, setIsModelDropdownOpen]
      .filter(set => set !== setter)
      .forEach(set => set(false));
  };
  

  return (
    <div className="nuren-sidebar" ref={sidebarRef}>
    <div className="nuren-sidebar__top">
      <NavLink to={formatLink("/home")} className="nuren-sidebar__logo">
        <img src={Logo} alt="Nuren AI Logo" className="nuren-sidebar__logo-img" width={48} height={48} />
        <p className="nuren-sidebar__logo-text">
          <b>Nuren AI</b> <br /> CRM
        </p>
      </NavLink>
      {/* <button className="nuren-sidebar__logout" onClick={handleLogout}>Logout</button> */}
      <hr className="nuren-sidebar__divider" />
    </div>
    <div className="nuren-sidebar__content">
        <nav className="nuren-sidebar__nav">
          <ul className="nuren-sidebar__list">
            <NurenSidebarItem
              to={formatLink("/home")}
              icon={<DashboardIcon />}
              text="Dashboard"
            />
            <NurenSidebarDropdown
              text="Clients"
              icon={<PeopleIcon />}
              isOpen={clientsDropdownOpen}
              toggleDropdown={toggleDropdown(setClientsDropdownOpen)}
            >
              <NurenSidebarItem
                to={formatLink("/contacts")}
                icon={<ContactPhoneRoundedIcon />}
                text="Contacts"
              />
              <NurenSidebarItem
                to={formatLink("/accounts")}
                icon={<GroupAddRoundedIcon />}
                text="Accounts"
              />
            </NurenSidebarDropdown>
            <NurenSidebarItem
              to={formatLink("/lead")}
              icon={<RocketLaunchIcon />}
              text="Leads"
            />
            <NurenSidebarItem
              to={formatLink("/opportunities")}
              icon={<EmojiObjectsIcon />}
              text="Opportunities"
            />
            <NurenSidebarItem
              to={formatLink("/tasks")}
              icon={<AssignmentIcon />}
              text="Tasks"
            />
            <NurenSidebarDropdown
              text="Task Management"
              icon={<ListAltIcon />}
              isOpen={taskDropdownOpen}
              toggleDropdown={toggleDropdown(setTaskDropdownOpen)}
            >
              <NurenSidebarItem
                to={formatLink("/meetings")}
                icon={<MeetingRoomIcon />}
                text="Meetings"
              />
              <NurenSidebarItem
                to={formatLink("/callpage")}
                icon={<CallIcon />}
                text="CallPage"
              />
            </NurenSidebarDropdown>
            <NurenSidebarDropdown
              text="Social"
              icon={<FormatListNumberedIcon />}
              isOpen={socialDropdownOpen}
              toggleDropdown={toggleDropdown(setSocialDropdownOpen)}
            >
              <NurenSidebarItem
                to={formatmewLink(accessToken)}
                icon={<InstagramIcon />}
                text="Instagram"
              />
              <NurenSidebarItem
                to={formatLink("/chatbot")}
                icon={<WhatsAppIcon />}
                text="Chatbot"
              />
              <NurenSidebarItem
                to={formatLink("/email-provider")}
                icon={<EmailIcon />}
                text="Email"
              />
              <NurenSidebarItem
                to={formatLink("/linkedinauth")}
                icon={<LinkedInIcon />}
                text="LinkedIn"
              />
            </NurenSidebarDropdown>
            <NurenSidebarItem
              to={formatLink("/calendar")}
              icon={<CalendarMonthRoundedIcon />}
              text="Calendar"
            />
            <NurenSidebarDropdown
              text="More"
              icon={<MoreHorizRoundedIcon />}
              isOpen={moreDropdownOpen}
              toggleDropdown={toggleDropdown(setMoreDropdownOpen)}
              className="nuren-sidebar__more-dropdown"
            >
            </NurenSidebarDropdown>
            
            </ul>
          </nav>
        </div>
        {moreDropdownOpen && (
        <div className={`nuren-sidebar__more-content ${moreDropdownOpen ? 'active' : ''}`}>
          <ul className="nuren-sidebar__more-list">
            <NurenSidebarItem
              to={formatLink("/vendors")}
              icon={<BusinessIcon />}
              text="Vendors"
              onClick={() => handleMoreItemClick('Vendors')}
            />
             <NurenSidebarItem
                to={formatLink("/product")}
                icon={<ShoppingBagIcon />}
                text="Products"
              />
              <NurenSidebarItem
                to={formatLink("/loyalty")}
                icon={<LoyaltyIcon />}
                text="Loyalty Program"
              />
              <NurenSidebarItem
                to={formatLink("/report")}
                icon={<BarChartIcon />}
                text="Reports"
              />
              <NurenSidebarItem
                to={formatLink("/interaction")}
                icon={<HandshakeIcon />}
                text="Interaction"
              />
              <NurenSidebarItem
                to={formatLink("/campaign")}
                icon={<CampaignRoundedIcon />}
                text="Campaigns"
              />
              <NurenSidebarItem
                to={formatLink("/reminder")}
                icon={<AlarmIcon />}
                text="Reminder"
              />
              <NurenSidebarItem
                to={formatLink("/ticket")}
                icon={<CardMembershipIcon />}
                text="Tickets"
              />
              <NurenSidebarItem
                to={formatLink("/editdocument")}
                icon={<EditIcon />}
                text="PDF Editor"
              />
                <NurenSidebarItem
              icon={<LayersIcon />}
              text="Model"
              onClick={() => handleMoreItemClick('Model')}
            />
            </ul>
      </div>
        )}
        {isModelListVisible && (
  <div className={`nuren-sidebar__model-content ${isModelListVisible ? 'active' : ''}`}>
    <ul className="nuren-sidebar__model-list">
      {models.map((model) => (
        <NurenSidebarItem
          key={model.model_name} // Ensure model_name is unique
          to={formatLink(`/models/${model.model_name}`)}
          text={model.model_name}
        />
      ))}
      <NurenSidebarItem
        key="customModel" // Use a unique string as key for the custom model item
        to={formatLink(`/CustomModel`)}
        text={'Add New Model +'}
      />
    </ul>
  </div>
)}
        <div className={`nuren-sidebar__backdrop ${showBackdrop ? 'active' : ''}`} onClick={closeAllDropdowns}></div>
    </div>

  );
};

