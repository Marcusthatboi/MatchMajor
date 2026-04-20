import React from 'react';
import { interestOptions, useSurveyForm } from './useSurveyForm';
import './Survey.css';

const validateMainSurvey = (formData) => {
  if (!formData.major || !formData.year || !formData.experience) {
    return 'Please fill in all required fields (Major, Year, Experience).';
  }

  if (formData.interests.length === 0) {
    return 'Please select at least one area of interest.';
  }

  return null;
};

const Survey = () => {
  const { formData, loading, error, initializing, handleChange, submitSurvey } = useSurveyForm('/matches');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitSurvey(validateMainSurvey);
  };

  if (initializing) {
    return <div className="loading-container"><div className="spinner">Loading survey...</div></div>;
  }

  return (
    <div className="survey-page">
      <div className="survey-container">
        <h1>Student Profile Survey</h1>
        <p>Please tell us a bit about yourself to help us personalize your experience.</p>

        <form onSubmit={handleSubmit} className="survey-form">
          <div className="form-group">
            <label htmlFor="major">What is your major/field of study?</label>
            <select id="major" name="major" value={formData.major} onChange={handleChange} required>
              <option value="">Select your major</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Data Science">Data Science</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Business">Business</option>
              <option value="Engineering">Engineering</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="year">What year are you in?</label>
            <select id="year" name="year" value={formData.year} onChange={handleChange} required>
              <option value="">Select your year</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="Graduate">Graduate Student</option>
            </select>
          </div>

          <div className="form-group">
            <label>What are your tech interests? (Select all that apply)</label>
            <div className="checkbox-group">
              {interestOptions.map((interest) => (
                <label key={interest} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="interests"
                    value={interest}
                    checked={formData.interests.includes(interest)}
                    onChange={handleChange}
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="experience">Programming experience level?</label>
            <select id="experience" name="experience" value={formData.experience} onChange={handleChange} required>
              <option value="">Select your experience level</option>
              <option value="Beginner">Beginner (just starting)</option>
              <option value="Intermediate">Intermediate (some experience)</option>
              <option value="Advanced">Advanced (experienced)</option>
              <option value="Expert">Expert (professional)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="goals">Career goals? (Optional)</label>
            <textarea
              id="goals"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              placeholder="Tell us about your career aspirations..."
              rows="3"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Complete Survey'}
          </button>
        </form>

        {error && <div className="error-message" style={{ marginTop: '20px', color: '#d32f2f', fontWeight: 'bold' }}>{error}</div>}
      </div>
    </div>
  );
};

export default Survey;
