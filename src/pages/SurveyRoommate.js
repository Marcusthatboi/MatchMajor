import React from 'react';
import { useSurveyForm } from './useSurveyForm';
import './Survey.css';

const validateRoommateSurvey = (formData) => {
  if (
    !formData.sleepSchedule ||
    !formData.cleanliness ||
    !formData.visitorPolicy ||
    !formData.items ||
    !formData.pets ||
    !formData.allergies ||
    !formData.campusSelection ||
    !formData.socialBattery ||
    !formData.hobbies
  ) {
    return 'Please fill in all roommate preference fields before saving.';
  }

  return null;
};

const SurveyRoommate = () => {
  const { formData, loading, error, initializing, handleChange, submitSurvey } = useSurveyForm('/profile');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitSurvey(validateRoommateSurvey);
  };

  if (initializing) {
    return <div className="loading-container"><div className="spinner">Loading survey...</div></div>;
  }

  return (
    <div className="survey-page">
      <div className="survey-container">
        <h1>Roommate Preferences Survey</h1>
        <p>Update your roommate preferences to make better matches.</p>

        <form onSubmit={handleSubmit} className="survey-form">
          <div className="form-group">
            <label htmlFor="sleepSchedule">Sleep Schedule</label>
            <select id="sleepSchedule" name="sleepSchedule" value={formData.sleepSchedule} onChange={handleChange} required>
              <option value="">Select schedule</option>
              <option value="Early Bird">Early Bird</option>
              <option value="Night Owl">Night Owl</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cleanliness">Cleanliness Level</label>
            <select id="cleanliness" name="cleanliness" value={formData.cleanliness} onChange={handleChange} required>
              <option value="">Select level</option>
              <option value="Very Tidy">Very Tidy</option>
              <option value="Tidy">Tidy</option>
              <option value="Average">Average</option>
              <option value="Messy">Messy</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="visitorPolicy">Visitor Policy</label>
            <select id="visitorPolicy" name="visitorPolicy" value={formData.visitorPolicy} onChange={handleChange} required>
              <option value="">Select policy</option>
              <option value="No Visitors">No Visitors</option>
              <option value="Occasionally">Occasionally</option>
              <option value="Frequently">Frequently</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="items">Item Sharing Preference</label>
            <select id="items" name="items" value={formData.items} onChange={handleChange} required>
              <option value="">Choose sharing style</option>
              <option value="Shared">Shared Items</option>
              <option value="Separate">Separate Items</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pets">Pet Preference</label>
            <select id="pets" name="pets" value={formData.pets} onChange={handleChange} required>
              <option value="">Select preference</option>
              <option value="No Pets">No Pets</option>
              <option value="Has Pets">Has Pets</option>
              <option value="Prefer No Pets">Prefer No Pets</option>
              <option value="Comfortable with Pets">Comfortable with Pets</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="allergies">Allergies</label>
            <input id="allergies" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="List any allergies or None" required />
          </div>

          <div className="form-group">
            <label htmlFor="campusSelection">On-Campus or Off-Campus?</label>
            <select id="campusSelection" name="campusSelection" value={formData.campusSelection} onChange={handleChange} required>
              <option value="">Choose location</option>
              <option value="On-Campus">On-Campus</option>
              <option value="Off-Campus">Off-Campus</option>
              <option value="Either">Either</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="socialBattery">Social Personality</label>
            <select id="socialBattery" name="socialBattery" value={formData.socialBattery} onChange={handleChange} required>
              <option value="">Select type</option>
              <option value="Partier">Partier</option>
              <option value="Homebody">Homebody</option>
              <option value="Balanced">Balanced</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="hobbies">Hobbies</label>
            <textarea id="hobbies" name="hobbies" value={formData.hobbies} onChange={handleChange} placeholder="Share your hobbies" rows="3" required />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>

        {error && <div className="error-message" style={{ marginTop: '20px', color: '#d32f2f', fontWeight: 'bold' }}>{error}</div>}
      </div>
    </div>
  );
};

export default SurveyRoommate;
