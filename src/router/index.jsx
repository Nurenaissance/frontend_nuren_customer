
import { Route, Routes } from "react-router-dom";
import { Register } from "../pages/Register";
import { Login } from "../pages/Login";
import { Home } from "../pages/Home";
import { LeadPage } from "../pages/Lead";
import { NotFound } from "../pages/NotFound";
import { AccountsTable } from "../pages/AccountsSection";
import { ContactsTable } from "../pages/ContactsTable";
import { Opportunities } from "../pages/opportunities";
import Dashboard from "../pages/dashboard";
import Lead from "../pages/Lead/AddLead/Lead";
// import Kanban1 from "../components/Kanban/Kanban1";
import Met from "../pages/Meetings/met";
import CallPage from "../pages/CallPage/callpage";
import Form2 from "../pages/ContactsTable/Form2";
import ContactInfo from "../pages/ContactsTable/ContactInfo";
import EmailComponent from "../pages/MassEmail/Compose";
import AccountsPage from "../pages/AccountsInfoPage/AccountInfoPage";
import ShowLead from "../pages/Lead/ShowLead";
import AccountForm from "../pages/AccountsSection/AccountForm";
import TaskTable from "../pages/TasksSection/TaskTable";
import axiosInstance from "../../src/api.jsx";
import ConvertLead from "../pages/Lead/ConvertLead";
import BulkImport from "../pages/BulkImport/BulkImport";
import axios from "axios";
import { useAuth } from "../authContext";
import { useState,useEffect } from "react";
import Form3 from "../pages/opportunities/Form3";
import AddTaskForm from "../pages/TasksSection/AddTask";
import FlowGraph from "../pages/ReactFlow/Flowgraph";
import Taskinfo from "../pages/TasksSection/Taskinfo";
import SendEmail from "../pages/SendEmail/SendEmail";
import WhatsApp from "../pages/socialmedia/WhatsApp/WhatsApp";
import FaceB from "../pages/facebook/facebook";
import Interaction from "../pages/InteractionPage/InteractionPage";
import AddInteractionForm from "../pages/InteractionPage/AddInteractionForm";
import InteractionDetailsPage from "../pages/InteractionPage/InteractionDetailsPage";
import FlowGraph2 from "../pages/ReactFlow2/Flowgraph";
import Campaign from "../pages/Campaign/campaign";
import Campaignform from "../pages/Campaign/Campaignform";

import InstaAuth from "../pages/socialmedia/instagram/InstaAuth";
import InstagramPost from "../pages/socialmedia/instagram/instagrampost";
import CampaignInfo from "../pages/Campaign/campaigninfo";
//import InstagramFlow from "../pages/ReactFlow2/dndInstagram";
import WhatsappFlow from "../pages/ReactFlow2/dndWhatsapp";
import Userprofile from "../pages/Userpage/Userprofile";
import Reminder from "../pages/Reminders/Reminder";

import LinkedInPost from "../pages/LinkedIn/LinkedInpost";
import OpportunitiesInfo from "../pages/opportunities/opportunitiesinfo";

import LinkedInAuthPage from "../pages/LinkedIn/newLinkedInAuth";
import { Product } from "../pages/Products/Product";
import Callpageinfo from "../pages/CallPage/Callpageinfo";
import Meetinginfo from "../pages/Meetings/Meetinginfo";

import ProductForm from "../pages/Products/productform";
import { ProductInfo } from "../pages/Products/productinfo";

import AssignLeads from "../pages/adminpages/assignLeads/assignLeads";

import Remind from "../pages/Reminders/Reminder";
import Reminderform from "../pages/Reminders/createreminder";
import Vendors from "../pages/Vendors/vendors";
import Vendorsform from "../pages/Vendors/createVendors";
import VendorInfo from "../pages/Vendors/VendorInfo";
import TopNavbar from "../pages/TopNavbar/TopNavbar";
import Report from "../pages/Reports/report";

import Loyalityform from "../pages/LoyaltyProgram/Loyalityform";
import Loyalcard from "../pages/LoyaltyProgram/loyalcard";
import LoyaltyInfo from "../pages/LoyaltyProgram/loyaltyinfo";
import Custom from "../pages/CustomModel/custom";
import Chatbot from "../pages/Chatbot/chatbot";

import Ticketform from "../pages/Ticket/Ticketform";
import TicketInfo from "../pages/Ticket/TicketInfo";

import Calendar from "../pages/Calendar/Calendar";
import InstagramMedia from "../pages/socialmedia/instagram/instagramMedia.jsx";
import Calendarform from "../pages/Calendar/Calendarform";

import { DashboardCustomizeSharp } from "@mui/icons-material";
// import Ticket from "../pages/Ticket/TicketPage";

