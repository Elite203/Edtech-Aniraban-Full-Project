import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  UserCheck,
  Edit3
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';

const AdminUsersPage = () => {
  const { isDarkMode } = useTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({
    total_students: 0,
    active_students: 0,
    inactive_students: 0,
    suspended_students: 0,
    verified_students: 0,
    unverified_students: 0,
    new_today: 0,
    new_this_week: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    verified: '',
    page: 1,
    limit: 50,
    sort_by: 'created_at',
    sort_order: 'DESC'
  });
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [selectedStudentForEnrollments, setSelectedStudentForEnrollments] = useState(null);
  const [studentEnrollments, setStudentEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  const handleViewEnrollments = async (student) => {
    setSelectedStudentForEnrollments(student);
    setShowEnrollmentsModal(true);
    setLoadingEnrollments(true);
    setStudentEnrollments([]);
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(`${backendUrl}/api/Students/get_student_enrollments.php?student_id=${student.id}`);
      if (response.data && response.data.success) {
        setStudentEnrollments(response.data.data || []);
      } else {
        setStudentEnrollments([]);
      }
    } catch (err) {
      console.error("Error fetching student enrollments:", err);
      setStudentEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  };
  
  // Local search functionality
  const filteredStudents = students.filter(student => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm) ||
      student.phone?.toLowerCase().includes(searchTerm) ||
      student.number?.toLowerCase().includes(searchTerm) ||
      student.id?.toString().includes(searchTerm)
    );
  });

  useEffect(() => {
    console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
    fetchStudents();
  }, []);

  useEffect(() => {
    // Only fetch when non-search filters change
    if (filters.status || filters.verified) {
      fetchStudents();
    }
  }, [filters.status, filters.verified]);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
      setError('Backend URL not configured.');
      setLoading(false);
      return;
    }
    
    try {
      const url = `${backendUrl}/api/Students/get_students.php`;
      console.log('Fetching from:', url);
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Response received:', response.data);
      
      if (response.data && response.data.success === true) {
        setStudents(response.data.data?.students || []);
        setTotalStudents(response.data.data?.total || 0);
        setTotalPages(response.data.data?.total_pages || 1);
        setMetrics(response.data.data?.metrics || {
          total_students: 0,
          active_students: 0,
          inactive_students: 0,
          suspended_students: 0,
          verified_students: 0,
          unverified_students: 0,
          new_today: 0,
          new_this_week: 0
        });
      } else {
        const errorMessage = response.data?.message || 'Failed to fetch students';
        setError(errorMessage);
      }
    } catch (error) {
      let errorMessage = 'Failed to fetch students';
      
      if (error.response) {
        // Server responded with error status
        console.error('Server Error:', error.response.status, error.response.data);
        errorMessage = `Server Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`;
      } else if (error.request) {
        // Network error
        console.error('Network Error:', error.request);
        errorMessage = 'Network Error: Unable to reach server. Check your internet connection.';
      } else {
        // Other error
        console.error('Request Error:', error.message);
        errorMessage = `Request Error: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };



  const handleDeleteStudent = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleEditStudent = (student) => {
    setStudentToEdit(student);
    setShowEditModal(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    setDeleting(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/Students/delete_student.php`, {
        student_id: studentToDelete.id
      });

      if (response.data.success) {
        setShowDeleteModal(false);
        setStudentToDelete(null);
        fetchStudents(); // Refresh the list
      } else {
        alert('Failed to delete student: ' + response.data.message);
      }
    } catch (error) {
      alert('Error deleting student');
      console.error('Delete student error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'student': 'bg-blue-100 text-blue-800',
      'test_series_teacher': 'bg-green-100 text-green-800',
      'current_affairs_teacher': 'bg-purple-100 text-purple-800',
      'admin': 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const CreateUserModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      role: 'student',
      password: ''
    });
    const [creating, setCreating] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setCreating(true);

      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/Teachers/users_management.php`, {
          action: 'create_user',
          ...formData
        });

        if (response.data.success) {
          setShowCreateModal(false);
          setFormData({ name: '', email: '', phone: '', role: 'student', password: '' });
          fetchStudents();
        } else {
          alert('Failed to create student: ' + response.data.message);
        }
      } catch (error) {
        alert('Error creating student');
        console.error('Create student error:', error);
      } finally {
        setCreating(false);
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-lg p-6 w-full max-w-md ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Create New Student</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="student">Student</option>
                <option value="test_series_teacher">Test Series Teacher</option>
                <option value="current_affairs_teacher">Current Affairs Teacher</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  const EditStudentModal = () => {
    const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      number: '',
      status: 'active'
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
      if (studentToEdit) {
        setFormData({
          first_name: studentToEdit.first_name || '',
          last_name: studentToEdit.last_name || '',
          email: studentToEdit.email || '',
          password: '',
          number: studentToEdit.number || '',
          status: studentToEdit.status || 'active'
        });
      }
    }, [studentToEdit]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setUpdating(true);

      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/Students/update_student_info.php`, {
          student_id: studentToEdit.id,
          ...formData
        });

        if (response.data.success) {
          setShowEditModal(false);
          setStudentToEdit(null);
          setFormData({ first_name: '', last_name: '', email: '', password: '', number: '', status: 'active' });
          fetchStudents(); // Refresh the list
        } else {
          alert('Failed to update student: ' + response.data.message);
        }
      } catch (error) {
        alert('Error updating student');
        console.error('Update student error:', error);
      } finally {
        setUpdating(false);
      }
    };

    const handleClose = () => {
      setShowEditModal(false);
      setStudentToEdit(null);
      setFormData({ first_name: '', last_name: '', email: '', password: '', number: '', status: 'active' });
    };

    if (!showEditModal || !studentToEdit) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Edit Student</h3>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  required
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Leave blank to keep current password"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Phone Number</label>
              <input
                type="tel"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="flex-1 px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Student'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  const EnrollmentsModal = () => {
    if (!showEnrollmentsModal || !selectedStudentForEnrollments) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Enrollments: {selectedStudentForEnrollments.first_name} {selectedStudentForEnrollments.last_name}
            </h3>
            <button 
              onClick={() => {
                setShowEnrollmentsModal(false);
                setSelectedStudentForEnrollments(null);
              }} 
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {loadingEnrollments ? (
              <div className="p-8 text-center flex flex-col items-center">
                <RefreshCw className={`w-8 h-8 animate-spin ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <p className="mt-2 text-sm text-gray-500">Loading enrollment data...</p>
              </div>
            ) : studentEnrollments.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-lg">
                <p className="text-gray-500 font-medium">Not enrolled in any courses</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {studentEnrollments.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{item.course_name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Type: <span className="font-medium">{item.course_type}</span> | Purchased: {formatDate(item.purchase_date)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Expires: <span className="font-medium">{formatDate(item.expiry_date)}</span>
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {item.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setShowEnrollmentsModal(false);
                setSelectedStudentForEnrollments(null);
              }}
              className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const DeleteConfirmationModal = () => {
    if (!showDeleteModal || !studentToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-lg p-4 sm:p-6 w-full max-w-md ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
          </div>
          <div className="text-center">
            <h3 className={`text-lg font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Delete Student
            </h3>
            <p className={`text-sm mb-4 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Are you sure you want to delete <span className="font-medium text-red-600">{studentToDelete.first_name} {studentToDelete.last_name}</span>? 
              This action cannot be undone and will permanently remove all student data.
            </p>
            <div className={`bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4 text-left`}>
              <div className="flex text-sm">
                <div className="ml-3">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                    Student Details:
                  </p>
                  <div className={`mt-1 text-xs ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
                    <p>ID: {studentToDelete.id}</p>
                    <p>Email: {studentToDelete.email}</p>
                    {(studentToDelete.phone || studentToDelete.number) && <p>Phone: {studentToDelete.phone || studentToDelete.number}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={cancelDelete}
              disabled={deleting}
              className={`flex-1 px-4 py-2 text-sm border rounded-lg transition-colors disabled:opacity-50 ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteStudent}
              disabled={deleting}
              className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {deleting ? (
                <>
                  <RefreshCw className="animate-spin w-4 h-4 mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Student'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{metrics.total_students}</p>
              </div>
              <Users className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Students</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{metrics.active_students}</p>
              </div>
              <UserCheck className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Verified Students</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{metrics.verified_students}</p>
              </div>
              <CheckCircle className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>New This Week</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{metrics.new_this_week}</p>
              </div>
              <TrendingUp className={`w-8 h-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>Student Management</h1>
            <p className={`mt-1 text-sm sm:text-base ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage students and their profiles
            </p>
          </div>
          <div className="w-full lg:w-80">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search by name, email, phone, or ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
        </div>



        {/* Students Table */}
        <div className={`rounded-lg border overflow-hidden ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-6 py-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Students List</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchStudents}
                  disabled={loading}
                  className={`p-2 transition-colors disabled:opacity-50 ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className={`w-8 h-8 animate-spin mx-auto ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <p className={`mt-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Loading students...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p>{error}</p>
              <button
                onClick={fetchStudents}
                className="mt-2 px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <Users className={`w-12 h-12 mx-auto mb-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No students found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto w-full">
                <div className="max-h-96 overflow-y-auto min-w-[800px]">
                  <table className="w-full">
                    <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Student
                        </th>
                        <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Contact
                        </th>
                        <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Status
                        </th>
                        <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Enrollments
                        </th>
                        <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Created
                        </th>
                        <th className={`px-3 sm:px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                      {filteredStudents.map((student) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {student.profile_picture ? (
                              <img 
                                src={student.profile_picture} 
                                alt={student.name}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-8 h-8 sm:w-10 sm:h-10 bg-[#3936C9] rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm ${
                                student.profile_picture ? 'hidden' : ''
                              }`}
                            >
                              {(student.first_name?.charAt(0) || student.last_name?.charAt(0) || '?').toUpperCase()}
                            </div>
                            <div className="ml-2 sm:ml-4">
                              <div className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} select-text flex items-center`}>
                                {student.first_name} {student.last_name}
                                {student.is_verified && (
                                  <CheckCircle className="w-3 h-3 text-green-500 ml-1" title="Verified" />
                                )}
                              </div>
                              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center select-text`}>
                                ID: {student.id}
                                {!student.is_verified && (
                                  <span className="ml-1 text-red-500 text-xs" title="Unverified">•</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} space-y-1`}>
                            <div className="flex items-center select-text">
                              <Mail className="w-3 h-3 mr-1 sm:mr-2 flex-shrink-0" />
                              <span className="truncate">{student.email}</span>
                            </div>
                            {student.phone && (
                              <div className="flex items-center select-text">
                                <Phone className="w-3 h-3 mr-1 sm:mr-2 flex-shrink-0" />
                                <span>{student.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full select-text ${getStatusBadgeColor(student.status)}`}>
                            {student.status?.charAt(0)?.toUpperCase() + student.status?.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewEnrollments(student)}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-[#3936C9] dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/40 transition-colors"
                          >
                            Enrolled Courses
                          </button>
                        </td>
                        <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex items-center select-text">
                            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="hidden sm:inline">{formatDate(student.created_at)}</span>
                            <span className="sm:hidden">{new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1 sm:p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Edit Student"
                            >
                              <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1 sm:p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Create Student Modal */}
        <CreateUserModal />
        
        {/* Edit Student Modal */}
        <EditStudentModal />
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal />

        {/* Enrollments Modal */}
        <EnrollmentsModal />
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;