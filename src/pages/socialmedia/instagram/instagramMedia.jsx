import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './instagramMedia.css';

//const socket = io('https://nuren-insta.vercel.app/');

const InstagramMedia = () => {
    const [mediaIds, setMediaIds] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [commentId, setCommentId] = useState(null);
    const [commentInput, setCommentInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

   /* useEffect(() => {
        fetchMediaIds();
    }, []);

    const fetchMediaIds = async () => {
        setLoading(true);
        try {
            const response = await axios.post('https://nuren-insta.vercel.app/fetch-media', {
                userIGSID: '254960371025173',
                accessToken: 'EAAVZBobCt7AcBO5fHJfjy2kZBWJDcgqp45O4YQszjFBEQl53cQMKNBw8gubbWfzHIapS6y5nQ3F5kwbOZAaY0WI8SAyogA0oJXuqUK08PrIru6urrRZB96fjnK9gUK7TV9eU5TiHhVkKcIw7hKVCTdOBIwGi1e6cgPKWZBYxZANyq5K8xifmTbTkZAz4dniI7oZD'
            });
            setMediaIds(response.data.media.data);
        } catch (error) {
            setError('Failed to fetch media IDs');
            
        } finally {
            setLoading(false);
        }
    };

    const fetchMediaDetails = async (mediaId) => {
        setLoading(true);
        try {
            const response = await axios.post('https://nuren-insta.vercel.app/fetch-single-post', {
                mediaID: mediaId,
                userIGSID: '254960371025173',
                accessToken: 'EAAVZBobCt7AcBO5fHJfjy2kZBWJDcgqp45O4YQszjFBEQl53cQMKNBw8gubbWfzHIapS6y5nQ3F5kwbOZAaY0WI8SAyogA0oJXuqUK08PrIru6urrRZB96fjnK9gUK7TV9eU5TiHhVkKcIw7hKVCTdOBIwGi1e6cgPKWZBYxZANyq5K8xifmTbTkZAz4dniI7oZD'
            });
            setSelectedMedia(response.data);
        } catch (error) {
            setError('Failed to fetch media details');
           
        } finally {
            setLoading(false);
        }
    };
*/
    const handleCommentReply = () => {
        if (commentId && commentInput) {
            socket.emit('send_comment_reply', { comment_id: commentId, text: commentInput });
            setCommentInput('');
            setCommentId(null);
        }
    };

    return (
        <div className="instagram-media-container">
            <h1 className="app-title">Instagram Media Viewer</h1>
            {loading && <div className="loading">Loading...</div>}
            {error && <p className="error-message">{error}</p>}
            <div className="content-wrapper">
                <div className="media-list">
                    <h2>Media List</h2>
                    <div className="media-grid">
                        {mediaIds.map(media => (
                            <div 
                                className="media-card" 
                                key={media.id} 
                                onClick={() => fetchMediaDetails(media.id)}
                            >
                                <h3>Media ID: {media.id}</h3>
                                {media.thumbnail_url && <img src={media.thumbnail_url} alt="Thumbnail" />}
                            </div>
                        ))}
                    </div>
                </div>
                {selectedMedia && (
                    <div className="media-details">
                        <div className="post-card">
                            <h3 className="post-card-title">Post Details</h3>
                            {selectedMedia.media_url && (
                                <img className="post-image" src={selectedMedia.media_url} alt="Post" />
                            )}
                            <p className="post-caption">{selectedMedia.caption || 'No caption'}</p>
                            <p className="post-comments-count">Comments: {selectedMedia.comments_count || 0}</p>
                            <h4>Comments</h4>
                            <ul className="comments-list">
                                {(selectedMedia.comments_count > 0) && selectedMedia.comments.data.map(comment => (
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Comment = ({ comment, setCommentId, handleCommentReply, commentInput, setCommentInput, commentId }) => {
    const [showReplies, setShowReplies] = useState(false);

    return (
        <li className="comment-item">
            <p>
                <strong>{comment.username}:</strong> {comment.text}
            </p>
            <button className="reply-link" onClick={() => setCommentId(comment.id)}>
                Reply
            </button>
            {commentId === comment.id && (
                <div className="comment-reply-box">
                    <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Write a reply..."
                        className="comment-input"
                    />
                    <button className="reply-button" onClick={handleCommentReply}>Send</button>
                </div>
            )}
            {comment.replies && comment.replies.data.length > 0 && (
                <>
                    <button className="toggle-replies-button" onClick={() => setShowReplies(!showReplies)}>
                        {showReplies ? 'Hide Replies' : 'Show Replies'}
                    </button>
                    {showReplies && (
                        <ul className="replies-list">
                            {comment.replies.data.map(reply => (
                                <li className="reply-item" key={reply.id}>
                                    <p><strong>{reply.username}:</strong> {reply.text}</p>
                                    <button className="reply-link" onClick={() => setCommentId(reply.id)}>
                                        Reply
                                    </button>
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