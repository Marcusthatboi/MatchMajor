import React, { useState } from 'react';
import './Posts.css';

const initialPosts = [
  { id: 1, author: 'Alex', content: 'Working on my AI portfolio today! Anyone want to collaborate?', likes: 14 },
  { id: 2, author: 'Jordan', content: 'Finished a data analysis project on college admissions trends.', likes: 21 },
  { id: 3, author: 'Sam', content: 'Looking for a frontend partner for a 2-week build sprint.', likes: 18 },
];

const Posts = () => {
  const [posts, setPosts] = useState(initialPosts);
  const [showModal, setShowModal] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleLike = (id) => {
    setPosts((prev) => prev.map((post) => (
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    )));
  };

  const openCreate = () => setShowModal(true);

  const handleSubmitPost = (e) => {
    e.preventDefault();
    const content = newContent.trim();
    if (!content) return;
    const author = newAuthor.trim() || 'Anonymous';
    const newPost = { id: Date.now(), author, content, likes: 0 };
    setPosts((prev) => [newPost, ...prev]);
    setNewAuthor('');
    setNewContent('');
    setShowModal(false);
  };

  return (
    <div className="posts-page">
      <div className="posts-topbar">
        <button className="create-post-btn" onClick={openCreate}>+ Create Post</button>
      </div>

      <h1>Community Posts</h1>

      <div className="post-list">
        {posts.map((post) => (
          <article key={post.id} className="post-card">
            <p className="post-info">{post.author}</p>
            <p>{post.content}</p>
            <div className="post-footer">
              <button onClick={() => handleLike(post.id)}>❤️ {post.likes}</button>
            </div>
          </article>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Post</h2>
            <form onSubmit={handleSubmitPost} className="create-post-form">
              <input
                className="create-input"
                placeholder="Your name (optional)"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                maxLength={60}
              />
              <textarea
                className="create-textarea"
                placeholder="What's on your mind?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={5}
                maxLength={1000}
              />
              <div className="modal-actions">
                <button type="button" className="btn cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn submit">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
