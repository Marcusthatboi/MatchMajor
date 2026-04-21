import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getSurvey } from '../api/surveys';
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

const Profile = ({ user: userProp }) => {
  const { user: contextUser } = useUser();
  const user = userProp || contextUser;
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mergedUser = profileData || user;
  const avatarUrl = mergedUser?.profilePhoto || mergedUser?.avatar || mergedUser?.image || null;
  const initials = getInitials(mergedUser?.username);
  
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        setError('Unable to load profile');
        return;
      }

      try {
        try {
          const response = await getSurvey();
          const survey = response?.survey || response?.data || null;

          setProfileData(survey ? { ...user, ...survey } : user);
        } catch (surveyError) {
          // If no survey exists yet, still show account info.
          setProfileData(user);
        }
        setError(null);
      } catch (loadError) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user]);
  
  if (loading) {
    return <div className="loading">Loading profile data...</div>;
  }
  
  if (!mergedUser) {
    return <div className="error">Unable to load profile</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${mergedUser.username}'s avatar`} />
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
              <label>Username: {mergedUser.username}</label>
            </div>
            
            <div className="info-group">
              <label>Email: {mergedUser.email}</label>
            </div>
            
            <div className="info-group">
              <label>Member Since: {mergedUser.createdAt ? new Date(mergedUser.createdAt).toLocaleDateString() : 'Not available'}</label>
            </div>
          </div>
          
          <div className="profile-info">
            <h2>User Details</h2>
            
            <div className="info-group">
              <label>Name: {mergedUser.name || 'Not specified'}</label>
            </div>

            <div className="info-group">
              <label>Major: {mergedUser.major || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Year: {mergedUser.year || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Gender: {mergedUser.gender || 'Not specified'}</label>
              {/* There can be an "other" option */}
            </div>
            <Link to="/survey" className="edit-profile-btn">
              Update Information
            </Link>
          </div>

          <div className="profile-info">
            <h2>Bio</h2>
            {(mergedUser.bio || mergedUser.goals) ? (
              <div className="info-group">
                <p>{mergedUser.bio || mergedUser.goals}</p>
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
              <label>Sleep Schedule: {mergedUser.sleepSchedule || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Cleanliness: {mergedUser.cleanliness || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Visitor Policy: {mergedUser.visitorPolicy || mergedUser.vistors || mergedUser.visitors || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Shared or Separate Items: {mergedUser.items || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Pets: {mergedUser.pets || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Allergies: {mergedUser.allergies || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>On-Campus or Off-Campus: {mergedUser.campusSelection || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Partier/Homebody: {mergedUser.socialBattery || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Hobbies: {mergedUser.hobbies || 'Not specified'}</label>
            </div>

            <Link to="/survey/roommate" className="edit-profile-btn">
              Edit Roommate Preferences
            </Link>
          </div>
          
          <div className="profile-info">
            <h2>Study Preferences</h2>
            
            <div className="info-group">
              <label>Current Classes: {mergedUser.currentClasses || mergedUser.currentCourses || 'Not specified'}</label>
            </div>

            <div className="info-group">
              <label>Study Goals: {mergedUser.studyGoals || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Honors/Special Programs: {mergedUser.honors || mergedUser.specialPrograms || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Study Location: {mergedUser.studyLocation || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Study Times: {mergedUser.studyTimes || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Ideal Group Size: {mergedUser.idealGroupSize || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Virtual or In-Person: {mergedUser.virtualOrInPerson || mergedUser.studyMode || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Study Habits: {mergedUser.studyHabits || 'Not specified'}</label>
            </div>
            
            <div className="info-group">
              <label>Study Style: {mergedUser.studyStyle || 'Not specified'}</label>
            </div>

            <Link to="/survey/study" className="edit-profile-btn">
              Edit Study Preferences
            </Link>
          </div>
        </div>

        <div className="profile-row profile-row--center">
          <div className="profile-info">
            <h2>Additional Information</h2>
              <div className="info-group">
                <p className="prompt">
                  Empty Conatainer for Future Profile Sections (maybe liked profiles)
                </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
