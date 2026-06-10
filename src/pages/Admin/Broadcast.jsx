import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';

const Broadcast = () => {
  const { isDarkMode } = useTheme();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', text: '' });
  const quillRef = useRef();

  const buildUrl = useCallback((path) => `${import.meta.env.VITE_BACKEND_URL}${path}`, []);

  // Toast notification function
  const showToast = useCallback((type, text) => {
    setToast({ show: true, type, text });
    setTimeout(() => {
      setToast({ show: false, type: '', text: '' });
    }, 5000);
  }, []);

  // Clear toast function
  const clearToast = useCallback(() => {
    setToast(prev => prev.show ? { show: false, type: '', text: '' } : prev);
  }, []);

  // Custom link handler
  const handleLinkInsert = useCallback(() => {
    const url = prompt('Enter the URL:');
    if (url && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        if (range.length === 0) {
          const linkText = prompt('Enter link text:') || url;
          quill.insertText(range.index, linkText, 'link', url);
        } else {
          quill.formatText(range.index, range.length, 'link', url);
        }
      }
    }
  }, []);



  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline','blockquote', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'code-block'],
        ['clean']
      ],
      handlers: {
        'link': handleLinkInsert
      }
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!subject.trim()) {
      showToast('error', 'Subject is required');
      return;
    }
    
    if (!description.trim()) {
      showToast('error', 'Message content is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(buildUrl('/api/Students/send_student_mail.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject: subject.trim(),
          description: description
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast('success', `Broadcast sent successfully to ${data.totalSent} students!`);
        setSubject('');
        setDescription('');
      } else {
        showToast('error', data.message || 'Failed to send broadcast');
      }
    } catch (error) {
      console.error('Broadcast error:', error);
      showToast('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [buildUrl, subject, description, showToast]);

  const BroadcastCard = useCallback(({ title, description, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}
    >
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
      </div>
      {children}
    </motion.div>
  ), [isDarkMode]);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-[#3936C9] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-[#3936C9]" />
          </div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Broadcast Email</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Send email notifications to all registered students
          </p>
        </motion.div>

        {/* Toast Notification */}
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-center space-x-3 ${
              toast.type === 'success' 
                ? (isDarkMode ? 'bg-green-900 border border-green-700' : 'bg-green-50 border border-green-200')
                : (isDarkMode ? 'bg-red-900 border border-red-700' : 'bg-red-50 border border-red-200')
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            ) : (
              <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            )}
            <span className={`text-sm ${
              toast.type === 'success' 
                ? (isDarkMode ? 'text-green-400' : 'text-green-700')
                : (isDarkMode ? 'text-red-400' : 'text-red-700')
            }`}>
              {toast.text}
            </span>
          </motion.div>
        )}

        {/* Broadcast Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <BroadcastCard
            title="Compose Broadcast Message"
            description="Create and send email notifications to all registered students"
          >
            <div className="space-y-4">
              {/* Subject Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Mail className="w-4 h-4 inline-block mr-2" />
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onFocus={clearToast}
                  placeholder="Enter email subject..."
                  className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                  disabled={loading}
                />
              </div>

              {/* Description Field with Rich Text Editor */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message Content <span className="text-red-500">*</span>
                </label>
                <div className={`${isDarkMode ? 'quill-dark' : 'quill-light'}`}>
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={description}
                    onChange={setDescription}
                    modules={quillModules}
                    placeholder="Write your message content here..."
                    style={{ 
                      minHeight: '200px',
                      backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                    }}
                    readOnly={loading}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || !subject.trim() || !description.trim()}
                  className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    loading || !subject.trim() || !description.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#3936C9] hover:bg-[#2f2ba6] text-white shadow-sm hover:shadow-md'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Broadcast</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubject('');
                    setDescription('');
                    setToast({ show: false, type: '', text: '' });
                  }}
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                  }`}
                >
                  Clear Form
                </button>
              </div>
            </div>
          </BroadcastCard>
        </form>

        {/* Info Card */}
        <BroadcastCard
          title="Broadcast Information"
          description="Important details about email broadcast functionality"
        >
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
            <div className="flex items-center space-x-3 mb-2">
              <Users className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Target Audience: All Active Students
              </span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              <strong>Email Delivery:</strong> Messages will be sent to all active and verified student accounts in the system.
            </p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              Only students with verified email addresses will receive the broadcast message.
            </p>
          </div>
        </BroadcastCard>
      </div>

      {/* Custom Styles for ReactQuill */}
      <style>{`
        /* Light Mode Styles */
        .quill-light .ql-toolbar {
          background-color: #f9fafb;
          border-color: #d1d5db;
          border-radius: 8px 8px 0 0;
        }
        .quill-light .ql-toolbar button {
          color: #374151;
        }
        .quill-light .ql-toolbar button:hover {
          color: #111827;
          background-color: #e5e7eb;
        }
        .quill-light .ql-toolbar .ql-picker {
          color: #374151;
        }
        .quill-light .ql-toolbar .ql-picker-label {
          color: #374151;
        }
        .quill-light .ql-toolbar .ql-picker-label:hover {
          color: #111827;
        }
        .quill-light .ql-toolbar .ql-stroke {
          stroke: #374151;
        }
        .quill-light .ql-toolbar .ql-fill {
          fill: #374151;
        }
        .quill-light .ql-container {
          background-color: #ffffff;
          border-color: #d1d5db;
          color: #111827;
        }

        /* Dark Mode Styles */
        .quill-dark .ql-toolbar {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          border-radius: 8px 8px 0 0 !important;
        }
        .quill-dark .ql-toolbar button {
          color: #d1d5db !important;
        }
        .quill-dark .ql-toolbar button:hover {
          color: #ffffff !important;
          background-color: #4b5563 !important;
        }
        .quill-dark .ql-toolbar .ql-picker {
          color: #d1d5db !important;
        }
        .quill-dark .ql-toolbar .ql-picker-label {
          color: #d1d5db !important;
        }
        .quill-dark .ql-toolbar .ql-picker-label:hover {
          color: #ffffff !important;
        }
        .quill-dark .ql-toolbar .ql-stroke {
          stroke: #d1d5db !important;
        }
        .quill-dark .ql-toolbar .ql-fill {
          fill: #d1d5db !important;
        }
        .quill-dark .ql-container {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: #ffffff !important;
          border-radius: 0 0 8px 8px !important;
        }
        .quill-dark .ql-editor {
          color: #ffffff !important;
        }
        .quill-dark .ql-editor.ql-blank::before {
          color: #9ca3af !important;
        }
        .quill-dark .ql-picker-options {
          background-color: #374151 !important;
          color: #ffffff !important;
          border-color: #4b5563 !important;
        }
        .quill-dark .ql-picker-item {
          color: #ffffff !important;
        }
        
        /* Light Mode Container */
        .quill-light .ql-container {
          background-color: #ffffff;
          border-color: #d1d5db;
          border-radius: 0 0 8px 8px;
        }
        .quill-light .ql-editor {
          color: #111827;
        }
        .quill-light .ql-editor.ql-blank::before {
          color: #6b7280;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .ql-toolbar {
            overflow-x: auto;
            white-space: nowrap;
            padding: 8px 12px;
          }
          .ql-toolbar .ql-formats {
            display: inline-block;
            vertical-align: top;
          }
          .ql-editor {
            padding: 12px 15px;
          }
        }
        
        /* Link styles */
        .ql-editor a {
          color: #3936C9;
          text-decoration: underline;
        }
        .quill-dark .ql-editor a {
          color: #818cf8;
        }
        
        /* Focus styles */
        .quill-dark .ql-container:focus-within,
        .quill-light .ql-container:focus-within {
          box-shadow: 0 0 0 2px rgba(57, 54, 201, 0.2);
        }
      `}</style>
    </AdminLayout>
  );
};

export default Broadcast;