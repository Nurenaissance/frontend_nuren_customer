import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import ProfileCard from './ProfileCard';
import LeadsCard from './LeadsCard';
import axiosInstance from "../../../api.jsx";
import { Sidebar } from '../../../components/Sidebar/index.jsx';
import TopNavbar from '../../TopNavbar/TopNavbar.jsx';
import Loader from '../../../components/Loader/Loader.jsx';
const MainLeadContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const SidebarContainer = styled.div`
  
`;

const LeadsCardContainer = styled.div`
  width: 100%;
  display: flex;
  margin-left:255px;
  flex-direction: column;
  padding: 20px;
`;

const UserProfileContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  font-family: Arial, sans-serif;
  ${({ isCardClicked }) =>
    isCardClicked &&
    `
      grid-template-columns: repeat(6, 1fr);
      align-items: start;
    `}
`;

const ProfileCardsRow = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const LeadNav = styled.div`
  width: 100%;
  margin-top: -7%;
  margin-bottom: 3rem;
`;

const AssignLeads = () => {
  const [isCardClicked, setIsCardClicked] = useState(false);
  const [clickedCardIndex, setClickedCardIndex] = useState(null);
  const [userData, setUserData] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]); // State for selected leads
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsersAndLeads = async () => {
      try {
        const usersResponse = await axiosInstance.get('https://webappbaackend.azurewebsites.net/get-all-user/');
        const users = usersResponse.data;

        const leadsResponse = await axiosInstance.get('/leads/');
        const leads = leadsResponse.data;

        const userIdMap = new Set(users.map(user => user.id));

        const unassignedLeads = [];
        const reassignmentRequiredLeads = [];
        const assignedLeads = {};

        leads.forEach(lead => {
          if (!lead.assigned_to || lead.assigned_to.length === 0) {
            unassignedLeads.push(lead);
          } else if (!lead.assigned_to.some(id => userIdMap.has(id))) {
            reassignmentRequiredLeads.push(lead);
          } else {
            lead.assigned_to.forEach(userId => {
              if (userIdMap.has(userId)) {
                if (!assignedLeads[userId]) {
                  assignedLeads[userId] = [];
                }
                assignedLeads[userId].push(lead);
              } else {
                reassignmentRequiredLeads.push(lead);
              }
            });
          }
        });

        const formattedUserData = users.map((user, index) => ({
          id: user.id.toString(),
          name: user.name || user.username || "No Name",
          username: user.username || "No Username",
          role: user.role || "No Role",
          imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRchNOQarbjmtb4x_sFAr1dfKN3bLy5I0BSsg&s',
          bgColor: getBgColor(index),
          dummyCards: (assignedLeads[user.id] || []).map(formatLead),
        }));

        formattedUserData.unshift({
          id: 'reassignment-required',
          name: 'Reassignment Required',
          username: 'Reassignment Required',
          role: 'None',
          imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRchNOQarbjmtb4x_sFAr1dfKN3bLy5I0BSsg&s',
          bgColor: '#FFD700',
          dummyCards: reassignmentRequiredLeads.map(formatLead),
        });

        formattedUserData.unshift({
          id: 'unassigned',
          name: 'Unassigned Leads',
          username: 'Unassigned',
          role: 'None',
          imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRchNOQarbjmtb4x_sFAr1dfKN3bLy5I0BSsg&s',
          bgColor: '#FFC0CB',
          dummyCards: unassignedLeads.map(formatLead),
        });

        setUserData(formattedUserData);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchUsersAndLeads();
  }, []);

  const formatLead = (lead) => ({
    id: lead.id.toString(),
    name: `${lead.first_name} ${lead.last_name}`,
    email: lead.email,
    address: lead.address,
    website: lead.website,
    status: lead.status,
    first_name: lead.first_name,
    last_name: lead.last_name,
    assigned_to: lead.assigned_to,
    createdBy: lead.createdBy,
    enquery_type: lead.enquery_type,
    tenant: lead.tenant, // Ensure tenant field is included
    stage: lead.stage
  });

  const getBgColor = (index) => {
    const colors = ['#E6E6FA', '#D8F5D8', '#FFE6E6', '#FFF5E6', '#E6F5FF'];
    return colors[index % colors.length];
  };

  const handleCardClick = (index) => {
    setIsCardClicked(true);
    setClickedCardIndex(index);
  };

  const handleLeadSelection = (leadId) => {
    setSelectedLeads((prevSelectedLeads) =>
      prevSelectedLeads.includes(leadId)
        ? prevSelectedLeads.filter((id) => id !== leadId)
        : [...prevSelectedLeads, leadId]
    );
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (destination.droppableId === 'unassigned' || destination.droppableId === 'reassignment-required') {
      // Do not allow dropping into unassigned or reassignment-required
      return;
    }

    const sourceUser = userData.find((user) => user.id === source.droppableId);
    const destUser = userData.find((user) => user.id === destination.droppableId);

    if (sourceUser && destUser) {
      const movedCards = sourceUser.dummyCards.filter((card) => selectedLeads.includes(card.id));
      sourceUser.dummyCards = sourceUser.dummyCards.filter((card) => !selectedLeads.includes(card.id));

      if (destUser.id === 'unassigned' || destUser.id === 'reassignment-required') {
        movedCards.forEach((card) => (card.assigned_to = []));
      } else {
        movedCards.forEach((card) => (card.assigned_to = [parseInt(destUser.id)]));
      }

      destUser.dummyCards = [
        ...destUser.dummyCards.slice(0, destination.index),
        ...movedCards,
        ...destUser.dummyCards.slice(destination.index),
      ];
      setUserData([...userData]);
      setSelectedLeads([]);

      try {
        const leadUpdates = movedCards.map((card) =>
          axiosInstance.put(`leads/${card.id}/`, {
            ...card,
            assigned_to: card.assigned_to,
            tenant: card.tenant,
            stage: card.stage,
          })
        );
        await Promise.all(leadUpdates);
      } catch (error) {
        console.error('Error updating lead assignment:', error);
      }
    }
  };



  if (error) {
    return <div>Error loading users: {error}</div>;
  }

  return (
    <MainLeadContainer>
      <Loader isLoading={isLoading}>
      <SidebarContainer>
        <Sidebar />
      </SidebarContainer>
      <LeadsCardContainer>
        <LeadNav>
          <TopNavbar />
        </LeadNav>
        <h1 style={{ textAlign: 'center', fontWeight: '600', marginBottom: '5rem' }}>Profile Cards</h1>
        <DragDropContext onDragEnd={onDragEnd}>
          {isCardClicked ? (
            <>
              <ProfileCardsRow>
                {userData.map((user, index) => (
                  <ProfileCard
                    key={user.id}
                    user={user}
                    isCardClicked={clickedCardIndex === index}
                    handleCardClick={() => handleCardClick(index)}
                  />
                ))}
              </ProfileCardsRow>
              {userData[clickedCardIndex] && (
                <Droppable droppableId={userData[clickedCardIndex].id}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      <LeadsCard
                        userId={userData[clickedCardIndex].id}
                        dummyCards={userData[clickedCardIndex].dummyCards}
                        selectedLeads={selectedLeads}
                        handleLeadSelection={handleLeadSelection}
                      />
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </>
          ) : (
            <UserProfileContainer isCardClicked={isCardClicked}>
              {userData.map((user, index) => (
                <Droppable key={user.id} droppableId={user.id}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      <ProfileCard
                        user={user}
                        isCardClicked={clickedCardIndex === index}
                        handleCardClick={() => handleCardClick(index)}
                      />
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </UserProfileContainer>
          )}
        </DragDropContext>
      </LeadsCardContainer>
      </Loader>
    </MainLeadContainer>
  );
};

export default AssignLeads;





// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import ProfileCard from './ProfileCard';
// import LeadsCard from './LeadsCard';
// import axiosInstance from "../../../api.jsx";
// import { Sidebar } from '../../../components/Sidebar/index.jsx';
// import TopNavbar from '../../TopNavbar/TopNavbar.jsx';

// const MainLeadContainer = styled.div`
//   display: flex;
//   flex-direction: row;
// `;

