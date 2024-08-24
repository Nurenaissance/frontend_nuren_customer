import React, { useState } from 'react';
import "./FlowBuilder.css"
import axiosInstance from '../../api';
import { useFlow } from './FlowContext';

const SaveFlowPopup = ({ onSave, onCancel }) => {
  const [flowName, setFlowName] = useState('');
  const [description, setDescription] = useState('');
  const { nodes, edges } = useFlow();

  const handleSave = async () => {
    if (!flowName.trim()) {
      alert("Flow name is required");
      return;
    }

    console.log('Nodes before saving:', nodes);
    console.log('Edges before saving:', edges);

    const flow = {
      name: flowName,
      description,
      category: "default",
      node_data: {
        nodes: nodes.map(({ id, type, position, data }) => {
          const { updateNodeData, ...cleanData } = data;
          return { id, type, position, data: cleanData };
        }),
        edges
      }
    };

    console.log('Flow to be saved:', flow);

    try {
      const response = await axiosInstance.post('/node-templates/', flow);
      console.log('Flow saved successfully:', response.data);
      onSave(flowName, description);
      onCancel();
    } catch (error) {
      console.error('Error saving flow:', error);
      alert("Error saving flow. Please try again.");
    }
  };

  return (
    <div className="save-flow-popup">
      <h2>Save Flow</h2>
      <input
        type="text"
        placeholder="Flow Name"
        value={flowName}
        onChange={(e) => setFlowName(e.target.value)}
        required
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div>
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default SaveFlowPopup;