import Ticket from "../pages/Ticket/TicketPage";
import { Explore } from "@mui/icons-material";
import ExplorePage from "../pages/ExplorePage/Explore";
import ExploreDetails from "../pages/ExplorePage/readExplore";
import Appa from '../components/email.jsx';
import Models from "../pages/Model/ModelTable.jsx";
import CoinStatsPage from '../pages/CoinStats/CoinStatsPage';

import IframePage from "../pages/documenteditpage/pdfeditor.jsx";
import ImageEditorComponent from "../pages/documenteditpage/imageeditor.jsx";
import EmailList from "../pages/Email/Email-List.jsx";
import DocumentRag from "../pages/documenteditpage/documentRAG.jsx";
// import EmailProviders from "../pages/Email/Email-provider.jsx";
import Htmleditor from "../pages/documenteditpage/htmlcreator.jsx";


const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; 
};

import PdfUploader from "../pages/PDF";
import DnDFlow from "../pages/ReactFlow/Dnd.jsx";
import EmailAppa from "../pages/Email/Emailss.jsx";
import GmailCallback from "../pages/Email/GmailCallback.jsx";
import FlowBuilder from "../pages/NewFlow/FlowBuilder.jsx";
// import FlowBuilder from "../pages/NewFlow/FlowBuilder.jsx";
import CallLogs from "../pages/CallPage/callLogs.jsx";
import EmailTrackingInfo from "../pages/Email/EmailTrackingInfo.jsx";
import { Experience } from "../pages/Experience/Experience.jsx";
import ExperienceInfo from "../pages/Experience/experienceinfo.jsx";
import ExperienceForm from "../pages/Experience/experienceform.jsx";

// import CustomModelForm from "../pages/CustomModel/customform";


