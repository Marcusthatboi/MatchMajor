import React, { useState, useEffect } from 'react';
import { getAllChatrooms, createChatroom as apiCreateChatroom } from '../api/chatrooms';
import './ChatroomCategories.css';

const ChatroomCategories = ({ onSelectCategory, user }) => {
  const [chatrooms, setChatrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false
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
        setChatrooms(response.data);
      }
    } catch (error) {
      console.error('Failed to load chatrooms:', error);
      setError('Failed to load chatrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (chatroom) => {
    onSelectCategory(chatroom);
  };

  const handleCreateChatroom = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Name and description are required');
      return;
    }

    try {
      setError(null); // Clear previous errors
      const randomColor = predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
      console.log('Creating chatroom:', { name: formData.name, description: formData.description, color: randomColor });
      
      const response = await apiCreateChatroom(formData.name, formData.description, randomColor, formData.isPrivate);
      console.log('Create chatroom response:', response);
      
      if (response && response.success && response.data) {
        console.log('Chatroom created successfully:', response.data);
        setChatrooms((prev) => [response.data, ...prev]);
        setFormData({ name: '', description: '', isPrivate: false });
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
          <button className="create-chatroom-btn" onClick={() => setShowCreateModal(true)}>
            + Create Chatroom
          </button>
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

                <button className="join-btn">
                  Join Chatroom →
                </button>
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
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  />
                  <span className="checkbox-label">Private Chatroom</span>
                </label>
                <p className="privacy-hint">
                  {formData.isPrivate 
                    ? '🔒 Only you and invited members can access this chatroom' 
                    : '🔓 Anyone can discover and join this chatroom'}
                </p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn cancel"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '', isPrivate: false });
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
    </div>
  );
};

export default ChatroomCategories;
