import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  LayoutDashboard, Users, BookOpen, FileText, UserPlus, Activity,
  Settings, LogOut, Menu, X, User, Key, ChevronRight, Home, Moon, Sun, Mail, Send, Video, Percent, Coins
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import useAutoLogout from '../../hooks/useAutoLogout';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const isCurrentlyMobile = window.innerWidth < 768;
    console.log('[AdminLayout] Initial mobile check:', isCurrentlyMobile);
    return !isCurrentlyMobile; // false for mobile, true for desktop
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const { isDarkMode, setIsDarkMode } = useTheme();

  // Initialize auto-logout with session timeout from settings
  useAutoLogout(sessionTimeout);

  const buildUrl = (path) => `${import.meta.env.VITE_BACKEND_URL}${path}`;

  useEffect(() => {
    const handleResize = () => {
      const isMobileNow = window.innerWidth < 768;
      console.log('[AdminLayout] Resize detected - isMobile:', isMobileNow);
      setIsMobile(isMobileNow);
      if (isMobileNow) {
        console.log('[AdminLayout] Switching to mobile - closing sidebar');
        setIsSidebarOpen(false);
        setIsSidebarCollapsed(false);
      }
    };

    // Load session timeout settings
    const loadSessionTimeout = async () => {
      try {
        const response = await axios.get(buildUrl('/api/Settings/session_settings.php'));
        if (response.data.success && response.data.data.sessionTimeout) {
          setSessionTimeout(response.data.data.sessionTimeout);
        } else {
          // Set default timeout if API doesn't return valid data
          setSessionTimeout(5);
        }
      } catch (error) {
        console.error('Error loading session timeout:', error);
        // Set default timeout on error
        setSessionTimeout(5);
      }
    };

    // Auto-enable fullscreen on load
    const enableFullscreenOnLoad = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (error) {
        console.log('Fullscreen not supported or blocked:', error);
      }
    };

    window.addEventListener('resize', handleResize);

    // Load session timeout and enable fullscreen
    loadSessionTimeout();
    const timer = setTimeout(enableFullscreenOnLoad, 500);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Handle sidebar collapse toggle and persist state
  const toggleSidebarCollapse = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newCollapsedState));
  };

  const { adminUser, loading, logout, sessionExpired, closeSessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/anirban/dashboard' },
    { icon: Users, label: 'Student Management', path: '/anirban/users' },
    { icon: Activity, label: 'Students Activity', path: '/anirban/student-activity' },
    { icon: UserPlus, label: 'Teachers Management', path: '/anirban/add-teachers' },
    { icon: Activity, label: 'Teacher Activity', path: '/anirban/user-activity' },
    { icon: FileText, label: 'Current Affairs', path: '/anirban/current-affairs' },
    { icon: BookOpen, label: 'Test Series', path: '/anirban/test-series' },
    { icon: FileText, label: 'Reported Questions', path: '/anirban/reported-questions' },
    { icon: Video, label: 'Demo Videos', path: '/anirban/demo-videos' },
    { icon: Mail, label: 'Queries', path: '/anirban/queries' },
    { icon: Send, label: 'Broadcast', path: '/anirban/broadcast' },
    { icon: FileText, label: 'Official Syllabus', path: '/anirban/official-syllabus' },
    { icon: FileText, label: 'Website Popup Banner', path: '/anirban/popup-banner' },
    { icon: Percent, label: 'Discounts', path: '/anirban/discounts' },
    { icon: Coins, label: 'Course Financing', path: '/anirban/course-financing' },
    { icon: Settings, label: 'Settings', path: '/anirban/settings' },
    { icon: Key, label: 'Change Password', path: '/anirban/change-password' }
  ].filter(item => {
    if (!adminUser) return true; // Default to showing if no user (shouldn't happen in layout)
    const role = adminUser.role;

    if (role === 'super_admin') return true;

    if (role === 'test_teacher') {
      return item.label === 'Test Series' || item.label === 'Reported Questions' || item.label === 'Course Financing';
    }

    if (role === 'ca_teacher') {
      return item.label === 'Current Affairs' || item.label === 'Reported Questions' || item.label === 'Course Financing';
    }

    return true; // Default fallback
  });


  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex overflow-hidden`}>
      {/* Sidebar */}
      <AnimatePresence>
        {(isMobile ? isSidebarOpen : true) && (
          <>
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            <motion.div
              initial={{ x: isMobile ? -300 : 0, width: isMobile ? 256 : (isSidebarCollapsed ? 80 : 256) }}
              animate={{ x: 0, width: isMobile ? 256 : (isSidebarCollapsed ? 80 : 256) }}
              exit={{ x: isMobile ? -300 : 0 }}
              transition={{ duration: 0.3 }}
              className={`${isMobile ? 'fixed' : 'fixed'} left-0 top-0 h-screen ${isDarkMode ? 'bg-white' : 'bg-gray-800'} shadow-xl z-50 flex flex-col`}
            >
              {/* Logo */}
              <div className={`p-4 border-b ${isDarkMode ? 'border-gray-200' : 'border-gray-700'}`}>
                <div className="flex items-center justify-center">
                  {isSidebarCollapsed && !isMobile ? (
                    <div className="w-20 h-20 flex items-center justify-center">
                      <img
                        src="/img/admin panel inside top logo.png"
                        alt="Admin Logo"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center w-full">
                      <div className="w-28 h-28 flex items-center justify-center">
                        <img
                          src="/img/admin panel inside top logo.png"
                          alt="Admin Logo"
                          className="w-28 h-28 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Menu */}
              <nav
                className="flex-1 p-4 overflow-y-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={(e) => {
                  localStorage.setItem('adminNavScrollPos', e.target.scrollTop);
                }}
                ref={(el) => {
                  if (el) {
                    const savedScrollPos = localStorage.getItem('adminNavScrollPos');
                    if (savedScrollPos) {
                      el.scrollTop = parseInt(savedScrollPos);
                    }
                  }
                }}
              >
                <ul className="space-y-2">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;
                    return (
                      <li key={index}>
                        <button
                          onClick={() => {
                            console.log('[AdminLayout] Navigation clicked:', item.path, 'isMobile:', isMobile);
                            navigate(item.path);
                            if (isMobile) {
                              console.log('[AdminLayout] Mobile navigation - closing sidebar');
                              setIsSidebarOpen(false);
                            }
                          }}
                          className={`w-full flex items-center ${isSidebarCollapsed && !isMobile ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'} rounded-lg text-left transition-all duration-200
                            ${active ? 'bg-[#3936C9] text-white shadow-lg' : `${isDarkMode ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-800' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}`}
                          title={isSidebarCollapsed && !isMobile ? item.label : ''}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {(!isSidebarCollapsed || isMobile) && (
                            <>
                              <span className="font-medium">{item.label}</span>
                              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Profile & Logout */}
              <div className={`p-4 border-t ${isDarkMode ? 'border-gray-200' : 'border-gray-700'}`}>
                {adminUser && (
                  <div className={`flex items-center ${isSidebarCollapsed && !isMobile ? 'justify-center mb-4 p-2' : 'space-x-3 mb-4 p-3'} ${isDarkMode ? 'bg-gray-50' : 'bg-gray-700'} rounded-lg`}>
                    <div className="w-8 h-8 bg-[#3936C9] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    {(!isSidebarCollapsed || isMobile) && (
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-800' : 'text-white'} truncate`}>{adminUser.name}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} truncate`}>{adminUser.email}</p>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={logout}
                  className={`w-full flex items-center ${isSidebarCollapsed && !isMobile ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'} text-red-600 ${isDarkMode ? 'hover:bg-red-50' : 'hover:bg-red-900'} rounded-lg transition-colors duration-200`}
                  title={isSidebarCollapsed && !isMobile ? 'Logout' : ''}
                >
                  <LogOut className="w-5 h-5" />
                  {(!isSidebarCollapsed || isMobile) && <span className="font-medium">Logout</span>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className="flex-1 min-w-0 flex flex-col h-screen transition-all duration-300"
        style={{
          paddingLeft: isMobile ? 0 : (isSidebarCollapsed ? '80px' : '256px')
        }}
      >
        <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b px-6 py-4 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (isMobile) {
                    console.log('[AdminLayout] Mobile menu toggle clicked - current state:', isSidebarOpen);
                    setIsSidebarOpen(!isSidebarOpen);
                  } else {
                    console.log('[AdminLayout] Desktop sidebar collapse toggle');
                    toggleSidebarCollapse();
                  }
                }}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <Menu className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <div>
                <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {location.pathname.replace('/anirban/', '').replace('-', ' ').toUpperCase() || 'DASHBOARD'}
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back, {adminUser?.name || 'Admin'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                ) : (
                  <Moon className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                )}
              </button>

              {/* Profile Section */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#3936C9] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className={`hidden md:block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{adminUser?.name || 'Admin'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className={`flex-1 p-6 overflow-y-auto overflow-x-hidden ${isDarkMode ? 'bg-gray-900' : ''}`}>{children}</main>
      </div>

      {/* Session Expired Modal */}
      <AnimatePresence>
        {sessionExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-100'} p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border`}
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Session Expired</h2>
              <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your session has expired due to inactivity. Please log in again to continue.
              </p>
              <button
                onClick={closeSessionExpired}
                className="w-full py-4 bg-[#3936C9] hover:bg-[#2d2a9e] text-white rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25"
              >
                Log In Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
