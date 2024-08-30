// import React, { useState } from 'react';
// import './BroadcastPage.css';

// const BroadcastPage = () => {
//   const [showTemplatePopup, setShowTemplatePopup] = useState(false);
//   const [templates, setTemplates] = useState([]);
//   const [broadcasts, setBroadcasts] = useState([]);
//   const [dateFrom, setDateFrom] = useState('');
//   const [dateTo, setDateTo] = useState('');
//   const [activeTab, setActiveTab] = useState('history');

//   const [templateName, setTemplateName] = useState('');
//   const [category, setCategory] = useState('');
//   const [language, setLanguage] = useState('');
//   const [broadcastTitle, setBroadcastTitle] = useState('');
//   const [messageBody, setMessageBody] = useState('');
//   const [buttons, setButtons] = useState([]);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);

//   const handleCreateTemplate = (e) => {
//     e.preventDefault();
//     const newTemplate = { templateName, category, language, broadcastTitle, messageBody, buttons };
//     setTemplates([...templates, newTemplate]);
//     setShowTemplatePopup(false);
//     resetTemplateForm();
//   };


//   const resetTemplateForm = () => {
//     setTemplateName('');
//     setCategory('');
//     setLanguage('');
//     setBroadcastTitle('');
//     setMessageBody('');
//     setButtons([]);
//   };

//   const addButton = () => {
//     setButtons([...buttons, { text: '', url: '' }]);
//   };

//   const updateButton = (index, field, value) => {
//     const updatedButtons = buttons.map((button, i) => 
//       i === index ? { ...button, [field]: value } : button
//     );
//     setButtons(updatedButtons);
//   };

//   const handleSendTemplate = () => {
//     if (selectedTemplate) {
//       // Logic to send the selected template
//       console.log("Sending template:", selectedTemplate);
//       // You can add more logic here to actually send the broadcast
//     }
//   };

//   const handleNewBroadcast = () => {
//     // Simulating a new broadcast
//     const newBroadcast = {
//       id: Date.now(),
//       name: `Broadcast ${broadcasts.length + 1}`,
//       sent: Math.floor(Math.random() * 1000),
//       delivered: Math.floor(Math.random() * 900),
//       read: Math.floor(Math.random() * 800),
//       replied: Math.floor(Math.random() * 500),
//       date: new Date().toLocaleDateString(),
//       status: ['Completed', 'In Progress', 'Failed'][Math.floor(Math.random() * 3)]
//     };
//     setBroadcasts([newBroadcast, ...broadcasts]);
//   };

