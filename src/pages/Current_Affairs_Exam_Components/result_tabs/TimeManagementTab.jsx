import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  AlertCircle
} from "lucide-react";

const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return "--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const TimeManagementTab = ({ quiz_id, attemptNumber, BASE_URL, quiz }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const storedUserId = localStorage.getItem("user_id");
        const student_id = storedUserId ? JSON.parse(storedUserId) : null;
        if (!student_id) throw new Error("Please log in.");

        const apiBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
        const response = await axios.get(`${apiBaseUrl}api/CurrentAffairs/get_time_analytics.php`, {
          params: {
            quiz_id,
            student_id,
            attempt_number: attemptNumber
          }
        });

        if (response.data.status === "success") {
          setAnalytics(response.data.data);
        } else {
          throw new Error(response.data.message || "Failed to fetch analytics");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (quiz_id) fetchAnalytics();
  }, [quiz_id, attemptNumber]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
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

  if (!analytics) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-3xl text-white shadow-xl shadow-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-widest opacity-80">Your Total Time</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tabular-nums">{formatTime(analytics.overall.user)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4 text-orange-600">
            <Zap className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-widest">Topper's Time</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900 dark:text-white tabular-nums">{formatTime(analytics.overall.topper)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
           <div className="flex items-center gap-3 mb-4 text-blue-600">
            <Clock className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-widest">Total Test Time</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tabular-nums text-blue-600">
                    {quiz?.OverallTime || 0}
                </span>
                <span className="text-sm font-bold text-gray-400 uppercase">Minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question Timing Grid */}
      <div className="space-y-6">
        <h4 className="text-lg font-black dark:text-white uppercase tracking-wider text-center">Question-wise Timing Comparison</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(analytics.questions).map(([id, stats], idx) => (
            <div key={id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-red-500 transition-all shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Q. {idx + 1}</span>
                <div className={`w-2 h-2 rounded-full ${(stats.user > 0 && stats.user <= stats.topper) ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">YOU</span>
                    <span className="text-xs font-black dark:text-white tabular-nums">{stats.user}s</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">TOP</span>
                    <span className="text-xs font-black text-orange-500 tabular-nums">{stats.topper}s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeManagementTab;
