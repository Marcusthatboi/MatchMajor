import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMatches } from '../api/matches';
import './Matches.css';

const Matches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await getMatches();
        if (response.success) {
          setMatches(response.data);
        } else {
          setError('Failed to load matches');
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError('An error occurred while loading matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getMatchProfileId = (match) => match.userId || match._id;

  const openProfile = (matchId) => {
    if (matchId) {
      navigate(`/profile/${matchId}`, {
        state: {
          returnTo: '/matches',
          returnLabel: 'Back to Matches'
        }
      });
    }
  };

  const handleMatchCardClick = (event, matchId) => {
    if (event.target.closest('a, button')) {
      return;
    }

    openProfile(matchId);
  };

  const handleMatchCardKeyDown = (event, matchId) => {
    if (event.key === 'Enter') {
      openProfile(matchId);
    }
  };

  if (loading) {
    return (
      <div className="matches-page">
        <h1>Your Matches</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matches-page">
        <h1>Your Matches</h1>
        <p style={{ color: '#d32f2f' }}>Error: {error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="matches-page">
        <h1>Your Matches</h1>
        <p>No matches found. Please complete your profile to get better recommendations.</p>
        <Link to="/survey" style={{ color: 'var(--primary-cyan)' }}>Complete Survey</Link>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <div className="matches-header">
        <h1>Your Matches</h1>
        <p>These students align with your study goals.</p>
      </div>
      <div className="matches-grid">
        {matches.map((match) => (
          <div
            key={match._id}
            className="match-card"
            role="link"
            tabIndex={0}
            onClick={(event) => handleMatchCardClick(event, getMatchProfileId(match))}
            onKeyDown={(event) => handleMatchCardKeyDown(event, getMatchProfileId(match))}
          >
            <div className="match-avatar-container">
              {match.profilePhoto ? (
                <img src={match.profilePhoto} alt={`${match.username} avatar`} className="match-avatar" />
              ) : (
                <div className="match-avatar-initials">{getInitials(match.username)}</div>
              )}
            </div>
            <h3>{match.name || match.username}</h3>
            <p><strong>Major:</strong> {match.major || 'Not specified'}</p>
            <p><strong>Year:</strong> {match.year || 'Not specified'}</p>
            <p><strong>Experience:</strong> {match.experience || 'Not specified'}</p>
            {match.bio && <p><strong>Bio:</strong> {match.bio}</p>}
            <p className="compatibility-score" style={{ color: 'var(--primary-cyan)', fontWeight: 'bold' }}>
              ✓ {match.compatibilityScore}% Match
            </p>
            <Link to="/chat" className="chat-link">Chat</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;
