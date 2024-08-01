import { Handle, Position } from 'reactflow';
import React, { useState, useCallback } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import './customnode.css';
const handleStyle = { left: 0 };



export const CustomNode = ({ data, handleNodeDelete, onNodeClick, onCopy, onDelete, }) => {
  return (
    <div
      style={{
        width: "200px",
        border: "2px solid #ddd",
        textAlign: "center",
        borderRadius: "5px",
        padding: "0px",
      }}
    >
       <div style={{ position: "absolute", top: "5px", right: "5px", zIndex: 10 }}>
        <IconButton onClick={() => onCopy(id)} size="small">
          <ContentCopyIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={() => onDelete(id)} size="small">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </div>
      <div style={{ backgroundColor: data.headbg, padding: "5px", color: 'white' }}>
        <h3>{data.heading}</h3>
      </div>
      <div style={{ padding: "10px", fontWeight: "500", backgroundColor: "white" }}>
        <p>{data.content}</p>
      </div>
      <Handle type="source" position={Position.Bottom} id={data.id} />
      <Handle type="target" position={Position.Top} id={data.id} />
      <Handle type="target" position={Position.Top} id={data.id} />
    </div>
  );
};

export const TextUpdaterNode = ({ data, isConnectable }) => {
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="text-updater-node">
      <div style={{ position: "absolute", top: "5px", right: "5px", zIndex: 10 }}>
        <IconButton onClick={() => onCopy(id)} size="small">
          <ContentCopyIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={() => onDelete(id)} size="small">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </div>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div style={{ backgroundColor:'pink'}}>
    <h3 style={{ backgroundColor:'#feedcf',fontSize: '18px', color: 'blue' }}>{data.heading}</h3>
    <label htmlFor="text" style={{ fontSize: '14px', color: 'black' }}>Text:</label>
    <input id="text" name="text" onChange={onChange} className="nodrag" style={{ width: '100%', padding: '5px' }} />
    <p style={{ fontSize: '16px', color: 'green' }}>{data.content}</p>
  </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={handleStyle}
        isConnectable={isConnectable}
      />
      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
};


export const ButtonNode = ({ isConnectable }) => {
  const [buttons, setButtons] = useState([]);

  const handleAddButton = useCallback(() => {
    const newButtonId = buttons.length + 1; // Generate unique ID for the button
    const newButton = { id: newButtonId, label: `Button ${newButtonId}` };
    setButtons([...buttons, newButton]);
  }, [buttons]);

  const handleButtonClick = useCallback((buttonId) => {
    console.log(`Button ${buttonId} clicked`);
    // Add your button click logic here
  }, []);

  return (
    <div className="button-node">
      <div style={{ position: "absolute", top: "5px", right: "5px", zIndex: 10 }}>
        <IconButton onClick={() => onCopy(id)} size="small">
          <ContentCopyIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={() => onDelete(id)} size="small">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </div>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        <p>Button Node</p>
        <div>
          {buttons.map((button) => (
            <div key={button.id}>
              <button onClick={() => handleButtonClick(button.id)}>{button.label}</button>
              <Handle type="source" position={Position.Bottom} id={`button-${button.id}`} style={handleStyle} isConnectable={isConnectable} />
            </div>
          ))}
          <button onClick={handleAddButton} style={{}}>Add +</button> {/* Button to add new buttons */}
        </div>
      </div>
      {buttons.map((button) => (
            <Handle type="source" position={Position.Right} id={`button${button.id}`} style={handleStyle} isConnectable={isConnectable} />
          ))}
      <Handle type="source" position={Position.Bottom} id="a" style={handleStyle} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
};



export const SendMessage = ({ isConnectable, onDelete, id }) => {
  const [contentHistory, setContentHistory] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleOptionClick = (option) => {
    setContentHistory((prevContent) => [...prevContent, { type: option, id: Date.now() }]);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages(prevImages => [...prevImages, { url: e.target.result, id: Date.now() }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (id) => {
    setUploadedImages(prevImages => prevImages.filter(image => image.id !== id));
  };

  const handleDeleteContent = (id) => {
    setContentHistory(prevContent => prevContent.filter(content => content.id !== id));
  };

  const renderContent = (content) => {
    switch (content.type) {
      case 'message':
        return (
          <div key={content.id} style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
            <input 
              style={{
                height:'3rem',
                borderRadius:'5px', 
                width:'100%', 
                paddingLeft:'1rem', 
              }} 
              type="text" 
              placeholder="Enter your message..." 
            />
            <IconButton onClick={() => handleDeleteContent(content.id)}>
              <DeleteIcon />
            </IconButton>
          </div>
        );
      case 'image':
        return (
          <div key={content.id} style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              style={{display: 'none'}} 
              id={`image-upload-${content.id}`}
            />
            <label htmlFor={`image-upload-${content.id}`} style={{
              display: 'inline-block',
              padding: '10px 15px',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '5px',
            }}>
              Upload Image
            </label>
            <IconButton onClick={() => handleDeleteContent(content.id)}>
              <DeleteIcon />
            </IconButton>
          </div>
        );
      case 'document':
        return (
          <div key={content.id} style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <input type="file" accept=".pdf,.docx,.xlsx" />
            <button>Upload Document</button>
            <IconButton onClick={() => handleDeleteContent(content.id)}>
              <DeleteIcon />
            </IconButton>
          </div>
        );
      case 'audio':
        return (
          <div key={content.id} style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <input type="file" accept="audio/*" />
            <button>Upload Audio</button>
            <IconButton onClick={() => handleDeleteContent(content.id)}>
              <DeleteIcon />
            </IconButton>
          </div>
        );
      case 'video':
        return (
          <div key={content.id} style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <input type="file" accept="video/*" />
            <button>Upload Video</button>
            <IconButton onClick={() => handleDeleteContent(content.id)}>
              <DeleteIcon />
            </IconButton>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{border:'2px black solid', backgroundColor:'#FF7A59', borderRadius:'8px', padding:'1rem', position: 'relative' }}>
      <div style={{ position: "absolute", top: "5px", right: "5px", zIndex: 10 }}>
        <IconButton size="small">
          <ContentCopyIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={() => onDelete(id)} size="small">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          background: '#555',
          width: '12px',
          height: '12px',
          border: '2px solid #fff',
        }}
      />
      <h1 style={{ fontSize: '28px', color:'white', borderRadius: '5px' }}>
        Send Message
      </h1>
      <div>
        <button className="send-message-button" onClick={() => handleOptionClick('message')}>
          Message
        </button>
        <button className="send-message-button" onClick={() => handleOptionClick('image')}>
          Image
        </button>
        <button className="send-message-button" onClick={() => handleOptionClick('document')}>
          Document
        </button>
        <br />
        <button className="send-message-button" onClick={() => handleOptionClick('audio')}>
          Audio
        </button>
        <button className="send-message-button" onClick={() => handleOptionClick('video')}>
          Video
        </button>
      </div>
      {contentHistory.map(content => renderContent(content))}
      {uploadedImages.length > 0 && (
        <div style={{marginTop: '10px'}}>
          {uploadedImages.map((image) => (
            <div key={image.id} style={{ position: 'relative', display: 'inline-block', margin: '5px' }}>
              <img src={image.url} alt="Uploaded Image" style={{
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'cover',
                borderRadius: '8px'
              }} />
              <IconButton 
                onClick={() => handleDeleteImage(image.id)} 
                style={{ 
                  position: 'absolute', 
                  top: '5px', 
                  right: '5px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.7)' 
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </div>
          ))}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ right: -5, top: '50%' ,
          background: '#555',
          width: '12px',
          height: '12px',
          border: '2px solid #fff',
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

const AskQuestionPopup = ({ onSave, onCancel }) => {
  const [question, setQuestion] = useState('');
  const [answerVariants, setAnswerVariants] = useState(['']);

  const handleAddAnswer = () => {
    setAnswerVariants([...answerVariants, '']);
  };

  const handleAnswerChange = (index, value) => {
    const updatedVariants = [...answerVariants];
    updatedVariants[index] = value;
    setAnswerVariants(updatedVariants);
  };

  const handleSave = () => {
    onSave({ question, answerVariants });
    setQuestion('');
    setAnswerVariants(['']);
  };

  return (
    <div className="askQuestionpopup">
      <h2>Ask a Question</h2>
      <input
        type="text"
        placeholder="Enter your question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <h3>Answer Variants:</h3>
      {answerVariants.map((variant, index) => (
        <input
          key={index}
          type="text"
          placeholder={`Enter answer variant ${index + 1}`}
          value={variant}
          onChange={(e) => handleAnswerChange(index, e.target.value)}
        />
      ))}
      <button onClick={handleAddAnswer}>Add Answer Variant</button>
      <div>
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};



export const AskQuestion = ({ data, isConnectable }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [askButtons, setAskButtons] = useState([]);
  const [listItems, setListItems] = useState(['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4']);
  const [variables, setVariables] = useState([]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleButtonLabelChange = (index, newLabel) => {
    setAskButtons(prevButtons => 
      prevButtons.map((button, i) => i === index ? { ...button, label: newLabel } : button)
    );
  };

  const handleDeleteButton = (index) => {
    setAskButtons(prevButtons => prevButtons.filter((_, i) => i !== index));
  };

  const handleAddButton = useCallback(() => {
    if (askButtons.length < 3) {
      const newButtonId = askButtons.length + 1;
      const newButton = { id: newButtonId, label: `Button ${newButtonId}` };
      setAskButtons(prevButtons => [...prevButtons, newButton]);
    }
  }, [askButtons]);

  const handleListItemChange = (index, newValue) => {
    setListItems(prevItems => 
      prevItems.map((item, i) => i === index ? newValue : item)
    );
  };

  const handleAddListItem = () => {
    setListItems(prevItems => [...prevItems, `New Choice ${prevItems.length + 1}`]);
  };

  const handleDeleteListItem = (index) => {
    setListItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  const handleAddVariable = () => {
    setVariables(prevVars => [...prevVars, { name: '', value: '' }]);
  };

  const handleVariableChange = (index, field, value) => {
    setVariables(prevVars => 
      prevVars.map((variable, i) => i === index ? { ...variable, [field]: value } : variable)
    );
  };

  const handleDeleteVariable = (index) => {
    setVariables(prevVars => prevVars.filter((_, i) => i !== index));
  };

  const handleEdit = (type, index) => {
    console.log(`Editing ${type} at index ${index}`);
    // Implement edit functionality
  };

  const handleCopy = (type, index) => {
    console.log(`Copying ${type} at index ${index}`);
    // Implement copy functionality
  };

  return (
    <div className="askQuestion-node" style={{border:'2px black solid', backgroundColor:'#FFBA49', borderRadius:'8px', padding:'1rem'}}>
      <div style={{ position: "absolute", top: "5px", right: "5px", zIndex: 10 }}>
        <IconButton onClick={() => onCopy(id)} size="small">
          <ContentCopyIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={() => onDelete(id)} size="small">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: '12px', height: '12px', border: '2px solid #fff' }}
        isConnectable={isConnectable}
      />
      
      <h1 style={{ fontSize: '28px', color:'white', borderRadius: '5px' }}>Ask Question</h1>

      {selectedOption === null && (
        <div>
          <h3>Choose Type</h3>
          <button className='ask-question-button' onClick={() => handleOptionClick('buttons')}>Buttons</button>
          <button className='ask-question-button' onClick={() => handleOptionClick('lists')}>Lists</button>
          <button className='ask-question-button' onClick={() => handleOptionClick('variables')}>Variables</button>
        </div>
      )}

      {selectedOption === 'buttons' && (
        <div>
          <input style={{width:'100%', height:'4rem'}} type="text" placeholder='Here is a space for you to ask a question' />
          {askButtons.map((button, index) => (
            <div key={button.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', position:'relative' }}>
              <input
                type="text"
                value={button.label}
                onChange={(e) => handleButtonLabelChange(index, e.target.value)}
                className='ask-question-option-button'
              />
              <IconButton onClick={() => handleEdit('button', index)}><EditIcon /></IconButton>
              <IconButton onClick={() => handleCopy('button', index)}><ContentCopyIcon /></IconButton>
              <IconButton onClick={() => handleDeleteButton(index)}><DeleteIcon /></IconButton>
              <Handle 
                type="source" 
                position={Position.Right} 
                id={`button-${button.id}`}  
                style={{position: 'absolute', right: -10, top: '50%', background: 'white', width: '12px', height: '12px', border: '2px solid #fff' }}
                isConnectable={isConnectable} 
              />
            </div>
          ))}
          {askButtons.length < 3 && (
            <button onClick={handleAddButton} style={{border:'1px blue solid', borderRadius:'6px', backgroundColor:'green', padding:'1rem', color:'white'}}>Add +</button>
          )}
        </div>
      )}

      {selectedOption === 'lists' && (
        <div >
          <input style={{width:'100%', height:'4rem'}} type="text" placeholder='Here is a space for you to ask a question' />
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {listItems.map((item, index) => (
              <li key={index} className='question-li' style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', backgroundColor: '#feedcf', borderColor: 'blue', borderWidth: '1px', borderRadius: '5px', padding: '10px',position:'relative' }}>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleListItemChange(index, e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <IconButton onClick={() => handleEdit('list', index)}><EditIcon /></IconButton>
                <IconButton onClick={() => handleCopy('list', index)}><ContentCopyIcon /></IconButton>
                <IconButton onClick={() => handleDeleteListItem(index)}><DeleteIcon /></IconButton>
                <Handle 
                  type="source" 
                  position={Position.Right} 
                  id={`list-${index}`}  
                  style={{position:'absolute', right: -5, top: '50%', background: '#555', width: '12px', height: '12px', border: '2px solid #fff' }}
                  isConnectable={isConnectable} 
                />
              </li>
            ))}
          </ul>
          <button onClick={handleAddListItem} style={{border:'1px blue solid', borderRadius:'6px', backgroundColor:'green', padding:'1rem', color:'white'}}>Add New Choice</button>
        </div>
      )}

      {selectedOption === 'variables' && (
        <div>
          <input style={{width:'100%', height:'4rem'}} type="text" placeholder='Here is a space for you to ask a question' />
          {variables.map((variable, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Variable name"
                value={variable.name}
                onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                style={{ marginRight: '10px' }}
              />
              <input
                type="text"
                placeholder="Variable value"
                value={variable.value}
                onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                style={{ marginRight: '10px' }}
              />
              <IconButton onClick={() => handleEdit('variable', index)}><EditIcon /></IconButton>
              <IconButton onClick={() => handleCopy('variable', index)}><ContentCopyIcon /></IconButton>
              <IconButton onClick={() => handleDeleteVariable(index)}><DeleteIcon /></IconButton>
              <Handle 
                type="source" 
                position={Position.Right} 
                id={`variable-${index}`}  
                style={{ right: -5, top: '50%', background: '#555', width: '12px', height: '12px', border: '2px solid #fff' }}
                isConnectable={isConnectable} 
              />
            </div>
          ))}
          <button onClick={handleAddVariable} style={{border:'1px blue solid', borderRadius:'6px', backgroundColor:'green', padding:'1rem', color:'white'}}>Add Variable</button>
        </div>
      )}
    </div>
  );
};




const Popup = ({ variable1, handleVariable1Change, conditionType, handleConditionTypeChange, variable2, handleVariable2Change, handleEditSave, handleEditCancel }) => (
  <div className="setCondition-popup" style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    // maxWidth: '200px',
    width: '200%',
    display:'flex',
    // maxHeight: '400%',
    overflowY: 'auto'
  }}>
    <div className="setCondition-popup-content">
      <div className="input-group" style={{ marginBottom: '15px' }}>
        <label htmlFor="variable1" style={{ display: 'block', marginBottom: '5px' }}>Variable 1:</label>
        <input id="variable1" type="text" value={variable1} onChange={handleVariable1Change} style={{ width:'50%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
      </div>
      <div className="input-group" style={{ marginBottom: '15px' }}>
        <label htmlFor="conditionType" style={{ display: 'block', marginBottom: '5px' }}>Condition Type:</label>
        <select id="conditionType" value={conditionType} onChange={handleConditionTypeChange} style={{ width:'50%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="Equal to">Equal to</option>
          <option value="Not Equal To">Not Equal To</option>
          <option value="Contains">Contains</option>
          <option value="Does not contain">Does not contain</option>
          <option value="Starts With">Starts With</option>
          <option value="Does not start with">Does not start with</option>
          <option value="Greater Than">Greater Than</option>
          <option value="Less Than">Less Than</option>
        </select>
      </div>
      <div className="input-group" style={{ marginBottom: '15px' }}>
        <label htmlFor="variable2" style={{ display: 'block', marginBottom: '5px' }}>Variable 2:</label>
        <input id="variable2" type="text" value={variable2} onChange={handleVariable2Change} style={{ width: '50%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="save" onClick={handleEditSave} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
        <button className='cancel' onClick={handleEditCancel} style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  </div>
);


export const SetCondition = ({ data, isConnectable }) => {
  const [variable1, setVariable1] = useState(data.variable1 || '');
  const [conditionType, setConditionType] = useState(data.conditionType || '');
  const [variable2, setVariable2] = useState(data.variable2 || '');
  const [isValid, setIsValid] = useState(false);
  const [selectedValue, setSelectedValue] = useState(data.selectedOption || '');
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleVariable1Change = useCallback((e) => {
    setVariable1(e.target.value);
  }, []);

  const handleConditionTypeChange = useCallback((e) => {
    setConditionType(e.target.value);
  }, []);

  const handleVariable2Change = useCallback((e) => {
    setVariable2(e.target.value);
    setIsValid(validateCondition(variable1, conditionType, e.target.value));
  }, [variable1, conditionType]);

  const validateCondition = useCallback((var1, condition, var2) => {
    const value1 = var1.toLowerCase();
    const value2 = var2.toLowerCase();
  
    switch (condition) {
      case 'Equal to':
        return value1 === value2;
      case 'Not Equal To':
        return value1 !== value2;
      case 'Contains':
        return value1.includes(value2);
      case 'Does not contain':
        return !value1.includes(value2);
      case 'Starts With':
        return value1.startsWith(value2);
      case 'Does not start with':
        return !value1.startsWith(value2);
      case 'Greater Than':
        return parseFloat(value1) > parseFloat(value2);
      case 'Less Than':
        return parseFloat(value1) < parseFloat(value2);
      default:
        return false;
    }
  }, []);

  const handleSelectChange = useCallback((event) => {
    setSelectedValue(event.target.value);
    data.selectedOption = event.target.value;
    setIsOpen(false);
    if (event.target.value === "edit") {
      handleEditClick();
    }
  }, [data]);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleEditSave = useCallback(() => {
    setIsEditing(false);
    // Update the data object with new values
    data.variable1 = variable1;
    data.conditionType = conditionType;
    data.variable2 = variable2;
    setIsValid(validateCondition(variable1, conditionType, variable2));
  }, [data, variable1, conditionType, variable2, validateCondition]);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    // Reset to original values
    setVariable1(data.variable1 || '');
    setConditionType(data.conditionType || '');
    setVariable2(data.variable2 || '');
  }, [data]);

  return (
    <div>
      <div style={{border:'2px black solid', backgroundColor:'#49B2FF', borderRadius:'8px', padding:'1rem'}}>
      <div style={{ position: "absolute", top: "5px", right: "5px", zIndex: 10 }}>
          <IconButton onClick={() => onCopy(id)} size="small">
            <ContentCopyIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => onDelete(id)} size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
        <h1 style={{ fontSize: '28px', color:'white', borderRadius: '5px' }}>Set Condition</h1>
        <p>{data.p}</p>
        <div className="dropdown">
            <select value={selectedValue} onChange={handleSelectChange}>
              <option value=""></option>
              <option value="edit">Edit</option>
              <option value="copy">Copy</option>
              <option value="delete">Delete</option> 
            </select>
       
        </div>
        <p style={{fontSize:'18px'}}>Condition: {variable1} <span style={{color:'red'}}>{conditionType}</span>  {variable2}</p> 
        {selectedValue === "edit" && isEditing && (
          <Popup
            variable1={variable1}
            handleVariable1Change={handleVariable1Change}
            conditionType={conditionType}
            handleConditionTypeChange={handleConditionTypeChange}
            variable2={variable2}
            handleVariable2Change={handleVariable2Change}
            handleEditSave={handleEditSave}
            handleEditCancel={handleEditCancel}
          />
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        id="true" 
        isConnectable={isConnectable} 
        style={{ backgroundColor: isValid ? 'green' : 'red', top: '25%' }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="false" 
        isConnectable={isConnectable} 
        style={{ backgroundColor: isValid ? 'red' : 'green', top: '75%' }} 
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555',
            width: '12px',
            height: '12px',
            border: '2px solid #fff',
         }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

