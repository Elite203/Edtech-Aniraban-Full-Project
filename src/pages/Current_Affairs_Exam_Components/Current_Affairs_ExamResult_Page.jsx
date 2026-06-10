import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaExpand, FaCompress } from "react-icons/fa";
import party from "party-js";
import { useTheme } from "../../contexts/ThemeContext";

import OverallAnalysisTab from "./result_tabs/OverallAnalysisTab";
import SolutionsTab from "./result_tabs/SolutionsTab";
import CompareTab from "./result_tabs/CompareTab";
import LeaderboardTab from "./result_tabs/LeaderboardTab";
import TimeManagementTab from "./result_tabs/TimeManagementTab";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Current_Affairs_ExamResult_Page = () => {
  const { quiz_id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [allAttempts, setAllAttempts] = useState([]);
  const [attemptNumber, setAttemptNumber] = useState(location.state?.attemptNumber || null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overall analysis");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highestMarks, setHighestMarks] = useState(0);
  const [avgMarks, setAvgMarks] = useState(0);
  const [totalCandidates, setTotalCandidates] = useState(0);
  
  // Tab state for Solutions
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [language, setLanguage] = useState("english");
  const [filter, setFilter] = useState("ALL");
  const [selectedMetric, setSelectedMetric] = useState("Score");
  const [category, setCategory] = useState("UR");

  const categories = [
    { id: "UR", name: "General (UR)", key: "Passing_General" },
    { id: "OBC", name: "OBC", key: "Passing_OBC" },
    { id: "SC", name: "SC", key: "Passing_SC" },
    { id: "ST", name: "ST", key: "Passing_ST" },
    { id: "EWS", name: "EWS", key: "Passing_EWS" },
    { id: "PWD", name: "PWD", key: "Passing_PWD" },
  ];

  const getStatus = () => {
    if (!summary || !quiz) return null;
    const currentCategory = categories.find(c => c.id === category);
    const passMarks = Number(quiz[currentCategory.key]) || 0;
    return summary.score >= passMarks ? "Pass" : "Fail";
  };

  const storedUserId = localStorage.getItem("user_id");
  const userId = storedUserId ? JSON.parse(storedUserId) : null;

  useEffect(() => {
    if (!userId) navigate("/login");
    fetchResultData();

    // Block back button
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = (e) => {
      window.history.pushState(null, null, window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [quiz_id, attemptNumber]);

  const fetchResultData = async () => {
    setLoading(true);
    try {
      const apiBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
      
      // 1. Fetch Result Data
      const res = await axios.get(`${apiBaseUrl}api/CurrentAffairs/get_exam_result_data.php`, {
        params: { user_id: userId, quiz_id, attempt_number: attemptNumber }
      });

      if (res.data.status === "success") {
        setRecords(res.data.data);
        setSummary(res.data.summary);
        setQuiz(res.data.quiz);
        if (!attemptNumber) setAttemptNumber(res.data.summary.attemptNumber);
      } else {
        throw new Error(res.data.message);
      }

      // 2. Fetch All Attempts
      const attRes = await axios.get(`${apiBaseUrl}api/CurrentAffairs/get_user_attempts.php`, {
        params: { student_id: userId, quiz_id }
      });
      if (attRes.data.success) {
        setAllAttempts(attRes.data.data);
      }

      // 3. Fetch Stats (High/Avg)
      const statsRes = await axios.get(`${apiBaseUrl}api/CurrentAffairs/get_quiz_stats.php`, {
        params: { quiz_id }
      });
      if (statsRes.data.status === "success") {
        setHighestMarks(statsRes.data.highest_marks);
        setAvgMarks(statsRes.data.avg_marks);
        setTotalCandidates(statsRes.data.total_candidates);
      }

    } catch (err) {
      setError(err.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && summary && summary.score >= (quiz?.MaxMarks || 0) * 0.8) {
      party.confetti(document.body, { count: 300 });
    }
  }, [loading]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading && !records.length) {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-black uppercase tracking-widest animate-pulse">Generating Report...</p>
        </div>
    );
  }

  if (error) return <div className="text-center mt-20 text-red-600 font-bold">{error}</div>;

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#f8f9fa] text-gray-900'}`}>
      
      {/* Header Banner */}
      <div className="bg-[#cc0000] text-white pt-10 pb-20 px-6 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">Exam Results</h1>
            <p className="text-red-100 font-bold opacity-80 uppercase tracking-widest text-sm">
                {quiz?.Month} {quiz?.Year} Current Affairs Mock Test
            </p>
        </div>
      </div>
      {/* Quick Stats Card */}
      <div className="max-w-6xl mx-auto -mt-12 px-4 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="text-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Attempt</span>
                <select 
                    value={attemptNumber}
                    onChange={(e) => setAttemptNumber(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-700 border-none rounded-xl px-4 py-2 text-sm font-black outline-none focus:ring-2 focus:ring-red-500"
                >
                    {allAttempts.map(a => (
                        <option key={a.AttemptNumber} value={a.AttemptNumber}>
                            #{a.AttemptNumber} ({a.SubmitDate})
                        </option>
                    ))}
                </select>
            </div>

            <div className="text-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Category</span>
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-700 border-none rounded-xl px-4 py-2 text-sm font-black outline-none focus:ring-2 focus:ring-red-500"
                >
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name} ({Number(quiz?.[c.key] || 0).toFixed(2)})
                        </option>
                    ))}
                </select>
            </div>

            <div className="text-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Status</span>
                <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                    getStatus() === "Pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                    {getStatus()}
                </span>
            </div>

            <div className="text-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Your Score</span>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-red-600">{Math.max(0, summary?.score)}</span>
                    <span className="text-gray-400 font-bold">/ {summary?.max_marks}</span>
                </div>
            </div>

            <div className="text-center hidden md:block">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Topper Score</span>
                <span className="text-4xl font-black text-orange-500">{highestMarks}</span>
            </div>

            <div className="text-center hidden lg:block">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Avg Score</span>
                <span className="text-4xl font-black text-blue-500">{avgMarks}</span>
            </div>
        </div>
      </div>

      {/* Action Buttons Row (Centered) */}
      <div className="max-w-6xl mx-auto mt-10 px-4 flex justify-center gap-4 relative z-30">
          <button 
              onClick={toggleFullscreen}
              className="px-6 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 border dark:border-gray-700 hover:scale-110 active:scale-95 transition-all"
          >
              {isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
              {isFullscreen ? "Exit Full" : "Full Screen"}
          </button>
          <button 
              onClick={() => {
                  if (document.fullscreenElement) {
                      document.exitFullscreen().catch(() => {});
                  }
                  navigate('/');
              }}
              className="px-6 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 border dark:border-gray-700 hover:scale-110 active:scale-95 transition-all"
          >
              <FaHome size={12} />
              Home
          </button>
      </div>

      {/* Tabs Navigation */}
      <div id="tabs-tour" className="max-w-7xl mx-auto mt-12 px-4 overflow-hidden">
        <div className="flex flex-wrap justify-center gap-3 p-2">
            {[
                { id: "overall analysis", label: "Overview" },
                { id: "detailed solution", label: "Solutions" },
                { id: "time management", label: "Time" },
                { id: "compare yourself", label: "Compare" },
                { id: "leaderboard", label: "Ranking" }
            ].map(t => (
                <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
                        tab === t.id 
                        ? 'bg-gray-900 dark:bg-red-600 text-white shadow-xl shadow-gray-400/20 scale-105' 
                        : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    {t.label}
                </button>
            ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto mt-10 px-4 min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "overall analysis" && (
              <OverallAnalysisTab
                attempted={summary.attempted}
                correct={summary.correct}
                incorrect={summary.incorrect}
                score={Math.max(0, summary.score)}
                accuracy={summary.attempted > 0 ? Math.round((summary.correct / summary.attempted) * 100) : 0}
                rank={summary.rank}
                totalCandidates={totalCandidates}
                percentile={summary.score >= summary.max_marks ? 100 : (totalCandidates > 1 ? (((totalCandidates - 1) / totalCandidates) * 100).toFixed(0) : 100)}
                records={records}
                totalMarks={summary.max_marks}
              />
            )}

            {tab === "detailed solution" && (
              <SolutionsTab
                records={records}
                expandedQuestion={expandedQuestion}
                language={language}
                filter={filter}
                quiz_id={quiz_id}
                attemptNumber={attemptNumber}
                navigate={navigate}
                setExpandedQuestion={setExpandedQuestion}
                setLanguage={setLanguage}
                setFilter={setFilter}
                quiz={quiz}
                onTourStart={() => document.body.style.overflow = "hidden"}
                onTourEnd={() => document.body.style.overflow = "auto"}
              />
            )}

            {tab === "time management" && (
              <TimeManagementTab
                quiz_id={quiz_id}
                attemptNumber={attemptNumber}
                BASE_URL={BASE_URL}
                quiz={quiz}
              />
            )}

            {tab === "compare yourself" && (
              <CompareTab
                records={records}
                score={Math.max(0, summary.score)}
                accuracy={summary.attempted > 0 ? Math.round((summary.correct / summary.attempted) * 100) : 0}
                attempted={summary.attempted}
                correct={summary.correct}
                incorrect={summary.incorrect}
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
                avgMarks={avgMarks}
                marking={{ positive: quiz.PositiveMarking, negative: quiz.NegativeMarking }}
                quiz_id={quiz_id}
                BASE_URL={BASE_URL}
              />
            )}

            {tab === "leaderboard" && (
              <LeaderboardTab
                quiz_id={quiz_id}
                current_user_id={userId}
                BASE_URL={BASE_URL}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Removed Floating Action Buttons */}
    </div>
  );
};

export default Current_Affairs_ExamResult_Page;
