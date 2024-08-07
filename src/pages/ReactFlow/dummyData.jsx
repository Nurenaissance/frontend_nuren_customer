export const dummyFlowData = {
    name: "Sample Flow Template",
    description: "A sample flow template with various node types",
    category: "Demo",
    createdBy: 1,
    node_data: {
      nodes: [
        {
          id: 1,
          type: 'customNode',
          data: {
            heading: "Welcome Message",
            content: "Hello! Welcome to our chatbot.",
            headbg: "#4CAF50"
          },
          position: { x: 250, y: 25 }
        },
        {
          id: 2,
          type: 'sendMessage',
          data: {
            label: "Send Initial Message",
            content: "How can I assist you today?"
          },
          position: { x: 250, y: 150 }
        },
        {
          id: 3,
          type: 'askQuestion',
          data: {
            label: "User Inquiry",
            content: "What would you like to know more about?",
            options: ["Products", "Services", "Support"]
          },
          position: { x: 250, y: 300 }
        },
        {
          id: 4,
          type: 'setCondition',
          data: {
            label: "Check User Response",
            variable1: "user_choice",
            conditionType: "Equal to",
            variable2: "Products"
          },
          position: { x: 250, y: 450 }
        },
        {
          id: 5,
          type: 'sendMessage',
          data: {
            label: "Product Information",
            content: "Here's some information about our products..."
          },
          position: { x: 100, y: 600 }
        },
        {
          id: 6,
          type: 'sendMessage',
          data: {
            label: "Other Information",
            content: "For other inquiries, please contact our support team."
          },
          position: { x: 400, y: 600 }
        }
      ],
      adjacencyList: [
        [2],      // Node 1 connects to Node 2
        [3],      // Node 2 connects to Node 3
        [4],      // Node 3 connects to Node 4
        [5, 6],   // Node 4 connects to Node 5 and Node 6
        [],       // Node 5 has no outgoing connections
        []        // Node 6 has no outgoing connections
      ]
    }
  };