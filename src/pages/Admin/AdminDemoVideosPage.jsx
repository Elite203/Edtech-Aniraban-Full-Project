import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Search,
  Trash2,
  RefreshCw,
  Calendar,
  Plus,
  Upload,
  Link as LinkIcon,
  ExternalLink,
  Edit
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';

const AdminDemoVideosPage = () => {
  const { isDarkMode } = useTheme();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Local search functionality
  const filteredVideos = videos.filter(video => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      video.name?.toLowerCase().includes(searchTerm) ||
      video.video_link?.toLowerCase().includes(searchTerm) ||
      video.id?.toString().includes(searchTerm)
    );
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    console.log('🚀 Starting fetchVideos...');
    setLoading(true);
    setError('');
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    console.log('🔗 Backend URL:', backendUrl);
    
    if (!backendUrl) {
      console.error('❌ Backend URL not configured');
      setError('Backend URL not configured.');
      setLoading(false);
      return;
    }
    
    try {
      const url = `${backendUrl}/api/Content/get_demo_videos.php`;
      console.log('📡 Making request to:', url);
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('📦 Raw response:', response);
      console.log('📄 Response data:', response.data);
      console.log('✅ Response status:', response.status);
      console.log('🏷️ Response headers:', response.headers);
      
      if (response.data && response.data.success === true) {
        console.log('🎯 Videos data:', response.data.data?.videos);
        console.log('📊 Total videos count:', response.data.data?.total);
        setVideos(response.data.data?.videos || []);
        console.log('✅ Videos state updated successfully');
      } else {
        const errorMessage = response.data?.message || 'Failed to fetch videos';
        console.error('❌ API returned error:', errorMessage);
        console.error('❌ Full response data:', response.data);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('🚨 Fetch videos error:', error);
      let errorMessage = 'Failed to fetch videos';
      
      if (error.response) {
        console.error('🔴 Server Error Details:');
        console.error('  - Status:', error.response.status);
        console.error('  - Status Text:', error.response.statusText);
        console.error('  - Data:', error.response.data);
        console.error('  - Headers:', error.response.headers);
        errorMessage = `Server Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`;
      } else if (error.request) {
        console.error('🔴 Network Error Details:');
        console.error('  - Request:', error.request);
        console.error('  - Error Code:', error.code);
        console.error('  - Error Message:', error.message);
        errorMessage = 'Network Error: Unable to reach server. Check your internet connection.';
      } else {
        console.error('🔴 Request Error Details:');
        console.error('  - Message:', error.message);
        console.error('  - Stack:', error.stack);
        errorMessage = `Request Error: ${error.message}`;
      }
      
      console.error('❌ Final error message:', errorMessage);
      setError(errorMessage);
    } finally {
      console.log('🏁 Fetch videos completed, setting loading to false');
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDeleteVideo = (video) => {
    setVideoToDelete(video);
    setShowDeleteModal(true);
  };

  const handleEditVideo = (video) => {
    console.log('✏️ Starting edit video:', video);
    setVideoToEdit(video);
    setShowEditModal(true);
  };

  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    
    console.log('🗑️ Starting delete video:', videoToDelete);
    setDeleting(true);
    
    try {
      const deleteUrl = `${import.meta.env.VITE_BACKEND_URL}/api/Content/delete_demo_video.php`;
      console.log('📡 Delete request to:', deleteUrl);
      console.log('📦 Delete payload:', { video_id: videoToDelete.id });
      
      const response = await axios.post(deleteUrl, {
        video_id: videoToDelete.id
      });

      console.log('📄 Delete response:', response.data);
      
      if (response.data.success) {
        console.log('✅ Video deleted successfully');
        setShowDeleteModal(false);
        setVideoToDelete(null);
        fetchVideos();
        showToast('Video deleted successfully!', 'success');
      } else {
        console.error('❌ Delete failed:', response.data.message);
        showToast('Failed to delete video: ' + response.data.message, 'error');
      }
    } catch (error) {
      console.error('🚨 Delete video error:', error);
      showToast('Error deleting video', 'error');
    } finally {
      console.log('🏁 Delete operation completed');
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setVideoToDelete(null);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getThumbnailSrc = (videoId, thumbnail) => {
    console.log('🖼️ Getting thumbnail src for video:', videoId, 'thumbnail data:', thumbnail);
    
    if (!thumbnail) {
      console.log('❌ No thumbnail data available');
      return null;
    }
    
    // Always use the dedicated thumbnail API when thumbnail exists
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const thumbnailUrl = `${backendUrl}/api/Content/get_demo_thumbnail.php?id=${videoId}`;
    console.log('🔗 Generated thumbnail URL:', thumbnailUrl);
    return thumbnailUrl;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const CreateVideoModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      video_link: '',
      thumbnail: null
    });
    const [creating, setCreating] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log('📝 Starting create video with form data:', formData);
      setCreating(true);

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('video_link', formData.video_link);
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
        console.log('🖼️ Thumbnail file:', formData.thumbnail);
      }

      try {
        const createUrl = `${import.meta.env.VITE_BACKEND_URL}/api/Content/create_demo_video.php`;
        console.log('📡 Create request to:', createUrl);
        
        const response = await axios.post(createUrl, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('📄 Create response:', response.data);
        
        if (response.data.success) {
          console.log('✅ Video created successfully');
          setShowCreateModal(false);
          setFormData({ name: '', video_link: '', thumbnail: null });
          fetchVideos();
          showToast('Video added successfully!', 'success');
        } else {
          console.error('❌ Create failed:', response.data.message);
          showToast('Failed to create video: ' + response.data.message, 'error');
        }
      } catch (error) {
        console.error('🚨 Create video error:', error);
        showToast('Error creating video', 'error');
      } finally {
        console.log('🏁 Create operation completed');
        setCreating(false);
      }
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFormData(prev => ({ ...prev, thumbnail: file }));
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-lg p-4 sm:p-6 w-full max-w-md ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Add New Demo Video</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Video Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter video name"
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Video Link</label>
              <input
                type="url"
                value={formData.video_link}
                onChange={(e) => setFormData(prev => ({ ...prev, video_link: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="https://example.com/video-link"
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Thumbnail (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              {formData.thumbnail && (
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Selected: {formData.thumbnail.name}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className={`flex-1 px-4 py-2 text-sm border rounded-lg transition-colors ${
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
                className="flex-1 px-4 py-2 text-sm bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {creating ? (
                  <>
                    <RefreshCw className="animate-spin w-4 h-4 mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Video'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  const DeleteConfirmationModal = () => {
    if (!showDeleteModal || !videoToDelete) return null;

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
              Delete Video
            </h3>
            <p className={`text-sm mb-4 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-500'
            }`}>
              Are you sure you want to delete <span className="font-medium text-red-600">{videoToDelete.name}</span>? 
              This action cannot be undone.
            </p>
            <div className={`bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4 text-left`}>
              <div className="flex text-sm">
                <div className="ml-3">
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                    Video Details:
                  </p>
                  <div className={`mt-1 text-xs ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
                    <p>ID: {videoToDelete.id}</p>
                    <p>Name: {videoToDelete.name}</p>
                    <p>Link: {videoToDelete.video_link}</p>
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
              onClick={confirmDeleteVideo}
              disabled={deleting}
              className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {deleting ? (
                <>
                  <RefreshCw className="animate-spin w-4 h-4 mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Video'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const Toast = () => {
    if (!toast) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}
      >
        {toast.message}
      </motion.div>
    );
  };

  const EditVideoModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      video_link: '',
      thumbnail: null
    });
    const [editing, setEditing] = useState(false);

    // Initialize form data when modal opens
    useEffect(() => {
      if (showEditModal && videoToEdit) {
        console.log('🔄 Initializing edit form with video data:', videoToEdit);
        setFormData({
          name: videoToEdit.name || '',
          video_link: videoToEdit.video_link || '',
          thumbnail: null // Don't pre-fill file input
        });
      }
    }, [showEditModal, videoToEdit]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log('📝 Starting update video with form data:', formData);
      console.log('📝 Video to edit:', videoToEdit);
      setEditing(true);

      const formDataToSend = new FormData();
      formDataToSend.append('video_id', videoToEdit.id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('video_link', formData.video_link);
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
        console.log('🖼️ New thumbnail file:', formData.thumbnail);
      }

      try {
        const updateUrl = `${import.meta.env.VITE_BACKEND_URL}/api/Content/update_demo.php`;
        console.log('📡 Update request to:', updateUrl);
        
        const response = await axios.post(updateUrl, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('📄 Update response:', response.data);
        
        if (response.data.success) {
          console.log('✅ Video updated successfully');
          setShowEditModal(false);
          setVideoToEdit(null);
          setFormData({ name: '', video_link: '', thumbnail: null });
          fetchVideos();
          showToast('Video updated successfully!', 'success');
        } else {
          console.error('❌ Update failed:', response.data.message);
          showToast('Failed to update video: ' + response.data.message, 'error');
        }
      } catch (error) {
        console.error('🚨 Update video error:', error);
        let errorMessage = 'Error updating video';
        if (error.response?.data?.message) {
          errorMessage = 'Failed to update video: ' + error.response.data.message;
        }
        showToast(errorMessage, 'error');
      } finally {
        console.log('🏁 Update operation completed');
        setEditing(false);
      }
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('📁 Selected new thumbnail file:', file.name);
        setFormData(prev => ({ ...prev, thumbnail: file }));
      }
    };

    const handleCancel = () => {
      console.log('❌ Edit cancelled');
      setShowEditModal(false);
      setVideoToEdit(null);
      setFormData({ name: '', video_link: '', thumbnail: null });
    };

    if (!showEditModal || !videoToEdit) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-lg p-4 sm:p-6 w-full max-w-md ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Edit Demo Video</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Video Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter video name"
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Video Link</label>
              <input
                type="url"
                value={formData.video_link}
                onChange={(e) => setFormData(prev => ({ ...prev, video_link: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="https://example.com/video-link"
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Update Thumbnail (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              {formData.thumbnail && (
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  New thumbnail: {formData.thumbnail.name}
                </p>
              )}
              {videoToEdit.thumbnail && !formData.thumbnail && (
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Current thumbnail will be kept if no new file is selected
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className={`flex-1 px-4 py-2 text-sm border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editing}
                className="flex-1 px-4 py-2 text-sm bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {editing ? (
                  <>
                    <RefreshCw className="animate-spin w-4 h-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Video'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Toast */}
        <Toast />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>Demo Videos Management</h1>
            <p className={`mt-1 text-sm sm:text-base ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage demo videos and their content
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-80">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search videos by name or link..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors flex items-center justify-center whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </button>
          </div>
        </div>

        {/* Videos Table */}
        <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className={`w-8 h-8 animate-spin mx-auto mb-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading videos...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className={`text-red-500 mb-4`}>
                <Video className="w-12 h-12 mx-auto mb-4" />
                <p className="font-medium">Error loading videos</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
              <button
                onClick={fetchVideos}
                className="px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="p-8 text-center">
              <Video className={`w-12 h-12 mx-auto mb-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No demo videos found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Video
                      </th>
                      <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Link
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
                    {filteredVideos.map((video) => (
                      <motion.tr
                        key={video.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getThumbnailSrc(video.id, video.thumbnail) ? (
                              <img 
                                src={getThumbnailSrc(video.id, video.thumbnail)} 
                                alt={video.name}
                                className="w-12 h-8 sm:w-16 sm:h-10 rounded object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-12 h-8 sm:w-16 sm:h-10 bg-[#3936C9] rounded flex items-center justify-center"
                              style={{ display: getThumbnailSrc(video.id, video.thumbnail) ? 'none' : 'flex' }}
                            >
                              <Video className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="ml-2 sm:ml-4">
                              <div className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} select-text`}>
                                {video.name}
                              </div>
                              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} select-text`}>
                                ID: {video.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="flex items-center">
                            <LinkIcon className="w-3 h-3 mr-1 sm:mr-2 flex-shrink-0 text-gray-400" />
                            <a 
                              href={video.video_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`text-xs sm:text-sm text-blue-600 hover:text-blue-800 truncate max-w-40 sm:max-w-60`}
                              title={video.video_link}
                            >
                              {video.video_link}
                            </a>
                            <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0 text-gray-400" />
                          </div>
                        </td>
                        <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex items-center select-text">
                            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="hidden sm:inline">{formatDate(video.created_at)}</span>
                            <span className="sm:hidden">{new Date(video.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleEditVideo(video)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1 sm:p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Edit Video"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1 sm:p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Delete Video"
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
          )}
        </div>

        {/* Create Video Modal */}
        <CreateVideoModal />
        
        {/* Edit Video Modal */}
        <EditVideoModal />
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal />
      </div>
    </AdminLayout>
  );
};

export default AdminDemoVideosPage;