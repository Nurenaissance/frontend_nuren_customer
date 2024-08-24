import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { FaTrash, FaCopy, FaMinus, FaPlus, FaFlag } from 'react-icons/fa';
import { useFlow } from './FlowContext';

const nodeStyles = {
  padding: '15px',
  borderRadius: '8px',
  width: '250px',
  fontSize: '14px',
  color: '#333',
  textAlign: 'left',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(to bottom, #ffffff, #f0f0f0)',
  border: '1px solid #ddd',
};

const inputStyles = {
  width: '100%',
  padding: '8px',
  margin: '8px 0',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '14px',
  transition: 'border-color 0.3s',
};

const buttonStyles = {
  background: '#4CAF50',
  color: 'white',
  border: 'none',
  padding: '8px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  margin: '8px 5px',
  fontSize: '14px',
  transition: 'background-color 0.3s',
};

const iconStyles = {
  cursor: 'pointer',
  margin: '0 5px',
  fontSize: '16px',
  color: '#555',
  transition: 'color 0.3s',
};

const selectStyles = {
  ...inputStyles,
  appearance: 'none',
  // backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"),
  backgroundRepeat: 'no-repeat, repeat',
  backgroundPosition: 'right .7em top 50%, 0 0',
  backgroundSize: '.65em auto, 100%',
};

const textAreaStyles = {
  ...inputStyles,
  minHeight: '80px',
  resize: 'vertical',
};

const fileInputStyles = {
  ...inputStyles,
  padding: '8px',
  background: '#f9f9f9',
  cursor: 'pointer',
};

const NodeWrapper = ({ children, style, type, id }) => {
  const { setAsStartNode, startNodeId } = useFlow();
  const { deleteElements, setNodes, getNode } = useReactFlow();

  const onDelete = useCallback(() => {
    deleteElements({ nodes: [{ id: getNode(type).id }] });
  }, [deleteElements, getNode, type]);

  const onSetAsStart = () => {
    setAsStartNode(id);
  };

  const isStartNode = startNodeId === id;



  const onCopy = useCallback(() => {
    const node = getNode(type);
    const position = {
      x: node.position.x + 50,
      y: node.position.y + 50,
    };

    setNodes((nds) => nds.concat({
      ...node,
      id: `${type}-${nds.length + 1}`,
      position,
    }));
  }, [getNode, setNodes, type]);

  return (
    <div style={{ ...nodeStyles, ...style, border: isStartNode ? '2px solid #4CAF50' : '1px solid #ddd' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <FaCopy onClick={onCopy} style={iconStyles} />
        <FaTrash onClick={onDelete} style={iconStyles} />
        <FaFlag 
          onClick={onSetAsStart} 
          style={{ 
            ...iconStyles, 
            color: isStartNode ? '#4CAF50' : '#808080' 
          }} 
        />
      </div>
      {children}
    </div>
  );
};

export const AskQuestionNode = ({ data, isConnectable }) => {
    const [question, setQuestion] = useState(data.question || '');
    const [optionType, setOptionType] = useState(data.optionType || 'Buttons');
    const [options, setOptions] = useState(data.options || []);
    const { id } = data;
const { updateNodeData } = useFlow();

    const handleQuestionChange = (e) => {
      const newQuestion = e.target.value;
      setQuestion(newQuestion);
      updateNodeData(id, { question: newQuestion });
    };

    const handleOptionTypeChange = (e) => {
      const newOptionType = e.target.value;
      setOptionType(newOptionType);
      updateNodeData(id, { question, optionType: newOptionType, options });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = options.map((opt, i) => i === index ? value : opt);
    setOptions(newOptions);
    updateNodeData(id, { question, optionType, options: newOptions });
};

const addOption = () => {
  const newOptions = [...options, ''];
  setOptions(newOptions);
  updateNodeData(id, { question, optionType, options: newOptions });
};

const removeOption = (index) => {
  const newOptions = options.filter((_, i) => i !== index);
  setOptions(newOptions);
  updateNodeData(id, { question, optionType, options: newOptions });
};

return (
  <NodeWrapper style={{ background: 'linear-gradient(to bottom, #FFA500, #FF8C00)', position: 'relative' }} type="askQuestion">
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      <h3 style={{ marginBottom: '15px', color: '#fff' }}>Ask Question</h3>
      <textarea
          style={textAreaStyles}
          value={question}
          onChange={handleQuestionChange}
          placeholder="Enter question"
      />
      <select 
          value={optionType} 
          onChange={handleOptionTypeChange}
          style={selectStyles}
      >
          <option value="Buttons">Buttons</option>
          <option value="Lists">Lists</option>
          <option value="Variables">Variables</option>
      </select>
      {options.map((option, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', position: 'relative' }}>
              <input
                  style={{ ...inputStyles, width: '80%' }}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
              />
              <FaMinus onClick={() => removeOption(index)} style={{ ...iconStyles, color: '#d32f2f' }} />
              {(optionType === 'Buttons' || optionType === 'Lists') && (
                  <Handle
                      type="source"
                      position={Position.Right}
                      id={`option-${index}`}
                      style={{
                        
                          top: '50%',
                          right: '-10px',
                          background: '#784212',
                          width: '12px',
                          height: '12px',
                      }}
                      isConnectable={isConnectable}
                  />
              )}
          </div>
      ))}
      <button style={{ ...buttonStyles, background: '#FF8C00' }} onClick={addOption}>
          <FaPlus style={{ marginRight: '5px' }} /> Add Option
      </button>
      {optionType === 'Variables' && (
          <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      )}
  </NodeWrapper>
);
};

export const SendMessageNode = ({ data, isConnectable }) => {
  const [fields, setFields] = useState(data.fields || [{ type: 'Message', content: '' }]);
  const { id } = data;
const { updateNodeData } = useFlow();

const updateNodeDataSafely = (newFields) => {
  updateNodeData(id, { fields: newFields });
};

const addField = (type) => {
  const newFields = [...fields, { type, content: '' }];
  setFields(newFields);
  updateNodeDataSafely(newFields);
};

const updateField = (index, updatedField) => {
  const newFields = fields.map((field, i) => 
      i === index ? { ...field, ...updatedField } : field
  );
  setFields(newFields);
  updateNodeDataSafely(newFields);
};

const removeField = (index) => {
  const newFields = fields.filter((_, i) => i !== index);
  setFields(newFields);
  updateNodeDataSafely(newFields);
};

const renderInput = (field, index) => {
  switch (field.type) {
    case 'Image':
    case 'Document':
    case 'Audio':
    case 'Video':
      return (
        <div>
          {field.content && (
            <div style={{ marginBottom: '10px' }}>
              {field.type === 'Image' && (
                <img
                  src={field.content}
                  alt={field.fileName}
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
              )}
              {field.type === 'Document' && (
                <iframe
                  src={field.content}
                  title={field.fileName}
                  style={{ width: '100%', height: '300px' }}
                />
              )}
              {(field.type === 'Audio' || field.type === 'Video') && (
                <div>
                  <h4>{field.fileName}</h4>
                  {field.type === 'Audio' && (
                    <audio controls src={field.content} style={{ width: '100%' }} />
                  )}
                  {field.type === 'Video' && (
                    <video controls src={field.content} style={{ width: '100%', maxHeight: '300px' }} />
                  )}
                </div>
              )}
            </div>
          )}
          <input
            type="file"
            accept={`${field.type.toLowerCase()}/*`}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  updateField(index, { content: event.target.result, fileName: file.name });
                };
                reader.readAsDataURL(file);
              }
            }}
            style={fileInputStyles}
          />
        </div>
      );
    default:
      return (
        <textarea
          value={field.content}
          onChange={(e) => updateField(index, { content: e.target.value })}
          placeholder={`Enter ${field.type.toLowerCase()}`}
          style={textAreaStyles}
        />
      );
  }
};

  return (
    <NodeWrapper style={{ background: 'linear-gradient(to bottom, #FF7F50, #FF6347)' }} type="sendMessage">
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      <h3 style={{ marginBottom: '15px', color: '#fff' }}>Send Message</h3>
      {fields.map((field, index) => (
        <div key={index} style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <select 
              value={field.type} 
              onChange={(e) => updateField(index, { type: e.target.value, content: '' })}
              style={{ ...selectStyles, width: '40%', marginRight: '10px' }}
            >
              <option value="Message">Message</option>
              <option value="Image">Image</option>
              <option value="Document">Document</option>
              <option value="Audio">Audio</option>
              <option value="Video">Video</option>
            </select>
            <FaMinus onClick={() => removeField(index)} style={{ ...iconStyles, color: '#d32f2f' }} />
          </div>
          {renderInput(field, index)}
          {field.fileName && <div style={{ fontSize: '12px', marginTop: '5px' }}>File: {field.fileName}</div>}
        </div>
      ))}
      <button style={{ ...buttonStyles, background: '#FF6347' }} onClick={() => addField('Message')}>
        <FaPlus style={{ marginRight: '5px' }} /> Add Field
      </button>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </NodeWrapper>
  );
};

export const SetConditionNode = ({ data, isConnectable }) => {
  const [condition, setCondition] = useState(data.condition || '');
  const { id } = data;
const { updateNodeData } = useFlow();


  const handleConditionChange = (e) => {
    const newCondition = e.target.value;
    setCondition(newCondition);
    updateNodeData(id, { condition: newCondition });
      // updateNodeData({ condition: newCondition });
  };

  return (
    <NodeWrapper style={{ background: 'linear-gradient(to bottom, #4169E1, #1E90FF)' }} type="setCondition">
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      <h3 style={{ marginBottom: '15px', color: '#fff' }}>Set Condition</h3>
      <textarea
        style={textAreaStyles}
        value={condition}
        onChange={handleConditionChange}
        placeholder="Enter condition"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <div>True</div>
        <div>False</div>
      </div>
      <Handle type="source" position={Position.Right} id="true" isConnectable={isConnectable} style={{ top: '60%' }} />
      <Handle type="source" position={Position.Right} id="false" isConnectable={isConnectable} style={{ top: '80%' }} />
    </NodeWrapper>
  );
};