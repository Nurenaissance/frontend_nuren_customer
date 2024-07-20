import React, { useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './instagramMedia.css'; // Imp
const socket = io('https://hx587qc4-5173.inc1.devtunnels.ms'); // Replace with your actual socket server URL

const InstagramMedia = () => {
    const [mediaIds, setMediaIds] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [commentId, setCommentId] = useState(null);
    const [commentInput, setCommentInput] = useState('');
    const [error, setError] = useState('');

    const fetchMediaIds = async () => {
        try {
            const response = await axios.post('https://hx587qc4-5173.inc1.devtunnels.ms/fetch-media', {
                userIGSID: 'your_user_id_here', // Replace with actual user ID
                accessToken: 'your_access_token_here' // Replace with actual access token
            });
            setMediaIds(response.data.media.data);
        } catch (error) {
            setError('Failed to fetch media IDs');
            console.error(error);
        }
    };

    const fetchMediaDetails = async (mediaId) => {
        try {
            const response = await axios.post('https://hx587qc4-5173.inc1.devtunnels.ms/fetch-single-post', {
                mediaID: mediaId,
                userIGSID: 'your_user_id_here', // Replace with actual user ID
                accessToken: 'your_access_token_here' // Replace with actual access token
            });
            setSelectedMedia(response.data);
        } catch (error) {
            setError('Failed to fetch media details');
            console.error(error);
        }
    };

    const handleCommentReply = () => {
        if (commentId && commentInput) {
            socket.emit('send_comment_reply', { comment_id: commentId, text: commentInput });
            setCommentInput('');
        }
    };

    return (
        <div className="instagram-media-container">
            <button className="fetch-button" onClick={fetchMediaIds}>Fetch Media IDs</button>
            {error && <p className="error-message">{error}</p>}
            <div className="media-list">
                {mediaIds.map(media => (
                    <button className="media-button" key={media.id} onClick={() => fetchMediaDetails(media.id)}>
                        {media.id}
                    </button>
                ))}
            </div>
            {selectedMedia && (
                <div className="media-card">
                    <h3 className="media-card-title">Post Details</h3>
                    <img className="media-image" src={selectedMedia.media_url} alt="Post" />
                    <p><strong>Caption:</strong> {selectedMedia.caption}</p>
                    <p><strong>Comments Count:</strong> {selectedMedia.comments_count}</p>
                    <h4>Comments</h4>
                    <ul className="comments-list">
                        {(selectedMedia.comments_count>0)&&selectedMedia.comments.data.reverse().map(comment => (
                            <Comment
                                key={comment.id}
                                comment={comment}
                                setCommentId={setCommentId}
                                handleCommentReply={handleCommentReply}
                                commentInput={commentInput}
                                setCommentInput={setCommentInput}
                                commentId={commentId}
                            />
                        ))}
                    </ul>
                    {commentId && (
                        <div className="comment-reply-box">
                            <input
                                type="text"
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                placeholder="Write a reply..."
                                className="comment-input"
                            />
                            <button className="reply-button" onClick={handleCommentReply}>Reply</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Comment = ({ comment, setCommentId, handleCommentReply, commentInput, setCommentInput, commentId }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [isClicked, setIsClicked] = useState(false);


    const handleReplyClick = (replyId) => {
        setCommentId(replyId);
        
    };
    const handleClick = () => {
       
        setIsClicked(!isClicked);
    };


    return (
        <li className={`comment-item ${isClicked ? 'clicked' : ''}`} onClick={handleClick}>
            <p onClick={() => setCommentId(comment.id)}>
                <strong>{comment.username}:</strong> {comment.text}
            </p>
            {comment.replies && (
                <>
                    <button className="toggle-replies-button" onClick={() => { setShowReplies(!showReplies); handleClick(); }}>
                        {showReplies ? 'Hide Replies' : 'Show Replies'}
                    </button>
                    {showReplies && (
                        <ul className="replies-list">
                            {comment.replies.data.reverse().map(reply => (
                                <li className="reply-item" key={reply.id} onClick={() => handleReplyClick(reply.id)}>
                                    <p><strong>{reply.username}:</strong> {reply.text}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </li>
    );
};

export default InstagramMedia;
