import React, { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion, AnimatePresence } from 'framer-motion';

import {
  FileText,
  Calendar,
  Globe,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Hash,
  Mic,
  Languages
} from 'lucide-react';
import { useSpeechToText, translateToHindi, translateHtmlToHindi } from '../../Admin Test Series Components/TranslateLogic';

import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, X as CloseIcon, AlertCircle } from 'lucide-react';

const imageHandler = function () {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = () => {
    const file = input.files[0];
    if (file && /^image\//.test(file.type)) {
      const reader = new FileReader();
      reader.onload = () => {
        const quill = this.quill;
        const range = quill.getSelection();
        if (range) {
          quill.insertEmbed(range.index, 'image', reader.result);
          quill.setSelection(range.index + 1);
        } else {
          quill.insertEmbed(quill.getLength(), 'image', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
};

const quillModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'blockquote'],
      ['clean']
    ],
    handlers: {
      image: imageHandler
    }
  },
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike', 'color', 'background',
  'list', 'bullet', 'align', 'link', 'image', 'blockquote'
];

import Admin_Current_Affairs_Monthly_Test from './Admin_Current_Affairs_Monthly_Test';

const AdminCurrentAffairsPage = () => {

  const { isDarkMode } = useTheme();
  const { adminUser } = useAuth();
  const [currentAffairs, setCurrentAffairs] = useState([]);

  // Permission check helper
  const checkPermission = (action = 'delete') => {
    if (adminUser?.role === 'test_teacher' || adminUser?.role === 'ca_teacher') {
      showToast(`Access Denied: Teachers cannot ${action} items.`, 'error');
      return false;
    }
    return true;
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ open: false, id: null, title: '', step: 1 });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };


  useEffect(() => {
    fetchCurrentAffairs();
    fetchCategories();
    fetchQuestionCount();
  }, []);

  const fetchQuestionCount = async () => {
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    try {
      const response = await fetch(`${BASE_URL}api/CurrentAffairs/get_ca_questions_count.php`);
      const data = await response.json();
      if (data.status === 'success') {
        setQuestionCount(data.total);
      }
    } catch (error) {
      console.error('Error fetching question count:', error);
    }
  };

  const fetchCurrentAffairs = async () => {

    setLoading(true);
    setError('');
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    try {
      const response = await fetch(`${BASE_URL}api/CurrentAffairs/get_admin_current_affairs_api.php`);
      const data = await response.json();
      if (data.status === 'success') {
        setCurrentAffairs(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }
    } catch (error) {
      setError('Failed to fetch current affairs: '.error.message);
      console.error('Current affairs fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    try {
      const response = await fetch(`${BASE_URL}api/CurrentAffairs/get_category_api.php`);
      const data = await response.json();
      if (data.status === 'success') {
        const rawCategories = data.data || [];
        const uniqueSet = new Set();
        rawCategories.forEach(item => {
          if (item.category) {
            item.category.split(',').forEach(c => {
              const trimmed = c.trim();
              if (trimmed) uniqueSet.add(trimmed);
            });
          }
        });
        const processed = Array.from(uniqueSet).sort().map(cat => ({ category: cat }));
        setCategories(processed);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [currentArticle, setCurrentArticle] = useState(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_hi: '',
    short_summary_en: '',
    short_summary_hi: '',
    content_en: '',
    content_hi: '',
    category: '',
    tags: '',
    youtube_link: '',
    status: 'active',
    published_at: new Date().toISOString().slice(0, 16)
  });
  const [activeTab, setActiveTab] = useState('en'); // 'en' or 'hi'
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const addCategory = (cat) => {
    if (!cat) return;
    const currentCats = formData.category ? formData.category.split(',').map(c => c.trim()).filter(Boolean) : [];
    if (!currentCats.includes(cat)) {
      setFormData(prev => ({ ...prev, category: [...currentCats, cat].join(', ') }));
    }
  };

  const removeCategory = (cat) => {
    const currentCats = formData.category ? formData.category.split(',').map(c => c.trim()).filter(Boolean) : [];
    setFormData(prev => ({ ...prev, category: currentCats.filter(c => c !== cat).join(', ') }));
  };

  const openAddModal = () => {
    setModalType('add');
    setCurrentArticle(null);
    setFormData({
      title_en: '',
      title_hi: '',
      short_summary_en: '',
      short_summary_hi: '',
      content_en: '',
      content_hi: '',
      category: '',
      tags: '',
      youtube_link: '',
      status: 'active',
      published_at: new Date().toISOString().slice(0, 16)
    });
    setActiveTab('en');
    setSelectedFile(null);
    setShowModal(true);
  };

  const openEditModal = (article) => {
    setModalType('edit');
    setCurrentArticle(article);
    setFormData({
      ...article,
      title_en: article.title_en || '',
      title_hi: article.title_hi || '',
      short_summary_en: article.short_summary_en || '',
      short_summary_hi: article.short_summary_hi || '',
      content_en: article.content_en || '',
      content_hi: article.content_hi || '',
      tags: article.tags || '',
      youtube_link: article.youtube_link || '',
      published_at: article.date ? new Date(article.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
    });
    setActiveTab('en');
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleTranslate = async (fieldName) => {
    const sourceText = formData[`${fieldName}_en`];
    const plainText = (sourceText || '').replace(/<[^>]*>?/gm, '').trim();
    if (!plainText) {
      showToast("Please enter English text first", "error");
      return;
    }
    
    showToast("Translating...", "info");
    try {
      const translated = await translateHtmlToHindi(sourceText);
      if (translated) {
        setFormData(prev => ({ ...prev, [`${fieldName}_hi`]: translated }));
        showToast("Translation complete!");
      }
    } catch (error) {
      console.error("Translation error:", error);
      showToast("Translation failed", "error");
    }
  };


  const handleVoiceTranscript = (fieldName) => (transcript) => {
    setFormData(prev => {
      const prevVal = prev[fieldName] || '';
      // If it's a Quill field (short_summary or content), wrap in <p>
      if (fieldName.includes('summary') || fieldName.includes('content')) {
        const cleanPrev = prevVal.replace(/<\/p>$/, '');
        return cleanPrev === "" || cleanPrev === "<p>" || cleanPrev === "<p><br>"
          ? `<p>${transcript}</p>`
          : `${cleanPrev} ${transcript}</p>`;
      }
      return prevVal ? `${prevVal} ${transcript}` : transcript;
    });
  };

  const { isListening: isListeningTitle, startListening: startListeningTitle } = useSpeechToText(handleVoiceTranscript(`title_${activeTab}`));
  const { isListening: isListeningSummaryEn, startListening: startListeningSummaryEn } = useSpeechToText(handleVoiceTranscript('short_summary_en'));
  const { isListening: isListeningSummaryHi, startListening: startListeningSummaryHi } = useSpeechToText(handleVoiceTranscript('short_summary_hi'));
  const { isListening: isListeningContentEn, startListening: startListeningContentEn } = useSpeechToText(handleVoiceTranscript('content_en'));
  const { isListening: isListeningHi, startListening: startListeningContentHi } = useSpeechToText(handleVoiceTranscript('content_hi'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      // Don't append 'image' if it's already in formData (it might be the Base64 string from API)
      if (key !== 'image') {
        submitData.append(key, formData[key]);
      }
    });
    if (selectedFile) {
      submitData.append('image', selectedFile);
    }
    if (modalType === 'edit') {
      submitData.append('id', currentArticle.id);
    }

    const apiUrl = modalType === 'add'
      ? `${BASE_URL}api/CurrentAffairs/add_current_affairs_api.php`
      : `${BASE_URL}api/CurrentAffairs/update_current_affairs_api.php`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: submitData
      });
      const data = await response.json();
      if (data.status === 'success') {
        setShowModal(false);
        fetchCurrentAffairs();
        fetchCategories();
      } else {
        alert(data.message || 'Error saving article');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Network error or invalid JSON response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (!checkPermission('delete article')) return;
    const article = currentAffairs.find(a => String(a.id) === String(id));
    setDeleteConfirmModal({ open: true, id, title: article?.title_en || 'this article', step: 1 });
  };

  const confirmDeleteStep2 = () => {
    setDeleteConfirmModal(prev => ({ ...prev, step: 2 }));
  };

  const confirmDeleteFinal = async () => {
    const id = deleteConfirmModal.id;
    setDeleteConfirmModal({ open: false, id: null, title: '', step: 1 });
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    try {
      const response = await fetch(`${BASE_URL}api/CurrentAffairs/delete_current_affairs_api.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.status === 'success') {
        showToast('Article deleted successfully.', 'success');
        fetchCurrentAffairs();
      } else {
        showToast(data.message || 'Error deleting article', 'error');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      showToast('Network error while deleting article', 'error');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmModal({ open: false, id: null, title: '', step: 1 });
  };

  const StatCard = ({ icon: Icon, title, value, color = 'blue', loading = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow duration-200 ${isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
        }`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${isDarkMode ? 'bg-gray-700' : `bg-${color}-50`
          }`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>{title}</h3>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
            {loading ? (
              <div className={`w-16 h-8 animate-pulse rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
            ) : (
              value?.toLocaleString() || '0'
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );

  const filteredCurrentAffairs = currentAffairs.filter(item => {
    return (
      ((item.title_en || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.title_hi || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterDate === '' || (item.date || '').includes(filterDate))
    );
  });

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium">{error}</div>
            <button
              onClick={fetchCurrentAffairs}
              className="mt-4 px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline-block mr-2" />
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Helper to get image URL
  const getImageUrl = (image) => {
    if (!image) return '';
    if (image.startsWith('data:')) return image;
    return `${import.meta.env.VITE_BASE_URL}${image}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Current Affairs Management</h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
              Manage and publish current affairs content
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={FileText}
            title="Total Articles"
            value={currentAffairs.length}
            color="blue"
            loading={loading}
          />
          <StatCard
            icon={Eye}
            title="Total Views"
            value={currentAffairs.reduce((sum, item) => sum + (item.views || 0), 0)}
            color="green"
            loading={loading}
          />
          <StatCard
            icon={Calendar}
            title="Published Today"
            value={currentAffairs.filter(item =>
              (item.date || '').split(' ')[0] === new Date().toISOString().split('T')[0] &&
              item.status === 'active'
            ).length}
            color="orange"
            loading={loading}
          />
          <StatCard
            icon={Hash}
            title="Monthly Quiz Questions"
            value={questionCount}
            color="purple"
            loading={loading}
          />
        </div>


        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl shadow-sm border ${isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
            }`}
        >
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Articles List</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={openAddModal}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Article</span>
                </button>
                <button
                  onClick={fetchCurrentAffairs}
                  disabled={loading}
                  className={`p-2 transition-colors disabled:opacity-50 ${isDarkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  }`}
              />
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDate('');
                }}
                className={`flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Filter className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className={`w-8 h-8 animate-spin mx-auto ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Loading articles...</p>
            </div>
          ) : filteredCurrentAffairs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No articles found</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
              <table className="w-full">
                <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-700 shadow-sm' : 'bg-gray-50 shadow-sm'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>Article</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>Category</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>Status</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                  }`}>
                  {filteredCurrentAffairs.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {item.image && (
                            <img
                              src={getImageUrl(item.image)}
                              alt=""
                              className="w-10 h-10 rounded object-cover mr-3"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <div>
                            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.title_en}
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} italic`}>
                              {item.title_hi}
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(item.date || item.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(item.category || '').split(',').map((cat, idx) => (
                            <span key={idx} className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                              }`}>
                              {cat.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'active'
                          ? (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                          : (isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800')
                          }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Monthly Quiz Section */}
        <Admin_Current_Affairs_Monthly_Test />


        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-2xl rounded-xl shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                }`}
            >
              <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                <h3 className="text-xl font-bold">
                  {modalType === 'add' ? 'Add New Article' : 'Edit Article'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-2">
                  <RefreshCw className="w-6 h-6 transform rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="flex border-b dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setActiveTab('en')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'en'
                      ? 'border-[#3936C9] text-[#3936C9]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                      }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('hi')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'hi'
                      ? 'border-[#3936C9] text-[#3936C9]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                      }`}
                  >
                    Hindi
                  </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  <div className="space-y-6">
                    {/* Language Specific Fields */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium">Title ({activeTab === 'en' ? 'English' : 'Hindi'})</label>
                          <div className="flex items-center space-x-2">
                            {activeTab === 'hi' && (
                              <button
                                type="button"
                                onClick={() => handleTranslate('title')}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Translate from English"
                              >
                                <Languages className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={startListeningTitle}
                              className={`p-1.5 rounded-lg transition-colors ${isListeningTitle ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            >
                              <Mic className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          required={activeTab === 'en'}
                          value={activeTab === 'en' ? formData.title_en : formData.title_hi}
                          onChange={(e) => setFormData(prev => ({ ...prev, [activeTab === 'en' ? 'title_en' : 'title_hi']: e.target.value }))}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium">Short Summary ({activeTab === 'en' ? 'English' : 'Hindi'})</label>
                          <div className="flex items-center space-x-2">
                            {activeTab === 'hi' && (
                              <button
                                type="button"
                                onClick={() => handleTranslate('short_summary')}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Translate from English"
                              >
                                <Languages className="w-4 h-4" />
                              </button>
                            )}
                             <button
                              type="button"
                              onClick={activeTab === 'en' ? startListeningSummaryEn : startListeningSummaryHi}
                              className={`p-1.5 rounded-lg transition-colors ${(activeTab === 'en' ? isListeningSummaryEn : isListeningSummaryHi) ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            >
                              <Mic className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className={`rounded-lg border [&_.ql-editor]:min-h-[100px] [&_.ql-editor]:max-h-[200px] [&_.ql-editor]:overflow-y-auto ${isDarkMode ? 'border-gray-600' : 'border-gray-300'
                          }`}>
                          <div className={activeTab === 'en' ? 'block' : 'hidden'}>
                            <ReactQuill
                              theme="snow"
                              value={formData.short_summary_en}
                              onChange={(value) => setFormData(prev => ({ ...prev, short_summary_en: value }))}
                              modules={quillModules}
                              formats={quillFormats}
                              placeholder="Write a brief summary in English..."
                              style={{
                                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                color: isDarkMode ? '#ffffff' : '#000000',
                                border: 'none'
                              }}
                            />
                          </div>
                          <div className={activeTab === 'hi' ? 'block' : 'hidden'}>
                            <ReactQuill
                              theme="snow"
                              value={formData.short_summary_hi}
                              onChange={(value) => setFormData(prev => ({ ...prev, short_summary_hi: value }))}
                              modules={quillModules}
                              formats={quillFormats}
                              placeholder="Write a brief summary in Hindi..."
                              style={{
                                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                color: isDarkMode ? '#ffffff' : '#000000',
                                border: 'none'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium">Content ({activeTab === 'en' ? 'English' : 'Hindi'})</label>
                          <div className="flex items-center space-x-2">
                            {activeTab === 'hi' && (
                              <button
                                type="button"
                                onClick={() => handleTranslate('content')}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Translate from English"
                              >
                                <Languages className="w-4 h-4" />
                              </button>
                            )}
                             <button
                              type="button"
                              onClick={activeTab === 'en' ? startListeningContentEn : startListeningContentHi}
                              className={`p-1.5 rounded-lg transition-colors ${(activeTab === 'en' ? isListeningContentEn : isListeningHi) ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                            >
                              <Mic className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className={`rounded-lg border [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:max-h-[350px] [&_.ql-editor]:overflow-y-auto ${isDarkMode ? 'border-gray-600' : 'border-gray-300'
                          }`}>
                          <div className={activeTab === 'en' ? 'block' : 'hidden'}>
                            <ReactQuill
                              theme="snow"
                              value={formData.content_en}
                              onChange={(value) => setFormData(prev => ({ ...prev, content_en: value }))}
                              modules={quillModules}
                              formats={quillFormats}
                              placeholder="Write article content in English..."
                              style={{
                                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                color: isDarkMode ? '#ffffff' : '#000000',
                                border: 'none'
                              }}
                            />
                          </div>
                          <div className={activeTab === 'hi' ? 'block' : 'hidden'}>
                            <ReactQuill
                              theme="snow"
                              value={formData.content_hi}
                              onChange={(value) => setFormData(prev => ({ ...prev, content_hi: value }))}
                              modules={quillModules}
                              formats={quillFormats}
                              placeholder="Write article content in Hindi..."
                              style={{
                                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                color: isDarkMode ? '#ffffff' : '#000000',
                                border: 'none'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 flex items-center">
                          <Hash className="w-4 h-4 mr-1" />
                          Tags (Comma separated)
                        </label>
                        <input
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          placeholder="e.g. economy, rbi, banking"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 flex items-center">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          YouTube Link (Optional)
                        </label>
                        <input
                          type="text"
                          name="youtube_link"
                          value={formData.youtube_link}
                          onChange={handleInputChange}
                          placeholder="e.g. https://www.youtube.com/watch?v=..."
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                        />
                      </div>
                      <div className="space-y-4 md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Categories (Multiple categories allowed)</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {formData.category && formData.category.split(',').map(c => c.trim()).filter(Boolean).map((cat, idx) => (
                            <span key={idx} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1.5 rounded-full flex items-center font-medium border border-blue-200 dark:border-blue-800">
                              {cat}
                              <button 
                                type="button" 
                                onClick={() => removeCategory(cat)} 
                                className="ml-2 hover:text-red-500 transition-colors"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          {!formData.category && <span className="text-xs text-gray-500 italic">No categories selected</span>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-500">Select Existing</label>
                            <select
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                              value=""
                              onChange={(e) => addCategory(e.target.value)}
                            >
                              <option value="">Select Category to Add</option>
                              {categories.map((cat, idx) => (
                                <option key={idx} value={cat.category}>{cat.category}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-500">Add New</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Category name..."
                                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newCategory.trim()) {
                                    addCategory(newCategory.trim());
                                    setNewCategory('');
                                  }
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap text-xs font-bold"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Published At</label>
                        <input
                          type="datetime-local"
                          name="published_at"
                          value={formData.published_at}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Featured Image (Max 5MB)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                        />
                        {currentArticle?.image && !selectedFile && (
                          <div className="mt-2 flex items-center">
                            <span className="text-xs text-gray-500 mr-2">Current:</span>
                            <img
                              src={getImageUrl(currentArticle.image)}
                              className="w-16 h-10 object-cover rounded"
                              alt=""
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`px-6 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (modalType === 'add' ? 'Create Article' : 'Update Article')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-black bg-opacity-60"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-md rounded-xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>

              {deleteConfirmModal.step === 1 ? (
                <>
                  <h3 className="text-lg font-bold text-center mb-2">Delete Article?</h3>
                  <p className={`text-sm text-center mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    You are about to delete:
                  </p>
                  <p className={`text-sm font-semibold text-center mb-5 px-2 truncate ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                    "{deleteConfirmModal.title}"
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={cancelDelete}
                      className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteStep2}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-center mb-2 text-red-600">Final Confirmation</h3>
                  <p className={`text-sm text-center mb-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    This action is <span className="font-bold text-red-600">irreversible</span>. The article and all its data will be permanently removed. Are you absolutely sure?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={cancelDelete}
                      className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteFinal}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-bold transition-colors"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </>
              )}
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
            className={`fixed bottom-5 right-5 z-[10000] px-6 py-3 rounded-lg shadow-2xl text-white font-medium flex items-center space-x-2 ${
              toast.type === 'error' ? 'bg-red-600' : 
              toast.type === 'info' ? 'bg-blue-600' : 'bg-green-600'
            }`}
          >
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>

  );
};

export default AdminCurrentAffairsPage;
