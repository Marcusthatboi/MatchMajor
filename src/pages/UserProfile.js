import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUserSurvey } from '../api/surveys';
import './Profile.css';

const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const InfoItem = ({ label, value }) => (
  <div className="info-group">
    <label>{label}: {value || 'Not specified'}</label>
  </div>
);

const UserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserSurvey(userId);
        const account = response.user || response.survey?.userId || {};
        const survey = response.survey || {};
        setProfile({ ...account, ...survey, userId: account._id || userId });
        setError(null);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError(err.message || 'Could not load this profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error || !profile) {
    return <div className="error">{error || 'Unable to load profile'}</div>;
  }

  const displayName = profile.name || profile.username || 'Student';
  const avatarUrl = profile.profilePhoto || profile.avatar || profile.image || null;

  return (
    <div className="profile-page readonly-profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${displayName}'s avatar`} />
          ) : (
            getInitials(displayName)
          )}
        </div>
        <h1>{displayName}</h1>
        <p>Student profile</p>
        <Link to="/posts" className="profile-secondary-link profile-header-link">Back to Posts</Link>
      </div>

      <div className="profile-content">
        <div className="readonly-profile-grid">
          <div className="profile-info">
            <h2>Basic Information</h2>
            <InfoItem label="Username" value={profile.username} />
            <InfoItem label="Name" value={profile.name} />
            <InfoItem label="Major" value={profile.major} />
            <InfoItem label="Year" value={profile.year} />
          </div>

          <div className="profile-info">
            <h2>Bio</h2>
            <div className="info-group">
              <p>{profile.bio || profile.goals || 'No bio has been added yet.'}</p>
            </div>
          </div>

          <div className="profile-info">
            <h2>Study Preferences</h2>
            <InfoItem label="Current Classes" value={profile.currentClasses || profile.currentCourses} />
            <InfoItem label="Study Goals" value={profile.studyGoals} />
            <InfoItem label="Study Location" value={profile.studyLocation} />
            <InfoItem label="Study Times" value={profile.studyTimes} />
            <InfoItem label="Ideal Group Size" value={profile.idealGroupSize} />
            <InfoItem label="Format" value={profile.virtualOrInPerson || profile.studyMode} />
            <InfoItem label="Study Style" value={profile.studyStyle} />
          </div>

          <div className="profile-info">
            <h2>Roommate Preferences</h2>
            <InfoItem label="Sleep Schedule" value={profile.sleepSchedule} />
            <InfoItem label="Cleanliness" value={profile.cleanliness} />
            <InfoItem label="Visitor Policy" value={profile.visitorPolicy || profile.vistors || profile.visitors} />
            <InfoItem label="Shared or Separate Items" value={profile.items} />
            <InfoItem label="Pets" value={profile.pets} />
            <InfoItem label="Allergies" value={profile.allergies} />
            <InfoItem label="Campus Preference" value={profile.campusSelection} />
            <InfoItem label="Social Preference" value={profile.socialBattery} />
            <InfoItem label="Hobbies" value={profile.hobbies} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
