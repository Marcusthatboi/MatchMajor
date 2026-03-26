import React from 'react';
import { Link } from 'react-router-dom';
import './Matches.css';

const mockMatches = [
  { id: 1, name: 'Alex', skills: 'React, Node.js', common: 87 },
  { id: 2, name: 'Jordan', skills: 'Python, Data Science', common: 75 },
  { id: 3, name: 'Sam', skills: 'UI/UX, Frontend', common: 82 },
];

const Matches = () => {
  return (
    <div className="matches-page">
      <h1>Your Matches</h1>
      <p>These students align with your study goals and interests.</p>
      <div className="matches-grid">
        {mockMatches.map((match) => (
          <div key={match.id} className="match-card">
            <h3>{match.name}</h3>
            <p>Skills: {match.skills}</p>
            <p>Compatibility: {match.common}%</p>
            <Link to="/chat" className="chat-link">Chat</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;
