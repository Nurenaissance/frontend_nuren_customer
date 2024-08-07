const initialNodes = [
  {
    id: '1',
    type: 'customNode',
    position: { x: 0, y: 150 },
    data: {
      heading: 'Start',
      content: 'Begin conversation',
      headbg: '#4CAF50'
    }
  },
  {
    id: '2',
    type: 'sendMessage',
    position: { x: 250, y: 0 },
    data: {
      heading: 'Welcome',
      message: 'Hello! Welcome to our service.'
    }
  },
  {
    id: '3',
    type: 'askQuestion',
    position: { x: 500, y: 150 },
    data: {
      heading: 'User Input',
      message: 'What can I help you with today?'
    }
  },
  {
    id: '4',
    type: 'setCondition',
    position: { x: 750, y: 150 },
    data: {
      heading: 'Check Input',
      variable1: 'user_input',
      conditionType: 'Contains',
      variable2: 'order'
    }
  },
  {
    id: '5',
    type: 'sendMessage',
    position: { x: 1000, y: 0 },
    data: {
      heading: 'Order Info',
      message: 'Please provide your order number.'
    }
  },
  {
    id: '6',
    type: 'sendMessage',
    position: { x: 1000, y: 300 },
    data: {
      heading: 'General Help',
      message: "What specific information do you need?"
    }
  },
  {
    id: '7',
    type: 'customNode',
    position: { x: 1250, y: 150 },
    data: {
      heading: 'End',
      content: 'Conversation ended',
      headbg: '#f44336'
    }
  }
];


export default  initialNodes;