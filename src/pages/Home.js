"<!-- +// client/src/pages/Home.js -->"
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMatches } from '../api/matches';
import { getPostsByChatroom as getPosts } from '../api/posts';
import { getMessages } from '../api/chat';
import { getAllChatrooms } from '../api/chatrooms';
import './Home.css';

const findRoomByKeywords = (rooms, keywords) => {
  return rooms.find(room => {
    const searchable = `${room.name || ''} ${room.description || ''} ${room.category || ''}`.toLowerCase();
    return keywords.some(keyword => searchable.includes(keyword));
  });
};

const Home = () => {
  const [matches, setMatches] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionErrors, setSectionErrors] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const chatroomsResult = await getAllChatrooms().catch(error => {
        console.error('Error fetching home chatrooms:', error);
        return { success: false, data: [] };
      });
      const chatrooms = chatroomsResult.success ? chatroomsResult.data || [] : [];
      const postsRoom = findRoomByKeywords(chatrooms, ['roommate', 'roomate', 'housing', 'study', 'posts']) || chatrooms[0];
      const messagesRoom = findRoomByKeywords(chatrooms, ['study', 'group', 'class', 'project']) || postsRoom;

      const [matchesResult, postsResult, messagesResult] = await Promise.allSettled([
        getMatches(),
        postsRoom?._id ? getPosts(postsRoom._id, 2) : Promise.resolve({ success: true, data: [] }),
        messagesRoom?._id ? getMessages(messagesRoom._id, 3) : Promise.resolve({ success: true, data: [] })
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
                    <p className="post-author">{post.authorName || post.author?.username || 'Anonymous'}</p>
                    <p className="post-content">{post.content.substring(0, 60)}...</p>
                    <span className="post-likes">Likes: {post.likeCount || post.likes?.length || 0}</span>
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
                    <strong>{msg.username || msg.user?.username || 'Anonymous'}:</strong> {msg.text}
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
