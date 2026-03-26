import React, { useState } from 'react';
import './ChatRoom.css';

const ChatRoom = () => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Alex', text: 'Hi team! Who is ready for a coding session today?' },
    { id: 2, user: 'You', text: 'I am! Let’s meet at 5pm.' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), user: 'You', text: input.trim() }]);
    setInput('');
  };

  return (
    <div className="chat-page">
      <h1>Study Chatroom</h1>
      <div className="chat-box">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.user === 'You' ? 'self' : ''}`}>
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
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
    </div>
  );
};

export default ChatRoom;
