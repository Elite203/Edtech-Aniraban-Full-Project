import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { FaFlag, FaBookmark, FaTimes, FaBookOpen } from "react-icons/fa";
import SaveReportActions from "../components/exam/SaveReportActions";
import { useToast } from "../components/ui/use-toast";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import { ScrollSmoother } from "gsap/ScrollSmoother";

const SolutionsTab = ({
  records,
  expandedQuestion,
  language,
  filter,
  course_id,
  exam_set_id,
  set_number,
  navigate,
  setExpandedQuestion,
  setLanguage,
  setFilter,
  courseInfo,
  setInfo,
  isNewUI,
  attemptNumber,
  timeConfig,
  isCoursePurchased = false,
  isLatestAttempt = true
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

  console.log("SolutionsTab Props:", { records, expandedQuestion, language, filter, course_id, exam_set_id, set_number, courseInfo, setInfo, isNewUI, attemptNumber, timeConfig });
  const { toast } = useToast();
  const [showSolution, setShowSolution] = useState(null);
  const [showPassage, setShowPassage] = useState(null);
  const [savedQuestions, setSavedQuestions] = useState(new Set());
  const [reportedQuestions, setReportedQuestions] = useState(new Set());
  const [allReports, setAllReports] = useState({});
  const [isPassageModalOpen, setIsPassageModalOpen] = useState(false);
  const [isReattemptModalOpen, setIsReattemptModalOpen] = useState(false);
  const [currentPassageContent, setCurrentPassageContent] = useState("");

  const [topperTimes, setTopperTimes] = useState({});
  const [globalDifficulty, setGlobalDifficulty] = useState({});
  const [activeTooltip, setActiveTooltip] = useState(null); // { stats, pos, level, accuracy }
  const user = JSON.parse(localStorage.getItem("student_user") || localStorage.getItem("user") || "{}");
  const student_id = user.id;

  const liveResponses = React.useMemo(() => {
    if (!isLatestAttempt) return null;
    try {
      const stored = localStorage.getItem(`liveResponses_${course_id}_${exam_set_id}_${set_number}`);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Error loading live responses:", e);
      return null;
    }
  }, [isLatestAttempt, course_id, exam_set_id, set_number]);

  const processedRecords = React.useMemo(() => {
    if (!records) return [];

    // Deduplicate records by question ID first to prevent SQL join collisions
    const seenIds = new Set();
    const uniqueRecords = [];
    for (const record of records) {
      const qId = (record.question_id !== undefined && record.question_id !== null) ? record.question_id : record.id;
      if (qId) {
        const qIdStr = String(qId).trim();
        if (seenIds.has(qIdStr)) {
          continue; // Skip duplicates
        }
        seenIds.add(qIdStr);
      }
      uniqueRecords.push(record);
    }

    if (!liveResponses) return uniqueRecords;

    return uniqueRecords.map(record => {
      const qId = (record.question_id !== undefined && record.question_id !== null) ? record.question_id : record.id;
      const live = liveResponses[String(qId)] || liveResponses[qId];
      if (live) {
        return {
          ...record,
          selected_key: live.selected_key,
          is_correct: live.is_correct,
          time_spent: live.time_spent,
          marked_for_review: live.marked_for_review,
          review_status: live.review_status,
          mark_review: live.marked_for_review
        };
      }
      return record;
    });
  }, [records, liveResponses]);

  useEffect(() => {
    if (student_id) {
      fetchStatus();
    }
    if (exam_set_id) {
      fetchTopperQuestionTimes();
      fetchGlobalDifficulty();
    }
  }, [student_id, exam_set_id]);

  useEffect(() => {
    if (!isCoursePurchased) return;
    const tourKey = `ssc_solutions_tour_${exam_set_id}_${attemptNumber}`;
    if (processedRecords.length > 0 && attemptNumber && !localStorage.getItem(tourKey)) {
      const driverObj = driver({
        showProgress: true,
        onDestroyed: () => {
          document.body.style.overflow = "auto";
        },
        steps: [
          {
            element: '#filter-tour',
            popover: {
              title: 'Quick Filters',
              description: 'Filter questions by All, Correct, Incorrect, or Not Attempted to quickly review your performance.',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '#question-tour-0',
            popover: {
              title: 'Detailed Analysis',
              description: 'Click on any question text to expand and see the detailed solution, explanation, and option breakdown.',
              side: "bottom",
              align: 'start'
            },
            onHighlightStarted: () => {
              document.body.style.overflow = "hidden";
            }
          },
          {
            element: '#difficulty-tour-0',
            popover: {
              title: 'Difficulty Insights',
              description: 'Hover over the difficulty level to see global accuracy statistics and how other students performed on this question.',
              side: "left",
              align: 'center'
            }
          },
          {
            element: '#question-tour-0',
            popover: {
              title: 'Solution View',
              description: 'Expanding a question reveals the expert solution and detailed explanation below.',
              side: "bottom",
              align: 'start'
            },
            onHighlightStarted: () => {
              setExpandedQuestion(0);
            }
          }
        ]
      });

      const timer = setTimeout(() => {
        driverObj.drive();
        localStorage.setItem(tourKey, "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [processedRecords.length, exam_set_id, attemptNumber]);

  const fetchGlobalDifficulty = async () => {
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${apiUrl}/api/Solutions/get_question_difficulty.php?exam_set_id=${exam_set_id}`);
      const data = await response.json();
      if (data.status === "success") {
        setGlobalDifficulty(data.data);
        console.log("Global Difficulty Data:", data.data);
      }
    } catch (error) {
      console.error("Error fetching global difficulty:", error);
    }
  };

  const fetchTopperQuestionTimes = async () => {
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${apiUrl}/api/Leaderboard/get_topper_question_times.php?exam_set_id=${exam_set_id}`);
      const data = await response.json();
      if (data.status === "success") {
        setTopperTimes(data.data);
        console.log("Topper Times Data:", data.data);
      }
    } catch (error) {
      console.error("Error fetching topper question times:", error);
    }
  };

  const fetchStatus = async () => {
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${apiUrl}/api/SaveandReport/get_status.php?student_id=${student_id}`);
      const data = await response.json();
      if (data.success) {
        setSavedQuestions(new Set(data.saved.map(id => parseInt(id))));
        setReportedQuestions(new Set(data.reported.map(id => parseInt(id))));

        // Map reports for pre-filling
        const reportsMap = {};
        data.reports?.forEach(r => {
          reportsMap[parseInt(r.question_id)] = r;
        });
        setAllReports(reportsMap);
        console.log("Save/Report Status Data:", data);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  const handleSave = async (question_id) => {
    if (!student_id) {
      toast({
        title: "Login Required",
        description: "Please login to save questions",
        variant: "destructive",
      });
      return;
    }
    const isSaved = savedQuestions.has(question_id);
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${apiUrl}/api/SaveandReport/save_question.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id,
          question_id,
          action: isSaved ? "unsave" : "save"
        })
      });
      const data = await response.json();
      if (data.success) {
        const newSaved = new Set(savedQuestions);
        if (isSaved) {
          newSaved.delete(question_id);
          toast({ title: "Removed", description: "Question removed from saved items" });
        } else {
          newSaved.add(question_id);
          toast({ title: "Saved", description: "Question saved successfully" });
        }
        setSavedQuestions(newSaved);
      }
    } catch (error) {
      toast({ title: "Error", description: "Error saving question", variant: "destructive" });
    }
  };

  const handleReportSuccess = (question_id) => {
    setReportedQuestions(prev => new Set([...prev, parseInt(question_id)]));
    toast({ title: "Reported", description: "Question reported successfully" });
  };

  const getOptionHtml = (record, key) => {
    const field = language === "hindi" ? `option_${key}_hindi` : `option_${key}_english`;
    return record[field] || record[`option_${key}_english`] || record[`option_${key}_hindi`] || record[`option_${key}`] || '';
  };

  const getQuestionHtml = (record) => {
    const isHindi = language === "hindi";
    return isHindi 
      ? (record.question_hindi || record.question_hi || record.question || "")
      : (record.question_english || record.question || "");
  };

  const getPassageHtml = (record) => {
    const passage = language === "hindi"
      ? (record.passage_hindi || record.passage)
      : (record.passage_english || record.passage);

    if (passage && stripHtmlTags(passage).trim() !== "") {
      return passage;
    }

    if (record.parent_question_id) {
      const parent = processedRecords.find(r =>
        (r.id === record.parent_question_id || r.question_id === record.parent_question_id)
      );
      if (parent) {
        const parentPassage = language === "hindi"
          ? (parent.passage_hindi || parent.passage)
          : (parent.passage_english || parent.passage);
        if (parentPassage && stripHtmlTags(parentPassage).trim() !== "") {
          return parentPassage;
        }
      }
    }
    return "";
  };

  const getQuestionBlobImage = (record) => {
    if (record.question_image) {
      // Assuming the API sends the blob as a base64 string
      const type = record.question_image_type || 'image/png';
      return `data:${type};base64,${record.question_image}`;
    }
    return null;
  };

  const stripHtmlTags = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getSolutionText = (record) => {
    const solution = language === "hindi" && record.solution_hindi ? record.solution_hindi : (record.solution_english || record.detail || "");
    if (!solution) {
      return "Solution Not Available";
    }
    return stripHtmlTags(solution);
  };

  const sortedRecords = React.useMemo(() => {
    // 1. Group records by subject to maintain original relative sequence and prevent sorting issues
    const groups = {};
    const subjectOrder = [];
    
    processedRecords.forEach(record => {
      const subj = (record.subject || record.subject_name || "General").toString().trim();
      const subjUpper = subj.toUpperCase();
      if (!groups[subjUpper]) {
        groups[subjUpper] = [];
        subjectOrder.push(subjUpper);
      }
      groups[subjUpper].push(record);
    });
    
    // 2. Sort within each subject group (passage vs normal, then stable original order)
    const sorted = [];
    subjectOrder.forEach(subjUpper => {
      const group = groups[subjUpper];
      // Elements were pushed sequentially, so they are already ordered correctly
      sorted.push(...group);
    });
    
    return sorted;
  }, [processedRecords]);

  const filteredRecords = sortedRecords.filter(record => {
    if (filter === "ALL") return true;
    if (filter === "INCORRECT") return record.is_correct != 1 && record.selected_key;
    if (filter === "NOT ATTEMPT") return !record.selected_key;
    if (filter === "ANSWERED & MARK FOR REVIEW") {
      const isMarked = record.marked_for_review == 1 || record.marked_for_review === "1" ||
        record.mark_review == 1 || record.mark_review === "1" ||
        record.review_status === "reviewedAnswered" || record.review_status === "reviewedUnanswered";
      return isMarked && !!record.selected_key;
    }
    if (filter === "CORRECT") return record.is_correct == 1;
    return true;
  });

  const toggleQuestion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
    setShowSolution(null);
    setShowPassage(null);
  };

  const togglePassage = (index) => {
    setShowPassage(showPassage === index ? null : index);
  };

  const toggleSolution = (index) => {
    setShowSolution(showSolution === index ? null : index);
  };

  return (
    <div className="mt-12 max-w-6xl mx-auto">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Question-wise Analysis</h3>

      {/* Filter & Language Selection */}
      <div id="filter-tour" className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {["ALL", "INCORRECT", "NOT ATTEMPT", "ANSWERED & MARK FOR REVIEW", "CORRECT"].map((label) => (
              <button
                key={label}
                className={`px-4 py-2 rounded text-sm ${filter === label
                    ? "bg-black dark:bg-gray-700 text-white"
                    : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                onClick={() => setFilter(label)}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-4 py-2 text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <button
            onClick={() => setIsReattemptModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
          >
            Reattempt Full Test
          </button>
        </div>
      </div>

      <div className="overflow-x-auto w-full border dark:border-gray-700 rounded-xl" style={{ touchAction: "pan-x", WebkitOverflowScrolling: "touch" }}>
        <table className="min-w-[900px] w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-2 px-4 border dark:border-gray-600 text-sm dark:text-gray-300 w-16">Q.No</th>
              <th className="py-2 px-4 border dark:border-gray-600 text-sm dark:text-gray-300 text-left">View Question</th>
              <th className="py-2 px-4 border dark:border-gray-600 text-sm dark:text-gray-300 w-28">Your Answer</th>
              <th className="py-2 px-4 border dark:border-gray-600 text-sm dark:text-gray-300 w-28">Correctness</th>
              <th className="py-2 px-4 border dark:border-gray-600 text-sm dark:text-gray-300 w-36">Difficulty Level</th>
              <th className="py-2 px-4 border dark:border-gray-600 text-sm dark:text-gray-300 w-24">Your Time</th>
              <th className="py-2 px-4 border dark:border-gray-600 text-sm dark:text-gray-300 w-24">Topper Time</th>
              <th className="py-2 px-4 border dark:border-gray-600 text-sm dark:text-gray-300 w-20 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record, index) => {
              const isExpanded = expandedQuestion === index;
              const isSolutionExpanded = showSolution === index;
              const isPassageExpanded = showPassage === index;
              const isCorrect = record.is_correct == 1;
              const rawYourAnswer = record.selected_key || record.selected_option;
              const yourAnswer = rawYourAnswer?.toString().toLowerCase();
              let correctAnswer = (record.correct_key || record.correct_option)?.toString().trim().toLowerCase() || "";
              if (correctAnswer === "1") correctAnswer = "a";
              if (correctAnswer === "2") correctAnswer = "b";
              if (correctAnswer === "3") correctAnswer = "c";
              if (correctAnswer === "4") correctAnswer = "d";
              if (correctAnswer === "5") correctAnswer = "e";
              const stats = globalDifficulty[record.question_id || record.id];
              const accuracy = stats ? (stats.correct / stats.total) * 100 : 0;
              
              let difficultyLevel = "Hard";
              let difficultyColor = "text-red-600 dark:text-red-400";
              let difficultyBg = "bg-red-50 dark:bg-red-900/20";

              if (accuracy >= 90) {
                difficultyLevel = "Easy";
                difficultyColor = "text-green-600 dark:text-green-400";
                difficultyBg = "bg-green-50 dark:bg-green-900/20";
              } else if (accuracy >= 50) {
                difficultyLevel = "Medium";
                difficultyColor = "text-yellow-600 dark:text-yellow-500";
                difficultyBg = "bg-yellow-50 dark:bg-yellow-900/20";
              }

              const solutionText = getSolutionText(record);

              return (
                <React.Fragment key={index}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-2 px-4 border dark:border-gray-600 text-center text-sm dark:text-gray-300 w-16">
                      {index + 1}
                    </td>
                    <td className="py-2 px-4 border dark:border-gray-600 max-w-0">
                      <button
                        id={index === 0 ? "question-tour-0" : ""}
                        onClick={() => toggleQuestion(index)}
                        className="text-left hover:text-blue-600 dark:hover:text-blue-400 text-sm dark:text-gray-300 min-h-[1.5rem] w-full block"
                      >
                        <div className="flex items-center gap-2">
                          {timeConfig?.type === 'sectional' && (() => {
                            const subj = (record.subject || record.subject_name || "General").toString().trim().toUpperCase();
                            const secIdx = timeConfig.sections?.findIndex(sec => 
                              Array.isArray(sec.subjects) && sec.subjects.map(s => s.toUpperCase()).includes(subj)
                            );
                            if (secIdx !== undefined && secIdx >= 0) {
                              return (
                                <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0">
                                  SECTION-{secIdx + 1} | {subj}
                                </span>
                              );
                            }
                            return null;
                          })()}
                          {getPassageHtml(record) ? (
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0">Passage</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0">Normal</span>
                          )}
                          {(record.marked_for_review == 1 || record.marked_for_review === "1" ||
                            record.mark_review == 1 || record.mark_review === "1" ||
                            record.review_status === "reviewedAnswered" || record.review_status === "reviewedUnanswered") && (
                              <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0">Review</span>
                            )}
                          <span className="truncate line-clamp-1">
                            {(() => {
                              const text = stripHtmlTags(getQuestionHtml(record)).trim();
                              if (text) return text;
                              const hasImg = record.question_image || record.question_img || getQuestionHtml(record).includes("<img");
                              return hasImg ? (
                                <span className="text-blue-500 italic font-medium">View Image Question</span>
                              ) : (
                                <span className="text-gray-400 italic">View Question</span>
                              );
                            })()}
                          </span>
                        </div>
                      </button>
                    </td>
                    <td className="py-2 px-4 border dark:border-gray-600 text-center text-sm dark:text-gray-300 w-28 break-words overflow-hidden">
                      {yourAnswer ? yourAnswer.toUpperCase() : "N/A"}
                    </td>
                    <td className="py-2 px-4 border dark:border-gray-600 text-center w-28">
                      {yourAnswer ? (
                        isCorrect ? (
                          <span className="text-green-600 dark:text-green-400 text-xl" title="Correct">✔</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 text-xl" title="Incorrect">✘</span>
                        )
                      ) : (
                        <span className="text-gray-400 text-xl font-bold">-</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border dark:border-gray-600 text-center text-sm dark:text-gray-300 w-36 relative h-full">
                      <div 
                        id={index === 0 ? "difficulty-tour-0" : ""}
                        className="flex justify-center items-center h-8 relative w-full"
                        onMouseEnter={(e) => {
                          const badge = e.currentTarget.querySelector('.difficulty-badge');
                          if (badge) {
                            const rect = badge.getBoundingClientRect();
                            setActiveTooltip({
                              stats: stats,
                              accuracy: accuracy,
                              level: difficultyLevel,
                              color: difficultyColor,
                              pos: {
                                x: rect.left + rect.width / 2,
                                y: rect.top
                              }
                            });
                          }
                        }}
                        onMouseLeave={() => setActiveTooltip(null)}
                      >
                        <span 
                          className={`difficulty-badge cursor-help px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${difficultyBg} ${difficultyColor} transition-all duration-300 transform hover:scale-105 active:scale-95`}
                        >
                          {difficultyLevel}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4 border dark:border-gray-600 text-center text-sm dark:text-gray-300 w-24">
                      {record.time_spent || 0}s
                    </td>
                    <td className="py-2 px-4 border dark:border-gray-600 text-center text-sm dark:text-gray-300 w-24">
                      {topperTimes[record.question_id || record.id] || 0}s
                    </td>
                    <td className="py-2 px-4 border dark:border-gray-600 text-center w-20">
                      <SaveReportActions 
                        questionId={record.question_id || record.id}
                        quizType={isNewUI ? "new_ui" : "old_ui"}
                        isSaved={savedQuestions.has(parseInt(record.question_id || record.id))}
                        isReported={reportedQuestions.has(record.question_id || record.id)}
                        studentId={student_id}
                        onSaveToggle={(newState) => {
                          setSavedQuestions(prev => {
                            const next = new Set(prev);
                            if (newState) next.add(record.question_id || record.id);
                            else next.delete(record.question_id || record.id);
                            return next;
                          });
                        }}
                        onReportSuccess={() => handleReportSuccess(record.question_id || record.id)}
                        containerClass="flex justify-center items-center gap-3"
                      />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan="8" className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600">
                        <div className="space-y-4">
                          {/* Question Content */}
                          <div className="flex flex-col space-y-3">
                            {getPassageHtml(record) && isPassageExpanded && (
                              <div className="mb-4 p-4 bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/50 rounded-lg shadow-sm">
                                <div
                                  className="text-sm dark:text-gray-300 leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: getPassageHtml(record) }}
                                />
                              </div>
                            )}
                            {(getQuestionHtml(record).trim() || getQuestionBlobImage(record) || record.question_img) ? (
                              <>
                                <div
                                  className="font-semibold text-lg dark:text-white q-html-content break-all whitespace-normal overflow-hidden"
                                  dangerouslySetInnerHTML={{ __html: getQuestionHtml(record) }}
                                />
                                {getQuestionBlobImage(record) && (
                                  <div className="my-2">
                                    <img
                                      src={getQuestionBlobImage(record)}
                                      alt="Question"
                                      className="max-w-full md:max-w-2xl h-auto rounded border border-gray-200 dark:border-gray-700 shadow-sm bg-white"
                                    />
                                  </div>
                                )}
                                {record.question_img && (
                                  <div className="my-2">
                                    <img
                                      src={record.question_img}
                                      alt="Question"
                                      className="max-w-full md:max-w-2xl h-auto rounded border border-gray-200 dark:border-gray-700 shadow-sm bg-white"
                                    />
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-gray-400 italic">No question content available</div>
                            )}
                          </div>

                          {/* Options Content */}
                          <div className="space-y-4 mt-4">
                            {["a", "b", "c", "d", "e"].map((key) => {
                              const isUser = key === yourAnswer;
                              const isCorrectOpt = key === correctAnswer;
                              let textClass = "text-gray-800 dark:text-gray-300";
                              if (isCorrectOpt) textClass = "text-green-600 dark:text-green-400 font-semibold";
                              else if (isUser && !isCorrectOpt) textClass = "text-red-600 dark:text-red-400";

                              const optionHtml = getOptionHtml(record, key);
                              const optionImgField = record[`option_${key}_img`];
                              const optionBlobField = record[`option_${key}_image`]; // Check for blob if exists

                              return (
                                <div key={key} className={`${textClass} flex flex-col space-y-2 p-2 rounded-lg ${isCorrectOpt ? 'bg-green-50 dark:bg-green-900/20' : ''} ${isUser && !isCorrectOpt ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                                  <div className="flex items-start">
                                    <span className="font-bold uppercase mr-3 mt-0.5">{key}.</span>
                                    <div className="flex flex-col flex-grow">
                                      {optionHtml.trim() ? (
                                        <div
                                          className="opt-html-content break-all whitespace-normal overflow-hidden"
                                          dangerouslySetInnerHTML={{ __html: optionHtml }}
                                        />
                                      ) : (!optionImgField && !optionBlobField && <span className="text-gray-400 italic">No text</span>)}

                                      {(optionImgField || optionBlobField) && (
                                        <div className="mt-2">
                                          <img
                                            src={optionImgField || (optionBlobField ? `data:${record[`option_${key}_image_type`] || 'image/png'};base64,${optionBlobField}` : '')}
                                            alt={`Option ${key}`}
                                            className="max-w-[200px] h-auto rounded border border-gray-200 dark:border-gray-700 bg-white"
                                          />
                                        </div>
                                      )}

                                      <div className="flex items-center gap-2 mt-1">
                                        {isUser && (
                                          <span className="italic text-xs text-gray-500 dark:text-gray-400">
                                            (Your Answer)
                                          </span>
                                        )}
                                        {isCorrectOpt && !isUser && (
                                          <span className="italic text-xs text-gray-500 dark:text-gray-400">
                                            (Correct Answer)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Solution Button and Content */}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(getPassageHtml(record) || record.passage_id) && (
                              <button
                                onClick={() => {
                                  const passage = getPassageHtml(record);
                                  if (passage) {
                                    setCurrentPassageContent(passage);
                                    setIsPassageModalOpen(true);
                                  } else {
                                    toast({
                                      title: "Notice",
                                      description: "Passage data is being loaded or is unavailable.",
                                      variant: "default"
                                    });
                                  }
                                }}
                                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded text-sm font-semibold transition-colors flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                View Passage
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const slugify = (text) => {
                                  if (!text) return "";
                                  return text
                                    .toString()
                                    .toLowerCase()
                                    .trim()
                                    .replace(/\s+/g, "-") // Replace spaces with -
                                    .replace(/[^\w-]+/g, "") // Remove all non-word chars
                                    .replace(/--+/g, "-") // Replace multiple - with single -
                                    .substring(0, 50); // Limit length
                                };

                                const courseSlug = slugify(courseInfo?.title || "course");
                                const setSlug = slugify(setInfo?.set_name || "set");
                                let questionText = stripHtmlTags(getQuestionHtml(record)).trim();
                                if (!questionText) {
                                  questionText = "image-question";
                                }
                                const questionSlug = slugify(questionText);

                                // Get the absolute index of the question in the original records array
                                const absoluteIndex = processedRecords.indexOf(record);
                                const finalSlug = `question-${absoluteIndex + 1}-${questionSlug}`;

                                navigate(
                                  `/exam-solution/${course_id}/${exam_set_id}/${set_number}/${absoluteIndex}/${courseSlug}/${setSlug}/${finalSlug}`,
                                  { state: { record, courseInfo, setInfo } }
                                );
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                            >
                              View Solution
                            </button>
                          </div>

                          {isSolutionExpanded && (
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                              <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">
                                Detailed Solution:
                              </h4>
                              <p className="text-gray-700 dark:text-gray-300 whitespace-normal break-all overflow-hidden">
                                {solutionText}
                              </p>
                            </div>
                          )}

                          {record.explanation && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <h4 className="font-semibold mb-2 dark:text-white">Explanation:</h4>
                              <p className="text-gray-700 dark:text-gray-300 break-all whitespace-normal overflow-hidden">
                                {(language === "hindi" && record.explanation_hi
                                  ? record.explanation_hi
                                  : record.explanation
                                )?.replace(/<[^>]+>/g, '') || "No explanation available"}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Passage Modal */}
      {isPassageModalOpen && createPortal(
        <div className="fixed inset-0 top-0 left-0 w-full h-full z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <FaBookOpen className="text-blue-600 dark:text-blue-400" />
                </div>
                Question Passage
              </h3>
              <button
                onClick={() => setIsPassageModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div
                className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg q-html-content"
                dangerouslySetInnerHTML={{ __html: currentPassageContent }}
              />
            </div>
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30 flex justify-end">
              <button
                onClick={() => setIsPassageModalOpen(false)}
                className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isReattemptModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <div className="p-4 md:p-6 border-b dark:border-gray-700 bg-red-50 dark:bg-red-900/20 flex items-center justify-between">
              <div className="w-10"></div> {/* Spacer to help center the title */}
              <h3 className="text-lg md:text-xl font-black text-red-600 dark:text-red-400 uppercase tracking-tight text-center flex-grow">
                ! DON'T CHEAT YOURSELF !
              </h3>
              <button 
                onClick={() => setIsReattemptModalOpen(false)}
                className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-all"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-5 md:p-8 flex-1 overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center text-sm md:text-base">
                <span className="font-bold text-gray-900 dark:text-white">Do not rely on memorizing correct answers for re-attempts, (ONLY ANALYSIS YOUR WEAKNESS & TRY TO LEARN FROM IT TO RE- ATTEMPT) as it may give a false sense of improvement.</span>- , By Re-attempts you can check if u have any progress after analysis? Re-attempts <span className="font-bold text-gray-900 dark:text-white">only show your score with compare to previous one,</span> since the question pattern and solutions are already familiar.
              </p>
            </div>
            <div className="p-4 md:p-6 border-t dark:border-gray-700 flex justify-center bg-gray-50/50 dark:bg-gray-900/50">
              <button
                onClick={() => {
                  setIsReattemptModalOpen(false);
                  const element = document.documentElement;
                  if (element.requestFullscreen) {
                    element.requestFullscreen();
                  } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                  } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                  }
                  if (isNewUI) {
                    navigate(`/ssc/main-exam?new_attempt=true`, { 
                      state: { 
                        course_id, 
                        exam_set_id, 
                        set_number,
                        courseId: course_id,
                        examSetId: exam_set_id,
                        setNumber: set_number
                      } 
                    });
                  } else {
                    navigate(`/exam/question/${course_id}/${exam_set_id}/${set_number}?new_attempt=true`);
                  }
                }}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 active:scale-95 uppercase tracking-wide"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Difficulty Tooltip Portal */}
      {createPortal(
        <AnimatePresence>
          {activeTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{ 
                left: "50%", 
                top: "50%",
                position: 'fixed',
                zIndex: 999999,
                transform: 'translate(-50%, -50%)'
              }}
              className="w-56 p-5 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800/80 pointer-events-none"
            >
              {activeTooltip.stats ? (
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Overall Performance</span>
                      <span className="text-xs font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Question Accuracy</span>
                    </div>
                    <span className={`text-base font-black tabular-nums ${activeTooltip.color}`}>{Number(activeTooltip.accuracy.toFixed(2))}%</span>
                  </div>
                  
                  <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-50 dark:border-gray-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${activeTooltip.accuracy}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      className={`h-full rounded-full ${activeTooltip.level === 'Easy' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]' : activeTooltip.level === 'Medium' ? 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'}`}
                    />
                  </div>

                  <div className="flex flex-col items-center pt-2 border-t border-gray-100 dark:border-gray-800/60">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-gray-900 dark:text-white tabular-nums">{activeTooltip.stats.correct}</span>
                      <span className="text-xs text-gray-300 dark:text-gray-600 font-bold uppercase italic">/</span>
                      <span className="text-base font-black text-gray-900 dark:text-white tabular-nums">{activeTooltip.stats.total}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] mt-0.5">Correct Students</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 gap-2">
                  <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Analyzing Data...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default SolutionsTab;