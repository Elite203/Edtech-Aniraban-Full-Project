import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const CompareTab = ({
  records,
  score,
  accuracy,
  attempted,
  correct,
  incorrect,
  selectedMetric,
  setSelectedMetric,
  avgMarks,
  marking,
  quiz_id,
  BASE_URL
}) => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!quiz_id) return;
      setLoading(true);
      try {
        const apiBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
        const response = await axios.get(`${apiBaseUrl}api/CurrentAffairs/get_compare_analytics.php`, {
          params: { quiz_id }
        });
        if (response.data.status === "success") {
          setAnalyticsData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [quiz_id, BASE_URL]);

  // Derived State: Stats for TOPPER and AVERAGE
  const stats = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) return { topper: null, average: null };
    
    const pos = marking?.positive || 2;
    const neg = marking?.negative || 0;

    const students = analyticsData.map(row => {
      const rowCorrect = Number(row.correct_count) || 0;
      const rowIncorrect = Number(row.incorrect_count) || 0;
      const rowAttempted = Number(row.attempted_count) || 0;
      const rowTime = Number(row.total_time_spent) || 0;
      const score = (rowCorrect * pos) - (rowIncorrect * neg);
      const acc = rowAttempted > 0 ? (rowCorrect / rowAttempted) * 100 : 0;

      return {
        user_id: row.user_id,
        score,
        correct: rowCorrect,
        incorrect: rowIncorrect,
        attempted: rowAttempted,
        time: rowTime,
        accuracy: acc
      };
    });

    students.sort((a, b) => b.score - a.score || a.time - b.time);
    const topper = students[0];

    const average = {
      score: students.reduce((sum, s) => sum + s.score, 0) / students.length,
      correct: students.reduce((sum, s) => sum + s.correct, 0) / students.length,
      incorrect: students.reduce((sum, s) => sum + s.incorrect, 0) / students.length,
      attempted: students.reduce((sum, s) => sum + s.attempted, 0) / students.length,
      time: students.reduce((sum, s) => sum + s.time, 0) / students.length,
      accuracy: students.reduce((sum, s) => sum + s.accuracy, 0) / students.length
    };

    return { topper, average };
  }, [analyticsData, marking]);

  const comparisonData = useMemo(() => {
    const top = stats.topper || { score: 0, accuracy: 0, attempted: 0, correct: 0, incorrect: 0, time: 0 };
    const avg = stats.average || { score: 0, accuracy: 0, attempted: 0, correct: 0, incorrect: 0, time: 0 };

    return {
      Score: { 
        you: Math.max(0, score), 
        topper: Math.max(0, top.score), 
        average: Math.max(0, avg.score) 
      },
      Accuracy: { you: accuracy, topper: top.accuracy, average: avg.accuracy },
      Attempt: { you: attempted, topper: top.attempted, average: avg.attempted },
      Correct: { you: correct, topper: top.correct, average: avg.correct },
      Incorrect: { you: incorrect, topper: top.incorrect, average: avg.incorrect },
      Time: { 
        you: records.reduce((sum, r) => sum + (r.time_spent || 0), 0),
        topper: top.time,
        average: avg.time
      }
    };
  }, [stats, score, accuracy, attempted, correct, incorrect, records]);

  const currentData = comparisonData[selectedMetric] || { you: 0, topper: 0, average: 0 };

  const metricColors = {
    Score: "bg-red-500",
    Accuracy: "bg-green-500",
    Attempt: "bg-blue-500",
    Correct: "bg-emerald-500",
    Incorrect: "bg-orange-500",
    Time: "bg-purple-500"
  };

  if (loading) return <div className="text-center py-20 font-bold animate-pulse">Comparing with Class...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
        <h2 className="text-center text-2xl font-black mb-10 dark:text-white uppercase tracking-wider">
          Performance Comparison
        </h2>

        {/* Metric Selection */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["Score", "Accuracy", "Attempt", "Correct", "Incorrect", "Time"].map((metric) => (
            <button
              key={metric}
              className={`px-6 py-2 rounded-xl text-xs font-black tracking-widest transition-all ${
                selectedMetric === metric
                  ? `${metricColors[metric]} text-white shadow-lg scale-110`
                  : "bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 hover:border-red-500"
              }`}
              onClick={() => setSelectedMetric(metric)}
            >
              {metric.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 mb-12">
            <div className="flex items-end h-64 gap-8 md:gap-16 justify-center">
                {["you", "topper", "average"].map((type) => {
                    const val = currentData[type];
                    let maxVal = Math.max(currentData.topper, currentData.you, 1);
                    if (selectedMetric === "Accuracy") maxVal = 100;
                    
                    const height = (val / maxVal) * 100;
                    const color = metricColors[selectedMetric];

                    return (
                        <div key={type} className="flex flex-col items-center gap-4 w-16 md:w-24 h-full">
                            <div className="flex-1 w-full flex flex-col justify-end">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(height, 5)}%` }}
                                    className={`w-full rounded-t-2xl ${color} shadow-lg shadow-gray-200 dark:shadow-none`}
                                />
                            </div>
                            <div className="text-center">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{type}</span>
                                <p className="text-sm md:text-base font-black dark:text-white">{Math.round(val * 100) / 100}{selectedMetric === "Accuracy" ? "%" : ""}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default CompareTab;
