import { useCallback } from 'react';

export const useNodeActions = (setNodes, setEdges) => {
  const handleCopyNode = useCallback((nodeId) => {
    setNodes((prevNodes) => {
      const nodeToCopy = prevNodes.find((n) => n.id === nodeId);
      if (!nodeToCopy) return prevNodes;

      const newNode = {
        ...nodeToCopy,
        id: `${nodeId}-copy-${Date.now()}`,
        position: {
          x: nodeToCopy.position.x + 50,
          y: nodeToCopy.position.y + 50,
        },
      };

      return [...prevNodes, newNode];
    });
  }, [setNodes]);

  const handleDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  return { handleCopyNode, handleDeleteNode };
};