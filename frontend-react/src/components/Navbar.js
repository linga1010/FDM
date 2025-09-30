import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon as LogoutIcon, 
  Bars3Icon as MenuIcon, 
  XMarkIcon as XIcon,
  HomeIcon,
  ClipboardDocumentListIcon as ClipboardListIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
    { path: '/test', name: 'Take Test', icon: ClipboardListIcon },
    { path: '/results', name: 'Results', icon: ChartBarIcon },
    { path: '/history', name: 'History', icon: ClockIcon },
  ];

  if (!user) return null;

  return (
    <nav className="bg-white/70 backdrop-blur shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Personality Predictor
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-700 text-sm">
              Welcome, <span className="font-medium">{user.name}</span>
            </span>
            <Link
              to="/profile"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogoutIcon className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
            >
              {isMenuOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`relative flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                      {isActive && (
                        <span className="absolute -bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                      )}
                    </Link>
                  );
                })}
                
                <div className="border-t border-gray-200 pt-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogoutIcon className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;