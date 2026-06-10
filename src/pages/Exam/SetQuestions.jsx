import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Edit2, BookOpen, FileText, Search, Eye, Save, Loader2, Mic, Languages } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../components/ui/use-toast';
import axios from 'axios';
import { useSpeechToText, translateToHindi } from '../../Admin Test Series Components/TranslateLogic';
import { useAuth } from '../../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_BASE_URL;

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
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'align', 'link', 'image', 'blockquote'
];

const SetQuestions = ({ isOpen, onClose, setData }) => {
  const { isDarkMode } = useTheme();
  const { adminUser } = useAuth();

  const checkPermission = (action = 'delete') => {
    if (adminUser?.role === 'test_teacher') {
      toast({
        title: "Access Denied",
        description: `Teachers cannot ${action} questions.`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };


  // Refs for Quill editors - English
  const quillEnglishQuestionRef = useRef(null);
  const quillEnglishOptionARef = useRef(null);
  const quillEnglishOptionBRef = useRef(null);
  const quillEnglishOptionCRef = useRef(null);
  const quillEnglishOptionDRef = useRef(null);
  const quillEnglishOptionERef = useRef(null);
  const quillEnglishDetailRef = useRef(null);
  const quillPassageEnglishDetailRef = useRef(null);


  // Refs for Quill editors - Hindi
  const quillHindiQuestionRef = useRef(null);
  const quillHindiOptionARef = useRef(null);
  const quillHindiOptionBRef = useRef(null);
  const quillHindiOptionCRef = useRef(null);
  const quillHindiOptionDRef = useRef(null);
  const quillHindiOptionERef = useRef(null);
  const quillHindiDetailRef = useRef(null);
  const quillPassageHindiDetailRef = useRef(null);

  // Refs for Quill editors - Passage
  const quillPassageEnglishRef = useRef(null);
  const quillPassageHindiRef = useRef(null);

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBilingualModal, setShowBilingualModal] = useState(false);
  const [subjects, setSubjects] = useState([]);

  // Topic selection state
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [topicSearchTerm, setTopicSearchTerm] = useState('');
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [chapterTopics, setChapterTopics] = useState({}); // { chapterId: [topics] }
  const [isFetchingChapters, setIsFetchingChapters] = useState(false);
  const [questionSearchTerm, setQuestionSearchTerm] = useState('');
  const [subQuestionSearchTerm, setSubQuestionSearchTerm] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [totalAdded, setTotalAdded] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'question' | 'subquestion'
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState(null);

  // Subject Overview state
  const [showSubjectOverview, setShowSubjectOverview] = useState(false);
  const [subjectOverviewData, setSubjectOverviewData] = useState(null);
  const [isFetchingOverview, setIsFetchingOverview] = useState(false);

  const fetchSubjectOverview = useCallback(async (subjectId) => {
    if (!subjectId) return;
    setIsFetchingOverview(true);
    try {
      const response = await axios.get(`${BASE_URL}api/Questions/get_subject_overview.php?subject_id=${subjectId}`);
      if (response.data.success) {
        setSubjectOverviewData(response.data.data);
        setShowSubjectOverview(true);
      } else {
        toast({ title: "Error", description: response.data.message || "Failed to fetch overview", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error fetching subject overview:', error);
      toast({ title: "Error", description: "An error occurred while fetching overview", variant: "destructive" });
    } finally {
      setIsFetchingOverview(false);
    }
  }, [BASE_URL]);

  const fetchAllQuestions = useCallback(async () => {
    if (!setData?.id) return;
    try {
      const response = await axios.get(`${BASE_URL}api/Questions/get_questions.php?exam_set_id=${setData.id}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        let count = 0;
        response.data.data.forEach(item => {
          if (item.question_type === 'passage') {
            count += parseInt(item.sub_questions_count || 0);
          } else {
            count++;
          }
        });

        setTotalAdded(count);
      }
    } catch (error) {
      console.error('Error fetching all questions for set:', error);
    }
  }, [setData?.id, BASE_URL]);

  useEffect(() => {
    if (isOpen && setData?.id) {
      fetchAllQuestions();
    }
  }, [isOpen, setData?.id, fetchAllQuestions]);

  // Fetch chapters
  const fetchChapters = useCallback(async () => {
    setIsFetchingChapters(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ChapterandTopicManagement/get_chapters.php`);
      const data = await response.json();
      if (data.success) {
        setChapters(data.chapters);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setIsFetchingChapters(false);
    }
  }, []);

  // Fetch topics for a chapter
  const fetchChapterTopics = useCallback(async (chapterId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ChapterandTopicManagement/get_topics.php?chapter_id=${chapterId}`);
      const data = await response.json();
      if (data.success) {
        setChapterTopics(prev => ({ ...prev, [chapterId]: data.topics }));
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  }, []);

  // Filtered topics for search
  const filteredTopics = useMemo(() => {
    if (!topicSearchTerm.trim()) return [];

    // Combine all loaded topics and filter by search term
    const allLoadedTopics = Object.values(chapterTopics).flat();
    return allLoadedTopics.filter(topic =>
      topic.name.toLowerCase().includes(topicSearchTerm.toLowerCase())
    );
  }, [chapterTopics, topicSearchTerm]);

  // Load chapters when modal opens or topic selector is shown
  useEffect(() => {
    if (isOpen || showTopicSelector) {
      fetchChapters();
    }
  }, [isOpen, showTopicSelector, fetchChapters]);

  // Ensure setData has safe defaults
  const safeSetData = {
    exam_name: setData?.exam_name || 'N/A',
    set_number: setData?.set_number || 'N/A',
    id: setData?.id || null
  };

  // Helper function to get subject name by ID
  const getSubjectName = useCallback((subjectId) => {
    if (!subjectId) return '';
    const subject = subjects.find(s => {
      const id = typeof s === 'object' ? s.id : s;
      return id === subjectId;
    });
    if (typeof subject === 'object') {
      return subject.name;
    }
    return subject || '';
  }, [subjects]);

  // Load subjects when modal opens
  useEffect(() => {
    if (isOpen && setData) {
      console.log(`📥 Loading subjects from setData:`, setData?.subjects);

      // Load subjects from setData - ensure it's always a proper array
      try {
        if (Array.isArray(setData.subjects) && setData.subjects.length > 0) {
          // Validate each subject has id and name properties
          const validatedSubjects = setData.subjects.map(s => {
            if (typeof s === 'object' && s !== null && 'id' in s && 'name' in s) {
              return s;
            }
            return s;
          });
          setSubjects(validatedSubjects);
          console.log('✅ Subjects loaded:', validatedSubjects);
        } else {
          console.log('⚠️ No subjects available in setData');
          setSubjects([]);
        }
      } catch (error) {
        console.error('❌ Error loading subjects:', error);
        setSubjects([]);
      }
    } else if (!isOpen) {
      // Reset subjects when modal closes
      setSubjects([]);
      setSelectedSubject(null);
    }
  }, [isOpen, setData]);

  // English form state
  const [englishQuestion, setEnglishQuestion] = useState('');
  const [englishOptionA, setEnglishOptionA] = useState('');
  const [englishOptionB, setEnglishOptionB] = useState('');
  const [englishOptionC, setEnglishOptionC] = useState('');
  const [englishOptionD, setEnglishOptionD] = useState('');
  const [englishOptionE, setEnglishOptionE] = useState('');
  const [englishCorrectOption, setEnglishCorrectOption] = useState('A');
  const [englishDetail, setEnglishDetail] = useState('');

  // Hindi form state
  const [hindiQuestion, setHindiQuestion] = useState('');
  const [hindiOptionA, setHindiOptionA] = useState('');
  const [hindiOptionB, setHindiOptionB] = useState('');
  const [hindiOptionC, setHindiOptionC] = useState('');
  const [hindiOptionD, setHindiOptionD] = useState('');
  const [hindiOptionE, setHindiOptionE] = useState('');
  const [hindiCorrectOption, setHindiCorrectOption] = useState('A');
  const [hindiDetail, setHindiDetail] = useState('');

  // Passage form state
  const [questionType, setQuestionType] = useState('normal'); // 'normal' | 'passage'
  const [passageEnglish, setPassageEnglish] = useState('');
  const [passageHindi, setPassageHindi] = useState('');
  const [subQuestions, setSubQuestions] = useState([]);
  const [showSubQuestionForm, setShowSubQuestionForm] = useState(false);
  const [editingSubQuestionIndex, setEditingSubQuestionIndex] = useState(null);


  // Define fetchQuestions with useCallback BEFORE using it in useEffect
  const fetchQuestions = useCallback(async (subjectId) => {
    if (!subjectId) {
      console.log('⚠️ No subject ID provided');
      setQuestions([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log(`📥 Fetching questions for subject ${subjectId}`);
      const response = await axios.get(`${BASE_URL}api/Questions/get_questions.php?subject_id=${subjectId}`);

      if (response.data.success && Array.isArray(response.data.data)) {
        console.log(`✅ Fetched ${response.data.data.length} questions`);
        setQuestions(response.data.data);
      } else {
        console.log('⚠️ No questions found for subject');
        setQuestions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Voice to Text & Translation Handlers
  const handleVoiceTranscript = useCallback((setter) => (transcript) => {
    setter(prev => {
      const cleanPrev = prev.replace(/<\/p>$/, '');
      return cleanPrev === "" || cleanPrev === "<p>" || cleanPrev === "<p><br>"
        ? `<p>${transcript}</p>`
        : `${cleanPrev} ${transcript}</p>`;
    });
  }, []);

  const handleTranslate = async (englishText, setter) => {
    if (!englishText) {
      toast({ title: "Error", description: "No English text to translate", variant: "destructive" });
      return;
    }
    const loadingToast = toast({ title: "Translating...", description: "Please wait while we translate to Hindi" });
    const translated = await translateToHindi(englishText);
    setter(`<p>${translated}</p>`);
    toast({ title: "Success", description: "Translated successfully" });
  };

  const { isListening: isListeningQuestion, startListening: startListeningQuestion } = useSpeechToText(handleVoiceTranscript(setEnglishQuestion));
  const { isListening: isListeningOptionA, startListening: startListeningOptionA } = useSpeechToText(handleVoiceTranscript(setEnglishOptionA));
  const { isListening: isListeningOptionB, startListening: startListeningOptionB } = useSpeechToText(handleVoiceTranscript(setEnglishOptionB));
  const { isListening: isListeningOptionC, startListening: startListeningOptionC } = useSpeechToText(handleVoiceTranscript(setEnglishOptionC));
  const { isListening: isListeningOptionD, startListening: startListeningOptionD } = useSpeechToText(handleVoiceTranscript(setEnglishOptionD));
  const { isListening: isListeningOptionE, startListening: startListeningOptionE } = useSpeechToText(handleVoiceTranscript(setEnglishOptionE));
  const { isListening: isListeningDetail, startListening: startListeningDetail } = useSpeechToText(handleVoiceTranscript(setEnglishDetail));
  const { isListening: isListeningPassage, startListening: startListeningPassage } = useSpeechToText(handleVoiceTranscript(setPassageEnglish));

  // Fetch questions when subject changes
  useEffect(() => {
    if (selectedSubject && activeTab === 'questions') {
      fetchQuestions(selectedSubject);
    }
  }, [selectedSubject, activeTab, fetchQuestions]);

  const resetForm = () => {
    console.log('🔄 Resetting bilingual form');

    // English form reset
    setEnglishQuestion('');
    setEnglishOptionA('');
    setEnglishOptionB('');
    setEnglishOptionC('');
    setEnglishOptionD('');
    setEnglishOptionE('');
    setEnglishCorrectOption('A');
    setEnglishDetail('');

    // Hindi form reset
    setHindiQuestion('');
    setHindiOptionA('');
    setHindiOptionB('');
    setHindiOptionC('');
    setHindiOptionD('');
    setHindiOptionE('');
    setHindiCorrectOption('A');
    setHindiDetail('');

    // Passage form reset
    setQuestionType('normal');
    setPassageEnglish('');
    setPassageHindi('');
    setSubQuestions([]);
    setShowSubQuestionForm(false);
    setEditingSubQuestionIndex(null);

    // Topic reset
    setSelectedChapter(null);
    setSelectedTopic(null);
    setTopicSearchTerm('');
    setYoutubeLink('');

    setEditingQuestion(null);
  };

  const handleAddSubQuestion = () => {
    // Clear form for new sub-question
    setEnglishQuestion('');
    setEnglishOptionA('');
    setEnglishOptionB('');
    setEnglishOptionC('');
    setEnglishOptionD('');
    setEnglishOptionE('');
    setEnglishCorrectOption('A');
    setEnglishDetail('');

    setHindiQuestion('');
    setHindiOptionA('');
    setHindiOptionB('');
    setHindiOptionC('');
    setHindiOptionD('');
    setHindiOptionE('');
    setHindiCorrectOption('A');
    setHindiDetail('');

    setEditingSubQuestionIndex(null);
    setShowSubQuestionForm(true);
  };

  const handleEditSubQuestion = (index) => {
    const sub = subQuestions[index];

    setEnglishQuestion(sub.question_english || '');
    setEnglishOptionA(sub.option_a_english || '');
    setEnglishOptionB(sub.option_b_english || '');
    setEnglishOptionC(sub.option_c_english || '');
    setEnglishOptionD(sub.option_d_english || '');
    setEnglishOptionE(sub.option_e_english || '');
    setEnglishCorrectOption(sub.correct_option || 'A');
    setHindiDetail(''); // Solutions will be loaded separately if needed, but sub-questions no longer have them

    setEditingSubQuestionIndex(index);
    setShowSubQuestionForm(true);
  };

  const handleDeleteSubQuestion = (index) => {
    if (!checkPermission('delete sub-questions')) return;
    setDeleteType('subquestion');
    setDeleteTargetIndex(index);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAction = async () => {
    if (deleteType === 'question') {
      const questionId = deleteTargetId;
      try {
        console.log(`🗑️ Deleting question ${questionId}`);
        const response = await axios.post(`${BASE_URL}api/Questions/delete_question.php`, { id: questionId });
        console.log('📊 Delete Response:', response.data);
        if (response.data.success) {
          console.log('✅ Question deleted successfully');
          toast({
            title: 'Success',
            description: 'Question deleted successfully!',
            variant: 'default'
          });
          fetchQuestions(selectedSubject);
          fetchAllQuestions();
        } else {
          console.error('❌ Delete Error:', response.data.message);
          toast({
            title: 'Error',
            description: `Error: ${response.data.message}`,
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('❌ Error deleting question:', error);
        toast({
          title: 'Error',
          description: `Error deleting question: ${error.message}`,
          variant: 'destructive'
        });
      }
    } else if (deleteType === 'subquestion') {
      const index = deleteTargetIndex;
      const updated = [...subQuestions];
      updated.splice(index, 1);
      setSubQuestions(updated);
      toast({
        title: 'Success',
        description: 'Sub-question removed successfully',
        variant: 'default'
      });
    }
    setShowDeleteConfirm(false);
    setDeleteType(null);
    setDeleteTargetId(null);
    setDeleteTargetIndex(null);
  };

  const handleSaveSubQuestion = () => {
    // Validate sub-question
    const hasEnglishQuestion = englishQuestion && englishOptionA && englishOptionB && englishOptionC && englishOptionD;
    const hasHindiQuestion = hindiQuestion && hindiOptionA && hindiOptionB && hindiOptionC && hindiOptionD;

    if (!hasEnglishQuestion && !hasHindiQuestion) {
      toast({
        title: 'Validation Error',
        description: 'Please fill at least one complete language for the sub-question',
        variant: 'destructive'
      });
      return;
    }

    const subQuestion = {
      question_english: englishQuestion,
      option_a_english: englishOptionA,
      option_b_english: englishOptionB,
      option_c_english: englishOptionC,
      option_d_english: englishOptionD,
      option_e_english: englishOptionE,
      correct_option: englishCorrectOption,
      option_e_hindi: hindiOptionE,
      // consolidated solutions are no longer part of sub-questions
    };

    if (editingSubQuestionIndex !== null) {
      // Update existing
      const updated = [...subQuestions];
      updated[editingSubQuestionIndex] = subQuestion;
      setSubQuestions(updated);
    } else {
      // Add new
      setSubQuestions([...subQuestions, subQuestion]);
    }

    setShowSubQuestionForm(false);
    setEditingSubQuestionIndex(null);

    // Clear form
    setEnglishQuestion('');
    setEnglishOptionA('');
    setEnglishOptionB('');
    setEnglishOptionC('');
    setEnglishOptionD('');
    setEnglishOptionE('');
    setEnglishCorrectOption('A');
    setEnglishDetail('');

    setHindiQuestion('');
    setHindiOptionA('');
    setHindiOptionB('');
    setHindiOptionC('');
    setHindiOptionD('');
    setHindiOptionE('');
    setHindiCorrectOption('A');
    setHindiDetail('');
  };

  const handleCancelSubQuestion = () => {
    setShowSubQuestionForm(false);
    setEditingSubQuestionIndex(null);
  };




  const handleSaveQuestion = async () => {
    try {
      let questionData = {};

      if (questionType === 'passage') {
        // Validate Passage
        if (!passageEnglish && !passageHindi) {
          toast({
            title: 'Validation Error',
            description: 'Please provide passage content in at least one language.',
            variant: 'destructive'
          });
          return;
        }
        if (subQuestions.length === 0) {
          toast({
            title: 'Validation Error',
            description: 'Please add at least one sub-question to this passage.',
            variant: 'destructive'
          });
          return;
        }
        if (showSubQuestionForm) {
          toast({
            title: 'Validation Error',
            description: 'Please save or cancel the currently open sub-question form first.',
            variant: 'destructive'
          });
          return;
        }

        questionData = {
          subject_id: selectedSubject,
          topic_id: selectedTopic?.id || null,
          question_type: 'passage',
          passage_english: passageEnglish,
          passage_hindi: passageHindi,
          solution_english: englishDetail || null,
          solution_hindi: hindiDetail || null,
          youtube_link: youtubeLink || null,
          sub_questions: subQuestions
        };

      } else {
        // Check if at least one language has complete question data
        const hasEnglishQuestion = englishQuestion && englishOptionA && englishOptionB && englishOptionC && englishOptionD;
        const hasHindiQuestion = hindiQuestion && hindiOptionA && hindiOptionB && hindiOptionC && hindiOptionD;

        // Validate: at least one language must have complete question (question + 4 options)
        if (!hasEnglishQuestion && !hasHindiQuestion) {
          toast({
            title: 'Validation Error',
            description: 'Please fill at least one complete language (Question and Options A-D in either English or Hindi)',
            variant: 'destructive'
          });
          return;
        }

        // Prepare data object
        questionData = {
          subject_id: selectedSubject,
          topic_id: selectedTopic?.id || null,
          question_type: 'normal',
          question_english: englishQuestion,
          option_a_english: englishOptionA,
          option_b_english: englishOptionB,
          option_c_english: englishOptionC,
          option_d_english: englishOptionD,
          option_e_english: englishOptionE || null,
          question_hindi: hindiQuestion,
          option_a_hindi: hindiOptionA,
          option_b_hindi: hindiOptionB,
          option_c_hindi: hindiOptionC,
          option_d_hindi: hindiOptionD,
          option_e_hindi: hindiOptionE || null,
          correct_option: englishCorrectOption,
          solution_english: englishDetail || null,
          solution_hindi: hindiDetail || null,
          youtube_link: youtubeLink || null
        };
      }


      console.log('💾 Preparing to save question...', questionData);

      // Validate subject selection
      if (!selectedSubject) {
        toast({
          title: 'Validation Error',
          description: 'Please select a subject before adding a question',
          variant: 'destructive'
        });
        setShowBilingualModal(false);
        setActiveTab('questions');
        return;
      }

      // If editing, add the ID
      if (editingQuestion?.id) {
        questionData.id = editingQuestion.id;
      }

      const formData = new FormData();
      formData.append('data', JSON.stringify(questionData));

      console.log('📤 Question payload:', questionData);
      if (questionType === 'passage') {
        console.log('📤 Sub-questions to be sent:', subQuestions);
        console.log('📤 Sub-questions count:', subQuestions.length);
        subQuestions.forEach((sq, idx) => {
          console.log(`📤 Sub-Q${idx + 1}:`, sq.question_english || sq.question_hindi);
        });
      }

      // Determine which API endpoint to use
      let endpoint;
      if (editingQuestion?.id) {
        endpoint = questionType === 'passage'
          ? `${BASE_URL}api/Questions/update_passage_question.php`
          : `${BASE_URL}api/Questions/update_normal_question.php`;
      } else {
        endpoint = questionType === 'passage'
          ? `${BASE_URL}api/Questions/create_passage_question.php`
          : `${BASE_URL}api/Questions/create_normal_question.php`;
      }

      const response = await axios.post(endpoint, formData);

      console.log('📊 API Full Response:', response.data);

      if (response.data.success) {
        console.log('✅ Question saved successfully');
        toast({
          title: 'Success',
          description: `Question ${editingQuestion?.id ? 'updated' : 'created'} successfully!`,
          variant: 'default'
        });
        resetForm();
        setShowBilingualModal(false);
        // Refresh questions list
        fetchQuestions(selectedSubject);
        fetchAllQuestions();
      } else {
        const errorMessage = response.data.message || response.data.error || 'Unknown API Error';
        console.error('❌ API Error Detail:', response.data);
        toast({
          title: 'Error',
          description: `Error: ${errorMessage}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('❌ Error saving question:', error);
      const axiosError = error.response?.data?.message || error.message || 'Network Error';
      toast({
        title: 'Error',
        description: `Error saving question: ${axiosError}`,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteQuestion = (questionId) => {
    if (!checkPermission('delete question')) return;
    setDeleteType('question');
    setDeleteTargetId(questionId);
    setShowDeleteConfirm(true);
  };

  const handleEditQuestion = async (question) => {
    console.log('✏️ Editing question:', question);
    setEditingQuestion(question);

    if (question.question_type === 'passage') {
      setQuestionType('passage');
      setPassageEnglish(question.passage_english || '');
      setPassageHindi(question.passage_hindi || '');
      setEnglishDetail(question.solution_english || '');
      setHindiDetail(question.solution_hindi || '');
      setYoutubeLink(question.youtube_link || '');
      setSubQuestions([]); // Reset first

      // Fetch sub-questions
      try {
        console.log(`📥 Fetching sub-questions for passage ${question.id}`);
        const response = await axios.get(`${BASE_URL}api/Questions/get_questions.php?parent_id=${question.id}`);
        console.log('📥 Sub-questions API response:', response.data);
        if (response.data.success && Array.isArray(response.data.data)) {
          console.log(`✅ Fetched ${response.data.data.length} sub-questions`, response.data.data);
          setSubQuestions(response.data.data);
        } else {
          console.log('⚠️ No sub-questions found, response:', response.data);
          setSubQuestions([]);
        }
      } catch (error) {
        console.error('❌ Error fetching sub-questions:', error);
        setSubQuestions([]);
      }

    } else {
      setQuestionType('normal');
      // Load English fields
      setEnglishQuestion(question.question_english || '');
      setEnglishOptionA(question.option_a_english || '');
      setEnglishOptionB(question.option_b_english || '');
      setEnglishOptionC(question.option_c_english || '');
      setEnglishOptionD(question.option_d_english || '');
      setEnglishOptionE(question.option_e_english || '');
      setEnglishCorrectOption(question.correct_option || 'A');
      setEnglishDetail(question.solution_english || '');
      setYoutubeLink(question.youtube_link || '');

      // Load Hindi fields
      setHindiQuestion(question.question_hindi || '');
      setHindiOptionA(question.option_a_hindi || '');
      setHindiOptionB(question.option_b_hindi || '');
      setHindiOptionC(question.option_c_hindi || '');
      setHindiOptionD(question.option_d_hindi || '');
      setHindiOptionE(question.option_e_hindi || '');
      setHindiCorrectOption(question.correct_option || 'A');
      setHindiDetail(question.solution_hindi || '');
    }

    // Load assigned topic if present
    if (question.topic_id) {
      setSelectedTopic({
        id: question.topic_id,
        name: question.topic_name
      });
    } else {
      setSelectedTopic(null);
    }

    console.log('📋 Form loaded for editing');
    setShowBilingualModal(true);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden my-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
      >
        {/* Header */}
        <div className={`p-4 md:p-6 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
          }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                Set Management
              </h2>
              <p className={`text-xs md:text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                {safeSetData?.exam_name && safeSetData.exam_name !== 'N/A' && `Exam: ${safeSetData.exam_name}`}
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className={`p-1.5 rounded-lg transition-colors ${isDarkMode
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'overview'
                ? isDarkMode
                  ? 'bg-purple-600 text-white border-b-2 border-purple-600'
                  : 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-400 hover:text-gray-300'
                  : 'bg-white text-gray-600 hover:text-gray-900'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'questions'
                ? isDarkMode
                  ? 'bg-purple-600 text-white border-b-2 border-purple-600'
                  : 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-400 hover:text-gray-300'
                  : 'bg-white text-gray-600 hover:text-gray-900'
              }`}
          >
            Questions
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Set Information */}
              <div className={`p-4 rounded-lg border ${isDarkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-gray-50 border-gray-200'
                }`}>
                <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  Set Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      Exam Name
                    </p>
                    <p className={`text-sm md:text-base font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      {safeSetData.exam_name}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      Set Number
                    </p>
                    <p className={`text-sm md:text-base font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      {safeSetData.set_number}
                    </p>
                  </div>
                </div>
              </div>





            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              {Array.isArray(subjects) && subjects.length > 0 ? (
                <>
                  <div>
                    <h3 className={`text-sm md:text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      Select a Subject to Add Questions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {subjects.map((subject, index) => {
                        try {
                          const subjectId = typeof subject === 'object' && subject !== null ? subject.id : subject;
                          const subjectName = typeof subject === 'object' && subject !== null ? subject.name : String(subject);

                          // Skip invalid subjects
                          if (!subjectId || !subjectName) {
                            console.warn(`⚠️ Invalid subject at index ${index}:`, subject);
                            return null;
                          }

                          return (
                            <button
                              key={`subject-${subjectId}`}
                              onClick={() => {
                                console.log(`📚 Selected subject: ${subjectName} (ID: ${subjectId})`);
                                setSelectedSubject(subjectId);
                              }}
                              className={`p-3 md:p-4 rounded-lg border-2 transition-all text-sm md:text-base font-medium ${selectedSubject === subjectId
                                  ? 'border-purple-600 bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100'
                                  : isDarkMode
                                    ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-purple-500 hover:bg-gray-600'
                                    : 'border-gray-300 bg-white text-gray-900 hover:border-purple-500 hover:bg-purple-50'
                                }`}
                            >
                              {subjectName}
                            </button>
                          );
                        } catch (error) {
                          console.error(`❌ Error rendering subject at index ${index}:`, error);
                          return null;
                        }
                      }).filter(Boolean)}
                    </div>
                  </div>

                  {selectedSubject && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg border ${isDarkMode
                            ? 'border-purple-500 bg-purple-900 bg-opacity-30'
                            : 'border-purple-300 bg-purple-50'
                          }`}>
                          <button
                            onClick={() => {
                              console.log(`🔓 Opening new question form for subject: ${getSubjectName(selectedSubject)} (ID: ${selectedSubject})`);
                              setEditingQuestion(null);
                              resetForm();
                              setShowBilingualModal(true);
                            }}
                            className="w-full px-4 py-2.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                          >
                            <Plus className="w-4 h-4" />
                            Add Question for {getSubjectName(selectedSubject)}
                          </button>
                        </div>

                        <div className={`p-4 rounded-lg border ${isDarkMode
                            ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                            : 'border-blue-300 bg-blue-50'
                          }`}>
                          <button
                            onClick={() => fetchSubjectOverview(selectedSubject)}
                            disabled={isFetchingOverview}
                            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                          >
                            {isFetchingOverview ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <BookOpen className="w-4 h-4" />
                            )}
                            View Subject Overview
                          </button>
                        </div>
                      </div>


                      {/* Questions Table */}
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <h4 className={`text-sm md:text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                            Questions ({questions.reduce((total, q) => total + (q.question_type === 'passage' ? parseInt(q.sub_questions_count || 0) : 1), 0)})
                          </h4>

                          <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search by ID or name..."
                              value={questionSearchTerm}
                              onChange={(e) => setQuestionSearchTerm(e.target.value)}
                              className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${isDarkMode
                                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                }`}
                            />
                          </div>
                        </div>

                        {isLoading ? (
                          <div className={`p-4 rounded-lg border ${isDarkMode
                              ? 'border-gray-600 bg-gray-700'
                              : 'border-gray-300 bg-gray-50'
                            }`}>
                            <p className={`text-xs md:text-sm animate-pulse ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Loading questions...
                            </p>
                          </div>
                        ) : questions.length > 0 ? (
                          <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                            <table className="w-full text-xs md:text-sm">
                              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} border-b dark:border-gray-700`}>
                                <tr>
                                  <th className={`px-2 py-2 md:px-4 md:py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>ID</th>
                                  <th className={`px-2 py-2 md:px-4 md:py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type</th>
                                  <th className={`px-2 py-2 md:px-4 md:py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Topic</th>
                                  <th className={`px-2 py-2 md:px-4 md:py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Question (EN)</th>
                                  <th className={`px-2 py-2 md:px-4 md:py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Correct</th>
                                  <th className={`px-2 py-2 md:px-4 md:py-3 text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {questions
                                  .filter(q => {
                                    if (!q) return false;
                                    const search = questionSearchTerm.toLowerCase();
                                    const text = q.question_type === 'passage'
                                      ? (q.passage_english || q.passage_hindi || '')
                                      : (q.question_english || q.question_hindi || '');

                                    return q.id.toString().includes(search) || text.toLowerCase().includes(search);
                                  })
                                  .map((q, idx) => (
                                    <tr key={q.id} className={`border-b dark:border-gray-700 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                      <td className={`px-2 py-2 md:px-4 md:py-3 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{q.id}</td>
                                      <td className={`px-2 py-2 md:px-4 md:py-3 whitespace-nowrap`}>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${q.question_type === 'passage'
                                            ? isDarkMode ? 'bg-amber-900 text-amber-200' : 'bg-amber-100 text-amber-800'
                                            : isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                          }`}>
                                          {q.question_type === 'passage' ? 'Passage' : 'Normal'}
                                        </span>
                                      </td>
                                      <td className={`px-2 py-2 md:px-4 md:py-3 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {q.topic_name ? (
                                          <span title={q.topic_name} className="cursor-help text-purple-600 dark:text-purple-400 font-medium">
                                            TOPIC
                                          </span>
                                        ) : (
                                          <span className="text-gray-400 italic">null topic</span>
                                        )}
                                      </td>
                                      <td className={`px-2 py-2 md:px-4 md:py-3 truncate max-w-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                        {q.question_type === 'passage'
                                          ? (q.passage_english || q.passage_hindi || '—').replace(/<[^>]*>?/gm, '')
                                          : (q.question_english || q.question_hindi || '—').replace(/<[^>]*>?/gm, '')}
                                      </td>
                                      <td className={`px-2 py-2 md:px-4 md:py-3 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400`}>
                                        {q.correct_option || (q.question_type === 'passage' ? '—' : '—')}
                                      </td>
                                      <td className={`px-2 py-2 md:px-4 md:py-3 text-center space-x-1 md:space-x-2`}>
                                        <button
                                          onClick={() => handleEditQuestion(q)}
                                          className="inline-block p-1 md:p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition"
                                          title="Edit question"
                                        >
                                          <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteQuestion(q.id)}
                                          className="inline-block p-1 md:p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded transition"
                                          title="Delete question"
                                        >
                                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className={`p-4 rounded-lg border-2 border-dashed ${isDarkMode
                              ? 'border-gray-600 bg-gray-700'
                              : 'border-gray-300 bg-gray-50'
                            }`}>
                            <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              No questions created yet for this subject.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={`p-4 rounded-lg border-2 border-dashed ${isDarkMode
                    ? 'border-gray-600 bg-gray-700'
                    : 'border-gray-300 bg-gray-50'
                  }`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No subjects available. Please add subjects to this set first.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Bilingual Question Modal */}
      {showBilingualModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`w-full max-w-6xl rounded-xl shadow-2xl overflow-hidden my-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
          >
            {/* Modal Header */}
            <div className={`p-4 md:p-6 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    {editingQuestion ? '✏️ Edit Question' : '➕ Add Question'}
                  </h3>
                  {selectedSubject && (
                    <p className={`text-xs md:text-sm mt-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'
                      }`}>
                      Subject: <span className="font-semibold">{getSubjectName(selectedSubject)}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    console.log('🔒 Closing bilingual form');
                    setShowBilingualModal(false);
                    if (isSubQuestion) {
                      setIsSubQuestion(false);
                      setOnAddSubQuestion(null);
                    }
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${isDarkMode
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-6 max-h-[calc(90vh-200px)] overflow-y-auto">

              {/* Question Type Selector */}
              <div className="mb-6 flex gap-4 p-3 rounded bg-gray-100 dark:bg-gray-700">
                <label className={`flex items-center gap-2 cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <input
                    type="radio"
                    checked={questionType === 'normal'}
                    onChange={() => setQuestionType('normal')}
                    className="w-4 h-4 text-purple-600"
                    disabled={editingQuestion && editingQuestion.question_type !== 'normal' && editingQuestion.question_type !== undefined}
                  />
                  <span className="font-medium">Normal Question</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <input
                    type="radio"
                    checked={questionType === 'passage'}
                    onChange={() => setQuestionType('passage')}
                    className="w-4 h-4 text-purple-600"
                    disabled={editingQuestion && editingQuestion.question_type !== 'passage' && editingQuestion.question_type !== undefined}
                  />
                  <span className="font-medium">Passage/Description</span>
                </label>
              </div>

              {/* Topic Assignment */}
              <div className={`mb-6 p-4 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-purple-50 border-purple-100'
                }`}>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>
                    Assigned Topic
                  </h4>
                  <div className={`text-sm flex flex-wrap justify-center sm:justify-start gap-2 ${isDarkMode ? 'text-gray-300' : 'text-purple-700'}`}>
                    {selectedTopic ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-purple-600 text-white rounded-md text-xs font-bold shadow-sm">
                          {selectedTopic.name}
                        </span>
                        <button
                          onClick={() => setSelectedTopic(null)}
                          className="text-red-500 hover:text-red-400 text-xs font-bold transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <span className="italic opacity-60">No topic assigned to this question</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowTopicSelector(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md hover:shadow-lg active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Assign Topic
                </button>
              </div>

              {/* YouTube Link Field */}
              {!showSubQuestionForm && (
                <div className={`mb-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-red-50 border-red-100'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-red-600 text-white rounded-md">
                      <Eye className="w-4 h-4" />
                    </div>
                    <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-red-900'}`}>
                      YouTube Video Explanation Link
                    </h4>
                  </div>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-red-500 outline-none ${isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-white border-red-200 text-gray-900 placeholder-gray-400'
                      }`}
                  />
                  <p className={`text-[10px] mt-2 italic ${isDarkMode ? 'text-gray-400' : 'text-red-600'}`}>
                    * This video link will be shown to students as a video explanation for this question.
                  </p>
                </div>
              )}

              {/* Passage Editors */}
              {questionType === 'passage' && !showSubQuestionForm && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
                  {/* English Passage */}
                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`text-base md:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🇬🇧 Passage (English)</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={startListeningPassage}
                          className={`p-2 rounded-full transition-colors ${isListeningPassage ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                          title="Speak"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTranslate(passageEnglish, setPassageHindi)}
                          className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                          title="Translate to Hindi"
                        >
                          <Languages className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <ReactQuill
                      ref={quillPassageEnglishRef}
                      theme="snow"
                      value={passageEnglish}
                      onChange={setPassageEnglish}
                      modules={quillModules}
                      formats={quillFormats}
                      style={{ minHeight: '150px', backgroundColor: isDarkMode ? '#374151' : '#ffffff' }}
                      placeholder="Enter passage content in English..."
                    />
                  </div>
                  {/* Hindi Passage */}
                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <h4 className={`text-base md:text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🇮🇳 Passage (Hindi)</h4>
                    <ReactQuill
                      ref={quillPassageHindiRef}
                      theme="snow"
                      value={passageHindi}
                      onChange={setPassageHindi}
                      modules={quillModules}
                      formats={quillFormats}
                      style={{ minHeight: '150px', backgroundColor: isDarkMode ? '#374151' : '#ffffff' }}
                      placeholder="Enter passage content in Hindi..."
                    />
                  </div>
                </div>
              )}

              {/* Passage Level Solutions (Shown when type is passage and NOT adding/editing a sub-question) */}
              {questionType === 'passage' && !showSubQuestionForm && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8 mt-4 pt-6 border-t dark:border-gray-700">
                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50/50 border-blue-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`text-base md:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>🇬🇧 Passage Solution (English)</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={startListeningDetail}
                          className={`p-1.5 rounded-full transition-colors ${isListeningDetail ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                          title="Speak"
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTranslate(englishDetail, setHindiDetail)}
                          className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                          title="Translate to Hindi"
                        >
                          <Languages className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <ReactQuill
                      ref={quillPassageEnglishDetailRef}
                      theme="snow"
                      value={englishDetail}
                      onChange={setEnglishDetail}
                      modules={quillModules}
                      formats={quillFormats}
                      style={{ minHeight: '150px', backgroundColor: isDarkMode ? '#374151' : '#ffffff' }}
                      placeholder="Enter passage solution in English..."
                    />
                  </div>

                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50/50 border-blue-100'}`}>
                    <h4 className={`text-base md:text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>🇮🇳 Passage Solution (Hindi)</h4>
                    <ReactQuill
                      ref={quillPassageHindiDetailRef}
                      theme="snow"
                      value={hindiDetail}
                      onChange={setHindiDetail}
                      modules={quillModules}
                      formats={quillFormats}
                      style={{ minHeight: '150px', backgroundColor: isDarkMode ? '#374151' : '#ffffff' }}
                      placeholder="Enter passage solution in Hindi..."
                    />
                  </div>
                </div>
              )}

              {/* Sub-questions List */}
              {questionType === 'passage' && !showSubQuestionForm && (
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Sub-Questions ({subQuestions.length})
                    </h4>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search sub-questions..."
                          value={subQuestionSearchTerm}
                          onChange={(e) => setSubQuestionSearchTerm(e.target.value)}
                          className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                            }`}
                        />
                      </div>
                      <button
                        onClick={handleAddSubQuestion}
                        className="w-full sm:w-auto px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm flex items-center justify-center gap-1 transition-colors font-medium shadow-sm hover:shadow-md"
                      >
                        <Plus className="w-4 h-4" /> Add Sub-Question
                      </button>
                    </div>
                  </div>

                  {subQuestions.length === 0 ? (
                    <div className={`p-8 border-2 border-dashed rounded-lg text-center ${isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                      No sub-questions added yet. Click "Add Sub-Question" to create questions for this passage.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subQuestions
                        .filter(sub => {
                          if (!subQuestionSearchTerm.trim()) return true;
                          const search = subQuestionSearchTerm.toLowerCase();
                          const text = (sub.question_english || sub.question_hindi || '').replace(/<[^>]*>?/gm, '').toLowerCase();
                          const id = sub.id ? sub.id.toString() : '';
                          return id.includes(search) || text.includes(search);
                        })
                        .map((sub, idx) => (
                          <div key={idx} className={`p-4 rounded-lg border flex justify-between items-center ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex-1 mr-4 overflow-hidden">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`font-bold px-2 py-0.5 rounded text-xs ${isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>Q{idx + 1}</span>
                                {sub.id && (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500 border border-gray-200'}`}>
                                    ID: {sub.id}
                                  </span>
                                )}
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>Correct: {sub.correct_option}</span>
                              </div>
                              <div className={`text-sm truncate font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`} dangerouslySetInnerHTML={{ __html: sub.question_english || sub.question_hindi || 'No question text' }}></div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => handleEditSubQuestion(idx)} className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteSubQuestion(idx)} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-600 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {(questionType === 'normal' || showSubQuestionForm) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {/* ===== ENGLISH SECTION ===== */}
                  <div className={`p-4 rounded-lg border ${isDarkMode
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                    }`}>
                    <h4 className={`text-base md:text-lg font-semibold mb-4 pb-3 border-b ${isDarkMode ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'
                      }`}>
                      🇬🇧 English
                    </h4>

                    <div className="space-y-4">
                      {/* Question */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Question *
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={startListeningQuestion}
                              className={`p-1.5 rounded-full transition-colors ${isListeningQuestion ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                              title="Speak"
                            >
                              <Mic className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleTranslate(englishQuestion, setHindiQuestion)}
                              className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                              title="Translate to Hindi"
                            >
                              <Languages className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className={`rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                          <ReactQuill
                            ref={quillEnglishQuestionRef}
                            theme="snow"
                            value={englishQuestion}
                            onChange={setEnglishQuestion}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder="Enter question in English"
                            style={{
                              minHeight: '80px',
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff'
                            }}
                          />
                        </div>
                      </div>

                      {/* Options */}
                      <div>
                        <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Options *
                        </label>

                        <div className="space-y-3">
                          {[
                            { label: 'Option A', state: englishOptionA, setState: setEnglishOptionA, ref: quillEnglishOptionARef, listen: startListeningOptionA, active: isListeningOptionA, translate: () => handleTranslate(englishOptionA, setHindiOptionA) },
                            { label: 'Option B', state: englishOptionB, setState: setEnglishOptionB, ref: quillEnglishOptionBRef, listen: startListeningOptionB, active: isListeningOptionB, translate: () => handleTranslate(englishOptionB, setHindiOptionB) },
                            { label: 'Option C', state: englishOptionC, setState: setEnglishOptionC, ref: quillEnglishOptionCRef, listen: startListeningOptionC, active: isListeningOptionC, translate: () => handleTranslate(englishOptionC, setHindiOptionC) },
                            { label: 'Option D', state: englishOptionD, setState: setEnglishOptionD, ref: quillEnglishOptionDRef, listen: startListeningOptionD, active: isListeningOptionD, translate: () => handleTranslate(englishOptionD, setHindiOptionD) },
                            { label: 'Option E (Optional)', state: englishOptionE, setState: setEnglishOptionE, ref: quillEnglishOptionERef, listen: startListeningOptionE, active: isListeningOptionE, translate: () => handleTranslate(englishOptionE, setHindiOptionE) },
                          ].map((option, idx) => (
                            <div key={idx}>
                              <div className="flex items-center justify-between mb-1">
                                <label className={`text-xs font-medium block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                  {option.label}
                                </label>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={option.listen}
                                    className={`p-1 rounded-full transition-colors ${option.active ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-50 text-purple-500 hover:bg-purple-100'}`}
                                    title="Speak"
                                  >
                                    <Mic className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={option.translate}
                                    className="p-1 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                                    title="Translate to Hindi"
                                  >
                                    <Languages className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div className={`rounded border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                <ReactQuill
                                  ref={option.ref}
                                  theme="snow"
                                  value={option.state}
                                  onChange={option.setState}
                                  modules={quillModules}
                                  formats={quillFormats}
                                  placeholder={option.label}
                                  style={{
                                    minHeight: '60px',
                                    backgroundColor: isDarkMode ? '#374151' : '#ffffff'
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Correct Option */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Correct Option *
                        </label>
                        <select
                          value={englishCorrectOption}
                          onChange={(e) => setEnglishCorrectOption(e.target.value)}
                          className={`w-full px-3 py-2 rounded border text-sm transition-colors ${isDarkMode
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                        </select>
                      </div>

                      {/* Detail (Optional) - Only for normal questions */}
                      {questionType === 'normal' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Detail / Solution (Optional)
                            </label>
                            <div className="flex gap-2">
                              <button
                                onClick={startListeningDetail}
                                className={`p-1.5 rounded-full transition-colors ${isListeningDetail ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                                title="Speak"
                              >
                                <Mic className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleTranslate(englishDetail, setHindiDetail)}
                                className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                title="Translate to Hindi"
                              >
                                <Languages className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className={`rounded border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                            <ReactQuill
                              ref={quillEnglishDetailRef}
                              theme="snow"
                              value={englishDetail}
                              onChange={setEnglishDetail}
                              modules={quillModules}
                              formats={quillFormats}
                              placeholder="Enter explanation or solution (optional)"
                              className="detail-quill-editor"
                              style={{
                                minHeight: '120px',
                                backgroundColor: isDarkMode ? '#374151' : '#ffffff'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ===== HINDI SECTION ===== */}
                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <h4 className={`text-base md:text-lg font-semibold mb-4 pb-3 border-b ${isDarkMode ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'}`}>
                      🇮🇳 हिंदी
                    </h4>

                    <div className="space-y-4">
                      {/* Question */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          प्रश्न *
                        </label>
                        <div className={`rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                          <ReactQuill
                            ref={quillHindiQuestionRef}
                            theme="snow"
                            value={hindiQuestion}
                            onChange={setHindiQuestion}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder="हिंदी में प्रश्न दर्ज करें"
                            style={{
                              minHeight: '80px',
                              backgroundColor: isDarkMode ? '#374151' : '#ffffff'
                            }}
                          />
                        </div>
                      </div>

                      {/* Options */}
                      <div>
                        <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          विकल्प *
                        </label>
                        <div className="space-y-3">
                          {[
                            { label: 'विकल्प A', state: hindiOptionA, setState: setHindiOptionA, ref: quillHindiOptionARef },
                            { label: 'विकल्प B', state: hindiOptionB, setState: setHindiOptionB, ref: quillHindiOptionBRef },
                            { label: 'विकल्प C', state: hindiOptionC, setState: setHindiOptionC, ref: quillHindiOptionCRef },
                            { label: 'विकल्प D', state: hindiOptionD, setState: setHindiOptionD, ref: quillHindiOptionDRef },
                            { label: 'विकल्प E (वैकल्पिक)', state: hindiOptionE, setState: setHindiOptionE, ref: quillHindiOptionERef },
                          ].map((option, idx) => (
                            <div key={idx}>
                              <label className={`text-xs font-medium mb-1 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {option.label}
                              </label>
                              <div className={`rounded border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                <ReactQuill
                                  ref={option.ref}
                                  theme="snow"
                                  value={option.state}
                                  onChange={option.setState}
                                  modules={quillModules}
                                  formats={quillFormats}
                                  placeholder={option.label}
                                  style={{
                                    minHeight: '60px',
                                    backgroundColor: isDarkMode ? '#374151' : '#ffffff'
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Correct Option */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          सही विकल्प *
                        </label>
                        <select
                          value={hindiCorrectOption}
                          onChange={(e) => setHindiCorrectOption(e.target.value)}
                          className={`w-full px-3 py-2 rounded border text-sm transition-colors ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                        </select>
                      </div>

                      {/* Detail (Optional) - Only for normal questions */}
                      {questionType === 'normal' && (
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            विवरण / समाधान (वैकल्पिक)
                          </label>
                          <div className={`rounded border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                            <ReactQuill
                              ref={quillHindiDetailRef}
                              theme="snow"
                              value={hindiDetail}
                              onChange={setHindiDetail}
                              modules={quillModules}
                              formats={quillFormats}
                              placeholder="व्याख्या या समाधान दर्ज करें (वैकल्पिक)"
                              className="detail-quill-editor"
                              style={{
                                minHeight: '120px',
                                backgroundColor: isDarkMode ? '#374151' : '#ffffff'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-4 md:p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
              }`}>
              <div className="flex gap-3 justify-end flex-wrap">
                <button
                  onClick={() => {
                    if (showSubQuestionForm) {
                      handleCancelSubQuestion();
                    } else {
                      console.log('🔒 Closing bilingual form');
                      setShowBilingualModal(false);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                >
                  {showSubQuestionForm ? 'Cancel Sub-Question' : 'Cancel'}
                </button>

                {editingQuestion && !showSubQuestionForm && (
                  <button
                    onClick={() => handleDeleteQuestion(editingQuestion.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}

                {showSubQuestionForm ? (
                  <button
                    onClick={handleSaveSubQuestion}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm"
                  >
                    {editingSubQuestionIndex !== null ? 'Update Sub-Question' : 'Add Sub-Question'}
                  </button>
                ) : (
                  <button
                    onClick={handleSaveQuestion}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
                    disabled={isLoading}
                  >
                    {editingQuestion ? '💾 Update Question' : '💾 Save Question'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Topic Selector Modal */}
      {showTopicSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'
              }`}
          >
            {/* Header */}
            <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Select Question Topic
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Assign a topic to this question for better categorization
                </p>
              </div>
              <button
                onClick={() => setShowTopicSelector(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for a topic..."
                  value={topicSearchTerm}
                  onChange={(e) => setTopicSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all outline-none ${isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500'
                    }`}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-center sm:text-left">
              {topicSearchTerm.trim() !== '' ? (
                /* Search Results */
                <div className="space-y-2">
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 px-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Search Results
                  </h4>
                  {filteredTopics.length > 0 ? (
                    filteredTopics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => {
                          setSelectedTopic(topic);
                          setShowTopicSelector(false);
                          setTopicSearchTerm('');
                        }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${isDarkMode
                            ? 'bg-gray-800 border-gray-700 hover:border-purple-500 hover:bg-gray-750'
                            : 'bg-white border-gray-100 hover:border-purple-500 hover:bg-purple-50'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {topic.name}
                            </p>
                            <p className="text-xs text-gray-500">ID: {topic.id}</p>
                          </div>
                        </div>
                        <Plus className="w-5 h-5 text-gray-300 group-hover:text-purple-600 transition-colors" />
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-3 opacity-20" />
                      <p className="text-gray-500 italic">No topics found matching your search</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Chapters List */
                <div className="space-y-4">
                  {chapters.length > 0 ? (
                    chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className={`rounded-xl border-2 transition-all ${expandedChapterId === chapter.id
                            ? 'border-purple-500 ring-4 ring-purple-500/5'
                            : isDarkMode ? 'border-gray-800 hover:border-gray-700' : 'border-gray-100 hover:border-gray-200'
                          }`}
                      >
                        <button
                          onClick={() => {
                            const newId = expandedChapterId === chapter.id ? null : chapter.id;
                            setExpandedChapterId(newId);
                            if (newId) {
                              fetchChapterTopics(newId);
                            }
                          }}
                          className={`w-full p-4 flex items-center justify-between transition-colors ${expandedChapterId === chapter.id
                              ? isDarkMode ? 'bg-purple-900/10' : 'bg-purple-50'
                              : ''
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${expandedChapterId === chapter.id
                                ? 'bg-purple-600 text-white'
                                : isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                              }`}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {chapter.name}
                              </h4>
                              <p className="text-xs text-gray-500 uppercase tracking-tighter">Chapter</p>
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedChapterId === chapter.id ? 180 : 0 }}
                            className="text-gray-400"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {expandedChapterId === chapter.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-gray-50/50 dark:bg-black/20"
                            >
                              <div className="p-4 pt-0 space-y-2">
                                {chapterTopics[chapter.id] ? (
                                  chapterTopics[chapter.id].length > 0 ? (
                                    chapterTopics[chapter.id].map((topic) => (
                                      <button
                                        key={topic.id}
                                        onClick={() => {
                                          setSelectedTopic(topic);
                                          setShowTopicSelector(false);
                                        }}
                                        className={`w-full p-3 rounded-lg border-2 text-left transition-all flex items-center justify-between group ${isDarkMode
                                            ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                                            : 'bg-white border-white hover:border-purple-500 shadow-sm hover:shadow'
                                          }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {topic.name}
                                          </span>
                                        </div>
                                        <Plus className="w-4 h-4 text-gray-300 group-hover:text-purple-600 transition-colors" />
                                      </button>
                                    ))
                                  ) : (
                                    <div className="p-6 text-center text-gray-500 text-sm italic">
                                      No topics found in this chapter
                                    </div>
                                  )
                                ) : (
                                  <div className="p-6 flex items-center justify-center gap-2 text-gray-400">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                    <span className="text-sm">Loading topics...</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4 opacity-20" />
                      <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        No chapters available
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Please add chapters in the management section first.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
              <button
                onClick={() => setShowTopicSelector(false)}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'
                }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Confirm Deletion
                  </h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Are you sure you want to delete this {deleteType === 'question' ? 'question' : 'sub-question'}? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteType(null);
                    setDeleteTargetId(null);
                    setDeleteTargetIndex(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAction}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-sm transition-all active:scale-95 shadow-lg shadow-red-600/20"
                >
                  Delete Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subject Overview Modal */}
      <AnimatePresence>
        {showSubjectOverview && subjectOverviewData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'
                }`}
            >
              {/* Header */}
              <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
                }`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Subject Overview
                    </h3>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {getSubjectName(selectedSubject)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubjectOverview(false)}
                  className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-500'
                    }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Questions', value: subjectOverviewData.total_answerable, color: 'blue' },
                    { label: 'Normal Questions', value: subjectOverviewData.normal_questions, color: 'green' },
                    { label: 'Passages', value: subjectOverviewData.passages, color: 'amber' },
                    { label: 'Sub Questions', value: subjectOverviewData.sub_questions, color: 'purple' },
                  ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-2xl border transition-all hover:scale-105 ${isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-100 shadow-sm'
                      }`}>
                      <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${stat.color === 'blue' ? 'text-blue-500' :
                          stat.color === 'green' ? 'text-green-500' :
                            stat.color === 'amber' ? 'text-amber-500' : 'text-purple-500'
                        }`}>
                        {stat.label}
                      </p>
                      <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chapter/Topic Breakdown */}
                <div className="space-y-4">
                  <h4 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    <FileText className="w-4 h-4" />
                    Chapter & Topic Breakdown
                  </h4>

                  {subjectOverviewData.chapter_breakdown.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {subjectOverviewData.chapter_breakdown.map((chapter, idx) => (
                        <div key={idx} className={`rounded-2xl border overflow-hidden transition-all ${isDarkMode ? 'bg-gray-800/20 border-gray-700' : 'bg-gray-50 border-gray-100'
                          }`}>
                          <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
                            }`}>
                            <span className={`font-bold text-sm truncate max-w-[200px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {chapter.chapter_name}
                            </span>
                            <span className="px-2 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase shadow-lg shadow-purple-600/20">
                              {chapter.total_questions} Qs
                            </span>
                          </div>
                          <div className="p-4 space-y-2">
                            {chapter.topics.map((topic, tidx) => (
                              <div key={tidx} className="flex items-center justify-between text-xs group">
                                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} group-hover:text-purple-500 transition-colors`}>
                                  • {topic.topic_name}
                                </span>
                                <span className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                  {topic.count}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-12 rounded-3xl border-2 border-dashed text-center ${isDarkMode ? 'border-gray-800 bg-gray-800/20' : 'border-gray-200 bg-gray-50'
                      }`}>
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4 opacity-20" />
                      <p className={`font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        No breakdown data available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
                }`}>
                <button
                  onClick={() => setShowSubjectOverview(false)}
                  className="px-8 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl hover:scale-105 transition-all font-black uppercase text-xs tracking-widest shadow-xl active:scale-95"
                >
                  Close Overview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SetQuestions;