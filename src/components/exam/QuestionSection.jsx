import React, { useEffect, useRef, useState } from "react";
import WatermarkComponent from "../NewUI/WatermarkComponent";
import { useStudentProfile } from "../NewUI/StudentProfileData";
import { FaFlag, FaBookmark, FaRegBookmark } from "react-icons/fa";
import SaveReportActions from "./SaveReportActions";

const QuestionSection = ({
  subjects,
  activeSubject,
  setActiveSubject,
  filteredQuestions,
  currentIndex,
  currentQuestion,
  currentGlobalQuestionNumber,
  language,
  setLanguage,
  navigate,
  answers,
  handleSaveNext,
  handleReviewNext,
  handleClearResponse,
  questionTimers,
  globalQuestionIndex,
  hasContent,
  submittedSubjects,
  timeConfig,
  onSubjectSwitchAttempt,
  mainTimer,
  overallTime,
  studentNumber,
  course_id,
  exam_set_id,
  set_number,
  positiveMarking,
  negativeMarking,
  isNewAttempt,
  showFeedback,
  originalResponse,
  globalDifficulty,
  topperTimes,
  savedQuestions,
  reportedQuestions,
  handleSaveSuccess,
  handleReportSuccess
}) => {
  const { user } = useStudentProfile();
  const [localSelectedOption, setLocalSelectedOption] = useState("");
  const [elapsedTime, setElapsedTime] = useState(() => {
    const savedElapsedTimes = localStorage.getItem(`examQuestionElapsedTimes_${course_id}_${exam_set_id}_${set_number}`);
    if (savedElapsedTimes && currentQuestion?.id) {
      try {
        const parsed = JSON.parse(savedElapsedTimes);
        return parsed[currentQuestion.id] || 0;
      } catch (e) {
        console.error("Failed to parse saved elapsed times", e);
      }
    }
    return 0;
  });
  const timerRef = useRef(null);

  useEffect(() => {
    if (currentQuestion) {
      setLocalSelectedOption(answers[currentQuestion.id] || "");
    }
  }, [currentQuestion?.id, answers]);

  useEffect(() => {
    if (currentQuestion && elapsedTime > 0) {
      const savedElapsedTimes = localStorage.getItem(`examQuestionElapsedTimes_${course_id}_${exam_set_id}_${set_number}`);
      let allTimes = {};
      if (savedElapsedTimes) {
        try {
          allTimes = JSON.parse(savedElapsedTimes);
        } catch (e) {
          console.error("Failed to parse saved elapsed times", e);
        }
      }
      allTimes[currentQuestion.id] = elapsedTime;
      localStorage.setItem(`examQuestionElapsedTimes_${course_id}_${exam_set_id}_${set_number}`, JSON.stringify(allTimes));
    }
  }, [elapsedTime, currentQuestion?.id, course_id, exam_set_id, set_number]);

  // Manage question timer start/stop on question change
  useEffect(() => {
    if (currentQuestion) {
      const isTimeUp = !isNewAttempt && overallTime === 0;
      if (!timerRef.current && !isTimeUp) {
        timerRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentQuestion?.id]);

  // Separate effect to stop timer if overall time finishes
  useEffect(() => {
    if (!isNewAttempt && overallTime === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [overallTime, isNewAttempt]);



  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "00:00";
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleOptionSelect = (option) => {
    setLocalSelectedOption(option);
  };

  const handleSave = () => {
    handleSaveNext(localSelectedOption, elapsedTime);
  };

  const handleReview = () => {
    handleReviewNext(localSelectedOption, elapsedTime);
  };

  const handleClear = () => {
    setLocalSelectedOption("");
    handleClearResponse();
  };

  const canSwitchSubject = (subject) => {
    if (timeConfig?.type === 'overall') return true;
    if (timeConfig?.type === 'subject_wise') return subject === activeSubject;
    if (timeConfig?.type === 'sectional') {
      // Logic for sectional mode - check if subject is in the current active section
      if (!activeSubject || !timeConfig.sections) return false;
      const currentSection = timeConfig.sections.find(sec =>
        Array.isArray(sec.subjects) &&
        sec.subjects.map(s => s.toUpperCase()).includes(activeSubject?.toUpperCase())
      );
      return currentSection?.subjects?.map(s => s.toUpperCase()).includes(subject.toUpperCase()) || false;
    }
    return false;
  };

  const handleSubjectSwitch = (subject) => {
    if (subject === activeSubject) return;

    if (timeConfig?.type === 'sectional') {
      const currentSection = timeConfig.sections?.find(sec =>
        Array.isArray(sec.subjects) &&
        sec.subjects.map(s => s.toUpperCase()).includes(activeSubject?.toUpperCase())
      );
      const isSameSection = currentSection?.subjects?.map(s => s.toUpperCase()).includes(subject.toUpperCase());
      
      if (isSameSection) {
        setActiveSubject(subject);
      } else {
        onSubjectSwitchAttempt?.(subject);
      }
    } else if (timeConfig?.isSubjectWiseMode) {
      onSubjectSwitchAttempt?.(subject);
    } else if (timeConfig?.type === 'overall') {
      setActiveSubject(subject);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex flex-col h-full items-center justify-center dark:bg-gray-800">
        <div className="text-gray-600 dark:text-gray-300">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      {/* Header Section */}
      <div className="w-full border-b border-gray-300 dark:border-gray-700 px-4 py-2.5 flex items-center justify-between bg-white dark:bg-gray-800 relative z-20">
        <div 
          className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none flex-1 mr-2 py-0.5 min-w-0"
          style={{ touchAction: "pan-x", WebkitOverflowScrolling: "touch" }}
        >
          <span className="font-bold dark:text-white whitespace-nowrap uppercase tracking-wider text-xs sm:text-sm flex-shrink-0">Sections |</span>
          {timeConfig?.type === 'sectional' ? (
            timeConfig.sections?.map((section, index) => {
              const sectionName = `SECTION-${index + 1}`;
              const isActiveSection = section.subjects?.map(s => s.toUpperCase()).includes(activeSubject?.toUpperCase());
              const isSectionSubmitted = section.subjects?.length > 0 && section.subjects.every(s => submittedSubjects.includes(s.toUpperCase()));

              return (
                <div key={sectionName} className="relative group inline-block flex-shrink-0">
                  <button
                    tabIndex="0"
                    disabled={isSectionSubmitted && !isActiveSection}
                    className={`px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap transition-colors ${isActiveSection
                      ? "bg-green-900 text-white font-semibold"
                      : isSectionSubmitted
                        ? "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                        : "bg-gray-200 dark:bg-gray-700 dark:text-white cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                  >
                    {sectionName}
                    {isSectionSubmitted && " ✓"}
                  </button>
                  <div className="absolute left-0 mt-1 min-w-[12rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg hidden group-hover:block group-focus-within:block z-[60] py-1">
                    {section.subjects?.map((subject) => {
                      const isSubmitted = submittedSubjects.includes(subject.toUpperCase()) || submittedSubjects.includes(subject);
                      const isActive = activeSubject?.toUpperCase() === subject.toUpperCase();
                      const isClickable = !isSubmitted && !isActive && canSwitchSubject(subject);

                      return (
                        <div
                          key={subject}
                          onClick={() => {
                            if (isClickable || (isActiveSection && !isSubmitted && !isActive)) {
                               handleSubjectSwitch(subject);
                            } else if (!isActiveSection) {
                               onSubjectSwitchAttempt?.(subject);
                            }
                          }}
                          className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                            isActive
                              ? "bg-green-900 text-white cursor-default font-semibold"
                              : isSubmitted
                                ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : (isActiveSection || isClickable)
                                  ? "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          }`}
                        >
                          {subject}
                          {isSubmitted && " ✓"}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            subjects.map((subject) => {
              const isSubmitted = submittedSubjects.includes(subject);
              const isActive = activeSubject === subject;
              const isClickable = !isSubmitted && !isActive && canSwitchSubject(subject);

              return (
                <button
                  key={subject}
                  onClick={() => handleSubjectSwitch(subject)}
                  disabled={!isClickable && !isActive}
                  className={`px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${isActive
                    ? "bg-green-900 text-white font-semibold"
                    : isSubmitted
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                      : isClickable
                        ? "bg-gray-200 dark:bg-gray-700 dark:text-white cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                        : "bg-gray-200 dark:bg-gray-700 dark:text-white cursor-not-allowed"
                    }`}
                >
                  {subject}
                  {isSubmitted && " ✓"}
                </button>
              );
            })
          )}
        </div>
        {(timeConfig?.isSubjectWiseMode || timeConfig?.type === 'sectional') && !isNewAttempt && (
          <div className="flex items-center gap-1 flex-shrink-0 text-xs sm:text-sm">
            <span className="dark:text-white whitespace-nowrap">Section Time :</span>
            <span className="dark:text-white font-mono min-w-[40px] text-center whitespace-nowrap tabular-nums font-bold">
              {formatTime(mainTimer)}
            </span>
          </div>
        )}
      </div>

      {/* Question Number and Controls */}
      <div className="w-full border-b border-gray-300 dark:border-gray-700 px-4 py-2 flex flex-wrap justify-between items-center bg-white dark:bg-gray-800 text-sm gap-y-2">
        {/* Left: Question Number and Stats */}
        <div className="flex items-center gap-3">
          <h2 className="font-bold dark:text-white text-base">
            Q. {currentIndex + 1}
          </h2>
          <SaveReportActions 
            questionId={currentQuestion.id}
            quizType="old_ui"
            isSaved={savedQuestions.has(parseInt(currentQuestion.id))}
            isReported={reportedQuestions.has(parseInt(currentQuestion.id))}
            studentId={user?.id}
            onSaveToggle={(newState) => handleSaveSuccess(currentQuestion.id, newState)}
            onReportSuccess={() => handleReportSuccess(currentQuestion.id)}
            iconSize="16"
            containerClass="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800"
          />

          {isNewAttempt && showFeedback && (
            <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-600 pl-3">
              {/* Difficulty Stats */}
              {globalDifficulty[currentQuestion.id] && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase leading-none">Accuracy</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {Math.round((globalDifficulty[currentQuestion.id].correct / globalDifficulty[currentQuestion.id].total) * 100)}%
                  </span>
                </div>
              )}

              {/* Topper Time */}
              {topperTimes[currentQuestion.id] !== undefined && (
                <div className="flex flex-col border-l border-gray-200 dark:border-gray-700 pl-2 ml-1">
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase leading-none">Topper</span>
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">
                    {topperTimes[currentQuestion.id]}s
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions, Mark, Time, Language */}
        <div className="flex items-center gap-2 sm:gap-4 justify-end flex-1 ml-2">


          <div className="flex items-center gap-1.5">
            <span className="bg-green-600/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded text-[11px] font-bold border border-green-600/20">
              +{positiveMarking}
            </span>
            <span className="bg-red-600/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded text-[11px] font-bold border border-red-600/20">
              -{Math.abs(negativeMarking)}
            </span>
          </div>

          {!isNewAttempt && (
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0 min-w-[75px] justify-end">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Time:</span>
              <span className="text-xs font-black dark:text-white tabular-nums font-mono min-w-[50px] text-center">
                {formatTime(elapsedTime)}
              </span>
            </div>
          )}

          <select
            className="bg-transparent border-0 font-bold text-xs dark:text-gray-300 outline-none cursor-pointer hover:text-blue-500 transition-colors"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              navigate(`?lang=${e.target.value}`, { replace: true });
            }}
          >
            <option value="en">ENGLISH</option>
            <option value="hi">HINDI</option>
          </select>
        </div>
      </div>


      {/* Content and Question Area */}
      <div className={`flex flex-1 relative ${hasContent ? "flex-col md:flex-row overflow-hidden" : "flex-col overflow-y-auto"}`}>
        <WatermarkComponent text={user?.number} />
        {/* Passage Content */}
        {hasContent && (
          <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-300 dark:border-gray-700 overflow-y-auto p-4 bg-white dark:bg-gray-800 relative z-10 h-1/2 md:h-full">
            <div
              className="prose dark:prose-invert max-w-none text-sm"
              dangerouslySetInnerHTML={{
                __html:
                  language === "hi" && currentQuestion.content_hi
                    ? currentQuestion.content_hi
                    : currentQuestion.content,
              }}
            />
          </div>
        )}

        {/* Question */}
        <div
          className={`${hasContent ? "w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto" : "w-full"} p-4 bg-white dark:bg-gray-800 relative z-10`}
        >
          <div className="space-y-4 dark:text-white">
            <div
              className="break-words overflow-hidden"
              dangerouslySetInnerHTML={{
                __html:
                  language === "hi" && currentQuestion.question_hi
                    ? currentQuestion.question_hi
                    : currentQuestion.question,
              }}
            />

            {currentQuestion.question_image_url && (
              <div className="my-4 flex justify-center">
                <img
                  src={currentQuestion.question_image_url}
                  alt="Question image"
                  className="max-w-full h-auto max-h-96 rounded border border-gray-300 dark:border-gray-600"
                  onError={(e) => {
                    e.target.style.display = "none";
                    console.error("Failed to load question image");
                  }}
                />
              </div>
            )}

            {["a", "b", "c", "d", "e"].map((option) => {
              const optionContent = language === "hi" && currentQuestion[`option_${option}_hi`]
                ? currentQuestion[`option_${option}_hi`]
                : currentQuestion[`option_${option}`];

              if (!optionContent || optionContent.trim() === "" || optionContent === "<p><br></p>") return null;

              const isSelected = localSelectedOption === option;
              const isCorrect = option.toUpperCase() === currentQuestion.correct_option?.toUpperCase();
              const isOriginal = originalResponse?.selected_key?.toLowerCase() === option.toLowerCase();

              let containerClass = "flex items-start gap-2 p-2 rounded-lg transition-colors ";
              if (showFeedback) {
                if (isCorrect) {
                  containerClass += "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 ";
                } else if (isSelected) {
                  containerClass += "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 ";
                } else if (isOriginal) {
                  containerClass += "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 ";
                }
              }

              return (
                <div key={option} className={containerClass}>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="radio"
                      id={`option-${option}`}
                      name={`question${currentQuestion.id}`}
                      value={option}
                      checked={localSelectedOption === option}
                      onChange={() => !showFeedback && handleOptionSelect(option)}
                      disabled={showFeedback}
                      className="form-radio h-4 w-4 dark:bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                    {showFeedback && isCorrect && (
                      <span className="text-green-600 font-bold">✓</span>
                    )}
                    {showFeedback && !isCorrect && (isSelected || isOriginal) && (
                      <span className="text-red-600 font-bold">✕</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor={`option-${option}`}
                      className={`text-sm break-words overflow-hidden ${showFeedback && isCorrect ? "font-bold text-green-700 dark:text-green-400" : ""}`}
                      dangerouslySetInnerHTML={{
                        __html: optionContent,
                      }}
                    />
                    {showFeedback && isOriginal && (
                      <div className="text-[10px] mt-1 text-red-600 dark:text-red-400 font-medium">
                        {isCorrect && isSelected
                          ? "(Correct! This is also what you answered in original latest attempt)"
                          : "what you answered in original latest attempt"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {showFeedback && !originalResponse?.selected_key && (
              <div className="text-xs text-gray-500 italic mt-2">
                Original attempt: not answered
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 p-3 flex flex-wrap gap-2 justify-between">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors w-full sm:w-auto"
            onClick={handleReview}
          >
            Mark for Review & Next
          </button>
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded text-sm hover:bg-gray-500 transition-colors w-full sm:w-auto"
            onClick={handleClear}
          >
            Clear Response
          </button>
        </div>
        <button
          className={`${showFeedback ? "bg-green-600 hover:bg-green-700" : "bg-cyan-600 hover:bg-cyan-700"} text-white px-6 py-2 rounded text-sm transition-colors w-full sm:w-auto font-bold`}
          onClick={handleSave}
        >
          {showFeedback ? "Next" : "Save & Next"}
        </button>
      </div>
    </div>
  );
};

export default QuestionSection;
