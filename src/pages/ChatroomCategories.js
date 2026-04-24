import React, { useState, useEffect } from 'react';
import {
  getAllChatrooms,
  createChatroom as apiCreateChatroom,
  deleteChatroom as apiDeleteChatroom,
  joinPrivateChatroom as apiJoinPrivateChatroom
} from '../api/chatrooms';
import './ChatroomCategories.css';

const POST_ROOM_NAMES = new Set(['Roommate Posts', 'Study Group Posts']);

const ChatroomCategories = ({ onSelectCategory, user }) => {
  const [chatrooms, setChatrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomName, setJoinRoomName] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    password: ''
  });
  const [error, setError] = useState(null);

  const predefinedColors = ['#09A6AD', '#FAC800', '#06A89D', '#E8A537', '#4A90A4', '#C85A54', '#2D9F7E', '#D64545'];

  // Load chatrooms on mount
  useEffect(() => {
    loadChatrooms();
  }, []);

  const loadChatrooms = async () => {
    try {
      setLoading(true);
      const response = await getAllChatrooms();
      if (response.success) {
        setChatrooms((response.data || []).filter((chatroom) => !POST_ROOM_NAMES.has(chatroom.name)));
      }
    } catch (error) {
      console.error('Failed to load chatrooms:', error);
      setError('Failed to load chatrooms');
    } finally {
      setLoading(false);
    }
  };

  const isChatroomMember = (chatroom) => (
    Boolean(user?._id) && chatroom.members?.some((member) => {
      const memberId = typeof member === 'object' ? member?._id : member;
      return memberId?.toString() === user._id.toString();
    })
  );

  const openJoinModal = (chatroom = null) => {
    setError(null);
    setJoinRoomName(chatroom?.name || '');
    setJoinPassword('');
    setShowJoinModal(true);
  };

  const handleSelectCategory = (chatroom) => {
    if (chatroom.isPrivate && !isChatroomMember(chatroom)) {
      openJoinModal(chatroom);
      return;
    }

    onSelectCategory(chatroom);
  };

  const getCreatorId = (chatroom) => (
    typeof chatroom.creator === 'object' ? chatroom.creator?._id : chatroom.creator
  );

  const canDeleteChatroom = (chatroom) => (
    user?._id && getCreatorId(chatroom)?.toString() === user._id.toString()
  );

  const handleDeleteChatroom = async (event, chatroom) => {
    event.stopPropagation();

    const confirmed = window.confirm(`Delete "${chatroom.name}"? This will remove its messages and posts.`);
    if (!confirmed) return;

    try {
      setError(null);
      const response = await apiDeleteChatroom(chatroom._id);

      if (response.success) {
        setChatrooms((prev) => prev.filter((room) => room._id !== chatroom._id));
      } else {
        setError(response.message || 'Failed to delete chatroom');
      }
    } catch (error) {
      console.error('Failed to delete chatroom:', error);
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to delete chatroom';
      setError(errorMsg);
    }
  };

  const handleCreateChatroom = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Name and description are required');
      return;
    }

    if (formData.isPrivate && formData.password.trim().length < 4) {
      setError('Private chatroom password must be at least 4 characters');
      return;
    }

    try {
      setError(null); // Clear previous errors
      const randomColor = predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
      console.log('Creating chatroom:', { name: formData.name, description: formData.description, color: randomColor });
      
      const response = await apiCreateChatroom(
        formData.name,
        formData.description,
        randomColor,
        formData.isPrivate,
        formData.password
      );
      console.log('Create chatroom response:', response);
      
      if (response && response.success && response.data) {
        console.log('Chatroom created successfully:', response.data);
        setChatrooms((prev) => [response.data, ...prev]);
        setFormData({ name: '', description: '', isPrivate: false, password: '' });
        setShowCreateModal(false);
      } else {
        console.error('Invalid response structure:', response);
        setError(response?.message || 'Failed to create chatroom. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create chatroom:', error);
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to create chatroom';
      setError(errorMsg);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJoinPrivateChatroom = async (e) => {
    e.preventDefault();

    if (!joinRoomName.trim()) {
      setError('Enter the private chatroom name');
      return;
    }

    if (!joinPassword.trim()) {
      setError('Enter the private chatroom password');
      return;
    }

    try {
      setError(null);
      const response = await apiJoinPrivateChatroom(joinRoomName.trim(), joinPassword.trim());

      if (response.success && response.data) {
        setChatrooms((prev) => {
          const alreadyListed = prev.some((room) => room._id === response.data._id);
          if (alreadyListed) {
            return prev.map((room) => (room._id === response.data._id ? response.data : room));
          }
          return [response.data, ...prev];
        });
        setShowJoinModal(false);
        setJoinRoomName('');
        setJoinPassword('');
        onSelectCategory(response.data);
      } else {
        setError(response.message || 'Failed to join chatroom');
      }
    } catch (error) {
      console.error('Failed to join private chatroom:', error);
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to join chatroom';
      setError(errorMsg);
    }
  };

  if (loading) {
    return <div className="page"><p>Loading chatrooms...</p></div>;
  }

  return (
    <div className="chatroom-categories-page">
      <div className="categories-header">
        <div className="header-top">
          <div>
            <h1>Study Chatrooms</h1>
            <p>Join a study group and connect with classmates</p>
          </div>
          <div className="header-actions">
            <button className="join-chatroom-header-btn" onClick={() => openJoinModal()}>
              Join Chatroom
            </button>
            <button className="create-chatroom-btn" onClick={() => setShowCreateModal(true)}>
              + Create Chatroom
            </button>
          </div>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="categories-grid">
        {chatrooms.length === 0 ? (
          <p>No chatrooms available. Be the first to create one!</p>
        ) : (
          chatrooms.map((chatroom) => (
            <div
              key={chatroom._id}
              className={`category-card ${chatroom.isCustom ? 'custom' : ''}`}
              onClick={() => handleSelectCategory(chatroom)}
              style={{ '--card-color': chatroom.color }}
            >
              <div className="category-color-bar" style={{ backgroundColor: chatroom.color }}></div>

              <div className="category-content">
                {chatroom.isCustom && <span className="custom-badge">✨ Custom</span>}
                {chatroom.isPrivate && <span className="private-badge">🔒 Private</span>}
                {!chatroom.isPrivate && <span className="public-badge">🔓 Public</span>}
                <h3>{chatroom.name}</h3>
                <p className="category-description">{chatroom.description}</p>

                <div className="category-stats">
                  <div className="stat">
                    <span className="stat-label">Members</span>
                    <span className="stat-value">{chatroom.memberCount || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Active</span>
                    <span className="stat-value active">{chatroom.activeNow || 0}</span>
                  </div>
                </div>

                <button
                  className="join-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSelectCategory(chatroom);
                  }}
                >
                  Join Chatroom →
                </button>
                {canDeleteChatroom(chatroom) && (
                  <button
                    type="button"
                    className="delete-chatroom-btn"
                    onClick={(event) => handleDeleteChatroom(event, chatroom)}
                  >
                    Delete Chatroom
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="categories-footer">
        <p>💡 Tip: Each chatroom has its own posts and discussion thread. Start conversations and find study partners!</p>
      </div>

      {/* Create Chatroom Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create a New Chatroom</h2>
            {error && <p className="modal-error">{error}</p>}
            <form onSubmit={handleCreateChatroom} className="create-chatroom-form">
              <div className="form-group">
                <label htmlFor="chatroom-name">Chatroom Name</label>
                <input
                  id="chatroom-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Python Study Group, Organic Chem Help"
                  maxLength={50}
                  required
                />
                <span className="char-count">{formData.name.length}/50</span>
              </div>

              <div className="form-group">
                <label htmlFor="chatroom-description">Description</label>
                <textarea
                  id="chatroom-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What is this chatroom about? Who should join?"
                  maxLength={150}
                  rows={3}
                  required
                />
                <span className="char-count">{formData.description.length}/150</span>
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="chatroom-privacy">
                  <input
                    id="chatroom-privacy"
                    type="checkbox"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({
                      ...formData,
                      isPrivate: e.target.checked,
                      password: e.target.checked ? formData.password : ''
                    })}
                  />
                  <span className="checkbox-label">Private Chatroom</span>
                </label>
                <p className="privacy-hint">
                  {formData.isPrivate 
                    ? '🔒 Only you and invited members can access this chatroom' 
                    : '🔓 Anyone can discover and join this chatroom'}
                </p>
              </div>

              {formData.isPrivate && (
                <div className="form-group">
                  <label htmlFor="chatroom-password">Private Password</label>
                  <input
                    id="chatroom-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter a password members will use to join"
                    minLength={4}
                    required={formData.isPrivate}
                  />
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn cancel"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '', isPrivate: false, password: '' });
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn create">
                  Create Chatroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Join Private Chatroom</h2>
            {error && <p className="modal-error">{error}</p>}
            <form onSubmit={handleJoinPrivateChatroom} className="create-chatroom-form">
              <div className="form-group">
                <label htmlFor="join-chatroom-name">Chatroom Name</label>
                <input
                  id="join-chatroom-name"
                  type="text"
                  value={joinRoomName}
                  onChange={(e) => setJoinRoomName(e.target.value)}
                  placeholder="Enter the exact private chatroom name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="join-chatroom-password">Password</label>
                <input
                  id="join-chatroom-password"
                  type="password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  placeholder="Enter the private chatroom password"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn cancel"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinRoomName('');
                    setJoinPassword('');
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn create">
                  Join Chatroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatroomCategories;
