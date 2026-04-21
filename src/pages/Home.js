"<!-- +// client/src/pages/Home.js -->"
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMatches } from '../api/matches';
import { getPostsByChatroom as getPosts } from '../api/posts';
import { getMessages } from '../api/chat';
import './Home.css';

const Home = () => {
  const [matches, setMatches] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionErrors, setSectionErrors] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);

      const [matchesResult, postsResult, messagesResult] = await Promise.allSettled([
        getMatches(),
        getPosts(2),
        getMessages(3)
      ]);

      const nextErrors = {};

      if (matchesResult.status === 'fulfilled') {
        setMatches(matchesResult.value.data || []);
      } else {
        console.error('Error fetching home matches:', matchesResult.reason);
        nextErrors.matches = 'Could not load matches';
      }

      if (postsResult.status === 'fulfilled') {
        setPosts(postsResult.value.data || []);
      } else {
        console.error('Error fetching home posts:', postsResult.reason);
        nextErrors.posts = 'Could not load posts';
      }

      if (messagesResult.status === 'fulfilled') {
        setMessages(messagesResult.value.data || []);
      } else {
        console.error('Error fetching home messages:', messagesResult.reason);
        nextErrors.messages = 'Could not load messages';
      }

      setSectionErrors(nextErrors);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to MatchMajor</h1>
          <p>Connect with fellow students, find study partners, and discover tech solutions for your academic journey</p>
          <Link to="/matches" className="cta-button">Find Your Match</Link>
        </div>
      </section>

      <section className="social-modules">
        <div className="modules-grid">
          <div className="module matches-module">
            <h2>Your Matches</h2>
            <p>Students who align with your study goals</p>
            <div className="matches-preview">
              {loading ? (
                <p style={{ color: '#999' }}>Loading matches...</p>
              ) : sectionErrors.matches ? (
                <p style={{ color: '#d32f2f' }}>{sectionErrors.matches}</p>
              ) : matches.length > 0 ? (
                matches.slice(0, 2).map((match) => (
                  <div key={match._id} className="match-preview">
                    <h4>{match.name || match.username}</h4>
                    <p>{match.major || 'Major not specified'}</p>
                    <span className="compatibility">{Math.round(match.compatibilityScore || 0)}% match</span>
                  </div>
                ))
              ) : (
                <p style={{ color: '#999' }}>No matches yet. Complete your survey!</p>
              )}
            </div>
            <Link to="/matches" className="module-link">View All Matches</Link>
          </div>

          <div className="module posts-module">
            <h2>Community Posts</h2>
            <p>Latest updates from fellow students</p>
            <div className="posts-preview">
              {loading ? (
                <p style={{ color: '#999' }}>Loading posts...</p>
              ) : sectionErrors.posts ? (
                <p style={{ color: '#d32f2f' }}>{sectionErrors.posts}</p>
              ) : posts.length > 0 ? (
                posts.slice(0, 2).map((post) => (
                  <div key={post._id} className="post-preview">
                    <p className="post-author">{post.author}</p>
                    <p className="post-content">{post.content.substring(0, 60)}...</p>
                    <span className="post-likes">❤️ {post.likes || 0}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: '#999' }}>No posts yet. Be the first to share!</p>
              )}
            </div>
            <Link to="/posts" className="module-link">View All Posts</Link>
          </div>

          <div className="module chat-module">
            <h2>Study Chatroom</h2>
            <p>Connect with study partners</p>
            <div className="chat-preview">
              {loading ? (
                <p style={{ color: '#999', fontSize: '0.9rem' }}>Loading messages...</p>
              ) : sectionErrors.messages ? (
                <p style={{ color: '#d32f2f', fontSize: '0.9rem' }}>{sectionErrors.messages}</p>
              ) : messages.length > 0 ? (
                messages.slice(-3).map((msg) => (
                  <div key={msg._id} className="chat-message-preview">
                    <strong>{msg.user}:</strong> {msg.text}
                  </div>
                ))
              ) : (
                <p style={{ color: '#999', fontSize: '0.9rem' }}>No messages yet. Start a conversation!</p>
              )}
            </div>
            <Link to="/chat" className="module-link">Join Chatroom</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