export const RouteWrapper = () => {
  const gettingToken = localStorage.getItem("token");
  const [reminders, setReminders] = useState([]);
  const [reminderMessage, setReminderMessage] = useState("");
  const { authenticated,userRole } = useAuth();
  const tenantId = getTenantIdFromUrl();
  console.log("Tenant ID:", tenantId);
  const [reminder, setReminder] = useState([]);  
  const [selectedModel, setSelectedModel] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    subject:"",
    event_date_time:"",
    time_trigger:"",
    createdBy:"",
    trigger_type: "time",
    tenant: tenantId,
    is_triggered: false,
    created_at: "2024-06-25T08:21:33.075616Z",
  });

  
  const Reminder = ({ message, onClose }) => {
    return (
      <div className="reminder-modal">
        <div className="reminder">
          <p>{message}</p>
          <button onClick={handleClose}>Dismiss</button>
        </div>
      </div>
    );
  };
  const scheduleReminder = (reminder) => {
    const now = new Date().getTime();
    const timeDifference = new Date(reminder.time_trigger).getTime() - now;

    if (timeDifference > 0) {
      setTimeout(() => {
        setReminderMessage(reminder.message);
        setReminders((prevReminders) => [...prevReminders, reminder]);
      }, timeDifference);
    }
  };

  
  
    const dismissReminder = (id) => {
      setReminders(reminders.filter((reminder) => reminder.id !== id));
    };
    const handleScheduleMeeting = async (e) => {
      e.preventDefault();
      try {
        const updatedScheduleData = {
          ...scheduleData,
          tenant: tenantId, // Ensure tenantId is included
        };
        const response = await axiosInstance.post(
          "/reminders/",
          updatedScheduleData,
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
            },
          }
        );
        console.log("Meeting scheduled successfully:", response.data);
    
        const timeTrigger = new Date(scheduleData.time_trigger).getTime();
        const now = new Date().getTime();
        const timeDifference = timeTrigger - now;
    
        if (timeDifference > 0) {
          setTimeout(() => {
            const reminderMessage = `Reminder: Scheduled call '${scheduleData.subject}' starting soon!`;
            setReminderMessage(reminderMessage);
    
            const reminder = {
              id: response.data.id,
              message: reminderMessage,
            };
            setReminders([...reminders, reminder]);
          }, timeDifference);
        }
      } catch (error) {
        console.error("Error scheduling meeting:", error);
      }
    };
    
   useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach((reminder) => {
        if (new Date(reminder.time_trigger) <= now) {
          console.log("Reminder:", reminder.message);
          dismissReminder(reminder.id);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [reminders]);
  console.log(authenticated)

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await axiosInstance.get('/reminders/', {
          headers: {
            'Tenant-ID': tenantId, // Replace 'Tenant-ID' with the actual header key your backend expects
          }
        });
        setReminder(response.data);
        console.log(reminder);
      } catch (error) {
        console.error("Error fetching reminders:", error);
      }
    };
    
    fetchReminders();
  }, [tenantId]); // Ensure tenantId is included in the dependency array if it might change
  

  useEffect(() => {
      const storedReminders = JSON.parse(localStorage.getItem('reminders')) || [];
      setReminders(storedReminders);
    }, []);
    useEffect(() => {

      const interval = setInterval(() => {
        const now = new Date().getTime();
        reminders.forEach((reminder) => {
          if (reminder.time_trigger <= now) {
            showReminder(true);
            removeReminder(reminder.id);
          }
        });
      }, 60000); // Check every minute
      return () => clearInterval(interval);
    }, [reminders]);
    const showReminder = (message) => {
      console.log("Show reminder called with message:", message);
      setReminderMessage(`Reminder: Scheduled call '${reminder.subject}' starting soon!`);
      console.log("Reminder Popup: ", message);
    };
    const addReminder = (message, triggerTime) => {
      const newReminder = { id: Date.now(), message, triggerTime };
      setReminders([...reminders, newReminder]);
      localStorage.setItem('reminders', JSON.stringify([...reminders, newReminder]));
    };
  
    const removeReminder = (id) => {
      const updatedReminders = reminders.filter((reminder) => reminder.id !== id);
      setReminders(updatedReminders);
      localStorage.setItem('reminders', JSON.stringify(updatedReminders));
    };
    const handleClose = () => {
      setReminderMessage(""); // Clear the reminder message
    };
   
    console.log('*********',reminderMessage)

   
  return (
    <>
    {reminders.map((reminder) => (
      <Reminder
        key={reminder.id}
        message={reminderMessage}
        
      />
    ))}
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
  
      {authenticated && (
        <>
          <Route path=":tenant_id/home" element={<Home />} /> 
          <Route path=":tenant_id/accounts" element={<AccountsTable/>}/> 
          <Route path=":tenant_id/contacts" element={<ContactsTable/>}/> 
          <Route path=":tenant_id/lead" element={<LeadPage />} />
          <Route path=":tenant_id/opportunities" element={<Opportunities />} /> 
          <Route path=":tenant_id/ShowOpportunity/:id" element={<OpportunitiesInfo />} />
          <Route path=":tenant_id/dashboard" element={<Dashboard />} />
          <Route path=":tenant_id/reminder" element={<Remind/>}/>
          <Route path=":tenant_id/createreminder" element={<Reminderform/>}/>
          <Route path=":tenant_id/vendors" element={<Vendors/>}/>
          <Route path=":tenant_id/createVendors" element={<Vendorsform/>}/>
          <Route path=":tenant_id/Vendorsinfo/:id" element={<VendorInfo/>}/>
          <Route path=":tenant_id/topNavbar" element={<TopNavbar/>}/>
          <Route path=":tenant_id/custom" element={<Custom/>}/>
          <Route path="/:tenantId/coins" element={<CoinStatsPage />} />   
          <Route path=":tenant_id/addlead" element={<Lead/>} />  
          <Route path=":tenant_id/flow2" element={<FlowGraph2/>}/>
          {/* <Route path=":tenant_id/instagramflow" element={<InstagramFlow/>}/>*/}
          <Route path=":tenant_id/whatsappflow" element={<WhatsappFlow/>}/>
          <Route path=":tenant_id/contactinfo/:id" element={<ContactInfo/>}/>
          <Route path=":tenant_id/ShowLead/:id" element={<ShowLead/>}/>
          <Route path=":tenant_id/convert/:id" element={<ConvertLead/>}/>
          <Route path=":tenant_id/addaccount" element={<AccountForm/>} />
          <Route path=":tenant_id/addcontact" element={<Form2/>}/>
          <Route path=":tenant_id/meetings" element={<Met handleScheduleMeeting={handleScheduleMeeting} scheduleData={scheduleData} setScheduleData={setScheduleData} />}  />
          <Route path=":tenant_id/meetings/:id" element={<Meetinginfo/>}  />
         <Route path="/:tenantId/report" element={<Report />} />
       
          <Route path=":tenant_id/calendar"   element={<Calendar/>}/>  


          <Route path=":tenant_id/opportunity" element={<Form3/>} />
          <Route path=":tenant_id/callpage" element={<CallPage handleScheduleMeeting={handleScheduleMeeting} scheduleData={scheduleData} setScheduleData={setScheduleData} />} />
          <Route path=":tenant_id/tasks/:id" element={<Taskinfo/>}/>
          <Route path=":tenant_id/callpage/:id"  element={<Callpageinfo/>}/>
          <Route path=":tenant_id/accounts/:id" element={<AccountsPage />} />
          <Route path=":tenant_id/send-email/:id" element={<SendEmail/>}/>
          <Route path=":tenant_id/send-msg/:id" element={<WhatsApp/>}/>
          <Route path=":tenant_id/email" element={<EmailComponent/>} />
          <Route path=":tenant_id/tasks" element={<TaskTable/>} />
          <Route path=":tenant_id/interaction" element={<Interaction/>}/>
          <Route path=":tenant_id/addtask" element={<AddTaskForm/>}/>
          <Route path=":tenant_id/loyaltyform" element ={<Loyalityform/>}/>
         
          <Route path=":tenant_id/pdf" element ={<PdfUploader/>}/>
          <Route path=":tenant_id/email-tracking" element ={<EmailTrackingInfo/>}/>

          <Route path="/:tenantId/flow" element={<FlowBuilder />} />
          <Route path="/:tenantId/floww/:templateId?" element={<DnDFlow />} />
          {/* <Route path=":tenant_id/compose" element={<GmailCallback />} /> */}
          <Route path=":tenant_id/compose" element={<EmailComponent/>}/>
          <Route path=":tenant_id/bulk-import" element={<BulkImport/>}/>
          <Route path=":tenant_id/flow" element={<FlowGraph/>}/>
          <Route path=":tenant_id/FB" element={<FaceB/>}/>
          <Route path=":tenant_id/addinteraction" element={<AddInteractionForm/>} />
          <Route path=":tenant_id/interaction/:id" element={<InteractionDetailsPage/>} />
          <Route path=":tenant_id/campaign"  element= {<Campaign/>}/>
          <Route path=":tenant_id/campaignform"  element= {<Campaignform/>}/>
          <Route path=":tenant_id/campaigninfo/:id"  element= {<CampaignInfo/>}/>
          <Route path="/instagramauth"  element= {<InstaAuth/>}/>
          <Route path=":tenant_id/instagrampost"  element= {<InstagramPost/>}/>
          <Route path=":tenant_id/user_id" element={<Userprofile />} />
          <Route path=":tenant_id/linkedinauth"  element= {<LinkedInAuthPage/>}/>
          <Route path=":tenant_id/linkedinpost"  element= {<LinkedInPost/>}/>
          <Route path=":tenant_id/product"  element= {<Product/>}/>
          <Route path=":tenant_id/loyalty"  element= {<Loyalcard/>}/>
          <Route path=":tenant_id/CustomModel"  element= {<Custom/>}/>
          <Route path=":tenant_id/models/:modelName"  element= {<Models/>}/>
          {/* <Route path=":tenant_id/CustomModelForm"  element= {<CustomModelForm/>}/> */}
          <Route path=":tenant_id/emailss"  element= {<EmailAppa/>}/>
          <Route path=":tenant_id/email-list" element={<EmailList/>} />
          {/* <Route path=":tenant_id/email-provider" element={<EmailProviders/>} /> */}
          
          <Route path=":tenant_id/loyaltyinfo"  element= {<LoyaltyInfo/>}/>
          <Route path=":tenant_id/chatbot"  element= {<Chatbot/>}/>



          <Route path=":tenant_id/chatbot/" element={<Chatbot/>}/>


          <Route path=":tenant_id/productform"  element= {<ProductForm/>}/>

          <Route path=":tenant_id/productinfo/:id"  element= {<ProductInfo/>}/>
          <Route path=":tenant_id/ticketform"  element= {<Ticketform/>}/>
          <Route path=":tenant_id/ticketinfo/:id"  element= {<TicketInfo/>}/>
          <Route path=":tenant_id/ticket"  element= {<Ticket/>}/>
          <Route path=":tenant_id/explore"  element= {<ExplorePage/>}/>
          <Route path=":tenant_id/exploredetails"  element= {<ExploreDetails/>}/>

          <Route path=":tenant_id/productinfo"  element= {<ProductInfo/>}/>
          <Route path=":tenant_id/assignLeads"  element= {<AssignLeads/>}/>
          <Route path=":tenant_id/editdocument"  element= {<IframePage/>}/>
          <Route path=":tenant_id/editImage"  element= {<ImageEditorComponent/>}/>
    
          <Route path=":tenant_id/email_setup" element={<Appa/>}/>
          <Route path=":tenant_id/InstagramMedia"  element= {<InstagramMedia/>}/>
          <Route path=":tenant_id/calllogs"  element= {<CallLogs/>}/>
          <Route path=":tenant_id/chat2doc"  element= {<DocumentRag/>}/>
          <Route path=":tenant_id/emaileditor"  element= {<Htmleditor/>}/>
          <Route path=":tenant_id/experiencemodel"  element= {<Experience/>}/>
          <Route path=":tenant_id/experienceinfo/:id"  element= {<ExperienceInfo/>}/>
          <Route path=":tenant_id/experienceform"  element= {<ExperienceForm/>}/>
        </>
      )}


    {/*<Route path="*" element={<Login/>} />*/}
    <Route path="*" element={<NotFound />} />
    
      
    </Routes>
    </>
  );
};