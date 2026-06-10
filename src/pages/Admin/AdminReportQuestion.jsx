import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  BookOpen,
  Star,
  MessageSquare,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, X as CloseIcon } from 'lucide-react';

const AdminReportQuestion = () => {
  const { adminUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uiFilter, setUiFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const { isDarkMode } = useTheme();

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const checkPermission = (action = 'modify') => {
    if (adminUser?.role === 'test_teacher' || adminUser?.role === 'ca_teacher') {
      showToast(`Access Denied: Teachers cannot ${action} reports.`, 'error');
      return false;
    }
    return true;
  };


  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BASE_URL || '';
      const response = await axios.get(`${backendUrl}/api/SaveandReport/get_admin_reported_questions.php`);
      if (response.data.success) {
        setReports(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to fetch reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      (report.student_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (report.question_english?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (report.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (report.course_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (report.exam_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (report.set_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (report.question_id?.toString() || '').includes(searchTerm);

    const matchesFilter = filterType === 'all' || report.issue_type === filterType;
    const matchesUiFilter = uiFilter === 'all' ||
      (uiFilter === 'old_ui' ? (!report.quiz_type || report.quiz_type === 'old_ui') : report.quiz_type === uiFilter);

    return matchesSearch && matchesFilter && matchesUiFilter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  const handleSelectReport = async (id, currentStatus) => {
    if (!checkPermission('resolve')) return;
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BASE_URL || '';
      const response = await axios.post(`${backendUrl}/api/SaveandReport/update_report_status.php`, {
        id,
        is_checked: newStatus
      });
      if (response.data.success) {
        setReports(prev => prev.map(report =>
          report.id === id ? { ...report, is_checked: newStatus } : report
        ));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSelectAll = async (e) => {
    if (!checkPermission('resolve all')) return;
    const isChecked = e.target.checked ? 1 : 0;
    const idsToUpdate = currentReports.map(r => r.id);

    // Optimistic update
    setReports(prev => prev.map(report =>
      idsToUpdate.includes(report.id) ? { ...report, is_checked: isChecked } : report
    ));

    try {
      // Parallel requests for each update
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BASE_URL || '';
      await Promise.all(idsToUpdate.map(id =>
        axios.post(`${backendUrl}/api/SaveandReport/update_report_status.php`, {
          id,
          is_checked: isChecked
        })
      ));
    } catch (err) {
      console.error('Failed to update all statuses:', err);
      fetchReports(); // Revert on failure
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const issueTypes = ['all', ...new Set(reports.map(r => r.issue_type))];

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Reported Questions
            </h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Review and manage questions reported by students
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={fetchReports}
              disabled={loading}
              className={`p-2 rounded-lg border flex items-center justify-center transition-all ${isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                } disabled:opacity-50`}
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search student or question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-800'
                  } focus:outline-none focus:ring-2 focus:ring-[#3936C9] w-full sm:w-64 transition-all`}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={uiFilter}
                onChange={(e) => setUiFilter(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-800'
                  } focus:outline-none focus:ring-2 focus:ring-[#3936C9] appearance-none w-full transition-all`}
              >
                <option value="all">All UI</option>
                <option value="current_affairs">Current Affairs</option>
                <option value="new_ui">EDUQUITY Pattern (SSC)</option>
                <option value="old_ui">TCS iON Pattern (All CBT)</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-800'
                  } focus:outline-none focus:ring-2 focus:ring-[#3936C9] appearance-none w-full transition-all`}
              >
                {issueTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1">
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button onClick={fetchReports} className="p-2 hover:bg-red-200 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                <tr className={`${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className={`w-4 h-4 rounded border-gray-300 text-[#3936C9] focus:ring-[#3936C9] ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                      onChange={handleSelectAll}
                      checked={currentReports.length > 0 && currentReports.every(r => r.is_checked === 1)}
                    />
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">SN</th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">UI</th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-center">Question Info</th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Issue Type</th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Visuals</th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Remarks/Rating</th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td colSpan="8" className="px-6 py-4">
                        <div className={`h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}></div>
                      </td>
                    </tr>
                  ))
                ) : currentReports.length > 0 ? (
                  currentReports.map((report, index) => (
                    <tr
                      key={report.id}
                      className={`${isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'} transition-colors duration-200`}
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          className={`w-4 h-4 rounded border-gray-300 text-[#3936C9] focus:ring-[#3936C9] ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                          checked={report.is_checked === 1}
                          onChange={() => handleSelectReport(report.id, report.is_checked)}
                        />
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{report.student_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-tighter ${report.quiz_type === 'current_affairs'
                          ? 'bg-purple-100 text-purple-600 border border-purple-200'
                          : report.quiz_type === 'new_ui'
                            ? 'bg-blue-100 text-blue-600 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                          {report.quiz_type === 'current_affairs'
                            ? 'Current Affairs'
                            : report.quiz_type === 'new_ui'
                              ? 'EDUQUITY Pattern (SSC)'
                              : 'TCS iON Pattern (All CBT)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => setSelectedQuestion(report)}
                            className="inline-flex items-center space-x-2 text-[#3936C9] hover:text-[#2d2a9e] font-semibold transition-all px-3 py-1.5 rounded-lg border border-[#3936C9]/20 hover:bg-[#3936C9]/10"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Question</span>
                          </button>
                          {report.set_name && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md uppercase tracking-wider ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                              }`}>
                              {report.set_name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${report.issue_type === 'Incorrect Answer'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-600'
                          }`}>
                          {report.issue_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm line-clamp-2 max-w-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {report.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {report.image_url ? (
                          <button
                            onClick={() => setSelectedImage(report.image_url)}
                            className="group relative w-12 h-12 rounded overflow-hidden border border-gray-200 hover:border-indigo-500 transition-all"
                          >
                            <img
                              src={report.image_url}
                              alt="Report proof"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No image</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {report.remarks && (
                            <div className="flex items-start space-x-1">
                              <MessageSquare className="w-3 h-3 text-gray-400 mt-1" />
                              <span className="text-xs text-gray-500">{report.remarks}</span>
                            </div>
                          )}
                          {report.rating !== null && (
                            <div className="flex items-center space-x-1">
                              <Star className={`w-3 h-3 ${report.rating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                              <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{report.rating}/5</span>
                            </div>
                          )}
                          {!report.remarks && report.rating === null && (
                            <span className="text-xs text-gray-400 italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(report.created_at)}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className={`p-4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <AlertCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No reported questions found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredReports.length > itemsPerPage && (
            <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <p className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredReports.length)} of {filteredReports.length} entries
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border ${isDarkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} disabled:opacity-50 transition-colors`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1
                        ? 'bg-[#3936C9] text-white'
                        : isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border ${isDarkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} disabled:opacity-50 transition-colors`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={selectedImage}
                alt="Enlarged proof"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Info Modal */}
      <AnimatePresence>
        {selectedQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedQuestion(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative max-w-lg w-full ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 shadow-2xl border`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                  Question Details
                </h3>
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Question ID</span>
                  <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedQuestion.question_id}</p>
                </div>

                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Question (English)</span>
                  <div
                    className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} max-h-40 overflow-y-auto pr-2 custom-scrollbar`}
                    dangerouslySetInnerHTML={{ __html: selectedQuestion.question_english }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Course</span>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedQuestion.course_name || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Exam</span>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedQuestion.exam_name || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} col-span-full`}>
                    <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Set Name</span>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedQuestion.set_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-5 right-5 z-[10000] px-6 py-3 rounded-lg shadow-2xl text-white font-medium flex items-center space-x-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
              }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2">
              <CloseIcon className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>

  );
};

export default AdminReportQuestion;
