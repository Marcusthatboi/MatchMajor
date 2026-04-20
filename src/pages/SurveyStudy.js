import React from 'react';
import { useSurveyForm } from './useSurveyForm';
import './Survey.css';

const validateStudySurvey = (formData) => {
  if (
    !formData.currentClasses ||
    !formData.studyGoals ||
    !formData.honors ||
    !formData.studyLocation ||
    !formData.studyTimes ||
    !formData.idealGroupSize ||
    !formData.virtualOrInPerson ||
    !formData.studyHabits ||
    !formData.studyStyle
  ) {
    return 'Please fill in all study preference fields before saving.';
  }

  return null;
};

const SurveyStudy = () => {
  const { formData, loading, error, initializing, handleChange, submitSurvey } = useSurveyForm('/profile');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitSurvey(validateStudySurvey);
  };

  if (initializing) {
    return <div className="loading-container"><div className="spinner">Loading survey...</div></div>;
  }

  return (
    <div className="survey-page">
      <div className="survey-container">
        <h1>Study Preferences Survey</h1>
        <p>Update your study preferences for better study partner matching.</p>

        <form onSubmit={handleSubmit} className="survey-form">
          <div className="form-group">
            <label htmlFor="currentClasses">Current Classes</label>
            <input id="currentClasses" name="currentClasses" value={formData.currentClasses} onChange={handleChange} placeholder="e.g. Calculus, Data Structures" required />
          </div>

          <div className="form-group">
            <label htmlFor="studyGoals">Study Goals</label>
            <textarea id="studyGoals" name="studyGoals" value={formData.studyGoals} onChange={handleChange} placeholder="What are your study goals?" rows="3" required />
          </div>

          <div className="form-group">
            <label htmlFor="honors">Honors or Special Programs</label>
            <input id="honors" name="honors" value={formData.honors} onChange={handleChange} placeholder="e.g. Honors College, Research Program" required />
          </div>

          <div className="form-group">
            <label htmlFor="studyLocation">Study Location</label>
            <input id="studyLocation" name="studyLocation" value={formData.studyLocation} onChange={handleChange} placeholder="e.g. library, dorm, coffee shop" required />
          </div>

          <div className="form-group">
            <label htmlFor="studyTimes">Study Times</label>
            <input id="studyTimes" name="studyTimes" value={formData.studyTimes} onChange={handleChange} placeholder="e.g. mornings, evenings, weekends" required />
          </div>

          <div className="form-group">
            <label htmlFor="idealGroupSize">Ideal Group Size</label>
            <input id="idealGroupSize" name="idealGroupSize" value={formData.idealGroupSize} onChange={handleChange} placeholder="e.g. 1-2, 3-4, 5+" required />
          </div>

          <div className="form-group">
            <label htmlFor="virtualOrInPerson">Virtual or In-Person?</label>
            <select id="virtualOrInPerson" name="virtualOrInPerson" value={formData.virtualOrInPerson} onChange={handleChange} required>
              <option value="">Select preference</option>
              <option value="Virtual">Virtual</option>
              <option value="In-Person">In-Person</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="studyHabits">Study Habits</label>
            <textarea id="studyHabits" name="studyHabits" value={formData.studyHabits} onChange={handleChange} placeholder="How do you like to study?" rows="3" required />
          </div>

          <div className="form-group">
            <label htmlFor="studyStyle">Study Style</label>
            <textarea id="studyStyle" name="studyStyle" value={formData.studyStyle} onChange={handleChange} placeholder="Your preferred study style (visual, kinesthetic, etc.)" rows="3" required />
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

export default SurveyStudy;
