import React, { useState, useEffect, useCallback, useContext } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./style.css";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { sendEmail } from './email.jsx'; // Import the sendEmail function
import axiosInstance from "../../api.jsx";
import { Delete } from "@mui/icons-material";
import { Modal } from '@mui/material';
import { AiOutlineRobot } from "react-icons/ai"; 
import { debounce } from "lodash";
import { AiCacheContext } from './AiCacheContext';
import { ForceGraph2D } from 'react-force-graph';

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};

const colors = [
  "#5DADE2", "#34495E", "#D5DBDB", "#566573", "#F5CBA7",
  "#708090", "#B0C4DE", "#82E0AA", "#F08080" // Add more colors if needed
];

function Kanban({ leadCountsData }) {
  const tenantId = getTenantIdFromUrl();
  const [columns, setColumns] = useState({});
  const [stages, setStages] = useState([]);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newStageTitle, setNewStageTitle] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
const [popupContent, setPopupContent] = useState('');
const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  // const [aiCache, setAiCache] = useState({});
  const { aiCache, updateCache } = useContext(AiCacheContext);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const graphOptions = {
    layout: {
      hierarchical: false
    },
    edges: {
      color: "#000000"
    },
    nodes: {
      color: {
        border: '#6D31ED',
        background: '#FFFFFF',
        highlight: {
          border: '#5b2ac7',
          background: '#F3F0FF'
        }
      },
      font: {
        color: '#333333'
      }
    },
    height: "400px",
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -2000,
        centralGravity: 0.3,
        springLength: 95,
        springConstant: 0.04,
        damping: 0.09,
        avoidOverlap: 0.1
      },
    },
    interaction: {
      hover: true,
      zoomView: true,
    },
  };

  const loadingMessages = [
    "Analyzing data patterns...",
    "Generating insightful suggestions...",
    "Crunching numbers at light speed...",
    "Unlocking hidden potential in your leads...",
    "Preparing to blow your mind with AI magic..."
  ];


  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleDoubleClick = (columnId, currentTitle) => {
    setEditingColumnId(columnId);
    setNewTitle(currentTitle);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };
  const handleAddStage = async () => {
    try {
      // Determine the model_name from the URL
      const pathArray = window.location.pathname.split('/');
      const model_name = pathArray[pathArray.length - 1]; // Assuming last part of path is model_name
  
      // Make POST request to create a new stage
      const response = await axiosInstance.post('/stage/create/', {
        status: newStageTitle,
        model_name: model_name
      });
  
      // Log response and update UI as needed
      console.log('New stage created:', response.data);
  
    // Assuming you have a function to fetch stages and update state
    } catch (error) {
      console.error('Error creating new stage:', error);
    }
  };
  const handleDeleteStage = async (columnId) => {
    try {
      // Check if the stage has cards (leads)
      const column = columns[columnId];
      if (column.cards.length > 0) {
        alert("Cannot delete stage with cards. Please move or delete all cards first.");
        return;
      }
  
      // Make DELETE request to delete the stage
      await axiosInstance.delete(`/stage/delete/${columnId}/`);
  
      // Update the columns state to reflect the deleted stage
      const updatedColumns = { ...columns };
      delete updatedColumns[columnId];
      setColumns(updatedColumns);
  
      // Optionally fetch stages again if needed
      fetchStagesAndColors(); // Assuming you have a function to fetch stages and update state
    } catch (error) {
      console.error('Error deleting stage:', error);
    }
  };


  const handleSaveClick = async (columnId) => {
    try {
      // Replace 'your_stage_id' with the actual stage ID you want to update
      const response = await axiosInstance.post(`/stage/update/${columnId}/`, {
        status: newTitle,
      });

      console.log('Response:', response.data);
      // Update the columns state with the new title
      // This assumes you have a function to update the columns state
      updateColumnTitle(columnId, newTitle);

      setEditingColumnId(null);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const updateColumnTitle = (columnId, newTitle) => {
    // Implement this function to update the column title in your state
    setColumns((prevColumns) => ({
      ...prevColumns,
      [columnId]: {
        ...prevColumns[columnId],
        title: newTitle,
      },
    }));
  };
  useEffect(() => {
    const fetchStagesAndColors = async () => {
      try {
        const response = await axiosInstance.get('lead/stage/');
        const stagesData = response.data;

        if (stagesData && stagesData.stages && Array.isArray(stagesData.stages)) {
          const stagesWithColors = stagesData.stages.map((stage, index) => {
            const color = colors[index % colors.length]; // Use color from the predefined array
            return { ...stage, color }; // Add the color to the stage object
          });
          setStages(stagesWithColors);
        } else {
          console.error("Fetched stages data is not an array:", stagesData);
        }
      } catch (error) {
        console.error("Error fetching stages and colors:", error);
      }
    };

    fetchStagesAndColors();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch leads data
        const leadsResponse = await axiosInstance.get(`/leads/`);
        const leads = leadsResponse.data;

        // Ensure leads array is valid
        if (!Array.isArray(leads)) {
          console.error("Invalid leads data:", leads);
          return;
        }

        // Initialize categorizedLeads object
        const categorizedLeads = {};
        stages.forEach((stage) => {
          categorizedLeads[stage.id] = [];
        });

        // Categorize leads into respective stages
        leads.forEach((lead) => {
          const stageId = lead.stage; // Adjust based on your actual lead data structure
          if (categorizedLeads[stageId]) {
            categorizedLeads[stageId].push(lead);
          } else {
            console.error(`Unknown stage ID: ${stageId} for lead with ID: ${lead.id}`);
          }
        });

        // Map leads to cards for each column
        const columnsData = {};
        stages.forEach((stage) => {
          const count = categorizedLeads[stage.id].length || 0;
          const cards = mapLeadsToCards(categorizedLeads[stage.id]);
          columnsData[stage.id] = {
            title: stage.status, // Ensure `title` is set correctly
            count,
            cards,
            bg: stage.color // Set the background color
          };
        });

        // Set the columns state with the mapped cards and lead count
        setColumns(columnsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (stages.length > 0) {
      fetchData();
    }
  }, [stages]);

  const handleDeleteLead = async (leadId) => {
    try {
      await axiosInstance.delete(`/leads/${leadId}/`);
      // After successful deletion, update the state
      setColumns(prevColumns => {
        const updatedColumns = {...prevColumns};
        for (let columnId in updatedColumns) {
          updatedColumns[columnId].cards = updatedColumns[columnId].cards.filter(card => card.id !== leadId);
        }
        return updatedColumns;
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const mapLeadsToCards = (leads) => {
    if (!Array.isArray(leads)) {
      console.error("Invalid leads data:", leads);
      return [];
    }

    return leads.map((lead) => ({
      id: lead.id.toString(),
      name: lead.first_name + " " + lead.last_name,
      email: lead.email,
      address: lead.address,
      website: lead.website,
      status: lead.status,
      first_name: lead.first_name,
      last_name: lead.last_name,
      assigned_to: lead.assigned_to,
      createdBy: lead.createdBy,
      enquery_type: lead.enquery_type
    }));
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const startColumn = columns[source.droppableId];
    const endColumn = columns[destination.droppableId];

    if (startColumn === endColumn) {
      // Logic for moving within the same column
      const newCards = Array.from(startColumn.cards);
      newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, startColumn.cards[source.index]);
      const newColumn = {
        ...startColumn,
        cards: newCards,
      };
      setColumns({ ...columns, [source.droppableId]: newColumn });
    } else {
      // Logic for moving to a different column
      const startCards = Array.from(startColumn.cards);
      const endCards = Array.from(endColumn.cards);
      const [movedCard] = startCards.splice(source.index, 1);
      endCards.splice(destination.index, 0, {
        ...movedCard,
        status: endColumn.title,
      });

      try {
        const leadData = {
          ...movedCard, // Include existing lead data
          status: mapStatusToBackend(endColumn.title), // Update the status
          first_name: movedCard.first_name,
          last_name: movedCard.last_name,
          email: movedCard.email,
          assigned_to: movedCard.assigned_to,
          createdBy: movedCard.createdBy,
          tenant: tenantId,
          stage: destination.droppableId ,
        };

        // Make a PUT request to update the lead status in the backend
        await axiosInstance.put(`leads/${movedCard.id}/`, leadData);
      } catch (error) {
        console.error('Error sending email or updating lead status:', error);
      }

      const newColumns = {
        ...columns,
        [source.droppableId]: { ...startColumn, cards: startCards },
        [destination.droppableId]: { ...endColumn, cards: endCards },
      };
      setColumns(newColumns);
    }
  };


  // const debouncedAiRequest = useCallback(
  //   debounce(async (card, tenantId) => {
  //     const cacheKey = `${card.id}-${card.status}`;
  //     if (aiCache[cacheKey]) {
  //       showLeadPopup(aiCache[cacheKey]);
  //       setIsLoading(false);
  //       return;
  //     }

  //     const prompt = `answer the biggest node`;
  //     try {
  //       const response = await axiosInstance.post(`/query/`, { 
  //         prompt, 
  //         tenant: tenantId
  //       });
  //       const result = response.data;
  //       updateCache(cacheKey, result);
  //       showLeadPopup(result);
  //     } catch (error) {
  //       console.error('Error fetching AI suggestion:', error);
  //       showLeadPopup("An error occurred while fetching AI suggestions. Please try again.");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }, 300),
  //   [aiCache, updateCache]
  // );


  const handleAiButtonClick = (card) => {
    setIsLoading(true);
    setPopupOpen(true);
    setLoadingMessage(loadingMessages[0]);
    debouncedAiRequest(card, tenantId);
  };
  
  const debouncedAiRequest = useCallback(
    debounce(async (card, tenantId) => {
      const cacheKey = `${card.id}-${card.status}`;
      if (aiCache[cacheKey]) {
        processAiResponse(aiCache[cacheKey]);
        setIsLoading(false);
        return;
      }
  
      const prompt = `How do i sell to this person.`;
      try {
        const response = await axiosInstance.post(`https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/query/`, { 
          prompt, 
          tenant: tenantId
        });
        const result = response.data;
        updateCache(cacheKey, result);
        processAiResponse(result);
      } catch (error) {
        console.error('Error fetching AI suggestion:', error);
        processAiResponse("An error occurred while fetching AI suggestions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [aiCache, updateCache]
  );
  
  const processAiResponse = (result) => {
    if (typeof result === 'string') {
      // If the result is a string, it's likely an error message
      showLeadPopup(result);
      setGraphData({ nodes: [], links: [] });
      return;
    }
  
    showLeadPopup(result.message || "No message available");
  
    const nodes = Array.isArray(result.nodes) ? result.nodes : [];
    const links = Array.isArray(result.links) ? result.links : [];
  
    setGraphData({
      nodes: nodes.map(node => ({
        id: node.id || `node-${Math.random()}`,
        name: node.name || "Unnamed Node"
      })),
      links: links.map(link => ({
        source: link.source || "",
        target: link.target || ""
      }))
    });
  };
  

  const showLeadPopup = (content) => {
    setPopupContent(content);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setPopupContent('');
  };

  const mapStatusToBackend = (frontendStatus) => {
    switch (frontendStatus) {
      case 'Assigned':
        return 'assigned';
      case 'In Process':
        return 'in process';
      case 'Converted':
        return 'converted';
      case 'Recycled':
        return 'recycled';
      case 'Dead':
        return 'dead';
      default:
        return 'assigned';
    }
  };

  return (
    <>
  <br />
  <div className="Kanban">
  <div className="leaad_column add_leaad-column">
  <div className="add-column-content">
    <button onClick={handleAddStage} className="add-button">+</button>
    <input
      type="text"
      placeholder="New Stage"
      value={newStageTitle}
      onChange={(e) => setNewStageTitle(e.target.value)}
    />
  </div>
</div>
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {Object.keys(columns).map((columnId) => {
          const column = columns[columnId];
          return (
            <div className="column" key={columnId}>
              <div className="title htext1" style={{ backgroundColor: column.bg }} onDoubleClick={() => handleDoubleClick(columnId, column.title)}>
                {editingColumnId === columnId ? (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={handleTitleChange}
                      style={{ marginRight: '5px',backgroundColor:column.bg }}
                    />
                    <button onClick={() => handleSaveClick(columnId)} style={{ fontSize: '0.8rem' }}>Save</button>
                  </div>
                ) : (
                  <>
                    {column.title} ({column.count})
                  <button onClick={() => handleDeleteStage(columnId)}  disabled={columns[columnId].cards.length > 0} className="delete-column-btn"><Delete style={{fontSize:'18px'}}/></button>
                  </>
                )}
              </div>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="card-list"
                  >
                    {column.cards.map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={card.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="card_"
                          >
                            <div className="license">
                              {card.amount} licenses
                              <div className="status">{card.status}</div>
                              <button 
          onClick={() => handleDeleteLead(card.id)} 
          className="delete-lead-btn"
        >
          <Delete style={{fontSize:'16px'}}/>
        </button>
                    <button 
              onClick={() => handleAiButtonClick(card)}
              className="ai-button"
            >
              <AiOutlineRobot style={{fontSize: '20px'}}/>
            </button>
            <Modal
  open={popupOpen}
  onClose={handleClosePopup}
  aria-labelledby="ai-suggestion-popup"
  aria-describedby="ai-suggestion-description"
  className="modal"
>
  <div className="ai-popup-content">
    <h2>AI Insights</h2>
    <div className="ai-popup-container">
      <div className="ai-graph-container">
      <ForceGraph2D
  graphData={graphData.nodes.length > 0 ? graphData : { nodes: [{ id: 'dummy' }], links: [] }}
  nodeLabel="name"
  nodeAutoColorBy="id"
  linkDirectionalParticles={2}
  linkDirectionalParticleSpeed={0.001}
  d3VelocityDecay={0.3}
/>
      </div>
      <div className="ai-insights-text">
        {isLoading ? (
          <>
            <div className="ai-loader"></div>
            <p className="ai-loading-message">{loadingMessage}</p>
          </>
        ) : (
          <div className="ai-insights-content">
            {Array.isArray(popupContent) ? (
              popupContent.map((insight, index) => (
                <div key={index} className="ai-insight-item">
                  <h3>Insight {index + 1}</h3>
                  <p>{insight}</p>
                </div>
              ))
            ) : (
              <div className="ai-insight-item">
                <p>{popupContent}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    <button onClick={handleClosePopup}>Close</button>
  </div>
</Modal>

                            </div>
                            <div className="content_">
                              {columnId === 'new' && (
                                <NavLink to={`/${tenantId}/ShowLead/${card.id}`}>
                                  <div className="c1">{card.name}</div>
                                </NavLink>
                              )}
                              {columnId !== '0' ? (
                                <NavLink to={`/${tenantId}/ShowLead/${card.id}`}>
                                  <div className="c1">{card.name}</div>
                                </NavLink>
                              ) : (
                                <NavLink to={`/${tenantId}/lead/${card.id}`}>
                                  <div className="c1">{card.name}</div>
                                </NavLink>
                              )}
                              <div className="c2">
                                {card.address}
                              </div>
                              <div className="c2">
                                {card.email}
                              </div>
                              <div className="c2">{card.website}</div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
             
            </div>
          );
        })}
       
      </div>
    </DragDropContext>
  </div>
</>

  );
}

export default Kanban;
