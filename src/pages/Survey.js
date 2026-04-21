import React from 'react';
import { useSurveyForm } from './useSurveyForm';
import './Survey.css';

const validateMainSurvey = (formData) => {
  if (!formData.name || !formData.major || !formData.year || !formData.gender || !formData.bio) {
    return 'Please fill in all required fields (Name, Major, Year, Gender, Bio).';
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
            <label htmlFor="name">What is your name?</label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="major">What is your major/field of study?</label>
            <select id="major" name="major" value={formData.major} onChange={handleChange} required>
              <option value="">Select your major</option>
              <option value="Accounting">Accounting</option>
              <option value="Biology">Biology</option>
              <option value="Business">Business</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Communication Studies">Communication Studies</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Criminal Justice">Criminal Justice</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science">Data Science</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Education">Education</option>
              <option value="Engineering">Engineering</option>
              <option value="Finance">Finance</option>
              <option value="Health Sciences">Health Sciences</option>
              <option value="Marketing">Marketing</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Nursing">Nursing</option>
              <option value="Psychology">Psychology</option>
              <option value="Software Engineering">Software Engineering</option>
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
            <label htmlFor="gender">Gender</label>
            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a little about yourself..."
              rows="3"
              required
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
