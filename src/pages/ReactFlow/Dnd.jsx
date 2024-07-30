import React, { useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";
import { CustomNode, TextUpdaterNode,ButtonNode,SendMessage,AskQuestion,SetCondition } from './TextUpdaterNode';
import axios from 'axios';
import './dnd.css'; 
import { useNodeActions } from './UseNodeActions';
import { useMemo } from 'react';

// const lastNode = initialNodes[initialNodes.length - 1];
import Sidebar from "./Sidebar";

import "./dnd.css";
// import initialNodes from "./nodes.jsx";

// import initialEdges from "./edges.jsx";
import axiosInstance from "../../api.jsx";

// Extract the id property from the last node
// let id = parseInt(lastNode.id) +1;
//let id = 10+1;


const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Input Node' },
    position: { x: 250, y: 25 },
  },
];

const initialEdges = [];

let id = 2;

const getId = () => `${id++}`;

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; 
};

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const tenantId=getTenantIdFromUrl();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [editValue, setEditValue] = useState('');
  const [title, setTitle] = useState('');
  const [id, setId] = useState();
  const [selectNodeId, setSelectedNodeId] = useState();
  // const [showSetCondition, setShowSetCondition] = useState(false);
  // const [selectedValueOption, setSelectedValueOption]=useState();
  const { handleCopyNode, handleDeleteNode } = useNodeActions(setNodes, setEdges);
  const { templateId } = useParams();
  const location = useLocation();

  const nodeTypes = useMemo(() => ({ 
    textUpdater: TextUpdaterNode,
    customNode: CustomNode,
    buttonNode: ButtonNode,
    sendMessage: SendMessage,
    askQuestion: AskQuestion,
    setCondition: SetCondition
  }), []);



  const handleTemplateSelect = (templateId) => {
    navigate(`/${tenantId}/flow/${templateId}`);
  };

  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId);
    }
  }, [templateId]);

  const fetchTemplate = async (id) => {
    try {
      const response = await axiosInstance.get(`/node-templates/${id}/`);
      console.log('Template response:', response.data);
      const template = response.data;
      if (template && template.node_data) {
        const { nodes: templateNodes, adjacencyList } = template.node_data;
        
        // Transform nodes to ReactFlow format
        const transformedNodes = templateNodes.map(node => ({
          id: node.id.toString(),
          type: node.type,
          data: node.data,
          position: node.position || { x: Math.random() * 500, y: Math.random() * 500 },
        }));
  
        // Transform adjacencyList to edges
        const transformedEdges = [];
        adjacencyList.forEach((targets, sourceIndex) => {
          targets.forEach(target => {
            transformedEdges.push({
              id: `e${sourceIndex}-${target}`,
              source: sourceIndex.toString(),
              target: target.toString(),
            });
          });
        });

        setNodes(transformedNodes);
        setEdges(transformedEdges);
      }
    } catch (error) {
      console.error("Error fetching template:", error);
    }
  };


  const onNodedoubleClick = (e, val) => {
    setTitle(val.data?.heading || '');
    setEditValue(val.data?.content || '');
    setId(val.id);
  };
  const onNodeClick = (e, node) => {
    setSelectedNodeId(node.id);
    setSelectedValueOption(node.data.selectedOption); 
    let action = node.data.selectedOption;

    if (action === 'edit') {
      handleEdit();
    } else if (action === 'delete') {
      handleDeleteNode(node.id);
    } else if (action === 'copy') {
      handleCopyNode(node.id);
    } else {
      console.log('No action selected');
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setEditValue(e.target.value);
  };
  const handleTitleChange = (e) => {
    e.preventDefault();
    setTitle(e.target.value);
  };
  const handleEdit = () => {
    const res = nodes.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          data: {
            ...item.data,
            content: editValue,
            heading: title,
          }
        };
      }
      return item;
    });
    setNodes(res);
    
    setEditValue("");
    setTitle("");
  };


  const handleTitleEdit = () => {
    const res = nodes.map((item) => {
      if (item.id === id) {
        item.data = {
          ...item.data,
          heading: title,
        };
      }
      return item;
    });
    setNodes(res);
    setTitle("");
  };
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
  
      const type = event.dataTransfer.getData("application/reactflow");
  
      if (typeof type === "undefined" || !type) {
        return;
      }
  
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
  
      let newData;
      if (type === "customNode") {
        newData = {
          heading: "Custom Node Title",
          content: "Custom Node Content",
        };
      } 
      else if (type === "textUpdater") {
        newData = {
          heading: "Title",
          content: "Content",
        };
      } else {
        newData = {
          label: `${type} node`,
        };
      }
  
      const newNode = {
        id: getId(),
        type,
        position,
        data: newData,
      };
  
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );



  

