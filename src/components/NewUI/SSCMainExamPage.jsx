import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import SSCExamPageHeader from './SSCExamPageHeader';
import { useStudentProfile } from './StudentProfileData';
import WatermarkComponent from './WatermarkComponent';
import FullscreenViolation from './FullScreenViolation';
import SSCTestSummaryComponent from './SSCTestSummaryComponent';
import SSCInstructions from './SSCInstructions';
import SSCSubmitModal from './SSCSubmitModal';
import SSCFooter from './SSCFooter';
import ReattemptComparisonModal from '../exam/ReattemptComparisonModal';
import axios from 'axios';
import { FaFlag, FaTimes, FaBookmark, FaRegBookmark, FaCheck } from 'react-icons/fa';
import SaveReportActions from '../exam/SaveReportActions';
import { useToast } from '../ui/use-toast';

const SSCMainExamPage = () => {
  const { user, loading: profileLoading } = useStudentProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const isPracticeMode = queryParams.get('new_attempt') === 'true';

  const [examData, setExamData] = useState({
    examSet: null,
    subjects: [],
    questions: []
  });
  const [loading, setLoading] = useState(true);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: option }
  const [questionStatus, setQuestionStatus] = useState({}); // { questionId: 'not_visited' | 'not_answered' | 'answered' | 'marked' | 'marked_answered' }
  const [timeLeft, setTimeLeft] = useState(0);
  const [overallTime, setOverallTime] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [answeredCount, setAnsweredCount] = useState(0);
  const [timeConfig, setTimeConfig] = useState({ type: 'overall', sections: [] });
  const [isViolation, setIsViolation] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [showSummary, setShowSummary] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const [showSummaryHover, setShowSummaryHover] = useState(false);
  const [showInstructionsHover, setShowInstructionsHover] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittedSubjects, setSubmittedSubjects] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [originalResponses, setOriginalResponses] = useState({});
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [marking, setMarking] = useState({ positive: 1, negative: 0 });
  const [savedQuestionIds, setSavedQuestionIds] = useState(new Set());
  const [reportedQuestionIds, setReportedQuestionIds] = useState(new Set());
  const { toast } = useToast();
  const [questionTimers, setQuestionTimers] = useState({});

  const lastSectionRef = useRef(null);
  const lastSubjectRef = useRef(null);
  const timersRestoredRef = useRef(false);
  const stateLoadedRef = useRef(false);
  const isSubmittedRef = useRef(false);
  const sidebarRef = useRef(null);

  const examSetId = location.state?.examSetId || localStorage.getItem('sscExamSetId');

  // Ensure identifiers are in localStorage for later steps and refreshes
  useEffect(() => {
    const course_id = location.state?.course_id || location.state?.courseId;
    const exam_set_id = location.state?.exam_set_id || location.state?.examSetId;
    const set_number = location.state?.set_number || location.state?.setNumber;

    if (course_id) localStorage.setItem('sscCourseId', course_id.toString());
    if (exam_set_id) localStorage.setItem('sscExamSetId', exam_set_id.toString());
    if (set_number) localStorage.setItem('sscSetNumber', set_number.toString());
    
    // Clear any stale cache that might interfere with analysis of this attempt
    const safeCourseId = course_id || localStorage.getItem('sscCourseId');
    const safeExamSetId = exam_set_id || localStorage.getItem('sscExamSetId');
    const safeSetNumber = set_number || localStorage.getItem('sscSetNumber');
    localStorage.removeItem(`liveResponses_${safeCourseId}_${safeExamSetId}_${safeSetNumber}`);
    localStorage.removeItem(`subjectStats_${safeCourseId}_${safeExamSetId}_${safeSetNumber}`);
  }, [location.state]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isPracticeMode && !isSubmittedRef.current) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome to show the prompt
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPracticeMode]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (window.innerWidth < 768 && isSidebarOpen) {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
          setIsSidebarOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isSidebarOpen]);

  // Save state immediately when important things change
  const saveStateToLocalStorage = useCallback((overrides = {}) => {
    if (isPracticeMode || isSubmittedRef.current) return; // Do not save state in practice mode or after submission
    if (examSetId && !loading && examData.subjects.length > 0) {
      const stateToSave = {
        userAnswers: overrides.userAnswers || userAnswers,
        questionStatus: overrides.questionStatus || questionStatus,
        questionTimers: overrides.questionTimers || questionTimers,
        currentSubjectIndex: overrides.hasOwnProperty('currentSubjectIndex') ? overrides.currentSubjectIndex : currentSubjectIndex,
        currentQuestionIndex: overrides.hasOwnProperty('currentQuestionIndex') ? overrides.currentQuestionIndex : currentQuestionIndex,
        submittedSubjects: overrides.submittedSubjects || submittedSubjects
      };
      localStorage.setItem(`sscExamState_${examSetId}`, JSON.stringify(stateToSave));

      // Also save timers
      if (timeLeft !== null) localStorage.setItem(`sscTimeLeft_${examSetId}`, timeLeft.toString());
      if (overallTime !== null) localStorage.setItem(`sscOverallTime_${examSetId}`, overallTime.toString());
    }
  }, [examSetId, loading, examData.subjects, userAnswers, questionStatus, questionTimers, currentSubjectIndex, currentQuestionIndex, submittedSubjects, timeLeft, overallTime]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.7));
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Initialize Attempt
  useEffect(() => {
    const startAttempt = async () => {
      const userId = JSON.parse(localStorage.getItem("user_id"));
      if (userId && examSetId) {
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL;
          const courseId = location.state?.course_id || localStorage.getItem('sscCourseId');
          const response = await fetch(`${backendUrl}/api/Solutions/get_attempt_number.php?student_id=${userId}&set_id=${examSetId}&course_id=${courseId}`);
          const result = await response.json();
          if (result.success) {
            setAttemptNumber(result.attempt_number);
          }
        } catch (err) {
          console.error("Failed to start/get attempt:", err);
        }
      }
    };
    startAttempt();

    // Fetch original responses and marking if in practice mode
    if (isPracticeMode && examSetId) {
      const fetchPracticeMetadata = async () => {
        const userId = JSON.parse(localStorage.getItem("user_id"));
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL;

          // Original Responses
          const respRes = await axios.get(`${backendUrl}/api/Solutions/get_latest_attempt_responses.php?student_id=${userId}&set_id=${examSetId}`);
          if (respRes.data.success) {
            setOriginalResponses(respRes.data.responses || {});
          }

          // Marking Details
          const marksRes = await axios.get(`${backendUrl}/api/Marks/get_set_details.php?exam_set_id=${examSetId}`);
          if (marksRes.data.success) {
            setMarking({
              positive: parseFloat(marksRes.data.data.positive_marking) || 1,
              negative: parseFloat(marksRes.data.data.negative_marking) || 0
            });
          }

          // Save/Report Status
          const statusRes = await axios.get(`${backendUrl}/api/SaveandReport/get_status.php?student_id=${userId}`);
          if (statusRes.data.success) {
            setSavedQuestionIds(new Set(statusRes.data.saved?.map(id => parseInt(id)) || []));
            setReportedQuestionIds(new Set(statusRes.data.reported?.map(id => parseInt(id)) || []));
          }
        } catch (err) {
          console.error("Failed to fetch practice metadata:", err);
        }
      };
      fetchPracticeMetadata();
    }
  }, [examSetId, isPracticeMode]);

  const saveResponseToServer = useCallback(async (qId, option) => {
    const userId = JSON.parse(localStorage.getItem("user_id"));
    if (!userId || !examSetId) return;

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await fetch(`${backendUrl}/api/Solutions/save_response.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          exam_set_id: examSetId,
          question_id: qId,
          selected_option: option,
          time_spent: questionTimers[qId] || 0,
          course_id: location.state?.course_id || localStorage.getItem('sscCourseId'),
          set_number: location.state?.set_number || localStorage.getItem('sscSetNumber')
        })
      });
    } catch (err) {
      console.error("Failed to save response to server:", err);
    }
  }, [examSetId, location.state, questionTimers]);

  // Fetch Exam Data
  useEffect(() => {
    const savedTimeLeft = localStorage.getItem(`sscTimeLeft_${examSetId}`);
    const savedOverallTime = localStorage.getItem(`sscOverallTime_${examSetId}`);
    const savedState = !isPracticeMode ? localStorage.getItem(`sscExamState_${examSetId}`) : null;

    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setUserAnswers(state.userAnswers || {});
        setQuestionStatus(state.questionStatus || {});
        setQuestionTimers(state.questionTimers || {});
        setCurrentSubjectIndex(state.currentSubjectIndex || 0);
        setCurrentQuestionIndex(state.currentQuestionIndex || 0);
        setSubmittedSubjects(state.submittedSubjects || []);
        stateLoadedRef.current = true;
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }

    if (!isPracticeMode && savedTimeLeft && savedTimeLeft !== "null") {
      const val = parseInt(savedTimeLeft, 10);
      if (!isNaN(val) && val > 0) {
        setTimeLeft(val);
        timersRestoredRef.current = true;
      }
    }

    if (!isPracticeMode && savedOverallTime && savedOverallTime !== "null") {
      const val = parseInt(savedOverallTime, 10);
      if (!isNaN(val) && val > 0) {
        setOverallTime(val);
        timersRestoredRef.current = true;
      }
    }
  }, [examSetId]);

  useEffect(() => {
    const interval = setInterval(() => saveStateToLocalStorage(), 10000); // Background save every 10s
    return () => clearInterval(interval);
  }, [saveStateToLocalStorage]);

  useEffect(() => {
    const fetchExamFullData = async () => {
      if (!examSetId) {
        setLoading(false);
        return;
      }

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/SSC/get_exam_full_data.php?exam_set_id=${examSetId}`);
        const result = await response.json();

        if (result.success && result.data) {
          const subjects = result.data.subjects || [];

          // Replicate ExamQuestionPage.jsx: Fetch questions from get_questions.php to ensure ALL are included
          const qResponse = await fetch(`${backendUrl}/api/Questions/get_questions.php?exam_set_id=${examSetId}`);
          const qResult = await qResponse.json();
          const rawQuestions = qResult.success ? qResult.data : [];

          // Separate normal and passage parent questions to process them individually
          const passageParents = rawQuestions.filter(q => q.question_type === 'passage');
          const normalQuestions = rawQuestions.filter(q => q.question_type !== 'passage');

          // Fetch sub-questions for each passage parent
          const processedPassages = await Promise.all(
            passageParents.map(async (p) => {
              try {
                const subResponse = await fetch(`${backendUrl}/api/Questions/get_questions.php?parent_id=${p.id}`);
                const subResult = await subResponse.json();
                const subQuestions = (subResult.success && Array.isArray(subResult.data)) ? subResult.data : [];

                return subQuestions.map(sub => {
                  const subSubjectName = (sub.subject_name || sub.subject || p.subject_name || p.subject || "General").trim().toLowerCase();
                  const matchedSubject = subjects.find(s => s.subject_name?.trim().toLowerCase() === subSubjectName);

                  return {
                    ...sub,
                    parent_question_id: p.id,
                    subject_id: matchedSubject ? matchedSubject.id : (sub.subject_id || p.subject_id), // Synchronize with metadata ID
                    // Ensure New UI expected keys are present
                    question_english: sub.question_english || sub.question || "",
                    question_hindi: sub.question_hindi || sub.question_hi || "",
                    option_a_english: sub.option_a_english || sub.option_a || "",
                    option_a_hindi: sub.option_a_hindi || sub.option_a_hi || "",
                    option_b_english: sub.option_b_english || sub.option_b || "",
                    option_b_hindi: sub.option_b_hindi || sub.option_b_hi || "",
                    option_c_english: sub.option_c_english || sub.option_c || "",
                    option_c_hindi: sub.option_c_hindi || sub.option_c_hi || "",
                    option_d_english: sub.option_d_english || sub.option_d || "",
                    option_d_hindi: sub.option_d_hindi || sub.option_d_hi || "",
                    passage_english: p.passage_english || p.content || "",
                    passage_hindi: p.passage_hindi || p.content_hi || ""
                  };
                });
              } catch (err) {
                console.error("Error fetching sub-questions for passage", p.id, err);
                return [];
              }
            })
          );

          // Standardize normal questions subject_id as well
          const processedNormalQuestions = normalQuestions.map(q => {
            const qSubjectName = (q.subject_name || q.subject || "General").trim().toLowerCase();
            const matchedSubject = subjects.find(s => s.subject_name?.trim().toLowerCase() === qSubjectName);
            return {
              ...q,
              subject_id: matchedSubject ? matchedSubject.id : q.subject_id
            };
          });

          const allProcessedQuestions = [
            ...processedNormalQuestions,
            ...processedPassages.flat()
          ].sort((a, b) => parseInt(a.id || 0) - parseInt(b.id || 0));

          const mappedData = {
            examSet: result.data.exam_set || result.data.examSet || null,
            subjects: subjects,
            questions: allProcessedQuestions
          };
          setExamData(mappedData);

          // Initialize time properly by fetching from time config API (Reference: ExamQuestionPage.jsx)
          try {
            const timeConfigResponse = await fetch(`${backendUrl}/api/TimeManagement/get_exam_time_config.php?exam_set_id=${examSetId}`);
            const timeConfigData = await timeConfigResponse.json();

            if (timeConfigData.success) {
              setTimeConfig(timeConfigData);

              // Calculate total exam time for overall display
              let calculatedOverallTime = 0;
              if (timeConfigData.type === 'overall') {
                calculatedOverallTime = (parseInt(timeConfigData.total_time_minutes) || 60) * 60;
              } else if (timeConfigData.type === 'sectional') {
                calculatedOverallTime = (timeConfigData.sections || []).reduce((sum, sec) => sum + (parseInt(sec.time_minutes || 0) * 60), 0);
              } else if (timeConfigData.type === 'subject_wise') {
                calculatedOverallTime = (timeConfigData.subjects || []).reduce((sum, sub) => sum + (parseInt(sub.time_minutes || 0) * 60), 0);
              }

              // Initialize overallTime if it wasn't restored from localStorage
              setOverallTime(prev => (prev === null ? (isPracticeMode ? null : calculatedOverallTime) : prev));

              if (!timersRestoredRef.current) {
                if (isPracticeMode) {
                  setTimeLeft(null);
                } else if (timeConfigData.type === 'overall') {
                  setTimeLeft(calculatedOverallTime);
                } else if (timeConfigData.type === 'sectional') {
                  const firstSection = timeConfigData.sections?.[0];
                  if (firstSection) {
                    const sectionTime = (parseInt(firstSection.time_minutes) || 0) * 60;
                    setTimeLeft(sectionTime);
                    lastSectionRef.current = firstSection;
                  }
                } else if (timeConfigData.type === 'subject_wise') {
                  const firstSubject = mappedData.subjects?.[0];
                  if (firstSubject) {
                    const subjectCfg = timeConfigData.subjects?.find(s => s.name.toLowerCase() === firstSubject.subject_name.toLowerCase());
                    if (subjectCfg) {
                      setTimeLeft((parseInt(subjectCfg.time_minutes) || 0) * 60);
                    }
                  }
                }
              }
            } else {
              const fallbackTime = (parseInt(mappedData.examSet?.total_time_minutes) || 60) * 60;
              setOverallTime(prev => (prev === null ? (isPracticeMode ? null : fallbackTime) : prev));
              if (!timersRestoredRef.current) {
                setTimeLeft(isPracticeMode ? null : fallbackTime);
              }
            }
          } catch (timeErr) {
            console.error("Failed to fetch time configuration:", timeErr);
            const fallbackTime = (parseInt(mappedData.examSet?.total_time_minutes) || 60) * 60;
            setOverallTime(prev => (prev === null ? (isPracticeMode ? null : fallbackTime) : prev));
            if (!timersRestoredRef.current) {
              setTimeLeft(isPracticeMode ? null : fallbackTime);
            }
          }

          // Initialize question status
          const initialStatus = {};
          mappedData.questions.forEach(q => {
            initialStatus[q.id] = 'not_visited';
          });

          if (!stateLoadedRef.current) {
            // Mark first answerable question as not_answered (visited)
            const firstSubjectId = mappedData.subjects[0]?.id;
            const firstVisibleQuestion = mappedData.questions.find(q =>
              q.subject_id === firstSubjectId
            );

            if (firstVisibleQuestion) {
              initialStatus[firstVisibleQuestion.id] = 'not_answered';
            }
            setQuestionStatus(initialStatus);
          } else {
            // If state was loaded, ensure all questions have a status but keep existing ones
            setQuestionStatus(prev => ({ ...initialStatus, ...prev }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch exam data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExamFullData();
  }, [examSetId]);

  const isLastSubject = useCallback(() => {
    if (timeConfig.type === 'sectional') {
      const currentSub = examData.subjects[currentSubjectIndex];
      const currentSection = timeConfig.sections?.find(sec =>
        sec.subjects?.some(s => s.toLowerCase() === currentSub?.subject_name?.toLowerCase())
      );
      if (currentSection) {
        const remainingSubjects = examData.subjects.filter(sub =>
          !submittedSubjects.includes(sub.subject_name) &&
          !currentSection.subjects?.map(s => s.toLowerCase()).includes(sub.subject_name.toLowerCase())
        );
        return remainingSubjects.length === 0;
      }
    }
    const remaining = examData.subjects.filter(sub => !submittedSubjects.includes(sub.subject_name));
    return remaining.length <= 1;
  }, [timeConfig, examData.subjects, currentSubjectIndex, submittedSubjects]);

  const handleSubmitCurrentSubject = useCallback(() => {
    if (isSubmittedRef.current) return;
    const currentSub = examData.subjects[currentSubjectIndex];
    if (!currentSub) return;

    let newSubmittedSubjects = [...submittedSubjects];
    let nextSubIdx = currentSubjectIndex;
    let nextQuestIdx = 0;

    if (timeConfig.type === 'sectional') {
      const currentSection = timeConfig.sections?.find(sec =>
        sec.subjects?.some(s => s.toLowerCase() === currentSub.subject_name.toLowerCase())
      );

      if (currentSection) {
        const sectionSubjectNames = currentSection.subjects || [];
        sectionSubjectNames.forEach(name => {
          if (!newSubmittedSubjects.includes(name)) {
            newSubmittedSubjects.push(name);
          }
        });

        const currentSectionIdx = timeConfig.sections.findIndex(sec => sec.id === currentSection.id || sec.name === currentSection.name);
        if (currentSectionIdx !== -1 && currentSectionIdx < timeConfig.sections.length - 1) {
          const nextSection = timeConfig.sections[currentSectionIdx + 1];
          const firstSubName = nextSection.subjects?.[0];
          nextSubIdx = examData.subjects.findIndex(s => s.subject_name.toLowerCase() === firstSubName?.toLowerCase());
        }
      }
    } else {
      if (!newSubmittedSubjects.includes(currentSub.subject_name)) {
        newSubmittedSubjects.push(currentSub.subject_name);
      }
      if (currentSubjectIndex < examData.subjects.length - 1) {
        nextSubIdx = currentSubjectIndex + 1;
      }
    }

    setSubmittedSubjects(newSubmittedSubjects);
    setCurrentSubjectIndex(nextSubIdx);
    setCurrentQuestionIndex(nextQuestIdx);

    saveStateToLocalStorage({
      submittedSubjects: newSubmittedSubjects,
      currentSubjectIndex: nextSubIdx,
      currentQuestionIndex: nextQuestIdx
    });
  }, [currentSubjectIndex, examData.subjects, submittedSubjects, timeConfig, saveStateToLocalStorage]);

  const handleFinalCleanupAndNavigate = useCallback(() => {
    isSubmittedRef.current = true;
    localStorage.removeItem(`sscExamState_${examSetId}`);
    localStorage.removeItem(`sscTimeLeft_${examSetId}`);
    localStorage.removeItem(`sscOverallTime_${examSetId}`);

    if (isPracticeMode) {
      if (location.state?.return_to === 'dashboard') {
        navigate('/dashboard', { replace: true });
        return;
      }
      const courseId = location.state?.course_id || localStorage.getItem('sscCourseId');
      const setNumber = location.state?.set_number || localStorage.getItem('sscSetNumber');
      navigate(`/exam/result/${courseId}/${examSetId}/${setNumber}?tab=detailed solution`, { replace: true });
    } else {
      navigate('/ssc/overall-summary', {
        state: {
          examSet: examData.examSet,
          subjects: examData.subjects,
          questions: examData.questions,
          questionStatus,
          userAnswers,
          submittedSubjects,
          course_id: location.state?.course_id || localStorage.getItem('sscCourseId'),
          exam_set_id: examSetId,
          set_number: location.state?.set_number || localStorage.getItem('sscSetNumber')
        }
      });
    }
  }, [examSetId, isPracticeMode, location.state, navigate, examData, questionStatus, userAnswers, submittedSubjects]);

  const handleFinalSubmit = useCallback(async () => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    try {
      const storedUser = localStorage.getItem("user_id");
      const userId = user?.id || (storedUser ? (storedUser.startsWith('"') ? JSON.parse(storedUser) : storedUser) : null);
      const courseId = location.state?.course_id || localStorage.getItem('sscCourseId');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const responsesPayload = examData.questions.map(q => {
        let selected = userAnswers[q.id] || null;
        
        // Strict evaluation: only consider answered if formally saved (matches TCS iON behavior)
        const status = questionStatus[q.id];
        if (status !== 'answered' && status !== 'marked_answered') {
          selected = null;
        }

        let isCorrect = 0;
        if (selected) {
          let qCorrect = (q.correct_option || q.correct_key)?.toString().trim().toUpperCase() || "";
          if (qCorrect === "1") qCorrect = "A";
          if (qCorrect === "2") qCorrect = "B";
          if (qCorrect === "3") qCorrect = "C";
          if (qCorrect === "4") qCorrect = "D";
          if (qCorrect === "5") qCorrect = "E";
          const selClean = selected.toString().trim().toUpperCase();
          if (selClean === qCorrect || qCorrect.includes(selClean) || (qCorrect.startsWith("OPTION") && qCorrect.endsWith(selClean))) {
            isCorrect = 1;
          }
        }
        return {
          question_id: q.id,
          selected_key: selected,
          is_correct: isCorrect,
          time_spent: questionTimers[q.id] || 0,
          subject: q.subject || q.subject_name || "General",
          marked_for_review: (questionStatus[q.id] === 'marked' || questionStatus[q.id] === 'marked_answered') ? 1 : 0,
          review_status: questionStatus[q.id] || null
        };
      });

      // Update liveResponses cache so that ExamResultPage and AnalysisTabs don't use stale cache from previous attempts
      const computedLiveResponses = {};
      responsesPayload.forEach(r => {
        computedLiveResponses[r.question_id] = {
          selected_key: r.selected_key,
          is_correct: r.is_correct,
          time_spent: r.time_spent,
          marked_for_review: r.marked_for_review,
          review_status: r.review_status,
          mark_review: r.marked_for_review
        };
      });

      const safeCourseId = location.state?.course_id || location.state?.courseId || localStorage.getItem('sscCourseId');
      const safeExamSetId = location.state?.exam_set_id || location.state?.examSetId || localStorage.getItem('sscExamSetId');
      const safeSetNumber = location.state?.set_number || location.state?.setNumber || localStorage.getItem('sscSetNumber');

      if (!isPracticeMode) {
        localStorage.setItem(`liveResponses_${safeCourseId}_${safeExamSetId}_${safeSetNumber}`, JSON.stringify(computedLiveResponses));
      }

      // Calculate and save subjectStats so AnalysisTabs use fresh data
      const computedSubjectStats = {};
      examData.subjects.forEach(sub => {
        const subQuestions = examData.questions.filter(q => 
          q.subject_id === sub.id && 
          ((q.parent_question_id === null && q.question_type !== 'passage') || q.parent_question_id !== null)
        );
        let answered = 0, correct = 0, incorrect = 0, notAnswered = 0, marked = 0, markedAnswered = 0;
        let score = 0;
        
        let timeSpent = 0;

        subQuestions.forEach(q => {
          const r = responsesPayload.find(rp => rp.question_id === q.id);
          const st = r ? r.review_status : 'not_visited';
          
          if (st === 'answered') answered++;
          else if (st === 'marked') marked++;
          else if (st === 'marked_answered') markedAnswered++;
          else notAnswered++;

          if (r && r.time_spent) {
            timeSpent += parseInt(r.time_spent) || 0;
          }

          if (r && r.selected_key) {
            if (r.is_correct) {
              correct++;
              score += parseFloat(marking.positive || 1);
            } else {
              incorrect++;
              score -= parseFloat(marking.negative || 0);
            }
          }
        });

        computedSubjectStats[sub.subject_name] = {
          questionCount: subQuestions.length,
          attemptedCount: answered + markedAnswered,
          correctCount: correct,
          incorrectCount: incorrect,
          score: score,
          timeSpent: timeSpent
        };
      });

      if (!isPracticeMode) {
        localStorage.setItem(`subjectStats_${safeCourseId}_${safeExamSetId}_${safeSetNumber}`, JSON.stringify(computedSubjectStats));
      }

      if (!isPracticeMode) {
        const recordResponse = await fetch(`${backendUrl}/api/Solutions/record_attempt.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: userId,
            set_id: examSetId,
            course_id: courseId,
            ui_type: 'new',
            attempt_number: attemptNumber,
            responses: responsesPayload
          })
        });
        const recordResult = await recordResponse.json();
        if (recordResult.success) {
          const actualAttemptNumber = parseInt(recordResult.attempt_number) || attemptNumber;
          if (actualAttemptNumber === 1) {
            try {
              const calculatedScore = responsesPayload.reduce((sum, r) => {
                if (r.is_correct === 1) {
                  return sum + (marking.positive !== null && marking.positive !== undefined ? parseFloat(marking.positive) : 1);
                } else if (r.selected_key) {
                  return sum - (marking.negative !== null && marking.negative !== undefined ? parseFloat(marking.negative) : 0);
                }
                return sum;
              }, 0);
              const totalTimeSpent = responsesPayload.reduce((sum, r) => sum + (parseInt(r.time_spent) || 0), 0);

              await fetch(`${backendUrl}/api/Leaderboard/update_leaderboard.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  student_id: Number(userId),
                  course_id: Number(courseId),
                  set_id: Number(examSetId),
                  total_marks: calculatedScore,
                  total_time: totalTimeSpent,
                  attempt_number: actualAttemptNumber
                })
              });
            } catch (leaderboardErr) {
              console.error("Failed to update leaderboard in New UI:", leaderboardErr);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error recording attempt:", err);
    }

    if (isPracticeMode) {
      setShowComparisonModal(true);
      return;
    }

    handleFinalCleanupAndNavigate();
  }, [examData, userAnswers, questionStatus, questionTimers, marking, isPracticeMode, attemptNumber, examSetId, location.state, handleFinalCleanupAndNavigate]);

  const handleTimeUp = useCallback(() => {
    if ((timeConfig.type === 'subject_wise' || timeConfig.type === 'sectional') && !isLastSubject()) {
      handleSubmitCurrentSubject();
    } else {
      handleFinalSubmit();
    }
  }, [timeConfig.type, isLastSubject, handleSubmitCurrentSubject, handleFinalSubmit]);

  // Timer logic
  useEffect(() => {
    if (isPracticeMode || isSubmittedRef.current) return;
    if (timeLeft !== null && timeLeft > 0 && !loading) {
      localStorage.setItem(`sscTimeLeft_${examSetId}`, timeLeft.toString());
    }
    if (overallTime !== null && overallTime > 0 && !loading) {
      localStorage.setItem(`sscOverallTime_${examSetId}`, overallTime.toString());
    }
  }, [timeLeft, overallTime, loading, examSetId, isPracticeMode]);

  // Watch for overall time up
  useEffect(() => {
    if (overallTime === 0 && !isSubmittedRef.current && !isPracticeMode && !loading) {
      handleFinalSubmit();
    }
  }, [overallTime, handleFinalSubmit, isPracticeMode, loading]);

  // Watch for section/subject time up
  useEffect(() => {
    if (timeLeft === 0 && overallTime !== 0 && !isSubmittedRef.current && !isPracticeMode && !loading) {
      handleTimeUp();
    }
  }, [timeLeft, overallTime, handleTimeUp, isPracticeMode, loading]);

  // Master timer
  useEffect(() => {
    if (loading || isPracticeMode || isSubmittedRef.current) return;

    const timer = setInterval(() => {
      setOverallTime(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isPracticeMode]);

  // Handle tab closing and refreshing
  useEffect(() => {
    if (isPracticeMode) return;

    const handleBeforeUnload = (e) => {
      if (isSubmittedRef.current) return;
      e.preventDefault();
      e.returnValue = "Closing the exam tab will reset your progress and the attempt will not count. Are you sure?";
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [examSetId, isPracticeMode]);

  const getFilteredQuestions = useCallback(() => {
    if (!examData.subjects[currentSubjectIndex]) return [];
    const subjectId = examData.subjects[currentSubjectIndex].id;
    // Return all questions for the subject that are NOT just passage containers
    return examData.questions.filter(q =>
      String(q.subject_id) === String(subjectId) &&
      (((!q.parent_question_id || Number(q.parent_question_id) === 0) && q.question_type !== 'passage') || (q.parent_question_id && Number(q.parent_question_id) !== 0))
    );
  }, [examData, currentSubjectIndex]);

  // Question-level timing tracker
  useEffect(() => {
    if (loading || isSubmittedRef.current) return;
    
    const timer = setInterval(() => {
      const activeQuestions = getFilteredQuestions();
      const activeQ = activeQuestions[currentQuestionIndex];
      if (activeQ) {
        setQuestionTimers(prev => {
          const newTimers = {
            ...prev,
            [activeQ.id]: (prev[activeQ.id] || 0) + 1
          };
          
          return newTimers;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, getFilteredQuestions, loading, examSetId]);

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestions = getFilteredQuestions();
  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Find parent passage if current question is a sub-question
  const parentQuestion = (currentQuestion?.parent_question_id && Number(currentQuestion.parent_question_id) !== 0)
    ? examData.questions.find(q => q.id === currentQuestion.parent_question_id)
    : null;

  const handleReturnToExam = async () => {
    try {
      const element = document.documentElement;
      if (!document.fullscreenElement) {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }
      }
      setIsViolation(false);
    } catch (err) {
      console.warn("Failed to re-enter fullscreen:", err);
      setIsViolation(false);
    }
  };

  const handleOptionSelect = (qId, option) => {
    setUserAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const updateQuestionStatus = (qId, newStatus) => {
    setQuestionStatus(prev => ({ ...prev, [qId]: newStatus }));
  };

  const moveToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      const nextQId = currentQuestions[currentQuestionIndex + 1].id;
      if (questionStatus[nextQId] === 'not_visited') {
        updateQuestionStatus(nextQId, 'not_answered');
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    // Manual advancement required for subject change - removed auto-switch logic
  }, [currentQuestionIndex, currentQuestions, questionStatus]);

  const handleSaveAndNext = () => {
    if (!currentQuestion) return;

    const qId = currentQuestion.id;
    const isAnswered = userAnswers[qId];

    let newStatus = isAnswered ? 'answered' : 'not_answered';
    updateQuestionStatus(qId, newStatus);

    moveToNextQuestion();

    // Save state after answering
    setTimeout(() => {
      saveStateToLocalStorage({
        questionStatus: { ...questionStatus, [qId]: newStatus }
      });
      saveResponseToServer(qId, isAnswered);
    }, 0);
  };

  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const isAnswered = userAnswers[qId];

    let newStatus = isAnswered ? 'marked_answered' : 'marked';
    updateQuestionStatus(qId, newStatus);
    moveToNextQuestion();

    // Save state after marking
    setTimeout(() => {
      saveStateToLocalStorage({
        questionStatus: { ...questionStatus, [qId]: newStatus }
      });
      saveResponseToServer(qId, isAnswered);
    }, 0);
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[qId];
      return newAnswers;
    });

    updateQuestionStatus(qId, 'not_answered');

    // Save state after clearing
    setTimeout(() => {
      saveStateToLocalStorage({
        userAnswers: { ...userAnswers, [qId]: null },
        questionStatus: { ...questionStatus, [qId]: 'not_answered' }
      });
      saveResponseToServer(qId, null);
    }, 0);
  };





  const handleReportSuccess = (qId) => {
    setReportedQuestionIds(prev => new Set([...prev, parseInt(qId)]));
  };



  const calculateComparisonStats = () => {
    const total = examData.questions.length;
    let currentCorrect = 0, currentIncorrect = 0, currentUnanswered = 0;

    examData.questions.forEach(q => {
      const selected = userAnswers[q.id];
      if (!selected) currentUnanswered++;
      else {
        let qCorrect = (q.correct_option || q.correct_key)?.toString().trim().toUpperCase() || "";
        if (qCorrect === "1") qCorrect = "A";
        if (qCorrect === "2") qCorrect = "B";
        if (qCorrect === "3") qCorrect = "C";
        if (qCorrect === "4") qCorrect = "D";
        if (qCorrect === "5") qCorrect = "E";
        const selClean = selected.trim().toUpperCase();
        if (selClean === qCorrect || qCorrect.includes(selClean) || (qCorrect.startsWith("OPTION") && qCorrect.endsWith(selClean))) {
          currentCorrect++;
        } else {
          currentIncorrect++;
        }
      }
    });

    const currentScore = (currentCorrect * marking.positive) - (currentIncorrect * marking.negative);

    let originalCorrect = 0, originalIncorrect = 0, originalUnanswered = 0;
    examData.questions.forEach(q => {
      const resp = originalResponses[q.id];
      if (!resp || !resp.selected_key) originalUnanswered++;
      else if (resp.is_correct) originalCorrect++;
      else originalIncorrect++;
    });

    const originalScore = (originalCorrect * marking.positive) - (originalIncorrect * marking.negative);

    return {
      original: { correct: originalCorrect, incorrect: originalIncorrect, unanswered: originalUnanswered, score: originalScore, total },
      current: { correct: currentCorrect, incorrect: currentIncorrect, unanswered: currentUnanswered, score: currentScore, total }
    };
  };

  const comparisonStats = calculateComparisonStats();

  useEffect(() => {
    const answered = Object.values(questionStatus).filter(s => s === 'answered' || s === 'marked_answered').length;
    setAnsweredCount(answered);
  }, [questionStatus]);

  const totalAnswerableQuestions = examData.questions.filter(q =>
    (((!q.parent_question_id || Number(q.parent_question_id) === 0) && q.question_type !== 'passage') || (q.parent_question_id && Number(q.parent_question_id) !== 0))
  ).length;

  useEffect(() => {
    if (isPracticeMode) return;
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement) {
        setIsViolation(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsViolation(true);
      }
    };

    const handleBlur = () => {
      setIsViolation(true);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isPracticeMode]);

  // Handle Sectional/Subject-wise Timer Updates (Reference: ExamQuestionPage.jsx)
  useEffect(() => {
    if (isPracticeMode || !timeConfig.type || timeConfig.type === 'overall' || !examData.subjects.length) return;

    const currentSubject = examData.subjects[currentSubjectIndex];
    if (!currentSubject) return;

    if (timeConfig.type === 'sectional' && timeConfig.sections) {
      const currentSection = timeConfig.sections.find(sec =>
        sec.subjects?.some(s => s.toLowerCase() === currentSubject.subject_name.toLowerCase())
      );
      if (currentSection) {
        if (lastSectionRef.current && (lastSectionRef.current.id === currentSection.id || lastSectionRef.current.name === currentSection.name)) return;

        // If we just restored from backup, don't reset the timer for the initial section
        if (timersRestoredRef.current && lastSectionRef.current === null) {
          lastSectionRef.current = currentSection;
          return;
        }

        lastSectionRef.current = currentSection;
        setTimeLeft((parseInt(currentSection.time_minutes) || 0) * 60);
      }
    } else if (timeConfig.type === 'subject_wise' && timeConfig.subjects) {
      const subjectKey = currentSubject.subject_name.toUpperCase();
      const subjectConfig = timeConfig.subjects.find(s => s.name.toUpperCase() === subjectKey);

      if (subjectConfig) {
        if (lastSubjectRef.current === subjectKey) return;

        if (timersRestoredRef.current && lastSubjectRef.current === null) {
          lastSubjectRef.current = subjectKey;
          return;
        }

        lastSubjectRef.current = subjectKey;
        setTimeLeft((parseInt(subjectConfig.time_minutes) || 0) * 60);
      }
    }
  }, [currentSubjectIndex, timeConfig, examData.subjects]);

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (profileLoading || loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 dark:text-white font-bold animate-pulse uppercase tracking-widest">Loading Test...</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-slate-900 text-black dark:text-slate-200 transition-colors">
      <FullscreenViolation isVisible={isViolation} onReturn={handleReturnToExam} />

      <WatermarkComponent text={user?.number} />

      {showSubmitModal && (
        <SSCSubmitModal
          subjects={examData.subjects}
          questions={examData.questions}
          answers={userAnswers}
          reviewed={questionStatus}
          visited={new Set(Object.keys(questionStatus).filter(qId => questionStatus[qId] !== 'not_visited'))}
          setShowSubmitModal={setShowSubmitModal}
          handleFinalSubmit={handleFinalSubmit}
          handleSubmitCurrentSubject={handleSubmitCurrentSubject}
          isLastSubject={isLastSubject()}
          submittedSubjects={submittedSubjects}
          timeConfig={timeConfig}
        />
      )}

      {/* Top Header */}
      <SSCExamPageHeader
        user={user}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        timeLeft={overallTime}
        examSet={examData.examSet}
        isPracticeMode={isPracticeMode}
      />

      {/* Secondary Header (Links, Disclaimer, Badge) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-3 py-1 border-b border-gray-300 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 relative z-30 text-[11px] md:text-[12px]">
        <div className="flex gap-3 font-bold underline uppercase whitespace-nowrap pb-1 md:pb-0">
          <div
            className="relative"
            onMouseEnter={() => setShowSymbols(true)}
            onMouseLeave={() => setShowSymbols(false)}
          >
            <a href="#" className="text-blue-500" onClick={(e) => e.preventDefault()}>Symbols</a>
            {showSymbols && (
              <div className="absolute top-full left-0 mt-2 z-[60] bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 shadow-2xl rounded-sm p-1">
                <img src="/img/symbols.png" alt="Symbols Legend" className="max-w-[1111px] h-[26rem] block" />
              </div>
            )}
          </div>
          <div
            className="relative"
            onMouseEnter={() => setShowInstructionsHover(true)}
            onMouseLeave={() => setShowInstructionsHover(false)}
          >
            <a href="#" className="text-orange-400" onClick={(e) => e.preventDefault()}>Instructions</a>
            {showInstructionsHover && (
              <div className="absolute top-full left-0 pt-2 z-[70]">
                <div className="bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 shadow-2xl rounded-md w-[90vw] md:w-[800px] h-[70vh] overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    <SSCInstructions />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div
            className="relative"
            onMouseEnter={() => setShowSummaryHover(true)}
            onMouseLeave={() => setShowSummaryHover(false)}
          >
            <a
              href="#"
              className="text-amber-800"
              onClick={(e) => {
                e.preventDefault();
                setShowSummary(true);
              }}
            >
              Overall Test Summary
            </a>
            {showSummaryHover && (
              <div className="absolute top-full left-0 pt-2 z-[60]">
                <div className="min-w-[400px] md:min-w-[600px] shadow-2xl">
                  <SSCTestSummaryComponent
                    answeredCount={answeredCount}
                    totalQuestions={totalAnswerableQuestions}
                    markedForReview={Object.values(questionStatus).filter(s => s === 'marked' || s === 'marked_answered').length}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="text-center font-bold text-red-700 dark:text-red-500 leading-tight my-1 md:my-0 flex-1 px-4 text-[10px] md:text-[12px]">
          Please note that this is only a mock test designed for practice purposes.<br className="hidden md:block" />
          <span className='text-red-600'>All questions are auto-saved upon option selection</span>
        </div>
        <div className="font-bold whitespace-nowrap">
          Total Questions answered: <span className="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white px-1.5 py-0.5 border border-gray-400 dark:border-slate-600 ml-1 shadow-sm">{answeredCount}</span>
        </div>
      </div>

      {/* Navigation Bar (Tabs & Action Buttons) */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 border-b-2 border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 relative z-20 gap-2">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {(() => {
            const isSectional = timeConfig.type === 'sectional';
            const isSubjectWise = timeConfig.type === 'subject_wise';
            const isRestricted = isSectional || isSubjectWise;
            const tabs = isSectional ? (timeConfig.sections || []) : examData.subjects;

            return tabs.map((item, idx) => {
              let isActive = false;
              let isSubmitted = false;
              let onClick = () => { };

              if (isSectional) {
                const currentSubName = examData.subjects[currentSubjectIndex]?.subject_name?.toLowerCase();
                isActive = item.subjects?.some(s => s.toLowerCase() === currentSubName);
                isSubmitted = item.subjects?.every(s => submittedSubjects.some(sub => sub.toLowerCase() === s.toLowerCase()));

                onClick = () => {
                  const firstSubName = item.subjects?.[0];
                  const subIdx = examData.subjects.findIndex(s => s.subject_name.toLowerCase() === firstSubName?.toLowerCase());
                  if (subIdx !== -1) {
                    setCurrentSubjectIndex(subIdx);
                    setCurrentQuestionIndex(0);
                    saveStateToLocalStorage({ currentSubjectIndex: subIdx, currentQuestionIndex: 0 });
                  }
                };
              } else {
                isActive = idx === currentSubjectIndex;
                isSubmitted = submittedSubjects.some(sub => sub.toLowerCase() === item.subject_name?.toLowerCase());
                onClick = () => {
                  setCurrentSubjectIndex(idx);
                  setCurrentQuestionIndex(0);
                  saveStateToLocalStorage({ currentSubjectIndex: idx, currentQuestionIndex: 0 });
                };
              }

              const displayIdx = idx; // Correct index for Part label

              return (
                <button
                  key={isSectional ? (item.id || idx) : item.id}
                  onClick={isRestricted || isSubmitted ? undefined : onClick}
                  className={`${isActive
                    ? 'bg-[#008000] ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-105 z-10'
                    : isSubmitted
                      ? 'bg-gray-500'
                      : 'bg-[#0000ff]'} text-white font-bold px-5 py-2 text-xs border border-gray-900 rounded-sm flex-shrink-0 hover:brightness-110 transition-all uppercase ${(isRestricted || isSubmitted) ? 'cursor-default' : ''} flex items-center gap-1`}
                >
                  PART-{String.fromCharCode(65 + displayIdx)}
                  {isSubmitted && <span className="text-[10px]">✓</span>}
                </button>
              );
            });
          })()}

          <div className="flex gap-2 ml-56">
            <button
              onClick={handleMarkForReview}
              className="bg-gradient-to-b from-[#4a8ad4] to-[#1f5a9e] text-white font-bold px-3 py-1.5 text-xs border border-[#1f5a9e] rounded-sm shadow-sm active:scale-95 transition-all hover:brightness-110"
            >
              Mark for Review
            </button>
            <button
              onClick={handleSaveAndNext}
              className="bg-gradient-to-b from-[#4a8ad4] to-[#1f5a9e] text-white font-bold px-3 py-1.5 text-xs border border-[#1f5a9e] rounded-sm shadow-sm active:scale-95 transition-all hover:brightness-110"
            >
              Save & Next
            </button>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-gradient-to-b from-[#4a8ad4] to-[#1f5a9e] text-white font-bold px-3 py-1.5 text-xs border border-green-700 rounded-sm shadow-sm active:scale-95 transition-all hover:brightness-110"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden relative bg-white dark:bg-slate-900">
        <ReattemptComparisonModal
          isOpen={showComparisonModal}
          onClose={handleFinalCleanupAndNavigate}
          originalStats={comparisonStats.original}
          currentStats={comparisonStats.current}
          setName={examData.examSet?.set_name}
        />
        {/* Left Side: Question Area */}
        <div className={`flex-[3] relative overflow-hidden bg-white dark:bg-slate-900 flex flex-col`}>
          <div
            className="flex-1 flex flex-col transition-all duration-300 ease-in-out origin-top-left overflow-hidden"
            style={{
              transform: `scale(${zoomLevel})`,
              width: `${100 / zoomLevel}%`
            }}
          >
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative z-30">
              <div className="flex items-center gap-4">
                <div className="font-bold text-sm md:text-base text-black dark:text-white uppercase tracking-wider">Question : {currentQuestionIndex + 1}</div>
                <div className="flex items-center gap-2">
                  <SaveReportActions
                    questionId={currentQuestion?.id}
                    quizType="new_ui"
                    isSaved={savedQuestionIds.has(parseInt(currentQuestion?.id))}
                    isReported={reportedQuestionIds.has(parseInt(currentQuestion?.id))}
                    studentId={user?.id}
                    onSaveToggle={(newState) => {
                      setSavedQuestionIds(prev => {
                        const next = new Set(prev);
                        if (newState) next.add(parseInt(currentQuestion?.id));
                        else next.delete(parseInt(currentQuestion?.id));
                        return next;
                      });
                      toast({
                        title: newState ? "Question Saved" : "Question Unsaved",
                        description: newState ? "Added to your bookmarks." : "Removed from your bookmarks.",
                      });
                    }}
                    onReportSuccess={() => handleReportSuccess(currentQuestion?.id)}
                    iconSize="15"
                    containerClass="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-800 shadow-sm"
                  />
                  {isPracticeMode && userAnswers[currentQuestion?.id] && (userAnswers[currentQuestion?.id]?.toUpperCase() === (currentQuestion?.correct_option || currentQuestion?.correct_key)?.toUpperCase()) && (
                    <>
                      <div className="w-[1px] h-3 bg-gray-300 dark:bg-gray-700 mx-0.5"></div>
                      <div className="p-1.5 text-green-600 animate-in fade-in zoom-in duration-300" title="Correct Answer">
                        <FaCheck size={14} />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <label className="text-xs font-bold mr-2 text-black dark:text-slate-400 uppercase">Language: </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="text-xs font-bold border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 transition-shadow cursor-pointer"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
              {currentQuestion ? (
                <div className={`flex flex-col h-full ${(currentQuestion.question_type === 'passage' || parentQuestion) ? 'md:flex-row' : ''} overflow-hidden`}>
                  {/* Content Area (Passage) - Visible only for passages */}
                  {(currentQuestion.question_type === 'passage' || parentQuestion) && (
                    <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-300 dark:border-slate-700 overflow-y-auto p-4 md:p-6 h-1/2 md:h-full scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-slate-700">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedLanguage === 'English'
                            ? (parentQuestion?.passage_english || currentQuestion.passage_english)
                            : (parentQuestion?.passage_hindi || currentQuestion.passage_hindi)
                        }}
                        className="text-sm md:text-base leading-relaxed prose dark:prose-invert max-w-none break-words overflow-hidden"
                      />
                    </div>
                  )}

                  {/* Question and Options Area */}
                  <div className={`${(currentQuestion.question_type === 'passage' || parentQuestion) ? 'w-full md:w-1/2 h-1/2 md:h-full' : 'w-full h-full'} overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-slate-700`}>
                    <div className="space-y-6">
                      <div className="bg-transparent">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: selectedLanguage === 'English' ? currentQuestion.question_english : currentQuestion.question_hindi
                          }}
                          className="text-sm md:text-base leading-relaxed prose dark:prose-invert max-w-none font-medium break-words overflow-hidden"
                        />

                        {currentQuestion.question_image_url && (
                          <div className="my-6 flex justify-center">
                            <img
                              src={currentQuestion.question_image_url}
                              alt="Question"
                              className="max-w-full h-auto max-h-96 border border-gray-300 dark:border-slate-700 rounded shadow-md"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden divide-y divide-gray-100 dark:divide-slate-800">
                        {['A', 'B', 'C', 'D'].map((opt) => {
                          const optText = currentQuestion[`option_${opt.toLowerCase()}_${selectedLanguage.toLowerCase()}`];
                          if (!optText) return null;
                          const isSelected = userAnswers[currentQuestion.id] === opt;
                          const isCorrect = (currentQuestion.correct_option || currentQuestion.correct_key)?.toUpperCase() === opt;
                          const hasAnswered = !!userAnswers[currentQuestion.id];

                          let feedbackClass = "";
                          if (isPracticeMode && hasAnswered) {
                            if (isCorrect) {
                              feedbackClass = "bg-green-50 dark:bg-green-900/30 border-green-500 ring-1 ring-green-500";
                            } else if (isSelected) {
                              feedbackClass = "bg-red-50 dark:bg-red-900/30 border-red-500 ring-1 ring-red-500";
                            }
                          } else if (isSelected) {
                            feedbackClass = "bg-blue-50 dark:bg-blue-900/20";
                          }

                          return (
                            <div
                              key={opt}
                              onClick={() => handleOptionSelect(currentQuestion.id, opt)}
                              className={`flex items-start gap-4 p-4 cursor-pointer transition-all duration-200 group ${feedbackClass || 'hover:bg-gray-50 dark:hover:bg-slate-800/40 bg-white dark:bg-slate-900'}`}
                            >
                              <div className="pt-0.5">
                                <input
                                  type="radio"
                                  name={`q_${currentQuestion.id}`}
                                  id={`q_${currentQuestion.id}_opt_${opt}`}
                                  checked={isSelected}
                                  onChange={() => { }} // Handled by div onClick
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 cursor-pointer flex-shrink-0"
                                />
                                {isPracticeMode && hasAnswered && isCorrect && (
                                  <div className="absolute -left-1 -top-1">
                                    <div className="bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <label htmlFor={`q_${currentQuestion.id}_opt_${opt}`} className="text-sm md:text-base cursor-pointer flex-1 prose dark:prose-invert max-w-none break-words overflow-hidden">
                                <span className={`font-bold mr-2 ${isSelected ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'} transition-colors`}>{opt}.</span>
                                <span dangerouslySetInnerHTML={{ __html: optText }} />
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest bg-gray-50 dark:bg-slate-800/30 rounded-lg p-10 border-2 border-dashed border-gray-200 dark:border-slate-700">
                    No Question Available
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Palette Area */}
        <aside
          ref={sidebarRef}
          className={`flex flex-col bg-[#fcfcfc] dark:bg-slate-900/90 border-l-[5px] border-gray-200 dark:border-slate-800 shadow-inner transition-all duration-300 ease-in-out z-40
            absolute md:relative top-0 bottom-0 right-0 h-full w-[280px] md:w-auto
            ${isSidebarOpen 
              ? 'translate-x-0 md:translate-x-0 md:min-w-[280px] md:flex-1 shadow-2xl md:shadow-inner' 
              : 'translate-x-full md:translate-x-0 md:w-0 md:min-w-0 md:flex-none md:border-l-0 shadow-none'
            }`}
        >
          <button
            onClick={toggleSidebar}
            className={`absolute top-12 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent z-50 transition-all duration-300 ease-in-out cursor-pointer hover:brightness-110 
              after:content-[''] after:absolute after:-top-4 after:-bottom-4 after:-left-4 after:-right-4
              ${isSidebarOpen 
                ? 'right-full border-r-[18px] border-r-blue-600 translate-x-0' 
                : 'right-full border-l-[18px] border-l-blue-600 -translate-x-[18px] md:translate-x-0'
              }`}
            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          />

          <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="p-2.5 text-center font-bold text-[13px] border-b border-gray-300 dark:border-slate-800 bg-gray-100 dark:bg-slate-800 text-black dark:text-white whitespace-nowrap uppercase flex items-center justify-center gap-1">
              <span>
                {timeConfig.type === 'sectional'
                  ? (timeConfig.sections?.find(sec => sec.subjects?.some(s => s.toLowerCase() === examData.subjects[currentSubjectIndex]?.subject_name?.toLowerCase()))?.name || 'Loading...')
                  : (examData.subjects[currentSubjectIndex]?.subject_name || 'Loading...')
                }
              </span>
              {(timeConfig.type === 'sectional' || timeConfig.type === 'subject_wise') && (
                <span className="font-mono tabular-nums tracking-widest text-[14px] w-[70px] inline-block text-left">
                  ({formatTime(timeLeft)})
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-4">
              {timeConfig.type === 'sectional' ? (
                (() => {
                  const currentSection = timeConfig.sections?.find(sec =>
                    sec.subjects?.some(s => s.toLowerCase() === examData.subjects[currentSubjectIndex]?.subject_name?.toLowerCase())
                  );

                  if (!currentSection) return null;

                  return currentSection.subjects.map((subName) => {
                    const subject = examData.subjects.find(s => s.subject_name.toLowerCase() === subName.toLowerCase());
                    if (!subject) return null;

                    const subjectQuestions = examData.questions.filter(q =>
                      q.subject_id === subject.id &&
                      ((q.parent_question_id === null && q.question_type !== 'passage') || q.parent_question_id !== null)
                    );

                    return (
                      <div key={subject.id} className="mb-6">
                        <div className="text-[10px] font-black mb-3 uppercase text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-slate-800 pb-1 flex justify-between items-center">
                          <span>{subject.subject_name}</span>
                          <span className="text-[9px] bg-gray-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-slate-300">{subjectQuestions.length} Q</span>
                        </div>
                        <div className="grid grid-cols-5 gap-y-6 gap-x-2 justify-items-center">
                          {subjectQuestions.map((q) => {
                            const isSelectedSubject = subject.id === examData.subjects[currentSubjectIndex]?.id;
                            const targetSubjectIndex = examData.subjects.findIndex(s => s.id === subject.id);
                            const targetQuestions = examData.questions.filter(tq =>
                              tq.subject_id === subject.id &&
                              ((tq.parent_question_id === null && tq.question_type !== 'passage') || tq.parent_question_id !== null)
                            );
                            const qIdx = targetQuestions.findIndex(tq => tq.id === q.id);

                            const status = questionStatus[q.id];
                            let btnClass = "bg-[#0000ff] text-white border-blue-800";
                            if (status === 'answered') btnClass = "bg-green-600 text-white";
                            else if (status === 'not_answered') btnClass = "bg-red-600 text-white";
                            else if (status === 'marked') btnClass = "bg-yellow-500 text-black";
                            else if (status === 'marked_answered') btnClass = "bg-yellow-500 text-black relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-green-600 after:rounded-full";

                            if (isSelectedSubject && qIdx === currentQuestionIndex) btnClass += " ring-2 ring-yellow-400 ring-offset-1";

                            const showArrow = status === 'not_answered' || status === 'marked' || status === 'marked_answered';

                            return (
                              <div key={q.id} className="relative flex flex-col items-center">
                                <button
                                  onClick={() => {
                                    setCurrentSubjectIndex(targetSubjectIndex);
                                    setCurrentQuestionIndex(qIdx);
                                  }}
                                  className={`w-8 h-4 rounded flex items-center justify-center text-[12px] font-bold border shadow-sm transition-all active:scale-90 ${btnClass}`}
                                >
                                  {qIdx + 1}
                                </button>
                                {showArrow && (
                                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-black dark:border-b-slate-100 transition-all"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()
              ) : (
                <div className="grid grid-cols-5 gap-y-6 gap-x-2 justify-items-center">
                  {currentQuestions.map((q, i) => {
                    const status = questionStatus[q.id];
                    let btnClass = "bg-[#0000ff] text-white border-blue-800";
                    if (status === 'answered') btnClass = "bg-green-600 text-white";
                    else if (status === 'not_answered') btnClass = "bg-red-600 text-white";
                    else if (status === 'marked') btnClass = "bg-yellow-500 text-black";
                    else if (status === 'marked_answered') btnClass = "bg-yellow-500 text-black relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-green-600 after:rounded-full";

                    if (i === currentQuestionIndex) btnClass += " ring-2 ring-yellow-400 ring-offset-1";

                    const showArrow = status === 'not_answered' || status === 'marked' || status === 'marked_answered';

                    return (
                      <div key={q.id} className="relative flex flex-col items-center">
                        <button
                          onClick={() => setCurrentQuestionIndex(i)}
                          className={`w-8 h-4 rounded flex items-center justify-center text-[12px] font-bold border shadow-sm transition-all active:scale-90 ${btnClass}`}
                        >
                          {i + 1}
                        </button>
                        {showArrow && (
                          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-black dark:border-b-slate-100 transition-all"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-auto p-5 border-t border-gray-300 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
              <table className="w-full border-collapse text-[12px] border border-gray-400 dark:border-slate-700 bg-white dark:bg-slate-900">
                <thead>
                  <tr>
                    <th colSpan="2" className="bg-gray-200 dark:bg-slate-700 p-1.5 border border-gray-400 dark:border-slate-700 text-black dark:text-white uppercase">PART-{String.fromCharCode(65 + currentSubjectIndex)} Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Answered', status: 'answered', color: 'text-green-600' },
                    { label: 'Not Answered', status: 'not_answered', color: 'text-red-600' },
                    { label: 'Marked for Review', status: 'marked', color: 'text-yellow-600 dark:text-yellow-400' },
                    { label: 'Not Visited', status: 'not_visited', color: 'text-gray-600' }
                  ].map((item) => {
                    const count = currentQuestions.filter(q => {
                      const s = questionStatus[q.id];
                      if (item.status === 'marked') return s === 'marked' || s === 'marked_answered';
                      return s === item.status;
                    }).length;
                    return (
                      <tr key={item.label} className="border border-gray-400 dark:border-slate-700 bg-gray-200 dark:bg-slate-700">
                        <td className="p-1.5 pl-3 font-medium">{item.label}</td>
                        <td className={`p-1.5 text-center font-black ${item.color} w-12 border-l border-gray-400 dark:border-slate-700`}>{count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </aside>
      </main>

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-[750px]">
            <SSCTestSummaryComponent
              answeredCount={answeredCount}
              totalQuestions={totalAnswerableQuestions}
              markedForReview={Object.values(questionStatus).filter(s => s === 'marked' || s === 'marked_answered').length}
            />
            <button
              onClick={() => setShowSummary(false)}
              className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full font-bold shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center z-[110]"
            >
              ✕
            </button>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => setShowSummary(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-bold shadow-md transition-all active:scale-95"
              >
                Return to Exam
              </button>
              <button
                onClick={() => navigate('/ssc/overall-summary', {
                  state: {
                    examSet: examData.examSet,
                    subjects: examData.subjects,
                    questions: examData.questions,
                    questionStatus,
                    userAnswers,
                    course_id: location.state?.course_id || localStorage.getItem('sscCourseId'),
                    exam_set_id: examSetId,
                    set_number: location.state?.set_number || localStorage.getItem('sscSetNumber')
                  }
                })}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded font-bold shadow-md transition-all active:scale-95"
              >
                Final Submit
              </button>
            </div>
          </div>
        </div>
      )}
      <WatermarkComponent text={user?.number} />
      <SSCFooter />
    </div>
  );
};

export default SSCMainExamPage;
