import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Award,
    Eye,
    Edit3,
    Trash2,
    Plus,
    Search,
    Mic,
    Languages,
    X,
    Save,
    ChevronDown,
    Loader2
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTheme } from '../../contexts/ThemeContext';
import { useSpeechToText, translateToHindi } from '../../Admin Test Series Components/TranslateLogic';
import { useAuth } from '../../contexts/AuthContext';


const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
    ],
};

const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'link', 'image'
];

const Admin_Current_Affairs_Monthly_Test = () => {
    const { isDarkMode } = useTheme();
    const { adminUser } = useAuth();

    // Permission check helper
    const checkPermission = (action = 'delete') => {
        if (adminUser?.role === 'test_teacher' || adminUser?.role === 'ca_teacher') {
            showToast(`Access Denied: Teachers cannot ${action} items.`, 'error');
            return false;
        }
        return true;
    };
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [quizzes, setQuizzes] = useState({}); // { monthName: quizData }
    const [loading, setLoading] = useState(false);
    const [monthlyArticles, setMonthlyArticles] = useState([]);

    const getSlug = (title) => {
        return (title || '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    // Modals
    const [showMarksModal, setShowMarksModal] = useState(false);
    const [showDetailsModal, setShowQuizDetailsModal] = useState(false);
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', type: 'confirm', onConfirm: null });
    const [toast, setToast] = useState(null); // { message, type }

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };



    const [currentMonth, setCurrentMonth] = useState(null);
    const [currentQuizId, setCurrentQuizId] = useState(null);

    // Form Datas
    const [marksForm, setMarksForm] = useState({
        General: '', OBC: '', SC: '', ST: '', EWS: '', PWD: ''
    });

    const [detailsForm, setDetailsForm] = useState({
        overallTime: '', maxMarks: '', positiveMarking: '', negativeMarking: ''
    });

    const [questions, setQuestions] = useState([]);
    const [questionSearch, setQuestionSearch] = useState('');
    const [questionForm, setQuestionFormData] = useState({
        Question_En: '', Question_Hi: '',
        OptionA_En: '', OptionA_Hi: '',
        OptionB_En: '', OptionB_Hi: '',
        OptionC_En: '', OptionC_Hi: '',
        OptionD_En: '', OptionD_Hi: '',
        OptionE_En: '', OptionE_Hi: '',
        CorrectAnswer: 'A', SolutionLink: ''
    });
    const [editingQuestionId, setEditingQuestionId] = useState(null);

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        fetchQuizzes();
    }, [selectedYear]);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}api/CurrentAffairs/get_quiz_details.php?year=${selectedYear}`);
            const result = await response.json();
            if (result.status === 'success') {
                const dataMap = {};
                (result.data || []).forEach(q => {
                    dataMap[q.Month] = q;
                });
                setQuizzes(dataMap);
            }
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveQuizDetails = async (action = 'save') => {
        const payload = {
            year: selectedYear,
            month: currentMonth,
            overallTime: detailsForm.overallTime,
            maxMarks: detailsForm.maxMarks,
            positiveMarking: detailsForm.positiveMarking,
            negativeMarking: detailsForm.negativeMarking,
            passingGeneral: marksForm.General,
            passingOBC: marksForm.OBC,
            passingSC: marksForm.SC,
            passingST: marksForm.ST,
            passingEWS: marksForm.EWS,
            passingPWD: marksForm.PWD,
            action
        };

        try {
            const response = await fetch(`${BASE_URL}api/CurrentAffairs/manage_quiz_details.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.status === 'success') {
                fetchQuizzes();
                setShowMarksModal(false);
                setShowQuizDetailsModal(false);
                if (action === 'delete') {
                    showToast("Quiz deleted successfully");
                } else {
                    showToast("Saved successfully");
                }
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            console.error("Error saving quiz details:", error);
        }
    };

    const openMarksModal = (month) => {
        setCurrentMonth(month);
        const quiz = quizzes[month] || {};
        setMarksForm({
            General: quiz.Passing_General || '',
            OBC: quiz.Passing_OBC || '',
            SC: quiz.Passing_SC || '',
            ST: quiz.Passing_ST || '',
            EWS: quiz.Passing_EWS || '',
            PWD: quiz.Passing_PWD || ''
        });
        setShowMarksModal(true);
    };

    const openDetailsModal = (month) => {
        setCurrentMonth(month);
        const quiz = quizzes[month] || {};
        setDetailsForm({
            overallTime: quiz.OverallTime || '',
            maxMarks: quiz.MaxMarks || '',
            positiveMarking: quiz.PositiveMarking || '',
            negativeMarking: quiz.NegativeMarking || ''
        });
        // Also need marks for payload if they exist
        setMarksForm({
            General: quiz.Passing_General || '',
            OBC: quiz.Passing_OBC || '',
            SC: quiz.Passing_SC || '',
            ST: quiz.Passing_ST || '',
            EWS: quiz.Passing_EWS || '',
            PWD: quiz.Passing_PWD || ''
        });
        setShowQuizDetailsModal(true);
    };

    const handleDeleteQuiz = (month) => {
        if (!checkPermission('delete quiz')) return;
        setCurrentMonth(month);
        setConfirmConfig({
            title: 'Delete Quiz',
            message: `Are you sure you want to delete the quiz for ${month} ${selectedYear}? This will delete all questions as well.`,
            type: 'confirm',
            onConfirm: () => handleSaveQuizDetails('delete')
        });
        setShowConfirmModal(true);
    };

    const openQuestionsModal = async (month) => {
        setCurrentMonth(month);
        const quiz = quizzes[month];
        if (!quiz) {
            setConfirmConfig({
                title: 'Quiz Not Found',
                message: 'Please save the quiz details (Category Marks and Basic Details) before adding questions.',
                type: 'alert',
                onConfirm: null
            });
            setShowConfirmModal(true);
            return;
        }
        setCurrentQuizId(quiz.QuizID);
        await fetchQuestions(quiz.QuizID);
        await fetchMonthlyArticles(month, selectedYear);
        setShowQuestionsModal(true);
    };

    const fetchMonthlyArticles = async (month, year) => {
        try {
            const response = await fetch(`${BASE_URL}api/CurrentAffairs/get_current_affairs_api.php`);
            const result = await response.json();
            if (result.status === 'success') {
                const monthIdx = months.indexOf(month);
                const filtered = (result.data || []).filter(item => {
                    const itemDate = new Date(item.date);
                    return itemDate.getFullYear() === parseInt(year) && itemDate.getMonth() === monthIdx;
                });
                setMonthlyArticles(filtered);
            }
        } catch (error) {
            console.error("Error fetching articles:", error);
        }
    };

    const fetchQuestions = async (quizId) => {
        try {
            const response = await fetch(`${BASE_URL}api/CurrentAffairs/get_questions.php?QuizID=${quizId}`);
            const result = await response.json();
            if (result.status === 'success') {
                setQuestions(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    const handleSaveQuestion = async () => {
        const payload = {
            ...questionForm,
            QuizID: currentQuizId,
            QuestionID: editingQuestionId,
            action: 'save'
        };

        try {
            const response = await fetch(`${BASE_URL}api/CurrentAffairs/manage_questions.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.status === 'success') {
                fetchQuestions(currentQuizId);
                setShowAddQuestionModal(false);
                resetQuestionForm();
                showToast("Saved successfully");
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            console.error("Error saving question:", error);
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!checkPermission('delete question')) return;
        setConfirmConfig({
            title: 'Delete Question',
            message: 'Are you sure you want to delete this question? This action cannot be undone.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    const response = await fetch(`${BASE_URL}api/CurrentAffairs/manage_questions.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ QuestionID: id, action: 'delete' })
                    });
                    const result = await response.json();
                    if (result.status === 'success') {
                        fetchQuestions(currentQuizId);
                    }
                } catch (error) {
                    console.error("Error deleting question:", error);
                }
            }
        });
        setShowConfirmModal(true);
    };


    const resetQuestionForm = () => {
        setQuestionFormData({
            Question_En: '', Question_Hi: '',
            OptionA_En: '', OptionA_Hi: '',
            OptionB_En: '', OptionB_Hi: '',
            OptionC_En: '', OptionC_Hi: '',
            OptionD_En: '', OptionD_Hi: '',
            OptionE_En: '', OptionE_Hi: '',
            CorrectAnswer: 'A', SolutionLink: ''
        });
        setEditingQuestionId(null);
    };

    const editQuestion = (q) => {
        setQuestionFormData({
            Question_En: q.Question_En, Question_Hi: q.Question_Hi,
            OptionA_En: q.OptionA_En, OptionA_Hi: q.OptionA_Hi,
            OptionB_En: q.OptionB_En, OptionB_Hi: q.OptionB_Hi,
            OptionC_En: q.OptionC_En, OptionC_Hi: q.OptionC_Hi,
            OptionD_En: q.OptionD_En, OptionD_Hi: q.OptionD_Hi,
            OptionE_En: q.OptionE_En, OptionE_Hi: q.OptionE_Hi,
            CorrectAnswer: q.CorrectAnswer, SolutionLink: q.SolutionLink || ''
        });
        setEditingQuestionId(q.QuestionID);
        setShowAddQuestionModal(true);
    };



    // Helper for Translation
    const handleTranslateField = async (field) => {
        const enField = `${field}_En`;
        const hiField = `${field}_Hi`;
        const text = questionForm[enField];
        const plainText = (text || '').replace(/<[^>]*>?/gm, '').trim();
        if (!plainText) return showToast("Enter English text first", 'error');

        try {
            const translated = await translateToHindi(text);
            if (translated) {
                setQuestionFormData(prev => ({ ...prev, [hiField]: translated }));
            }
        } catch (error) {
            console.error("Translation error", error);
        }
    };

    const qStyles = `
        .custom-quiz-editor .ql-editor {
            min-height: 180px !important;
            font-size: 16px;
        }
        .option-editor .ql-editor {
            min-height: 120px !important;
            font-size: 15px;
        }
    `;

    // Voice integration for all 12 fields is complex to manage with hooks in a loop, 
    // so we'll just handle it for the currently active field if needed or provide buttons.
    // For brevity, we'll implement a simple one that can be used.
    const [activeVoiceField, setActiveVoiceField] = useState(null);
    const { isListening, startListening } = useSpeechToText((transcript) => {
        if (activeVoiceField) {
            setQuestionFormData(prev => {
                const prevVal = prev[activeVoiceField] || '';
                const cleanPrev = prevVal.replace(/<\/p>$/, '');
                const newVal = cleanPrev === "" || cleanPrev === "<p>" || cleanPrev === "<p><br>"
                    ? `<p>${transcript}</p>`
                    : `${cleanPrev} ${transcript}</p>`;
                return { ...prev, [activeVoiceField]: newVal };
            });
        }
    });

    const filteredQuestions = questions.filter(q => 
        q.QuestionID.toString().includes(questionSearch) || 
        q.Question_En.toLowerCase().includes(questionSearch.toLowerCase())
    );

    return (
        <div className={`mt-8 p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <style>{qStyles}</style>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-[#3936C9]" />
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Monthly Quiz Management</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Year:</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className={`px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                        {[new Date().getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                {months.map((month) => (
                    <div
                        key={month}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border transition-all ${
                            quizzes[month] 
                            ? (isDarkMode ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-200')
                            : (isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100')
                        }`}
                    >
                        <div className="flex items-center space-x-4">
                            <h3 className={`font-bold text-lg min-w-[120px] ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{month}</h3>
                            {quizzes[month] && (
                                <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">Active</span>
                            )}
                        </div>
                        
                        <div className="flex items-center space-x-1 sm:space-x-3">
                            <button onClick={() => openMarksModal(month)} title="Category Marks" className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors text-blue-500">
                                <Award className="w-5 h-5" />
                            </button>
                            <button onClick={() => openQuestionsModal(month)} title="Manage Questions" className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors text-purple-500">
                                <Eye className="w-5 h-5" />
                            </button>
                            <button onClick={() => openDetailsModal(month)} title="Edit Details" className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors text-orange-500">
                                <Edit3 className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteQuiz(month)} title="Delete Quiz" className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors text-red-500">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>



            {/* Category Marks Modal */}
            <Modal show={showMarksModal} onClose={() => setShowMarksModal(false)} title={`Passing Marks - ${currentMonth} ${selectedYear}`} isDarkMode={isDarkMode}>
                <div className="grid grid-cols-2 gap-4">
                    {Object.keys(marksForm).map(cat => (
                        <div key={cat}>
                            <label className="block text-xs font-medium mb-1">{cat}</label>
                            <input
                                type="number"
                                step="0.01"
                                value={marksForm[cat]}
                                onChange={(e) => setMarksForm({ ...marksForm, [cat]: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={() => handleSaveQuizDetails()} className="px-6 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors">
                        Save Marks
                    </button>
                </div>
            </Modal>

            {/* Quiz Details Modal */}
            <Modal show={showDetailsModal} onClose={() => setShowQuizDetailsModal(false)} title={`Quiz Details - ${currentMonth} ${selectedYear}`} isDarkMode={isDarkMode}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium mb-1">Overall Time (Minutes)</label>
                        <input
                            type="number"
                            value={detailsForm.overallTime}
                            onChange={(e) => setDetailsForm({ ...detailsForm, overallTime: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1">Maximum Marks</label>
                        <input
                            type="number"
                            value={detailsForm.maxMarks}
                            onChange={(e) => setDetailsForm({ ...detailsForm, maxMarks: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium mb-1">Positive Marking</label>
                            <input
                                type="number"
                                step="0.01"
                                value={detailsForm.positiveMarking}
                                onChange={(e) => setDetailsForm({ ...detailsForm, positiveMarking: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Negative Marking</label>
                            <input
                                type="number"
                                step="0.01"
                                value={detailsForm.negativeMarking}
                                onChange={(e) => setDetailsForm({ ...detailsForm, negativeMarking: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={() => handleSaveQuizDetails()} className="px-6 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors">
                        Save Details
                    </button>
                </div>
            </Modal>

            {/* Questions Management Modal */}
            <Modal show={showQuestionsModal} onClose={() => setShowQuestionsModal(false)} title={`Questions - ${currentMonth} ${selectedYear}`} size="max-w-4xl" isDarkMode={isDarkMode}>
                <div className="flex flex-col space-y-4 h-[70vh]">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => { resetQuestionForm(); setShowAddQuestionModal(true); }} className="flex items-center space-x-2 px-4 py-2 bg-[#3936C9] text-white rounded-lg">
                                <Plus className="w-4 h-4" />
                                <span>Add Question</span>
                            </button>
                            <span className="text-sm font-medium">Total: {questions.length}</span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={questionSearch}
                                onChange={(e) => setQuestionSearch(e.target.value)}
                                className={`w-full sm:w-auto pl-10 pr-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto border rounded-lg dark:border-gray-700">
                        <div className="min-w-[500px]">
                        <table className="w-full text-left">
                            <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                                <tr>
                                    <th className="px-4 py-3 text-xs font-bold uppercase">ID</th>
                                    <th className="px-4 py-3 text-xs font-bold uppercase">Question Preview</th>
                                    <th className="px-4 py-3 text-xs font-bold uppercase text-center">Correct</th>
                                    <th className="px-4 py-3 text-xs font-bold uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredQuestions.map(q => (
                                    <tr key={q.QuestionID} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                                        <td className="px-4 py-3 text-sm">{q.QuestionID}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="truncate max-w-md" dangerouslySetInnerHTML={{ __html: q.Question_En }} />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center font-bold">{q.CorrectAnswer}</td>
                                        <td className="px-4 py-3 text-sm text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => editQuestion(q)} className="text-blue-500 hover:text-blue-700"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteQuestion(q.QuestionID)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Add/Edit Question Modal */}
            <AnimatePresence>
                {showAddQuestionModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                        >
                            <div className="px-6 py-4 border-b flex items-center justify-between dark:border-gray-700">
                                <h3 className="text-xl font-bold">{editingQuestionId ? 'Edit Question' : 'Add New Question'}</h3>
                                <button onClick={() => setShowAddQuestionModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Question Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8 border-b dark:border-gray-700">
                                    <EditorGroup 
                                        label="English Question" 
                                        value={questionForm.Question_En} 
                                        onChange={(v) => setQuestionFormData({...questionForm, Question_En: v})}
                                        onVoice={() => { setActiveVoiceField('Question_En'); startListening(); }}
                                        isDarkMode={isDarkMode}
                                        isListening={isListening && activeVoiceField === 'Question_En'}
                                        customClass="custom-quiz-editor"
                                    />
                                    <EditorGroup 
                                        label="Hindi Question" 
                                        value={questionForm.Question_Hi} 
                                        onChange={(v) => setQuestionFormData({...questionForm, Question_Hi: v})}
                                        onTranslate={() => handleTranslateField('Question')}
                                        onVoice={() => { setActiveVoiceField('Question_Hi'); startListening(); }}
                                        isDarkMode={isDarkMode}
                                        isListening={isListening && activeVoiceField === 'Question_Hi'}
                                        customClass="custom-quiz-editor"
                                    />
                                </div>

                                {/* Options Rows */}
                                <div className="space-y-10">
                                    {['A', 'B', 'C', 'D', 'E'].map(opt => (
                                        <div key={opt} className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-b pb-8 dark:border-gray-700 last:border-0">
                                            <EditorGroup 
                                                label={`Option ${opt} (English)`} 
                                                value={questionForm[`Option${opt}_En`]} 
                                                onChange={(v) => setQuestionFormData({...questionForm, [`Option${opt}_En`]: v})}
                                                onVoice={() => { setActiveVoiceField(`Option${opt}_En`); startListening(); }}
                                                isDarkMode={isDarkMode}
                                                isListening={isListening && activeVoiceField === `Option${opt}_En`}
                                                customClass="option-editor"
                                            />
                                            <EditorGroup 
                                                label={`Option ${opt} (Hindi)`} 
                                                value={questionForm[`Option${opt}_Hi`]} 
                                                onChange={(v) => setQuestionFormData({...questionForm, [`Option${opt}_Hi`]: v})}
                                                onTranslate={() => handleTranslateField(`Option${opt}`)}
                                                onVoice={() => { setActiveVoiceField(`Option${opt}_Hi`); startListening(); }}
                                                isDarkMode={isDarkMode}
                                                isListening={isListening && activeVoiceField === `Option${opt}_Hi`}
                                                customClass="option-editor"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Common Settings */}
                                <div className="pt-8 border-t dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Correct Option</label>
                                        <select
                                            value={questionForm.CorrectAnswer}
                                            onChange={(e) => setQuestionFormData({...questionForm, CorrectAnswer: e.target.value})}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                        >
                                            <option value="A">Option A</option>
                                            <option value="B">Option B</option>
                                            <option value="C">Option C</option>
                                            <option value="D">Option D</option>
                                            <option value="E">Option E</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Solution Page Link (Optional)</label>
                                        <select
                                            value={questionForm.SolutionLink}
                                            onChange={(e) => setQuestionFormData({...questionForm, SolutionLink: e.target.value})}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3936C9] ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                        >
                                            <option value="">No Link</option>
                                            {monthlyArticles.map(article => (
                                                <option key={article.id} value={`https://anirbansacademy.com/summary/${getSlug(article.title_en)}`}>
                                                    {article.title_en}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 sm:px-6 py-4 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
                                <button onClick={() => setShowAddQuestionModal(false)} className={`w-full sm:w-auto px-6 py-2 border rounded-lg ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>Cancel</button>
                                <button onClick={handleSaveQuestion} className="w-full sm:w-auto px-8 py-2 bg-[#3936C9] text-white rounded-lg flex items-center justify-center space-x-2">
                                    <Save className="w-4 h-4" />
                                    <span>{editingQuestionId ? 'Update Question' : 'Save Question'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Double Confirmation Popup */}
            <Modal show={showConfirmModal} onClose={() => setShowConfirmModal(false)} title={confirmConfig.title} isDarkMode={isDarkMode} maxWidth="max-w-md">
                <div className="p-4 text-center">
                    <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{confirmConfig.message}</p>
                    <div className="flex items-center justify-center space-x-4">
                        {confirmConfig.type === 'confirm' ? (
                            <>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className={`px-6 py-2 rounded-lg border font-medium ${isDarkMode ? 'border-gray-600 text-white hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        confirmConfig.onConfirm();
                                        setShowConfirmModal(false);
                                    }}
                                    className="px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                                >
                                    Confirm Delete
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-8 py-2 rounded-lg bg-[#3936C9] text-white font-medium hover:bg-[#2D2B9E] transition-colors"
                            >
                                OK
                            </button>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
                    >
                        <div className={`px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-3 ${
                            toast.type === 'success' 
                            ? 'bg-[#3936C9] text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                {toast.type === 'success' ? '✓' : '!'}
                            </div>
                            <span className="font-bold tracking-wide">{toast.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};



const EditorGroup = ({ label, value, onChange, onTranslate, onVoice, isDarkMode, isListening, customClass }) => (
    <div className="space-y-1">
        <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</label>
            <div className="flex space-x-1">
                {onTranslate && (
                    <button onClick={onTranslate} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-blue-500" title="Translate">
                        <Languages className="w-3.5 h-3.5" />
                    </button>
                )}
                {onVoice && (
                    <button onClick={onVoice} className={`p-1 rounded transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'}`} title="Voice">
                        <Mic className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
        <div className={`rounded-lg border overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={quillModules}
                formats={quillFormats}
                className={`${customClass} ${isDarkMode ? 'dark-quill' : ''}`}
            />
        </div>
    </div>
);


const Modal = ({ show, onClose, title, children, size = "max-w-md", isDarkMode }) => (
    <AnimatePresence>
        {show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className={`w-full ${size} rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                >
                    <div className="px-6 py-4 border-b flex items-center justify-between dark:border-gray-700 flex-shrink-0">
                        <h3 className="font-bold">{title}</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        {children}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export default Admin_Current_Affairs_Monthly_Test;
