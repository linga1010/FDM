import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../config';
import { 
  UserIcon, 
  ChartBarIcon, 
  LightBulbIcon, 
  BriefcaseIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Results = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [testId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      let response;
      
      if (testId) {
        // Fetch specific test result
        response = await axios.get(`${API_URL}/api/test/${testId}`);
      } else {
        // Fetch latest test result from history
        const historyResponse = await axios.get(`${API_URL}/api/history`);
        if (historyResponse.data.history && historyResponse.data.history.length > 0) {
          const latestTest = historyResponse.data.history[0];
          response = { data: latestTest };
        } else {
          toast.error('No test results found');
          navigate('/test');
          return;
        }
      }
      
      setResult(response.data);
    } catch (error) {
      console.error('Error fetching result:', error);
      toast.error('Failed to load test results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getPersonalityColor = (personality) => {
    switch (personality) {
      case 'Extrovert': return 'text-red-600 bg-red-50 border-red-200';
      case 'Introvert': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Ambivert': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">No results found.</p>
          <button 
            onClick={() => navigate('/test')}
            className="mt-4 btn-primary"
          >
            Take New Test
          </button>
        </div>
      </div>
    );
  }

  const advice = result.advice || {};
  const probabilities = result.probabilities || {};

  return (
    <div className="max-w-4xl mx-auto gradient-bg">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="heading-1">Your Personality Results</h1>
      </div>

      <div className="space-y-6">
        {/* Main Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card shine p-8 text-center"
        >
          <div className="mb-6">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="heading-2 mb-2">Test Completed!</h2>
            <p className="text-muted">
              Completed on {new Date(result.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border ${getPersonalityColor(result.prediction)} text-2xl font-bold mb-4`}>
            <UserIcon className="h-8 w-8" />
            {result.prediction}
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getConfidenceColor(result.confidence)}`}>
            <ChartBarIcon className="h-5 w-5" />
            <span className="font-semibold">
              {Math.round(result.confidence * 100)}% Confidence
            </span>
          </div>
        </motion.div>

        {/* Description */}
        {advice.description && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          className="card shine"
          >
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              About Your Personality Type
            </h3>
          <p className="text-gray-700 leading-relaxed">{advice.description}</p>
          </motion.div>
        )}

        {/* Probability Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card shine"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Detailed Analysis
          </h3>
          <div className="space-y-4">
            {Object.entries(probabilities).map(([type, probability]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{type}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        type === result.prediction ? 'bg-blue-500' : 'bg-gray-400'
                      } animate-grow`}
                      style={{ width: `${probability * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {Math.round(probability * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Strengths */}
        {advice.strengths && advice.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card shine"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              Your Strengths
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {advice.strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Advice */}
        {advice.advice && advice.advice.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card shine"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LightBulbIcon className="h-5 w-5 text-yellow-500" />
              Personalized Advice
            </h3>
            <div className="space-y-3">
              {advice.advice.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                  <LightBulbIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{tip}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Career Suggestions */}
        {advice.career_suggestions && advice.career_suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card shine"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BriefcaseIcon className="h-5 w-5 text-blue-500" />
              Career Suggestions
            </h3>
            <div className="flex flex-wrap gap-2">
              {advice.career_suggestions.map((career, index) => (
                <span 
                  key={index}
                  className="px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {career}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 justify-center pt-6"
        >
          <button
            onClick={() => navigate('/test')}
            className="btn-primary"
          >
            Take Another Test
          </button>
          <button
            onClick={() => navigate('/history')}
            className="btn-secondary"
          >
            View History
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;