import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import { CustomNode, TextUpdaterNode, ButtonNode, SendMessage, AskQuestion, SetCondition } from './TextUpdaterNode';
import './dnd.css'; 
import { useNodeActions } from './UseNodeActions';
import Sidebar from "./Sidebar";
import axiosInstance from "../../api.jsx";
import { dummyFlowData } from './dummyData';

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
  return pathArray.length >= 2 ? pathArray[1] : null;
};

const mapBackendDataToNodes = (backendData) => {
  if (!backendData || !backendData.node_data || !Array.isArray(backendData.node_data.nodes)) {
    console.error('Invalid backend data structure:', backendData);
    return [];
  }
  return backendData.node_data.nodes.map(item => {
    let nodeType, nodeData;

    switch (item.type) {
      case 'customNode':
        nodeType = 'customNode';
        nodeData = {
          id: item.id.toString(),
          type: 'customNode',
          data: {
            heading: item.data.heading,
            content: item.data.content,
            headbg: item.data.headbg || 'orange',
          },
          position: item.position || { x: 0, y: 0 }
        };
        break;
      case 'sendMessage':
        nodeType = 'sendMessage';
        nodeData = {
          id: item.id.toString(),
          type: 'sendMessage',
          data: {
            label: item.data.label,
            content: item.data.content
          },
          position: item.position || { x: 0, y: 0 }
        };
        break;
      case 'askQuestion':
        nodeType = 'askQuestion';
        nodeData = {
          id: item.id.toString(),
          type: 'askQuestion',
          data: {
            label: item.data.label,
            content: item.data.content,
            options: item.data.options
          },
          position: item.position || { x: 0, y: 0 }
        };
        break;
      case 'setCondition':
        nodeType = 'setCondition';
        nodeData = {
          id: item.id.toString(),
          type: 'setCondition',
          data: {
            label: item.data.label,
            variable1: item.data.variable1,
            conditionType: item.data.conditionType,
            variable2: item.data.variable2
          },
          position: item.position || { x: 0, y: 0 }
        };
        break;
      default:
        nodeType = item.type;
        nodeData = {
          id: item.id.toString(),
          type: item.type,
          data: item.data,
          position: item.position || { x: 0, y: 0 }
        };
    }

    return nodeData;
  });
};

const mapBackendDataToEdges = (backendData) => {
  return backendData.node_data.adjacencyList.flatMap((targets, sourceIndex) => 
    targets.map((target, index) => ({
      id: `e${sourceIndex + 1}-${index}`,
      source: (sourceIndex + 1).toString(),
      target: target.toString(),
    }))
  );
};

const DnDFlow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const reactFlowWrapper = useRef(null);
  const tenantId = getTenantIdFromUrl();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [title, setTitle] = useState('');
  const [editId, setEditId] = useState();
  const [selectedNodeId, setSelectedNodeId] = useState();
  const { handleCopyNode, handleDeleteNode } = useNodeActions(setNodes, setEdges);
  const location = useLocation();
  const templateId = location.state?.templateId;
  console.log("Received template ID:", templateId);

  const nodeTypes = useMemo(() => ({ 
    textUpdater: TextUpdaterNode,
    customNode: CustomNode,
    buttonNode: ButtonNode,
    sendMessage: SendMessage,
    askQuestion: AskQuestion,
    setCondition: SetCondition
  }), []);

  useEffect(() => {
    const storedData = localStorage.getItem('flowData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setNodes(mapBackendDataToNodes(parsedData));
      setEdges(mapBackendDataToEdges(parsedData));
    } else if (templateId) {
      fetchTemplate(templateId);
    } else {
      // Use dummy data if no stored data or templateId is provided
      const mappedNodes = mapBackendDataToNodes(dummyFlowData);
      const mappedEdges = mapBackendDataToEdges(dummyFlowData);
      setNodes(mappedNodes);
      setEdges(mappedEdges);
    }
  }, [templateId]);


 const fetchTemplate = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/node-templates/${id}/`);
      // const template = response.data;
      const template = dummyFlowData;
      if (template && template.node_data && Array.isArray(template.node_data.nodes)) {
        const mappedNodes = mapBackendDataToNodes(template);
        const mappedEdges = mapBackendDataToEdges(template);
        setNodes(mappedNodes);
        setEdges(mappedEdges);
      } else {
        throw new Error('Invalid template data structure');
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      setError("Failed to load template. Please try again.");
      setNodes(initialNodes);
      setEdges(initialEdges);
    } finally {
      setIsLoading(false);
    }
  };

  const onNodeDoubleClick = (e, node) => {
    setTitle(node.data?.heading || '');
    setEditValue(node.data?.content || '');
    setEditId(node.id);
  };

  const onNodeClick = (e, node) => {
    setSelectedNodeId(node.id);
    let action = node.data.selectedOption;

    if (action === 'edit') {
      handleEdit();
    } else if (action === 'delete') {
      handleDeleteNode(node.id);
    } else if (action === 'copy') {
      handleCopyNode(node.id);
    }
  };

  const handleEdit = () => {
    setNodes(nodes.map(node => 
      node.id === editId
        ? { ...node, data: { ...node.data, content: editValue, heading: title } }
        : node
    ));
    setEditValue("");
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
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const sendDataToBackend = () => {
    const formattedNodes = nodes.map(node => ({
      id: parseInt(node.id),
      type: node.type,
      data: node.data,
      position: node.position
    }));

    const adjacencyList = edges.reduce((adjList, edge) => {
      const { source, target } = edge;
      if (!adjList[parseInt(source)]) {
        adjList[parseInt(source)] = [];
      }
      adjList[parseInt(source)].push(parseInt(target));
      return adjList;
    }, {});

    const data = {
      name: "Flow Template Name",
      description: "Description of the flow template",
      category: "Category",
      createdBy: 1,
      node_data: {
        nodes: formattedNodes,
        adjacencyList: Object.values(adjacencyList)
      },
    };

    // Store the data locally
    localStorage.setItem('flowData', JSON.stringify(data));

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

  const onCopy = useCallback((id) => {
    setNodes((prevNodes) => {
      const nodeToCopy = prevNodes.find((node) => node.id === id);
      if (!nodeToCopy) return prevNodes;
      
      const newNode = {
        ...nodeToCopy,
        id: `${nodeToCopy.id}-copy-${Date.now()}`,
        position: {
          x: nodeToCopy.position.x + 20,
          y: nodeToCopy.position.y + 20,
        },
      };
      
      return [...prevNodes, newNode];
    });
  }, []);
  
  const onDelete = useCallback((id) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
  }, []);


  return (
    <div className="dndflow">
      <div className="updatenode">
      <Sidebar />
      </div>
      <button className="send-button" onClick={sendDataToBackend}>Send Data to Backend</button>
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
            onNodeDoubleClick={onNodeDoubleClick}
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