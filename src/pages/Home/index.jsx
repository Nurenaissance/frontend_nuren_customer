import "./home.css";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { Card } from "../../components/Card";
import { BarChart1 } from "../../components/BarChart.js/index.jsx";
import { useState, useEffect } from "react";
import { Data } from "../../Data";
import React from "react";
import TopNavbar from "../TopNavbar/TopNavbar.jsx"; // Adjust the import path


// Import useState from React

// Your other imports and code here...



import { LineChart1 } from "../../components/LineChart.js";
import Donut from "../../components/DonutChart/Donut";
import Funnel from "../../components/FunnelChart/Funnel";
import PieChart from "../../components/FunnelChart/Pie";

export const Home = () => {
  // State to manage reminders
  const [reminderMessage, setReminderMessage] = useState("");


  
  // Function to dismiss reminder
  
  const handleReminderClose = () => {
    setReminderMessage(""); // Clear reminder message when closing
  };


  // Code to set reminders...
  // Example:
 
  return (
    <div className="home">
       <div className="call_nav">
    <TopNavbar/>
  </div>
      <div>
        <div className="home_inner">
          <div className="home_left_box">
            <Sidebar />
          </div>
          <div className="home_right_box">
            <h1>DASHBOARD</h1>
            <div className="home_right_box_inner">
              <Card />
           
            
              <div className="chart-container" style={{marginTop:'50px'}}>
              <div className="chart">
                  <Donut />
                </div>
              
              <div className="chart">
              <LineChart1 /> 
              </div>
              </div>
              <div className="chart-container">
                <div className="chart">
                  <Funnel />
                </div>
                <div className="chart">
              <BarChart1 />
              </div>
                </div>
              </div>
          
          </div>
        </div>
      </div>
      {/* Render reminders */}
      {/* {reminders.map((reminder) => (
        <Reminder
          key={reminder.id}
          message={reminder.message}
          onClose={() => dismissReminder(reminder.id)}
        />
        
      ))} */}
       <div>
      {/* <Reminder message={reminderMessage} onClose={handleReminderClose} /> */}
      {reminderMessage && (
        <Reminder message={reminderMessage} onClose={() => setReminderMessage("")} />
      )}

    </div>
      
      
    </div>
  );
};
