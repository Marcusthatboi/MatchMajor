import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Survey.css';
import './Survey.css';

const Survey = ({ setUser }) => {
  const [formData, setFormData] = useState({
    major: '',
    year: '',
    interests: [],
    experience: '',
    goals: ''
  });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you could save the survey data to the backend
    console.log('Survey data:', formData);
    // Navigate to matches afterward
    navigate('/matches');
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

          <button type="submit" className="submit-btn">Complete Survey</button>
        </form>
      </div>
    </div>
  );
};

export default Survey;