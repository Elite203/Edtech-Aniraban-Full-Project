import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from "react-dom";
import { Camera, ChevronRight, ChevronLeft, User, Languages } from 'lucide-react';
import { FaFlag, FaBookmark, FaRegBookmark, FaTimes } from "react-icons/fa";
import FullscreenViolation from '../../components/NewUI/FullScreenViolation';
import WatermarkComponent from '../../components/NewUI/WatermarkComponent';
import { useStudentProfile } from '../../components/NewUI/StudentProfileData';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import SaveReportActions from '../../components/exam/SaveReportActions';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Current_Affairs_Exam_Page = () => {
  const { user } = useStudentProfile();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(location.state?.quiz);
  const initialLanguage = location.state?.language || 'en';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isViolationVisible, setIsViolationVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const [savedQuestions, setSavedQuestions] = useState(new Set());
  const [reportedQuestions, setReportedQuestions] = useState(new Set());

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [responses, setResponses] = useState({}); // { questionID: { selectedAnswer, status, timeSpent } }

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // Save quiz to sessionStorage if provided in state
    if (location.state?.quiz) {
      sessionStorage.setItem(`ca_quiz_data_${user?.id}`, JSON.stringify(location.state.quiz));
      setQuiz(location.state.quiz);
    } else {
      // Try to recover quiz from sessionStorage on reload
      const savedQuiz = sessionStorage.getItem(`ca_quiz_data_${user?.id}`);
      if (savedQuiz) {
        setQuiz(JSON.parse(savedQuiz));
      }
    }
  }, [location.state, user?.id]);

  useEffect(() => {
    if (!quiz && !loading) {
      navigate('/current-affairs');
      return;
    }
    if (!quiz) return;
    if (!user?.id) return;

    fetchQuestions();
    fetchSaveReportStatus();

    // Initial Fullscreen check (Stricter)
    if (!document.fullscreenElement && !showSubmitModal) {
      setIsViolationVisible(true);
    }

    // Timer Persistence Logic (Session-based)
    const storageKey = `ca_exam_end_time_${quiz.QuizID}_${user?.id}`;
    let endTime = sessionStorage.getItem(storageKey);

    if (!endTime) {
      endTime = Date.now() + (quiz.OverallTime || 20) * 60 * 1000;
      sessionStorage.setItem(storageKey, endTime);
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      return remaining;
    };

    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);

    if (initialTime <= 0) {
      handleSubmitExam();
    } else {
      startTimer();
    }

    // Navigation Protection
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = (e) => {
      window.history.pushState(null, null, window.location.pathname);
    };
    
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Fullscreen Violation Logic
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !loading && !showSubmitModal) {
        setIsViolationVisible(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      clearInterval(timerRef.current);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [quiz, user?.id]);

  const fetchSaveReportStatus = async () => {
    if (!user?.id || !quiz) return;
    try {
      const response = await axios.get(`${BASE_URL}api/SaveandReport/get_status.php?student_id=${user.id}`);
      if (response.data.success) {
        setSavedQuestions(new Set(response.data.saved.map(id => parseInt(id))));
        setReportedQuestions(new Set(response.data.reported.map(id => parseInt(id))));
      }
    } catch (error) {
      console.error("Error fetching save/report status:", error);
    }
  };

  const handleReportSuccess = (questionId) => {
    setReportedQuestions(prev => new Set([...prev, parseInt(questionId)]));
  };

  // Track time spent per question
  useEffect(() => {
    if (loading || !questions.length || showSubmitModal) return;

    const timeSpentInterval = setInterval(() => {
      const qID = questions[currentIndex]?.QuestionID;
      if (qID && responses[qID]) {
        setResponses(prev => ({
          ...prev,
          [qID]: { ...prev[qID], timeSpent: (prev[qID].timeSpent || 0) + 1 }
        }));
      }
    }, 1000);

    return () => clearInterval(timeSpentInterval);
  }, [currentIndex, questions, loading, showSubmitModal]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/CurrentAffairs/get_questions.php?QuizID=${quiz.QuizID}`);
      if (response.data.status === 'success') {
        const fetchedQuestions = response.data.data || [];
        setQuestions(fetchedQuestions);
        // Initialize responses
        const initialResponses = {};
        fetchedQuestions.forEach(q => {
          initialResponses[q.QuestionID] = {
            selectedAnswer: null,
            status: 'not_visited', // not_visited, not_answered, answered, marked, answered_marked
            timeSpent: 0
          };
        });
        if (fetchedQuestions.length > 0) {
          initialResponses[fetchedQuestions[0].QuestionID].status = 'not_answered';
        }
        setResponses(initialResponses);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleOptionSelect = (option) => {
    const qID = questions[currentIndex].QuestionID;
    setResponses(prev => ({
      ...prev,
      [qID]: { ...prev[qID], selectedAnswer: option }
    }));
  };

  const handleSaveAndNext = () => {
    const qID = questions[currentIndex].QuestionID;
    const resp = responses[qID];

    let newStatus = resp.selectedAnswer ? 'answered' : 'not_answered';

    setResponses(prev => ({
      ...prev,
      [qID]: { ...prev[qID], status: newStatus }
    }));

    if (currentIndex < questions.length - 1) {
      const nextQID = questions[currentIndex + 1].QuestionID;
      if (responses[nextQID].status === 'not_visited') {
        setResponses(prev => ({
          ...prev,
          [nextQID]: { ...prev[nextQID], status: 'not_answered' }
        }));
      }
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleMarkForReview = () => {
    const qID = questions[currentIndex].QuestionID;
    const resp = responses[qID];

    let newStatus = resp.selectedAnswer ? 'answered_marked' : 'marked';

    setResponses(prev => ({
      ...prev,
      [qID]: { ...prev[qID], status: newStatus }
    }));

    if (currentIndex < questions.length - 1) {
      const nextQID = questions[currentIndex + 1].QuestionID;
      if (responses[nextQID].status === 'not_visited') {
        setResponses(prev => ({
          ...prev,
          [nextQID]: { ...prev[nextQID], status: 'not_answered' }
        }));
      }
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleClearResponse = () => {
    const qID = questions[currentIndex].QuestionID;
    setResponses(prev => ({
      ...prev,
      [qID]: { ...prev[qID], selectedAnswer: null }
    }));
  };

  const handlePaletteClick = (index) => {
    const currentQID = questions[currentIndex].QuestionID;
    const targetQID = questions[index].QuestionID;

    // Update current status if it was not_visited
    if (responses[targetQID].status === 'not_visited') {
      setResponses(prev => ({
        ...prev,
        [targetQID]: { ...prev[targetQID], status: 'not_answered' }
      }));
    }

    setCurrentIndex(index);
  };

  const handleSubmitExam = async () => {
    setShowConfirmModal(false);
    
    // Defensive retrieval of IDs
    const studentId = user?.id || localStorage.getItem("user_id")?.replace(/"/g, '') || JSON.parse(localStorage.getItem("student_user") || "{}").id;
    const quizId = quiz?.QuizID || location.state?.quiz?.QuizID;

    if (!studentId || !quizId) {
      setSubmitResult({ 
        status: 'error', 
        message: 'Identity verification failed. Please ensure you are logged in.' 
      });
      setShowSubmitModal(true);
      return;
    }

    setLoading(true);

    const payload = {
      StudentID: studentId,
      QuizID: quizId,
      responses: responses
    };

    try {
      const response = await axios.post(`${BASE_URL}api/CurrentAffairs/submit_exam.php`, payload);
      
      if (response.data.status === 'success') {
        // Clear session only on success
        sessionStorage.removeItem(`ca_exam_end_time_${quizId}_${studentId}`);
        sessionStorage.removeItem(`ca_quiz_data_${studentId}`);
      }
      
      setSubmitResult(response.data);
      setShowSubmitModal(true);
    } catch (error) {
      console.error("Error submitting exam:", error);
      setSubmitResult({ status: 'error', message: 'Failed to connect to server. Please check your internet.' });
      setShowSubmitModal(true);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const currentResp = currentQuestion ? responses[currentQuestion.QuestionID] : null;

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleReturnToExam = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsViolationVisible(false);
    } catch (err) {
      console.warn("Failed to re-enter fullscreen:", err);
      setIsViolationVisible(false);
    }
  };

  if (loading || !currentQuestion) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const isHindi = selectedLanguage === 'hi';
  const qText = isHindi ? currentQuestion.Question_Hi : currentQuestion.Question_En;
  const options = ['A', 'B', 'C', 'D', 'E'].map(key => ({
    key,
    text: isHindi ? currentQuestion[`Option${key}_Hi`] : currentQuestion[`Option${key}_En`]
  })).filter(opt => opt.text && opt.text.trim() !== '' && opt.text !== '<p><br></p>');

  // Stats for Palette
  const stats = {
    answered: Object.values(responses).filter(r => r.status === 'answered').length,
    not_answered: Object.values(responses).filter(r => r.status === 'not_answered').length,
    not_visited: Object.values(responses).filter(r => r.status === 'not_visited').length,
    marked: Object.values(responses).filter(r => r.status === 'marked').length,
    answered_marked: Object.values(responses).filter(r => r.status === 'answered_marked').length,
  };

  const sidebarContent = (
    <div className={`h-full flex flex-col p-4 rounded-2xl border transition-all overflow-hidden bg-[#e1f5fe] dark:bg-gray-800 border-[#b3e5fc] dark:border-gray-700 ${sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Profile Area */}
      <div className="flex items-center justify-between md:justify-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-20 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600 overflow-hidden">
            {user?.photo ? (
              <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-gray-400" />
            )}
          </div>
          <div className="w-16 h-20 bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-500 rounded-lg flex items-center justify-center">
            <Camera size={32} className="text-gray-600 dark:text-gray-300" />
          </div>
        </div>
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300"
        >
          <FaTimes size={18} />
        </button>
      </div>
      <div className="text-center font-bold mb-4 uppercase tracking-wide">{user?.name || "Guest"}</div>

      {/* Question Symbols Legend */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-3 mb-4 px-2">
        <LegendItem color="bg-[#2e7d32] text-white" count={stats.answered} label="Answered" />
        <LegendItem color="bg-[#cc0000] rounded-t-xl text-white" count={stats.not_answered} label="Not Answered" />
        <LegendItem color="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200" count={stats.not_visited} label="Not Visited" />
        <LegendItem color="bg-[#7b1fa2] rounded-full text-white" count={stats.marked} label="Marked for Review" />
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-semibold relative col-span-2">
          <div className="w-6 h-6 bg-[#7b1fa2] text-white rounded-full flex items-center justify-center">{stats.answered_marked}</div>
          <div className="absolute top-0 right-[calc(100%-1.5rem)] w-2.5 h-2.5 bg-[#2e7d32] rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
          <span>Answered & Marked for Review</span>
        </div>
      </div>

      {/* Palette Container */}
      <div className={`flex-1 p-4 rounded-2xl shadow-inner overflow-hidden flex flex-col bg-white dark:bg-gray-900/50`}>
        <h4 className="text-center font-bold mb-3 text-sm md:text-base border-b pb-2 dark:border-gray-700">QUESTION PALETTE</h4>
        <div className="palette-grid grid grid-cols-4 gap-2 overflow-y-auto pr-1">
          {questions.map((q, idx) => (
            <div
              key={q.QuestionID}
              onClick={() => handlePaletteClick(idx)}
              className={`h-9 flex items-center justify-center rounded cursor-pointer font-bold text-sm transition-all duration-200 ${getPaletteColor(responses[q.QuestionID].status, currentIndex === idx)}`}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-4 space-y-3">
        <button
          onClick={() => setShowInstructions(true)}
          className="w-full bg-[#0091ea] hover:bg-[#0081d5] text-white py-2 rounded-lg font-bold text-xs transition-colors shadow-sm"
        >
          Instructions
        </button>
        <button
          onClick={() => setShowConfirmModal(true)}
          className="w-full bg-[#ff9800] hover:bg-[#f57c00] text-white py-3 rounded-lg font-bold text-lg shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Submit
        </button>
      </div>
    </div>
  );

  const sidebarElement = (
    <div className={`transition-all duration-300 z-[150] transform ${isMobile ? 'fixed inset-y-0 right-0 w-[300px]' : 'relative h-full w-[320px]'} shadow-2xl md:shadow-none bg-[#e1f5fe] dark:bg-gray-800 md:bg-transparent ${sidebarCollapsed ? (isMobile ? 'translate-x-full' : 'md:w-0') : (isMobile ? 'translate-x-0' : 'md:w-[320px]')}`}>
      <button
        onClick={toggleSidebar}
        className="absolute right-full top-1/2 -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white w-6 h-16 rounded-l-xl z-[102] flex items-center justify-center shadow-lg hover:bg-gray-700 transition-all duration-300"
      >
        {sidebarCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
      {sidebarContent}
    </div>
  );

  const sidebarBackdrop = isMobile && !sidebarCollapsed && (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140]"
      onClick={() => setSidebarCollapsed(true)}
    />
  );

  return (
    <div className={`h-screen flex flex-col font-sans transition-colors duration-300 overflow-hidden bg-[#f0f2f5] dark:bg-gray-900 text-gray-900 dark:text-white`}>
      <FullscreenViolation isVisible={isViolationVisible} onReturn={handleReturnToExam} />
      <WatermarkComponent text={user?.number} />

      {/* Header */}
      <header className={`bg-[#cc0000] dark:bg-red-900 text-white py-3 px-4 text-center text-xl md:text-2xl font-bold rounded-b-[40px] mx-2 md:mx-4 mb-2 z-10 shadow-md`}>
        {quiz.Month} {quiz.Year} current affairs Mock test
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row p-2 md:p-3 gap-2 md:gap-3 min-h-0 overflow-hidden relative">

        {/* Question Section */}
        <div className={`flex-1 flex flex-col min-h-0 rounded-xl border transition-all duration-300 shadow-sm bg-white dark:bg-gray-800 border-[#d1d1d1] dark:border-gray-700`}>
          {/* Section Header */}
          <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span className="bg-[#ff9800] text-white px-3 md:px-6 py-1.5 md:py-2 rounded-full font-bold text-xs md:text-base shadow-sm">
                CURRENT AFFAIRS
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedLanguage(isHindi ? 'en' : 'hi')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-bold"
                >
                  <Languages size={14} />
                  {isHindi ? 'ENGLISH' : 'HINDI'}
                </button>

                <button
                  onClick={toggleSidebar}
                  className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                >
                  PALETTE
                </button>

                <SaveReportActions 
                  questionId={currentQuestion.QuestionID}
                  quizType="current_affairs"
                  isSaved={savedQuestions.has(parseInt(currentQuestion.QuestionID))}
                  isReported={reportedQuestions.has(parseInt(currentQuestion.QuestionID))}
                  studentId={user?.id}
                  onSaveToggle={(newState) => {
                    const newSaved = new Set(savedQuestions);
                    if (newState) newSaved.add(parseInt(currentQuestion.QuestionID));
                    else newSaved.delete(parseInt(currentQuestion.QuestionID));
                    setSavedQuestions(newSaved);
                  }}
                  onReportSuccess={() => handleReportSuccess(currentQuestion.QuestionID)}
                  iconSize="16"
                />
              </div>
            </div>
            <div className="flex justify-between sm:justify-end items-center gap-4 w-full sm:w-auto">
              <div className="flex gap-2 text-[10px] md:text-xs font-black uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                  Correct: +{quiz.PositiveMarking}
                </span>
                <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                  Wrong: -{quiz.NegativeMarking}
                </span>
              </div>
              <span className="font-bold text-lg md:text-xl text-red-600 dark:text-red-400 whitespace-nowrap">
                TIME LEFT: {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            <div className="mb-6">
              <strong className="text-lg md:text-xl block mb-2">Question : {currentIndex + 1}</strong>
              <div className="text-base md:text-lg leading-relaxed mb-6 quill-content break-all whitespace-normal overflow-hidden" dangerouslySetInnerHTML={{ __html: qText }} />
            </div>

            <div className="space-y-3">
              {options.map((opt, idx) => (
                <label
                  key={opt.key}
                  className={`flex items-center p-3 md:p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${currentResp.selectedAnswer === opt.key
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-500'
                    : 'bg-[#f1f3f4] dark:bg-gray-700 border-[#e0e0e0] dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                >
                  <input
                    type="radio"
                    name={`q-${currentQuestion.QuestionID}`}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 mr-3"
                    checked={currentResp.selectedAnswer === opt.key}
                    onChange={() => handleOptionSelect(opt.key)}
                  />
                  <span className="text-sm md:text-base flex-1">
                    <span className="font-bold mr-2">{opt.key}.</span>
                    <span dangerouslySetInnerHTML={{ __html: opt.text }} className="inline-block align-middle" />
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Question Footer */}
          <div className="p-4 md:p-6 flex flex-wrap gap-2 justify-between border-t dark:border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={handleMarkForReview}
                className="bg-[#673ab7] hover:bg-[#5e35b1] text-white px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-colors shadow-sm"
              >
                Mark for Review & Next
              </button>
              <button
                onClick={handleClearResponse}
                className="bg-[#0091ea] hover:bg-[#0081d5] text-white px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-colors shadow-sm"
              >
                Clear Response
              </button>
            </div>
            <button
              onClick={handleSaveAndNext}
              className="bg-[#ff9800] hover:bg-[#f57c00] text-white px-6 md:px-8 py-2 rounded-lg font-bold text-xs md:text-sm transition-colors shadow-sm min-w-[120px]"
            >
              Save & Next
            </button>
          </div>
        </div>

      {/* Render backdrop and sidebar */}
      {isMobile ? (
        <>
          {sidebarBackdrop && createPortal(sidebarBackdrop, document.body)}
          {createPortal(sidebarElement, document.body)}
        </>
      ) : (
        sidebarElement
      )}
    </div>

      {/* Confirmation Modal */}
      <Modal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Submit Exam?"
        isDarkMode={isDarkMode}
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-3xl">
            ?
          </div>
          <div className="space-y-2">
            <p className="font-bold text-lg text-gray-800 dark:text-white">Are you sure?</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Do you want to submit your answers? You cannot change them later.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitExam}
              className="flex-1 py-3 bg-[#ff9800] text-white rounded-xl font-bold shadow-lg hover:bg-[#f57c00] transition-all"
            >
              Yes, Submit
            </button>
          </div>
        </div>
      </Modal>


      {/* Shared SaveReportActions handles the Report Modal internally via createPortal */}

      {/* Submission Result Modal */}
      <Modal
        show={showSubmitModal}
        onClose={() => navigate('/current-affairs')}
        title={submitResult?.status === 'success' ? "Exam Submitted" : "Submission Error"}
        isDarkMode={isDarkMode}
      >
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl ${submitResult?.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
            {submitResult?.status === 'success' ? '✓' : '!'}
          </div>

          <div className="space-y-2">
            <p className="font-bold text-lg">
              {submitResult?.status === 'success' ? submitResult.message : "Error!"}
            </p>
            {submitResult?.status === 'success' && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl text-sm space-y-1">
                <p>Attempt: <strong>#{submitResult.data.attemptNumber}</strong></p>
                <p>Date: <strong>{submitResult.data.date}</strong></p>
                <p>Time: <strong>{submitResult.data.time}</strong></p>
              </div>
            )}
            {submitResult?.status === 'error' && (
              <p className="text-red-500 text-sm">{submitResult.message}</p>
            )}
          </div>

          <button
            onClick={() => {
              if (submitResult?.status === 'success' && submitResult?.data?.attemptNumber) {
                navigate(`/current-affairs-exam/result/${quiz?.QuizID}`, { 
                  state: { attemptNumber: submitResult.data.attemptNumber } 
                });
              } else {
                navigate('/current-affairs');
              }
            }}
            className="w-full py-3 bg-[#3936C9] text-white rounded-xl font-bold shadow-lg hover:bg-[#2D2B9E] transition-all"
          >
            {submitResult?.status === 'success' ? 'View Result' : 'Go Back to Dashboard'}
          </button>
        </div>
      </Modal>

      {/* Instructions Modal */}
      <InstructionsModal
        show={showInstructions}
        onClose={() => setShowInstructions(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

const Modal = ({ show, onClose, title, children, isDarkMode }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-bold">{title}</h3>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, count, label }) => (
  <div className="flex items-center gap-2 text-[10px] md:text-xs font-semibold">
    <div className={`w-6 h-6 ${color} flex items-center justify-center`}>{count}</div>
    <span>{label}</span>
  </div>
);

const getPaletteColor = (status, isActive) => {
  if (isActive) return 'ring-2 ring-[#0091ea] ring-offset-2 dark:ring-offset-gray-900 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-[#0091ea]';
  switch (status) {
    case 'answered': return 'bg-[#2e7d32] text-white shadow-sm';
    case 'not_answered': return 'bg-[#cc0000] text-white rounded-t-xl';
    case 'marked': return 'bg-[#7b1fa2] text-white rounded-full';
    case 'answered_marked': return 'bg-[#7b1fa2] text-white rounded-full relative after:content-[""] after:absolute after:top-0 after:right-0 after:w-2 after:h-2 after:bg-green-500 after:rounded-full after:border after:border-white';
    default: return 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-gray-400';
  }
};

const InstructionsModal = ({ show, onClose, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('en');
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-[#f0f2f5] dark:bg-gray-900 overflow-hidden font-sans">
      <div className="p-4 md:p-6 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <h3 className="font-bold text-xl md:text-2xl text-[#cc0000] dark:text-red-400">Exam Instructions</h3>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1 w-fit">
            <button
              onClick={() => setActiveTab('en')}
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${activeTab === 'en' ? 'bg-[#0091ea] text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              ENGLISH
            </button>
            <button
              onClick={() => setActiveTab('hi')}
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${activeTab === 'hi' ? 'bg-[#0091ea] text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              HINDI
            </button>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors group">
          <ChevronRight className="rotate-180 text-gray-600 dark:text-gray-300 group-hover:scale-110" size={28} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-10 rounded-2xl border dark:border-gray-700 shadow-sm">
          <div className="prose dark:prose-invert max-w-none">
            {activeTab === 'en' ? (
              <div className="space-y-6 text-gray-800 dark:text-gray-200">
                <h3 className="text-xl font-bold text-[#0091ea] border-b-2 border-[#0091ea] pb-2">General Instructions:</h3>
                <ol className="list-decimal pl-5 space-y-4">
                  <li>Total duration of the exam was mentioned before starting the test.</li>
                  <li>The examination time will be governed by the server. A countdown timer displayed at the top right corner of the screen will indicate the remaining time. Once the timer reaches zero, the examination will automatically conclude; no manual submission is required.</li>
                  <li>The Question Palette displayed on the right side of the screen indicates the status of each question using the following symbols:
                    <div className="mt-4 space-y-4 pl-4 border-l-4 border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold">01</div>
                        <span className="text-sm">You have not visited the question yet.</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-[#cc0000] text-white rounded-t-xl flex items-center justify-center text-xs font-bold">02</div>
                        <span className="text-sm">You have not answered the question.</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-[#2e7d32] text-white rounded-lg flex items-center justify-center text-xs font-bold">03</div>
                        <span className="text-sm">You have answered the question.</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-[#7b1fa2] text-white rounded-full flex items-center justify-center text-xs font-bold">04</div>
                        <span className="text-sm">You have NOT answered the question, but have marked the question for review.</span>
                      </div>
                      <div className="flex items-center gap-4 relative">
                        <div className="w-8 h-8 bg-[#7b1fa2] text-white rounded-full flex items-center justify-center text-xs font-bold">05</div>
                        <div className="absolute top-0 right-[calc(100%-2rem)] w-3.5 h-3.5 bg-[#2e7d32] rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                        <span className="text-sm">You have answered the question, but marked it for review.</span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-medium italic text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                      The “Marked for Review” status indicates that the candidate intends to revisit the question. If a question is answered and marked for review, the response will be considered for evaluation unless modified.
                    </p>
                  </li>
                  <li>
                    <p className="font-bold mb-2 text-[#0091ea] text-lg">Navigation Instructions:</p>
                    <p className="mb-3">To answer the question, just do the following:</p>
                    <ul className="list-disc pl-6 space-y-3">
                      <li>Click on a question number in the Question Palette to navigate directly to that question. This action does not save the current response.</li>
                      <li>Click on <strong className="text-[#2e7d32]">Save & Next</strong> to save your response and proceed to the next question.</li>
                      <li>Click on <strong className="text-[#7b1fa2]">Mark for Review & Next</strong> to save your response, mark the question for review, and proceed to the next question.</li>
                    </ul>
                    <p className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 text-xs font-bold text-red-700 dark:text-red-400">
                      Note: Responses will not be saved if you navigate to another question without clicking Save & Next or Mark for Review & Next.
                    </p>
                  </li>
                  <li>
                    <p className="font-bold mb-2 text-[#0091ea] text-lg">Answering Instructions:</p>
                    <p className="mb-3 text-sm">Procedure for answering a multiple choice (MCQ) type question:</p>
                    <ul className="list-disc pl-6 space-y-3">
                      <li>Select the correct option (A, B, C, or D) by clicking on the corresponding option.</li>
                      <li>To deselect an option, click on it again or use the <strong className="text-[#0091ea]">Clear Response</strong> button.</li>
                      <li>To change your answer, select a different option.</li>
                      <li>Click on <strong className="text-[#2e7d32]">Save & Next</strong> to record your response.</li>
                    </ul>
                  </li>
                  <li>To mark a question for review, click on <strong className="text-[#7b1fa2]">Mark for Review & Next</strong>. If an answer is provided and the question is marked for review, the response will be considered for evaluation unless changed.</li>
                  <li>To modify an already answered question, revisit the question and follow the standard answering procedure.</li>
                  <li>Only those questions for which responses have been saved or marked for review after answering will be considered for evaluation.</li>
                  <li>Candidates are advised to regularly monitor the timer and ensure timely completion of the examination.</li>
                  <li>Any form of malpractice or deviation from the prescribed instructions may result in disqualification.</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-6 text-gray-800 dark:text-gray-200">
                <h3 className="text-xl font-bold text-[#0091ea] border-b-2 border-[#0091ea] pb-2">सामान्य निर्देश:</h3>
                <ol className="list-decimal pl-5 space-y-4">
                  <li>परीक्षा की कुल अवधि टेस्ट शुरू होने से पहले बताई गई थी।</li>
                  <li>परीक्षा का समय सर्वर द्वारा नियंत्रित किया जाएगा। स्क्रीन के ऊपरी दाएं कोने में प्रदर्शित काउंटडाउन टाइमर शेष समय को इंगित करेगा। एक बार टाइमर शून्य पर पहुंचने के बाद, परीक्षा स्वचालित रूप से समाप्त हो जाएगी; कोई मैनुअल सबमिशन आवश्यक नहीं है।</li>
                  <li>स्क्रीन के दाईं ओर प्रदर्शित प्रश्न पैलेट निम्नलिखित प्रतीकों का उपयोग करके प्रत्येक प्रश्न की स्थिति को इंगित करता है:
                    <div className="mt-4 space-y-4 pl-4 border-l-4 border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold">01</div>
                        <span className="text-sm">आपने अभी तक प्रश्न नहीं देखा है।</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-[#cc0000] text-white rounded-t-xl flex items-center justify-center text-xs font-bold">02</div>
                        <span className="text-sm">आपने प्रश्न का उत्तर नहीं दिया है।</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-[#2e7d32] text-white rounded-lg flex items-center justify-center text-xs font-bold">03</div>
                        <span className="text-sm">आपने प्रश्न का उत्तर दे दिया है।</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-[#7b1fa2] text-white rounded-full flex items-center justify-center text-xs font-bold">04</div>
                        <span className="text-sm">आपने प्रश्न का उत्तर नहीं दिया है, लेकिन समीक्षा के लिए चिह्नित किया है।</span>
                      </div>
                      <div className="flex items-center gap-4 relative">
                        <div className="w-8 h-8 bg-[#7b1fa2] text-white rounded-full flex items-center justify-center text-xs font-bold">05</div>
                        <div className="absolute top-0 right-[calc(100%-2rem)] w-3.5 h-3.5 bg-[#2e7d32] rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                        <span className="text-sm">आपने प्रश्न का उत्तर दे दिया है, लेकिन समीक्षा के लिए चिह्नित किया है।</span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-medium italic text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                      "समीक्षा के लिए चिह्नित" स्थिति इंगित करती है कि उम्मीदवार प्रश्न पर फिर से विचार करना चाहता है। यदि किसी प्रश्न का उत्तर दिया जाता है और समीक्षा के लिए चिह्नित किया जाता है, तो प्रतिक्रिया को मूल्यांकन के लिए माना जाएगा जब तक कि संशोधित न किया जाए।
                    </p>
                  </li>
                  <li>
                    <p className="font-bold mb-2 text-[#0091ea] text-lg">नेविगेशन निर्देश:</p>
                    <p className="mb-3">प्रश्न का उत्तर देने के लिए, बस निम्नलिखित करें:</p>
                    <ul className="list-disc pl-6 space-y-3">
                      <li>सीधे उस प्रश्न पर जाने के लिए प्रश्न पैलेट में प्रश्न संख्या पर क्लिक करें। यह क्रिया वर्तमान प्रतिक्रिया को सहेजती नहीं है।</li>
                      <li>अपनी प्रतिक्रिया को सहेजने और अगले प्रश्न पर जाने के लिए <strong className="text-[#2e7d32]">Save & Next</strong> पर क्लिक करें।</li>
                      <li>अपनी प्रतिक्रिया को सहेजने, समीक्षा के लिए प्रश्न को चिह्नित करने और अगले प्रश्न पर जाने के लिए <strong className="text-[#7b1fa2]">Mark for Review & Next</strong> पर क्लिक करें।</li>
                    </ul>
                    <p className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 text-xs font-bold text-red-700 dark:text-red-400">
                      नोट: यदि आप 'Save & Next' या 'Mark for Review & Next' पर क्लिक किए बिना किसी अन्य प्रश्न पर जाते हैं तो प्रतिक्रियाएं सहेजी नहीं जाएंगी।
                    </p>
                  </li>
                  <li>
                    <p className="font-bold mb-2 text-[#0091ea] text-lg">उत्तर देने के निर्देश:</p>
                    <p className="mb-3 text-sm">बहुविकल्पीय (MCQ) प्रकार के प्रश्न का उत्तर देने की प्रक्रिया:</p>
                    <ul className="list-disc pl-6 space-y-3">
                      <li>संबंधित विकल्प पर क्लिक करके सही विकल्प (A, B, C, या D) चुनें।</li>
                      <li>किसी विकल्प को अचयनित करने के लिए, उस पर फिर से क्लिक करें या <strong className="text-[#0091ea]">Clear Response</strong> बटन का उपयोग करें।</li>
                      <li>अपना उत्तर बदलने के लिए, एक अलग विकल्प चुनें।</li>
                      <li>अपनी प्रतिक्रिया रिकॉर्ड करने के लिए <strong className="text-[#2e7d32]">Save & Next</strong> पर क्लिक करें।</li>
                    </ul>
                  </li>
                  <li>किसी प्रश्न को समीक्षा के लिए चिह्नित करने के लिए, <strong className="text-[#7b1fa2]">Mark for Review & Next</strong> पर क्लिक करें। यदि उत्तर दिया गया है और प्रश्न को समीक्षा के लिए चिह्नित किया गया है, तो प्रतिक्रिया को मूल्यांकन के लिए माना जाएगा जब तक कि बदला न जाए।</li>
                  <li>पहले से उत्तर दिए गए प्रश्न को संशोधित करने के लिए, प्रश्न पर दोबारा जाएं और मानक उत्तर देने की प्रक्रिया का पालन करें।</li>
                  <li>केवल उन्हीं प्रश्नों पर मूल्यांकन के लिए विचार किया जाएगा जिनके उत्तर सहेजे गए हैं या उत्तर देने के बाद समीक्षा के लिए चिह्नित किए गए हैं।</li>
                  <li>उम्मीदवारों को सलाह दी जाती है कि वे नियमित रूप से टाइमर की निगरानी करें और परीक्षा को समय पर पूरा करना सुनिश्चित करें।</li>
                  <li>किसी भी प्रकार के कदाचार या निर्धारित निर्देशों से विचलन के परिणामस्वरूप अयोग्यता हो सकती है।</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-center shadow-inner">
        <button
          onClick={onClose}
          className="bg-[#cc0000] text-white px-12 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
        >
          Close & Return to Exam
        </button>
      </div>
    </div>
  );
};

export default Current_Affairs_Exam_Page;

