import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  BookOpen, 
  FileText,
  X,
  Save,
  Loader2,
  Search,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ChapterandTopicManagement = ({ isDarkMode, showSuccessToast }) => {
  const { adminUser } = useAuth();
  const [chapters, setChapters] = useState([]);
  
  // Permission check helper
  const checkPermission = (action = 'delete') => {
    if (adminUser?.role === 'test_teacher') {
      showSuccessToast(`Access Denied: Teachers cannot ${action} items.`, 'error');
      return false;
    }
    return true;
  };

  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState({}); // { chapterId: [topics] }
  
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showViewTopicsModal, setShowViewTopicsModal] = useState(false);
  
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  
  const [chapterName, setChapterName] = useState('');
  const [topicName, setTopicName] = useState('');
  const [topicSearchTerm, setTopicSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, step: 1, label: '', onConfirm: null });

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ChapterandTopicManagement/get_chapters.php`);
      const data = await response.json();
      if (data.success) {
        setChapters(data.chapters);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (chapterId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ChapterandTopicManagement/get_topics.php?chapter_id=${chapterId}`);
      const data = await response.json();
      if (data.success) {
        setTopics(prev => ({ ...prev, [chapterId]: data.topics }));
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleAddOrUpdateChapter = async () => {
    if (!chapterName.trim()) return;
    const url = editingChapter 
      ? `${import.meta.env.VITE_BACKEND_URL}/api/ChapterandTopicManagement/update_chapter.php` 
      : `${import.meta.env.VITE_BACKEND_URL}/api/ChapterandTopicManagement/add_chapter.php`;
    
    const body = editingChapter 
      ? { id: editingChapter.id, name: chapterName }
      : { name: chapterName };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (data.success) {
        showSuccessToast(editingChapter ? 'Chapter updated!' : 'Chapter added!');
        fetchChapters();
        setShowChapterModal(false);
        setChapterName('');
        setEditingChapter(null);
      }
    } catch (error) {
      console.error('Error saving chapter:', error);
    }
  };

  const handleDeleteChapter = (id, name) => {
    if (!checkPermission('delete chapter')) return;
    setDeleteConfirm({
      open: true,
      step: 1,
      label: `chapter "${name}" and all its topics`,
      onConfirm: async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ChapterandTopicManagement/delete_chapter.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
          const data = await response.json();
          if (data.success) {
            showSuccessToast('Chapter deleted!');
            fetchChapters();
          }
        } catch (error) {
          console.error('Error deleting chapter:', error);
        }
      }
    });
  };

  const handleAddOrUpdateTopic = async () => {
    if (!topicName.trim()) return;
    const url = editingTopic 
      ? `${import.meta.env.VITE_BACKEND_URL}/api/ChapterandTopicManagement/update_topic.php` 
      : `${import.meta.env.VITE_BACKEND_URL}/api/ChapterandTopicManagement/add_topic.php`;
    
    const body = editingTopic 
      ? { id: editingTopic.id, name: topicName }
      : { chapter_id: selectedChapter.id, name: topicName };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (data.success) {
        showSuccessToast(editingTopic ? 'Topic updated!' : 'Topic added!');
        fetchTopics(selectedChapter.id);
        setShowTopicModal(false);
        setTopicName('');
        setEditingTopic(null);
      }
    } catch (error) {
      console.error('Error saving topic:', error);
    }
  };

  const handleDeleteTopic = (topicId, chapterId, tName) => {
    if (!checkPermission('delete topic')) return;
    setDeleteConfirm({
      open: true,
      step: 1,
      label: `topic "${tName}"`,
      onConfirm: async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ChapterandTopicManagement/delete_topic.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: topicId })
          });
          const data = await response.json();
          if (data.success) {
            showSuccessToast('Topic deleted!');
            fetchTopics(chapterId);
          }
        } catch (error) {
          console.error('Error deleting topic:', error);
        }
      }
    });
  };

  const filteredTopics = useMemo(() => {
    if (!selectedChapter || !topics[selectedChapter.id]) return [];
    return topics[selectedChapter.id].filter(topic => 
      topic.name.toLowerCase().includes(topicSearchTerm.toLowerCase())
    );
  }, [selectedChapter, topics, topicSearchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl shadow-sm border mt-8 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Strong & Weak Topics (Analysis Page)
            </h2>
            <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage chapters and their topics independently.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingChapter(null);
              setChapterName('');
              setShowChapterModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Chapter
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-700">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No chapters added yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {chapters.map(chapter => (
              <div 
                key={chapter.id} 
                className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                  isDarkMode ? 'border-gray-700 bg-gray-700/50 hover:bg-gray-700' : 'border-gray-200 bg-gray-50 hover:bg-white'
                }`}
              >
                <div className="flex flex-col h-full justify-between">
                  <div className="mb-4">
                    <h3 className={`font-semibold text-lg truncate mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {chapter.name}
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Created: {new Date(chapter.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-auto">
                    <button
                      onClick={() => {
                        setSelectedChapter(chapter);
                        setTopicSearchTerm('');
                        fetchTopics(chapter.id);
                        setShowViewTopicsModal(true);
                      }}
                      className="p-2 text-purple-500 hover:bg-purple-500/10 rounded-lg flex items-center gap-1 text-sm font-medium"
                      title="View Topics"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedChapter(chapter);
                        setEditingTopic(null);
                        setTopicName('');
                        setShowTopicModal(true);
                      }}
                      className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg flex items-center gap-1 text-sm font-medium"
                      title="Add Topic"
                    >
                      <Plus className="w-4 h-4" />
                      Add Topic
                    </button>
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => {
                          setEditingChapter(chapter);
                          setChapterName(chapter.name);
                          setShowChapterModal(true);
                        }}
                        className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg"
                        title="Edit Chapter"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id, chapter.name)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                        title="Delete Chapter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chapter Modal */}
      <AnimatePresence>
        {showChapterModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
                </h3>
                <button 
                  onClick={() => setShowChapterModal(false)} 
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Chapter Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter chapter name"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowChapterModal(false)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                    isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrUpdateChapter}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  <Save className="w-4 h-4" />
                  {editingChapter ? 'Update' : 'Save'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Topic Modal */}
      <AnimatePresence>
        {showTopicModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {editingTopic ? 'Edit Topic' : 'Add New Topic'}
                  </h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Chapter: <span className="font-semibold text-purple-500">{selectedChapter?.name}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setShowTopicModal(false)} 
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Topic Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter topic name"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowTopicModal(false)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                    isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrUpdateTopic}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Save className="w-4 h-4" />
                  {editingTopic ? 'Update' : 'Save'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Topics Modal */}
      <AnimatePresence>
        {showViewTopicsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Topics List
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Chapter: <span className="text-purple-500 font-semibold">{selectedChapter?.name}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setShowViewTopicsModal(false)} 
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-gray-50/50 dark:bg-gray-700/20 flex gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={topicSearchTerm}
                    onChange={(e) => setTopicSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-xl outline-none transition-all ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingTopic(null);
                    setTopicName('');
                    setShowTopicModal(true);
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Topic
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                {!topics[selectedChapter?.id] ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading topics...</p>
                  </div>
                ) : filteredTopics.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed rounded-2xl border-gray-200 dark:border-gray-700">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {topicSearchTerm ? 'No topics matching your search.' : 'No topics added to this chapter yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredTopics.map((topic, index) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={topic.id}
                        className={`flex items-center justify-between p-4 rounded-xl border ${
                          isDarkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-100 bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center text-xs font-bold`}>
                            {index + 1}
                          </span>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{topic.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingTopic(topic);
                              setTopicName(topic.name);
                              setShowTopicModal(true);
                            }}
                            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(topic.id, selectedChapter.id, topic.name)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>

              {deleteConfirm.step === 1 ? (
                <>
                  <h3 className="text-lg font-bold text-center mb-2">Delete?</h3>
                  <p className={`text-sm text-center mb-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Are you sure you want to delete the {deleteConfirm.label}?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setDeleteConfirm({ open: false, step: 1, label: '', onConfirm: null })}
                      className={`flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(prev => ({ ...prev, step: 2 }))}
                      className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-center mb-2 text-red-600">Final Confirmation</h3>
                  <p className={`text-sm text-center mb-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    This action is <span className="font-bold text-red-600">irreversible</span>. Proceed with permanent deletion?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setDeleteConfirm({ open: false, step: 1, label: '', onConfirm: null })}
                      className={`flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const fn = deleteConfirm.onConfirm;
                        setDeleteConfirm({ open: false, step: 1, label: '', onConfirm: null });
                        if (fn) fn();
                      }}
                      className="flex-1 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-bold transition-colors"
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
    </motion.div>
  );
};

export default ChapterandTopicManagement;
