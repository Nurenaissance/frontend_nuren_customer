import React from 'react';
import { useState, useEffect } from 'react';

const Reminder =()=>{

    const [reminders, setReminders] = useState([]);
    const [reminderMessage, setReminderMessage] = useState("");

    useEffect(() => {
        const storedReminders = JSON.parse(localStorage.getItem('reminders')) || [];
        setReminders(storedReminders);
      }, []);
      useEffect(() => {

        const interval = setInterval(() => {
          const now = new Date().getTime();
          reminders.forEach((reminder) => {
            if (reminder.triggerTime <= now) {
              showReminder(reminder.message);
              removeReminder(reminder.id);
            }
          });
        }, 60000); // Check every minute
        return () => clearInterval(interval);
      }, [reminders]);
      const showReminder = (message) => {
        console.log("Show reminder called with message:", message);
        setReminderMessage(`Reminder: Scheduled call '${scheduleData.subject}' starting soon!`);
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
           

    {reminderMessage && (
      <div className="reminder-modal">
        <div className="reminder">
          <p>{reminderMessage}</p>
          <button onClick={handleClose}>Dismiss</button>
        </div>
      </div>
    )}
  </>
  );
};

export default  Reminder;
