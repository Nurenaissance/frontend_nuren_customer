import React, { createContext, useContext, useState, useCallback } from 'react';

const FlowContext = createContext();

export const FlowProvider = ({ children }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [startNodeId, setStartNodeId] = useState(null);

  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes(prevNodes => {
      const updatedNodes = prevNodes.map(node =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      );
      console.log('Updated nodes:', updatedNodes);
      return updatedNodes;
    });
  }, []);

  const setAsStartNode = useCallback((nodeId) => {
    setStartNodeId(nodeId);
    setNodes(prevNodes => prevNodes.map(node => ({
      ...node,
      data: { ...node.data, isStartNode: node.id === nodeId }
    })));
  }, []);

  const value = {
    nodes,
    setNodes,
    edges,
    setEdges,
    updateNodeData,
    startNodeId,
    setAsStartNode
  };

  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  );
};

export const useFlow = () => useContext(FlowContext);