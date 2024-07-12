import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./style.css";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { sendEmail } from './email.jsx'; // Import the sendEmail function
import axiosInstance from "../../api.jsx";

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
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board">
            {Object.keys(columns).map((columnId) => {
              const column = columns[columnId];
              return (
                <div className="column" key={columnId}>
                  <div
                    className="title htext1"
                    style={{ backgroundColor: column.bg }} // Apply the background color here
                  >
                    {column.title} ({column.count})
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
                                </div>
                                <div className="content_">
                                  {/* Content of the card */}
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
