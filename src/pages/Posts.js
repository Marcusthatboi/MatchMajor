import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getPosts, createPost, likePost, addComment, deletePost, requestRoommateJoin, respondToRoommateRequest } from '../api/chatroomPosts';
import { getAllChatrooms, createChatroom } from '../api/chatrooms';
import { getSurvey } from '../api/surveys';
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

const getPostTypeFromSearch = (search) => {
  const postType = new URLSearchParams(search).get('type');
  return POST_CHANNELS[postType] ? postType : 'roommate';
};

const findChannelRoom = (rooms, channel) => {
  return rooms.find(room => {
    const searchable = `${room.name || ''} ${room.description || ''} ${room.category || ''}`.toLowerCase();
    return channel.keywords.some(keyword => searchable.includes(keyword));
  });
};

const Posts = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [activePostType, setActivePostType] = useState(() => getPostTypeFromSearch(location.search));
  const [postRooms, setPostRooms] = useState({});
  const [posts, setPosts] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [roommateSlots, setRoommateSlots] = useState(1);
  const [expiresAt, setExpiresAt] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingPlace, setMeetingPlace] = useState('');
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [chatroomId, setChatroomId] = useState(null);
  const activeChannel = POST_CHANNELS[activePostType];
  const activeRoomId = postRooms[activePostType]?._id || null;
  const loading = roomsLoading || postsLoading;
  const roomsRequestId = useRef(0);
  const postsRequestId = useRef(0);

  useEffect(() => {
    setActivePostType(getPostTypeFromSearch(location.search));
  }, [location.search]);

  const initializePostRooms = useCallback(async () => {
    const requestId = roomsRequestId.current + 1;
    roomsRequestId.current = requestId;

    try {
      setRoomsLoading(true);
      setError(null);

      const chatroomsResponse = await getAllChatrooms();
      if (requestId !== roomsRequestId.current) return;

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

          if (requestId !== roomsRequestId.current) return;

          if (createResponse.success) {
            room = createResponse.data;
          }
        }

        if (room) {
          nextPostRooms[type] = room;
        }
      }

      if (Object.keys(nextPostRooms).length === 0) {
        setPosts([]);
        setError(user ? 'Could not load this post room' : 'Please log in to view posts');
        return;
      }

      setPostRooms(nextPostRooms);
    } catch (err) {
      if (requestId !== roomsRequestId.current) return;
      console.error('Error initializing posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      if (requestId === roomsRequestId.current) {
        setRoomsLoading(false);
      }
    }
  }, [user]);

  const loadPosts = useCallback(async (roomId) => {
    if (!roomId) return;
    const requestId = postsRequestId.current + 1;
    postsRequestId.current = requestId;
    
    try {
      setPostsLoading(true);
      setError(null);
      const response = await getPosts(roomId, 100);
      if (requestId !== postsRequestId.current) return;

      if (response.success) {
        setPosts(response.data || []);
      } else {
        setError(response.message || 'Failed to load posts');
        setPosts([]);
      }
    } catch (err) {
      if (requestId !== postsRequestId.current) return;
      console.error('Error loading posts:', err);
      setError(err.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      if (requestId === postsRequestId.current) {
        setPostsLoading(false);
      }
    }
  }, []);

  // Initialize rooms first, then load posts for the selected room.
  useEffect(() => {
    initializePostRooms();
  }, [initializePostRooms]);

  useEffect(() => {
    const loadCurrentSurvey = async () => {
      if (!user?._id) return;

      try {
        const response = await getSurvey();
        setCurrentSurvey(response?.survey || response?.data || null);
      } catch (err) {
        setCurrentSurvey(null);
      }
    };

    loadCurrentSurvey();
  }, [user?._id]);

  useEffect(() => {
    if (activeRoomId) {
      setChatroomId(activeRoomId);
      setExpandedPostId(null);
      loadPosts(activeRoomId);
    } else if (!roomsLoading) {
      setChatroomId(null);
      setPosts([]);
    }
  }, [activeRoomId, loadPosts, roomsLoading]);

  // Track liked posts for UI
  useEffect(() => {
    const liked = new Set();

    posts.forEach(post => {
      if (post.likes?.some(like =>
        typeof like === 'object' ? like._id === user?._id : like === user?._id
      )) {
        liked.add(post._id);
      }
    });

    setLikedPosts(liked);
  }, [posts, user?._id]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user || !chatroomId) return;

    try {
      setSubmitting(true);
      const response = await createPost(chatroomId, newPostContent.trim(), {
        roommateSlots,
        expiresAt: activePostType === 'roommate' ? expiresAt || null : null,
        meetingTime: activePostType === 'study' ? meetingTime : '',
        meetingPlace: activePostType === 'study' ? meetingPlace : ''
      });
      if (response.success) {
        setPosts(currentPosts => [response.data, ...currentPosts]);
        setNewPostContent('');
        setRoommateSlots(1);
        setExpiresAt('');
        setMeetingTime('');
        setMeetingPlace('');
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
    const authorId = typeof postAuthorId === 'object' ? postAuthorId?._id : postAuthorId;
    return user?._id === authorId;
  };

  const updatePost = (updatedPost) => {
    setPosts(currentPosts => currentPosts.map(post => (
      post._id === updatedPost._id ? updatedPost : post
    )));
  };

  const handleRequestJoin = async (postId) => {
    try {
      const response = await requestRoommateJoin(postId);
      if (response.success) {
        updatePost(response.data);
      }
    } catch (err) {
      console.error('Error requesting roommate join:', err);
      setError(err.message || 'Failed to request to join');
    }
  };

  const handleRespondToRequest = async (postId, requestId, decision) => {
    try {
      const response = await respondToRoommateRequest(postId, requestId, decision);
      if (response.success) {
        updatePost(response.data);
      }
    } catch (err) {
      console.error('Error responding to roommate request:', err);
      setError(err.message || 'Failed to respond to request');
    }
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

  const getUserName = (profileUser) => {
    return profileUser?.survey?.name || profileUser?.username || 'Student';
  };

  const getUserInitial = (profileUser) => {
    return getUserName(profileUser).charAt(0).toUpperCase();
  };

  const getUserId = (profileUser) => {
    return typeof profileUser === 'object' ? profileUser?._id : profileUser;
  };

  const getOpenSlotCount = (post) => {
    return Math.max(0, (post.roommateSlots || 0) - (post.roommateMembers?.length || 0));
  };

  const isExpired = (post) => {
    return post.expiresAt ? new Date(post.expiresAt) < new Date() : false;
  };

  const formatExpiration = (date) => {
    if (!date) return 'No expiration';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCurrentRequest = (post) => {
    return post.roommateRequests?.find(request => getUserId(request.user) === user?._id);
  };

  const canRequestJoin = (post) => {
    return user?._id &&
      !isPostOwner(post.author) &&
      !isExpired(post) &&
      getOpenSlotCount(post) > 0 &&
      !post.roommateMembers?.some(member => getUserId(member.user) === user._id) &&
      getCurrentRequest(post)?.status !== 'pending' &&
      getCurrentRequest(post)?.status !== 'approved';
  };

  const getMatchScore = (post) => {
    const profile = getAuthorProfile(post);
    if (!currentSurvey || !profile) return null;

    const comparisons = activePostType === 'roommate'
      ? ['campusSelection', 'sleepSchedule', 'cleanliness', 'socialBattery']
      : ['major', 'year', 'studyLocation', 'studyTimes', 'virtualOrInPerson', 'studyStyle'];

    let available = 0;
    let matches = 0;

    comparisons.forEach(field => {
      if (currentSurvey[field] && profile[field]) {
        available += 1;
        if (String(currentSurvey[field]).toLowerCase() === String(profile[field]).toLowerCase()) {
          matches += 1;
        }
      }
    });

    return available ? Math.round((matches / available) * 100) : null;
  };

  const getLineupUsers = (post) => {
    return [
      post.author,
      ...(post.roommateMembers || []).map(member => member.user)
    ].filter(Boolean);
  };

  const getPendingRequests = () => {
    return posts.flatMap(post => {
      if (!isPostOwner(post.author)) return [];
      return (post.roommateRequests || [])
        .filter(request => request.status === 'pending')
        .map(request => ({ post, request }));
    });
  };

  const getSpotLabel = () => {
    return activePostType === 'roommate' ? 'roommate spot' : 'study group spot';
  };

  const getJoinButtonLabel = (post) => {
    const requestStatus = getCurrentRequest(post)?.status;
    if (requestStatus === 'pending') return 'Request Pending';
    if (requestStatus === 'approved') return 'Approved';
    if (isExpired(post)) return 'Expired';
    if (getOpenSlotCount(post) === 0) return 'Full';
    return activePostType === 'roommate' ? 'Request to Join' : 'Request to Join Group';
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

  const openUserProfile = (profileUserId) => {
    if (profileUserId) {
      navigate(`/profile/${profileUserId}`, {
        state: {
          returnTo: `/posts?type=${activePostType}`,
          returnLabel: `Back to ${activeChannel.label}`
        }
      });
    }
  };

  const openPosterProfile = (post) => {
    const authorId = getPostAuthorId(post);
    openUserProfile(authorId);
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

  const pendingRequests = getPendingRequests();

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
              <div className="post-modal-fields">
                <label>
                  {activePostType === 'roommate' ? 'Roommates needed' : 'Group spots open'}
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={roommateSlots}
                    onChange={(e) => setRoommateSlots(Number(e.target.value))}
                  />
                </label>
                {activePostType === 'roommate' ? (
                  <label>
                    Post expiration
                    <input
                      type="date"
                      value={expiresAt}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                  </label>
                ) : (
                  <>
                    <label>
                      Time
                      <input
                        type="text"
                        value={meetingTime}
                        placeholder="e.g. Tuesdays at 6 PM"
                        onChange={(e) => setMeetingTime(e.target.value)}
                      />
                    </label>
                    <label>
                      Place
                      <input
                        type="text"
                        value={meetingPlace}
                        placeholder="e.g. Library room 204"
                        onChange={(e) => setMeetingPlace(e.target.value)}
                      />
                    </label>
                  </>
                )}
              </div>
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

      <div className="posts-body">
        <aside className="requests-sidebar">
            <h2>Requests</h2>
            {pendingRequests.length === 0 ? (
              <p className="requests-empty">No requests yet. Have you made a post?</p>
            ) : (
              pendingRequests.map(({ post, request }) => (
                <div key={request._id} className="request-card">
                  <button
                    type="button"
                    className="request-user"
                    onClick={() => openUserProfile(getUserId(request.user))}
                  >
                    <span className="lineup-avatar small">
                      {request.user?.profilePhoto ? (
                        <img src={request.user.profilePhoto} alt="" />
                      ) : (
                        getUserInitial(request.user)
                      )}
                    </span>
                    <span>
                      <strong>{getUserName(request.user)}</strong>
                      <small>{post.content.slice(0, 48)}{post.content.length > 48 ? '...' : ''}</small>
                    </span>
                  </button>
                  <div className="request-actions">
                    <button type="button" onClick={() => handleRespondToRequest(post._id, request._id, 'approved')}>Approve</button>
                    <button type="button" className="deny" onClick={() => handleRespondToRequest(post._id, request._id, 'denied')}>Deny</button>
                  </div>
                </div>
              ))
            )}
        </aside>

        <section className="posts-feed">
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

              <div className="roommate-post-meta">
                {activePostType === 'roommate' ? (
                  <>
                    <span><strong>Campus</strong>{getAuthorProfile(post).campusSelection || 'Not specified'}</span>
                    <span><strong>Expires</strong>{formatExpiration(post.expiresAt)}</span>
                  </>
                ) : (
                  <>
                    <span><strong>Time</strong>{post.meetingTime || 'Not specified'}</span>
                    <span><strong>Place</strong>{post.meetingPlace || 'Not specified'}</span>
                  </>
                )}
                <span><strong>Match</strong>{getMatchScore(post) === null ? 'Not enough info' : `${getMatchScore(post)}%`}</span>
              </div>

              <div className="post-content">
                <p>{post.content}</p>
              </div>

              <div className="roommate-lineup">
                  <div className="lineup-avatars">
                    {getLineupUsers(post).map((lineupUser, index) => (
                      <button
                        key={getUserId(lineupUser) || index}
                        type="button"
                        className="lineup-avatar"
                        title={getUserName(lineupUser)}
                        onClick={() => openUserProfile(getUserId(lineupUser))}
                      >
                        {lineupUser?.profilePhoto ? (
                          <img src={lineupUser.profilePhoto} alt="" />
                        ) : (
                          getUserInitial(lineupUser)
                        )}
                      </button>
                    ))}
                    {Array.from({ length: getOpenSlotCount(post) }).map((_, index) => (
                      <span key={`empty-${post._id}-${index}`} className="lineup-avatar placeholder" title="Open roommate spot">
                        +
                      </span>
                    ))}
                  </div>
                  <span className="lineup-count">
                    {post.roommateMembers?.length || 0} of {post.roommateSlots || 0} {getSpotLabel()}{(post.roommateSlots || 0) === 1 ? '' : 's'} filled
                  </span>
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
                {!isPostOwner(post.author) && (
                  <button
                    className="post-action request-join-btn"
                    type="button"
                    disabled={!canRequestJoin(post)}
                    onClick={() => handleRequestJoin(post._id)}
                  >
                    {getJoinButtonLabel(post)}
                  </button>
                )}
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
        </section>
      </div>
    </div>
  );
};

export default Posts;
