import React, { useState } from 'react';
import axios from 'axios';

const CommentReply = ({ commentID }) => {
  const [reply, setReply] = useState('');

  const handleReply = async () => {
    try {
      await axios.post('/api/reply/comment', { commentID, reply });
      alert('Reply sent successfully!');
      setReply('');
    } catch (error) {
      console.error('Error replying to comment:', error);
      alert('Failed to send reply.');
    }
  };

  return (
    <div>
      <textarea value={reply} onChange={(e) => setReply(e.target.value)} />
      <button onClick={handleReply}>Reply</button>
    </div>
  );
};

export default CommentReply;
    