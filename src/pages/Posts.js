import React, { useState } from 'react';
import './Posts.css';

const initialPosts = [
  { id: 1, author: 'Alex', content: 'Working on my AI portfolio today! Anyone want to collaborate?', likes: 14 },
  { id: 2, author: 'Jordan', content: 'Finished a data analysis project on college admissions trends.', likes: 21 },
  { id: 3, author: 'Sam', content: 'Looking for a frontend partner for a 2-week build sprint.', likes: 18 },
];

const Posts = () => {
  const [posts, setPosts] = useState(initialPosts);

  const handleLike = (id) => {
    setPosts((prev) => prev.map((post) => (
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    )));
  };

  return (
    <div className="posts-page">
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
    </div>
  );
};

export default Posts;
