import { useCallback, useState } from "react";
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  MiniMap,
  Controls,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";
// import initialNodes from "./nodes.jsx";
import initialEdges from "./edges.jsx";
import { ClassNames } from "@emotion/react";
import DnDFlow from "./Dnd.jsx";

function FlowGraph() {
 

  return (
    <div style={{height:"100vh",width:'100%', backgroundColor:"white"}}>
    
    <DnDFlow/>
    </div>
  );
}
export default FlowGraph;