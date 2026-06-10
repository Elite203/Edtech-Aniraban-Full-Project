import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  BookOpen,
  RefreshCw,
  TrendingUp,
  Key,
  Lock,
  Unlock,
  X
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';

const AdminCourseFinancing = () => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [data, setData] = useState({
    monthly_test: null,
    test_series: []
  });
  const [toast, setToast] = useState(null);

  // States for password setting (super_admin)
  const [pwTargetType, setPwTargetType] = useState('monthly_test');
  const [pwTargetId, setPwTargetId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [settingPassword, setSettingPassword] = useState(false);

  // States for teacher password prompt modal
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptTarget, setPromptTarget] = useState({ type: '', id: null, title: '' });
  const [enteredPassword, setEnteredPassword] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Temporary storage of unlocked breakdowns (cleared on reload/unmount)
  const [unlockedBreakdowns, setUnlockedBreakdowns] = useState({});

  useEffect(() => {
    fetchFinancingData();
  }, []);

  const fetchFinancingData = async () => {
    setLoading(true);
    setError('');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
      setError('Backend URL not configured.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${backendUrl}/api/Dashboard/get_course_financing.php`,
        {
          withCredentials: true,
          headers: { 'Accept': 'application/json' }
        }
      );

      if (response.data && response.data.success) {
        setData(response.data.data);
        setUserRole(response.data.role);
      } else {
        setError(response.data?.message || 'Failed to fetch course financing data');
      }
    } catch (err) {
      console.error('Error fetching course financing:', err);
      setError('Network Error: Unable to fetch course financing data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.trim() === '') {
      showToast('Password cannot be empty', 'error');
      return;
    }

    setSettingPassword(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await axios.post(
        `${backendUrl}/api/Dashboard/set_financing_password.php`,
        {
          item_type: pwTargetType,
          item_id: pwTargetType === 'test_series' ? pwTargetId : null,
          password: newPassword
        },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data && response.data.success) {
        showToast(response.data.message || 'Password configured successfully!', 'success');
        setNewPassword('');
      } else {
        showToast(response.data?.message || 'Failed to configure password', 'error');
      }
    } catch (err) {
      console.error('Error setting password:', err);
      showToast('Error setting password', 'error');
    } finally {
      setSettingPassword(false);
    }
  };

  const triggerPasswordPrompt = (type, id, title) => {
    setPromptTarget({ type, id, title });
    setEnteredPassword('');
    setShowPromptModal(true);
  };

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    if (enteredPassword.trim() === '') return;

    setVerifying(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await axios.post(
        `${backendUrl}/api/Dashboard/get_financing_details.php`,
        {
          item_type: promptTarget.type,
          item_id: promptTarget.id,
          password: enteredPassword
        },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data && response.data.success) {
        const cacheKey = promptTarget.type === 'monthly_test' 
          ? 'monthly_test' 
          : `course_${promptTarget.id}`;

        setUnlockedBreakdowns(prev => ({
          ...prev,
          [cacheKey]: {
            monthly_breakdown: response.data.monthly_breakdown,
            total_students: response.data.total_students
          }
        }));

        showToast('Password verified! Details unlocked.', 'success');
        setShowPromptModal(false);
      } else {
        showToast(response.data?.message || 'Incorrect password', 'error');
      }
    } catch (err) {
      console.error('Error verifying password:', err);
      showToast('Verification failed', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleLockItem = (key) => {
    setUnlockedBreakdowns(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    showToast('Details locked.', 'success');
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const Toast = () => {
    if (!toast) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}
      >
        {toast.message}
      </motion.div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-8 select-text">
        <Toast />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Course Financing Overview
            </h1>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Track enrollments, total purchases, and revenue breakdowns for all tests and courses
            </p>
          </div>
          <button
            onClick={fetchFinancingData}
            disabled={loading}
            className={`px-4 py-2 bg-[#3936C9] hover:bg-[#2D2B9E] text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm disabled:opacity-50`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className={`w-8 h-8 animate-spin mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading financial data...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <button
              onClick={fetchFinancingData}
              className="px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Section 1: Current Affairs Monthly Test */}
            {data.monthly_test && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } shadow-sm space-y-6`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Current Affairs Monthly Test
                      </h2>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Revenue analysis for monthly current affairs packages
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700/50 px-4 py-2.5 rounded-lg">
                      <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Students Enrolled</div>
                        <div className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                          {userRole === 'super_admin' ? (
                            data.monthly_test.total_students
                          ) : (
                            unlockedBreakdowns['monthly_test'] ? (
                              unlockedBreakdowns['monthly_test'].total_students
                            ) : (
                              <span className="flex items-center space-x-1 text-xs text-red-500 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
                                <Lock className="w-3 h-3 mr-1" />
                                <span>Locked</span>
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {userRole !== 'super_admin' && (
                      unlockedBreakdowns['monthly_test'] ? (
                        <button
                          onClick={() => handleLockItem('monthly_test')}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-1.5 text-xs transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Lock Details</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => triggerPasswordPrompt('monthly_test', null, 'Current Affairs Monthly Test')}
                          className="px-3 py-2 bg-[#3936C9] hover:bg-[#2D2B9E] text-white rounded-lg flex items-center space-x-1.5 text-xs transition-colors"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unlock Details</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Month-wise Purchases Table */}
                <div className="overflow-x-auto">
                  {userRole === 'super_admin' ? (
                    data.monthly_test.monthly_breakdown?.length === 0 ? (
                      <p className={`text-sm text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No purchases recorded.
                      </p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`border-b ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'} font-medium`}>
                            <th className="py-3 px-4 text-left">Month</th>
                            <th className="py-3 px-4 text-center">Total Purchases</th>
                            <th className="py-3 px-4 text-right">Total Revenue</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {data.monthly_test.monthly_breakdown?.map((row, idx) => (
                            <tr key={idx} className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                              <td className="py-3 px-4 font-medium flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{formatMonth(row.purchase_month)}</span>
                              </td>
                              <td className="py-3 px-4 text-center">{row.total_purchases}</td>
                              <td className="py-3 px-4 text-right font-semibold text-green-600 dark:text-green-400">
                                ₹{row.total_amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  ) : (
                    // Teacher access control logic
                    unlockedBreakdowns['monthly_test'] ? (
                      unlockedBreakdowns['monthly_test'].monthly_breakdown.length === 0 ? (
                        <p className={`text-sm text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No purchases recorded.
                        </p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={`border-b ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'} font-medium`}>
                              <th className="py-3 px-4 text-left">Month</th>
                              <th className="py-3 px-4 text-center">Total Purchases</th>
                              <th className="py-3 px-4 text-right">Total Revenue</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {unlockedBreakdowns['monthly_test'].monthly_breakdown.map((row, idx) => (
                              <tr key={idx} className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                                <td className="py-3 px-4 font-medium flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>{formatMonth(row.purchase_month)}</span>
                                </td>
                                <td className="py-3 px-4 text-center">{row.total_purchases}</td>
                                <td className="py-3 px-4 text-right font-semibold text-green-600 dark:text-green-400">
                                  ₹{row.total_amount.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10">
                        <Lock className="w-8 h-8 text-gray-400 mb-2" />
                        <p className={`text-xs mb-3 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Detailed monthly breakdowns are password-protected
                        </p>
                        <button
                          onClick={() => triggerPasswordPrompt('monthly_test', null, 'Current Affairs Monthly Test')}
                          className="px-4 py-1.5 bg-[#3936C9] hover:bg-[#2D2B9E] text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unlock to View</span>
                        </button>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}

            {/* Section 2: Test Series Courses */}
            {(userRole === 'super_admin' || userRole === 'test_teacher') && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg text-purple-600 dark:text-purple-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Test Series Courses
                    </h2>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Financial analysis breakdown grouped per active test series course
                    </p>
                  </div>
                </div>

                {data.test_series.length === 0 ? (
                  <div className={`p-8 text-center rounded-xl border ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
                  }`}>
                    No test series courses found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {data.test_series.map((course) => {
                      const cacheKey = `course_${course.course_id}`;
                      const isUnlocked = unlockedBreakdowns[cacheKey];

                      return (
                        <motion.div
                          key={course.course_id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-6 rounded-xl border ${
                            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                          } shadow-sm space-y-4`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 gap-4 border-gray-200 dark:border-gray-700">
                            <div>
                              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                {course.course_title}
                              </h3>
                              <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                              }`}>
                                Course ID: {course.course_id}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                                <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enrolled:</span>
                                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                                  {userRole === 'super_admin' ? (
                                    course.total_students
                                  ) : (
                                    isUnlocked ? (
                                      isUnlocked.total_students
                                    ) : (
                                      <span className="flex items-center space-x-1 text-xs text-red-500 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
                                        <Lock className="w-3 h-3 mr-1" />
                                        <span>Locked</span>
                                      </span>
                                    )
                                  )}
                                </span>
                              </div>

                              {userRole !== 'super_admin' && (
                                isUnlocked ? (
                                  <button
                                    onClick={() => handleLockItem(cacheKey)}
                                    className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-1 text-xs transition-colors"
                                  >
                                    <Lock className="w-3 h-3" />
                                    <span>Lock</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => triggerPasswordPrompt('test_series', course.course_id, course.course_title)}
                                    className="px-2.5 py-1.5 bg-[#3936C9] hover:bg-[#2D2B9E] text-white rounded-lg flex items-center space-x-1 text-xs transition-colors"
                                  >
                                    <Unlock className="w-3 h-3" />
                                    <span>Unlock</span>
                                  </button>
                                )
                              )}
                            </div>
                          </div>

                          {/* Month breakdown per course */}
                          <div className="overflow-x-auto">
                            {userRole === 'super_admin' ? (
                              course.monthly_breakdown?.length === 0 ? (
                                <p className={`text-xs py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  No purchases recorded for this course.
                                </p>
                              ) : (
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className={`border-b ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'} font-medium`}>
                                      <th className="py-2 px-3 text-left">Month</th>
                                      <th className="py-2 px-3 text-center">Purchases</th>
                                      <th className="py-2 px-3 text-right">Revenue</th>
                                    </tr>
                                  </thead>
                                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                    {course.monthly_breakdown?.map((row, index) => (
                                      <tr key={index} className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                                        <td className="py-2 px-3 font-medium flex items-center space-x-1.5">
                                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                          <span>{formatMonth(row.purchase_month)}</span>
                                        </td>
                                        <td className="py-2 px-3 text-center">{row.total_purchases}</td>
                                        <td className="py-2 px-3 text-right font-semibold text-green-600 dark:text-green-400">
                                          ₹{row.total_amount.toFixed(2)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )
                            ) : (
                              // Teacher access control
                              isUnlocked ? (
                                isUnlocked.monthly_breakdown.length === 0 ? (
                                  <p className={`text-xs py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    No purchases recorded for this course.
                                  </p>
                                ) : (
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className={`border-b ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'} font-medium`}>
                                        <th className="py-2 px-3 text-left">Month</th>
                                        <th className="py-2 px-3 text-center">Purchases</th>
                                        <th className="py-2 px-3 text-right">Revenue</th>
                                      </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                      {isUnlocked.monthly_breakdown.map((row, index) => (
                                        <tr key={index} className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                                          <td className="py-2 px-3 font-medium flex items-center space-x-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            <span>{formatMonth(row.purchase_month)}</span>
                                          </td>
                                          <td className="py-2 px-3 text-center">{row.total_purchases}</td>
                                          <td className="py-2 px-3 text-right font-semibold text-green-600 dark:text-green-400">
                                            ₹{row.total_amount.toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )
                              ) : (
                                <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-xl border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10">
                                  <Lock className="w-6 h-6 text-gray-400 mb-2" />
                                  <p className={`text-[11px] mb-3 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Detailed monthly breakdowns are password-protected
                                  </p>
                                  <button
                                    onClick={() => triggerPasswordPrompt('test_series', course.course_id, course.course_title)}
                                    className="px-3 py-1 bg-[#3936C9] hover:bg-[#2D2B9E] text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                                  >
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Unlock to View</span>
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Password Configuration Section - Super Admin Only */}
            {userRole === 'super_admin' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } shadow-sm space-y-4`}
              >
                <div className="flex items-center space-x-3 border-b pb-3 border-gray-200 dark:border-gray-700">
                  <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Configure Access Passwords
                  </h3>
                </div>

                <form onSubmit={handleSetPassword} className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Access Category
                      </label>
                      <select
                        value={pwTargetType}
                        onChange={(e) => {
                          setPwTargetType(e.target.value);
                          setPwTargetId('');
                        }}
                        className={`w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      >
                        <option value="monthly_test">Current Affairs Monthly Test</option>
                        <option value="test_series">Individual Test Series Course</option>
                      </select>
                    </div>

                    {pwTargetType === 'test_series' && (
                      <div>
                        <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Select Test Series Course
                        </label>
                        <select
                          value={pwTargetId}
                          onChange={(e) => setPwTargetId(e.target.value)}
                          required
                          className={`w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="">-- Choose Course --</option>
                          {data.test_series.map(course => (
                            <option key={course.course_id} value={course.course_id}>
                              {course.course_title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Access Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new verification password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className={`w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={settingPassword}
                    className="px-4 py-2 bg-[#3936C9] hover:bg-[#2D2B9E] text-white rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    {settingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>Set Access Password</span>
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Password Prompt Modal */}
      <AnimatePresence>
        {showPromptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm rounded-xl p-6 shadow-xl border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                  <Lock className="w-4 h-4" />
                  <h4 className="font-bold text-sm">Enter Password</h4>
                </div>
                <button
                  onClick={() => setShowPromptModal(false)}
                  className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleVerifyPassword} className="space-y-4">
                <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Please enter the access password to view financing details for: <br />
                  <strong className="text-indigo-500 dark:text-indigo-400">{promptTarget.title}</strong>
                </p>

                <input
                  type="password"
                  placeholder="Enter Password"
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  autoFocus
                  required
                  className={`w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPromptModal(false)}
                    className={`flex-1 py-2 text-xs border rounded-lg transition-colors ${
                      isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifying}
                    className="flex-1 py-2 bg-[#3936C9] hover:bg-[#2D2B9E] text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>Unlock</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminCourseFinancing;
