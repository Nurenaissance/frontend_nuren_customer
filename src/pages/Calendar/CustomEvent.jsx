import React from 'react';

const CustomEvent = ({ event }) => {
  const eventStyle = {
    borderRadius: '5px',
    padding: '5px',
    color: 'black',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    backgroundColor: event.color || '#FFD700', // Use event's color or default
  };

  console.log('Rendering event:', event); // Debugging line

  return (
    <div style={eventStyle} title={event.title}>
      {event.title}
    </div>
  );
};

export default CustomEvent;