// const SidebarContainer = styled.div`
//   width: 100%;
// `;

// const LeadsCardContainer = styled.div`
//   width: 100%;
//   display: flex;
//   flex-direction: column;
//   padding: 20px;
// `;

// const UserProfileContainer = styled.div`
//   display: grid;
//   grid-template-columns: repeat(3, 1fr);
//   gap: 20px;
//   font-family: Arial, sans-serif;
//   ${({ isCardClicked }) =>
//     isCardClicked &&
//     `
//       grid-template-columns: repeat(6, 1fr);
//       align-items: start;
//     `}
// `;

// const ProfileCardsRow = styled.div`
//   display: flex;
//   justify-content: center;
//   margin-bottom: 20px;
// `;

// const LeadNav = styled.div`
//   width: 100%;
//   margin-top: -5%;
//   margin-bottom: 3rem;
// `;

// const AssignLeads = () => {
//   const [isCardClicked, setIsCardClicked] = useState(false);
//   const [clickedCardIndex, setClickedCardIndex] = useState(null);
//   const [userData, setUserData] = useState([]);
//   const [selectedLeads, setSelectedLeads] = useState([]); // State for selected leads
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchUsersAndLeads = async () => {
//       try {
//         const usersResponse = await axiosInstance.get('https://webappbaackend.azurewebsites.net/get-all-user/');
//         const users = usersResponse.data;

//         const leadsResponse = await axiosInstance.get('/leads/');
//         const leads = leadsResponse.data;

//         const userIdMap = new Set(users.map(user => user.id));

//         const unassignedLeads = [];
//         const reassignmentRequiredLeads = [];
//         const assignedLeads = {};

//         leads.forEach(lead => {
//           if (!lead.assigned_to || lead.assigned_to.length === 0) {
//             unassignedLeads.push(lead);
//           } else if (!lead.assigned_to.some(id => userIdMap.has(id))) {
//             reassignmentRequiredLeads.push(lead);
//           } else {
//             lead.assigned_to.forEach(userId => {
//               if (userIdMap.has(userId)) {
//                 if (!assignedLeads[userId]) {
//                   assignedLeads[userId] = [];
//                 }
//                 assignedLeads[userId].push(lead);
//               } else {
//                 reassignmentRequiredLeads.push(lead);
//               }
//             });
//           }
//         });

//         const formattedUserData = users.map((user, index) => ({
//           id: user.id.toString(),
//           name: user.name || user.username || "No Name",
//           username: user.username || "No Username",
//           role: user.role || "No Role",
//           imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRchNOQarbjmtb4x_sFAr1dfKN3bLy5I0BSsg&s',
//           bgColor: getBgColor(index),
//           dummyCards: (assignedLeads[user.id] || []).map(formatLead),
//         }));

//         formattedUserData.unshift({
//           id: 'reassignment-required',
//           name: 'Reassignment Required',
//           username: 'Reassignment Required',
//           role: 'None',
//           imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRchNOQarbjmtb4x_sFAr1dfKN3bLy5I0BSsg&s',
//           bgColor: '#FFD700',
//           dummyCards: reassignmentRequiredLeads.map(formatLead),
//         });

//         formattedUserData.unshift({
//           id: 'unassigned',
//           name: 'Unassigned Leads',
//           username: 'Unassigned',
//           role: 'None',
//           imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRchNOQarbjmtb4x_sFAr1dfKN3bLy5I0BSsg&s',
//           bgColor: '#FFC0CB',
//           dummyCards: unassignedLeads.map(formatLead),
//         });

//         setUserData(formattedUserData);
//         setIsLoading(false);
//       } catch (error) {
//         setError(error.message);
//         setIsLoading(false);
//       }
//     };

//     fetchUsersAndLeads();
//   }, []);

//   const formatLead = (lead) => ({
//     id: lead.id.toString(),
//     name: `${lead.first_name} ${lead.last_name}`,
//     email: lead.email,
//     address: lead.address,
//     website: lead.website,
//     status: lead.status,
//     first_name: lead.first_name,
//     last_name: lead.last_name,
//     assigned_to: lead.assigned_to,
//     createdBy: lead.createdBy,
//     enquery_type: lead.enquery_type,
//     tenant: lead.tenant, // Ensure tenant field is included
//     stage: lead.stage
//   });

//   const getBgColor = (index) => {
//     const colors = ['#E6E6FA', '#D8F5D8', '#FFE6E6', '#FFF5E6', '#E6F5FF'];
//     return colors[index % colors.length];
//   };

//   const handleCardClick = (index) => {
//     setIsCardClicked(true);
//     setClickedCardIndex(index);
//   };

//   const handleLeadSelection = (leadId) => {
//     setSelectedLeads((prevSelectedLeads) =>
//       prevSelectedLeads.includes(leadId)
//         ? prevSelectedLeads.filter((id) => id !== leadId)
//         : [...prevSelectedLeads, leadId]
//     );
//   };

//   const onDragEnd = async (result) => {
//     const { source, destination } = result;
//     if (!destination) return;

//     const sourceUser = userData.find((user) => user.id === source.droppableId);
//     const destUser = userData.find((user) => user.id === destination.droppableId);

//     if (sourceUser && destUser) {
//       const movedCards = sourceUser.dummyCards.filter((card) => selectedLeads.includes(card.id));
//       sourceUser.dummyCards = sourceUser.dummyCards.filter((card) => !selectedLeads.includes(card.id));

//       if (destUser.id === 'unassigned' || destUser.id === 'reassignment-required') {
//         movedCards.forEach((card) => (card.assigned_to = []));
//       } else {
//         movedCards.forEach((card) => (card.assigned_to = [parseInt(destUser.id)]));
//       }

//       destUser.dummyCards = [
//         ...destUser.dummyCards.slice(0, destination.index),
//         ...movedCards,
//         ...destUser.dummyCards.slice(destination.index),
//       ];
//       setUserData([...userData]);
//       setSelectedLeads([]);

//       try {
//         const leadUpdates = movedCards.map((card) =>
//           axiosInstance.put(`leads/${card.id}/`, {
//             ...card,
//             assigned_to: card.assigned_to,
//             tenant: card.tenant,
//             stage: card.stage,
//           })
//         );
//         await Promise.all(leadUpdates);
//       } catch (error) {
//         console.error('Error updating lead assignment:', error);
//       }
//     }
//   };

//   if (isLoading) {
//     return <div>Loading users...</div>;
//   }

//   if (error) {
//     return <div>Error loading users: {error}</div>;
//   }

//   return (
//     <MainLeadContainer>
//       <SidebarContainer>
//         <Sidebar />
//       </SidebarContainer>
//       <LeadsCardContainer>
//         <LeadNav>
//           <TopNavbar />
//         </LeadNav>
//         <h1 style={{ textAlign: 'center', fontWeight: '600', marginBottom: '5rem' }}>Profile Cards</h1>
//         <DragDropContext onDragEnd={onDragEnd}>
//           {isCardClicked ? (
//             <>
//               <ProfileCardsRow>
//                 {userData.map((user, index) => (
//                   <ProfileCard
//                     key={user.id}
//                     user={user}
//                     isCardClicked={clickedCardIndex === index}
//                     handleCardClick={() => handleCardClick(index)}
//                   />
//                 ))}
//               </ProfileCardsRow>
//               {userData[clickedCardIndex] && (
//                 <Droppable droppableId={userData[clickedCardIndex].id}>
//                   {(provided) => (
//                     <div ref={provided.innerRef} {...provided.droppableProps}>
//                       <LeadsCard
//                         userId={userData[clickedCardIndex].id}
//                         dummyCards={userData[clickedCardIndex].dummyCards}
//                         selectedLeads={selectedLeads}
//                         handleLeadSelection={handleLeadSelection}
//                       />
//                       {provided.placeholder}
//                     </div>
//                   )}
//                 </Droppable>
//               )}
//             </>
//           ) : (
//             <UserProfileContainer isCardClicked={isCardClicked}>
//               {userData.map((user, index) => (
//                 <Droppable key={user.id} droppableId={user.id}>
//                   {(provided) => (
//                     <div ref={provided.innerRef} {...provided.droppableProps}>
//                       <ProfileCard
//                         user={user}
//                         isCardClicked={clickedCardIndex === index}
//                         handleCardClick={() => handleCardClick(index)}
//                       />
//                       {provided.placeholder}
//                     </div>
//                   )}
//                 </Droppable>
//               ))}
//             </UserProfileContainer>
//           )}
//         </DragDropContext>
//       </LeadsCardContainer>
//     </MainLeadContainer>
//   );
// };

// export default AssignLeads;


