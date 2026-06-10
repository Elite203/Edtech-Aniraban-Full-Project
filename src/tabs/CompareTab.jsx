import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

import { ScrollSmoother } from "gsap/ScrollSmoother";

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
  marking
}) => {
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

  console.log("CompareTab Data:", { records, score, accuracy, attempted, correct, incorrect, avgMarks, marking });
  const params = useParams();
  const exam_set_id = params.exam_set_id;
  
  const [activeSubject, setActiveSubject] = useState("Overall");
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!exam_set_id) return;
      setLoading(true);
      try {
        const apiBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
        const response = await axios.get(`${apiBaseUrl}api/Leaderboard/get_compare_analytics.php`, {
          params: { exam_set_id }
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
  }, [exam_set_id]);

  // Derived State: Subject Mapping for YOU
  const { subjectData, subjectsVisible, displayNameMap } = useMemo(() => {
    const subjects = {};
    const nameMap = {};
    const pos = marking?.positive || 3;
    const neg = marking?.negative || 1;

    records.forEach((record) => {
      // Robust subject name extraction (handling both UI schemas)
      const originalSubject = record.subject || record.subject_name || "General";
      const key = originalSubject.toString().trim().toLowerCase();
      nameMap[key] = originalSubject;
      
      if (!subjects[key]) {
        subjects[key] = { score: 0, accuracy: 0, attempted: 0, correct: 0, incorrect: 0, time: 0 };
      }
      const selected = record.selected_key || record.selected_option;
      if (selected && String(selected).trim()) {
        subjects[key].attempted++;
        if (Number(record.is_correct) === 1) {
          subjects[key].correct++;
          subjects[key].score += pos;
        } else {
          subjects[key].incorrect++;
          subjects[key].score -= neg;
        }
        subjects[key].time += Number(record.time_spent || 0);
      }
    });

    Object.keys(subjects).forEach(key => {
      subjects[key].accuracy = subjects[key].attempted > 0 
        ? Math.round((subjects[key].correct / subjects[key].attempted) * 100)
        : 0;
    });

    return { 
      subjectData: subjects, 
      subjectsVisible: Object.keys(subjects), 
      displayNameMap: nameMap 
    };
  }, [records, marking]);

  // Derived State: Stats for TOPPER and AVERAGE
  const stats = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) return { topper: null, averages: {} };
    
    const studentTotals = {};
    const subjectSums = {};
    const pos = marking?.positive || 3;
    const neg = marking?.negative || 1;

    analyticsData.forEach(row => {
      const uid = row.user_id;
      const subKey = (row.subject_name || "General").trim().toLowerCase();
      
      const rowCorrect = Number(row.correct_count) || 0;
      const rowIncorrect = Number(row.incorrect_count) || 0;
      const rowAttempted = Number(row.attempted_count) || 0;
      const rowTime = Number(row.total_time_spent) || 0;
      const recalculatedScore = (rowCorrect * pos) - (rowIncorrect * neg);

      // Student Overall
      if (!studentTotals[uid]) {
        studentTotals[uid] = { 
          user_id: uid, score: 0, correct: 0, incorrect: 0, attempted: 0, time: 0,
          subjects: {} 
        };
      }
      studentTotals[uid].score += recalculatedScore;
      studentTotals[uid].correct += rowCorrect;
      studentTotals[uid].incorrect += rowIncorrect;
      studentTotals[uid].attempted += rowAttempted;
      studentTotals[uid].time += rowTime;
      
      // Student per Subject
      if (!studentTotals[uid].subjects[subKey]) {
        studentTotals[uid].subjects[subKey] = { score: 0, correct: 0, incorrect: 0, attempted: 0, time: 0 };
      }
      const sSub = studentTotals[uid].subjects[subKey];
      sSub.score += recalculatedScore;
      sSub.correct += rowCorrect;
      sSub.incorrect += rowIncorrect;
      sSub.attempted += rowAttempted;
      sSub.time += rowTime;

      // Subject Averages
      if (!subjectSums[subKey]) {
        subjectSums[subKey] = { score: 0, correct: 0, incorrect: 0, attempted: 0, time: 0, count: 0 };
      }
      subjectSums[subKey].score += recalculatedScore;
      subjectSums[subKey].correct += rowCorrect;
      subjectSums[subKey].incorrect += rowIncorrect;
      subjectSums[subKey].attempted += rowAttempted;
      subjectSums[subKey].time += rowTime;
      subjectSums[subKey].count++;
    });

    const students = Object.values(studentTotals);
    students.sort((a, b) => b.score - a.score || a.time - b.time);
    const topper = students[0];

    const averages = {
      Overall: {
        score: students.reduce((sum, s) => sum + s.score, 0) / (students.length || 1),
        correct: students.reduce((sum, s) => sum + s.correct, 0) / (students.length || 1),
        incorrect: students.reduce((sum, s) => sum + s.incorrect, 0) / (students.length || 1),
        attempted: students.reduce((sum, s) => sum + s.attempted, 0) / (students.length || 1),
        time: students.reduce((sum, s) => sum + s.time, 0) / (students.length || 1)
      }
    };

    Object.keys(subjectSums).forEach(key => {
      const s = subjectSums[key];
      averages[key] = {
        score: s.score / (s.count || 1),
        correct: s.correct / (s.count || 1),
        incorrect: s.incorrect / (s.count || 1),
        attempted: s.attempted / (s.count || 1),
        time: s.time / (s.count || 1)
      };
    });

    return { topper, averages };
  }, [analyticsData, marking]);

  // Active Context Data
  const currentSubjectData = activeSubject === "Overall" 
    ? {
        score: score || 0,
        accuracy: accuracy || 0,
        attempted: attempted || 0,
        correct: correct || 0,
        incorrect: incorrect || 0,
        time: records.reduce((sum, r) => sum + (r.time_spent || 0), 0)
      }
    : (subjectData[activeSubject] || { score: 0, accuracy: 0, attempted: 0, correct: 0, incorrect: 0, time: 0 });

  const comparisonData = useMemo(() => {
    const sub = activeSubject;
    const subKey = sub.toLowerCase();
    const isSingleSubject = subjectsVisible.length === 1;

    // Average: Fallback to General Overall if sub not found or if single subject exam
    const avg = (sub === "Overall" || isSingleSubject)
      ? (stats.averages["Overall"] || { score: 0, correct: 0, incorrect: 0, attempted: 0, time: 0 })
      : (stats.averages[subKey] || { score: 0, correct: 0, incorrect: 0, attempted: 0, time: 0 });
    
    // Topper: Fallback to Global Topper if sub not found or if single subject exam
    let top = { score: 0, correct: 0, incorrect: 0, attempted: 0, time: 0 };
    if (stats.topper) {
      if (sub === "Overall" || isSingleSubject) {
        top = stats.topper;
      } else {
        top = stats.topper.subjects[subKey] || top;
      }
    }

    const calculateAccuracy = (corr, att) => (att > 0 ? Math.round((Number(corr) / Number(att)) * 100) : 0);

    return {
      Score: {
        you: Number(currentSubjectData.score || 0),
        topper: Number(top.score || 0),
        average: sub === "Overall" ? (parseFloat(avgMarks) || Number(avg.score || 0)) : Number(avg.score || 0)
      },
      Accuracy: {
        you: Number(currentSubjectData.accuracy || 0),
        topper: calculateAccuracy(top.correct, top.attempted),
        average: calculateAccuracy(avg.correct, avg.attempted)
      },
      Attempt: {
        you: Number(currentSubjectData.attempted || 0),
        topper: Number(top.attempted || 0),
        average: Number(avg.attempted || 0)
      },
      Correct: {
        you: Number(currentSubjectData.correct || 0),
        topper: Number(top.correct || 0),
        average: Number(avg.correct || 0)
      },
      Incorrect: {
        you: Number(currentSubjectData.incorrect || 0),
        topper: Number(top.incorrect || 0),
        average: Number(avg.incorrect || 0)
      },
      Time: {
        you: Number(currentSubjectData.time || 0),
        topper: Number(top.time || 0),
        average: Number(avg.time || 0)
      }
    };
  }, [activeSubject, stats, currentSubjectData, avgMarks, subjectsVisible]);

  const currentData = comparisonData[selectedMetric] || { you: 0, topper: 0, average: 0 };

  const metricColors = {
    Score: "bg-indigo-500 text-white",
    Accuracy: "bg-emerald-500 text-white",
    Attempt: "bg-blue-500 text-white",
    Correct: "bg-green-500 text-white",
    Incorrect: "bg-red-500 text-white",
    Time: "bg-amber-500 text-white"
  };

  const displayData = {
    you: Number(Number(currentData.you || 0).toFixed(2)),
    topper: Number(Number(currentData.topper || 0).toFixed(2)),
    average: Number(Number(currentData.average || 0).toFixed(2))
  };

  if (loading && !stats.topper) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Analyzing Performance...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-2 md:px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Performance Comparison
        </h2>
        
        {/* Subject Selection Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeSubject === "Overall"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
            }`}
            onClick={() => setActiveSubject("Overall")}
          >
            Overall
          </button>
          {subjectsVisible.map((subject) => (
            <button
              key={subject}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeSubject === subject
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              }`}
              onClick={() => setActiveSubject(subject)}
            >
              {subjectData[subject]?.displayName || subject}
            </button>
          ))}
        </div>

        {/* Metric Selection Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["Score", "Accuracy", "Attempt", "Correct", "Incorrect", "Time"].map((metric) => (
            <button
              key={metric}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedMetric === metric
                  ? metricColors[metric]
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              }`}
              onClick={() => setSelectedMetric(metric)}
            >
              {metric}
            </button>
          ))}
        </div>

        {/* Comparison Chart - Reverted to simpler original style */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-end h-48 md:h-64">
            <div className="flex flex-col justify-between h-full text-xs md:text-sm text-gray-500 dark:text-gray-400 w-6 md:w-8 mr-2 md:mr-4">
              <span>MAX</span>
              <span>50%</span>
              <span>MIN</span>
            </div>

            <div className="flex-1 flex justify-between h-full px-4">
              {["you", "topper", "average"].map((type) => {
                const value = displayData[type];
                // Local scaling logic
                let maxVal = 100;
                if (selectedMetric === "Score") maxVal = Math.max(displayData.topper, displayData.you, 50);
                else if (selectedMetric === "Attempt") maxVal = Math.max(displayData.topper, displayData.you, 10);
                else if (selectedMetric === "Time") maxVal = Math.max(displayData.topper, displayData.you, 60);

                const heightPercentage = Math.min((value / maxVal) * 90, 100);
                const barColor = metricColors[selectedMetric].replace("text-white", "");

                return (
                  <div key={type} className="flex flex-col items-center flex-col-reverse w-10 md:w-16">
                    <div
                      className={`w-full rounded-t-lg ${barColor} transition-all duration-500`}
                      style={{ height: `${heightPercentage}%`, minHeight: '5%' }}
                    ></div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                        {type === "you" ? "You" : type === "topper" ? "Topper" : "Avg"}
                      </p>
                      <p className="text-xs md:text-sm font-bold dark:text-white">
                        {value}{selectedMetric === "Accuracy" ? "%" : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {["you", "topper", "average"].map((type) => {
            const value = displayData[type];
            return (
              <div 
                key={type} 
                className={`p-5 rounded-xl border transition-all ${
                  type === "you" 
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 ring-2 ring-blue-500/10" 
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  {type === "you" ? "YOUR PERFORMANCE" : type === "topper" ? "TOPPER'S SCORE" : "CLASS AVERAGE"}
                  {activeSubject !== "Overall" && ` (${activeSubject})`}
                </h3>
                <p className={`text-2xl font-black ${type === "you" ? "text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-gray-200"}`}>
                  {value}{selectedMetric === "Accuracy" ? "%" : selectedMetric === "Time" ? "s" : ""}
                </p>
                {type === "you" && (
                  <p className="text-xs mt-3 text-gray-500 dark:text-gray-400 font-medium italic">
                    {(() => {
                      const diff = Math.abs(Number((displayData.topper - value).toFixed(2)));
                      if (value === displayData.topper) return "You are at par with topper";

                      if (selectedMetric === "Incorrect") {
                        return value > displayData.topper
                          ? (displayData.topper === 0
                            ? `Topper was flawless, you were ${diff} incorrect compared with topper`
                            : `You were ${diff} incorrect compared with topper`)
                          : "You are the leader!";
                      }

                      if (selectedMetric === "Time") {
                        return value > displayData.topper
                          ? `${diff}s slower than topper`
                          : "You are the leader!";
                      }

                      return value < displayData.topper
                        ? `Gap from topper: ${diff}`
                        : "You are the leader!";
                    })()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompareTab;