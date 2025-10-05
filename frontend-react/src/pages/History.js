import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import API_URL from '../config';
import { 
  ClockIcon, 
  UserIcon, 
  ChartBarIcon,
  EyeIcon,
  CalendarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalTests, setTotalTests] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
        setTotalTests(data.total_tests);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch history');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Add 5 hours and 30 minutes
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPersonalityColor = (personality) => {
    switch (personality) {
      case 'Extrovert':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Introvert':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ambivert':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPersonalityIcon = (personality) => {
    switch (personality) {
      case 'Extrovert':
        return '🌟';
      case 'Introvert':
        return '🔍';
      case 'Ambivert':
        return '⚖️';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card text-center">
          <div className="text-red-600 mb-4">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading History</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={fetchHistory}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto gradient-bg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="heading-1 mb-2">Test History</h1>
        <div className="flex items-center space-x-6 text-sm text-muted">
          <div className="flex items-center">
            <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />
            <span>{totalTests} tests completed</span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
            <span>Track your personality journey</span>
          </div>
        </div>
      </div>

      {/* No History */}
      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-12"
        >
          <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tests Yet</h3>
          <p className="text-gray-500 mb-6">
            Take your first personality test to start tracking your results!
          </p>
          <Link to="/test" className="btn-primary">
            Take Personality Test
          </Link>
        </motion.div>
      ) : (
        /* History List */
        <div className="space-y-4">
          {history.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card shine hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
                      {getPersonalityIcon(test.prediction)}
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`badge ${getPersonalityColor(test.prediction)}`}>
                        {test.prediction}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <ChartBarIcon className="h-4 w-4 mr-1" />
                        <span>{Math.round(test.confidence * 100)}% confidence</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{formatDate(test.created_at)}</span>
                    </div>
                    
                    {test.advice && test.advice.description && (
                      <p className="text-sm text-gray-600 mt-2 overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {test.advice.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Confidence Bar */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 animate-grow"
                        style={{ width: `${test.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 min-w-[3rem]">
                      {Math.round(test.confidence * 100)}%
                    </span>
                  </div>
                  
                  {/* View Details Button */}
                  <Link
                    to={`/results/${test.id}`}
                    className="flex items-center px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Details</span>
                  </Link>
                </div>
              </div>
              
              {/* Probability Distribution */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {Object.entries(test.probabilities || {}).map(([personality, probability]) => (
                    <div key={personality} className="text-center">
                      <div className="font-medium text-gray-600 mb-1">{personality}</div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-grow"
                          style={{ width: `${probability * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-gray-500 mt-1">{Math.round(probability * 100)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Take Another Test */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Link to="/test" className="btn-primary">
            Take Another Test
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default History;