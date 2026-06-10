import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { FaFlag, FaBookmark, FaTimes, FaBookOpen, FaLightbulb } from "react-icons/fa";
import SaveReportActions from "../../../components/exam/SaveReportActions";
import { useToast } from "../../../components/ui/use-toast";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const SolutionsTab = ({
  records,
  expandedQuestion,
  language,
  filter,
  quiz_id,
  navigate,
  setExpandedQuestion,
  setLanguage,
  setFilter,
  quiz,
  attemptNumber
}) => {
  const { toast } = useToast();
  const [showSolution, setShowSolution] = useState(null);
  const [savedQuestions, setSavedQuestions] = useState(new Set());
  const [reportedQuestions, setReportedQuestions] = useState(new Set());
  const [globalDifficulty, setGlobalDifficulty] = useState({});
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [topperTimes, setTopperTimes] = useState({});

  const user = JSON.parse(localStorage.getItem("student_user") || localStorage.getItem("user") || "{}");
  const student_id = user.id;

  useEffect(() => {
    if (student_id) fetchStatus();
    if (quiz_id) {
        fetchTopperQuestionTimes();
        fetchGlobalDifficulty();
    }
  }, [student_id, quiz_id]);

  const fetchGlobalDifficulty = async () => {
    try {
      const apiUrl = import.meta.env.VITE_BASE_URL || "";
      const response = await fetch(`${apiUrl}/api/CurrentAffairs/get_question_difficulty.php?quiz_id=${quiz_id}`);
      const data = await response.json();
      if (data.status === "success") setGlobalDifficulty(data.data);
    } catch (e) {}
  };

  const fetchTopperQuestionTimes = async () => {
    try {
      const apiUrl = import.meta.env.VITE_BASE_URL || "";
      const response = await fetch(`${apiUrl}/api/CurrentAffairs/get_topper_question_times.php?quiz_id=${quiz_id}`);
      const data = await response.json();
      if (data.status === "success") setTopperTimes(data.data);
    } catch (e) {}
  };

  const fetchStatus = async () => {
    try {
      const apiUrl = import.meta.env.VITE_BASE_URL || "";
      const response = await fetch(`${apiUrl}/api/SaveandReport/get_status.php?student_id=${student_id}`);
      const data = await response.json();
      if (data.success) {
        setSavedQuestions(new Set(data.saved.map(id => parseInt(id))));
        setReportedQuestions(new Set(data.reported.map(id => parseInt(id))));
      }
    } catch (e) {}
  };
  const handleReportSuccess = (question_id) => {
    setReportedQuestions(prev => new Set([...prev, parseInt(question_id)]));
  };



  const getOptionHtml = (record, key) => {
    const isHindi = language === "hindi";
    const field = `Option${key.toUpperCase()}_${isHindi ? 'Hi' : 'En'}`;
    return record[field] || record[`Option${key.toUpperCase()}_En`] || "";
  };

  const getQuestionHtml = (record) => {
    const isHindi = language === "hindi";
    return isHindi ? (record.Question_Hi || record.Question_En) : record.Question_En;
  };

  const stripHtmlTags = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getSolutionText = (record) => {
    const isHindi = language === "hindi";
    return isHindi ? (record.Solution_Hi || record.Solution_En) : record.Solution_En;
  };

  const filteredRecords = records.filter(record => {
    if (filter === "ALL") return true;
    if (filter === "INCORRECT") return record.is_correct != 1 && record.selected_key;
    if (filter === "NOT ATTEMPT") return !record.selected_key;
    if (filter === "CORRECT") return record.is_correct == 1;
    return true;
  });

  const toggleQuestion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
    setShowSolution(null);
  };

  useEffect(() => {
    const tourKey = `solutions_tour_${quiz_id}`;
    if (filteredRecords.length > 0 && !localStorage.getItem(tourKey)) {
        const driverObj = driver({
            showProgress: true,
            onDestroyed: () => {
                document.body.style.overflow = "auto";
            },
            steps: [
                {
                    element: '#question-tour-0',
                    popover: {
                        title: 'Interactive Questions',
                        description: 'Click on any question title to expand it. You will see a detailed analysis, topper time comparison, and the solution button.',
                        side: "bottom",
                        align: 'start'
                    },
                    onHighlightStarted: () => {
                        document.body.style.overflow = "hidden";
                        setExpandedQuestion(0);
                    }
                },
                {
                    element: '#solution-btn-tour',
                    popover: {
                        title: 'Expert Solution',
                        description: 'If available, click here to read a full detailed article summary about this topic on our blog.',
                        side: "top",
                        align: 'center'
                    }
                },
                {
                    element: '#filter-tour',
                    popover: {
                        title: 'Quick Filters',
                        description: 'Use these filters to quickly toggle between Correct, Incorrect, or Skipped questions.',
                        side: "bottom",
                        align: 'start'
                    }
                },
                {
                    element: '#tabs-tour',
                    popover: {
                        title: 'Performance Tabs',
                        description: 'Explore other tabs like Ranking, Time Management, and Peer Comparison to get a 360-degree view of your performance.',
                        side: "bottom",
                        align: 'center'
                    }
                }
            ]
        });

        const timer = setTimeout(() => {
            driverObj.drive();
            localStorage.setItem(tourKey, "true");
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [filteredRecords.length, quiz_id, attemptNumber]);

  return (
    <div className="mt-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-wider text-center">Detailed Solutions</h3>

      {/* Filter & Language Selection */}
      <div id="filter-tour" className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {["ALL", "INCORRECT", "NOT ATTEMPT", "CORRECT"].map((label) => (
              <button
                key={label}
                className={`px-5 py-2 rounded-xl text-xs font-black tracking-widest transition-all ${filter === label
                    ? "bg-[#cc0000] text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                onClick={() => setFilter(label)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Language:</span>
            <select
                className="bg-gray-50 dark:bg-gray-700 dark:text-white border-none rounded-xl px-4 py-2 text-sm font-bold shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
            >
                <option value="english">ENGLISH</option>
                <option value="hindi">HINDI</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto overflow-y-hidden">
            <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-[0.2em]">
                <th className="py-5 px-6 text-center w-20">Q.No</th>
                <th className="py-5 px-6 text-left">Question</th>
                <th className="py-5 px-6 text-center w-28">Status</th>
                <th className="py-5 px-6 text-center w-28">Correctness</th>
                <th className="py-5 px-6 text-center w-36">Difficulty</th>
                <th className="py-5 px-6 text-center w-28">Your Time</th>
                <th className="py-5 px-6 text-center w-28">Topper</th>
                <th className="py-5 px-6 text-center w-24">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredRecords.map((record, index) => {
                const isExpanded = expandedQuestion === index;
                const isCorrect = record.is_correct == 1;
                const yourAnswer = record.selected_key;
                const correctAnswer = record.CorrectAnswer;
                const stats = globalDifficulty[record.QuestionID];
                const accuracy = stats ? (stats.correct / stats.total) * 100 : 0;
                
                let diffLevel = "Hard", diffColor = "text-red-600", diffBg = "bg-red-50";
                if (accuracy >= 80) { diffLevel = "Easy"; diffColor = "text-green-600"; diffBg = "bg-green-50"; }
                else if (accuracy >= 40) { diffLevel = "Medium"; diffColor = "text-orange-600"; diffBg = "bg-orange-50"; }

                return (
                    <React.Fragment key={record.QuestionID}>
                    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isExpanded ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                        <td className="py-4 px-6 text-center font-bold text-sm text-gray-500">{index + 1}</td>
                        <td className="py-4 px-6 max-w-[200px] md:max-w-xs">
                            <button
                                id={index === 0 ? "question-tour-0" : ""}
                                onClick={() => toggleQuestion(index)}
                                className="text-left group w-full"
                            >
                                <span className="text-sm font-medium dark:text-gray-300 line-clamp-1 group-hover:text-red-600 transition-colors">
                                    {stripHtmlTags(getQuestionHtml(record)) || "View Image Question"}
                                </span>
                            </button>
                        </td>
                        <td className="py-4 px-6 text-center">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${yourAnswer ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                {yourAnswer ? 'Attempted' : 'Skipped'}
                            </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                        {yourAnswer ? (
                            isCorrect ? (
                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-sm">✓</div>
                            ) : (
                            <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">✕</div>
                            )
                        ) : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="py-4 px-6 text-center">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${diffBg} ${diffColor} dark:bg-opacity-20`}>
                                {diffLevel}
                            </span>
                        </td>
                        <td className="py-4 px-6 text-center text-xs font-bold tabular-nums">{record.time_spent || 0}s</td>
                        <td className="py-4 px-6 text-center text-xs font-bold text-orange-600 tabular-nums">{topperTimes[record.QuestionID] || 0}s</td>
                        <td className="py-4 px-6 text-center">
                            <SaveReportActions 
                                questionId={record.QuestionID}
                                quizType="current_affairs"
                                isSaved={savedQuestions.has(parseInt(record.QuestionID))}
                                isReported={reportedQuestions.has(parseInt(record.QuestionID))}
                                studentId={student_id}
                                onReportSuccess={() => handleReportSuccess(record.QuestionID)}
                                iconSize="16"
                            />
                        </td>
                    </tr>
                    <AnimatePresence>
                        {isExpanded && (
                            <tr>
                                <td colSpan="8" className="p-0 overflow-hidden border-none">
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden bg-gray-50 dark:bg-gray-900/40"
                                    >
                                        <div className="p-8 space-y-8 max-w-4xl mx-auto">
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black text-red-600 uppercase tracking-widest">Question:</h4>
                                                <div className="text-lg dark:text-white leading-relaxed q-html-content break-all whitespace-normal overflow-hidden" dangerouslySetInnerHTML={{ __html: getQuestionHtml(record) }} />
                                            </div>

                                            {/* Answer Summary Section */}
                                            <div className="flex flex-wrap gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                                <div className="flex-1 min-w-[140px]">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Your Answer</span>
                                                    <div className={`text-lg font-black ${!yourAnswer ? 'text-gray-400' : (isCorrect ? 'text-green-600' : 'text-red-600')}`}>
                                                        {yourAnswer ? `Option ${yourAnswer}` : "Not Attempted"}
                                                    </div>
                                                </div>
                                                <div className="w-px bg-gray-100 dark:bg-gray-700 hidden md:block"></div>
                                                <div className="flex-1 min-w-[140px]">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Correct Answer</span>
                                                    <div className="text-lg font-black text-green-600">
                                                        Option {correctAnswer}
                                                    </div>
                                                </div>
                                                <div className="w-px bg-gray-100 dark:bg-gray-700 hidden md:block"></div>
                                                <div className="flex-1 min-w-[140px]">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Result</span>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${!yourAnswer ? 'bg-gray-100 text-gray-500' : (isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}`}>
                                                        {!yourAnswer ? "Skipped" : (isCorrect ? "Correct" : "Incorrect")}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {["A", "B", "C", "D", "E"].map((key) => {
                                                    const optHtml = getOptionHtml(record, key);
                                                    if (!optHtml || optHtml === '<p><br></p>') return null;
                                                    
                                                    const isUser = key === yourAnswer;
                                                    const isCorrectOpt = key === correctAnswer;
                                                    
                                                    let borderClass = "border-gray-200 dark:border-gray-700";
                                                    let bgClass = "bg-white dark:bg-gray-800";
                                                    if (isCorrectOpt) { borderClass = "border-green-500 ring-1 ring-green-500"; bgClass = "bg-green-50 dark:bg-green-900/20"; }
                                                    else if (isUser) { borderClass = "border-red-500 ring-1 ring-red-500"; bgClass = "bg-red-50 dark:bg-red-900/20"; }

                                                    return (
                                                        <div key={key} className={`p-4 rounded-xl border-2 transition-all ${borderClass} ${bgClass}`}>
                                                            <div className="flex items-start gap-3">
                                                                <span className="font-black text-sm mt-1">{key}.</span>
                                                                <div className="flex-1 text-sm dark:text-gray-200 break-all whitespace-normal overflow-hidden" dangerouslySetInnerHTML={{ __html: optHtml }} />
                                                                {isCorrectOpt && <span className="text-[10px] font-black text-green-600 uppercase bg-green-100 px-2 py-0.5 rounded">Correct</span>}
                                                                {isUser && !isCorrectOpt && <span className="text-[10px] font-black text-red-600 uppercase bg-red-100 px-2 py-0.5 rounded">Your Choice</span>}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="pt-6 border-t dark:border-gray-700">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                                        <FaLightbulb className="text-yellow-500 animate-pulse" />
                                                        Detailed Solution & Insight:
                                                    </h4>
                                                    {record.SolutionLink && (
                                                        <button 
                                                            id={index === 0 ? "solution-btn-tour" : ""}
                                                            onClick={() => {
                                                                const slug = record.SolutionLink.split('/').pop();
                                                                navigate(`/summary/${slug}`, { state: { fromExam: true } });
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_4px_12px_rgba(204,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(204,0,0,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 w-fit"
                                                        >
                                                            <FaBookOpen className="w-3.5 h-3.5" />
                                                            View Detailed Article
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="relative group">
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                                    <div className="relative bg-white dark:bg-gray-800/50 p-6 rounded-2xl text-sm leading-relaxed dark:text-gray-200 border border-blue-100 dark:border-blue-900/40 shadow-inner break-all whitespace-normal overflow-hidden" 
                                                        dangerouslySetInnerHTML={{ 
                                                            __html: getSolutionText(record) || (record.SolutionLink ? "A high-quality article solution is curated for this question. Use the button above to deepen your understanding with our expert analysis." : "No explanation available.") 
                                                        }} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </td>
                            </tr>
                        )}
                    </AnimatePresence>
                    </React.Fragment>
                );
                })}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default SolutionsTab;
