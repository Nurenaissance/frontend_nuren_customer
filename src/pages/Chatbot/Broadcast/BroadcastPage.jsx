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

  const handleCreateTemplate = (e) => {
    e.preventDefault();
    const newTemplate = { templateName, category, language, broadcastTitle, messageBody };
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
  };

  const handleNewBroadcast = () => {
    // Simulating a new broadcast
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
    <div className="broadcast-page">
      <div className="left-sidebar">
        <div className={`menu-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Broadcast History</div>
        <div className={`menu-item ${activeTab === 'scheduled' ? 'active' : ''}`} onClick={() => setActiveTab('scheduled')}>Scheduled Broadcasts</div>
        <div className={`menu-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>Template Messages</div>
      </div>
      <div className="main-content">
        {activeTab === 'history' && (
          <div className="broadcast-history">
            <h1>Broadcast History</h1>
            <div className="action-bar">
              <div className="date-filter">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                <button className="btn-apply">Apply</button>
              </div>
              <button className="btn-create" onClick={handleNewBroadcast}>New Broadcast</button>
            </div>
            <div className="broadcast-stats">
              <div className="stat-item">
                <span className="stat-value">{broadcasts.reduce((sum, b) => sum + b.sent, 0)}</span>
                <span className="stat-label">Sent</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{broadcasts.reduce((sum, b) => sum + b.delivered, 0)}</span>
                <span className="stat-label">Delivered</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{broadcasts.reduce((sum, b) => sum + b.read, 0)}</span>
                <span className="stat-label">Read</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{broadcasts.reduce((sum, b) => sum + b.replied, 0)}</span>
                <span className="stat-label">Replied</span>
              </div>
            </div>
            <div className="broadcast-list">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Sent</th>
                    <th>Delivered</th>
                    <th>Read</th>
                    <th>Replied</th>
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
                      <td>{broadcast.replied}</td>
                      <td>{broadcast.date}</td>
                      <td><span className={`status ${broadcast.status.toLowerCase()}`}>{broadcast.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'templates' && (
          <div className="template-messages">
            <h1>Template Messages</h1>
            <button className="btn-create" onClick={() => setShowTemplatePopup(true)}>Create Template</button>
            <div className="template-list">
              {templates.map((template, index) => (
                <div key={index} className="template-item">
                  <h3>{template.templateName}</h3>
                  <p>Category: {template.category}</p>
                  <p>Language: {template.language}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {showTemplatePopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Create Template Message</h2>
            <form onSubmit={handleCreateTemplate}>
              <div className="form-group">
                <label>Template Name</label>
                <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">Select category...</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Transactional">Transactional</option>
                </select>
              </div>
              <div className="form-group">
                <label>Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} required>
                  <option value="">Select language...</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
              <div className="form-group">
                <label>Broadcast Title (Optional)</label>
                <input type="text" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Message Body</label>
                <textarea value={messageBody} onChange={(e) => setMessageBody(e.target.value)} required></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save">Save Template</button>
                <button type="button" className="btn-cancel" onClick={() => setShowTemplatePopup(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastPage;