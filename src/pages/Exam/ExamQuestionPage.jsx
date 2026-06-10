import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import QuestionSection from "../../components/exam/QuestionSection";
import SidebarSection from "../../components/exam/SidebarSection";
import SubmitModal from "../../components/exam/SubmitModal";
import QuitModal from "../../components/exam/QuitModal";
import WarningModal from "../../components/exam/WarningModal";
import FullscreenViolation from "../../components/NewUI/FullScreenViolation";
import ReattemptComparisonModal from "../../components/exam/ReattemptComparisonModal";
import { FaHome, FaExpand, FaCompress, FaFlag, FaBookmark, FaTimes } from "react-icons/fa";
import SaveReportActions from "../../components/exam/SaveReportActions";
import { useToast } from "../../components/ui/use-toast";
import { t } from "i18next";
import { createPortal } from "react-dom";

const BASE_URL_RAW = import.meta.env.VITE_BASE_URL;
const BASE_URL = BASE_URL_RAW.endsWith("/") ? BASE_URL_RAW : `${BASE_URL_RAW}/`;

const ExamQuestionPage = () => {
  const { toast } = useToast();
  const { course_id, exam_set_id, set_number } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialLang = queryParams.get("lang") || "en";
  const isNewAttempt = queryParams.get("new_attempt") === "true";

  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [language, setLanguage] = useState(initialLang);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [unanswered, setUnanswered] = useState([]);
  const [reviewed, setReviewed] = useState({});
  const [visited, setVisited] = useState(new Set());
  const [mainTimer, setMainTimer] = useState(null);
  const [questionTimers, setQuestionTimers] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState({ name: "", photo: "", id: "", number: "" });
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState("");
  const [globalQuestionIndex, setGlobalQuestionIndex] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [submittedSubjects, setSubmittedSubjects] = useState([]);
  const [setName, setSetName] = useState("");
  const [showSubjectSwitchWarning, setShowSubjectSwitchWarning] = useState(false);
  const [isViolationVisible, setIsViolationVisible] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [positiveMarking, setPositiveMarking] = useState(1);
  const [negativeMarking, setNegativeMarking] = useState(0);
  const [originalResponses, setOriginalResponses] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);



  const [timeConfig, setTimeConfig] = useState({
    type: null, // 'overall', 'subject_wise', or 'sectional'
    globalTime: null,
    subjectTimes: {},
    currentSubjectTime: null,
    isSubjectWiseMode: false,
    sections: []
  });
  const [overallTime, setOverallTime] = useState(null);

  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const lastFiveMinutesPlayed = useRef(false);
  const lastMinutePlayed = useRef(false);
  const initialTimeSet = useRef(false);
  const initialTotalTimeRef = useRef(null);
  const timersRestoredRef = useRef(false);
  const lastSectionRef = useRef(null);
  const lastSubjectRef = useRef(null);
  const stateLoadedRef = useRef(false);
  const exitingRef = useRef(false);

  const saveStateToLocalStorage = useCallback((overrides = {}) => {
    if (exitingRef.current) return;
    if (course_id && exam_set_id && set_number && !isLoading && questions.length > 0) {
      const stateToSave = {
        answers: overrides.hasOwnProperty('answers') ? overrides.answers : answers,
        unanswered: overrides.hasOwnProperty('unanswered') ? overrides.unanswered : unanswered,
        reviewed: overrides.hasOwnProperty('reviewed') ? overrides.reviewed : reviewed,
        visited: Array.from(overrides.hasOwnProperty('visited') ? overrides.visited : visited),
        questionTimers: overrides.hasOwnProperty('questionTimers') ? overrides.questionTimers : questionTimers,
        mainTimer: overrides.hasOwnProperty('mainTimer') ? overrides.mainTimer : mainTimer,
        currentIndex: overrides.hasOwnProperty('currentIndex') ? overrides.currentIndex : currentIndex,
        activeSubject: overrides.hasOwnProperty('activeSubject') ? overrides.activeSubject : activeSubject,
        globalQuestionIndex: overrides.hasOwnProperty('globalQuestionIndex') ? overrides.globalQuestionIndex : globalQuestionIndex,
        submittedSubjects: overrides.hasOwnProperty('submittedSubjects') ? overrides.submittedSubjects : submittedSubjects
      };
      localStorage.setItem(`examState_${course_id}_${exam_set_id}_${set_number}`, JSON.stringify(stateToSave));
    }
  }, [course_id, exam_set_id, set_number, isLoading, questions.length, answers, unanswered, reviewed, visited, questionTimers, mainTimer, currentIndex, activeSubject, globalQuestionIndex, submittedSubjects]);

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "00:00";
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const isSubjectInActiveSection = (subject) => {
    if (!subject || timeConfig.type !== 'sectional' || !timeConfig.sections) return false;
    const currentSection = timeConfig.sections.find(sec =>
      Array.isArray(sec.subjects) &&
      sec.subjects.map(s => s.toUpperCase()).includes(activeSubject?.toUpperCase())
    );
    return currentSection?.subjects?.map(s => s.toUpperCase()).includes(subject.toUpperCase()) || false;
  };

  const playAudioAlert = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    }
    audioRef.current.play().catch((err) => console.log("Audio error:", err));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

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
      setIsViolationVisible(false);
    } catch (err) {
      console.warn("Failed to re-enter fullscreen:", err);
      setIsViolationVisible(false);
    }
  };

  const fetchTimeConfigurations = async () => {
    if (isNewAttempt) {
      console.log('📋 New attempt mode: Timers disabled but config will be fetched to preserve mode locks');
    }
    try {
      const response = await axios.get(
        `${BASE_URL}api/TimeManagement/get_exam_time_config.php?exam_set_id=${exam_set_id}`
      );

      if (response.data.success) {
        const { type, total_time_minutes, subjects: subjectsData } = response.data;

        if (type === 'overall') {
          // Overall time defined - all subjects accessible
          console.log('📋 Overall time mode:', total_time_minutes, 'minutes');
          const totalTime = total_time_minutes * 60;
          setTimeConfig({
            type: 'overall',
            globalTime: isNewAttempt ? null : totalTime,
            subjectTimes: {},
            currentSubjectTime: null,
            isSubjectWiseMode: false,
            sections: []
          });
          if (!timersRestoredRef.current) {
            setMainTimer(isNewAttempt ? null : totalTime);
            setOverallTime(isNewAttempt ? null : totalTime);
            initialTotalTimeRef.current = totalTime;
          }
        } else if (type === 'subject_wise') {
          // Subject-wise time - restrict subject access
          console.log('📋 Subject-wise time mode:', subjectsData);
          const subjectTimes = {};
          subjectsData.forEach(subject => {
            subjectTimes[subject.name.toUpperCase()] = subject.time_minutes * 60;
          });
          const totalTime = Object.values(subjectTimes).reduce((sum, time) => sum + time, 0);
          initialTotalTimeRef.current = totalTime;

          setTimeConfig({
            type: 'subject_wise',
            globalTime: null,
            subjectTimes,
            currentSubjectTime: null,
            isSubjectWiseMode: true,
            sections: []
          });

          if (!timersRestoredRef.current) {
            setOverallTime(isNewAttempt ? null : totalTime);
            if (activeSubject && subjectTimes[activeSubject]) {
              setMainTimer(isNewAttempt ? null : subjectTimes[activeSubject]);
              setTimeConfig(prev => ({ ...prev, currentSubjectTime: isNewAttempt ? null : subjectTimes[activeSubject] }));
            }
          }
        } else if (type === 'sectional') {
          console.log('📋 Sectional time mode:', response.data.sections);
          const sections = response.data.sections || [];
          const subjectTimes = {};

          (response.data.subjects || []).forEach(subject => {
            if (subject.section_number) {
              subjectTimes[subject.name.toUpperCase()] = parseInt(subject.sectional_time_minutes || 0) * 60;
            }
          });

          const totalTime = sections.reduce((sum, sec) => sum + (parseInt(sec.time_minutes || 0) * 60), 0);
          initialTotalTimeRef.current = totalTime;

          setTimeConfig({
            type: 'sectional',
            globalTime: null,
            subjectTimes,
            currentSubjectTime: null,
            isSubjectWiseMode: true,
            sections
          });

          if (!timersRestoredRef.current) {
            setOverallTime(isNewAttempt ? null : totalTime);
            const currentSection = sections.find(sec =>
              Array.isArray(sec.subjects) &&
              sec.subjects.map(s => s.toUpperCase()).includes(activeSubject?.toUpperCase())
            );
            if (currentSection) {
              setMainTimer(isNewAttempt ? null : currentSection.time_minutes * 60);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching time configurations:", err);
      if (!timersRestoredRef.current) {
        setMainTimer(isNewAttempt ? null : 60 * 60);
      }
    }
  };

  useEffect(() => {
    if (exam_set_id) {
      const fetchMarkingValues = async () => {
        try {
          const response = await axios.get(`${BASE_URL}api/Marks/manage_negative_marking.php?exam_set_id=${exam_set_id}`);
          if (response.data.success && response.data.data) {
            setPositiveMarking(response.data.data.positive_marking !== null && response.data.data.positive_marking !== undefined ? parseFloat(response.data.data.positive_marking) : 1);
            setNegativeMarking(response.data.data.negative_marking !== null && response.data.data.negative_marking !== undefined ? parseFloat(response.data.data.negative_marking) : 0);
          }
        } catch (error) {
          console.error("Failed to fetch marking values:", error);
        }
      };
      fetchMarkingValues();
    }
  }, [exam_set_id, BASE_URL]);

  const updateTimerForSubject = useCallback((subject) => {
    if (timeConfig.globalTime) return;

    if (timeConfig.type === 'sectional') {
      const currentSection = timeConfig.sections.find(sec =>
        Array.isArray(sec.subjects) &&
        sec.subjects.map(s => s.toUpperCase()).includes(subject?.toUpperCase())
      );
      if (currentSection) {
        // Don't reset if we're still in the same section
        if (lastSectionRef.current && (lastSectionRef.current.id === currentSection.id || lastSectionRef.current.name === currentSection.name)) return;

        // If we just restored from backup, don't reset the timer for the initial section
        if (timersRestoredRef.current && lastSectionRef.current === null) {
          lastSectionRef.current = currentSection;
          return;
        }

        lastSectionRef.current = currentSection;
        const sectionTime = currentSection.time_minutes * 60;
        setMainTimer(isNewAttempt ? null : sectionTime);
        setTimeConfig(prev => ({ ...prev, currentSubjectTime: isNewAttempt ? null : sectionTime }));
        lastFiveMinutesPlayed.current = false;
        lastMinutePlayed.current = false;
      }
      return;
    }

    const subjectKey = subject?.toUpperCase();
    const subjectTime = timeConfig.subjectTimes[subjectKey];
    if (subjectTime) {
      // Don't reset if we're still on the same subject
      if (lastSubjectRef.current === subjectKey) return;

      // If we just restored from backup, don't reset the timer for the initial subject
      if (timersRestoredRef.current && lastSubjectRef.current === null) {
        lastSubjectRef.current = subjectKey;
        return;
      }

      lastSubjectRef.current = subjectKey;
      setMainTimer(isNewAttempt ? null : subjectTime);
      setTimeConfig(prev => ({ ...prev, currentSubjectTime: isNewAttempt ? null : subjectTime }));
      lastFiveMinutesPlayed.current = false;
      lastMinutePlayed.current = false;
    }
  }, [timeConfig.globalTime, timeConfig.type, timeConfig.sections, timeConfig.subjectTimes, isNewAttempt]);

  useEffect(() => {
    if (isNewAttempt && exam_set_id && user.id) {
      const fetchReattemptStats = async () => {
        try {
          const apiBaseUrl = BASE_URL;

          // Difficulty
          const diffRes = await axios.get(`${apiBaseUrl}api/Solutions/get_question_difficulty.php?exam_set_id=${exam_set_id}`);
          if (diffRes.data.status === "success") setGlobalDifficulty(diffRes.data.status === "success" ? diffRes.data.data : {});

          // Topper Times
          const topperRes = await axios.get(`${apiBaseUrl}api/Leaderboard/get_topper_question_times.php?exam_set_id=${exam_set_id}`);
          if (topperRes.data.status === "success") setTopperTimes(topperRes.data.data);

          // Save/Report Status
          const statusRes = await axios.get(`${apiBaseUrl}api/SaveandReport/get_status.php?student_id=${user.id}`);
          if (statusRes.data.success) {
            setSavedQuestions(new Set(statusRes.data.saved.map(id => parseInt(id))));
            setReportedQuestions(new Set(statusRes.data.reported.map(id => parseInt(id))));
            const reportsMap = {};
            statusRes.data.reports?.forEach(r => {
              reportsMap[parseInt(r.question_id)] = r;
            });
            setAllReports(reportsMap);
          }
        } catch (err) {
          console.error("Error fetching reattempt stats:", err);
        }
      };
      fetchReattemptStats();
    }
  }, [isNewAttempt, exam_set_id, user.id, BASE_URL]);

  // Reattempt Header Enhancements
  const [globalDifficulty, setGlobalDifficulty] = useState({});
  const [topperTimes, setTopperTimes] = useState({});
  const [savedQuestions, setSavedQuestions] = useState(new Set());
  const [reportedQuestions, setReportedQuestions] = useState(new Set());
  const [allReports, setAllReports] = useState({});

  const handleSaveSuccess = (qId, newState) => {
    setSavedQuestions(prev => {
      const next = new Set(prev);
      if (newState) next.add(parseInt(qId));
      else next.delete(parseInt(qId));
      return next;
    });
  };

  const handleReportSuccess = (qId) => {
    setReportedQuestions(prev => new Set([...prev, parseInt(qId)]));
  };

  const handleSubjectSwitchAttempt = () => {
    setShowSubjectSwitchWarning(true);
  };

  useEffect(() => {
    const clearStateIfNewAttempt = () => {
      if (isNewAttempt) {
        localStorage.removeItem(`examState_${course_id}_${exam_set_id}_${set_number}`);
        localStorage.removeItem(`examMainTimer_${course_id}_${exam_set_id}_${set_number}`);
        localStorage.removeItem(`examOverallTime_${course_id}_${exam_set_id}_${set_number}`);
        localStorage.removeItem(`examQuestionElapsedTimes_${course_id}_${exam_set_id}_${set_number}`);
      }
    };
    clearStateIfNewAttempt();

    const loadSavedState = () => {
      const savedState = localStorage.getItem(`examState_${course_id}_${exam_set_id}_${set_number}`);
      const savedMainTimer = localStorage.getItem(`examMainTimer_${course_id}_${exam_set_id}_${set_number}`);
      const savedOverallTime = localStorage.getItem(`examOverallTime_${course_id}_${exam_set_id}_${set_number}`);

      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          setAnswers(state.answers || {});
          setUnanswered(state.unanswered || []);
          setReviewed(state.reviewed || {});
          setVisited(new Set(state.visited || []));
          setQuestionTimers(state.questionTimers || {});
          setCurrentIndex(state.currentIndex || 0);
          setActiveSubject(state.activeSubject || "");
          setGlobalQuestionIndex(state.globalQuestionIndex || 0);
          setSubmittedSubjects(state.submittedSubjects || []);
          stateLoadedRef.current = true;
        } catch (e) {
          console.error("Failed to parse saved state", e);
        }
      }

      if (savedMainTimer && savedMainTimer !== "null") {
        try {
          const val = parseInt(savedMainTimer, 10);
          if (!isNaN(val)) {
            setMainTimer(val);
            timersRestoredRef.current = true;
          }
        } catch (e) {
          console.error("Failed to parse saved mainTimer", e);
        }
      }

      if (savedOverallTime && savedOverallTime !== "null") {
        try {
          const val = parseInt(savedOverallTime, 10);
          if (!isNaN(val)) {
            setOverallTime(val);
            timersRestoredRef.current = true;
          }
        } catch (e) {
          console.error("Failed to parse saved overallTime", e);
        }
      }
    };

    const fetchUserData = async () => {
      const storedUser = localStorage.getItem("student_user") || localStorage.getItem("user");
      if (!storedUser) {
        navigate("/examlogin");
        return;
      }
      const userData = JSON.parse(storedUser);
      setUser({
        name: userData.name || userData.full_name || `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "Guest",
        photo: userData.image || userData.profile_image || `${BASE_URL}api/Students/get_student_photo.php?id=${userData.id}`,
        id: userData.id || "",
        number: userData.number || userData.phone || "",
      });

      try {
        const response = await axios.get(
          `${BASE_URL}api/Solutions/get_attempt_number.php?student_id=${userData.id}&set_id=${exam_set_id}&course_id=${course_id}`
        );
        if (response.data.success) {
          setAttemptNumber(response.data.attempt_number);
        }
      } catch (err) {
        console.error("Error fetching attempt number:", err);
      }

      // Fetch original responses if it's a new attempt (practice mode)
      if (isNewAttempt) {
        try {
          const resp = await axios.get(`${BASE_URL}api/Solutions/get_latest_attempt_responses.php?student_id=${userData.id}&set_id=${exam_set_id}`);
          if (resp.data.success) {
            setOriginalResponses(resp.data.responses || {});
          }
        } catch (err) {
          console.error("Error fetching original responses:", err);
        }
      }
    };

    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        console.log(`📚 Fetching questions for exam_set_id: ${exam_set_id}`);

        // Fetch from get_questions.php with exam_set_id filtering and subject names
        const response = await axios.get(
          `${BASE_URL}api/Questions/get_questions.php?exam_set_id=${exam_set_id}`
        );

        if (response.data.success && response.data.data && response.data.data.length > 0) {
          const payload = response.data.data;
          const rawData = payload;
          const passageRecords = rawData.filter(q => q.question_type === 'passage');
          const normalRecords = rawData.filter(q => q.question_type !== 'passage');

          const processedPassages = await Promise.all(
            passageRecords.map(async (p) => {
              try {
                const subResponse = await axios.get(`${BASE_URL}api/Questions/get_questions.php?parent_id=${p.id}`);
                const subQuestions = (subResponse.data.success && Array.isArray(subResponse.data.data)) ? subResponse.data.data : [];

                return subQuestions.map(sub => ({
                  id: sub.id,
                  subject: (sub.subject_name || sub.subject || p.subject || "General").toUpperCase(),
                  question_type: 'passage',
                  question: sub.question_english || sub.question || "No question available",
                  question_hi: sub.question_hindi || sub.question_hi || "",
                  option_a: sub.option_a_english || sub.option_a || "",
                  option_b: sub.option_b_english || sub.option_b || "",
                  option_c: sub.option_c_english || sub.option_c || "",
                  option_d: sub.option_d_english || sub.option_d || "",
                  option_e: sub.option_e_english || sub.option_e || "",
                  option_a_hi: sub.option_a_hindi || sub.option_a_hi || "",
                  option_b_hi: sub.option_b_hindi || sub.option_b_hi || "",
                  option_c_hi: sub.option_c_hindi || sub.option_c_hi || "",
                  option_d_hi: sub.option_d_hindi || sub.option_d_hi || "",
                  option_e_hi: sub.option_e_hindi || sub.option_e_hi || "",
                  correct_option: sub.correct_option || "",
                  content: p.passage_english || p.content || "",
                  content_hi: p.passage_hindi || p.content_hi || "",
                  detail: sub.solution_english || sub.detail || "",
                  detail_hi: sub.solution_hindi || sub.detail_hi || "",
                  question_image_url: sub.question_image_url || null,
                  passage_id: p.id
                }));
              } catch (err) {
                console.error("Error fetching sub-questions:", err);
                return [];
              }
            })
          );

          const mappedNormalQuestions = normalRecords.map(q => ({
            id: q.id,
            subject: (q.subject_name || q.subject || "General").toUpperCase(),
            question_type: 'normal',
            question: q.question_english || q.question || "No question available",
            question_hi: q.question_hindi || q.question_hi || "",
            option_a: q.option_a_english || q.option_a || "",
            option_b: q.option_b_english || q.option_b || "",
            option_c: q.option_c_english || q.option_c || "",
            option_d: q.option_d_english || q.option_d || "",
            option_e: q.option_e_english || q.option_e || "",
            option_a_hi: q.option_a_hindi || q.option_a_hi || "",
            option_b_hi: q.option_b_hindi || q.option_b_hi || "",
            option_c_hi: q.option_c_hindi || q.option_c_hi || "",
            option_d_hi: q.option_d_hindi || q.option_d_hi || "",
            option_e_hi: q.option_e_hindi || q.option_e_hi || "",
            correct_option: q.correct_option || "",
            content: "",
            content_hi: "",
            detail: q.solution_english || q.detail || "",
            detail_hi: q.solution_hindi || q.detail_hi || "",
            question_image_url: q.question_image_url || null,
            passage_id: null
          }));

          const allQuestions = [...mappedNormalQuestions, ...processedPassages.flat()].sort((a, b) => parseInt(a.id || 0) - parseInt(b.id || 0));

          if (allQuestions.length > 0) {
            setQuestions(allQuestions);
            const uniqueSubjects = [...new Set(allQuestions.map((q) => q.subject))];
            setSubjects(uniqueSubjects);
            setActiveSubject(prev => prev || uniqueSubjects[0] || "");
            setIsLoading(false);
          } else {
            setError("No questions available");
            setIsLoading(false);
          }
        } else {
          setError("No questions available");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("Failed to load questions.");
        setIsLoading(false);
      }
    };

    const fetchSetName = async () => {
      try {
        console.log(`📋 Fetching set name for exam_set_id: ${exam_set_id}`);
        const response = await axios.get(
          `${BASE_URL}api/Exams/get_exam_sets.php?course_id=${course_id}`
        );

        if (response.data.success && response.data.exam_sets) {
          const currentSet = response.data.exam_sets.find(set => set.id === parseInt(exam_set_id));
          if (currentSet && currentSet.set_name) {
            console.log(`✅ Set name found: ${currentSet.set_name}`);
            setSetName(currentSet.set_name);
          }
        }
      } catch (err) {
        console.error("Error fetching set name:", err);
      }
    };

    loadSavedState();
    fetchUserData();
    fetchQuestions();
    fetchTimeConfigurations();
    fetchSetName();
  }, [course_id, exam_set_id, set_number, navigate]);

  // Auto-fullscreen for reattempts
  useEffect(() => {
    if (isNewAttempt && !document.fullscreenElement) {
      handleReturnToExam();
    }
  }, [isNewAttempt]);

  useEffect(() => {
    if (activeSubject && !initialTimeSet.current && timeConfig.subjectTimes[activeSubject] && !timeConfig.globalTime) {
      updateTimerForSubject(activeSubject);
      initialTimeSet.current = true;
    }
  }, [activeSubject, timeConfig]);

  useEffect(() => {
    if (activeSubject && !timeConfig.globalTime) {
      updateTimerForSubject(activeSubject);
    }
  }, [activeSubject]);

  useEffect(() => {
    if (overallTime === 0 && !showSubmitModal) {
      setShowSubmitModal(true);
    }
  }, [overallTime, showSubmitModal]);

  useEffect(() => {
    if (overallTime <= 0) return;

    const timer = setInterval(() => {
      setOverallTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [overallTime > 0]);

  useEffect(() => {
    if (mainTimer === null || mainTimer <= 0) return;

    const timer = setInterval(() => {
      setMainTimer((prev) => {
        if (prev === null) return null;
        if (prev <= 0) {
          // If sectional time is up, we should potentially submit subject or switch
          // For now just keep it at 0 to avoid negative
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mainTimer]);

  useEffect(() => {
    if (exitingRef.current) return;
    localStorage.setItem(`examMainTimer_${course_id}_${exam_set_id}_${set_number}`, String(mainTimer));
  }, [mainTimer, course_id, exam_set_id, set_number]);

  useEffect(() => {
    if (exitingRef.current) return;
    localStorage.setItem(`examOverallTime_${course_id}_${exam_set_id}_${set_number}`, String(overallTime));
  }, [overallTime, course_id, exam_set_id, set_number]);

  // Screenshot and Screen Recording Prevention
  useEffect(() => {
    if (isNewAttempt) return;
    const showBlockMessage = () => {
      const existingToast = document.getElementById('screen-protect-toast');
      if (existingToast) {
        existingToast.remove();
      }

      const toast = document.createElement('div');
      toast.id = 'screen-protect-toast';
      toast.textContent = '🔒 Screenshot and Screen Recording Disabled';
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        animation: slideDown 0.3s ease-out;
        font-size: 14px;
      `;

      // Add animation
      if (!document.getElementById('screen-protect-style')) {
        const style = document.createElement('style');
        style.id = 'screen-protect-style';
        style.textContent = `
          @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
          }
          .screen-protect-exit {
            animation: slideUp 0.3s ease-out forwards;
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('screen-protect-exit');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    };

    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      showBlockMessage();
      return false;
    };

    // Restrict mouse movement to sections header area
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const headerElement = containerRef.current.querySelector('.flex.flex-wrap.justify-between.items-center');
        if (headerElement) {
          const headerRect = headerElement.getBoundingClientRect();
          const restrictionThreshold = headerRect.bottom || 100;

          if (e.clientY < restrictionThreshold) {
            return;
          }
        }
      }
    };

    // Disable all keyboard input
    const handleKeyDown = (e) => {
      // Allow typing in inputs/textareas (required for report modal)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      e.preventDefault();
    };

    // Prevent drag and drop

    // Disable user select and drag
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent screen capture API
    const preventScreenCapture = () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        navigator.mediaDevices.getDisplayMedia = async function (...args) {
          showBlockMessage();
          throw new Error('Screen capture is disabled');
        };
      }
    };

    // Protect canvas from being captured
    const protectCanvas = () => {
      if (HTMLCanvasElement.prototype.toDataURL) {
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function (...args) {
          showBlockMessage();
          return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        };
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });
    document.addEventListener('mousemove', handleMouseMove, { capture: true });

    // Apply protections
    preventScreenCapture();
    protectCanvas();

    // Fullscreen and Tab Switch Detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsViolationVisible(true);
        setTabSwitchCount(prev => prev + 1);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsViolationVisible(true);
        setTabSwitchCount(prev => prev + 1);
      }
    };

    const handleBlur = () => {
      setIsViolationVisible(true);
      setTabSwitchCount(prev => prev + 1);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    // Disable Inspector element picker
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isNewAttempt]);

  const handleNextQuestion = useCallback(() => {
    if (currentIndex < filteredQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      saveStateToLocalStorage({ currentIndex: nextIdx });
    } else if (timeConfig?.type === 'sectional') {
      const currentSection = timeConfig.sections?.find(sec =>
        Array.isArray(sec.subjects) &&
        sec.subjects.map(s => s.toUpperCase()).includes(activeSubject?.toUpperCase())
      );
      if (currentSection && currentSection.subjects) {
        const subjectsInSec = currentSection.subjects.map(s => s.toUpperCase());
        const activeIdx = subjectsInSec.indexOf(activeSubject?.toUpperCase());
        if (activeIdx !== -1 && activeIdx < subjectsInSec.length - 1) {
          const nextSubject = currentSection.subjects[activeIdx + 1];
          setActiveSubject(nextSubject);
          saveStateToLocalStorage({ 
            activeSubject: nextSubject,
            currentIndex: 0
          });
        }
      }
    }
  }, [currentIndex, filteredQuestions.length, saveStateToLocalStorage, timeConfig, activeSubject]);

  const handleSubmitCurrentSubject = useCallback(() => {
    let subjectsToSubmit = [activeSubject];

    if (timeConfig.type === 'sectional') {
      const currentSection = timeConfig.sections.find(sec =>
        Array.isArray(sec.subjects) &&
        sec.subjects.map(s => s.toUpperCase()).includes(activeSubject?.toUpperCase())
      );
      if (currentSection) {
        subjectsToSubmit = currentSection.subjects.map(s => s.toUpperCase());
      }
    }

    const newSubmittedSubjects = [...new Set([...submittedSubjects, ...subjectsToSubmit])];
    setSubmittedSubjects(newSubmittedSubjects);

    // Find first subject that is not in newSubmittedSubjects
    const nextSubject = subjects.find(sub => !newSubmittedSubjects.includes(sub.toUpperCase()));

    if (nextSubject) {
      setActiveSubject(nextSubject);
      setCurrentIndex(0);

      if (!timeConfig.globalTime) {
        updateTimerForSubject(nextSubject);
      }

      saveStateToLocalStorage({
        submittedSubjects: newSubmittedSubjects,
        activeSubject: nextSubject,
        currentIndex: 0
      });
      if (window.innerWidth < 1024) {
        setSidebarVisible(false);
      }
    } else {
      setShowSubmitModal(true);
      saveStateToLocalStorage({ submittedSubjects: newSubmittedSubjects });
    }
  }, [submittedSubjects, activeSubject, subjects, timeConfig, updateTimerForSubject, saveStateToLocalStorage]);

  useEffect(() => {
    if (mainTimer === 0 && (timeConfig.type === 'subject_wise' || timeConfig.type === 'sectional')) {
      handleSubmitCurrentSubject();
    }
  }, [mainTimer, timeConfig.type, handleSubmitCurrentSubject]);

  const handleSaveNext = useCallback((selectedOption, timeSpent = 0) => {
    if (!filteredQuestions[currentIndex]) return;

    const currentQuestionId = filteredQuestions[currentIndex].id;
    let newAnswers = { ...answers };
    let newUnanswered = [...unanswered];
    let newReviewed = { ...reviewed };
    let newQuestionTimers = { ...questionTimers, [currentQuestionId]: timeSpent };

    if (selectedOption) {
      newAnswers[currentQuestionId] = selectedOption;
      newUnanswered = newUnanswered.filter((id) => id !== currentQuestionId);
      if (newReviewed[currentQuestionId]) {
        delete newReviewed[currentQuestionId];
      }
    } else {
      if (!newUnanswered.includes(currentQuestionId)) {
        newUnanswered.push(currentQuestionId);
      }
      if (newAnswers[currentQuestionId]) {
        delete newAnswers[currentQuestionId];
      }
    }

    setAnswers(newAnswers);
    console.log("Saved Answers:", newAnswers);
    setUnanswered(newUnanswered);
    setReviewed(newReviewed);
    setQuestionTimers(newQuestionTimers);

    saveStateToLocalStorage({
      answers: newAnswers,
      unanswered: newUnanswered,
      reviewed: newReviewed,
      questionTimers: newQuestionTimers
    });

    // If it's a practice reattempt and we haven't shown feedback yet, show it now
    if (isNewAttempt && !showFeedback) {
      setShowFeedback(true);
      return;
    }

    // Reset feedback for the next question
    setShowFeedback(false);
    handleNextQuestion();
  }, [answers, currentIndex, filteredQuestions, reviewed, unanswered, questionTimers, handleNextQuestion, saveStateToLocalStorage, isNewAttempt, showFeedback]);

  const handleReviewNext = useCallback((selectedOption, timeSpent = 0) => {
    if (!filteredQuestions[currentIndex]) return;

    const currentQuestionId = filteredQuestions[currentIndex].id;
    const type = selectedOption ? "reviewedAnswered" : "reviewedUnanswered";

    let newReviewed = { ...reviewed, [currentQuestionId]: type };
    let newAnswers = { ...answers };
    let newUnanswered = [...unanswered];
    let newQuestionTimers = { ...questionTimers, [currentQuestionId]: timeSpent };

    if (selectedOption) {
      newAnswers[currentQuestionId] = selectedOption;
      newUnanswered = newUnanswered.filter((id) => id !== currentQuestionId);
    } else {
      if (!newUnanswered.includes(currentQuestionId)) {
        newUnanswered.push(currentQuestionId);
      }
      if (newAnswers[currentQuestionId]) {
        delete newAnswers[currentQuestionId];
      }
    }

    setReviewed(newReviewed);
    setAnswers(newAnswers);
    setUnanswered(newUnanswered);
    setQuestionTimers(newQuestionTimers);

    saveStateToLocalStorage({
      reviewed: newReviewed,
      answers: newAnswers,
      unanswered: newUnanswered,
      questionTimers: newQuestionTimers
    });

    // If it's a practice reattempt and we haven't shown feedback yet, show it now
    if (isNewAttempt && !showFeedback) {
      setShowFeedback(true);
      return;
    }

    // Reset feedback for the next question
    setShowFeedback(false);
    handleNextQuestion();
  }, [answers, currentIndex, filteredQuestions, reviewed, unanswered, questionTimers, handleNextQuestion, saveStateToLocalStorage, isNewAttempt, showFeedback]);

  const handleClearResponse = useCallback(() => {
    if (!filteredQuestions[currentIndex]) return;

    const currentQuestionId = filteredQuestions[currentIndex].id;
    let newAnswers = { ...answers };
    let newUnanswered = [...unanswered];
    let newReviewed = { ...reviewed };

    if (newAnswers[currentQuestionId]) {
      delete newAnswers[currentQuestionId];
    }

    if (!newUnanswered.includes(currentQuestionId)) {
      newUnanswered.push(currentQuestionId);
    }

    if (newReviewed[currentQuestionId]) {
      delete newReviewed[currentQuestionId];
    }

    setAnswers(newAnswers);
    console.log("Saved Answers (Cleared):", newAnswers);
    setUnanswered(newUnanswered);
    setReviewed(newReviewed);

    saveStateToLocalStorage({
      answers: newAnswers,
      unanswered: newUnanswered,
      reviewed: newReviewed
    });
  }, [answers, currentIndex, filteredQuestions, reviewed, unanswered, saveStateToLocalStorage]);

  const handleQuitTest = useCallback(async () => {
    exitingRef.current = true;

    // Exit fullscreen before navigating
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Error exiting fullscreen:", err);
    }

    localStorage.removeItem(`examState_${course_id}_${exam_set_id}_${set_number}`);
    localStorage.removeItem(`examMainTimer_${course_id}_${exam_set_id}_${set_number}`);
    localStorage.removeItem(`examOverallTime_${course_id}_${exam_set_id}_${set_number}`);
    // Also clear question elapsed times
    localStorage.removeItem(`examQuestionElapsedTimes_${course_id}_${exam_set_id}_${set_number}`);

    if (isNewAttempt) {
      navigate(`/exam/result/${course_id}/${exam_set_id}/${set_number}?tab=detailed solution`, { replace: true });
    } else {
      navigate(`/`, { replace: true });
    }
  }, [course_id, exam_set_id, set_number, navigate, isNewAttempt]);

  const handleFinalSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      const responses = questions.map(q => {
        const selected = answers[q.id] || null;
        let isCorrect = 0;
        if (selected) {
          let qCorrect = (q.correct_option || q.correct_key)?.toString().trim().toUpperCase() || "";
          if (qCorrect === "1") qCorrect = "A";
          if (qCorrect === "2") qCorrect = "B";
          if (qCorrect === "3") qCorrect = "C";
          if (qCorrect === "4") qCorrect = "D";
          if (qCorrect === "5") qCorrect = "E";
          const selClean = selected.trim().toUpperCase();
          if (selClean === qCorrect || qCorrect.includes(selClean) || (qCorrect.startsWith("OPTION") && qCorrect.endsWith(selClean))) {
            isCorrect = 1;
          }
        }
        return {
          question_id: q.id,
          selected_key: selected,
          is_correct: isCorrect,
          time_spent: questionTimers[q.id] || 0,
          marked_for_review: reviewed[q.id] ? 1 : 0,
          review_status: reviewed[q.id] || null,
          mark_review: reviewed[q.id] ? 1 : 0
        };
      });

      const submissionData = {
        student_id: user.id,
        set_id: exam_set_id,
        course_id: course_id,
        ui_type: 'old',
        responses: responses
      };
      console.log("Final Submission Data:", submissionData);

      let actualAttemptNumber = 0;
      if (!isNewAttempt) {
        const response = await axios.post(`${BASE_URL}api/Solutions/record_attempt.php`, submissionData);
        if (response.data.success) {
          actualAttemptNumber = parseInt(response.data.attempt_number) || 0;

          // Update Leaderboard if it's the first attempt
          if (actualAttemptNumber === 1) {
            try {
              const calculatedScore = responses.reduce((sum, r) => {
                if (r.is_correct === 1) {
                  return sum + positiveMarking;
                } else if (r.selected_key) {
                  return sum - negativeMarking;
                }
                return sum;
              }, 0);
              const totalTimeSpent = responses.reduce((sum, r) => sum + (parseInt(r.time_spent) || 0), 0);

              await axios.post(`${BASE_URL}api/Leaderboard/update_leaderboard.php`, {
                student_id: Number(user.id),
                course_id: Number(course_id),
                set_id: Number(exam_set_id),
                total_marks: calculatedScore,
                total_time: totalTimeSpent,
                attempt_number: actualAttemptNumber
              });
            } catch (leaderboardErr) {
              console.error("Failed to update leaderboard:", leaderboardErr);
            }
          }
        } else {
          setError(response.data.message || "Failed to submit exam.");
          setIsLoading(false);
          return;
        }
      } else {
        // Practice mode: Show comparison modal
        setShowComparisonModal(true);
        setIsLoading(false);
        return;
      }

      handleFinalCleanupAndNavigate();
    } catch (err) {
      console.error("Submission error:", err);
      setError("An error occurred during submission.");
      setIsLoading(false);
    }
  }, [user.id, exam_set_id, course_id, set_number, answers, questions, questionTimers, navigate, positiveMarking, negativeMarking, BASE_URL, isNewAttempt, reviewed]);

  const handleFinalCleanupAndNavigate = useCallback(async () => {
    exitingRef.current = true;

    // Exit fullscreen before navigating to result
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Error exiting fullscreen on submit:", err);
    }

    // Compute subject wise stats
    const computedSubjectStats = {};
    questions.forEach(q => {
      const sub = q.subject || "GENERAL";
      if (!computedSubjectStats[sub]) {
        computedSubjectStats[sub] = {
          questionCount: 0,
          correctCount: 0,
          incorrectCount: 0,
          attemptedCount: 0,
          score: 0,
          timeSpent: 0
        };
      }
      
      computedSubjectStats[sub].questionCount++;
      computedSubjectStats[sub].timeSpent += questionTimers[q.id] || 0;
      
      const selected = answers[q.id];
      if (selected) {
        computedSubjectStats[sub].attemptedCount++;
        let qCorrect = (q.correct_option || q.correct_key)?.toString().trim().toUpperCase() || "";
        if (qCorrect === "1") qCorrect = "A";
        if (qCorrect === "2") qCorrect = "B";
        if (qCorrect === "3") qCorrect = "C";
        if (qCorrect === "4") qCorrect = "D";
        if (qCorrect === "5") qCorrect = "E";
        
        const selClean = selected.trim().toUpperCase();
        if (selClean === qCorrect || qCorrect.includes(selClean) || (qCorrect.startsWith("OPTION") && qCorrect.endsWith(selClean))) {
          computedSubjectStats[sub].correctCount++;
          computedSubjectStats[sub].score += 3;
        } else {
          computedSubjectStats[sub].incorrectCount++;
          computedSubjectStats[sub].score -= 1;
        }
      }
    });

    // Compute and store live responses for detailed solutions (subject wise mode compatibility)
    const computedLiveResponses = {};
    questions.forEach(q => {
      const selected = answers[q.id] || null;
      let isCorrect = 0;
      if (selected) {
        let qCorrect = (q.correct_option || q.correct_key)?.toString().trim().toUpperCase() || "";
        if (qCorrect === "1") qCorrect = "A";
        if (qCorrect === "2") qCorrect = "B";
        if (qCorrect === "3") qCorrect = "C";
        if (qCorrect === "4") qCorrect = "D";
        if (qCorrect === "5") qCorrect = "E";
        
        const selClean = selected.trim().toUpperCase();
        if (selClean === qCorrect || qCorrect.includes(selClean) || (qCorrect.startsWith("OPTION") && qCorrect.endsWith(selClean))) {
          isCorrect = 1;
        }
      }
      computedLiveResponses[q.id] = {
        selected_key: selected,
        is_correct: isCorrect,
        time_spent: questionTimers[q.id] || 0,
        marked_for_review: reviewed[q.id] ? 1 : 0,
        review_status: reviewed[q.id] || null,
        mark_review: reviewed[q.id] ? 1 : 0
      };
    });
    if (!isNewAttempt) {
      localStorage.setItem(`liveResponses_${course_id}_${exam_set_id}_${set_number}`, JSON.stringify(computedLiveResponses));
      localStorage.setItem(`subjectStats_${course_id}_${exam_set_id}_${set_number}`, JSON.stringify(computedSubjectStats));
    }

    localStorage.removeItem(`examState_${course_id}_${exam_set_id}_${set_number}`);
    localStorage.removeItem(`examMainTimer_${course_id}_${exam_set_id}_${set_number}`);
    localStorage.removeItem(`examOverallTime_${course_id}_${exam_set_id}_${set_number}`);
    localStorage.removeItem(`examQuestionElapsedTimes_${course_id}_${exam_set_id}_${set_number}`);

    localStorage.setItem(`timeConfig_${course_id}_${exam_set_id}_${set_number}`, JSON.stringify(timeConfig));

    const isSubjectWise = timeConfig.type === 'subject_wise';
    const isSectional = timeConfig.type === 'sectional';
    if (location.state?.return_to === 'dashboard') {
      navigate('/dashboard', { replace: true });
    } else {
      let modeParam = '';
      if (isSubjectWise) modeParam = '?mode=subject_wise';
      if (isSectional) modeParam = '?mode=sectional';

      navigate(`/exam/result/${course_id}/${exam_set_id}/${set_number}${modeParam}`, {
        replace: true,
        state: {
          subjectStats: computedSubjectStats,
          totalSubjects: Object.keys(computedSubjectStats).length,
          isSubjectWise: isSubjectWise,
          timeConfig: timeConfig
        }
      });
    }
  }, [course_id, exam_set_id, set_number, navigate, location.state, timeConfig.type, questions, answers, questionTimers, reviewed]);

  const calculateComparisonStats = () => {
    const total = questions.length;

    // Calculate current stats
    let currentCorrect = 0;
    let currentIncorrect = 0;
    let currentUnanswered = 0;

    questions.forEach(q => {
      const selected = answers[q.id];
      if (!selected) {
        currentUnanswered++;
      } else if (selected.trim().toUpperCase() === q.correct_option?.toString().trim().toUpperCase()) {
        currentCorrect++;
      } else {
        currentIncorrect++;
      }
    });

    const currentScore = (currentCorrect * positiveMarking) - (currentIncorrect * negativeMarking);

    // Calculate original stats
    let originalCorrect = 0;
    let originalIncorrect = 0;
    let originalUnanswered = 0;

    questions.forEach(q => {
      const resp = originalResponses[q.id];
      if (!resp || !resp.selected_key) {
        originalUnanswered++;
      } else if (resp.is_correct) {
        originalCorrect++;
      } else {
        originalIncorrect++;
      }
    });

    const originalScore = (originalCorrect * positiveMarking) - (originalIncorrect * negativeMarking);

    return {
      original: { correct: originalCorrect, incorrect: originalIncorrect, unanswered: originalUnanswered, score: originalScore, total },
      current: { correct: currentCorrect, incorrect: currentIncorrect, unanswered: currentUnanswered, score: currentScore, total }
    };
  };

  const comparisonStats = calculateComparisonStats();

  useEffect(() => {
    if (activeSubject && questions.length > 0) {
      const filtered = questions.filter(
        (q) => q.subject.toUpperCase() === activeSubject.toUpperCase()
      );
      setFilteredQuestions(filtered);

      // Reset currentIndex when subject changes, unless we loaded a saved state
      if (!stateLoadedRef.current) {
        setCurrentIndex(0);
      } else {
        stateLoadedRef.current = false; // Reset for future subject changes
      }
    }
  }, [activeSubject, questions]);

  useEffect(() => {
    if (filteredQuestions.length > 0 && currentIndex >= 0) {
      const currentQ = filteredQuestions[currentIndex];
      if (currentQ) {
        const newVisited = new Set(visited);
        newVisited.add(currentQ.id);
        setVisited(newVisited);

        // Find global index
        const globalIdx = questions.findIndex(q => q.id === currentQ.id);
        setGlobalQuestionIndex(globalIdx);

        saveStateToLocalStorage({
          visited: newVisited,
          globalQuestionIndex: globalIdx
        });
      }
    }
  }, [currentIndex, filteredQuestions, questions]);

  const currentQuestion = filteredQuestions[currentIndex];
  const hasContent = !!(currentQuestion?.content || currentQuestion?.content_hi);

  const answeredCount = questions.filter(q => answers[q.id]).length;
  const unansweredCount = questions.filter(q => !answers[q.id] && visited.has(q.id) && !reviewed[q.id]).length;
  const markedCount = questions.filter(q => reviewed[q.id] === "reviewedUnanswered").length;
  const answeredMarkedCount = questions.filter(q => reviewed[q.id] === "reviewedAnswered").length;
  const notVisitedCount = questions.filter(q => !visited.has(q.id)).length;

  const isLastSubject = () => {
    const unsubmittedSubjects = subjects.filter(sub => !submittedSubjects.includes(sub.toUpperCase()));
    return unsubmittedSubjects.length <= 1;
  };

  const canAccessSubject = (subject) => {
    if (timeConfig.type === 'overall') return true;
    if (timeConfig.type === 'subject_wise') return subject.toUpperCase() === activeSubject.toUpperCase();
    if (timeConfig.type === 'sectional') return isSubjectInActiveSection(subject);
    return false;
  };

  if (isLoading && !questions.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading your exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="flex flex-col h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 select-none"
      >
        <FullscreenViolation
          isVisible={isViolationVisible}
          onReturn={handleReturnToExam}
          violationCount={tabSwitchCount}
        />

        <div className="flex flex-1 overflow-hidden relative">
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Main Header - Moved inside to allow full-height sidebar */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-4 py-1.5 flex justify-between items-center z-30 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:hidden flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                </button>
                <h1 className="text-xs sm:text-lg font-bold dark:text-white uppercase truncate pr-2">
                  {setName || "Practice Set"}
                </h1>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {overallTime !== null && !isNewAttempt && (
                  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs sm:text-sm">
                    <span className="font-bold dark:text-white whitespace-nowrap">Time Left:</span>
                    <span className={`font-bold tabular-nums font-mono min-w-[40px] text-center ${overallTime < 300 ? 'text-red-600' : 'dark:text-white'
                      }`}>
                      {formatTime(overallTime)}
                    </span>
                  </div>
                )}
              </div>
            </header>

            <QuestionSection
              key={currentQuestion?.id}
              subjects={subjects}
              activeSubject={activeSubject}
              setActiveSubject={setActiveSubject}
              filteredQuestions={filteredQuestions}
              currentIndex={currentIndex}
              currentQuestion={filteredQuestions[currentIndex]}
              currentGlobalQuestionNumber={globalQuestionIndex}
              language={language}
              setLanguage={setLanguage}
              navigate={navigate}
              answers={answers}
              handleSaveNext={handleSaveNext}
              handleReviewNext={handleReviewNext}
              handleClearResponse={handleClearResponse}
              questionTimers={questionTimers}
              globalQuestionIndex={globalQuestionIndex}
              hasContent={!!filteredQuestions[currentIndex]?.content}
              submittedSubjects={submittedSubjects}
              timeConfig={timeConfig}
              onSubjectSwitchAttempt={handleSubjectSwitchAttempt}
              mainTimer={mainTimer}
              overallTime={overallTime}
              studentNumber={user.number}
              course_id={course_id}
              exam_set_id={exam_set_id}
              set_number={set_number}
              positiveMarking={positiveMarking}
              negativeMarking={negativeMarking}
              isNewAttempt={isNewAttempt}
              showFeedback={showFeedback}
              originalResponse={originalResponses[filteredQuestions[currentIndex]?.id]}
              globalDifficulty={globalDifficulty}
              topperTimes={topperTimes}
              savedQuestions={savedQuestions}
              reportedQuestions={reportedQuestions}
              handleSaveSuccess={handleSaveSuccess}
              handleReportSuccess={handleReportSuccess}
            />

            {/* Bottom Nav for Mobile */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 flex justify-between items-center sm:hidden">
              <button
                onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="p-2 disabled:opacity-30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 dark:text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="text-xs font-bold dark:text-white">
                Q. {currentIndex + 1} / {filteredQuestions.length}
              </span>
              <button
                onClick={() => currentIndex < filteredQuestions.length - 1 && setCurrentIndex(currentIndex + 1)}
                disabled={currentIndex === filteredQuestions.length - 1}
                className="p-2 disabled:opacity-30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 dark:text-white rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Sidebar Toggle Button (Desktop) */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 z-40 bg-gray-200 dark:bg-gray-800 p-1 rounded-l border border-r-0 border-gray-300 dark:border-gray-600 shadow-sm transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 items-center justify-center"
            style={{
              right: sidebarVisible ? '25%' : '0',
              height: '40px',
              width: '20px'
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${sidebarVisible ? 'rotate-0' : 'rotate-180'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Mobile backdrop to close sidebar on clicking outside */}
          {sidebarVisible && (
            <div 
              onClick={() => setSidebarVisible(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
            />
          )}

          <SidebarSection
            sidebarVisible={sidebarVisible}
            setSidebarVisible={setSidebarVisible}
            user={user}
            answeredCount={answeredCount}
            unansweredCount={unansweredCount}
            markedCount={markedCount}
            notVisitedCount={notVisitedCount}
            answeredMarkedCount={answeredMarkedCount}
            currentQuestion={currentQuestion}
            filteredQuestions={filteredQuestions}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            answers={answers}
            unanswered={unanswered}
            reviewed={reviewed}
            visited={visited}
            globalQuestionIndex={globalQuestionIndex}
            setShowQuitModal={setShowQuitModal}
            setShowSubmitModal={setShowSubmitModal}
            submittedSubjects={submittedSubjects}
            canAccessSubject={canAccessSubject}
          />
        </div>
      </div>

      {showSubmitModal && (
        <SubmitModal
          subjects={subjects}
          questions={questions}
          answers={answers}
          reviewed={reviewed}
          visited={visited}
          setShowSubmitModal={setShowSubmitModal}
          handleFinalSubmit={handleFinalSubmit}
          handleSubmitCurrentSubject={handleSubmitCurrentSubject}
          isLastSubject={isLastSubject()}
          submittedSubjects={submittedSubjects}
          timeConfig={timeConfig}
          isTimeUp={overallTime === 0}
        />
      )}

      {showQuitModal && (
        <QuitModal
          setShowQuitModal={setShowQuitModal}
          handleQuit={handleQuitTest}
        />
      )}

      {showWarningModal && (
        <WarningModal
          setShowWarningModal={setShowWarningModal}
        />
      )}

      {showSubjectSwitchWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-6 rounded-lg shadow-xl ${true ? 'bg-white text-gray-900' : 'bg-gray-800 text-white'
            }`}>
            <h3 className="text-lg font-semibold mb-4">Section Time Restriction</h3>
            <p className="text-sm mb-6">
              The next section will automatically change when the given section's time has expired. You cannot manually switch sections in {timeConfig?.type === 'sectional' ? 'sectional' : 'subject-wise'} mode.
            </p>
            <button
              onClick={() => setShowSubjectSwitchWarning(false)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {showComparisonModal && (
        <ReattemptComparisonModal
          isOpen={showComparisonModal}
          onClose={handleFinalCleanupAndNavigate}
          originalStats={comparisonStats.original}
          currentStats={comparisonStats.current}
          setName={setName}
        />
      )}

    </>
  );
};

export default ExamQuestionPage;
