import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/index';
import './Profile.css';

const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const Profile = ({ user }) => {
  const avatarUrl = user?.profilePhoto || user?.avatar || user?.image || null;
  const initials = getInitials(user?.username);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/myorders');
        setOrders(response.data || []);
        setLoading(false);
      } catch (error) {
        setError('Failed to load orders');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  if (loading) {
    return <div className="loading">Loading profile data...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${user.username}'s avatar`} />
          ) : (
            initials
          )}
        </div>
        <h1>My Profile</h1>
      </div>
      
      <div className="profile-content">
        <div className="profile-row profile-row--three">
          <div className="profile-info">
            <h2>Account Information</h2>
            
            <div className="info-group">
              <label>Username: {user.username}</label>
            </div>
            
            <div className="info-group">
              <label>Email: {user.email}</label>
            </div>
            
            <div className="info-group">
              <label>Member Since: {new Date(user.createdAt).toLocaleDateString()}</label>
            </div>
          </div>
          
          <div className="profile-info">
            <h2>User Details</h2>
            
            <div className="info-group">
              <label>Name: {user.name || 'Not specified'}</label>
            </div>

            <div className="info-group">
              <label>Major: {user.major || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Year: {user.year || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Gender: {user.gender || 'Not specified'}</label>
              {/* There can be an "other" option */}
            </div>
          </div>

          <div className="profile-info">
            <h2>Bio</h2>
            {user.goals ? (
              <div className="info-group">
                <p>{user.goals}</p>
              </div>
            ) : (
              <div className="info-group">
                <p className="prompt">Tell us about yourself!</p>
              </div>
            )}
          </div>
        </div>

        <div className="profile-row profile-row--two">
          <div className="profile-info">
            <h2>Roommate Preferences</h2>
            
            <div className="info-group">
              <label>Sleep Schedule: {user.sleepSchedule || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Cleanliness: {user.cleanliness || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Visitor Policy: {user.visitorPolicy || user.vistors || user.visitors || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Shared or Separate Items: {user.items || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Pets: {user.pets || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Allergies: {user.allergies || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>On-Campus or Off-Campus: {user.campusSelection || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Partier/Homebody: {user.socialBattery || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Hobbies: {user.hobbies || 'Not specified'}</label>
            </div>

            <Link to="/survey?section=roommate" className="edit-profile-btn">
              Edit Roommate Preferences
            </Link>
          </div>
          
          <div className="profile-info">
            <h2>Study Preferences</h2>
            
            <div className="info-group">
              <label>Current Classes: {user.currentClasses || user.currentCourses || 'Not specified'}</label>
            </div>

            <div className="info-group">
              <label>Study Goals: {user.studyGoals || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Honors/Special Programs: {user.honors || user.specialPrograms || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Study Location: {user.studyLocation || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Study Times: {user.studyTimes || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Ideal Group Size: {user.idealGroupSize || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Virtual or In-Person: {user.virtualOrInPerson || user.studyMode || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Study Habits: {user.studyHabits || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Study Style: {user.studyStyle || 'Not specified'}</label>
            </div>

            <Link to="/survey?section=study" className="edit-profile-btn">
              Edit Study Preferences
            </Link>
          </div>
        </div>

        <div className="profile-row profile-row--center">
          <div className="profile-info">
            <h2>Additional Information</h2>
              <div className="info-group">
                <p className="prompt">Empty Container</p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
