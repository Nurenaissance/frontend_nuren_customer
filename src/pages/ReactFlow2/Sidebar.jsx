import React from 'react';
import { Send, HelpOutline, QuestionAnswer, Chat, Menu, ViewModule } from '@mui/icons-material';
import './sidebar.css';

const SidebarFlow2 = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const sidebarStyles = {
    animation: 'openSideBar 200ms ease-in',
    background: 'linear-gradient(to left, #f0f0f0, #e0e0e0)',
    height: '100vh',
    padding: '1rem',
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

  const nodeStyles = {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    margin: '0.5rem 0',
    borderRadius: '5px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    color: '#fff',
  };

  const iconStyles = {
    fontSize: '2rem',
    marginRight: '1rem',
  };

  const nodes = [
    {
      className: 'Send-Message-Node-flow',
      nodeType: 'sendMessage',
      icon: <Send style={iconStyles} />,
      title: 'Send a Message',
      description: 'Sends text, images, lists, documents, audio',
      color: '#e76f51',
    },
    {
      className: 'Ask-Question-Node-flow',
      nodeType: 'askQuestion',
      icon: <HelpOutline style={iconStyles} />,
      title: 'Ask a Question',
      description: 'Use me to ask questions from clients. We can store data and use it for later processing',
      color: '#2a9d8f',
    },
    {
      className: 'Condition-Node-flow',
      nodeType: 'setCondition',
      icon: <QuestionAnswer style={iconStyles} />,
      title: 'Set a Condition',
      description: 'Make creative user journeys by giving them a choice',
      color: '#f4a261',
    },
    {
      className: 'Ice-Breaker-Node-flow',
      nodeType: 'iceBreaker',
      icon: <Chat style={iconStyles} />,
      title: 'Ice Breakers',
      description: 'Start conversations in a friendly way',
      color: '#e9c46a',
    },
    {
      className: 'Persistent-Menu-Node-flow',
      nodeType: 'persistentMenu',
      icon: <Menu style={iconStyles} />,
      title: 'Persistent Menu',
      description: 'Keep a menu visible to the user at all times',
      color: '#264653',
    },
    {
      className: 'Generic-Template-Node-flow',
      nodeType: 'genericTemplate',
      icon: <ViewModule style={iconStyles} />,
      title: 'Generic Template',
      description: 'Use a standard template for messages',
      color: '#8d99ae',
    },
  ];

  return (
    <aside style={sidebarStyles}>
      <div style={sidebarHeaderStyles}>
        <h1 style={headerTextStyles}>Add Nodes</h1>
      </div>
      {nodes.map(({ className, nodeType, icon, title, description, color }) => (
        <div
          key={nodeType}
          className={className}
          onDragStart={(event) => onDragStart(event, nodeType)}
          draggable
          style={{ ...nodeStyles, backgroundColor: color }}
        >
          {icon}
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>
      ))}
    </aside>
  );
};

export default SidebarFlow2;
