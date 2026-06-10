import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  HelpCircle,
  Clock,
  Loader2,
  FileText,
  MinusSquare,
  List
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import TestSeriesInstructionsOne from '../Exam/TestSeriesInstructionsOne';

import TestSeriesInstructionsTwo from '../Exam/TestSeriesInstructionsTwo';
import SSCTestSeriesInstructionsThree from '../../components/NewUI/SSCTestSeriesInstructionsThree';
import SSCTestSeriesInstructionsFour from '../../components/NewUI/SSCTestSeriesInstructionsFour';
import SetQuestions from '../Exam/SetQuestions';
import ChapterandTopicManagement from '../../Admin Test Series Components/ChapterandTopicManagement';
import CategoryPopup from '../../Admin Test Series Components/CategoryPopup';
import { Users } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

// Register Quill to allow 'style' attributes
const Quill = ReactQuill.Quill;
const Parchment = Quill.import('parchment');
const StyleAttributor = new Parchment.Attributor.Attribute('style', 'style', {
  scope: Parchment.Scope.INLINE,
  whitelist: null
});
Quill.register(StyleAttributor, true);

// Also allow specific classes for icons
const ClassAttributor = new Parchment.Attributor.Attribute('class', 'class', {
  scope: Parchment.Scope.INLINE,
  whitelist: ['exam-icon-v', 'exam-icon-na', 'exam-icon-m', 'exam-icon-ans', 'exam-icon-amr']
});
Quill.register(ClassAttributor, true);

// ReactQuill configuration
const quillModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'blockquote', 'code-block', 'html'],
      ['palette-nv', 'palette-na', 'palette-ans', 'palette-mr', 'palette-amr'],
      ['clean']
    ],
    handlers: {
      'html': function () {
        const html = prompt('Paste your HTML icon code here:');
        if (html) {
          const range = this.quill.getSelection();
          if (range) {
            this.quill.clipboard.dangerouslyPasteHTML(range.index, html);
          } else {
            this.quill.clipboard.dangerouslyPasteHTML(0, html);
          }
        }
      },
      'palette-nv': function () { insertPaletteItem(this.quill, 'nv'); },
      'palette-na': function () { insertPaletteItem(this.quill, 'na'); },
      'palette-ans': function () { insertPaletteItem(this.quill, 'ans'); },
      'palette-mr': function () { insertPaletteItem(this.quill, 'mr'); },
      'palette-amr': function () { insertPaletteItem(this.quill, 'amr'); }
    }
  }
};

