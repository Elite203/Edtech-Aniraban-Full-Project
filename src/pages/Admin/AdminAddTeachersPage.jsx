import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  UserPlus,
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Plus,
  Shield,
  Key,
  KeyRound
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';

const AdminAddTeachersPage = () => {
  const { isDarkMode } = useTheme();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'super_admin',
    status: 'active'
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    role: '',
    status: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showFinalDeleteModal, setShowFinalDeleteModal] = useState(false);
  const [show2FAResetModal, setShow2FAResetModal] = useState(false);
  const [resetting2FAAdmin, setResetting2FAAdmin] = useState(null);
  const [reset2FALoading, setReset2FALoading] = useState(false);
  const [showFinal2FAResetModal, setShowFinal2FAResetModal] = useState(false);

  const buildUrl = (path) => `${import.meta.env.VITE_BACKEND_URL}${path}`;



  useEffect(() => {
    // Fetch admins from API
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const res = await axios.get(buildUrl('/api/Auth/admin_auth.php?action=get_all_admins'));
        if (res.data.success) {
          setAdmins(res.data.data);
        } else {
          setError('Failed to fetch data. Please try reloading.');
          setAdmins([]);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
        setError('Failed to fetch data. Please try reloading.');
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || admin.role === filterRole;
    
    // Handle special 2FA disabled filter
    if (filterStatus === '2fa_disabled') {
      return matchesSearch && matchesRole && !admin.two_factor_enabled;
    }
    
    const matchesStatus = !filterStatus || admin.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: admins.length,
    active: admins.filter(a => a.status === 'active').length,
    roles: [...new Set(admins.map(a => a.role))].length,
    superAdmins: admins.filter(a => a.role === 'super_admin').length,
    caTeachers: admins.filter(a => a.role === 'ca_teacher').length,
    testTeachers: admins.filter(a => a.role === 'test_teacher').length,
    twoFactorEnabled: admins.filter(a => a.two_factor_enabled).length
  };

  const roles = [...new Set(admins.map(a => a.role))];

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    
    try {
      const response = await axios.post(buildUrl('/api/Teachers/add_teachers.php'), formData);
      
      if (response.data.success) {
        // Add new admin to current list
        const newAdmin = {
          ...formData,
          id: response.data.admin_id || Date.now(),
          two_factor_enabled: 0,
          last_login: null,
          created_at: new Date().toISOString().replace('T', ' ').split('.')[0]
        };
        
        setAdmins(prev => [...prev, newAdmin]);
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'super_admin',
          status: 'active'
        });
        showToastMessage('Teacher added successfully!');
      } else {
        showToastMessage(response.data.message || 'Failed to add teacher');
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      showToastMessage('Error adding teacher. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setEditFormData({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      status: admin.status
    });
    setShowEditModal(true);
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    
    try {
      const response = await axios.post(buildUrl('/api/Teachers/update_teachers.php'), editFormData);
      
      if (response.data.success) {
        // Update admin in current list
        setAdmins(prev => prev.map(admin => 
          admin.id === editFormData.id 
            ? { ...admin, ...editFormData, password: admin.password } // Keep original password hidden
            : admin
        ));
        setShowEditModal(false);
        setEditingAdmin(null);
        setEditFormData({
          id: '',
          name: '',
          email: '',
          password: '',
          role: '',
          status: ''
        });
        showToastMessage('Teacher updated successfully!');
      } else {
        showToastMessage(response.data.message || 'Failed to update teacher');
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      showToastMessage('Error updating teacher. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (admin) => {
    setDeletingAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleFirstDeleteConfirm = () => {
    setShowDeleteModal(false);
    setShowFinalDeleteModal(true);
  };

  const handleFinalDeleteConfirm = async () => {
    setDeleteLoading(true);
    
    try {
      const response = await axios.post(buildUrl('/api/Teachers/delete_teachers.php'), {
        id: deletingAdmin.id
      });
      
      if (response.data.success) {
        // Remove admin from current list
        setAdmins(prev => prev.filter(admin => admin.id !== deletingAdmin.id));
        setShowFinalDeleteModal(false);
        setDeletingAdmin(null);
        showToastMessage('Teacher deleted successfully!');
      } else {
        showToastMessage(response.data.message || 'Failed to delete teacher');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      showToastMessage('Error deleting teacher. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setShowFinalDeleteModal(false);
    setDeletingAdmin(null);
  };

  const handle2FAResetClick = (admin) => {
    setResetting2FAAdmin(admin);
    setShow2FAResetModal(true);
  };

  const handleFirst2FAResetConfirm = () => {
    setShow2FAResetModal(false);
    setShowFinal2FAResetModal(true);
  };

  const handleFinal2FAResetConfirm = async () => {
    setReset2FALoading(true);
    
    try {
      const response = await axios.post(buildUrl('/api/Auth/reset_2fa.php'), {
        id: resetting2FAAdmin.id
      });
      
      if (response.data.success) {
        // Update admin in current list - set 2FA to disabled
        setAdmins(prev => prev.map(admin => 
          admin.id === resetting2FAAdmin.id 
            ? { ...admin, two_factor_enabled: 0 }
            : admin
        ));
        setShowFinal2FAResetModal(false);
        setResetting2FAAdmin(null);
        showToastMessage('2FA reset successfully!');
      } else {
        showToastMessage(response.data.message || 'Failed to reset 2FA');
      }
    } catch (error) {
      console.error('Error resetting 2FA:', error);
      showToastMessage('Error resetting 2FA. Please try again.');
    } finally {
      setReset2FALoading(false);
    }
  };

  const handle2FAResetCancel = () => {
    setShow2FAResetModal(false);
    setShowFinal2FAResetModal(false);
    setResetting2FAAdmin(null);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div
      className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{value}</p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
        {subtitle && (
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Teacher Management
                </h1>
                <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Manage teacher users and their information.
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2f2ba6] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Teachers</span>
                </button>
              </div>
            </div>
          </div>
          {/* Stats Cards */}
          <div className="mb-8">
            {/* Original Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
              <StatCard
                icon={Users}
                title="Total Members"
                value={stats.total}
                color="blue"
              />
              <StatCard
                icon={CheckCircle}
                title="Active Teachers"
                value={stats.active}
                color="green"
              />
              <StatCard
                icon={GraduationCap}
                title="Total Roles"
                value={stats.roles}
                color="purple"
              />
            </div>
            
            {/* New Role-Specific Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard
                icon={Shield}
                title="Super Admins"
                value={stats.superAdmins}
                subtitle="🛡️ Highest Access"
                color="blue"
              />
              <StatCard
                icon={GraduationCap}
                title="CA Teachers"
                value={stats.caTeachers}
                subtitle="📚 CA Educators"
                color="green"
              />
              <StatCard
                icon={Award}
                title="Test Teachers"
                value={stats.testTeachers}
                subtitle="📝 Test Series"
                color="purple"
              />
              <StatCard
                icon={Key}
                title="2FA Enabled"
                value={stats.twoFactorEnabled}
                subtitle="🔐 Security"
                color="orange"
              />
            </div>
          </div>

          {/* Search and Filters */}
          <div className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                />
              </div>
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#3936C9]`}
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#3936C9]`}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="2fa_disabled">2FA Disabled</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('');
                  setFilterStatus('');
                }}
                className={`px-3 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors flex items-center justify-center space-x-2`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Admins Table */}
          <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#3936C9] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                  <p className="text-lg font-medium">{error}</p>
                </div>
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Users className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">No admins found</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar max-h-[600px] overflow-y-auto">
                <style dangerouslySetInnerHTML={{
                  __html: `
                    .no-scrollbar {
                      scrollbar-width: none;
                      -ms-overflow-style: none;
                    }
                    .no-scrollbar::-webkit-scrollbar {
                      display: none;
                      width: 0;
                      height: 0;
                    }
                  `
                }} />
                <table className="w-full">
                  <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Admin Info
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Credentials
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Role & Security
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {filteredAdmins.map((admin, index) => (
                      <motion.tr
                        key={admin.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-[#3936C9] rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {admin.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} select-text`}>
                                {admin.name}
                              </div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center select-text`}>
                                <Mail className="w-3 h-3 mr-1" />
                                {admin.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} select-text`}>
                            Password
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} select-text`}>
                            ••••••••
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} flex items-center select-text`}>
                            <Key className="w-3 h-3 mr-1" />
                            Hidden
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} select-text`}>
                            {admin.role.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center select-text`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {admin.two_factor_enabled ? '2FA Enabled' : '2FA Disabled'}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} flex items-center select-text`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : 'Never'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full select-text ${
                            admin.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : admin.status === 'suspended'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleEditClick(admin)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Edit Teacher"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {admin.two_factor_enabled && (
                              <button 
                                onClick={() => handle2FAResetClick(admin)}
                                className="text-orange-600 hover:text-orange-800 transition-colors"
                                title="Reset 2FA"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteClick(admin)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete Teacher"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredAdmins.length === 0 && (
                  <div className="text-center py-12">
                    <UserPlus className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      No admins found
                    </p>
                    <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                      Try adjusting your search criteria or add new admins.
                    </p>
                  </div>
                )}
                

              </div>
            )}
          </div>
        </div>

        {/* Add Admin Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl`}
            >
              <div className="p-6">
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Add New Teacher
                </h2>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#3936C9]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#3936C9]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#3936C9]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#3936C9]`}
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="ca_teacher">CA Teacher</option>
                      <option value="test_teacher">Test Teacher</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#3936C9]`}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className={`flex-1 px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addLoading}
                      className="flex-1 px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2f2ba6] transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {addLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Add Teacher'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Admin Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl`}
            >
              <div className="p-6">
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Edit Teacher
                </h2>
                <form onSubmit={handleEditAdmin} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      required
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#3936C9]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditInputChange}
                      required
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#3936C9]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={editFormData.password}
                      onChange={handleEditInputChange}
                      placeholder="Leave empty to keep current password"
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#3936C9]`}
                    />
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Leave empty to keep current password
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Role
                    </label>
                    <select
                      name="role"
                      value={editFormData.role}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#3936C9]`}
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="ca_teacher">CA Teacher</option>
                      <option value="test_teacher">Test Teacher</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditInputChange}
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#3936C9]`}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingAdmin(null);
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="flex-1 px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2f2ba6] transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {editLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Update Teacher'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* First Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl`}
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className={`text-xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Delete Teacher
                </h2>
                <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Are you sure you want to delete <strong>{deletingAdmin?.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    className={`flex-1 px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFirstDeleteConfirm}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Final Delete Confirmation Modal */}
        {showFinalDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl`}
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className={`text-xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Final Confirmation
                </h2>
                <p className={`text-center mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  This will permanently delete:
                </p>
                <div className={`bg-red-50 ${isDarkMode ? 'bg-red-900/20' : ''} border border-red-200 ${isDarkMode ? 'border-red-800' : ''} rounded-lg p-3 mb-6`}>
                  <p className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                    {deletingAdmin?.name}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {deletingAdmin?.email}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    Role: {deletingAdmin?.role?.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <p className={`text-center text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  This action is irreversible. All data associated with this teacher will be permanently lost.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    disabled={deleteLoading}
                    className={`flex-1 px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors disabled:opacity-50`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinalDeleteConfirm}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {deleteLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Permanently Delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* First 2FA Reset Confirmation Modal */}
        {show2FAResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl`}
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full">
                  <KeyRound className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className={`text-xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Reset 2FA
                </h2>
                <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Are you sure you want to reset 2FA for <strong>{resetting2FAAdmin?.name}</strong>? This will disable their two-factor authentication.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handle2FAResetCancel}
                    className={`flex-1 px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFirst2FAResetConfirm}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Yes, Reset
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Final 2FA Reset Confirmation Modal */}
        {showFinal2FAResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl`}
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className={`text-xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Final 2FA Reset Confirmation
                </h2>
                <p className={`text-center mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  This will reset 2FA settings for:
                </p>
                <div className={`bg-orange-50 ${isDarkMode ? 'bg-orange-900/20' : ''} border border-orange-200 ${isDarkMode ? 'border-orange-800' : ''} rounded-lg p-3 mb-6`}>
                  <p className={`font-semibold ${isDarkMode ? 'text-orange-300' : 'text-orange-800'}`}>
                    {resetting2FAAdmin?.name}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                    {resetting2FAAdmin?.email}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                    Role: {resetting2FAAdmin?.role?.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <p className={`text-center text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  The teacher will need to set up 2FA again on their next login.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handle2FAResetCancel}
                    disabled={reset2FALoading}
                    className={`flex-1 px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors disabled:opacity-50`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinal2FAResetConfirm}
                    disabled={reset2FALoading}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {reset2FALoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Reset 2FA'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAddTeachersPage;