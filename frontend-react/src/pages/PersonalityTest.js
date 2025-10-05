import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  LightBulbIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import API_URL from '../config';

const PersonalityTest = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [features, setFeatures] = useState([]);
  const [responses, setResponses] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Trait descriptions for better user understanding
  const traitDescriptions = {
    'party_liking': {
      title: 'Social Gatherings',
      question: 'How much do you enjoy parties and large social events?',
      low: 'I prefer quiet, intimate gatherings',
      medium: 'I enjoy some social events occasionally', 
      high: 'I love big parties and social gatherings'
    },
    'public_speaking_comfort': {
      title: 'Public Speaking',
      question: 'How comfortable are you speaking in front of groups?',
      low: 'I feel nervous speaking in front of others',
      medium: 'I can handle small group presentations', 
      high: 'I enjoy being the center of attention'
    },
    'excitement_seeking': {
      title: 'Adventure & Thrills',
      question: 'How much do you seek exciting and adventurous experiences?',
      low: 'I prefer calm, predictable activities',
      medium: 'I like some adventure now and then', 
      high: 'I constantly seek thrilling experiences'
    },
    'alone_time_preference': {
      title: 'Solitude',
      question: 'How much do you value and need alone time?',
      low: 'I need to be around people to feel energized',
      medium: 'I enjoy a balance of social and alone time', 
      high: 'I recharge best when I\'m by myself'
    },
    'talkativeness': {
      title: 'Communication',
      question: 'How talkative are you in social situations?',
      low: 'I tend to be quiet and listen more',
      medium: 'I speak when I have something to say', 
      high: 'I love talking and sharing my thoughts'
    },
    'social_energy': {
      title: 'Social Energy',
      question: 'How do social interactions affect your energy levels?',
      low: 'Social situations drain my energy',
      medium: 'I can be social but need breaks', 
      high: 'I gain energy from being around others'
    },
    'leadership': {
      title: 'Leadership',
      question: 'How likely are you to take charge in group situations?',
      low: 'I prefer to follow others\' lead',
      medium: 'I can lead when necessary', 
      high: 'I naturally take charge in groups'
    },
    'reading_habit': {
      title: 'Reading & Learning',
      question: 'How much do you enjoy reading and intellectual activities?',
      low: 'I rarely read for pleasure',
      medium: 'I read occasionally', 
      high: 'I love reading and do it often'
    },
    'adventurousness': {
      title: 'Exploration',
      question: 'How much do you seek new experiences and places?',
      low: 'I like routine and familiar places',
      medium: 'I enjoy some new experiences', 
      high: 'I constantly seek new adventures'
    },
    'group_comfort': {
      title: 'Group Dynamics',
      question: 'How comfortable do you feel in group settings?',
      low: 'I feel awkward in group settings',
      medium: 'I\'m comfortable in small groups', 
      high: 'I thrive in large group environments'
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/features`);
      setFeatures(response.data.features);
      
      // Initialize responses with middle values
      const initialResponses = {};
      response.data.features.forEach(feature => {
        initialResponses[feature] = 5.0;
      });
      setResponses(initialResponses);
    } catch (error) {
      toast.error('Failed to load test features');
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (feature, value) => {
    setResponses(prev => ({
      ...prev,
      [feature]: parseFloat(value)
    }));
  };

  const getSliderLabel = (value) => {
    if (value <= 2) return 'Very Low';
    if (value <= 4) return 'Low';
    if (value <= 6) return 'Medium';
    if (value <= 8) return 'High';
    return 'Very High';
  };

  const getSliderColor = (value) => {
    if (value <= 2) return 'from-red-400 to-red-500';
    if (value <= 4) return 'from-orange-400 to-orange-500';
    if (value <= 6) return 'from-green-400 to-green-500';
    if (value <= 8) return 'from-blue-400 to-blue-500';
    return 'from-purple-400 to-purple-500';
  };

  const getTraitDescription = (feature, value) => {
    const trait = traitDescriptions[feature];
    if (!trait) return '';
    
    if (value <= 3.5) return trait.low;
    if (value <= 6.5) return trait.medium;
    return trait.high;
  };

  const nextStep = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitTest = async () => {
    setSubmitting(true);
    try {
      console.log('Submitting responses:', responses);
      
      // First test authentication
      console.log('Testing authentication...');
      console.log('Current token:', token ? 'Token exists' : 'No token found');
      console.log('Axios auth header:', axios.defaults.headers.common['Authorization']);
      const authTest = await axios.get(`${API_URL}/api/test-auth`);
      console.log('Auth test successful:', authTest.data);
      
      // Then submit the actual test
      const response = await axios.post(`${API_URL}/api/predict`, responses);
      toast.success('Test completed successfully!');
      navigate(`/results/${response.data.test_id}`);
    } catch (error) {
      console.error('Submission error details:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        const errorMsg = error.response.data.message || error.response.data.msg || 'Failed to submit test';
        toast.error(`Error: ${errorMsg}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check if the backend is running.');
      } else {
        console.error('Error message:', error.message);
        toast.error('Failed to submit test. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / features.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading personality test...</p>
        </div>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load test. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const currentFeature = features[currentStep];
  const currentTrait = traitDescriptions[currentFeature];
  const currentValue = responses[currentFeature] || 5.0;

  return (
    <div className="max-w-4xl mx-auto gradient-bg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="heading-1 mb-2">
          AI Personality Assessment
        </h1>
        <p className="text-muted">
          Question {currentStep + 1} of {features.length}
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="card shine mb-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LightBulbIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="heading-2 mb-2">
              {currentTrait?.title || currentFeature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h2>
            <p className="text-lg text-gray-700">
              {currentTrait?.question || `Rate your ${currentFeature.replace('_', ' ')}`}
            </p>
          </div>

          {/* Slider */}
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={currentValue}
                onChange={(e) => handleSliderChange(currentFeature, e.target.value)}
                className="personality-slider"
                style={{
                  background: undefined
                }}
              />
              
            </div>

            {/* Labels */}
            <div className="flex justify-between text-sm text-gray-500 mb-6">
              <span>Very Low</span>
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
              <span>Very High</span>
            </div>

            {/* Current Value Display */}
            <div className="text-center mb-6">
              <div className={`inline-block px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r ${getSliderColor(currentValue)}`}>
                {getSliderLabel(currentValue)} ({currentValue})
              </div>
            </div>

            {/* Description */}
            <div className="text-center">
              <p className="text-muted italic text-lg">
                "{getTraitDescription(currentFeature, currentValue)}"
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Previous</span>
        </button>

        <div className="flex space-x-2">
          {features.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentStep
                  ? 'bg-blue-600 scale-125'
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentStep === features.length - 1 ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={submitTest}
            disabled={submitting}
            className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                <span>Complete Test</span>
              </>
            )}
          </motion.button>
        ) : (
          <button
            onClick={nextStep}
            className="flex items-center space-x-2 btn-primary"
          >
            <span>Next</span>
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PersonalityTest;