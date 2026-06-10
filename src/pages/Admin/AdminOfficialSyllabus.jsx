import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit3, Trash2, X, Save, Loader2, Image as ImageIcon, RefreshCw, Eye
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

// Register a custom blot for tables to prevent stripping
const Quill = ReactQuill.Quill;
const BlockEmbed = Quill.import('blots/block/embed');

class TableBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    if (typeof value === 'string') {
      node.innerHTML = value;
    }
    return node;
  }
  static value(node) {
    return node.innerHTML;
  }
}
TableBlot.blotName = 'table';
TableBlot.tagName = 'table';
Quill.register(TableBlot);

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
  clipboard: {
    matchVisual: false,
  }
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike', 'color', 'background',
  'list', 'bullet', 'align', 'link', 'image', 'blockquote', 'table'
];

const AdminOfficialSyllabus = () => {
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: '', name: '', logo: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState({
    id: '', title: '', subtitle: '',
    btn1_text: '', btn1_color: '',
    btn2_text: '', btn2_color: '',
    btn3_text: '', btn3_color: '',
    btn4_text: '', btn4_color: '',
    btn5_text: '', btn5_color: '',
    yt_link1: '', yt_link2: '', yt_link3: '', yt_link4: '',
    content_overview: '', quick_actions: ''
  });
  const [isSavingView, setIsSavingView] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, step: 1, label: '', onConfirm: null });

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/OfficialSyllabus/get_syllabus.php`);
      if (response.data.success) {
        setItems(response.data.data);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to fetch syllabus items",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentItem({ id: '', name: '', logo: '' });
    setSelectedFile(null);
    setPreviewUrl('');
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setIsEditing(true);
    setCurrentItem({ id: item.id, name: item.name, logo: item.logo });
    setSelectedFile(null);
    setPreviewUrl(item.logo);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentItem.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    if (!isEditing && !selectedFile) {
      toast({ title: "Error", description: "Logo is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: currentItem.id,
        name: currentItem.name,
        logo: selectedFile ? previewUrl : null
      };

      const url = isEditing
        ? `${import.meta.env.VITE_BACKEND_URL}/api/OfficialSyllabus/update_syllabus.php`
        : `${import.meta.env.VITE_BACKEND_URL}/api/OfficialSyllabus/add_syllabus.php`;

      const response = await axios.post(url, payload);

      if (response.data.success) {
        toast({
          title: "Success",
          description: isEditing ? "Updated successfully" : "Added successfully",
        });
        setShowModal(false);
        fetchSyllabus();
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Operation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Request failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenViewModal = (item) => {
    setViewData({
      id: item.id,
      title: item.title_text || '',
      subtitle: item.subtitle_text || '',
      btn1_text: item.btn1_text || '', btn1_color: item.btn1_color || '#3936C9', btn1_link: item.btn1_link || '',
      btn2_text: item.btn2_text || '', btn2_color: item.btn2_color || '#3936C9', btn2_link: item.btn2_link || '',
      btn3_text: item.btn3_text || '', btn3_color: item.btn3_color || '#3936C9', btn3_link: item.btn3_link || '',
      btn4_text: item.btn4_text || '', btn4_color: item.btn4_color || '#3936C9', btn4_link: item.btn4_link || '',
      btn5_text: item.btn5_text || '', btn5_color: item.btn5_color || '#3936C9', btn5_link: item.btn5_link || '',
      btn6_text: item.btn6_text || '', btn6_color: item.btn6_color || '#3936C9', btn6_link: item.btn6_link || '',
      btn7_text: item.btn7_text || '', btn7_color: item.btn7_color || '#3936C9', btn7_link: item.btn7_link || '',
      btn8_text: item.btn8_text || '', btn8_color: item.btn8_color || '#3936C9', btn8_link: item.btn8_link || '',
      btn9_text: item.btn9_text || '', btn9_color: item.btn9_color || '#3936C9', btn9_link: item.btn9_link || '',
      btn10_text: item.btn10_text || '', btn10_color: item.btn10_color || '#3936C9', btn10_link: item.btn10_link || '',
      yt_link1: item.yt_link1 || '',
      yt_link2: item.yt_link2 || '',
      yt_link3: item.yt_link3 || '',
      yt_link4: item.yt_link4 || '',
      content_overview: item.content_overview || '',
      quick_actions: item.quick_actions || '',
    });
    setShowViewModal(true);
  };

  const handleSaveViewData = async () => {
    if (!viewData.id) return;
    
    setIsSavingView(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/OfficialSyllabus/save_card_data.php`, {
        syllabus_id: viewData.id,
        title_text: viewData.title,
        subtitle_text: viewData.subtitle,
        btn1_text: viewData.btn1_text, btn1_color: viewData.btn1_color, btn1_link: viewData.btn1_link,
        btn2_text: viewData.btn2_text, btn2_color: viewData.btn2_color, btn2_link: viewData.btn2_link,
        btn3_text: viewData.btn3_text, btn3_color: viewData.btn3_color, btn3_link: viewData.btn3_link,
        btn4_text: viewData.btn4_text, btn4_color: viewData.btn4_color, btn4_link: viewData.btn4_link,
        btn5_text: viewData.btn5_text, btn5_color: viewData.btn5_color, btn5_link: viewData.btn5_link,
        btn6_text: viewData.btn6_text, btn6_color: viewData.btn6_color, btn6_link: viewData.btn6_link,
        btn7_text: viewData.btn7_text, btn7_color: viewData.btn7_color, btn7_link: viewData.btn7_link,
        btn8_text: viewData.btn8_text, btn8_color: viewData.btn8_color, btn8_link: viewData.btn8_link,
        btn9_text: viewData.btn9_text, btn9_color: viewData.btn9_color, btn9_link: viewData.btn9_link,
        btn10_text: viewData.btn10_text, btn10_color: viewData.btn10_color, btn10_link: viewData.btn10_link,
        yt_link1: viewData.yt_link1,
        yt_link2: viewData.yt_link2,
        yt_link3: viewData.yt_link3,
        yt_link4: viewData.yt_link4,
        content_overview: viewData.content_overview,
        quick_actions: viewData.quick_actions,
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Details saved successfully",
        });
        fetchSyllabus();
        setShowViewModal(false);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to save details",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      });
    } finally {
      setIsSavingView(false);
    }
  };

  const handleDelete = (id, name) => {
    setDeleteConfirm({
      open: true,
      step: 1,
      label: `syllabus item "${name}"`,
      onConfirm: async () => {
        try {
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/OfficialSyllabus/delete_syllabus.php`, { id });
          if (response.data.success) {
            toast({ title: "Success", description: "Deleted successfully" });
            fetchSyllabus();
          } else {
            toast({ title: "Error", description: "Delete failed", variant: "destructive" });
          }
        } catch (error) {
          toast({ title: "Error", description: "Request failed", variant: "destructive" });
        }
      }
    });
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Official Syllabus Management</h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Add, edit or remove syllabus cards for the home page</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#3936C9] hover:bg-[#2d2a9e] text-white rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Add New Exam</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border flex flex-col md:flex-row gap-4 items-center`}>
          <div className="relative flex-1 w-full">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search by exam name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
          <button
            onClick={fetchSyllabus}
            className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors`}
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Table */}
        <div className={`rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`${isDarkMode ? 'bg-gray-900/50 text-gray-300' : 'bg-gray-50 text-gray-600'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="px-6 py-4 font-semibold">Logo</th>
                  <th className="px-6 py-4 font-semibold">Exam Name</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading items...</p>
                    </td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className={`${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'} overflow-hidden`}>
                          {item.logo ? (
                            <img src={item.logo} alt={item.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.name}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenViewModal(item)}
                            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600 text-emerald-400' : 'hover:bg-emerald-50 text-emerald-600'} transition-colors`}
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'} transition-colors`}
                            title="Edit"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-red-50 text-red-600'} transition-colors`}
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No items found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isSubmitting && setShowModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`relative w-full max-w-lg rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800'} overflow-hidden max-h-[90vh] flex flex-col`}
            >
              <div className="flex-none flex items-center justify-between p-6 border-b dark:border-gray-700">
                <h2 className="text-xl font-bold">{isEditing ? 'Edit Exam' : 'Add New Exam'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Exam Name</label>
                  <input
                    type="text"
                    required
                    value={currentItem.name}
                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                    placeholder="e.g. SSC CGL"
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Logo / Icon</label>
                  <div className="flex items-center space-x-4">
                    <div className={`w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className={`inline-flex items-center px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                      >
                        {previewUrl ? 'Change Image' : 'Select Image'}
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">Recommended: WebP/PNG with transparent background</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-600'} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg font-medium bg-[#3936C9] hover:bg-[#2d2a9e] text-white transition-all duration-200 shadow-md flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{isEditing ? 'Update Exam' : 'Add Exam'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* View Details Modal */}
      <AnimatePresence>
        {showViewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowViewModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`relative w-full max-w-lg rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800'} overflow-hidden max-h-[90vh] flex flex-col`}
            >
              <div className="flex-none flex items-center justify-between p-6 border-b dark:border-gray-700">
                <h2 className="text-xl font-bold">Exam Details</h2>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title Text</label>
                  <input
                    type="text"
                    value={viewData.title}
                    onChange={(e) => setViewData({ ...viewData, title: e.target.value })}
                    placeholder="Enter title text..."
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sub Title Text</label>
                  <input
                    type="text"
                    value={viewData.subtitle}
                    onChange={(e) => setViewData({ ...viewData, subtitle: e.target.value })}
                    placeholder="Enter subtitle text..."
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dynamic Buttons</h3>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <div key={num} className="space-y-2 p-3 rounded-lg border border-dashed dark:border-gray-700">
                      <div className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-8">
                          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Button {num} Text</label>
                          <input
                            type="text"
                            value={viewData[`btn${num}_text`]}
                            onChange={(e) => setViewData({ ...viewData, [`btn${num}_text`]: e.target.value })}
                            placeholder={`Button ${num} label`}
                            className={`w-full px-3 py-2 text-sm rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          />
                        </div>
                        <div className="col-span-4">
                          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={viewData[`btn${num}_color`]}
                              onChange={(e) => setViewData({ ...viewData, [`btn${num}_color`]: e.target.value })}
                              className={`h-9 w-full rounded border p-1 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Button {num} Link (Optional)</label>
                        <input
                          type="text"
                          value={viewData[`btn${num}_link`]}
                          onChange={(e) => setViewData({ ...viewData, [`btn${num}_link`]: e.target.value })}
                          placeholder="https://example.com"
                          className={`w-full px-3 py-2 text-sm rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>YouTube Videos (Optional)</h3>
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num}>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Video {num} Link</label>
                      <input
                        type="text"
                        value={viewData[`yt_link${num}`]}
                        onChange={(e) => setViewData({ ...viewData, [`yt_link${num}`]: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className={`w-full px-3 py-2 text-sm rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Content Overview</h3>
                  <div className={`rounded-lg border [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:max-h-[400px] [&_.ql-editor]:overflow-y-auto ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <ReactQuill
                      theme="snow"
                      value={viewData.content_overview}
                      onChange={(value) => setViewData(prev => ({ ...prev, content_overview: value }))}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Write content overview..."
                      style={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#000000',
                        border: 'none'
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quick Actions</h3>
                  <div className={`rounded-lg border [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:max-h-[300px] [&_.ql-editor]:overflow-y-auto ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <ReactQuill
                      theme="snow"
                      value={viewData.quick_actions}
                      onChange={(value) => setViewData(prev => ({ ...prev, quick_actions: value }))}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Write quick actions content..."
                      style={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#000000',
                        border: 'none'
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    disabled={isSavingView}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-600'} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveViewData}
                    disabled={isSavingView}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium bg-[#3936C9] hover:bg-[#2d2a9e] text-white transition-all duration-200 shadow-md flex items-center justify-center space-x-2`}
                  >
                    {isSavingView ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Details</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.open && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteConfirm({ open: false, step: 1, label: '', onConfirm: null })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>

              {deleteConfirm.step === 1 ? (
                <>
                  <h3 className="text-lg font-bold text-center mb-2">Delete?</h3>
                  <p className={`text-sm text-center mb-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Are you sure you want to delete the {deleteConfirm.label}?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ open: false, step: 1, label: '', onConfirm: null })}
                      className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(prev => ({ ...prev, step: 2 }))}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-center mb-2 text-red-600 dark:text-red-400">Final Confirmation</h3>
                  <p className={`text-sm text-center mb-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    This action is <span className="font-bold text-red-600 dark:text-red-400">irreversible</span>. Proceed with permanent deletion?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ open: false, step: 1, label: '', onConfirm: null })}
                      className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const fn = deleteConfirm.onConfirm;
                        setDeleteConfirm({ open: false, step: 1, label: '', onConfirm: null });
                        if (fn) fn();
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-bold transition-colors"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminOfficialSyllabus;
