import React from 'react';
import { useSurveyForm } from './useSurveyForm';
import './Survey.css';

const studySelectFields = [
  {
    name: 'currentClasses',
    label: 'Course Area',
    placeholder: 'Select course area',
    options: [
      'Computer Science',
      'Mathematics',
      'Biology',
      'Chemistry',
      'Physics',
      'Engineering',
      'Business',
      'Writing / Humanities',
      'Social Sciences',
      'Other'
    ]
  },
  {
    name: 'studyGoals',
    label: 'Study Goals',
    placeholder: 'Select primary goal',
    options: [
      'Homework / Problem Sets',
      'Exam Prep',
      'Project Collaboration',
      'Concept Review',
      'Accountability',
      'Research / Writing'
    ]
  },
  {
    name: 'honors',
    label: 'Honors or Special Programs',
    placeholder: 'Select program type',
    options: [
      'Honors College',
      'Research Program',
      'Academic Athlete',
      'No Special Program',
      'Other'
    ]
  },
  {
    name: 'studyLocation',
    label: 'Study Location',
    placeholder: 'Select location',
    options: [
      'Library',
      'Campus Study Room',
      'Dorm / Residence Hall',
      'Coffee Shop',
      'Online',
      'Flexible'
    ]
  },
  {
    name: 'studyTimes',
    label: 'Study Times',
    placeholder: 'Select preferred time',
    options: [
      'Morning',
      'Afternoon',
      'Evening',
      'Late Night',
      'Weekends',
      'Flexible'
    ]
  },
  {
    name: 'idealGroupSize',
    label: 'Ideal Group Size',
    placeholder: 'Select group size',
    options: [
      '1-on-1',
      '2-3 people',
      '4-5 people',
      '6+ people'
    ]
  },
  {
    name: 'virtualOrInPerson',
    label: 'Virtual or In-Person?',
    placeholder: 'Select preference',
    options: [
      { value: 'Virtual', label: 'Virtual' },
      { value: 'In-Person', label: 'In-Person' },
      { value: 'Both', label: 'Hybrid' }
    ]
  },
  {
    name: 'studyHabits',
    label: 'Study Habits',
    placeholder: 'Select study habit',
    options: [
      'Quiet Independent Study',
      'Discussion-Based Study',
      'Practice Problems',
      'Teaching / Explaining',
      'Pomodoro Sessions',
      'Mixed'
    ]
  },
  {
    name: 'studyStyle',
    label: 'Study Style',
    placeholder: 'Select study style',
    options: [
      'Visual',
      'Auditory',
      'Reading / Writing',
      'Kinesthetic',
      'Collaborative',
      'Mixed'
    ]
  }
];

const validateStudySurvey = (formData) => {
  const hasMissingField = studySelectFields.some(({ name }) => !formData[name]);

  if (hasMissingField) {
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

  const renderSelect = ({ name, label, placeholder, options }) => {
    const selectedValue = formData[name];
    const hasSavedValue = selectedValue && !options.some((option) => {
      const value = typeof option === 'string' ? option : option.value;
      return value === selectedValue;
    });

    return (
      <div className="form-group" key={name}>
        <label htmlFor={name}>{label}</label>
        <select id={name} name={name} value={selectedValue} onChange={handleChange} required>
          <option value="">{placeholder}</option>
          {hasSavedValue && <option value={selectedValue}>{selectedValue} (saved)</option>}
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;

            return (
              <option value={value} key={value}>
                {optionLabel}
              </option>
            );
          })}
        </select>
      </div>
    );
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
          {studySelectFields.map(renderSelect)}

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
