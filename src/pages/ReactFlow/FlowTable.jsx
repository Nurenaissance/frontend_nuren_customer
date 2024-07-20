import React from 'react';
import { Sidebar } from '../../components/Sidebar';

const FlowTable = () => {
  const dummyData = [
    { id: 1, name: "Restaurant_10", triggered: 296, stepsFinished: 1315, finished: 296, createdAt: "2 months ago", updatedAt: "2 months ago" },
    { id: 2, name: "Restaurant_9", triggered: 36, stepsFinished: 154, finished: 35, createdAt: "2 months ago", updatedAt: "2 months ago" },
    { id: 3, name: "Restaurant_8", triggered: 19, stepsFinished: 67, finished: 19, createdAt: "2 months ago", updatedAt: "2 months ago" },
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '20px' }}>Chatbot flows</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button style={{ marginRight: '10px', padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px' }}>
          Add Chatbot
        </button>
        <input type="text" placeholder="Search..." style={{ padding: '10px', width: '200px' }} />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Triggered</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Steps Finished</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Finished</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Modified on</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((flow) => (
            <tr key={flow.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px' }}>{flow.name}</td>
              <td style={{ padding: '12px' }}>{flow.triggered}</td>
              <td style={{ padding: '12px' }}>{flow.stepsFinished}</td>
              <td style={{ padding: '12px' }}>{flow.finished}</td>
              <td style={{ padding: '12px' }}>
                <div>Created {flow.createdAt}</div>
                <div>Updated {flow.updatedAt}</div>
              </td>
              <td style={{ padding: '12px' }}>
                <button style={{ marginRight: '5px' }}>📋</button>
                <button style={{ marginRight: '5px' }}>✏️</button>
                <button>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FlowTable;