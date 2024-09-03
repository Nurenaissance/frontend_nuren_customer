import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { FaTrash, FaCopy, FaMinus, FaPlus } from 'react-icons/fa';
import { useFlow } from './FlowContext';

const nodeStyles = {
  padding: '20px',
  borderRadius: '12px',
  width: '300px',
  fontSize: '14px',
  color: '#333',
  textAlign: 'left',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e0e0e0',
  background: '#ffffff',
};

const inputStyles = {
  width: '100%',
  padding: '10px',
  margin: '10px 0',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '14px',
  backgroundColor: '#f9f9f9',
  color: '#333',
  transition: 'border-color 0.3s, box-shadow 0.3s',
};

const buttonStyles = {
  background: '#4CAF50',
  color: 'white',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '6px',
  cursor: 'pointer',
  margin: '10px 5px',
  fontSize: '14px',
  transition: 'background-color 0.3s, transform 0.1s',
};

const iconStyles = {
  cursor: 'pointer',
  margin: '0 5px',
  fontSize: '18px',
  color: '#555',
  transition: 'color 0.3s, transform 0.1s',
};

const selectStyles = {
  ...inputStyles,
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px top 50%',
  backgroundSize: '12px auto',
  paddingRight: '30px',
};

const textAreaStyles = {
  ...inputStyles,
  minHeight: '100px',
  resize: 'vertical',
};

const fileInputStyles = {
  ...inputStyles,
  padding: '12px',
  background: '#f0f0f0',
  cursor: 'pointer',
};

const errorStyles = {
  color: '#ff4d4f',
  fontSize: '12px',
  marginTop: '5px',
};

const highlightErrorStyle = {
  borderColor: '#ff4d4f',
  boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.2)',
};

