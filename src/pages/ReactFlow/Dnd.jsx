import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import Sidebar from "./Sidebar";
import "./dnd.css";
import axiosInstance from "../../api.jsx";

let id = 0;
const getId = () => `${id++}`;

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  return pathArray.length >= 2 ? pathArray[1] : null;
};

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const { templateId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const tenantId = getTenantIdFromUrl();

  const nodeTypes = useMemo(() => ({ 
    textUpdater: TextUpdaterNode,
    customNode: CustomNode,
    buttonNode: ButtonNode,
    sendMessage: SendMessage,
    askQuestion: AskQuestion,
    setCondition: SetCondition
  }), []);


  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId);
    } else {
      // If no templateId, initialize with an empty flow
      setNodes([]);
      setEdges([]);
      setIsLoading(false);
    }
  }, [templateId]);

  const fetchTemplate = async (id) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`node-templates/${id}/`);
      const template = response.data;
      if (template && template.node_data) {
        const { nodes: templateNodes, adjacencyList } = template.node_data;
        
        const transformedNodes = templateNodes.map(node => ({
          id: node.id.toString(),
          type: node.type,
          data: node.data,
          position: node.position || { x: Math.random() * 500, y: Math.random() * 500 },
        }));
  
        const transformedEdges = adjacencyList.flatMap((targets, sourceIndex) => 
          targets.map(target => ({
            id: `e${sourceIndex}-${target}`,
            source: sourceIndex.toString(),
            target: target.toString(),
          }))
        );

        setNodes(transformedNodes);
        setEdges(transformedEdges);
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      // If there's an error, initialize with an empty flow
      setNodes([]);
      setEdges([]);
    } finally {
      setIsLoading(false);
    }
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

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const handleUpdateNode = useCallback((updatedData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return { 
            ...node, 
            data: { 
              ...node.data, 
              ...updatedData 
            } 
          };
        }
        return node;
      })
    );
  }, [selectedNode]);

  const handleDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, []);

  const handleCopyNode = useCallback((nodeId) => {
    const nodeToCopy = nodes.find((node) => node.id === nodeId);
    if (nodeToCopy) {
      const newNode = {
        ...nodeToCopy,
        id: getId(),
        position: {
          x: nodeToCopy.position.x + 50,
          y: nodeToCopy.position.y + 50,
        },
      };
      setNodes((nds) => [...nds, newNode]);
    }
  }, [nodes]);

  const sendDataToBackend = useCallback(() => {
    const formattedNodes = nodes.map((node) => ({
      id: parseInt(node.id),
      type: node.type,
      data: node.data,
      position: node.position,
    }));
  
    const adjacencyList = edges.reduce((adjList, edge) => {
      const sourceIndex = parseInt(edge.source);
      const targetIndex = parseInt(edge.target);
      if (!adjList[sourceIndex]) {
        adjList[sourceIndex] = [];
      }
      adjList[sourceIndex].push(targetIndex);
      return adjList;
    }, {});
  
    const adjacencyListAsList = Object.values(adjacencyList);
  
    const data = {
      name: "Flow Template Name", // Consider adding an input field for this
      description: "Description of the flow template", // Consider adding an input field for this
      category: "Category", // Consider adding a dropdown for this
      createdBy: 1, // Consider getting this from the user's session
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
        console.log('Flow saved successfully:', response.data);
        navigate(`/${tenantId}/chatbot`);
      })
      .catch((error) => {
        console.error("Error saving flow:", error);
        // Consider showing an error message to the user
      });
  }, [nodes, edges, templateId, tenantId, navigate]);

  return (
    <div className="dndflow">
      <Sidebar />
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
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
              onNodeClick={onNodeClick}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background />
            </ReactFlow>
          )}
        </div>
      </ReactFlowProvider>
      <div className="sidebar">
        <button onClick={sendDataToBackend}>Save Flow</button>
        {selectedNode && (
          <div>
            <h3>Edit Node</h3>
            <input
              value={selectedNode.data.label}
              onChange={(evt) => handleUpdateNode({ label: evt.target.value })}
            />
            <button onClick={() => handleDeleteNode(selectedNode.id)}>Delete</button>
            <button onClick={() => handleCopyNode(selectedNode.id)}>Copy</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DnDFlow;