//   return (
//     <div className="broadcast-page">
//       <div className="left-sidebar">
//         <div className={`menu-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Broadcast History</div>
//         <div className={`menu-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>Template Messages</div>
//       </div>
//       <div className="main-content">
//         {activeTab === 'history' && (
//           <div className="broadcast-history">
//             <h1>Broadcast History</h1>
//             <div className="action-bar">
//               <div className="date-filter">
//                 <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
//                 <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
//                 <button className="btn-apply">Apply</button>
//               </div>
//               <button className="btn-create" onClick={handleNewBroadcast}>New Broadcast</button>
//             </div>
//             <div className="broadcast-stats">
//               <div className="stat-item">
//                 <span className="stat-value">{broadcasts.reduce((sum, b) => sum + b.sent, 0)}</span>
//                 <span className="stat-label">Sent</span>
//               </div>
//               <div className="stat-item">
//                 <span className="stat-value">{broadcasts.reduce((sum, b) => sum + b.delivered, 0)}</span>
//                 <span className="stat-label">Delivered</span>
//               </div>
//               <div className="stat-item">
//                 <span className="stat-value">{broadcasts.reduce((sum, b) => sum + b.read, 0)}</span>
//                 <span className="stat-label">Read</span>
//               </div>
//               <div className="stat-item">
//                 <span className="stat-value">{broadcasts.reduce((sum, b) => sum + b.replied, 0)}</span>
//                 <span className="stat-label">Replied</span>
//               </div>
//             </div>
//             <div className="broadcast-list">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Sent</th>
//                     <th>Delivered</th>
//                     <th>Read</th>
//                     <th>Replied</th>
//                     <th>Date</th>
//                     <th>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {broadcasts.map(broadcast => (
//                     <tr key={broadcast.id}>
//                       <td>{broadcast.name}</td>
//                       <td>{broadcast.sent}</td>
//                       <td>{broadcast.delivered}</td>
//                       <td>{broadcast.read}</td>
//                       <td>{broadcast.replied}</td>
//                       <td>{broadcast.date}</td>
//                       <td><span className={`status ${broadcast.status.toLowerCase()}`}>{broadcast.status}</span></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//         {activeTab === 'templates' && (
//         <div className="template-messages">
//           <h1>Template Messages</h1>
//           <button className="btn-create" onClick={() => setShowTemplatePopup(true)}>Create Template</button>
//           <div className="template-list">
//             {templates.map((template, index) => (
//               <div key={index} className="template-item" onClick={() => setSelectedTemplate(template)}>
//                 <h3>{template.templateName}</h3>
//                 <p>Category: {template.category}</p>
//                 <p>Language: {template.language}</p>
//                 <p>Message: {template.messageBody.substring(0, 50)}...</p>
//                 {template.buttons.length > 0 && <p>Buttons: {template.buttons.length}</p>}
//               </div>
//             ))}
//             </div>
//             {selectedTemplate && (
//             <div className="selected-template">
//               <h2>Selected Template: {selectedTemplate.templateName}</h2>
//               <button onClick={handleSendTemplate} className="btn-send">Send Template</button>
//             </div>
//           )}
//           </div>
//         )}
//       </div>
//       {showTemplatePopup && (
//         <div className="popup-overlay">
//           <div className="popup template-popup">
//             <h2>Create Template Message</h2>
//             <div className="template-form-container">
//               <form onSubmit={handleCreateTemplate}>
//               <div className="form-group">
//                 <label>Template Name</label>
//                 <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} required />
//               </div>
//               <div className="form-group">
//                 <label>Category</label>
//                 <select value={category} onChange={(e) => setCategory(e.target.value)} required>
//                   <option value="">Select category...</option>
//                   <option value="Marketing">Marketing</option>
//                   <option value="Transactional">Transactional</option>
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Language</label>
//                 <select value={language} onChange={(e) => setLanguage(e.target.value)} required>
//                   <option value="">Select language...</option>
//                   <option value="English">English</option>
//                   <option value="Spanish">Spanish</option>
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Broadcast Title (Optional)</label>
//                 <input type="text" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
//               </div>
//               <div className="form-group">
//                 <label>Message Body</label>
//                 <textarea value={messageBody} onChange={(e) => setMessageBody(e.target.value)} required></textarea>
//               </div>
//               <div className="form-group">
//                   <label>Buttons</label>
//                   {buttons.map((button, index) => (
//                     <div key={index} className="button-inputs">
//                       <input
//                         type="text"
//                         placeholder="Button Text"
//                         value={button.text}
//                         onChange={(e) => updateButton(index, 'text', e.target.value)}
//                       />
//                       <input
//                         type="text"
//                         placeholder="Button URL"
//                         value={button.url}
//                         onChange={(e) => updateButton(index, 'url', e.target.value)}
//                       />
//                     </div>
//                   ))}
//                   <button type="button" onClick={addButton} className="btn-add-button">Add Button</button>
//                 </div>
//                 <div className="form-actions">
//                   <button type="submit" className="btn-save">Save Template</button>
//                   <button type="button" className="btn-cancel" onClick={() => setShowTemplatePopup(false)}>Cancel</button>
//                 </div>
//               </form>
//               <div className="template-preview">
//                 <h3>Preview</h3>
//                 <div className="whatsapp-preview">
//                   <div className="message-body">{messageBody}</div>
//                   {buttons.map((button, index) => (
//                     <button key={index} className="whatsapp-button">{button.text}</button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BroadcastPage;



import React, { useState } from 'react';
import './BroadcastPage.css';

