import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getPosts, createPost, likePost, addComment, deletePost } from '../api/chatroomPosts';
import { getAllChatrooms, createChatroom } from '../api/chatrooms';
import './Posts.css';

const Posts = () => {
  const { user } = useUser();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [chatroomId, setChatroomId] = useState(null);

  // Initialize and load posts on mount
  useEffect(() => {
    initializeCommunityPosts();
  }, []);

  // Track liked posts for UI
  useEffect(() => {
    if (posts.length > 0) {
      const liked = new Set();
      posts.forEach(post => {
        if (post.likes?.some(like => 
          typeof like === 'object' ? like._id === user?._id : like === user?._id
        )) {
          liked.add(post._id);
        }
      });
      setLikedPosts(liked);
    }
  }, [posts, user]);

  const initializeCommunityPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get all chatrooms
      const chatroomsResponse = await getAllChatrooms();
      
      if (chatroomsResponse.success && chatroomsResponse.data?.length > 0) {
        // Look for a Community chatroom, or use the first one
        const communityRoom = chatroomsResponse.data.find(
          room => room.name.toLowerCase().includes('community') || room.name.toLowerCase().includes('posts')
        ) || chatroomsResponse.data[0];
        
        setChatroomId(communityRoom._id);
        await loadPosts(communityRoom._id);
      } else {
        // No chatrooms exist, create a default one
        if (user?._id) {
          const createResponse = await createChatroom(
            'Community Posts',
            'Share your thoughts and connect with fellow students',
            '#09A6AD',
            false
          );
          
          if (createResponse.success) {
            setChatroomId(createResponse.data._id);
            await loadPosts(createResponse.data._id);
          } else {
            setError('Could not create community chatroom');
          }
        } else {
          setError('Please log in to view posts');
        }
      }
    } catch (err) {
      console.error('Error initializing posts:', err);
      setError('Failed to load community posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (roomId) => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getPosts(roomId, 100);
      if (response.success) {
        setPosts(response.data || []);
      } else {
        setError(response.message || 'Failed to load posts');
        setPosts([]);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user || !chatroomId) return;

    try {
      setSubmitting(true);
      const response = await createPost(chatroomId, newPostContent.trim());
      if (response.success) {
        setPosts([response.data, ...posts]);
        setNewPostContent('');
        setShowPostModal(false);
      } else {
        setError(response.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId) => {
    if (!user) {
      setError('You must be logged in to like posts');
      return;
    }

    try {
      const response = await likePost(postId);
      if (response.success) {
        setPosts(posts.map(post => 
          post._id === postId ? response.data : post
        ));
      }
    } catch (err) {
      console.error('Error liking post:', err);
      setError(err.message || 'Failed to like post');
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text || !user) return;

    try {
      const response = await addComment(postId, text);
      if (response.success) {
        setPosts(posts.map(post => 
          post._id === postId ? response.data : post
        ));
        setCommentText({ ...commentText, [postId]: '' });
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.message || 'Failed to add comment');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await deletePost(postId);
      if (response.success) {
        setPosts(posts.filter(post => post._id !== postId));
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err.message || 'Failed to delete post');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPostOwner = (postAuthorId) => {
    return user?._id === postAuthorId;
  };

  return (
    <div className="posts-page">
      <div className="posts-header">
        <h1>Community Posts</h1>
        <p>Share your thoughts and connect with fellow students</p>
        {user && (
          <button 
            className="create-post-btn"
            onClick={() => setShowPostModal(true)}
          >
            + Create Post
          </button>
        )}
      </div>

      {error && (
        <div className="error-message" style={{
          padding: '12px 16px',
          marginBottom: '20px',
          backgroundColor: '#ffebee',
          color: '#d32f2f',
          borderRadius: '8px',
          border: '1px solid #ef5350'
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
          >
            ×
          </button>
        </div>
      )}

      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create a Post</h2>
              <button 
                className="close-btn"
                onClick={() => setShowPostModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreatePost}>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind? Share your thoughts..."
                rows="5"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  marginBottom: '12px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting || !newPostContent.trim()}
                  style={{
                    padding: '10px 20px',
                    background: submitting ? '#ccc' : 'var(--primary-cyan)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: submitting ? 'default' : 'pointer'
                  }}
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          <p>Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          <p>No posts yet. {user ? 'Be the first to post!' : 'Log in to create a post!'}</p>
        </div>
      ) : (
        <div className="posts-container">
          {posts.map((post) => (
            <div key={post._id} className="post-card">
              <div className="post-header">
                <div className="post-author-info">
                  <h3>{post.authorName || post.author?.username || 'Anonymous'}</h3>
                  <span className="post-date">{formatDate(post.createdAt)}</span>
                </div>
                {isPostOwner(post.author?._id || post.author) && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeletePost(post._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '20px',
                      color: '#999'
                    }}
                  >
                    ⋯
                  </button>
                )}
              </div>

              <div className="post-content">
                <p>{post.content}</p>
              </div>

              <div className="post-footer">
                <button
                  className={`post-action ${likedPosts.has(post._id) ? 'liked' : ''}`}
                  onClick={() => handleLikePost(post._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: user ? 'pointer' : 'default',
                    color: likedPosts.has(post._id) ? 'var(--primary-cyan)' : '#999',
                    fontSize: '14px'
                  }}
                >
                  ❤️ {post.likeCount || 0} Like{(post.likeCount || 0) !== 1 ? 's' : ''}
                </button>
                <button
                  className="post-action"
                  onClick={() => setExpandedPostId(expandedPostId === post._id ? null : post._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#999',
                    fontSize: '14px'
                  }}
                >
                  💬 {post.comments?.length || 0} Comment{(post.comments?.length || 0) !== 1 ? 's' : ''}
                </button>
              </div>

              {expandedPostId === post._id && (
                <div className="post-comments">
                  {post.comments?.length > 0 && (
                    <div className="comments-list">
                      {post.comments.map((comment, idx) => (
                        <div key={idx} className="comment">
                          <strong>{comment.authorName || comment.author?.username || 'Anonymous'}</strong>
                          <p>{comment.text}</p>
                          <span style={{ fontSize: '12px', color: '#999' }}>
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {user && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddComment(post._id);
                      }}
                      style={{ marginTop: '16px', display: 'flex', gap: '8px' }}
                    >
                      <input
                        type="text"
                        value={commentText[post._id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                        placeholder="Add a comment..."
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!commentText[post._id]?.trim()}
                        style={{
                          padding: '8px 16px',
                          background: 'var(--primary-cyan)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Reply
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;
