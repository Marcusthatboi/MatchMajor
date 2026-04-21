import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getPosts, createPost, likePost, addComment, deletePost } from '../api/chatroomPosts';
import { getAllChatrooms, createChatroom } from '../api/chatrooms';
import './Posts.css';

const POST_CHANNELS = {
  roommate: {
    label: 'Roommate Posts',
    title: 'Roommate Posts',
    description: 'Find roommates, share housing needs, and compare living preferences',
    roomName: 'Roommate Posts',
    roomDescription: 'Find roommates and share housing preferences',
    color: '#09A6AD',
    keywords: ['roommate', 'roomate', 'housing', 'dorm']
  },
  study: {
    label: 'Study Group Posts',
    title: 'Study Group Posts',
    description: 'Create study groups, ask class questions, and find project partners',
    roomName: 'Study Group Posts',
    roomDescription: 'Find study groups and academic partners',
    color: '#7C5CFF',
    keywords: ['study', 'group', 'class', 'project']
  }
};

const Posts = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [activePostType, setActivePostType] = useState('roommate');
  const [postRooms, setPostRooms] = useState({});
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
  const activeChannel = POST_CHANNELS[activePostType];

  // Initialize and load posts on mount
  useEffect(() => {
    initializePostRooms();
  }, [user?._id]);

  useEffect(() => {
    const activeRoomId = postRooms[activePostType]?._id;
    if (activeRoomId) {
      setChatroomId(activeRoomId);
      setExpandedPostId(null);
      loadPosts(activeRoomId);
    }
  }, [activePostType, postRooms]);

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

  const findChannelRoom = (rooms, channel) => {
    return rooms.find(room => {
      const searchable = `${room.name || ''} ${room.description || ''} ${room.category || ''}`.toLowerCase();
      return channel.keywords.some(keyword => searchable.includes(keyword));
    });
  };

  const initializePostRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const chatroomsResponse = await getAllChatrooms();
      const rooms = chatroomsResponse.success ? chatroomsResponse.data || [] : [];
      const nextPostRooms = {};

      for (const [type, channel] of Object.entries(POST_CHANNELS)) {
        let room = findChannelRoom(rooms, channel);

        if (!room && user?._id) {
          const createResponse = await createChatroom(
            channel.roomName,
            channel.roomDescription,
            channel.color,
            false
          );

          if (createResponse.success) {
            room = createResponse.data;
          }
        }

        if (room) {
          nextPostRooms[type] = room;
        }
      }

      if (!nextPostRooms[activePostType]) {
        setPosts([]);
        setError(user ? 'Could not load this post room' : 'Please log in to view posts');
        return;
      }

      setPostRooms(nextPostRooms);
      setChatroomId(nextPostRooms[activePostType]._id);
      await loadPosts(nextPostRooms[activePostType]._id);
    } catch (err) {
      console.error('Error initializing posts:', err);
      setError('Failed to load posts. Please try again later.');
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
        setPosts(currentPosts => [response.data, ...currentPosts]);
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

  const getAuthorProfile = (post) => {
    return post.author?.survey || {};
  };

  const getPostAuthorId = (post) => {
    return typeof post.author === 'object' ? post.author?._id : post.author;
  };

  const getAuthorName = (post) => {
    const profile = getAuthorProfile(post);
    return profile.name || post.authorName || post.author?.username || 'Anonymous';
  };

  const getAuthorInitial = (post) => {
    return getAuthorName(post).charAt(0).toUpperCase();
  };

  const getPosterDetails = (post) => {
    const profile = getAuthorProfile(post);

    if (activePostType === 'roommate') {
      return [
        { label: 'Year', value: profile.year },
        { label: 'Campus', value: profile.campusSelection },
        { label: 'Sleep', value: profile.sleepSchedule },
        { label: 'Cleanliness', value: profile.cleanliness },
        { label: 'Social', value: profile.socialBattery }
      ].filter(detail => detail.value);
    }

    return [
      { label: 'Major', value: profile.major },
      { label: 'Year', value: profile.year },
      { label: 'Format', value: profile.virtualOrInPerson },
      { label: 'Location', value: profile.studyLocation },
      { label: 'Time', value: profile.studyTimes },
      { label: 'Group', value: profile.idealGroupSize }
    ].filter(detail => detail.value);
  };

  const getPosterSummary = (post) => {
    const profile = getAuthorProfile(post);

    if (activePostType === 'roommate') {
      return profile.bio || profile.hobbies || profile.visitorPolicy || 'Roommate profile details have not been added yet.';
    }

    return profile.studyGoals || profile.studyHabits || profile.studyStyle || profile.bio || 'Study profile details have not been added yet.';
  };

  const openPosterProfile = (post) => {
    const authorId = getPostAuthorId(post);
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  const handlePostCardClick = (event, post) => {
    if (event.target.closest('button, a, input, textarea, form')) {
      return;
    }

    openPosterProfile(post);
  };

  const handlePostCardKeyDown = (event, post) => {
    if (event.key === 'Enter') {
      openPosterProfile(post);
    }
  };

  return (
    <div className="posts-page">
      <div className="posts-header">
        <h1>{activeChannel.title}</h1>
        <p>{activeChannel.description}</p>
        <div className="posts-slider" role="tablist" aria-label="Post type">
          <span className={`posts-slider-thumb ${activePostType}`} aria-hidden="true" />
          {Object.entries(POST_CHANNELS).map(([type, channel]) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={activePostType === type}
              className={`posts-slider-option ${activePostType === type ? 'active' : ''}`}
              onClick={() => setActivePostType(type)}
            >
              {channel.label}
            </button>
          ))}
        </div>
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
              <h2>Create {activeChannel.label}</h2>
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
                placeholder={activePostType === 'roommate' ? 'Share what you are looking for in a roommate...' : 'Share the class, topic, schedule, or project you want to study...'}
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
          <p>No {activeChannel.label.toLowerCase()} yet. {user ? 'Be the first to post!' : 'Log in to create a post!'}</p>
        </div>
      ) : (
        <div className="posts-container">
          {posts.map((post) => (
            <div
              key={post._id}
              className="post-card profile-clickable-post"
              role="link"
              tabIndex={0}
              onClick={(event) => handlePostCardClick(event, post)}
              onKeyDown={(event) => handlePostCardKeyDown(event, post)}
            >
              <div className="post-header">
                <div className={`poster-panel ${activePostType}`}>
                  <div className="poster-avatar" aria-hidden="true">
                    {post.author?.profilePhoto ? (
                      <img src={post.author.profilePhoto} alt="" />
                    ) : (
                      <span>{getAuthorInitial(post)}</span>
                    )}
                  </div>
                  <div className="post-author-info">
                    <div className="poster-title-row">
                      <h3>{getAuthorName(post)}</h3>
                      <span className="thread-badge">{activeChannel.label}</span>
                    </div>
                    <span className="view-profile-hint">View profile</span>
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                    <div className="poster-detail-grid">
                      {getPosterDetails(post).map(detail => (
                        <span key={detail.label} className="poster-detail">
                          <strong>{detail.label}</strong>
                          {detail.value}
                        </span>
                      ))}
                    </div>
                    <p className="poster-summary">{getPosterSummary(post)}</p>
                  </div>
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