const BroadcastPage = () => {
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTab, setActiveTab] = useState('history');

  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [buttons, setButtons] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleCreateTemplate = (e) => {
    e.preventDefault();
    const newTemplate = { templateName, category, language, broadcastTitle, messageBody, buttons };
    setTemplates([...templates, newTemplate]);
    setShowTemplatePopup(false);
    resetTemplateForm();
  };

  const resetTemplateForm = () => {
    setTemplateName('');
    setCategory('');
    setLanguage('');
    setBroadcastTitle('');
    setMessageBody('');
    setButtons([]);
  };

  const addButton = () => {
    setButtons([...buttons, { text: '', url: '' }]);
  };

  const updateButton = (index, field, value) => {
    const updatedButtons = buttons.map((button, i) => 
      i === index ? { ...button, [field]: value } : button
    );
    setButtons(updatedButtons);
  };

  const handleSendTemplate = () => {
    if (selectedTemplate) {
      console.log("Sending template:", selectedTemplate);
    }
  };

  const handleNewBroadcast = () => {
    const newBroadcast = {
      id: Date.now(),
      name: `Broadcast ${broadcasts.length + 1}`,
      sent: Math.floor(Math.random() * 1000),
      delivered: Math.floor(Math.random() * 900),
      read: Math.floor(Math.random() * 800),
      replied: Math.floor(Math.random() * 500),
      date: new Date().toLocaleDateString(),
      status: ['Completed', 'In Progress', 'Failed'][Math.floor(Math.random() * 3)]
    };
    setBroadcasts([newBroadcast, ...broadcasts]);
  };

  return (
    <div className="bp-broadcast-page">
      <div className="bp-left-sidebar">
        <div className={`bp-menu-item ${activeTab === 'history' ? 'bp-active' : ''}`} onClick={() => setActiveTab('history')}>Broadcast History</div>
        <div className={`bp-menu-item ${activeTab === 'templates' ? 'bp-active' : ''}`} onClick={() => setActiveTab('templates')}>Template Messages</div>
      </div>
      <div className="bp-main-content">
        {activeTab === 'history' && (
          <div className="bp-broadcast-history">
            <h1>Broadcast History</h1>
            <div className="bp-action-bar">
              <div className="bp-date-filter">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                <button className="bp-btn-apply">Apply</button>
              </div>
              <button className="bp-btn-create" onClick={handleNewBroadcast}>New Broadcast</button>
            </div>
            <div className="bp-broadcast-stats">
              <div className="bp-stat-item">
                <span className="bp-stat-value">{broadcasts.reduce((sum, b) => sum + b.sent, 0)}</span>
                <span className="bp-stat-label">Sent</span>
              </div>
              <div className="bp-stat-item">
                <span className="bp-stat-value">{broadcasts.reduce((sum, b) => sum + b.delivered, 0)}</span>
                <span className="bp-stat-label">Delivered</span>
              </div>
              <div className="bp-stat-item">
                <span className="bp-stat-value">{broadcasts.reduce((sum, b) => sum + b.read, 0)}</span>
                <span className="bp-stat-label">Read</span>
              </div>
              {/* <div className="bp-stat-item">
                <span className="bp-stat-value">{broadcasts.reduce((sum, b) => sum + b.replied, 0)}</span>
                <span className="bp-stat-label">Replied</span>
              </div> */}
            </div>
            <div className="bp-broadcast-list">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Sent</th>
                    <th>Delivered</th>
                    <th>Read</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {broadcasts.map(broadcast => (
                    <tr key={broadcast.id}>
                      <td>{broadcast.name}</td>
                      <td>{broadcast.sent}</td>
                      <td>{broadcast.delivered}</td>
                      <td>{broadcast.read}</td>
                      <td>{broadcast.date}</td>
                      <td><span className={`bp-status bp-${broadcast.status.toLowerCase().replace(' ', '-')}`}>{broadcast.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'templates' && (
          <div className="bp-template-messages">
            <h1>Template Messages</h1>
            <button className="bp-btn-create" onClick={() => setShowTemplatePopup(true)}>Create Template</button>
            <div className="bp-template-list">
              {templates.map((template, index) => (
                <div key={index} className="bp-template-item" onClick={() => setSelectedTemplate(template)}>
                  <h3>{template.templateName}</h3>
                  <p>Category: {template.category}</p>
                  <p>Language: {template.language}</p>
                  <p>Message: {template.messageBody.substring(0, 50)}...</p>
                  {template.buttons.length > 0 && <p>Buttons: {template.buttons.length}</p>}
                </div>
              ))}
            </div>
            {selectedTemplate && (
              <div className="bp-selected-template">
                <h2>Selected Template: {selectedTemplate.templateName}</h2>
                <button onClick={handleSendTemplate} className="bp-btn-send">Send Template</button>
              </div>
            )}
          </div>
        )}
      </div>
      {showTemplatePopup && (
        <div className="bp-popup-overlay">
          <div className="bp-popup bp-template-popup">
            <h2>Create Template Message</h2>
            <div className="bp-template-form-container">
              <form onSubmit={handleCreateTemplate}>
                <div className="bp-form-group">
                  <label>Template Name</label>
                  <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} required />
                </div>
                <div className="bp-form-group">
                  <label>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">Select category...</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Transactional">Transactional</option>
                  </select>
                </div>
                <div className="bp-form-group">
                  <label>Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} required>
                    <option value="">Select language...</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
                <div className="bp-form-group">
                  <label>Broadcast Title (Optional)</label>
                  <input type="text" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
                </div>
                <div className="bp-form-group">
                  <label>Message Body</label>
                  <textarea value={messageBody} onChange={(e) => setMessageBody(e.target.value)} required></textarea>
                </div>
                <div className="bp-form-group">
                  <label>Buttons</label>
                  {buttons.map((button, index) => (
                    <div key={index} className="bp-button-inputs">
                      <input
                        type="text"
                        placeholder="Button Text"
                        value={button.text}
                        onChange={(e) => updateButton(index, 'text', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Button URL"
                        value={button.url}
                        onChange={(e) => updateButton(index, 'url', e.target.value)}
                      />
                    </div>
                  ))}
                  <button type="button" onClick={addButton} className="bp-btn-add-button">Add Button</button>
                </div>
                <div className="bp-form-actions">
                  <button type="submit" className="bp-btn-save">Save Template</button>
                  <button type="button" className="bp-btn-cancel" onClick={() => setShowTemplatePopup(false)}>Cancel</button>
                </div>
              </form>
              <div className="bp-template-preview">
      <div className="bp-whatsapp-preview">
        <h3 style={{zIndex:'999', marginBottom:'3rem', color:'white'}}>WhatsApp Template Preview</h3>
        <div className="bp-message-body">
          {messageBody}
          <div className="bp-message-time">08:33</div>
        </div>
        <div className="bp-whatsapp-buttons">
          {buttons.map((button, index) => (
            <button key={index} className="bp-whatsapp-button">
              {button.text}
            </button>
          ))}
        </div>
        <div className="bp-whatsapp-footer">
          <input
            type="text"
            className="bp-whatsapp-input"
            placeholder="Type a message"
          />
          <button className="bp-whatsapp-send"></button>
        </div>
      </div>
    </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastPage;