import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveSurvey, getSurvey } from '../api/surveys';
import { useUser } from '../context/UserContext';
import './Survey.css';

const Survey = () => {
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section');
  const isRoommateSection = section === 'roommate';
  const isStudySection = section === 'study';

  const { user, updateProfile } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    major: '',
    year: '',
    interests: [],
    experience: '',
    goals: '',
    sleepSchedule: '',
    cleanliness: '',
    visitorPolicy: '',
    items: '',
    pets: '',
    allergies: '',
    campusSelection: '',
    socialBattery: '',
    hobbies: '',
    currentClasses: '',
    studyGoals: '',
    honors: '',
    studyLocation: '',
    studyTimes: '',
    idealGroupSize: '',
    virtualOrInPerson: '',
    studyHabits: '',
    studyStyle: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Initialize form with existing user survey data
  useEffect(() => {
    const loadExistingSurvey = async () => {
      try {
        if (user) {
          const response = await getSurvey();
          if (response.success && response.survey) {
            console.log('✅ Loaded existing survey:', response.survey);
            setFormData(prevData => ({
              ...prevData,
              ...response.survey
            }));
          }
        }
      } catch (error) {
        console.log('ℹ️  No existing survey found, starting fresh');
      } finally {
        setInitializing(false);
      }
    };

    loadExistingSurvey();
  }, [user]);

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
    
    // Validation based on section
    if (isRoommateSection) {
      if (!formData.sleepSchedule || !formData.cleanliness || !formData.visitorPolicy || !formData.items || !formData.pets || !formData.allergies || !formData.campusSelection || !formData.socialBattery || !formData.hobbies) {
        setError('Please fill in all roommate preference fields before saving.');
        return;
      }
    } else if (isStudySection) {
      if (!formData.currentClasses || !formData.studyGoals || !formData.honors || !formData.studyLocation || !formData.studyTimes || !formData.idealGroupSize || !formData.virtualOrInPerson || !formData.studyHabits || !formData.studyStyle) {
        setError('Please fill in all study preference fields before saving.');
        return;
      }
    } else {
      // Basic/Academic section
      if (!formData.major || !formData.year || !formData.experience) {
        setError('Please fill in all required fields (Major, Year, Experience).');
        return;
      }
      if (formData.interests.length === 0) {
        setError('Please select at least one area of interest.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📤 Saving survey data...');
      const response = await saveSurvey(formData);
      
      if (response.success) {
        console.log('✅ Survey saved successfully');
        updateProfile(response.survey);
        
        // Navigate based on section
        if (isRoommateSection || isStudySection) {
          navigate('/profile');
        } else {
          navigate('/matches');
        }
      } else {
        setError(response.message || 'Failed to save survey. Please try again.');
      }
    } catch (err) {
      console.error('❌ Error saving survey:', err);
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

  if (initializing) {
    return <div className="loading-container"><div className="spinner">Loading survey...</div></div>;
  }

  const pageTitle = isRoommateSection
    ? 'Roommate Preferences Survey'
    : isStudySection
      ? 'Study Preferences Survey'
      : 'Student Profile Survey';

  const pageDescription = isRoommateSection
    ? 'Update your roommate preferences to make better matches.'
    : isStudySection
      ? 'Update your study preferences for better study partner matching.'
      : 'Please tell us a bit about yourself to help us personalize your experience.';

  const submitLabel = isRoommateSection || isStudySection ? 'Save Preferences' : 'Complete Survey';

  return (
    <div className="survey-page">
      <div className="survey-container">
        <h1>{pageTitle}</h1>
        <p>{pageDescription}</p>

        <form onSubmit={handleSubmit} className="survey-form">
          {/* BASIC/ACADEMIC SECTION */}
          {!isRoommateSection && !isStudySection && (
            <>
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
                  {interestOptions.map(interest => (
                    <label key={interest} className="checkbox-label">
                      <input type="checkbox" name="interests" value={interest} checked={formData.interests.includes(interest)} onChange={handleChange} />
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
                <textarea id="goals" name="goals" value={formData.goals} onChange={handleChange} placeholder="Tell us about your career aspirations..." rows="3" />
              </div>
            </>
          )}

          {/* ROOMMATE SECTION */}
          {isRoommateSection && (
            <>
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
            </>
          )}

          {/* STUDY SECTION */}
          {isStudySection && (
            <>
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
            </>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : submitLabel}
          </button>
        </form>
        
        {error && <div className="error-message" style={{marginTop: '20px', color: '#d32f2f', fontWeight: 'bold'}}>{error}</div>}
      </div>
    </div>
  );
};

export default Survey;
