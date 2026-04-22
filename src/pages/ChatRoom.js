import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChatroomCategories from './ChatroomCategories';
import { sendMessage as apiSendMessage, getMessages } from '../api/messages';
import './ChatRoom.css';

const getMemberId = (member) => (typeof member === 'object' ? member?._id : member);

const getMemberName = (member) => (
  typeof member === 'object' ? member?.username || member?.name || 'Student' : 'Student'
);

const ChatRoom = ({ user }) => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(location.state?.selectedChatroom || null);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedCategory?._id) {
      loadMessages();
    }
  }, [selectedCategory?._id]);

  useEffect(() => {
    if (location.state?.selectedChatroom) {
      setSelectedCategory(location.state.selectedChatroom);
      setActiveTab('chat');
    }
  }, [location.state]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await getMessages(selectedCategory._id);
      if (response.success) {
        setMessages(response.data);
      } else {
        console.error('Failed to load messages:', response.message);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    try {
      const response = await apiSendMessage(selectedCategory._id, input.trim());

      if (response.success) {
        setMessages((prev) => [...prev, response.data]);
        setInput('');
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert(`Failed to send message: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please check console for details.');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getUserAvatar = (message) => {
    if (message.user?.profilePhoto) {
      return message.user.profilePhoto;
    }
    return null;
  };

  const members = selectedCategory?.members || [];

  const isMemberOnline = (member) => {
    const memberId = getMemberId(member);
    return Boolean(member?.isOnline) || (user?._id && memberId?.toString() === user._id.toString());
  };

  return (
    <>
      {!selectedCategory ? (
        <ChatroomCategories onSelectCategory={setSelectedCategory} user={user} />
      ) : (
        <div className="chat-page">
          <div className="chat-header">
            <button
              className="back-to-categories-btn"
              onClick={() => setSelectedCategory(null)}
              style={{ '--btn-color': selectedCategory.color }}
            >
              Back to Chatrooms
            </button>
            <div>
              <h1>
                <span className="room-color-dot" style={{ backgroundColor: selectedCategory.color }}></span>
                {selectedCategory.name}
              </h1>
              <p className="room-description">{selectedCategory.description}</p>
            </div>
          </div>

          <div className="chat-tabs">
            <button
              className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              Members
            </button>
          </div>

          {activeTab === 'chat' && (
            <>
              <div className="chat-box">
                {loading && <p>Loading messages...</p>}
                {messages.map((msg) => (
                  <div key={msg._id} className={`chat-message ${msg.user?._id === user?._id ? 'self' : ''}`}>
                    <div className="message-avatar">
                      {getUserAvatar(msg) ? (
                        <img src={getUserAvatar(msg)} alt={msg.username} />
                      ) : (
                        <div className="avatar-initials">{getInitials(msg.username)}</div>
                      )}
                    </div>
                    <div className="message-content">
                      <strong className="message-username">{msg.username}</strong>
                      <p className="message-text">{msg.text}</p>
                    </div>
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

          {activeTab === 'members' && (
            <div className="members-list">
              <h2>Members</h2>
              {members.length === 0 ? (
                <p className="members-empty">No members found.</p>
              ) : (
                members.map((member) => {
                  const memberName = getMemberName(member);
                  const online = isMemberOnline(member);

                  return (
                    <div className="member-row" key={getMemberId(member) || memberName}>
                      <span className={`member-online-dot ${online ? 'online' : ''}`} aria-hidden="true" />
                      <span className="member-name">{memberName}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatRoom;
