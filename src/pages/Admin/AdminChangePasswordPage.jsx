import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';

const AdminChangePasswordPage = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Auto-enable fullscreen on page load
  useEffect(() => {
    const enableFullscreenOnLoad = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (error) {
        console.log('Fullscreen not supported or blocked:', error);
      }
    };

    const timer = setTimeout(enableFullscreenOnLoad, 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide success/error messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.current_password || !formData.new_password || !formData.confirm_password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    const passwordValidation = validatePassword(formData.new_password);
    if (!passwordValidation.isValid) {
      setMessage({ type: 'error', text: 'New password does not meet requirements' });
      return;
    }

    if (formData.current_password === formData.new_password) {
      setMessage({ type: 'error', text: 'New password must be different from current password' });
      return;
    }

    setLoading(true);
    
    const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/Auth/update_password.php`;
    const requestData = {
      currentPassword: formData.current_password,
      newPassword: formData.new_password,
      confirmPassword: formData.confirm_password
    };

    console.log('🔘 Change Password button clicked!');
    console.log('=== Password Update Request ===');
    console.log('API URL:', apiUrl);
    console.log('Request data:', requestData);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text was:', responseText);
        setMessage({ type: 'error', text: 'Invalid response from server' });
        setLoading(false);
        return;
      }

      if (data.success) {
        console.log('✓ Password changed successfully!');
        setMessage({ type: 'success', text: 'Password updated successfully' });
        setFormData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        console.log('✗ Password change failed:', data.message);
        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch (error) {
      console.error('=== Error changing password ===');
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
      console.log('=== Password Update Request Complete ===');
    }
  };

  const passwordValidation = validatePassword(formData.new_password);

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-[#3936C9] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-[#3936C9]" />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>Change Password</h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Update your password to keep your account secure
          </p>
        </motion.div>

        {/* Change Password Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl shadow-sm border p-8 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message */}
            {message.text && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center space-x-2 p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{message.text}</span>
              </motion.div>
            )}

            {/* Current Password */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Current Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#3936C9] focus:border-transparent outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    isDarkMode 
                      ? 'text-gray-500 hover:text-gray-300' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                New Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#3936C9] focus:border-transparent outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    isDarkMode 
                      ? 'text-gray-500 hover:text-gray-300' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.new_password && (
                <div className="mt-3 space-y-2">
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Password Requirements:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center space-x-2 text-sm ${
                      passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidation.minLength ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-sm ${
                      passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidation.hasUpperCase ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-sm ${
                      passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidation.hasLowerCase ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-sm ${
                      passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidation.hasNumbers ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span>One number</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-sm ${
                      passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        passwordValidation.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span>One special character</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#3936C9] focus:border-transparent outline-none transition-all ${
                    formData.confirm_password && formData.new_password !== formData.confirm_password
                      ? 'border-red-300 bg-red-50'
                      : isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    isDarkMode 
                      ? 'text-gray-500 hover:text-gray-300' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formData.confirm_password && formData.new_password !== formData.confirm_password && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !passwordValidation.isValid || formData.new_password !== formData.confirm_password}
              className="w-full bg-[#3936C9] text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-[#2D2B9E] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Changing Password...</span>
                </div>
              ) : (
                'Change Password'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Security Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`border rounded-xl p-6 ${
            isDarkMode 
              ? 'bg-blue-900 bg-opacity-20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-3 ${
            isDarkMode ? 'text-blue-300' : 'text-blue-900'
          }`}>Security Tips</h3>
          <ul className={`space-y-2 text-sm ${
            isDarkMode ? 'text-blue-400' : 'text-blue-800'
          }`}>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span>Use a unique password that you don't use anywhere else</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span>Consider using a password manager to generate and store secure passwords</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span>Avoid using personal information like names, birthdays, or common words</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span>Change your password regularly and immediately if you suspect it's compromised</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminChangePasswordPage;