import React from 'react';
import { Send, HelpOutline, QuestionAnswer } from '@mui/icons-material';
import './sidebar.css';

const SidebarFlow = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const sidebarStyles = {
    animation: 'openSideBar 200ms ease-in',
    background: 'linear-gradient(to left, #f0f0f0, #e0e0e0)',
    height: '100vh',
    padding: '1rem',
    // position: 'fixed',
    left: 0,
    width: '25rem',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.2)',
    overflowY: 'auto',
    transition: 'width 200ms ease-in-out',
  };

  const sidebarHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  };

  const headerTextStyles = {
    fontSize: '24px',
    color: '#363636',
    margin: 0,
  };

  return (
    <aside style={sidebarStyles}>
      <div style={sidebarHeaderStyles}>
        <h1 style={headerTextStyles}>Add Nodes</h1>
      </div>
      <div
        className="Send-Message-Node-flow"
        onDragStart={(event) => onDragStart(event, 'sendMessage')}
        draggable
      >
        <Send className="icon" />
        <h3>Send a Message</h3>
        <p>With no response required from visitor</p>
      </div>
      <div
        className="Ask-Question-Node-flow"
        onDragStart={(event) => onDragStart(event, 'askQuestion')}
        draggable
      >
        <HelpOutline className="icon" />
        <h3>Ask a Question</h3>
        <p>Ask question and store user input in variable</p>
      </div>
      <div
        className="Condition-Node-flow"
        onDragStart={(event) => onDragStart(event, 'setCondition')}
        draggable
      >
        <QuestionAnswer className="icon" />
        <h3>Set a Condition</h3>
        <p>Send message(s) based on logical condition(s)</p>
      </div>
    </aside>
  );
};

export default SidebarFlow;
