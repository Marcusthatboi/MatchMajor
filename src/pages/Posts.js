import React, { useState } from 'react';
import './Posts.css';

const postCategories = {
  roommate: {
    switchLabel: 'Roommates',
    pageTitle: 'Find a Roommate',
    posts: [
      {
        id: 1,
        name: 'John Doe',
        year: 'Sophomore',
        major: 'Marketing Major',
        bio: 'Prefers a tidy shared space, early classes, and a quiet weeknight routine.',
        score: '71%',
      },
      {
        id: 2,
        name: 'John Doe',
        year: 'Sophomore',
        major: 'Marketing Major',
        bio: 'Looking for a roommate who is social, respectful, and open to apartment hunting soon.',
        score: '71%',
      },
      {
        id: 3,
        name: 'John Doe',
        year: 'Sophomore',
        major: 'Marketing Major',
        bio: 'Would love to live close to campus with someone who values a calm study environment.',
        score: '71%',
      },
      {
        id: 4,
        name: 'John Doe',
        year: 'Sophomore',
        major: 'Marketing Major',
        bio: 'Comfortable sharing chores and coordinating schedules around classes and work.',
        score: '71%',
      },
      {
        id: 5,
        name: 'John Doe',
        year: 'Sophomore',
        major: 'Marketing Major',
        bio: 'Interested in a space with plenty of natural light and a predictable routine.',
        score: '71%',
      },
      {
        id: 6,
        name: 'John Doe',
        year: 'Sophomore',
        major: 'Marketing Major',
        bio: 'Hoping to match with someone organized, communicative, and easygoing.',
        score: '71%',
      },
    ],
  },
  study: {
    switchLabel: 'Study Groups',
    pageTitle: 'Study Together',
    posts: [
      {
        id: 7,
        title: "Jack's Study Group",
        subject: 'Data Structures 101',
        majors: 'Any',
        location: 'Library Room 2B',
        environment: 'Quiet',
        openSeats: 2,
        score: '82%',
      },
      {
        id: 8,
        title: "Sam's Study Group",
        subject: 'Marketing 101',
        majors: 'Business',
        location: 'Business Hall 221',
        environment: 'Social',
        openSeats: 2,
        score: '50%',
      },
      {
        id: 9,
        title: 'Study Group',
        subject: 'Data Structures 101',
        majors: 'Any',
        location: 'Library Room 2B',
        environment: 'Quiet',
        openSeats: 2,
        score: '71%',
      },
      {
        id: 10,
        title: 'Study Group',
        subject: 'Data Structures 101',
        majors: 'Any',
        location: 'Library Room 2B',
        environment: 'Quiet',
        openSeats: 2,
        score: '71%',
      },
    ],
  },
};

const categoryOrder = ['roommate', 'study'];

const AvatarBadge = () => <div className="avatar-badge" aria-hidden="true" />;

const MiniAvatar = () => <div className="mini-avatar" aria-hidden="true" />;

const PlusBadge = () => <div className="plus-badge" aria-hidden="true">+</div>;

const RoommateCard = ({ post }) => (
  <article className="template-card roommate-card">
    <div className="roommate-card-header">
      <AvatarBadge />
      <h2>{post.name}</h2>
    </div>
    <div className="roommate-card-body">
      <p>{post.year}</p>
      <p>{post.major}</p>
      <p className="roommate-card-label">About {post.name.split(' ')[0]}:</p>
      <p className="roommate-card-bio">{post.bio}</p>
    </div>
    <div className="score-badge">{post.score}</div>
  </article>
);

const StudyCard = ({ post }) => (
  <article className="template-card study-card">
    <div className="study-card-body">
      <h2>{post.title}</h2>
      <p><strong>Studying:</strong> {post.subject}</p>
      <p><strong>Majors:</strong> {post.majors}</p>
      <p><strong>Location:</strong> {post.location}</p>
      <p><strong>Environment:</strong> {post.environment}</p>
    </div>
    <div className="study-card-footer">
      <div className="study-card-icons">
        <div className="study-card-action-row">
          <PlusBadge />
          <PlusBadge />
        </div>
        <div className="study-card-member-row">
          <MiniAvatar />
          <MiniAvatar />
        </div>
      </div>
      <p className="study-card-seats">{post.openSeats} Open Seats</p>
    </div>
    <div className="score-badge">{post.score}</div>
  </article>
);

const Posts = () => {
  const [activeCategory, setActiveCategory] = useState('roommate');
  const activeConfig = postCategories[activeCategory];

  return (
    <div className="posts-page">
      <header className="posts-header">
        <div className="posts-slider" role="tablist" aria-label="Post categories">
          <div className={`posts-slider-track ${activeCategory === 'study' ? 'study-active' : ''}`}>
            <span className="posts-slider-thumb" aria-hidden="true" />
            {categoryOrder.map((category) => (
              <button
                key={category}
                type="button"
                className={`posts-slider-option ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
                role="tab"
                aria-selected={activeCategory === category}
              >
                {postCategories[category].switchLabel}
              </button>
            ))}
          </div>
        </div>

        <h1>{activeConfig.pageTitle}</h1>
      </header>

      <section className={`posts-grid ${activeCategory}-grid`}>
        {activeCategory === 'roommate' && activeConfig.posts.map((post) => (
          <RoommateCard key={post.id} post={post} />
        ))}

        {activeCategory === 'study' && activeConfig.posts.map((post) => (
          <StudyCard key={post.id} post={post} />
        ))}
      </section>
    </div>
  );
};

export default Posts;