const insertPaletteItem = (quill, type) => {
  const canvas = document.createElement('canvas');
  canvas.width = 28;
  canvas.height = 28;
  const ctx = canvas.getContext('2d');
  let text = '';
  let className = '';

  if (type === 'nv') {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, 28, 28);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, 27, 27);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('1', 14, 14);

    text = 'You have not visited the question yet.';
    className = 'exam-icon-v';
  } else if (type === 'na') {
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(24, 4);
    ctx.lineTo(24, 16);
    ctx.lineTo(14, 24);
    ctx.lineTo(4, 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2', 14, 13);

    text = 'You have not answered the question.';
    className = 'exam-icon-na';
  } else if (type === 'ans') {
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(14, 4);
    ctx.lineTo(24, 12);
    ctx.lineTo(24, 24);
    ctx.lineTo(4, 24);
    ctx.lineTo(4, 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('3', 14, 15);

    text = 'You have answered the question.';
    className = 'exam-icon-ans';
  } else if (type === 'mr') {
    ctx.fillStyle = '#7b1fa2';
    ctx.beginPath();
    ctx.arc(14, 14, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('4', 14, 14);

    text = 'You have NOT answered the question, but have marked the question for review.';
    className = 'exam-icon-m';
  } else if (type === 'amr') {
    ctx.fillStyle = '#7b1fa2';
    ctx.beginPath();
    ctx.arc(14, 14, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(22, 22, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(22, 22, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('5', 13, 13);

    text = 'You have answered the question, but marked it for review.';
    className = 'exam-icon-amr';
  }

  const base64 = canvas.toDataURL();
  const range = quill.getSelection();
  const index = range ? range.index : 0;

  const iconHtml = `<img src="${base64}" class="${className}" width="28" height="28" style="display: inline-block; vertical-align: middle; margin: 0 4px;" /> ${text}`;
  quill.clipboard.dangerouslyPasteHTML(index, iconHtml);

  setTimeout(() => {
    quill.focus();
  }, 0);
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'align', 'link', 'blockquote', 'code-block'
];

const AdminTestSeriesPage = () => {
  const { isDarkMode } = useTheme();
  const { adminUser } = useAuth();
  const [testSeries, setTestSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Permission check helper
  const checkPermission = (action = 'delete') => {
    if (adminUser?.role === 'test_teacher') {
      showSuccessToast(`Access Denied: Teachers cannot ${action} items.`, 'error');
      return false;
    }
    return true;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showCategoryDeleteConfirm, setShowCategoryDeleteConfirm] = useState(false);
  const [selectedTestSeries, setSelectedTestSeries] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '' });
  const [showExamSets, setShowExamSets] = useState({});
  const [examSets, setExamSets] = useState({});
  const [showAddExamForm, setShowAddExamForm] = useState(false);
  const [showEditExamForm, setShowEditExamForm] = useState(false);
  const [showDeleteExamConfirm, setShowDeleteExamConfirm] = useState(false);
  const [showAddSetForm, setShowAddSetForm] = useState(false);
  const [showDeleteSetConfirm, setShowDeleteSetConfirm] = useState(false);
  const [showEditSetForm, setShowEditSetForm] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [showNegativeMarkingModal, setShowNegativeMarkingModal] = useState(false);
  const [selectedSetForNegativeMarking, setSelectedSetForNegativeMarking] = useState(null);
  const [negativeMarkingValue, setNegativeMarkingValue] = useState('');
  const [positiveMarkingValue, setPositiveMarkingValue] = useState('');
  const [isSavingNegativeMarking, setIsSavingNegativeMarking] = useState(false);
  const [isFetchingNegativeMarking, setIsFetchingNegativeMarking] = useState(false);
  const [showSubjectMarksModal, setShowSubjectMarksModal] = useState(false);
  const [selectedSetForSubjectMarks, setSelectedSetForSubjectMarks] = useState(null);
  const [subjectMarksData, setSubjectMarksData] = useState([]);
  const [isFetchingSubjectMarks, setIsFetchingSubjectMarks] = useState(false);
  const [isSavingSubjectMarks, setIsSavingSubjectMarks] = useState(false);
  const [selectedSetForOverview, setSelectedSetForOverview] = useState(null);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [selectedSetForCategory, setSelectedSetForCategory] = useState(null);
  const [showSetQuestionsModal, setShowSetQuestionsModal] = useState(false);
  const [selectedSetForQuestions, setSelectedSetForQuestions] = useState(null);
  const [showTimeModal, setShowTimeModal] = useState(false); // <-- New state for time modal
  const [selectedSetForTime, setSelectedSetForTime] = useState(null);
  const [selectedCourseForTime, setSelectedCourseForTime] = useState(null);
  const [selectedCourseForExam, setSelectedCourseForExam] = useState(null);
  const [selectedExamForEdit, setSelectedExamForEdit] = useState(null);
  const [selectedExamForSet, setSelectedExamForSet] = useState(null);
  const [selectedSetForDelete, setSelectedSetForDelete] = useState(null);
  const [selectedSetForEdit, setSelectedSetForEdit] = useState(null);
  const [selectedSetForInstructions, setSelectedSetForInstructions] = useState(null);
  const [currentInstructionTab, setCurrentInstructionTab] = useState('instructions1');
  const [instructionsData, setInstructionsData] = useState({
    title_english: '',
    instruction_english: '',
    title_hindi: '',
    instruction_hindi: ''
  });
  const [instructionsTwo, setInstructionsTwo] = useState({
    test_duration: '',
    total_marks: '',
    instruction_two_english: '',
    instruction_two_hindi: '',
    red_warning_english: '',
    red_warning_hindi: '',
    declaration_english: '',
    declaration_hindi: '',
    image_content: ''
  });
  const [instructionsThreeData, setInstructionsThreeData] = useState({
    instruction_english: '',
    instruction_hindi: ''
  });
  const [examFormData, setExamFormData] = useState({
    exam_name: '',
    set_number: '',
    subjects: ['']
  });
  const [setFormState, setSetFormState] = useState({
    exam_name: '',
    set_number: '',
    set_name: '',
    is_paid: 0,
    subjects: ['']
  });
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    image: null,
    price: '',
    price_six_months: ''
  });

  // Toast state
  const [toast, setToast] = useState(null);

  // Show toast notification
  const showSuccessToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // 5 seconds
  };


  useEffect(() => {
    // Auto-enable fullscreen on page load
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
    fetchTestSeries();
    fetchCategories();

    return () => clearTimeout(timer);
  }, []);

  const fetchCategories = async () => {
    console.log(' AdminTestSeries: Starting to fetch categories');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Courses/get_course_categories.php`);
      const data = await response.json();

      console.log(' AdminTestSeries: Categories API response:', data);

      if (data.success) {
        setCategories(data.categories);
        console.log('AdminTestSeries: Categories loaded successfully:', data.categories.length);
      } else {
        console.log('AdminTestSeries: Failed to fetch categories:', data.message);
      }
    } catch (error) {
      console.log('AdminTestSeries: Categories fetch error:', error);
    }
  };

  const fetchTestSeries = async () => {
    console.log(' AdminTestSeries: Starting to fetch test series data');
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Courses/get_courses.php`);
      const data = await response.json();

      console.log(' AdminTestSeries: Raw API response:', data);

      if (data.success) {
        // Transform course data to test series format
        const transformedData = data.courses.map(course => {
          // Parse description as JSON to get test series specific data
          let testSeriesData = {};
          try {
            if (course.description && course.description.startsWith('{')) {
              testSeriesData = JSON.parse(course.description);
            }
          } catch (e) {
            console.log(' AdminTestSeries: Failed to parse description as JSON for course:', course.id);
          }

          return {
            id: course.id,
            title: course.title,
            category: course.category || 'Uncategorized',
            description: course.description || '',
            image: course.image ? (course.image.startsWith('data:') ? course.image : `data:image/jpeg;base64,${course.image}`) : '',
            price: parseInt(course.price) || 0,
            price_six_months: parseInt(course.price_six_months) || 0,
            createdDate: new Date(course.created_at).toLocaleDateString('en-CA'),
            lastUpdated: new Date(course.created_at).toLocaleDateString('en-CA')
          };
        });

        console.log(' AdminTestSeries: Transformed test series data:', transformedData);
        setTestSeries(transformedData);
        setError('');
      } else {
        console.log('AdminTestSeries: API returned error:', data.message);
        setError(data.message || 'Failed to fetch test series');
        setTestSeries([]);
      }
    } catch (error) {
      console.log('AdminTestSeries: Fetch error:', error);
      setError('Failed to fetch test series');
      setTestSeries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    console.log(' AdminTestSeries: Adding new category:', categoryFormData);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Courses/add_course_category.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryFormData)
      });

      const data = await response.json();
      console.log(' AdminTestSeries: Add category API response:', data);

      if (data.success) {
        console.log('AdminTestSeries: Category added successfully');
        setShowCategoryForm(false);
        setCategoryFormData({ name: '' });
        fetchCategories(); // Refresh categories
        showSuccessToast('Category added successfully!');
      } else {
        console.log('AdminTestSeries: Failed to add category:', data.message);
        setError(data.message || 'Failed to add category');
      }
    } catch (error) {
      console.log('AdminTestSeries: Add category error:', error);
      setError('Failed to add category');
    }
  };

  const handleDeleteCategory = async () => {
    console.log('AdminTestSeries: Deleting category:', selectedCategory);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Courses/delete_course_category.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedCategory.id })
      });

      const data = await response.json();
      console.log('AdminTestSeries: Delete category API response:', data);

      if (data.success) {
        console.log('AdminTestSeries: Category deleted successfully');
        setShowCategoryDeleteConfirm(false);
        setSelectedCategory(null);
        fetchCategories(); // Refresh categories
        fetchTestSeries(); // Refresh test series as category relationships may change
        showSuccessToast('Category deleted successfully!');
      } else {
        console.log('AdminTestSeries: Failed to delete category:', data.message);
        setError(data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.log('AdminTestSeries: Delete category error:', error);
      setError('Failed to delete category');
    }
  };

  const handleAddTestSeries = async () => {
    console.log(' AdminTestSeries: Starting to add new test series:', courseFormData);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', courseFormData.title);
      formDataToSend.append('category_id', courseFormData.category_id);
      formDataToSend.append('description', courseFormData.description);
      formDataToSend.append('price', parseInt(courseFormData.price));
      formDataToSend.append('price_six_months', parseInt(courseFormData.price_six_months) || 0);

      if (courseFormData.image) {
        formDataToSend.append('image', courseFormData.image);
      }

      console.log(' AdminTestSeries: Sending course data to API');

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Courses/add_course.php`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();
      console.log(' AdminTestSeries: Add API response:', data);

      if (data.success) {
        console.log('AdminTestSeries: Test series added successfully');
        setShowAddForm(false);
        setCourseFormData({
          title: '',
          category_id: '',
          description: '',
          image: null,
          price: '',
          price_six_months: ''
        });
        fetchTestSeries(); // Refresh list
        showSuccessToast('Test series added successfully!');
      } else {
        console.log('AdminTestSeries: Failed to add test series:', data.message);
        setError(data.message || 'Failed to add test series');
      }
    } catch (error) {
      console.log('AdminTestSeries: Add error:', error);
      setError('Failed to add test series');
    }
  };

  const handleEditTestSeries = async () => {
    console.log('AdminTestSeries: Starting to edit test series:', selectedTestSeries.id, courseFormData);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('id', selectedTestSeries.id);
      formDataToSend.append('title', courseFormData.title);
      formDataToSend.append('category_id', courseFormData.category_id);
      formDataToSend.append('description', courseFormData.description);
      formDataToSend.append('price', parseInt(courseFormData.price));
      formDataToSend.append('price_six_months', parseInt(courseFormData.price_six_months) || 0);

      if (courseFormData.image) {
        formDataToSend.append('image', courseFormData.image);
      }

      console.log('AdminTestSeries: Sending update data to API');

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Courses/update_course.php`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();
      console.log('AdminTestSeries: Update API response:', data);

      if (data.success) {
        console.log('AdminTestSeries: Test series updated successfully');
        setShowEditForm(false);
        setSelectedTestSeries(null);
        setCourseFormData({
          title: '',
          category_id: '',
          description: '',
          image: null,
          price: '',
          price_six_months: ''
        });
        fetchTestSeries(); // Refresh list
        showSuccessToast('Test series updated successfully!');
      } else {
        console.log('AdminTestSeries: Failed to update test series:', data.message);
        setError(data.message || 'Failed to update test series');
      }
    } catch (error) {
      console.log('AdminTestSeries: Update error:', error);
      setError('Failed to update test series');
    }
  };

  const handleDeleteTestSeries = async () => {
    console.log('AdminTestSeries: Starting to delete test series:', selectedTestSeries.id);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Courses/delete_course.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedTestSeries.id })
      });

      const data = await response.json();
      console.log('AdminTestSeries: Delete API response:', data);

      if (data.success) {
        console.log('AdminTestSeries: Test series deleted successfully');
        setShowDeleteConfirm(false);
        setSelectedTestSeries(null);
        fetchTestSeries(); // Refresh list
        showSuccessToast('Test series deleted successfully!');
      } else {
        console.log('AdminTestSeries: Failed to delete test series:', data.message);
        setError(data.message || 'Failed to delete test series');
      }
    } catch (error) {
      console.log('AdminTestSeries: Delete error:', error);
      setError('Failed to delete test series');
    }
  };

  const toggleExamSets = async (testSeriesId) => {
    console.log(' AdminTestSeries: Toggling exam sets for:', testSeriesId);

    if (showExamSets[testSeriesId]) {
      setShowExamSets(prev => ({ ...prev, [testSeriesId]: false }));
      return;
    }

    // Fetch exam sets for this course if not already loaded
    if (!examSets[testSeriesId]) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Exams/get_exam_sets.php?course_id=${testSeriesId}`);
        const data = await response.json();

        if (data.success) {
          setExamSets(prev => ({ ...prev, [testSeriesId]: data.exam_sets || [] }));
        }
      } catch (error) {
        console.log('AdminTestSeries: Failed to fetch exam sets:', error);
      }
    }

    setShowExamSets(prev => ({ ...prev, [testSeriesId]: true }));
  };

  // Subject management functions for sets
  const addSubjectField = () => {
    setSetFormState(prev => ({
      ...prev,
      subjects: [...prev.subjects, '']
    }));
  };

  const removeSubjectField = (subjectIndex) => {
    setSetFormState(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, index) => index !== subjectIndex)
    }));
  };

  const updateSubject = (subjectIndex, value) => {
    setSetFormState(prev => ({
      ...prev,
      subjects: prev.subjects.map((subject, index) =>
        index === subjectIndex ? value : subject
      )
    }));
  };

  const handleAddExam = async () => {
    console.log(' AdminTestSeries: Adding new exam:', examFormData);
    console.log(' AdminTestSeries: Course ID:', selectedCourseForExam);

    if (!examFormData.exam_name.trim() || !selectedCourseForExam) {
      console.log('AdminTestSeries: Validation failed - exam_name or course_id missing');
      setError('Please enter exam name');
      return;
    }

    try {
      const payload = {
        course_id: selectedCourseForExam,
        exam_name: examFormData.exam_name.trim()
      };

      console.log(' AdminTestSeries: Sending payload:', payload);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Exams/add_exam.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log(' AdminTestSeries: Add exam API response:', data);

      if (data.success) {
        console.log('AdminTestSeries: Exam added successfully');
        setShowAddExamForm(false);
        const courseIdToRefresh = selectedCourseForExam;
        setSelectedCourseForExam(null);
        setExamFormData({ exam_name: '' });
        setError('');

        // Refresh exam sets for this course
        setExamSets(prev => ({ ...prev, [courseIdToRefresh]: undefined }));
        fetchExamSetsByCategory(courseIdToRefresh);

        showSuccessToast('Exam added successfully!');
      } else {
        console.log('AdminTestSeries: Failed to add exam:', data.message);
        setError(data.message || 'Failed to add exam');
      }
    } catch (error) {
      console.log('AdminTestSeries: Add exam error:', error);
      setError('Failed to add exam');
    }
  };

  const fetchExamSetsByCategory = async (courseId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Exams/get_exam_sets.php?course_id=${courseId}`);
      const data = await response.json();

      if (data.success) {
        setExamSets(prev => ({ ...prev, [courseId]: data.exam_sets || [] }));
      }
    } catch (error) {
      console.log('AdminTestSeries: Failed to fetch exam sets:', error);
    }
  };

  const handleAddSet = async () => {
    console.log(' AdminTestSeries: Adding new set:', setFormState);

    if (!setFormState.set_number.trim() || !setFormState.set_name.trim()) {
      setError('Please enter set number and set name');
      return;
    }

    try {
      // Filter and convert subjects to strings
      const filteredSubjects = setFormState.subjects
        .map(subject => {
          if (typeof subject === 'string') return subject.trim();
          return (subject.name || subject.subject_name || '').trim();
        })
        .filter(s => s !== '');

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Exams/add_exam_set.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exam_id: selectedExamForSet.id,
          set_number: parseInt(setFormState.set_number),
          set_name: setFormState.set_name.trim(),
          is_paid: setFormState.is_paid,
          subjects: filteredSubjects
        })
      });

      const data = await response.json();
      console.log(' AdminTestSeries: Add set API response:', data);

      if (data.success) {
        console.log('AdminTestSeries: Set added successfully');
        setShowAddSetForm(false);
        setSelectedExamForSet(null);
        setSetFormState({ exam_name: '', set_number: '', set_name: '', is_paid: 0, subjects: [''] });
        setError('');

        // Refresh exam sets for this course - same logic as handleEditExam
        let courseIdToRefresh = null;
        for (const [id, exams] of Object.entries(examSets)) {
          if (exams.some(exam => exam.id === selectedExamForSet.id)) {
            courseIdToRefresh = id;
            break;
          }
        }

        if (courseIdToRefresh) {
          setExamSets(prev => ({ ...prev, [courseIdToRefresh]: undefined }));
          fetchExamSetsByCategory(courseIdToRefresh);
        }

        showSuccessToast('Exam set added successfully!');
      } else {
        console.log('AdminTestSeries: Failed to add set:', data.message);
        setError(data.message || 'Failed to add set');
      }
    } catch (error) {
      console.log('AdminTestSeries: Add set error:', error);
      setError('Failed to add set');
    }
  };

  const openAddExamForm = (courseId) => {
    console.log(' AdminTestSeries: Opening add exam form for course:', courseId);
    setError('');
    setSelectedCourseForExam(courseId);
    setExamFormData({ exam_name: '' });
    setShowAddExamForm(true);
  };

  const openAddSetForm = (exam, courseId) => {
    console.log(' AdminTestSeries: Opening add set form for exam:', exam, 'courseId:', courseId);
    setSelectedExamForSet({ ...exam, course_id: courseId });
    setSetFormState({ exam_name: exam.exam_name, set_number: '', set_name: '', is_paid: 0, subjects: [''] });
    setShowAddSetForm(true);
  };

  const openEditExamForm = (exam) => {
    setSelectedExamForEdit(exam);
    setExamFormData({
      exam_name: exam.exam_name
    });
    setShowEditExamForm(true);
  };

  const openDeleteExamConfirm = (exam) => {
    if (!checkPermission('delete exams')) return;
    setSelectedExamForEdit(exam);
    setShowDeleteExamConfirm(true);
  };

  const handleAddSubjectField = () => {
    setSetFormState({
      ...setFormState,
      subjects: [...setFormState.subjects, '']
    });
  };

  const handleRemoveSubjectField = (index) => {
    if (setFormState.subjects.length > 1) {
      setSetFormState({
        ...setFormState,
        subjects: setFormState.subjects.filter((_, i) => i !== index)
      });
    }
  };

  const handleUpdateSubject = (index, value) => {
    setSetFormState({
      ...setFormState,
      subjects: setFormState.subjects.map((subject, i) => i === index ? value : subject)
    });
  };

  const handleEditExam = async () => {
    console.log('AdminTestSeries: Editing exam:', examFormData);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Exams/edit_exam.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exam_id: selectedExamForEdit.id,
          exam_name: examFormData.exam_name
        })
      });

      const data = await response.json();
      console.log('AdminTestSeries: Edit exam API response:', data);

      if (data.success) {
        console.log('AdminTestSeries: Exam updated successfully');
        setShowEditExamForm(false);
        setSelectedExamForEdit(null);
        setExamFormData({ exam_name: '' });

        // Find the course ID from the selected exam
        let courseId = null;
        for (const [id, exams] of Object.entries(examSets)) {
          if (exams.some(exam => exam.id === selectedExamForEdit.id)) {
            courseId = id;
            break;
          }
        }

        if (courseId) {
          setExamSets(prev => ({ ...prev, [courseId]: undefined }));
          toggleExamSets(courseId);
        }
        showSuccessToast('Exam updated successfully!');
      } else {
        console.log('AdminTestSeries: Failed to edit exam:', data.message);
        setError(data.message || 'Failed to edit exam');
      }
    } catch (error) {
      console.log('AdminTestSeries: Edit exam error:', error);
      setError('Failed to edit exam');
    }
  };

  const handleDeleteExam = async () => {
    console.log('AdminTestSeries: Deleting exam:', selectedExamForEdit.id);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Exams/delete_exam.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exam_id: selectedExamForEdit.id
        })
      });

      const data = await response.json();
      console.log('AdminTestSeries: Delete exam API response:', data);

      if (data.success) {
        console.log('AdminTestSeries: Exam deleted successfully');
        setShowDeleteExamConfirm(false);
        setSelectedExamForEdit(null);

        // Find the course ID from the selected exam
        let courseId = null;
        for (const [id, exams] of Object.entries(examSets)) {
          if (exams.some(exam => exam.id === selectedExamForEdit.id)) {
            courseId = id;
            break;
          }
        }

        if (courseId) {
          setExamSets(prev => ({ ...prev, [courseId]: undefined }));
          toggleExamSets(courseId);
        }
        showSuccessToast('Exam deleted successfully!');
      } else {
        console.log('AdminTestSeries: Failed to delete exam:', data.message);
        setError(data.message || 'Failed to delete exam');
      }
    } catch (error) {
      console.log('AdminTestSeries: Delete exam error:', error);
      setError('Failed to delete exam');
    }
  };

  const openEditForm = (testSeries) => {
    console.log('AdminTestSeries: Opening edit form for:', testSeries);

    // Find category ID from category name
    const category = categories.find(cat => cat.name === testSeries.category);
    const categoryId = category ? category.id.toString() : '';

    setSelectedTestSeries(testSeries);
    setCourseFormData({
      title: testSeries.title,
      category_id: categoryId,
      description: testSeries.description || '',
      image: null,
      price: testSeries.price.toString(),
      price_six_months: (testSeries.price_six_months || '').toString()
    });
    setShowEditForm(true);
  };

  const openCategoryDeleteConfirm = (category) => {
    if (!checkPermission('delete categories')) return;
    console.log('AdminTestSeries: Opening category delete confirmation for:', category);
    setSelectedCategory(category);
    setShowCategoryDeleteConfirm(true);
  };

  const openDeleteConfirm = (testSeries) => {
    if (!checkPermission('delete test series')) return;
    console.log('AdminTestSeries: Opening delete confirmation for:', testSeries);
    setSelectedTestSeries(testSeries);
    setShowDeleteConfirm(true);
  };

  const openDeleteSetConfirm = (examSet, courseId) => {
    if (!checkPermission('delete exam sets')) return;
    console.log('AdminTestSeries: Opening delete set confirmation for:', examSet);
    setSelectedSetForDelete({ ...examSet, courseId });
    setShowDeleteSetConfirm(true);
  };

  const handleDeleteSet = async () => {
    console.log('AdminTestSeries: Deleting exam set:', selectedSetForDelete.id);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Exams/delete_exam_set.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          set_id: selectedSetForDelete.id
        })
      });

      const data = await response.json();
      console.log('AdminTestSeries: Delete set API response:', data);

      if (data.success) {
        console.log('AdminTestSeries: Exam set deleted successfully');
        setShowDeleteSetConfirm(false);
        const courseIdToRefresh = selectedSetForDelete.courseId;
        setSelectedSetForDelete(null);

        // Refresh exam sets for this course - same logic as handleDeleteExam
        setExamSets(prev => ({ ...prev, [courseIdToRefresh]: undefined }));
        setTimeout(() => {
          fetchExamSetsByCategory(courseIdToRefresh);
        }, 100);

        showSuccessToast('Exam set deleted successfully!');
      } else {
        console.log('AdminTestSeries: Failed to delete exam set:', data.message);
        setError(data.message || 'Failed to delete exam set');
      }
    } catch (error) {
      console.log('AdminTestSeries: Delete exam set error:', error);
      setError('Failed to delete exam set');
    }
  };

  const openEditSetForm = (examSet, courseId) => {
    console.log('AdminTestSeries: Opening edit set form for:', examSet);
    setSelectedSetForEdit({ ...examSet, courseId });

    // Convert subjects to strings, handling both string and object formats
    const subjectsArray = examSet.subjects && examSet.subjects.length > 0
      ? examSet.subjects.map(subject => {
        if (typeof subject === 'string') return subject;
        return subject.name || subject.subject_name || '';
      }).filter(Boolean)
      : [''];

    setSetFormState({
      exam_name: examSet.exam_name,
      set_number: examSet.set_number.toString(),
      set_name: examSet.set_name || '',
      is_paid: examSet.is_paid || 0,
      subjects: subjectsArray
    });
    setShowEditSetForm(true);
  };

  const handleEditSet = async () => {
    console.log('AdminTestSeries: Editing exam set:', selectedSetForEdit.id, setFormState);

    if (!setFormState.set_number.trim() || !setFormState.set_name.trim()) {
      setError('Please enter set number and set name');
      return;
    }

    try {
      // Filter and convert subjects to strings
      const filteredSubjects = setFormState.subjects
        .map(subject => {
          if (typeof subject === 'string') return subject.trim();
          return (subject.name || subject.subject_name || '').trim();
        })
        .filter(s => s !== '');

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Exams/update_exam_set.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedSetForEdit.id,
          set_number: parseInt(setFormState.set_number),
          set_name: setFormState.set_name.trim(),
          is_paid: setFormState.is_paid,
          subjects: filteredSubjects
        })
      });

      const data = await response.json();
      console.log('AdminTestSeries: Edit set API response:', data);

      if (data.success) {
        console.log('AdminTestSeries: Exam set updated successfully');
        setShowEditSetForm(false);
        setSelectedSetForEdit(null);
        setSetFormState({
          exam_name: '',
          set_number: '',
          subjects: ['']
        });

        // Refresh exam sets for this course
        if (selectedSetForEdit.courseId) {
          setExamSets(prev => ({ ...prev, [selectedSetForEdit.courseId]: undefined }));
          toggleExamSets(selectedSetForEdit.courseId);
        }
        showSuccessToast('Exam set updated successfully!');
      } else {
        console.log('AdminTestSeries: Failed to update exam set:', data.message);
        setError(data.message || 'Failed to update exam set');
      }
    } catch (error) {
      console.log('AdminTestSeries: Update exam set error:', error);
      setError('Failed to update exam set');
    }
  };

  const openInstructionsModal = async (examSet) => {
    console.log(' AdminTestSeries: Opening instructions modal for set:', examSet.id);
    setSelectedSetForInstructions(examSet);
    setCurrentInstructionTab('instructions1');

    // Try to fetch existing instructions one
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Instructions/get_instructions_one.php?exam_set_id=${examSet.id}`);
      const data = await response.json();

      if (data.success && data.instructions) {
        setInstructionsData({
          title_english: data.instructions.title_english,
          instruction_english: data.instructions.instruction_english,
          title_hindi: data.instructions.title_hindi,
          instruction_hindi: data.instructions.instruction_hindi
        });
      } else {
        // Reset form for new instructions
        setInstructionsData({
          title_english: '',
          instruction_english: '',
          title_hindi: '',
          instruction_hindi: ''
        });
      }
    } catch (error) {
      console.log('AdminTestSeries: Error fetching instructions one:', error);
      setInstructionsData({
        title_english: '',
        instruction_english: '',
        title_hindi: '',
        instruction_hindi: ''
      });
    }

    // Try to fetch existing instructions two
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Instructions/get_instructions_two.php?exam_set_id=${examSet.id}`);
      const data = await response.json();

      if (data.success && data.data) {
        console.log(' AdminTestSeries: Instructions Two fetched successfully');
        setInstructionsTwo({
          test_duration: data.data.test_duration || '',
          total_marks: data.data.total_marks || '',
          instruction_two_english: data.data.instruction_two_english || '',
          instruction_two_hindi: data.data.instruction_two_hindi || '',
          red_warning_english: data.data.red_warning_english || '',
          red_warning_hindi: data.data.red_warning_hindi || '',
          declaration_english: data.data.declaration_english || '',
          declaration_hindi: data.data.declaration_hindi || '',
          image_content: data.data.image_content || ''
        });
      } else {
        // Reset form for new instructions
        setInstructionsTwo({
          test_duration: '',
          total_marks: '',
          instruction_two_english: '',
          instruction_two_hindi: '',
          red_warning_english: '',
          red_warning_hindi: '',
          declaration_english: '',
          declaration_hindi: '',
          image_content: ''
        });
      }
    } catch (error) {
      console.log('AdminTestSeries: Error fetching instructions two:', error);
      setInstructionsTwo({
        test_duration: '',
        total_marks: '',
        instruction_two_english: '',
        instruction_two_hindi: '',
        red_warning_english: '',
        red_warning_hindi: '',
        declaration_english: '',
        declaration_hindi: '',
        image_content: ''
      });
    }

    // Try to fetch existing instructions three
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Instructions/get_instructions_three.php?exam_set_id=${examSet.id}`);
      const data = await response.json();

      if (data.success && data.data) {
        console.log(' AdminTestSeries: Instructions Three fetched successfully');
        setInstructionsThreeData({
          instruction_english: data.data.instruction_english || '',
          instruction_hindi: data.data.instruction_hindi || ''
        });
      } else {
        setInstructionsThreeData({
          instruction_english: '',
          instruction_hindi: ''
        });
      }
    } catch (error) {
      console.log('AdminTestSeries: Error fetching instructions three:', error);
      setInstructionsThreeData({
        instruction_english: '',
        instruction_hindi: ''
      });
    }

    setShowInstructionsModal(true);
  };


  const handleSaveInstructionsTwo = async () => {
    console.log('ðŸ’¾ AdminTestSeries: Saving instructions two for set:', selectedSetForInstructions.id);

    if (!String(instructionsTwo.test_duration).trim() || !String(instructionsTwo.total_marks).trim()) {
      setError('Test Duration and Total Marks are required');
      return;
    }

    try {
      // Check if instructions two already exist
      const checkResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Instructions/get_instructions_two.php?exam_set_id=${selectedSetForInstructions.id}`);
      const checkData = await checkResponse.json();

      const isUpdate = checkData.success && checkData.data;
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/Instructions/add_instructions_two.php`;

      const payload = {
        exam_set_id: selectedSetForInstructions.id,
        test_duration: instructionsTwo.test_duration,
        total_marks: instructionsTwo.total_marks,
        instruction_two_english: instructionsTwo.instruction_two_english,
        instruction_two_hindi: instructionsTwo.instruction_two_hindi,
        red_warning_english: instructionsTwo.red_warning_english,
        red_warning_hindi: instructionsTwo.red_warning_hindi,
        declaration_english: instructionsTwo.declaration_english,
        declaration_hindi: instructionsTwo.declaration_hindi,
        image_content: instructionsTwo.image_content
      };

      console.log('ðŸ’¾ AdminTestSeries: Sending instructions two payload');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('ðŸ’¾ AdminTestSeries: Save instructions two API response:', data);

      if (data.success) {
        console.log('AdminTestSeries: Instructions two saved successfully');
        setShowInstructionsModal(false);
        setSelectedSetForInstructions(null);
        setInstructionsTwo({
          test_duration: '',
          total_marks: '',
          instruction_two_english: '',
          instruction_two_hindi: '',
          red_warning_english: '',
          red_warning_hindi: '',
          declaration_english: '',
          declaration_hindi: '',
          image_content: ''
        });
        setError('');
        showSuccessToast(`Instructions Two ${isUpdate ? 'updated' : 'added'} successfully!`);
      } else {
        console.log('AdminTestSeries: Failed to save instructions two:', data.message);
        setError(data.message || 'Failed to save instructions two');
      }
    } catch (error) {
      console.log('AdminTestSeries: Save instructions two error:', error);
      setError('Failed to save instructions two');
    }
  };

  const handleSaveInstructions = async () => {
    console.log('ðŸ’¾ AdminTestSeries: Saving instructions for set:', selectedSetForInstructions.id);

    // Helper function to strip HTML tags for validation
    const stripHtml = (html) => {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || "";
    };

    // Helper function to extract base64 images from HTML
    const extractImages = (html) => {
      const images = [];
      const imgRegex = /<img[^>]+src="(data:image[^"]+)"/g;
      let match;

      while ((match = imgRegex.exec(html)) !== null) {
        images.push(match[1]);
        console.log(' AdminTestSeries: Found embedded image, index:', images.length - 1);
      }

      console.log(' AdminTestSeries: Total images extracted:', images.length);
      return images.length > 0 ? images : null;
    };

    // Extract images early to validate
    const englishImages = extractImages(instructionsData.instruction_english);
    const hasEnglishText = stripHtml(instructionsData.instruction_english).trim().length > 0;
    const hasEnglishContent = hasEnglishText || englishImages;

    if (!hasEnglishContent) {
      setError('English instruction (text or image) is required');
      return;
    }

    try {
      // Extract images from Hindi instructions
      const hindiImages = extractImages(instructionsData.instruction_hindi);
      const allImages = [...(englishImages || []), ...(hindiImages || [])];

      console.log('ðŸ’¾ AdminTestSeries: Total images to send:', allImages.length);

      // Check if instructions already exist
      const checkResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Instructions/get_instructions_one.php?exam_set_id=${selectedSetForInstructions.id}`);
      const checkData = await checkResponse.json();

      const isUpdate = checkData.success && checkData.instructions;
      const apiUrl = isUpdate
        ? `${import.meta.env.VITE_BACKEND_URL}/api/Instructions/update_instructions_one.php`
        : `${import.meta.env.VITE_BACKEND_URL}/api/Instructions/add_instructions_one.php`;

      const payload = {
        exam_set_id: selectedSetForInstructions.id,
        title_english: instructionsData.title_english,
        instruction_english: instructionsData.instruction_english,
        title_hindi: instructionsData.title_hindi,
        instruction_hindi: instructionsData.instruction_hindi,
        images: allImages.length > 0 ? allImages : null
      };

      console.log('ðŸ’¾ AdminTestSeries: Sending payload with', allImages.length, 'images');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('ðŸ’¾ AdminTestSeries: Save instructions API response:', data);

      if (data.success) {
        console.log('AdminTestSeries: Instructions saved successfully');
        setShowInstructionsModal(false);
        setSelectedSetForInstructions(null);
        setInstructionsData({
          title_english: '',
          instruction_english: '',
          title_hindi: '',
          instruction_hindi: ''
        });
        showSuccessToast(`Instructions ${isUpdate ? 'updated' : 'added'} successfully!`);
      } else {
        console.log('AdminTestSeries: Failed to save instructions:', data.message);
        setError(data.message || 'Failed to save instructions');
      }
    } catch (error) {
      console.log('AdminTestSeries: Save instructions error:', error);
      setError('Failed to save instructions');
    }
  };

  const handleSaveInstructionsThree = async () => {
    console.log('ðŸ’¾ AdminTestSeries: Saving instructions three for set:', selectedSetForInstructions.id);

    // Helper function to strip HTML tags for validation
    const stripHtml = (html) => {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || "";
    };

    const hasEnglishText = stripHtml(instructionsThreeData.instruction_english).trim().length > 0;
    const hasEnglishImages = instructionsThreeData.instruction_english.includes('<img');
    const hasEnglishContent = hasEnglishText || hasEnglishImages;

    if (!hasEnglishContent) {
      setError('English instruction (text or image) is required');
      return;
    }

    try {
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/Instructions/save_instructions_three.php`;

      const payload = {
        exam_set_id: selectedSetForInstructions.id,
        instruction_english: instructionsThreeData.instruction_english,
        instruction_hindi: instructionsThreeData.instruction_hindi
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        console.log('AdminTestSeries: Instructions three saved successfully');
        setShowInstructionsModal(false);
        setSelectedSetForInstructions(null);
        setInstructionsThreeData({
          instruction_english: '',
          instruction_hindi: ''
        });
        showSuccessToast('SSC Instructions saved successfully!');
      } else {
        setError(data.message || 'Failed to save instructions');
      }
    } catch (error) {
      console.log('AdminTestSeries: Save instructions three error:', error);
      setError('Failed to save instructions');
    }
  };

  const openNegativeMarkingModal = async (set) => {
    setSelectedSetForNegativeMarking(set);
    setShowNegativeMarkingModal(true);
    setNegativeMarkingValue('');
    setPositiveMarkingValue('');
    setIsFetchingNegativeMarking(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Marks/manage_negative_marking.php?exam_set_id=${set.id}`);
      const data = await response.json();
      if (data.success) {
        setNegativeMarkingValue(data.data.negative_marking.toString());
        setPositiveMarkingValue(data.data.positive_marking ? data.data.positive_marking.toString() : '');
      }
    } catch (error) {
      console.error('Error fetching marking values:', error);
    } finally {
      setIsFetchingNegativeMarking(false);
    }
  };

  const handleSaveNegativeMarking = async () => {
    setIsSavingNegativeMarking(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Marks/manage_negative_marking.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_set_id: selectedSetForNegativeMarking.id,
          negative_marking: parseFloat(negativeMarkingValue) || 0,
          positive_marking: parseFloat(positiveMarkingValue) || 0
        })
      });
      const data = await response.json();
      if (data.success) {
        showSuccessToast('Marking values updated successfully!');
        setShowNegativeMarkingModal(false);
      } else {
        setError(data.message || 'Failed to update marking values');
      }
    } catch (error) {
      console.error('Error saving marking values:', error);
      setError('Failed to save marking values');
    } finally {
      setIsSavingNegativeMarking(false);
    }
  };

  const safeJsonParse = (text) => {
    try {
      return JSON.parse(text.trim());
    } catch (e) {
      // If there's trailing garbage, try to extract the first valid JSON object
      const match = text.match(/(\{[\s\S]*\})/);
      if (match) {
        try {
          return JSON.parse(match[1]);
        } catch (innerE) {
          throw e;
        }
      }
      throw e;
    }
  };

  const openSubjectMarksModal = async (set) => {
    setSelectedSetForSubjectMarks(set);
    setShowSubjectMarksModal(true);
    setSubjectMarksData([]);
    setIsFetchingSubjectMarks(true);

    try {
      // 1. Fetch official subjects for this set (like Time Modal does)
      const subjectsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Exams/get_subjects_for_set.php?exam_set_id=${set.id}`);
      const subjectsText = await subjectsResponse.text();
      const subjectsData = safeJsonParse(subjectsText);

      // 2. Fetch existing marks for these subjects
      const marksResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Marks/manage_exam_subjects_marks.php?exam_set_id=${set.id}`);
      const marksText = await marksResponse.text();
      const marksData = safeJsonParse(marksText);

      let existingMarks = [];
      if (marksData.success && marksData.data) {
        existingMarks = marksData.data;
      }

      if (subjectsData.success && subjectsData.subjects) {
        const mergedData = subjectsData.subjects.map(s => {
          // Find if this subject already has marks in the database
          const foundMark = existingMarks.find(em => em.subject_name === s.subject_name || em.id === s.id);
          return {
            id: s.id, // Use the actual subject ID
            subject_name: s.subject_name,
            sub_marks: foundMark ? foundMark.sub_marks : 0
          };
        });
        setSubjectMarksData(mergedData);
      } else {
        // Fallback to whatever marks are there if subjects fetch failed but marks didn't
        setSubjectMarksData(existingMarks);
      }
    } catch (error) {
      console.error('Error fetching subject marks:', error);
    } finally {
      setIsFetchingSubjectMarks(false);
    }
  };

  const handleSubjectMarksChange = (index, field, value) => {
    const newData = [...subjectMarksData];
    newData[index] = { ...newData[index], [field]: value };
    setSubjectMarksData(newData);
  };

  const handleSaveSubjectMarks = async () => {
    setIsSavingSubjectMarks(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Marks/manage_exam_subjects_marks.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_set_id: selectedSetForSubjectMarks.id,
          subjects: subjectMarksData
        })
      });
      const responseText = await response.text();
      const data = safeJsonParse(responseText);
      if (data.success) {
        showSuccessToast('Subject marks updated successfully!');
        setShowSubjectMarksModal(false);
      } else {
        setError(data.message || 'Failed to update subject marks');
      }
    } catch (error) {
      console.error('Error saving subject marks:', error);
      setError('Failed to save subject marks');
    } finally {
      setIsSavingSubjectMarks(false);
    }
  };

  const handleOpenTimeModal = (set, courseId) => {
    setSelectedSetForTime(set);
    setSelectedCourseForTime(courseId);
    setShowTimeModal(true);
  };

  // --- NEW: TimeSettingsModal component ---
  const TimeSettingsModal = ({ set, show, onClose, onSave }) => {
    const [activeTab, setActiveTab] = useState('total'); // 'total', 'subject', or 'sectional'
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [saving, setSaving] = useState(false);
    const [totalTime, setTotalTime] = useState(set?.total_time_minutes || '');
    const [subjects, setSubjects] = useState([]);
    const [sections, setSections] = useState([
      { id: 1, name: 'SECTION - 1', time: '' },
      { id: 2, name: 'SECTION - 2', time: '' },
      { id: 3, name: 'SECTION - 3', time: '' },
      { id: 4, name: 'SECTION - 4', time: '' }
    ]);

    useEffect(() => {
      if (show && set) {
        // Reset state on open
        setTotalTime(set?.total_time_minutes || '');

        // Fetch subjects for this set
        setLoadingSubjects(true);
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Exams/get_subjects_for_set.php?exam_set_id=${set.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setSubjects(data.subjects.map(s => ({
                id: s.id,
                subject_name: s.subject_name,
                time_minutes: s.time_minutes || '',
                sectional_time_minutes: s.sectional_time_minutes || '',
                section_number: s.section_number || ''
              })));

              // Populate section times from subjects
              const newSections = [
                { id: 1, name: 'SECTION - 1', time: '' },
                { id: 2, name: 'SECTION - 2', time: '' },
                { id: 3, name: 'SECTION - 3', time: '' },
                { id: 4, name: 'SECTION - 4', time: '' }
              ];
              data.subjects.forEach(s => {
                const secNum = parseInt(s.section_number, 10);
                if (secNum >= 1 && secNum <= 4 && s.sectional_time_minutes) {
                  const idx = secNum - 1;
                  newSections[idx].time = s.sectional_time_minutes;
                }
              });
              setSections(newSections);

              // Determine active tab
              if (parseInt(set?.is_sectional_enabled, 10) === 1) {
                setActiveTab('sectional');
              } else if (set?.total_time_minutes) {
                setActiveTab('total');
              } else if (data.subjects.some(s => s.time_minutes)) {
                setActiveTab('subject');
              } else {
                setActiveTab('total');
              }
            } else {
              onSave(data.message || 'Failed to load subjects', 'error');
            }
          })
          .catch(err => {
            console.error('Error fetching subjects:', err);
            onSave('Error fetching subjects', 'error');
          })
          .finally(() => setLoadingSubjects(false));
      }
    }, [show, set]);

    const handleSubjectTimeChange = (id, time) => {
      setSubjects(prev =>
        prev.map(s => (s.id === id ? { ...s, time_minutes: time } : s))
      );
    };

    const handleSectionTimeChange = (id, time) => {
      setSections(prev =>
        prev.map(sec => (sec.id === id ? { ...sec, time: time } : sec))
      );
    };

    const handleSubjectSectionChange = (subjectId, sectionId) => {
      setSubjects(prev =>
        prev.map(s => (s.id === subjectId ? { ...s, section_number: sectionId } : s))
      );
    };

    const handleSave = async () => {
      setSaving(true);
      let payload = {
        exam_set_id: set.id,
        is_sectional_enabled: activeTab === 'sectional' ? 1 : 0
      };

      if (activeTab === 'total') {
        payload.total_time = totalTime ? parseInt(totalTime, 10) : null;
      } else if (activeTab === 'subject') {
        payload.subject_times = subjects.map(s => ({
          id: s.id,
          time: s.time_minutes ? parseInt(s.time_minutes, 10) : null
        }));
      } else if (activeTab === 'sectional') {
        payload.subject_times = subjects.map(s => ({
          id: s.id,
          section_number: s.section_number ? parseInt(s.section_number, 10) : null,
          sectional_time: s.section_number ? (sections.find(sec => sec.id === parseInt(s.section_number))?.time || null) : null
        }));
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/TimeManagement/save_exam_times.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
          onSave(data.message, 'success');
          onClose();
        } else {
          onSave(data.message || 'Failed to save time settings', 'error');
        }
      } catch (error) {
        console.error('Error saving time:', error);
        onSave('An error occurred while saving', 'error');
      } finally {
        setSaving(false);
      }
    };

    if (!show || !set) return null;

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`w-full max-w-lg p-6 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Time Settings for: <span className="text-indigo-400">{set.set_name}</span></h3>
              <button
                onClick={onClose}
                className={`p-1 rounded-full ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className={`flex border-b mb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setActiveTab('total')}
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'total' ? 'border-b-2 border-indigo-500 text-indigo-500' : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black')}`}
              >
                Total Time
              </button>
              <button
                onClick={() => setActiveTab('subject')}
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'subject' ? 'border-b-2 border-indigo-500 text-indigo-500' : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black')}`}
              >
                Subject-wise Time
              </button>
              <button
                onClick={() => setActiveTab('sectional')}
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'sectional' ? 'border-b-2 border-indigo-500 text-indigo-500' : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black')}`}
              >
                Sectional Time
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {activeTab === 'total' && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total Time (in minutes)
                  </label>
                  <input
                    type="number"
                    value={totalTime}
                    onChange={(e) => setTotalTime(e.target.value)}
                    placeholder="e.g., 120"
                    className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Set a total time for the entire exam set. This will override any subject-wise times.
                  </p>
                </div>
              )}

              {activeTab === 'subject' && (
                <div>
                  <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Set time (in minutes) for each subject. This will override the total time.
                  </p>
                  {loadingSubjects ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {subjects.map(subject => (
                        <div key={subject.id} className="flex items-center space-x-3">
                          <label className="flex-1 text-sm">{subject.subject_name}</label>
                          <input
                            type="number"
                            value={subject.time_minutes}
                            onChange={(e) => handleSubjectTimeChange(subject.id, e.target.value)}
                            placeholder="Mins"
                            className={`w-24 p-2 border rounded-md text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sectional' && (
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-4">
                    {sections.map(section => (
                      <div key={section.id} className={`p-3 border rounded-lg ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <label className="block text-xs font-bold mb-2 uppercase text-indigo-500">{section.name}</label>
                        <input
                          type="number"
                          value={section.time}
                          onChange={(e) => handleSectionTimeChange(section.id, e.target.value)}
                          placeholder="Time (Mins)"
                          className={`w-full p-2 border rounded-md text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Assign Subjects to Sections
                    </label>
                    {loadingSubjects ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {subjects.map(subject => (
                          <div key={subject.id} className={`flex items-center justify-between p-2 rounded border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
                            <span className="text-sm font-medium">{subject.subject_name}</span>
                            <select
                              value={subject.section_number}
                              onChange={(e) => handleSubjectSectionChange(subject.id, e.target.value)}
                              className={`p-1.5 border rounded-md text-xs ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                            >
                              <option value="">No Section</option>
                              <option value="1">Section 1</option>
                              <option value="2">Section 2</option>
                              <option value="3">Section 3</option>
                              <option value="4">Section 4</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onClose}
                className={`px-4 py-2 text-sm rounded-md ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loadingSubjects}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center justify-center w-28 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>

          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  // --- END: TimeSettingsModal component ---

  const StatCard = React.memo(({ icon: Icon, title, value, color = 'blue', loading = false }) => (
    <div
      className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow duration-200 ${isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
        }`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
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
    </div>
  ));



  const filteredTestSeries = useMemo(() => {
    return testSeries.filter(item => {
      return (
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterCategory === '' || item.category === filterCategory)
      );
    });
  }, [testSeries, searchTerm, filterCategory]);

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium">{error}</div>
            <button
              onClick={fetchTestSeries}
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

  return (
    <AdminLayout>
      <style>{`
        /* Quill Editor Global Fixes */
        .ql-container.ql-snow {
          border-color: #D1D5DB !important;
          background-color: #FFFFFF !important;
        }
        .dark .ql-container.ql-snow {
          border-color: #4B5563 !important;
          background-color: #374151 !important;
        }
        .ql-toolbar.ql-snow {
          border-color: #D1D5DB !important;
          background-color: #FFFFFF !important;
        }
        .dark .ql-toolbar.ql-snow {
          border-color: #4B5563 !important;
          background-color: #374151 !important;
        }
        .ql-editor {
          color: #111827 !important;
          min-height: 80px;
          max-height: 180px;
          overflow-y: auto !important;
        }
        .dark .ql-editor {
          color: #F9FAFB !important;
        }
        .ql-editor.ql-blank::before {
          color: #6B7280 !important;
        }
        .dark .ql-editor.ql-blank::before {
          color: #9CA3AF !important;
        }
        .ql-snow .ql-stroke {
          stroke: #374151 !important;
        }
        .dark .ql-snow .ql-stroke {
          stroke: #F9FAFB !important;
        }
        .ql-snow .ql-fill {
          fill: #374151 !important;
        }
        .dark .ql-snow .ql-fill {
          fill: #F9FAFB !important;
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label::before,
        .ql-snow .ql-picker.ql-header .ql-picker-label {
          color: #374151 !important;
        }
        .dark .ql-snow .ql-picker.ql-header .ql-picker-label::before,
        .dark .ql-snow .ql-picker.ql-header .ql-picker-label {
          color: #F9FAFB !important;
        }
        .ql-snow .ql-picker-options {
          background-color: #FFFFFF !important;
          color: #374151 !important;
          border-color: #D1D5DB !important;
        }
        .dark .ql-snow .ql-picker-options {
          background-color: #1F2937 !important;
          color: #F9FAFB !important;
          border-color: #4B5563 !important;
        }
        .ql-snow .ql-picker-item {
          color: inherit !important;
        }

        /* Custom Palette Buttons for ReactQuill */
        .ql-palette-nv:after { content: "1" !important; font-weight: bold !important; color: #6b7280 !important; }
        .ql-palette-na:after { content: "2" !important; font-weight: bold !important; color: #cc0000 !important; }
        .ql-palette-ans:after { content: "3" !important; font-weight: bold !important; color: #15803d !important; }
        .ql-palette-mr:after { content: "4" !important; font-weight: bold !important; color: #7b1fa2 !important; }
        .ql-palette-amr:after { content: "5" !important; font-weight: bold !important; color: #4f46e5 !important; }

        .dark .ql-palette-nv:after { color: #9ca3af !important; }
        .dark .ql-palette-na:after { color: #f87171 !important; }
        .dark .ql-palette-ans:after { color: #4ade80 !important; }
        .dark .ql-palette-mr:after { color: #c084fc !important; }
        .dark .ql-palette-amr:after { color: #818cf8 !important; }

        .exam-icon-ans {
          display: inline-block !important;
          width: 28px !important;
          height: 28px !important;
          background-color: #15803d !important;
          border: 1px solid #15803d !important;
          text-align: center !important;
          line-height: 28px !important;
          font-weight: bold !important;
          font-size: 12px !important;
          color: white !important;
          margin-right: 8px !important;
          border-radius: 8px 8px 0 0 !important;
        }

        .exam-icon-amr {
          display: inline-block !important;
          width: 28px !important;
          height: 28px !important;
          background-color: #7b1fa2 !important;
          border: 1px solid #7b1fa2 !important;
          text-align: center !important;
          line-height: 28px !important;
          font-weight: bold !important;
          font-size: 12px !important;
          color: white !important;
          margin-right: 8px !important;
          border-radius: 50% !important;
        }

        /* Force palette icons generated in the rich text editor to display inline-block right next to description text */
        .ql-editor img[width="28"][height="28"],
        img[width="28"][height="28"] {
          display: inline-block !important;
          vertical-align: middle !important;
          margin: 0 8px 0 4px !important;
        }
      `}</style>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            icon={BookOpen}
            title="Total Test Series"
            value={testSeries.length}
            color="blue"
            loading={loading}
          />
          <StatCard
            icon={CheckCircle}
            title="Categories"
            value={categories.length}
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
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>Test Series Management</h2>
                <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Create and manage online test series</p>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                <button
                  onClick={() => {
                    fetchTestSeries();
                    fetchCategories();
                    showSuccessToast('Data refreshed successfully!');
                  }}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors text-sm border ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Category Bar</span>
                  <span className="sm:hidden">Category</span>
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center justify-center space-x-2 bg-[#3936C9] text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-[#2D2B9E] transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Test</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="relative sm:col-span-2 md:col-span-2">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                <input
                  type="text"
                  placeholder="Search test series..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`w-full px-3 py-2 md:px-4 md:py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                }}
                className={`flex items-center justify-center space-x-2 px-3 py-2 md:px-4 md:py-2 text-sm border rounded-lg transition-colors sm:col-span-2 md:col-span-1 ${isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Filter className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4 md:p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`animate-pulse flex space-x-4 p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                      <div className={`rounded w-12 h-12 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}></div>
                      <div className="flex-1 space-y-2">
                        <div className={`h-4 rounded w-3/4 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                          }`}></div>
                        <div className={`h-4 rounded w-1/2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                          }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <table className="w-full min-w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                      Test Series
                    </th>
                    <th className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                      Category
                    </th>
                    <th className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                      Price
                    </th>
                    <th className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'
                  }`}>
                  {filteredTestSeries.map((item) => (
                    <React.Fragment key={item.id}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                      >
                        <td className="px-3 py-4 md:px-6">
                          <div>
                            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                              {item.title}
                            </div>
                            <div className={`text-sm sm:hidden ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${isDarkMode
                                ? 'bg-blue-900 text-blue-200'
                                : 'bg-blue-100 text-blue-800'
                                }`}>
                                {item.category}
                              </span>
                            </div>
                            <div className={`text-sm hidden md:block ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                              Created: {item.createdDate}
                            </div>
                            <div className={`text-xs hidden md:block ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                              Updated: {item.lastUpdated}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 md:px-6 whitespace-nowrap hidden sm:table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isDarkMode
                            ? 'bg-blue-900 text-blue-200'
                            : 'bg-blue-100 text-blue-800'
                            }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-3 py-4 md:px-6 whitespace-nowrap hidden lg:table-cell">
                          <div className={`text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                            ₹{typeof item.price === 'number' ? item.price.toLocaleString('en-IN') : '0'}
                          </div>
                        </td>
                        <td className="px-3 py-4 md:px-6 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-1 md:space-x-2">
                            <button
                              onClick={() => toggleExamSets(item.id)}
                              className="text-green-600 hover:text-green-900"
                              title="View Exam Sets"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditForm(item)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(item)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                      {/* Exam Sets Dropdown */}
                      {showExamSets[item.id] && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan="4" className={`px-3 py-4 md:px-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  Exam Sets for {item.title}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => openAddExamForm(item.id)}
                                  className="flex items-center space-x-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span className="hidden sm:inline">Add Exam</span>
                                  <span className="sm:hidden">Exam</span>
                                </button>
                              </div>

                              {Array.isArray(examSets[item.id]) && examSets[item.id].length > 0 ? (
                                <div className="space-y-2">
                                  {/* Group exams by exam_name */}
                                  {Object.entries(
                                    (examSets[item.id] || []).reduce((acc, exam) => {
                                      if (!acc[exam.exam_name]) {
                                        acc[exam.exam_name] = { exam, sets: [] };
                                      }
                                      acc[exam.exam_name].sets.push({
                                        set_number: exam.set_number,
                                        subjects: exam.subjects || []
                                      });
                                      return acc;
                                    }, {})
                                  ).map(([examName, examData]) => (
                                    <div
                                      key={examName}
                                      className={`p-2 rounded border ${isDarkMode
                                        ? 'bg-gray-800 border-gray-600'
                                        : 'bg-white border-gray-200'
                                        }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex-1">
                                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {examName}
                                          </span>
                                          <span className={`ml-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            ({examData.sets.length} set{examData.sets.length !== 1 ? 's' : ''})
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-1 ml-2">
                                          <button
                                            onClick={() => openAddSetForm(examData.exam, item.id)}
                                            className="text-green-600 hover:text-green-900 p-1"
                                            title="Add Set"
                                          >
                                            <Plus className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => openEditExamForm(examData.exam)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                            title="Edit Exam"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => openDeleteExamConfirm(examData.exam)}
                                            className="text-red-600 hover:text-red-900 p-1"
                                            title="Delete Exam"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Sets dropdown */}
                                      <div className="space-y-1">
                                        {examSets[item.id]
                                          ?.filter(exam => exam.exam_name === examName)
                                          .map((set, setIndex) => (
                                            <div
                                              key={setIndex}
                                              className={`p-1.5 rounded text-xs ${isDarkMode
                                                ? 'bg-gray-700 border-gray-500'
                                                : 'bg-gray-50 border-gray-200'
                                                } border`}
                                            >
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                    {set.set_name ? set.set_name : `Set ${set.set_number}`}
                                                  </span>
                                                  <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${Number(set.is_paid) === 1
                                                      ? isDarkMode
                                                        ? 'bg-blue-900 text-blue-100'
                                                        : 'bg-blue-100 text-blue-800'
                                                      : isDarkMode
                                                        ? 'bg-green-900 text-green-100'
                                                        : 'bg-green-100 text-green-800'
                                                      }`}
                                                  >
                                                    {Number(set.is_paid) === 1 ? 'PAID' : 'FREE'}
                                                  </span>
                                                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    ({set.subjects.length} subject{set.subjects.length !== 1 ? 's' : ''})
                                                  </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                  <button
                                                    onClick={() => {
                                                      setSelectedSetForQuestions(set);
                                                      setShowSetQuestionsModal(true);
                                                    }}
                                                    className="text-orange-500 hover:text-orange-700 p-0.5 transition-colors"
                                                    title="View Set Questions"
                                                  >
                                                    <HelpCircle className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => openInstructionsModal(set)}
                                                    className="text-purple-500 hover:text-purple-700 p-0.5 transition-colors"
                                                    title="Add Instructions"
                                                  >
                                                    <BookOpen className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setSelectedSetForOverview(set);
                                                      setShowOverviewModal(true);
                                                    }}
                                                    className="text-indigo-500 hover:text-indigo-700 p-0.5 transition-colors"
                                                    title="File Overview"
                                                  >
                                                    <FileText className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => openNegativeMarkingModal(set)}
                                                    className="text-red-500 hover:text-red-700 p-0.5 transition-colors"
                                                    title="Negative Marking"
                                                  >
                                                    <MinusSquare className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setSelectedSetForCategory(set);
                                                      setShowCategoryPopup(true);
                                                    }}
                                                    className="text-indigo-500 hover:text-indigo-700 p-0.5 transition-colors"
                                                    title="Category Numbers"
                                                  >
                                                    <Users className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => openSubjectMarksModal(set)}
                                                    className="text-emerald-500 hover:text-emerald-700 p-0.5 transition-colors"
                                                    title="Subject Marks"
                                                  >
                                                    <List className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleOpenTimeModal(set, item.id)}
                                                    className="text-cyan-500 hover:text-cyan-700 p-0.5 transition-colors"
                                                    title="Set Time"
                                                  >
                                                    <Clock className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => openEditSetForm(set, item.id)}
                                                    className="text-blue-500 hover:text-blue-700 p-0.5 transition-colors"
                                                    title="Edit Set"
                                                  >
                                                    <Edit3 className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => openDeleteSetConfirm(set, item.id)}
                                                    className="text-red-500 hover:text-red-700 p-0.5 transition-colors"
                                                    title="Delete Set"
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </button>
                                                </div>
                                              </div>
                                              {set.subjects && Array.isArray(set.subjects) && set.subjects.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  {set.subjects
                                                    .filter(subject => {
                                                      try {
                                                        return subject && (typeof subject === 'string' || (typeof subject === 'object' && subject.name));
                                                      } catch {
                                                        return false;
                                                      }
                                                    })
                                                    .map((subject, subIndex) => {
                                                      try {
                                                        const subjectName = typeof subject === 'string' ? subject : subject?.name || String(subject);
                                                        return (
                                                          <span
                                                            key={`subject-${subIndex}-${subjectName}`}
                                                            className={`px-1.5 py-0.5 text-xs rounded ${isDarkMode
                                                              ? 'bg-blue-900 text-blue-200'
                                                              : 'bg-blue-100 text-blue-800'
                                                              }`}
                                                          >
                                                            {subjectName}
                                                          </span>
                                                        );
                                                      } catch {
                                                        return null;
                                                      }
                                                    })
                                                    .filter(Boolean)}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className={`text-center py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  No exam sets found. Click "Add Exam" to create one.
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filteredTestSeries.length === 0 && !loading && (
            <div className="text-center py-12">
              <BookOpen className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>
                No test series found
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                {searchTerm || filterCategory
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by creating a new test series.'
                }
              </p>
            </div>
          )}
        </motion.div>

        {/* Categories Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl shadow-sm border ${isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
            }`}
        >
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>Categories Management</h2>
                <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Manage course categories</p>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="p-4 md:p-6">
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No categories available. Create one to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-4 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                      } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                          {category.name}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          {testSeries.filter(ts => ts.category === category.name).length} courses
                        </p>
                      </div>
                      <button
                        onClick={() => openCategoryDeleteConfirm(category)}
                        className="ml-2 text-red-600 hover:text-red-800 p-1 rounded"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Chapter and Topic Management Section */}
        <ChapterandTopicManagement
          testSeries={testSeries}
          isDarkMode={isDarkMode}
          showSuccessToast={showSuccessToast}
        />

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Add New Test Series</h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setCourseFormData({
                        title: '',
                        category_id: '',
                        description: '',
                        image: null,
                        price: '',
                        price_six_months: ''
                      });
                    }}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Test Series Title"
                    value={courseFormData.title}
                    onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  />
                  <select
                    value={courseFormData.category_id}
                    onChange={(e) => setCourseFormData({ ...courseFormData, category_id: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ReactQuill
                    value={courseFormData.description}
                    onChange={(value) => setCourseFormData({ ...courseFormData, description: value })}
                    modules={quillModules}
                    formats={quillFormats}
                    theme="snow"
                    placeholder="Description (optional)"
                    className="w-full rounded-lg"
                  />
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Course Image (optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCourseFormData({ ...courseFormData, image: e.target.files[0] })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3'
                        : 'bg-white border-gray-300 file:bg-gray-100 file:text-gray-700 file:border-0 file:rounded file:px-3 file:py-1 file:mr-3'
                        }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      1 Year Pricing
                    </label>
                    <input
                      type="number"
                      placeholder="1 Year Pricing"
                      value={courseFormData.price}
                      onChange={(e) => setCourseFormData({ ...courseFormData, price: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      6 Months Pricing
                    </label>
                    <input
                      type="number"
                      placeholder="6 Months Pricing"
                      value={courseFormData.price_six_months}
                      onChange={(e) => setCourseFormData({ ...courseFormData, price_six_months: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setCourseFormData({
                        title: '',
                        category_id: '',
                        description: '',
                        image: null,
                        price: '',
                        price_six_months: ''
                      });
                    }}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTestSeries}
                    disabled={!courseFormData.title || !courseFormData.category_id}
                    className="px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Add Test Series</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Form Modal */}
        {showEditForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Edit Test Series</h3>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedTestSeries(null);
                      setCourseFormData({
                        title: '',
                        category_id: '',
                        description: '',
                        image: null,
                        price: '',
                        price_six_months: ''
                      });
                    }}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Test Series Title"
                    value={courseFormData.title}
                    onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  />
                  <select
                    value={courseFormData.category_id}
                    onChange={(e) => setCourseFormData({ ...courseFormData, category_id: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ReactQuill
                    value={courseFormData.description}
                    onChange={(value) => setCourseFormData({ ...courseFormData, description: value })}
                    modules={quillModules}
                    formats={quillFormats}
                    theme="snow"
                    placeholder="Description (optional)"
                    className="w-full rounded-lg"
                  />
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Course Image (optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCourseFormData({ ...courseFormData, image: e.target.files[0] })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3'
                        : 'bg-white border-gray-300 file:bg-gray-100 file:text-gray-700 file:border-0 file:rounded file:px-3 file:py-1 file:mr-3'
                        }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      1 Year Pricing
                    </label>
                    <input
                      type="number"
                      placeholder="1 Year Pricing"
                      value={courseFormData.price}
                      onChange={(e) => setCourseFormData({ ...courseFormData, price: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      6 Months Pricing
                    </label>
                    <input
                      type="number"
                      placeholder="6 Months Pricing"
                      value={courseFormData.price_six_months}
                      onChange={(e) => setCourseFormData({ ...courseFormData, price_six_months: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedTestSeries(null);
                      setCourseFormData({
                        title: '',
                        category_id: '',
                        description: '',
                        image: null,
                        price: '',
                        price_six_months: ''
                      });
                    }}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditTestSeries}
                    disabled={!courseFormData.title || !courseFormData.category_id}
                    className="px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Update Test Series</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedTestSeries && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold text-red-600`}>Delete Test Series</h3>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedTestSeries(null);
                    }}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-6">
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Are you sure you want to delete "{selectedTestSeries.title}"?
                  </p>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedTestSeries(null);
                    }}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteTestSeries}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Add Category</h3>
                  <button
                    onClick={() => {
                      setShowCategoryForm(false);
                      setCategoryFormData({ name: '' });
                    }}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCategoryForm(false);
                      setCategoryFormData({ name: '' });
                    }}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    disabled={!categoryFormData.name.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Category Delete Confirmation Modal */}
        {showCategoryDeleteConfirm && selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold text-red-600`}>Delete Category</h3>
                  <button
                    onClick={() => {
                      setShowCategoryDeleteConfirm(false);
                      setSelectedCategory(null);
                    }}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-6">
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Are you sure you want to delete the category "{selectedCategory.name}"?
                  </p>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    All courses in this category will become uncategorized. This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCategoryDeleteConfirm(false);
                      setSelectedCategory(null);
                    }}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCategory}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Exam Form Modal */}
        {showAddExamForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-lg shadow-lg my-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Add Exam</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddExamForm(false);
                      setSelectedCourseForExam(null);
                      setExamFormData({ exam_name: '', set_number: '', subjects: [''] });
                      setError('');
                    }}
                    className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (examFormData.exam_name.trim()) {
                      handleAddExam();
                    }
                  }}
                  className="space-y-4"
                >
                  {error && (
                    <div className={`p-3 rounded-lg text-sm flex items-start space-x-2 ${isDarkMode
                      ? 'bg-red-900 bg-opacity-30 border border-red-700 text-red-300'
                      : 'bg-red-50 border border-red-200 text-red-700'
                      }`}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Exam Name</label>
                    <input
                      type="text"
                      placeholder="e.g., SSC CGL 2025"
                      value={examFormData.exam_name}
                      onChange={(e) => setExamFormData({ ...examFormData, exam_name: e.target.value })}
                      autoFocus
                      className={`w-full px-3 py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                    />
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      You'll be able to add sets and subjects after creating the exam
                    </p>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddExamForm(false);
                        setSelectedCourseForExam(null);
                        setExamFormData({ exam_name: '' });
                        setError('');
                      }}
                      className={`px-4 py-2 rounded-lg border transition-colors ${isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!examFormData.exam_name.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Add Exam</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Exam Form Modal */}
        {showEditExamForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Edit Exam</h3>
                  <button
                    onClick={() => {
                      setShowEditExamForm(false);
                      setSelectedExamForEdit(null);
                      setExamFormData({ exam_name: '' });
                    }}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Exam Name"
                    value={examFormData.exam_name}
                    onChange={(e) => setExamFormData({ ...examFormData, exam_name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditExamForm(false);
                      setSelectedExamForEdit(null);
                      setExamFormData({ exam_name: '' });
                    }}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditExam}
                    disabled={!examFormData.exam_name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Update Exam</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Exam Confirmation Modal */}
        {showDeleteExamConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Delete Exam</h3>
                </div>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  Are you sure you want to delete "{selectedExamForEdit?.exam_name}"? This action cannot be undone and will also delete all associated subjects.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteExamConfirm(false);
                      setSelectedExamForEdit(null);
                    }}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteExam}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Set Form Modal */}
        {showAddSetForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Add Set to "{selectedExamForSet?.exam_name}"</h3>
                  <button
                    onClick={() => {
                      setShowAddSetForm(false);
                      setSelectedExamForSet(null);
                      setSetFormState({ exam_name: '', set_number: '', set_name: '', is_paid: 0, subjects: [''] });
                    }}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Set Number"
                    min="1"
                    value={setFormState.set_number}
                    onChange={(e) => setSetFormState({ ...setFormState, set_number: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  />

                  <input
                    type="text"
                    placeholder="Set Name (e.g., Mock Test 1)"
                    value={setFormState.set_name || ''}
                    onChange={(e) => setSetFormState({ ...setFormState, set_name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  />

                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Set Type
                    </label>
                    <div className="flex flex-wrap gap-4 md:gap-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="setType"
                          value="0"
                          checked={setFormState.is_paid === 0}
                          onChange={(e) => setSetFormState({ ...setFormState, is_paid: parseInt(e.target.value) })}
                          className="mr-2 text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          FREE
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="setType"
                          value="1"
                          checked={setFormState.is_paid === 1}
                          onChange={(e) => setSetFormState({ ...setFormState, is_paid: parseInt(e.target.value) })}
                          className="mr-2 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          PAID
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Subjects
                      </label>
                      <button
                        onClick={handleAddSubjectField}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Subject</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {setFormState.subjects.map((subject, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Subject name"
                            value={subject}
                            onChange={(e) => handleUpdateSubject(index, e.target.value)}
                            className={`flex-1 px-2 py-1 text-sm border rounded ${isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          />
                          {setFormState.subjects.length > 1 && (
                            <button
                              onClick={() => handleRemoveSubjectField(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAddSetForm(false);
                      setSelectedExamForSet(null);
                      setSetFormState({ exam_name: '', set_number: '', set_name: '', is_paid: 0, subjects: [''] });
                    }}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSet}
                    disabled={!String(setFormState.set_number).trim() || !String(setFormState.set_name).trim() || !setFormState.subjects.some(s => String(s).trim())}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Add Set</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Set Form Modal */}
        {showEditSetForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Edit Set</h3>
                  <button
                    onClick={() => {
                      setShowEditSetForm(false);
                      setSelectedSetForEdit(null);
                      setSetFormState({ exam_name: '', set_number: '', set_name: '', is_paid: 0, subjects: [''] });
                    }}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Exam Name"
                    value={setFormState.exam_name || ''}
                    disabled
                    className={`w-full px-3 py-2 border rounded-lg cursor-not-allowed ${isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-500'
                      }`}
                  />
                  <input
                    type="number"
                    placeholder="Set Number"
                    min="1"
                    value={setFormState.set_number}
                    onChange={(e) => setSetFormState({ ...setFormState, set_number: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  />

                  <input
                    type="text"
                    placeholder="Set Name"
                    value={setFormState.set_name || ''}
                    onChange={(e) => setSetFormState({ ...setFormState, set_name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  />

                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Set Type
                    </label>
                    <div className="flex space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="setType"
                          value="0"
                          checked={setFormState.is_paid === 0}
                          onChange={(e) => setSetFormState({ ...setFormState, is_paid: parseInt(e.target.value) })}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          FREE
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="setType"
                          value="1"
                          checked={setFormState.is_paid === 1}
                          onChange={(e) => setSetFormState({ ...setFormState, is_paid: parseInt(e.target.value) })}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          PAID
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Subjects
                      </label>
                      <button
                        onClick={handleAddSubjectField}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Subject</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {setFormState.subjects.map((subject, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Subject name"
                            value={subject}
                            onChange={(e) => handleUpdateSubject(index, e.target.value)}
                            className={`flex-1 px-2 py-1 text-sm border rounded ${isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          />
                          {setFormState.subjects.length > 1 && (
                            <button
                              onClick={() => handleRemoveSubjectField(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditSetForm(false);
                      setSelectedSetForEdit(null);
                      setSetFormState({ exam_name: '', set_number: '', set_name: '', is_paid: 0, subjects: [''] });
                    }}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSet}
                    disabled={!String(setFormState.set_number).trim() || !String(setFormState.set_name).trim() || !setFormState.subjects.some(s => String(s).trim())}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Update Set</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Set Confirmation Modal */}
        {showDeleteSetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Delete Set</h3>
                </div>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  Are you sure you want to delete Set {selectedSetForDelete?.set_number} from "{selectedSetForDelete?.exam_name}"? This action cannot be undone and will also delete all associated subjects.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteSetConfirm(false);
                      setSelectedSetForDelete(null);
                    }}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteSet}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Set</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <SetQuestions
          isOpen={showSetQuestionsModal}
          onClose={() => {
            setShowSetQuestionsModal(false);
            setSelectedSetForQuestions(null);
          }}
          setData={selectedSetForQuestions}
        />

        <TimeSettingsModal
          set={selectedSetForTime}
          show={showTimeModal}
          onClose={() => {
            setSelectedSetForTime(null);
            setSelectedCourseForTime(null);
            setShowTimeModal(false);
          }}
          onSave={(message, type) => {
            if (type === 'success') {
              showSuccessToast(message);
              // Refresh exam sets for this course so changes reflect immediately
              if (selectedCourseForTime) {
                setExamSets(prev => ({ ...prev, [selectedCourseForTime]: undefined }));
                fetchExamSetsByCategory(selectedCourseForTime);
              }
            } else {
              setToast({ message, type: 'error' });
              setTimeout(() => setToast(null), 5000);
            }
            fetchTestSeries(); // Still refresh main list
          }}
        />

        {/* Instructions Modal */}
        {showInstructionsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-4xl rounded-lg shadow-lg max-h-[90vh] overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    Instructions for Set {selectedSetForInstructions?.set_number} - {selectedSetForInstructions?.exam_name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowInstructionsModal(false);
                      setSelectedSetForInstructions(null);
                      setInstructionsData({
                        title_english: '',
                        instruction_english: '',
                        title_hindi: '',
                        instruction_hindi: ''
                      });
                      setInstructionsTwo({
                        test_duration: '',
                        total_marks: '',
                        instruction_two_english: '',
                        instruction_two_hindi: '',
                        red_warning_english: '',
                        red_warning_hindi: '',
                        declaration_english: '',
                        declaration_hindi: '',
                        image_content: ''
                      });
                    }}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Carousel Navigation */}
                <div className="flex mt-4 space-x-1">
                  <button
                    onClick={() => setCurrentInstructionTab('instructions1')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentInstructionTab === 'instructions1'
                      ? 'bg-purple-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Instructions 1
                  </button>
                  <button
                    onClick={() => setCurrentInstructionTab('instructions2')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentInstructionTab === 'instructions2'
                      ? 'bg-purple-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Instructions 2
                  </button>
                  <button
                    onClick={() => setCurrentInstructionTab('instructions3')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentInstructionTab === 'instructions3'
                      ? 'bg-purple-600 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    SSC Instruction 3
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-4 md:p-6 max-h-[calc(90vh-160px)] overflow-y-auto">
                {currentInstructionTab === 'instructions1' ? (
                  <TestSeriesInstructionsOne
                    instructionsData={instructionsData}
                    setInstructionsData={setInstructionsData}
                  />
                ) : currentInstructionTab === 'instructions2' ? (
                  <TestSeriesInstructionsTwo
                    instructionsData={instructionsTwo}
                    setInstructionsData={setInstructionsTwo}
                  />
                ) : (
                  <SSCTestSeriesInstructionsThree
                    instructionsData={instructionsThreeData}
                    setInstructionsData={setInstructionsThreeData}
                  />
                )}
              </div>

              {/* Modal Footer */}
              {currentInstructionTab === 'instructions1' && (
                <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowInstructionsModal(false);
                        setSelectedSetForInstructions(null);
                        setInstructionsData({
                          title_english: '',
                          instruction_english: '',
                          title_hindi: '',
                          instruction_hindi: ''
                        });
                        setInstructionsTwo({
                          test_duration: '',
                          total_marks: '',
                          instruction_two_english: '',
                          instruction_two_hindi: '',
                          red_warning_english: '',
                          red_warning_hindi: '',
                          declaration_english: '',
                          declaration_hindi: '',
                          image_content: ''
                        });
                      }}
                      className={`px-4 py-2 rounded-lg border ${isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveInstructions}
                      disabled={(() => {
                        const stripHtml = (html) => {
                          const temp = document.createElement("div");
                          temp.innerHTML = html;
                          return temp.textContent || temp.innerText || "";
                        };
                        const hasText = stripHtml(instructionsData.instruction_english).trim();
                        const hasImages = instructionsData.instruction_english.includes('<img');
                        return !hasText && !hasImages;
                      })()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Instructions</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Footer for Instructions 2 */}
              {currentInstructionTab === 'instructions2' && (
                <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowInstructionsModal(false)}
                      className={`px-4 py-2 rounded-lg border ${isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveInstructionsTwo}
                      disabled={!String(instructionsTwo.test_duration).trim() || !String(instructionsTwo.total_marks).trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Instructions</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Footer for Instructions 3 */}
              {currentInstructionTab === 'instructions3' && (
                <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowInstructionsModal(false);
                        setSelectedSetForInstructions(null);
                        setInstructionsData({
                          title_english: '',
                          instruction_english: '',
                          title_hindi: '',
                          instruction_hindi: ''
                        });
                        setInstructionsTwo({
                          test_duration: '',
                          total_marks: '',
                          instruction_two_english: '',
                          instruction_two_hindi: '',
                          red_warning_english: '',
                          red_warning_hindi: '',
                          declaration_english: '',
                          declaration_hindi: '',
                          image_content: ''
                        });
                        setInstructionsThreeData({
                          instruction_english: '',
                          instruction_hindi: ''
                        });
                      }}
                      className={`px-4 py-2 rounded-lg border ${isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveInstructionsThree}
                      disabled={(() => {
                        const stripHtml = (html) => {
                          const temp = document.createElement("div");
                          temp.innerHTML = html;
                          return temp.textContent || temp.innerText || "";
                        };
                        const hasText = stripHtml(instructionsThreeData.instruction_english).trim();
                        const hasImages = instructionsThreeData.instruction_english.includes('<img');
                        return !hasText && !hasImages;
                      })()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Instructions</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Overview Modal */}
        {showOverviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-4xl rounded-lg shadow-lg max-h-[90vh] overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-indigo-500" />
                    <h3 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      Set Overview: {selectedSetForOverview?.set_name || `Set ${selectedSetForOverview?.set_number}`}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowOverviewModal(false);
                      setSelectedSetForOverview(null);
                    }}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-4 md:p-6">
                <SSCTestSeriesInstructionsFour
                  examSetId={selectedSetForOverview?.id}
                />
              </div>

              {/* Modal Footer */}
              <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowOverviewModal(false);
                      setSelectedSetForOverview(null);
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Negative & Positive Marking Modal */}
        {showNegativeMarkingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MinusSquare className="w-6 h-6 text-red-500" />
                    <h3 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      Marking Configuration
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowNegativeMarkingModal(false)}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {isFetchingNegativeMarking ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-4" />
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Fetching current values...</p>
                  </div>
                ) : (
                  <>
                    <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Set the marking values for {selectedSetForNegativeMarking?.set_name || `Set ${selectedSetForNegativeMarking?.set_number}`}.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Negative Marks (per wrong answer)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={negativeMarkingValue}
                          onChange={(e) => setNegativeMarkingValue(e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none transition-all ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                            }`}
                          placeholder="e.g. 0.25, 0.5"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Positive Marks (per correct answer)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={positiveMarkingValue}
                          onChange={(e) => setPositiveMarkingValue(e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none transition-all ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                            }`}
                          placeholder="e.g. 1, 1.5"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowNegativeMarkingModal(false)}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNegativeMarking}
                    disabled={isSavingNegativeMarking}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    {isSavingNegativeMarking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSavingNegativeMarking ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Subject Marks Modal */}
        {showSubjectMarksModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                    <List className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Subject Wise Maximum Marks
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedSetForSubjectMarks?.set_name || `Set ${selectedSetForSubjectMarks?.set_number}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubjectMarksModal(false)}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 md:p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {isFetchingSubjectMarks ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading subject data...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subjectMarksData.length === 0 ? (
                      <div className={`text-center py-10 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                        <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No subjects added yet.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {subjectMarksData.map((subject, index) => (
                          <motion.div
                            layout
                            key={index}
                            className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                              }`}
                          >
                            <div className="flex flex-wrap md:flex-nowrap items-end gap-4">
                              <div className="flex-1 min-w-[200px]">
                                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                  Subject Name
                                </label>
                                <div className={`px-4 py-2.5 rounded-lg border ${isDarkMode
                                  ? 'bg-gray-800 border-gray-700 text-gray-300'
                                  : 'bg-gray-100 border-gray-200 text-gray-700'
                                  } font-medium`}>
                                  {subject.subject_name}
                                </div>
                              </div>
                              <div className="w-full md:w-48">
                                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                  Marks
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={subject.sub_marks}
                                  onChange={(e) => handleSubjectMarksChange(index, 'sub_marks', e.target.value)}
                                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${isDarkMode
                                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                    }`}
                                  placeholder="0.0"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={`p-4 md:p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowSubjectMarksModal(false)}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSubjectMarks}
                    disabled={isSavingSubjectMarks || isFetchingSubjectMarks}
                    className={`px-8 py-2.5 rounded-xl font-bold text-white flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 ${isSavingSubjectMarks
                      ? 'bg-emerald-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:transform active:scale-95'
                      }`}
                  >
                    {isSavingSubjectMarks ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <CategoryPopup
          isOpen={showCategoryPopup}
          onClose={() => {
            setShowCategoryPopup(false);
            setSelectedSetForCategory(null);
          }}
          examSetId={selectedSetForCategory?.id}
          onSaveSuccess={(msg) => showSuccessToast(msg)}
        />

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <div className="fixed top-4 right-4 z-50">
              <motion.div
                initial={{ opacity: 0, y: -50, x: 50 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -50, x: 50 }}
                className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg
                        max-w-sm w-full sm:w-auto min-w-[300px]
                        ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
                      `}
              >
                {toast.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {toast.type === 'success' ? 'Success' : 'Error'}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => setToast(null)}
                  className={`
                          p-1 rounded-full transition-colors
                          ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}
                        `}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminTestSeriesPage;