// const sendDataToBackend = () => {
//   const formattedNodes = nodes.map((node) => ({
//     id: parseInt(node.id),
//     type: node.type,
//     data: node.data,
//   }));

//   const adjacencyList = edges.reduce((adjList, edge) => {
//     const { source, target } = edge;
//     if (!adjList[source]) {
//       adjList[parseInt(source)] = [];
//     }
//     adjList[parseInt(source)].push(parseInt(target));
//     return adjList;
//   }, {});

//   const adjacencyListAsList = Object.values(adjacencyList).map((targets) => [
//     ...targets,
//   ]);

//   const headers = {
//     "Content-Type": "application/json",
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": 'GET,PUT,POST,DELETE,OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept'
//   };

//   axiosInstance
//     .post(
//       "https://webappbaackend.azurewebsites.net/node-templates/",
//       {
//         name: "Flow Template Name",
//         description: "Description of the flow template",
//         category: "Category",
//         createdBy: 1, // Replace with the actual user ID if needed
//         node_data: {
//           nodes: formattedNodes,
//           adjacencyList: adjacencyListAsList,
//         },
//       },
//       { headers }
//     )
//     .then((response) => {
//       console.log('this is flow response',response.data);
//       navigate(`/${tenantId}/chatbot`)
//     })
//     .catch((error) => {
//       console.error("Error sending data to backend:", error);
//     });
// };


const sendDataToBackend = () => {
  const formattedNodes = nodes.map((node) => ({
    id: parseInt(node.id),
    type: node.type,
    data: node.data,
  }));

  const adjacencyList = edges.reduce((adjList, edge) => {
    const { source, target } = edge;
    if (!adjList[source]) {
      adjList[parseInt(source)] = [];
    }
    adjList[parseInt(source)].push(parseInt(target));
    return adjList;
  }, {});

  const adjacencyListAsList = Object.values(adjacencyList).map((targets) => [
    ...targets,
  ]);

  const data = {
    name: "Flow Template Name",
    description: "Description of the flow template",
    category: "Category",
    createdBy: 1, // Replace with the actual user ID if needed
    node_data: {
      nodes: formattedNodes,
      adjacencyList: adjacencyListAsList,
    },
  };

  const url = templateId 
    ? `https://webappbaackend.azurewebsites.net/node-templates/${templateId}/`
    : "https://webappbaackend.azurewebsites.net/node-templates/";

  const method = templateId ? 'put' : 'post';

  axiosInstance[method](url, data)
    .then((response) => {
      console.log('Flow response:', response.data);
      navigate(`/${tenantId}/chatbot`);
    })
    .catch((error) => {
      console.error("Error sending data to backend:", error);
    });
};


  console.log('Nodes:', nodes); // Log nodes
  console.log('Edges:', edges);
  
  const handleNodeDelete = (nodeId) => {
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
    setEdges(prevEdges => prevEdges.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  };


  // const handleCopyNode = (nodeId) => {
  //   const selectedNode = nodes.find((node) => node.id === nodeId);
  //   if (selectedNode) {
  //     const copiedNode = {
  //       ...selectedNode,
  //       id: getId(), // Use your existing getId function
  //       position: {
  //         x: selectedNode.position.x + 100,
  //         y: selectedNode.position.y + 100
  //       }
  //     };
  //     setNodes(prevNodes => [...prevNodes, copiedNode]);
  //   }
  // };  



 
 
  return (
    <div className="dndflow">
      <div className="updatenode">
       </div>
      <Sidebar />
      <button class="send-button" onClick={sendDataToBackend}>Send Data to Backend</button>
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  onInit={setReactFlowInstance}
  onDrop={onDrop}
  onDragOver={onDragOver}
  onNodeDoubleClick={onNodedoubleClick}
  onNodeClick={onNodeClick}
  fitView
>
            <Controls />
            <MiniMap />
            <Background />
            
          </ReactFlow>
        </div>  
      </ReactFlowProvider>
      
      
    </div>
    
  );
};

  

export default DnDFlow;
