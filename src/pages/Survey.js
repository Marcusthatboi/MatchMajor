import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../api/matches';
import './Survey.css';

const Survey = ({ setUser }) => {
  const [formData, setFormData] = useState({
    major: '',
    year: '',
    interests: [],
    experience: '',
    goals: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        interests: checked
          ? [...prev.interests, value]
          : prev.interests.filter(interest => interest !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.major || !formData.year || !formData.experience) {
      setError('Please fill in all required fields (Major, Year, Experience).');
      return;
    }
    
    if (formData.interests.length === 0) {
      setError('Please select at least one area of interest.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Save survey data to backend
      const response = await updateUserProfile(formData);
      
      if (response.success) {
        // Update user context with new profile data
        if (setUser) {
          setUser(response.data);
        }
        // Navigate to matches
        navigate('/matches');
      } else {
        setError(response.message || 'Failed to save profile. Please try again.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const interestOptions = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'AI/ML',
    'Cybersecurity',
    'DevOps',
    'Game Development',
    'UI/UX Design'
  ];

  return (
    <div className="survey-page">
      <div className="survey-container">
        <h1>Student Survey</h1>
        <p>Please tell us a bit about yourself to help us personalize your experience.</p>

        <form onSubmit={handleSubmit} className="survey-form">
          <div className="form-group">
            <label htmlFor="major">What is your major/field of study?</label>
            <select
              id="major"
              name="major"
              value={formData.major}
              onChange={handleChange}
              required
            >
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
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            >
              <option value="">Select your year</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="Graduate">Graduate Student</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>What are your tech interests? (Select all that apply)</label>
            <div className="checkbox-group">
              {interestOptions.map(interest => (
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
            <label htmlFor="experience">What is your programming experience level?</label>
            <select
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
            >
              <option value="">Select your experience level</option>
              <option value="Beginner">Beginner (just starting)</option>
              <option value="Intermediate">Intermediate (some experience)</option>
              <option value="Advanced">Advanced (experienced)</option>
              <option value="Expert">Expert (professional level)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="goals">What are your career goals? (Optional)</label>
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
        
        {error && <div className="error-message" style={{marginTop: '20px', color: '#d32f2f', fontWeight: 'bold'}}>{error}</div>}
      </div>
    </div>
  );
};

export default Survey;