import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  Layers, 
  BookOpen, 
  HelpCircle,
  AlertCircle
} from "lucide-react";

// Helper to format time (seconds to MM:SS)
const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return "--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const TimeManagement = ({ records, course_id, exam_set_id, set_number, attemptNumber, BASE_URL }) => {
  useEffect(() => {
    try {
      if (typeof ScrollSmoother !== 'undefined' && ScrollSmoother) {
        const smoother = ScrollSmoother.get();
        if (smoother) smoother.kill();
      }
    } catch (e) {
      console.warn("Smooth scroll exclusion error:", e);
    }
  }, []);

  const [activeTab, setActiveTab] = useState("overall");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const storedUserId = localStorage.getItem("user_id");
        if (!storedUserId) throw new Error("User ID not found. Please log in.");
        const student_id = JSON.parse(storedUserId);

        const apiBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
        const response = await axios.get(`${apiBaseUrl}api/TimeManagement/get_time_analytics.php`, {
          params: {
            exam_set_id,
            student_id,
            course_id,
            set_number,
            attempt_number: attemptNumber
          }
        });

        if (response.data.status === "success") {
          const data = response.data.data;
          
          // Fetch detailed subject/section timings for accurate totals
          try {
            const [durationRes, subjectsRes] = await Promise.all([
              axios.get(`${apiBaseUrl}api/Instructions/get_instructions_two.php`, { params: { exam_set_id } }),
              axios.get(`${apiBaseUrl}api/Exams/get_subjects_for_set.php`, { params: { exam_set_id } })
            ]);

            let calculatedTotalSeconds = 0;
            const timingMode = data.timing_mode || 'overall';
            const subjects = subjectsRes.data.success ? subjectsRes.data.subjects : [];

            if (timingMode === 'subjective' && subjects.length > 0) {
              // Sum of all subject-wise allocated times
              calculatedTotalSeconds = subjects.reduce((acc, s) => acc + (parseInt(s.time_minutes) || 0), 0) * 60;
            } else if (timingMode === 'sectional' && subjects.length > 0) {
              // Sum of unique sectional times
              const sectionTimes = {};
              subjects.forEach(s => {
                if (s.section_number && s.sectional_time_minutes) {
                  sectionTimes[s.section_number] = parseInt(s.sectional_time_minutes);
                }
              });
              calculatedTotalSeconds = Object.values(sectionTimes).reduce((acc, t) => acc + t, 0) * 60;
            }

            // Fallback to overall test duration if calculation resulted in 0 or mode is overall
            if (calculatedTotalSeconds <= 0 && durationRes.data.success && durationRes.data.data) {
              calculatedTotalSeconds = parseInt(durationRes.data.data.test_duration) * 60;
            }

            data.total_test_time = calculatedTotalSeconds;
            
            // Also store allocated subject/section times for UI reference
            data.allocated_subjects = subjects;
          } catch (dErr) {
            console.error("Timing fetch error:", dErr);
          }

          setAnalytics(data);
          
          // Set initial tab to the detected timing mode if questions aren't more relevant
          if (data.timing_mode) {
            setActiveTab(data.timing_mode);
          }
        } else {
          throw new Error(response.data.message || "Failed to fetch analytics");
        }
      } catch (err) {
        console.error("Time Management API Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [exam_set_id, course_id, set_number, attemptNumber]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Calculating Time Comparisons...</p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Failed to load analytics</h3>
        <p className="text-red-600/70 dark:text-red-400/70 max-w-md">{error}</p>
      </div>
    );
  }

  const ComparisonBar = ({ label, userTime, topperTime, subLabel }) => {
    const max = Math.max(userTime, topperTime, 1);
    const userWidth = (userTime / max) * 100;
    const topperWidth = (topperTime / max) * 100;
    const isAtPar = userTime > 0 && userTime <= topperTime;
    const isFaster = false; 
    const diff = Math.abs(userTime - topperTime);

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-lg">{label}</h4>
            {subLabel && <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-semibold">{subLabel}</p>}
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter flex items-center gap-1.5 ${isAtPar ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : isFaster ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
            {isAtPar ? <Target size={14} /> : isFaster ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isAtPar ? "At Par with Topper" : `${formatTime(diff)} ${isFaster ? "FASTER" : "SLOWER"}`}
          </div>
        </div>

        <div className="space-y-6">
          {/* User Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              <span>Your Time</span>
              <span className="text-gray-900 dark:text-white">{formatTime(userTime)}</span>
            </div>
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${userWidth}%` }}
                className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              />
            </div>
          </div>

          {/* Topper Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              <span>Topper's Time</span>
              <span className="text-gray-900 dark:text-white">{formatTime(topperTime)}</span>
            </div>
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${topperWidth}%` }}
                className="h-full bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!analytics) return null;

  const tabs = [
    { id: "overall", label: "Overall", icon: Target },
    { id: "sectional", label: "Sectional", icon: Layers },
    { id: "subjective", label: "Subjective", icon: BookOpen },
    { id: "question", label: "Questions", icon: HelpCircle }
  ].filter(t => t.id === "question" || (analytics && t.id === analytics.timing_mode));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      
      {/* Header Quote */}
      <div className="mb-12 text-center max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-600 dark:text-gray-400 italic font-medium leading-relaxed text-lg sm:text-xl"
        >
          "In the exam hall, <span className="font-bold text-blue-600 dark:text-blue-400">knowledge</span> gives you the edge—but <span className="font-bold text-blue-600 dark:text-blue-400">time management</span> determines how efficiently you use it to attempt the paper faster and more accurately than others, defining your <span className="font-bold text-blue-600 dark:text-blue-400">rank (AIR)</span> in that exam."
        </motion.div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest opacity-80">Your Time</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tabular-nums">{formatTime(analytics.overall.user)}</span>
            <span className="text-sm font-medium opacity-60 italic font-bold">Total taken</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Zap className="w-24 h-24 text-amber-500" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Topper's Time</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900 dark:text-white tabular-nums">{formatTime(analytics.overall.topper)}</span>
            <span className="text-sm font-medium text-gray-400 italic">Total Avg</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
           <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Test Time</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900 dark:text-white tabular-nums">
                {formatTime(analytics.total_test_time)}
              </span>
              <span className="text-sm font-medium text-gray-400 italic font-bold uppercase tracking-tighter">Allocated</span>
            </div>
            
            {/* Dynamic Context Info - Detailed Breakdowns */}
            <div className="mt-3 space-y-2">
              {analytics.timing_mode === "subjective" && analytics.allocated_subjects && (
                <div className="flex flex-wrap gap-1.5">
                  {analytics.allocated_subjects.map((s, i) => (
                    <div key={i} className="flex items-center gap-1 bg-blue-50/50 dark:bg-blue-900/20 px-2 py-1 rounded-lg border border-blue-100/50 dark:border-blue-800/30">
                      <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase">{s.subject_name.substring(0, 10)}</span>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{s.time_minutes}m</span>
                    </div>
                  ))}
                </div>
              )}
              
              {analytics.timing_mode === "sectional" && analytics.allocated_subjects && (
                <div className="flex flex-wrap gap-1.5">
                   {/* Overall Time Label if sectional */}
                   <div className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sectional Limits:</div>
                   {Array.from(new Set(analytics.allocated_subjects.map(s => s.section_number))).filter(Boolean).sort().map((secNum, i) => {
                      const time = analytics.allocated_subjects.find(s => s.section_number === secNum)?.sectional_time_minutes;
                      return (
                        <div key={i} className="flex items-center gap-1 bg-indigo-50/50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg border border-indigo-100/50 dark:border-indigo-800/30">
                          <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase">SEC {secNum}</span>
                          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{time}m</span>
                        </div>
                      );
                   })}
                </div>
              )}
              
              {!analytics.timing_mode || analytics.timing_mode === 'overall' && (
                <div className="text-[10px] font-bold text-gray-400 uppercase italic">
                  Overall timing mode enabled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Level Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-gray-100 dark:bg-gray-900 rounded-2xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
              activeTab === t.id 
              ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-lg shadow-gray-200/50 dark:shadow-none translate-y-[-1px]" 
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <t.icon size={18} />
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overall" && (
              <div className="max-w-2xl">
                <ComparisonBar label="Overall Exam Completion" userTime={analytics.overall.user} topperTime={analytics.overall.topper} />
                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                  <h5 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2 italic">
                    <Target size={18} /> Time Strategy Hint
                  </h5>
                  <p className="text-sm text-blue-800/70 dark:text-blue-400/70 leading-relaxed">
                    Overall completion speed is vital, but ensure consistency across all sections. 
                    A large gap at the overall level usually indicates getting stuck on specific difficult questions.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "sectional" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.sections.length > 0 ? (
                  analytics.sections.map((sec, idx) => (
                    <ComparisonBar key={idx} label={sec.name} userTime={sec.user} topperTime={sec.topper} subLabel="Comparative Section Speed" />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center text-gray-500 italic">No sectional data available for this exam.</div>
                )}
              </div>
            )}

            {activeTab === "subjective" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.subjects.map((sub, idx) => (
                  <ComparisonBar key={idx} label={sub.name} userTime={sub.user} topperTime={sub.topper} subLabel={`Section ${sub.section}`} />
                ))}
              </div>
            )}

            {activeTab === "question" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
                  <Clock size={16} />
                   Showing individual question timing versus the overall topper.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analytics.questions).map(([id, stats], idx) => (
                    <div key={id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-500 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Q. {idx + 1}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${(stats.user > 0 && stats.user <= stats.topper) ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {(stats.user > 0 && stats.user <= stats.topper) ? 'AT PAR' : 'LAGGING'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">You:</span>
                        <span className="font-bold dark:text-white tabular-nums">{formatTime(stats.user)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Topper:</span>
                        <span className="font-bold text-amber-500 tabular-nums">{formatTime(stats.topper)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TimeManagement;
