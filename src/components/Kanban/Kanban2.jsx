import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./style.css";
import axios from "axios";
import { NavLink } from "react-router-dom";
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


const Kanban2 = () => {
  const tenantId = getTenantIdFromUrl();
  const [columns, setColumns] = useState({});
  const [stages, setStages] = useState([]);

  useEffect(() => {
    const fetchStagesAndColors = async () => {
      try {
        const response = await axiosInstance.get('opportunity/stage/');
        const stagesData = response.data;

        if (stagesData && stagesData.stages && Array.isArray(stagesData.stages)) {
          const stagesWithColors = stagesData.stages.map((stage, index) => {
            const color = colors[index % colors.length]; // Use color from the predefined array

            return { ...stage, color}; // Add the color to the stage object
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
    if (stages.length === 0) return;

    const fetchOpportunities = async () => {
      try {
        const response = await axiosInstance.get('/opportunities/');
        const opportunities = response.data;

        const categorizedOpportunities = Array.isArray(stages)
         ? stages.reduce((acc, stage) => {
              acc[stage.status] = [];
              return acc;
            }, {})
          : {};

        //...

        opportunities.forEach(opportunity => {
          if (categorizedOpportunities[opportunity.stage]) {
            categorizedOpportunities[opportunity.stage].push(opportunity);
          } else {
            categorizedOpportunities['QUALIFICATION']?.push(opportunity); // Default to 'QUALIFICATION' if stage is unknown
          }
        });

        const updatedColumns = {};
        stages.forEach(stage => {
          updatedColumns[stage.status] = {
            title: stage.status,
            cards: mapOpportunitiesToCards(categorizedOpportunities[stage.status]),
            bg: stage.color, // Use the stored color
          };
        });

        setColumns(updatedColumns);
      } catch (error) {
        console.error("Error fetching opportunities:", error);
      }
    };

    fetchOpportunities();
  }, [stages]);


  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const mapOpportunitiesToCards = (opportunities) => {
    if (!Array.isArray(opportunities)) {
      console.error("Expected opportunities to be an array but received:", opportunities);
      return [];
    }

    return opportunities.map((opportunity) => ({
      id: opportunity.id.toString(),
      name: opportunity.name,
      stage: opportunity.stage,
      amount: opportunity.amount,
      lead_source: opportunity.lead_source,
      probability: opportunity.probability,
      closedOn: opportunity.closedOn,
      description: opportunity.description,
      createdOn: opportunity.createdOn,
      isActive: opportunity.isActive,
      account: opportunity.account,
      contacts: opportunity.contacts,
      closedBy: opportunity.closedBy,
      createdBy: opportunity.createdBy,
      tenant: opportunity.tenant
    }));
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const startColumn = columns[source.droppableId];
    const endColumn = columns[destination.droppableId];

    if (startColumn === endColumn) {
      const newCards = Array.from(startColumn.cards);
      newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, startColumn.cards[source.index]);
      const newColumn = {
        ...startColumn,
        cards: newCards,
      };
      setColumns({ ...columns, [source.droppableId]: newColumn });
    } else {
      const startCards = Array.from(startColumn.cards);
      const endCards = Array.from(endColumn.cards);
      const [movedCard] = startCards.splice(source.index, 1);
      endCards.splice(destination.index, 0, {
        ...movedCard,
        stage: endColumn.title,
      });

      // Log the interaction
      const interactionData = {
        entity_type: "Opportunity",
        entity_id: movedCard.id,
        interaction_type: "Note",
        tenant_id: tenantId, // Make sure you have tenant_id in movedCard
        notes: `Stage changed from ${startColumn.title} to ${endColumn.title}. Opportunity amount: ${movedCard.amount}. Contact: ${movedCard.contact}.`,
        interaction_datetime: new Date().toISOString(),
      };

      try {
        await axiosInstance.post('/interaction/', interactionData);
        console.log('Interaction logged successfully');
      } catch (error) {
        console.error('Error logging interaction:', error);
      }

      const newColumns = {
        ...columns,
        [source.droppableId]: { ...startColumn, cards: startCards },
        [destination.droppableId]: { ...endColumn, cards: endCards },
      };
      setColumns(newColumns);
    }
  };

  return (
    <>
      <br />
      <div className="Kanban">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board">
            {Object.keys(columns).map((columnId, index) => {
              const column = columns[columnId];
              return (
                <React.Fragment key={columnId}>
                  <div className="column">
                    <div className="title htext1" style={{ backgroundColor: column.bg }}>
                      {column.title}
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
                                    <div className="status">{card.stage}</div>
                                  </div>
                                  <div className="content_">
                                    <NavLink to={`/${tenantId}/ShowOpportunity/${card.id}`}>
                                      <div className="c1">{card.name}</div>
                                    </NavLink>
                                    <div className="c2">
                                      {card.lead_source}
                                      <div className="r1">{card.probability}%</div>
                                    </div>
                                    <div className="c2">
                                      {card.closedOn}
                                      <div className="r1">${card.amount}</div>
                                    </div>
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
                  {(index + 1) % 5 === 0 && <div className="column-break" />}
                </React.Fragment>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </>
  );
}

export default Kanban2;
