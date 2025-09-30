import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon,
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [historyStats, setHistoryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user } = useAuth();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user profile
      const profileResponse = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const profile = await profileResponse.json();

      // Fetch test history for statistics
      const historyResponse = await fetch('http://localhost:5000/api/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!historyResponse.ok) {
        throw new Error('Failed to fetch history data');
      }
      const historyData = await historyResponse.json();

      setProfileData(profile);
      setHistoryStats(calculateStats(historyData.history));
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError(error.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (history) => {
    if (!history || history.length === 0) {
      return {
        totalTests: 0,
        personalityBreakdown: {},
        averageConfidence: 0,
        mostRecentTest: null,
        testDates: [],
        mostCommonPersonality: null
      };
    }

    const personalityBreakdown = {};
    let totalConfidence = 0;
    const testDates = [];

    history.forEach(test => {
      // Count personality types
      personalityBreakdown[test.prediction] = (personalityBreakdown[test.prediction] || 0) + 1;
      // Sum confidence scores
      totalConfidence += test.confidence;
      // Collect test dates
      testDates.push(new Date(test.created_at));
    });

    // Find most common personality
    const mostCommonPersonality = Object.entries(personalityBreakdown)
      .reduce((a, b) => personalityBreakdown[a[0]] > personalityBreakdown[b[0]] ? a : b);

    return {
      totalTests: history.length,
      personalityBreakdown,
      averageConfidence: totalConfidence / history.length,
      mostRecentTest: history[0], // History is ordered by created_at desc
      testDates: testDates.sort((a, b) => b - a),
      mostCommonPersonality: mostCommonPersonality ? mostCommonPersonality[0] : null
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPersonalityColor = (personality) => {
    switch (personality) {
      case 'Extrovert':
        return 'text-orange-600 bg-orange-100';
      case 'Introvert':
        return 'text-blue-600 bg-blue-100';
      case 'Ambivert':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
            <UserIcon className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Profile</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={fetchProfileData}
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
      <div className="mb-8 text-center">
        <h1 className="heading-1 text-gradient mb-2">My Profile</h1>
        <p className="text-muted">View your account information and personality test statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="card shine"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center shadow-inner">
                <UserIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="heading-2">{profileData?.name}</h2>
                <p className="text-subtle">Personality Explorer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-subtle">Email</p>
                  <p className="font-medium">{profileData?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-subtle">Member Since</p>
                  <p className="font-medium">{formatDate(profileData?.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <TrophyIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-subtle">Tests Completed</p>
                  <p className="font-medium">{historyStats?.totalTests || 0}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <BoltIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-subtle">Avg. Confidence</p>
                  <p className="font-medium">{historyStats?.averageConfidence ? `${Math.round(historyStats.averageConfidence * 100)}%` : 'N/A'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Most Common Personality */}
          {historyStats?.mostCommonPersonality && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 120, damping: 18 }}
              className="card shine"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {getPersonalityIcon(historyStats.mostCommonPersonality)}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Dominant Type</h3>
                <span className={`badge ${getPersonalityColor(historyStats.mostCommonPersonality)}`}>
                  {historyStats.mostCommonPersonality}
                </span>
                <p className="text-xs text-gray-500 mt-2">
                  {historyStats.personalityBreakdown[historyStats.mostCommonPersonality]} out of {historyStats.totalTests} tests
                </p>
              </div>
            </motion.div>
          )}

          {/* Recent Activity */}
          {historyStats?.mostRecentTest && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 120, damping: 18 }}
              className="card shine"
            >
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Recent Test
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Result:</span>
                  <span className={`badge ${getPersonalityColor(historyStats.mostRecentTest.prediction)}`}>
                    {historyStats.mostRecentTest.prediction}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <span className="text-sm font-medium">{Math.round(historyStats.mostRecentTest.confidence * 100)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="text-sm">{formatDate(historyStats.mostRecentTest.created_at)}</span>
                </div>
              </div>
              <Link
                to={`/results/${historyStats.mostRecentTest.id}`}
                className="block w-full text-center mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                View Details →
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* Personality Breakdown */}
      {historyStats?.totalTests > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="card shine">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Personality Type Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(historyStats.personalityBreakdown).map(([personality, count]) => {
                const percentage = (count / historyStats.totalTests) * 100;
                return (
                  <div key={personality} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 min-w-[120px]">
                      <span className="text-lg">{getPersonalityIcon(personality)}</span>
                      <span className="text-sm font-medium">{personality}</span>
                    </div>
                    <div className="flex-1 flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full animate-grow"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 min-w-[60px]">
                        {count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link to="/test" className="btn-primary">
          Take New Test
        </Link>
        <Link to="/history" className="btn-secondary">
          View All Tests
        </Link>
      </motion.div>

      {/* No Tests Message */}
      {historyStats?.totalTests === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 card text-center py-12"
        >
          <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tests Yet</h3>
          <p className="text-gray-500 mb-6">
            Take your first personality test to see detailed statistics and insights!
          </p>
          <Link to="/test" className="btn-primary">
            Take Your First Test
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;