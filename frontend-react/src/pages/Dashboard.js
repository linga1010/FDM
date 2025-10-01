import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ClipboardDocumentListIcon as ClipboardListIcon, 
  ClockIcon, 
  SparklesIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTests: 0,
    lastTest: null,
    mostCommonPersonality: null
  });
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/history');
      const history = response.data.history;
      
      setStats({
        totalTests: history.length,
        lastTest: history[0] || null,
        mostCommonPersonality: getMostCommonPersonality(history)
      });
      
      setRecentTests(history.slice(0, 3)); // Get last 3 tests
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMostCommonPersonality = (tests) => {
    if (tests.length === 0) return null;
    
    const personalityCounts = {};
    tests.forEach(test => {
      personalityCounts[test.prediction] = (personalityCounts[test.prediction] || 0) + 1;
    });
    
    return Object.keys(personalityCounts).reduce((a, b) => 
      personalityCounts[a] > personalityCounts[b] ? a : b
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const dashboardCards = [
    {
      title: 'Take New Test',
      description: 'Discover your personality traits with our AI-powered assessment',
      icon: ClipboardListIcon,
      link: '/test',
      color: 'from-blue-500 to-purple-600',
      action: 'Start Test'
    },
    {
      title: 'View Results',
      description: 'See detailed analysis of your latest personality test',
      icon: ChartBarIcon,
      link: '/results',
      color: 'from-green-500 to-teal-600',
      action: 'View Results'
    },
    {
      title: 'Test History',
      description: 'Track your personality journey over time',
      icon: ClockIcon,
      link: '/history',
      color: 'from-purple-500 to-pink-600',
      action: 'View History'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 gradient-bg">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="heading-1 mb-2">
          Welcome back, <span className="text-gradient">{user?.name}</span>! 👋
        </h1>
        <p className="text-muted text-lg">
          Ready to explore your personality? Let's continue your journey of self-discovery.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card shine"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
              <p className="text-sm text-gray-600">Tests Taken</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card shine"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUpIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.lastTest ? `${(stats.lastTest.confidence * 100).toFixed(1)}%` : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Last Confidence</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card shine"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {stats.mostCommonPersonality || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Most Common Type</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link to={card.link} className="block group">
                <div className="card shine hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-muted mb-4">{card.description}</p>
                  <div className={`inline-flex items-center text-sm font-medium bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}> 
                    {card.action} →
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Tests */}
      {recentTests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card shine"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Tests</h2>
          <div className="space-y-4">
            {recentTests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {test.prediction.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{test.prediction}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(test.created_at)} • {(test.confidence * 100).toFixed(1)}% confidence
                    </p>
                  </div>
                </div>
                <Link
                  to={`/results/${test.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  View Details →
                </Link>
              </motion.div>
            ))}
          </div>
          
          {stats.totalTests > 3 && (
            <div className="mt-4 text-center">
              <Link
                to="/history"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Tests ({stats.totalTests}) →
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {/* Getting Started */}
      {stats.totalTests === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Take your first personality test to unlock insights about yourself and begin your journey of self-discovery.
          </p>
          <Link to="/test" className="btn-primary">
            Take Your First Test
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;