const NodeWrapper = ({ children, style, type }) => {
  
  const { deleteElements, setNodes, getNode } = useReactFlow();

  const onDelete = useCallback(() => {
    deleteElements({ nodes: [{ id: getNode(type).id }] });
  }, [deleteElements, getNode, type]);

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
    <div style={{ ...nodeStyles, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {/* <FaCopy onClick={onCopy} style={iconStyles} /> */}
        {/* <FaTrash onClick={onDelete} style={iconStyles} /> */}
      </div>
      {children}
    </div>
  );
};

export const AskQuestionNode = ({ data, isConnectable }) => {
    const [question, setQuestion] = useState(data.question || '');
    const [optionType, setOptionType] = useState(data.optionType || 'Buttons');
    const [options, setOptions] = useState(data.options || []);
    const [dataTypes, setDataTypes] = useState(data.dataTypes || []);
    const [errors, setErrors] = useState({});
    const { id } = data;
const { updateNodeData } = useFlow();

const handleQuestionChange = (e) => {
  const newQuestion = e.target.value;
  setQuestion(newQuestion);
  updateNodeData(id, { question: newQuestion, optionType, options, dataTypes });
};

const handleOptionTypeChange = (e) => {
  const newOptionType = e.target.value;
  setOptionType(newOptionType);
  if (newOptionType === 'Variables' && options.length === 0) {
    setOptions(['']);
    setDataTypes(['']);
  }
  updateNodeData(id, { question, optionType: newOptionType, options, dataTypes });
};

const handleOptionChange = (index, value) => {
  const newOptions = options.map((opt, i) => i === index ? value : opt);
  setOptions(newOptions);
  updateNodeData(id, { question, optionType, options: newOptions, dataTypes });
};

const handleDataTypeChange = (index, value) => {
  const newDataTypes = dataTypes.map((type, i) => i === index ? value : type);
  setDataTypes(newDataTypes);
  setErrors(prev => ({ ...prev, [index]: '' }));
  updateNodeData(id, { question, optionType, options, dataTypes: newDataTypes });
};

const addOption = () => {
  const newOptions = [...options, ''];
  const newDataTypes = [...dataTypes, ''];
  setOptions(newOptions);
  setDataTypes(newDataTypes);
  updateNodeData(id, { question, optionType, options: newOptions, dataTypes: newDataTypes });
};

const removeOption = (index) => {
  const newOptions = options.filter((_, i) => i !== index);
  const newDataTypes = dataTypes.filter((_, i) => i !== index);
  setOptions(newOptions);
  setDataTypes(newDataTypes);
  updateNodeData(id, { question, optionType, options: newOptions, dataTypes: newDataTypes });
};

const validateAndSend = () => {
  let hasErrors = false;
  const newErrors = {};

  if (optionType === 'Variables') {
    dataTypes.forEach((type, index) => {
      if (!type) {
        newErrors[index] = 'Please select a data type';
        hasErrors = true;
      }
    });
  }

  setErrors(newErrors);

  if (!hasErrors) {
    // Send data to backend
    console.log('Sending to backend:', { question, optionType, options, dataTypes });
    // Implement your backend sending logic here
  }
};

const getOptionStyle = (type, index) => {
  const baseStyle = {
    ...inputStyles,
    width: type === 'Variables' ? 'calc(60% - 20px)' : 'calc(100% - 40px)',
  };

  switch (type) {
    case 'Buttons':
      return {
        ...baseStyle,
        background: '#e6f7ff',
        border: '1px solid #91d5ff',
        borderRadius: '20px',
        padding: '8px 15px',
        cursor: 'pointer',
        color: '#0050b3',
        fontWeight: 'bold',
      };
    case 'Lists':
      return {
        ...baseStyle,
        background: '#f6ffed',
        borderLeft: '3px solid #b7eb8f',
        borderRadius: '0 6px 6px 0',
        paddingLeft: '15px',
        color: '#389e0d',
      };
    case 'Variables':
      return {
        ...baseStyle,
        ...(errors[index] ? highlightErrorStyle : {}),
      };
    default:
      return baseStyle;
  }
};

return (
  <NodeWrapper style={{ background: '#fff5f5', borderColor: '#ffa39e' }} type="askQuestion">
      <Handle type="target"  style={{
                        top: '50%',
                        right: '-10px',
                        background: '#784212',
                        width: '12px',
                        height: '12px',
                    }} position={Position.Left} isConnectable={isConnectable} />
      <h3 style={{ marginBottom: '15px', color: '#cf1322' }}>Ask Question</h3>
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
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', position: 'relative' }}>
              <input
                  style={getOptionStyle(optionType)}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`${optionType === 'Buttons' ? 'Button' : optionType === 'Lists' ? 'List item' : 'Variable'} ${index + 1}`}
              />
               {optionType === 'Variables' && (
            <select
              value={dataTypes[index] || ''}
              onChange={(e) => handleDataTypeChange(index, e.target.value)}
              style={{
                ...selectStyles,
                width: '40%',
                marginLeft: '10px',
                ...(errors[index] ? highlightErrorStyle : {}),
              }}
            >
              <option value="">Select Type</option>
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="date">Date</option>
            </select>
          )}
              <FaMinus onClick={() => removeOption(index)} style={{ ...iconStyles, color: '#ff4d4f', marginLeft: '10px' }} />
                 {errors[index] && <div style={errorStyles}>{errors[index]}</div>}
              {(optionType === 'Buttons' || optionType === 'Lists') && (
                  <Handle
                      type="source"
                      position={Position.Right}
                      id={`option-${index}`}
                      style={{
                        
                          top: '50%',
                          right: '-25px',
                          background: '#722ed1',
                          width: '12px',
                          height: '12px',
                      }}
                      isConnectable={isConnectable}
                  />
              )}
          </div>
      ))}
      <button style={{ ...buttonStyles, background: '#ff7a45', display: optionType === 'Variables' && options.length >= 1 ? 'none' : 'inline-flex' }}   disabled={optionType === 'Variables' && options.length >= 1} onClick={addOption}>
          <FaPlus style={{ marginRight: '5px' }} /> Add Option
      </button>
      {optionType === 'Variables' && (
          <Handle type="source"  style={{
                        
            // top: '50%',
            // right: '-10px',
            // background: '#784212',
            width: '12px',
            height: '12px',
        }} position={Position.Right} isConnectable={isConnectable} />
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
    <NodeWrapper style={{ background: '#e6fffb', borderColor: '#87e8de' }} type="sendMessage">
      <Handle type="target"  style={{
                        
                        top: '50%',
                        right: '-10px',
                        background: '#784212',
                        width: '12px',
                        height: '12px',
                    }} position={Position.Left} isConnectable={isConnectable} />
      <h3 style={{ marginBottom: '15px', color: '#006d75' }}>Send Message</h3>
      {fields.map((field, index) => (
        <div key={index} style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <select 
              value={field.type} 
              onChange={(e) => updateField(index, { type: e.target.value, content: '' })}
              style={{ ...selectStyles, width: '40%', marginRight: '10px' , color:'black' }}
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
      <Handle type="source"  style={{
                        
                        top: '50%',
                        right: '-10px',
                        background: '#784212',
                        width: '12px',
                        height: '12px',
                    }} position={Position.Right} isConnectable={isConnectable} />
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
    <NodeWrapper style={{ background: '#f9f0ff', borderColor: '#d3adf7' }} type="setCondition">
      <Handle type="target"  style={{
                        
                        top: '50%',
                        right: '-10px',
                        background: '#784212',
                        width: '12px',
                        height: '12px',
                    }} position={Position.Left} isConnectable={isConnectable} />
      <h3 style={{ marginBottom: '15px', color: '#531dab' }}>Set Condition</h3>
      <textarea
        style={textAreaStyles}
        value={condition}
        onChange={handleConditionChange}
        placeholder="Enter condition"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
        <div style={{ background: '#d9f7be', padding: '5px 10px', borderRadius: '4px', color: '#389e0d' }}>True</div>
        <div style={{ background: '#ffccc7', padding: '5px 10px', borderRadius: '4px', color: '#cf1322' }}>False</div>
      </div>
      <Handle type="source"  position={Position.Right} id="true" isConnectable={isConnectable}  style={{ top: '50%', background: '#389e0d',
                        right: '-5px',
                        width: '12px',
                        height: '12px', }} />
      <Handle type="source" position={Position.Right} id="false" isConnectable={isConnectable}  style={{ top: '80%', background: '#cf1322', right: '-5px',
                        width: '12px',
                        height: '12px', }} />
    </NodeWrapper>
  );
};