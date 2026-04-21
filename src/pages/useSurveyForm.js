import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSurvey, getSurvey } from '../api/surveys';
import { useUser } from '../context/UserContext';

export const initialSurveyFormData = {
  name: '',
  major: '',
  year: '',
  gender: '',
  bio: '',
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
};

const normalizeSurveyForForm = (survey) =>
  Object.keys(initialSurveyFormData).reduce((normalized, key) => {
    normalized[key] = survey?.[key] ?? initialSurveyFormData[key];
    return normalized;
  }, {});

const normalizeSurveyForSubmit = (survey) =>
  Object.entries(survey).reduce((normalized, [key, value]) => {
    if (key === 'virtualOrInPerson' && value === 'Hybrid') {
      normalized[key] = 'Both';
      return normalized;
    }

    normalized[key] = value === '' ? null : value;
    return normalized;
  }, {});

export const useSurveyForm = (successPath) => {
  const { user, updateProfile } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialSurveyFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const loadExistingSurvey = async () => {
      try {
        if (user) {
          const response = await getSurvey();
          if (response.success && response.survey) {
            setFormData((prevData) => ({
              ...prevData,
              ...normalizeSurveyForForm(response.survey)
            }));
          }
        }
      } catch (loadError) {
        console.log('Survey not found yet, starting with defaults');
      } finally {
        setInitializing(false);
      }
    };

    loadExistingSurvey();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const submitSurvey = async (validate) => {
    const validationError = validate(formData);
    if (validationError) {
      setError(validationError);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await saveSurvey(normalizeSurveyForSubmit(formData));

      if (!response.success) {
        setError(response.message || 'Failed to save survey. Please try again.');
        return false;
      }

      updateProfile(response.survey);
      navigate(successPath);
      return true;
    } catch (submitError) {
      const errorMessage =
        submitError.response?.data?.message ||
        submitError.message ||
        'An error occurred. Please try again.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    initializing,
    handleChange,
    submitSurvey
  };
};
