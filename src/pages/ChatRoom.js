import React, { useState, useEffect, useRef } from 'react';
import ChatroomCategories from './ChatroomCategories';
import { sendMessage as apiSendMessage, getMessages } from '../api/messages';
import { createPost as apiCreatePost, getPosts, likePost as apiLikePost } from '../api/chatroomPosts';
import './ChatRoom.css';

const ChatRoom = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const messagesEndRef = useRef(null);

  // Load messages and posts when chatroom is selected
  useEffect(() => {
    if (selectedCategory?.id) {
      loadMessages();
      loadPosts();
    }
  }, [selectedCategory]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await getMessages(selectedCategory.id);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await getPosts(selectedCategory.id);
      if (response.success) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    
    try {
      const response = await apiSendMessage(selectedCategory.id, input.trim());
      if (response.success) {
        setMessages((prev) => [...prev, response.data]);
        setInput('');
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newContent.trim() || !user) return;

    try {
      const response = await apiCreatePost(selectedCategory.id, newContent.trim());
      if (response.success) {
        setPosts((prev) => [response.data, ...prev]);
        setNewContent('');
        setShowPostModal(false);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await apiLikePost(postId);
      if (response.success) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, likeCount: response.data.likeCount, likes: response.data.likes } : post
          )
        );
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {!selectedCategory ? (
        <ChatroomCategories onSelectCategory={setSelectedCategory} />
      ) : (
        <div className="chat-page">
          <div className="chat-header">
            <button
              className="back-to-categories-btn"
              onClick={() => setSelectedCategory(null)}
              style={{ '--btn-color': selectedCategory.color }}
            >
              ← Back to Chatrooms
            </button>
            <div>
              <h1>
                <span className="room-color-dot" style={{ backgroundColor: selectedCategory.color }}></span>
                {selectedCategory.name}
              </h1>
              <p className="room-description">{selectedCategory.description}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="chat-tabs">
            <button
              className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              💬 Chat
            </button>
            <button
              className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              📌 Posts
            </button>
          </div>

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <>
              <div className="chat-box">
                {loading && <p>Loading messages...</p>}
                {messages.map((msg) => (
                  <div key={msg._id} className={`chat-message ${msg.user?._id === user?._id ? 'self' : ''}`}>
                    <strong>{msg.username}:</strong> {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-area">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Write a message..."
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <>
              <div className="posts-topbar">
                <button className="create-post-btn" onClick={() => setShowPostModal(true)}>
                  + Create Post
                </button>
              </div>

              <div className="post-list">
                {posts.length === 0 ? (
                  <p className="no-posts">No posts yet. Be the first to share something!</p>
                ) : (
                  posts.map((post) => (
                    <article key={post._id} className="post-card">
                      <div className="post-header">
                        <p className="post-author">{post.authorName}</p>
                        <p className="post-time">{formatTime(post.createdAt)}</p>
                      </div>
                      <p className="post-content">{post.content}</p>
                      <div className="post-footer">
                        <button onClick={() => handleLike(post._id)} className="like-btn">
                          ❤️ {post.likeCount}
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </>
          )}

          {/* Create Post Modal */}
          {showPostModal && (
            <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Create a Post</h2>
                <form onSubmit={handleCreatePost} className="create-post-form">
                  <textarea
                    className="create-textarea"
                    placeholder="What's on your mind? Ask a question, share an idea, or find study partners..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={5}
                    maxLength={1000}
                  />
                  <div className="modal-actions">
                    <button type="button" className="btn cancel" onClick={() => setShowPostModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn submit">
                      Post
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatRoom;
