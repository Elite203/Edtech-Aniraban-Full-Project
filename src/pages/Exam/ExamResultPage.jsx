import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaExpand, FaCompress } from "react-icons/fa";
import { Lock } from "lucide-react";
import party from "party-js";
import AnalysisTab from "../../tabs/AnalysisTab";
import SolutionsTab from "../../tabs/SolutionsTab";
import CompareTab from "../../tabs/CompareTab";
import LeaderboardTab from "../../tabs/LeaderboardTab";
import SubjectWiseAnalysis from "../../tabs/SubjectWiseAnalysis";
import TopicandChapterWiseAnalysis from "../../tabs/TopicandChapterWiseAnalysis";
import TimeManagement from "../../tabs/TimeManagement";

import { ScrollSmoother } from "gsap/ScrollSmoother";

const ExamResultPage = () => {
  const { course_id, exam_set_id, set_number } = useParams();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const location = useLocation();

  useEffect(() => {
    try {
      if (typeof ScrollSmoother !== 'undefined' && ScrollSmoother) {
        const smoother = ScrollSmoother.get();
        if (smoother) {
          smoother.kill();
        }
      }
    } catch (e) {
      console.warn("Smooth scroll exclusion error:", e);
    }
  }, []);

  const queryParams = new URLSearchParams(location.search);
  const isSubjectWise = queryParams.get("mode") === "subject_wise";
  const initialTab = queryParams.get("tab") || "overall analysis";
  const urlAttempt = queryParams.get("attempt_number");

  const lastFetchedAttempt = React.useRef(urlAttempt ? parseInt(urlAttempt) : null);

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [rank, setRank] = useState(0);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [percentile, setPercentile] = useState(0);
  const [attemptNumber, setAttemptNumber] = useState(urlAttempt ? parseInt(urlAttempt) : null);
  const [allAttempts, setAllAttempts] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(initialTab);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [language, setLanguage] = useState("english");
  const [selectedMetric, setSelectedMetric] = useState("Score");
  const [filter, setFilter] = useState("ALL");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [totalMarks, setTotalMarks] = useState(0);
  const [courseInfo, setCourseInfo] = useState(null);
  const [setInfo, setSetInfo] = useState(null);
  const [isCoursePurchased, setIsCoursePurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);

  const isLatestAttempt = React.useMemo(() => {
    if (!allAttempts || allAttempts.length === 0) return true;
    const maxAttempt = Math.max(...allAttempts.map(a => parseInt(a.attempt_number) || 0), 0);
    const currentAttempt = attemptNumber || maxAttempt;
    return parseInt(currentAttempt) === maxAttempt;
  }, [allAttempts, attemptNumber]);

  const activeSubjectStats = React.useMemo(() => {
    if (!isLatestAttempt) return null; // Force dynamic computation for historical attempts
    if (location.state?.subjectStats) return location.state.subjectStats;
    try {
      const stored = localStorage.getItem(`subjectStats_${course_id}_${exam_set_id}_${set_number}`);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, [isLatestAttempt, location.state?.subjectStats, course_id, exam_set_id, set_number]);

  const timeConfig = React.useMemo(() => {
    if (location.state?.timeConfig) return location.state.timeConfig;
    try {
      const stored = localStorage.getItem(`timeConfig_${course_id}_${exam_set_id}_${set_number}`);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, [location.state?.timeConfig, course_id, exam_set_id, set_number]);

  const storedUserId = localStorage.getItem("user_id");
  let userId = null;
  if (storedUserId) {
    try {
      userId = JSON.parse(storedUserId);
    } catch (e) {
      userId = storedUserId;
    }
  }
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!userId || !course_id) {
        setCheckingPurchase(false);
        return;
      }
      setCheckingPurchase(true);
      try {
        const apiBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
        let purchased = false;

        // Fetch test series purchases
        const tsRes = await axios.get(`${apiBaseUrl}api/Courses/get_test_series_purchases.php`, {
          params: { student_id: userId }
        });
        if (tsRes.data.status === 'success' && Array.isArray(tsRes.data.data)) {
          const activePurchase = tsRes.data.data.some(
            p => String(p.course_id) === String(course_id) && p.status === 'active'
          );
          if (activePurchase) {
            purchased = true;
          }
        }

        // Fetch course details to check if it's a current affairs course
        if (!purchased) {
          const coursesRes = await axios.get(`${apiBaseUrl}api/Courses/get_courses.php`);
          if (coursesRes.data.success) {
            const course = coursesRes.data.courses.find(c => String(c.id) === String(course_id));
            const isCurrentAffairs = course_id === 'premium_monthly' || (course && course.title && course.title.toLowerCase().includes('current affairs'));
            if (isCurrentAffairs) {
              const caRes = await axios.get(`${apiBaseUrl}api/CurrentAffairs/get_monthly_test_purchase.php`, {
                params: { student_id: userId }
              });
              if (caRes.data.status === 'success' && caRes.data.data) {
                const orderData = caRes.data.data;
                const isPremiumActive = orderData.is_active && new Date(orderData.expiry_date) > new Date();
                if (isPremiumActive) {
                  purchased = true;
                }
              }
            }
          }
        }
        setIsCoursePurchased(purchased);
      } catch (e) {
        console.error("Error checking purchase status:", e);
      } finally {
        setCheckingPurchase(false);
      }
    };
    checkPurchaseStatus();
  }, [course_id, userId, BASE_URL]);
  useEffect(() => {
    // Push a new state to history to prevent immediate back navigation
    window.history.pushState(null, null, window.location.pathname);

    const handlePopState = (event) => {
      // Re-push state to keep the user on the results page
      window.history.pushState(null, null, window.location.pathname);
      // Optional: you could navigate them to home instead if preferred
      // navigate("/");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(() => { });
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen().catch(() => { });
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen().catch(() => { });
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => { });
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen().catch(() => { });
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen().catch(() => { });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  };

  useEffect(() => {
    enterFullscreen();
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement));
    };

    // Prevent back button
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!loading && totalMarks > 0 && score === totalMarks) {
      // Left side confetti
      party.confetti(new party.Rect(0, window.innerHeight / 2, 0, 0), {
        count: party.variation.range(300, 400),
        angle: party.variation.range(-40, 40),
        speed: party.variation.range(300, 600),
        spread: 80,
      });
      // Right side confetti
      party.confetti(new party.Rect(window.innerWidth, window.innerHeight / 2, 0, 0), {
        count: party.variation.range(300, 400),
        angle: party.variation.range(140, 220),
        speed: party.variation.range(300, 600),
        spread: 80,
      });
    }
  }, [loading, score, totalMarks]);

  const [marking, setMarking] = useState({ positive: 3, negative: 1 });
  const [cutoffs, setCutoffs] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [highestMarks, setHighestMarks] = useState(0);
  const [avgMarks, setAvgMarks] = useState(0);

  const cutoff = cutoffs[selectedCategory] || 0;
  const isPassed = score >= cutoff;

  const fetchExamResults = async (selectedAttempt = null) => {
    setLoading(true);
    try {
      if (!userId) return navigate("/login");

      const apiBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;

      // Fetch all attempts for this user and set first
      let userAttempts = [];
      let maxAttempt = 0;
      try {
        const attemptsResponse = await axios.get(`${apiBaseUrl}api/Solutions/get_user_attempts.php`, {
          params: { student_id: userId }
        });
        if (attemptsResponse.data.success) {
          userAttempts = attemptsResponse.data.data.filter(
            a => a.set_id == exam_set_id && a.course_id == course_id
          );
          setAllAttempts(userAttempts);
          maxAttempt = Math.max(...userAttempts.map(a => parseInt(a.attempt_number) || 0), 0);
        }
      } catch (e) {
        console.error("Error fetching attempts:", e);
      }

      // Fetch Marking Details
      try {
        const markingRes = await axios.get(`${apiBaseUrl}api/Marks/get_set_details.php`, {
          params: { exam_set_id }
        });
        if (markingRes.data.success) {
          setMarking({
            positive: parseFloat(markingRes.data.data.positive_marking) || 3,
            negative: parseFloat(markingRes.data.data.negative_marking) || 1
          });
        }
      } catch (e) { console.error("Error fetching marking:", e); }

      // Fetch Cutoffs
      try {
        const cutoffRes = await axios.get(`${apiBaseUrl}api/Category/get_category_marks.php`, {
          params: { exam_set_id }
        });
        if (cutoffRes.data.success) {
          setCutoffs(cutoffRes.data.data);
          const cats = Object.keys(cutoffRes.data.data).filter(k => !['id', 'exam_set_id'].includes(k));
          setCategories(cats);
        }
      } catch (e) { console.error("Error fetching cutoffs:", e); }

      // Fetch Total Marks
      let fetchedTotalMarks = 0;
      try {
        const totalMarksRes = await axios.get(`${apiBaseUrl}api/Marks/get_exam_total_marks.php`, {
          params: { exam_set_id }
        });
        if (totalMarksRes.data.success) {
          fetchedTotalMarks = parseFloat(totalMarksRes.data.total_marks) || 0;
          setTotalMarks(fetchedTotalMarks);
        }
      } catch (e) { console.error("Error fetching total marks:", e); }

      const targetAttemptNum = parseInt(selectedAttempt || attemptNumber || maxAttempt) || 1;
      lastFetchedAttempt.current = targetAttemptNum;

      const resultResponse = await axios.get(`${apiBaseUrl}api/TimeManagement/get_exam_result_data.php`, {
        params: {
          user_id: userId,
          course_id,
          exam_set_id,
          set_number,
          attempt_number: targetAttemptNum
        },
      });

      if (resultResponse.data.status !== "success") {
        throw new Error(resultResponse.data.message || "No result data found");
      }

      let payload = resultResponse.data.data;

      // Fetch all questions to map the correct subject if it's missing in records
      try {
        const questionsRes = await axios.get(`${apiBaseUrl}api/Questions/get_questions.php`, {
          params: { exam_set_id, include_sub_questions: 1 }
        });
        if (questionsRes.data.success && questionsRes.data.data) {
          const allQuestions = questionsRes.data.data.sort((a, b) => parseInt(a.id || 0) - parseInt(b.id || 0));
          const questionMap = {};

          allQuestions.forEach(q => {
            const name = (q.subject || q.subject_name || q.subject_id || "General").toString().trim();
            questionMap[q.id] = name;
          });

          const answerableQuestions = allQuestions.filter(q => q.question_type !== 'passage_container' && !(q.question_type === 'passage' && (!q.passage_id || q.passage_id === null)));

          const payloadMap = {};
          payload.forEach(record => {
            const qId = record.question_id || record.id;
            payloadMap[qId] = record;
          });

          payload = answerableQuestions.map(q => {
            const existingRecord = payloadMap[q.id];
            const mappedSubject = questionMap[q.id];
            if (existingRecord) {
              if (mappedSubject && mappedSubject.toLowerCase() !== "general") {
                return { ...existingRecord, subject: mappedSubject, subject_name: mappedSubject };
              }
              return existingRecord;
            } else {
              return { ...q, question_id: q.id, selected_key: null, is_correct: 0, time_spent: 0, subject: mappedSubject, subject_name: mappedSubject };
            }
          });
        }
      } catch (e) { console.error("Error fetching questions for subject mapping:", e); }

      setRecords(payload);

      let liveResponses = null;
      if (parseInt(targetAttemptNum) === maxAttempt) {
        try {
          const stored = localStorage.getItem(`liveResponses_${course_id}_${exam_set_id}_${set_number}`);
          if (stored) liveResponses = JSON.parse(stored);
        } catch (e) {
          console.error("Error loading live responses:", e);
        }
      }

      if (liveResponses) {
        payload = payload.map(record => {
          const qId = record.question_id || record.id;
          const live = liveResponses[String(qId)] || liveResponses[qId];
          if (live) {
            return {
              ...record,
              selected_key: live.selected_key,
              is_correct: live.is_correct,
              time_spent: live.time_spent || record.time_spent,
              marked_for_review: live.marked_for_review !== undefined ? live.marked_for_review : record.marked_for_review,
              review_status: live.review_status !== undefined ? live.review_status : record.review_status
            };
          }
          return record;
        });
      }

      setRecords(payload);

      let att = 0, corr = 0, inc = 0;
      payload.forEach((record) => {
        const selected = (record.selected_key || record.selected_option)?.toString().trim();
        if (selected) {
          att++;
          record.is_correct == 1 ? corr++ : inc++;
        }
      });

      let pos = 3, neg = 1;
      try {
        const mRes = await axios.get(`${apiBaseUrl}api/Marks/get_set_details.php`, { params: { exam_set_id } });
        if (mRes.data.success) {
          pos = parseFloat(mRes.data.data.positive_marking) || 3;
          neg = parseFloat(mRes.data.data.negative_marking) || 1;
        }
      } catch (e) { }

      const sc = Math.max(0, (corr * pos) - (inc * neg));
      const acc = att > 0 ? Math.round((corr / att) * 100) : 0;
      const perc = fetchedTotalMarks > 0 ? (sc / fetchedTotalMarks) * 100 : 0;

      setAttempted(att);
      setCorrect(corr);
      setIncorrect(inc);
      setScore(sc);
      setAccuracy(acc);
      setRank(resultResponse.data.rank || 0);
      setTotalCandidates(resultResponse.data.total_candidates || 0);
      setPercentile(perc.toFixed(2));
      setAttemptNumber(parseInt(resultResponse.data.attempt_number) || targetAttemptNum);

      // Fetch Leaderboard for Stats (Highest, Average, and Actual Rank)
      try {
        const lbRes = await axios.get(`${apiBaseUrl}api/Leaderboard/get_leaderboard.php`, {
          params: { course_id, exam_set_id, set_number }
        });
        if (lbRes.data.status === "success" && lbRes.data.data.length > 0) {
          const lbData = lbRes.data.data;
          setHighestMarks(lbData[0].score);
          const totalScore = lbData.reduce((sum, entry) => sum + parseFloat(entry.score), 0);
          setAvgMarks((totalScore / lbData.length).toFixed(2));

          const userRankInLB = lbData.findIndex(entry => String(entry.user_id) === String(userId)) + 1;
          if (userRankInLB > 0) {
            setRank(userRankInLB);
            setTotalCandidates(lbData.length);
          }
        }
      } catch (e) {
        console.error("Error fetching leaderboard stats:", e);
      }

      // Fetch Course Info to get course title
      axios.get(`${apiBaseUrl}api/Courses/get_courses.php`)
        .then(res => {
          if (res.data.success) {
            const course = res.data.courses.find(c => c.id == course_id);
            if (course) setCourseInfo(course);
          }
        })
        .catch(err => console.error("Error fetching course info:", err));

      // Fetch Set Info to get set name
      axios.get(`${apiBaseUrl}api/Exams/get_exam_sets.php`, { params: { course_id } })
        .then(res => {
          if (res.data.success) {
            const set = res.data.exam_sets.find(s => s.id == exam_set_id);
            if (set) setSetInfo(set);
          }
        })
        .catch(err => console.error("Error fetching set info:", err));

    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "Failed to load exam result");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialAttempt = urlAttempt ? parseInt(urlAttempt) : null;
    setAttemptNumber(initialAttempt);
    fetchExamResults(initialAttempt);
  }, [course_id, exam_set_id, set_number]);

  useEffect(() => {
    if (urlAttempt) {
      const parsed = parseInt(urlAttempt);
      if (parsed !== lastFetchedAttempt.current) {
        lastFetchedAttempt.current = parsed;
        setAttemptNumber(parsed);
        fetchExamResults(parsed);
      }
    }
  }, [urlAttempt]);

  const handleAttemptChange = (e) => {
    const newAttempt = parseInt(e.target.value);
    lastFetchedAttempt.current = newAttempt;
    setAttemptNumber(newAttempt);
    fetchExamResults(newAttempt);

    // Update query param in URL
    const newParams = new URLSearchParams(window.location.search);
    newParams.set("attempt_number", newAttempt);
    navigate(`${window.location.pathname}?${newParams.toString()}`, { replace: true });
  };

  if (loading && !records.length) return <div className="text-center mt-20 dark:text-white">Loading results...</div>;
  if (error) return <div className="text-center mt-20 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 px-4 py-8">

      {/* Pass/Fail Top Middle */}
      <div className="flex flex-col items-center mb-8">
        <div className={`text-4xl md:text-6xl font-black mb-4 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
          {isPassed ? 'PASS' : 'FAIL'}
        </div>

        {/* Category, Attempt & Marks Grid */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center w-full max-w-4xl bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm gap-y-6 md:gap-y-0">

          <div className="flex flex-col items-center px-6 w-full md:min-w-[250px] md:w-auto">
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Attempt</span>
            {allAttempts.length > 1 ? (
              <select
                value={attemptNumber || ""}
                onChange={handleAttemptChange}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-semibold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full md:w-auto"
              >
                {allAttempts.map(a => (
                  <option key={a.attempt_number} value={parseInt(a.attempt_number)}>
                    #{a.attempt_number} ({a.date_of_submit}) - {a.new_ui == 1 ? 'NEW UI' : 'OLD UI'}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-semibold dark:text-white w-full md:w-auto text-center">
                #{attemptNumber} {allAttempts.find(a => parseInt(a.attempt_number) === attemptNumber) && `(${allAttempts.find(a => parseInt(a.attempt_number) === attemptNumber).date_of_submit}) - ${allAttempts.find(a => parseInt(a.attempt_number) === attemptNumber).new_ui == 1 ? 'NEW UI' : 'OLD UI'}`}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center px-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 w-full md:w-auto">
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Choose Category</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-semibold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full md:w-auto"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat} CUTOFF - {cutoffs[cat] || 0}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col items-center px-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 w-full md:w-auto">
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Your Marks</span>
            <span className="text-3xl font-black text-blue-600 dark:text-blue-500">
              {score.toFixed(2)}
              <span className="text-lg text-gray-400 ml-1">/ {totalMarks.toFixed(2)}</span>
            </span>
          </div>

          <div className="flex flex-col items-center px-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 w-full md:w-auto">
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Highest Marks</span>
            <span className="text-3xl font-black text-green-600 dark:text-green-500">{highestMarks}</span>
          </div>

          <div className="flex flex-col items-center px-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 w-full md:w-auto">
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Avg/Lowest</span>
            <span className="text-3xl font-black text-orange-600 dark:text-orange-500">{avgMarks}</span>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto mb-8 px-6 text-center text-gray-700 dark:text-gray-300 italic leading-relaxed md:text-lg uppercase tracking-wide">
        “Every <span className="font-bold">MOCK TEST</span> is a mirror—it reflects your <span className="font-bold">strengths</span>, exposes your <span className="font-bold">weaknesses</span>, and reveals your <span className="font-bold">true potential</span>, but only --- if you have the courage to <span className="font-bold">ANALYSE it HONESTLY</span>”. Don’t just attempt tests, take your time to --- <span className="font-bold">DECODE</span> them. Because toppers <span className="font-bold">don’t chase scores</span>—they <span className="font-bold">learn from mistakes</span>, and <span className="font-bold">improve relentlessly</span>. That’s where real growth begins.”
      </div>

      <div className="flex justify-center mb-8 flex-wrap gap-4 items-center">

        <button
          onClick={() => {
            exitFullscreen();
            navigate("/");
          }}
          className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-black-300 hover:text-white transition-all shadow-sm active:scale-95"
          title="Home"
        >
          <FaHome className="text-black dark:text-white group-hover:text-white text-2xl" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <FaCompress className="text-black dark:text-white group-hover:text-white text-2xl" />
          ) : (
            <FaExpand className="text-black dark:text-white group-hover:text-white text-2xl" />
          )}
        </button>

        <div 
          className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1.5 w-full justify-start md:justify-center"
          style={{ touchAction: "pan-x", WebkitOverflowScrolling: "touch" }}
        >
          {["overall analysis", "subject wise analysis", "topic/chapter wise analysis", "time management", "detailed solution", "compare yourself", "leaderboard"].map((t) => (
            <button
              key={t}
              className={`px-4 md:px-6 py-2 font-bold rounded-lg transition-colors text-sm md:text-base border-2 flex-shrink-0 ${tab === t
                ? "bg-black dark:bg-gray-700 text-white border-blue-500"
                : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300 border-transparent"
                }`}
              onClick={() => setTab(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 relative">
        {!checkingPurchase && !isCoursePurchased && tab !== "overall analysis" && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md bg-white/30 dark:bg-gray-900/40 min-h-[400px]">
            <Lock className="w-12 h-12 text-slate-600 dark:text-slate-400 mb-3" />
            <span className="text-xl font-black text-slate-800 dark:text-slate-200">Subscription Required</span>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md text-center px-4">
              Please purchase this course to unlock detailed subject/topic reports, time management analysis, solutions, leaderboard, and student comparison reports.
            </p>
            <button
              onClick={() => navigate(`/courses/${course_id}`)}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 text-sm uppercase tracking-wider"
            >
              Purchase Course
            </button>
          </div>
        )}
        <div style={(!checkingPurchase && !isCoursePurchased && tab !== "overall analysis") ? { filter: 'blur(8px)', pointerEvents: 'none', minHeight: '400px' } : {}}>
          {tab === "overall analysis" && (
            <AnalysisTab
              attempted={attempted}
              correct={correct}
              incorrect={incorrect}
              score={score}
              accuracy={accuracy}
              rank={rank}
              totalCandidates={totalCandidates}
              percentile={percentile}
              records={records}
              totalMarks={totalMarks}
            />
          )}

          {tab === "subject wise analysis" && (
            <SubjectWiseAnalysis records={records} marking={marking} subjectStats={activeSubjectStats} timeConfig={timeConfig} />
          )}

          {tab === "topic/chapter wise analysis" && (
            <TopicandChapterWiseAnalysis records={records} />
          )}

          {tab === "time management" && (
            <TimeManagement
              records={records}
              course_id={course_id}
              exam_set_id={exam_set_id}
              set_number={set_number}
              attemptNumber={attemptNumber}
              BASE_URL={BASE_URL}
            />
          )}

          {tab === "detailed solution" && (
            <SolutionsTab
              records={records}
              expandedQuestion={expandedQuestion}
              language={language}
              filter={filter}
              course_id={course_id}
              exam_set_id={exam_set_id}
              set_number={set_number}
              navigate={navigate}
              setExpandedQuestion={setExpandedQuestion}
              setLanguage={setLanguage}
              setFilter={setFilter}
              courseInfo={courseInfo}
              setInfo={setInfo}
              isNewUI={allAttempts.find(a => parseInt(a.attempt_number) === attemptNumber)?.new_ui == 1}
              attemptNumber={attemptNumber}
              timeConfig={timeConfig}
              isCoursePurchased={isCoursePurchased}
              isLatestAttempt={isLatestAttempt}
            />
          )}

          {tab === "compare yourself" && (
            <CompareTab
              records={records}
              score={score}
              accuracy={accuracy}
              attempted={attempted}
              correct={correct}
              incorrect={incorrect}
              selectedMetric={selectedMetric}
              setSelectedMetric={setSelectedMetric}
              avgMarks={avgMarks}
              marking={marking}
            />
          )}

          {tab === "leaderboard" && (
            <LeaderboardTab
              course_id={course_id}
              exam_set_id={exam_set_id}
              set_number={set_number}
              current_user_id={userId}
              isCoursePurchased={isCoursePurchased}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamResultPage;