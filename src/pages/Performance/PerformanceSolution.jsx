import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PerformanceSolution = () => {
  const [records, setRecords] = useState([]);
  const [questions, setQuestions] = useState({});
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [language, setLanguage] = useState("english");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem("user_id"));
          const month = localStorage.getItem("month");
        const year = localStorage.getItem("year");

        const [resultRes, questionsRes] = await Promise.all([
          axios.get(`${BASE_URL}api/CurrentAffairs/get_exam_result_data.php`, {
            params: { user_id: userId,month:month,year:year},
          }),
          axios.get(`${BASE_URL}api/Questions/get_questions.php`),
        ]);

        if (resultRes.data.status !== "success") {
          throw new Error("No result data found");
        }

        if (!Array.isArray(resultRes.data.data)) {
          throw new Error("Invalid data format received");
        }

        const latestAttempts = {};
        resultRes.data.data.forEach((record) => {
          if (
            !latestAttempts[record.question_id] ||
            new Date(record.attempt_date) >
              new Date(latestAttempts[record.question_id].attempt_date)
          ) {
            latestAttempts[record.question_id] = record;
          }
        });

        setRecords(Object.values(latestAttempts));

        const questionMap = {};
        if (Array.isArray(questionsRes.data)) {
          questionsRes.data.forEach((q) => {
            if (q.id) questionMap[q.id] = q;
          });
        }
        setQuestions(questionMap);
      } catch (err) {
        setError(err.message || "Something went wrong while fetching data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [BASE_URL]);

  const toggleQuestion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleReattempt = () => {
    navigate("/monthly-test");
  };

  const getOptionText = (question, optNum, lang) => {
    if (!question) return "Option not available";
    const optionKey = String.fromCharCode(96 + optNum);
    const optionFormats = [
      `option${optNum}_${lang}`,
      `option_${optionKey}_${lang}`,
      `option${optNum}`,
      `option_${optionKey}`,
      `option${optionKey}`,
    ];
    for (const format of optionFormats) {
      if (question[format]) {
        return String(question[format]).replace(/<[^>]+>/g, "");
      }
    }
    return "Option not available";
  };

  const getQuestionText = (question) => {
    if (!question) return "Question not available";
    const text =
      language === "hindi" && question.question_hi
        ? question.question_hi
        : question.question;
    return String(text || "").replace(/<[^>]+>/g, "");
  };

  const cleanExplanation = (text) => {
    if (!text) return null;
    const cleaned = text.replace(/<\/?p>/g, "").trim(); // remove <p> tags
    return cleaned;
  };

  const filteredRecords = records.filter((record) => {
    if (filter === "ALL") return true;
    if (filter === "INCORRECT")
      return record.is_correct != 1 && record.selected_key;
    if (filter === "NOT ATTEMPT") return !record.selected_key;
    if (filter === "CORRECT") return record.is_correct == 1;
    return true;
  });

  if (loading)
    return (
      <div className="text-center mt-20 dark:text-white">Loading results...</div>
    );
  if (error)
    return (
      <div className="text-center mt-20 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  if (records.length === 0)
    return (
      <div className="text-center mt-20 dark:text-white">No records found</div>
    );

  return (
    <div className="mt-4 sm:mt-8 max-w-6xl mx-auto px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
        <h3 className="text-lg font-semibold dark:text-white">
          Question-wise Analysis
        </h3>
      </div>

      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {["ALL", "INCORRECT", "NOT ATTEMPT", "CORRECT"].map((label) => (
              <button
                key={label}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm ${
                  filter === label
                    ? "bg-black dark:bg-gray-700 text-white"
                    : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
                }`}
                onClick={() => setFilter(label)}
              >
                {label.replace("_", " ")}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReattempt}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm"
            >
              Reattempt Test
            </button>
            <select
              className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm w-24"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto text-sm sm:text-base">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-2 px-2 border dark:border-gray-600 text-xs sm:text-sm dark:text-gray-300">
                Q.No
              </th>
              <th className="py-2 px-2 border dark:border-gray-600 text-xs sm:text-sm dark:text-gray-300">
                Question
              </th>
              <th className="py-2 px-2 border dark:border-gray-600 text-xs sm:text-sm dark:text-gray-300">
                Your Answer
              </th>
              <th className="py-2 px-2 border dark:border-gray-600 text-xs sm:text-sm dark:text-gray-300">
                Result
              </th>
              <th className="py-2 px-2 border dark:border-gray-600 text-xs sm:text-sm dark:text-gray-300">
                Difficulty Level
              </th>
              <th className="py-2 px-2 border dark:border-gray-600 text-xs sm:text-sm dark:text-gray-300">
                Your Time
              </th>
              <th className="py-2 px-2 border dark:border-gray-600 text-xs sm:text-sm dark:text-gray-300">
                Topper Time
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record, index) => {
              const question = questions[record.question_id];
              const isExpanded = expandedQuestion === index;
              const isCorrect = record.is_correct == 1;
              const yourAnswer = record.selected_key?.toLowerCase();
              const correctAnswer = record.correct_option?.toLowerCase();

              let correctness = "0%";
              if (
                record.correct_attempts !== undefined &&
                record.total_attempts !== undefined &&
                record.total_attempts > 0
              ) {
                correctness = `${Math.round(
                  (record.correct_attempts / record.total_attempts) * 100
                )}%`;
              }

              return (
                <React.Fragment key={index}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-2 px-2 border dark:border-gray-600 text-center">
                      {index + 1}
                    </td>
                    <td className="py-2 px-2 border dark:border-gray-600">
                      <button
                        onClick={() => toggleQuestion(index)}
                        className="text-left hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {question
                          ? getQuestionText(question).length >
                            (window.innerWidth < 640 ? 20 : 50)
                            ? getQuestionText(question).substring(
                                0,
                                window.innerWidth < 640 ? 20 : 50
                              ) + "..."
                            : getQuestionText(question)
                          : "Loading..."}
                      </button>
                    </td>
                    <td className="py-2 px-2 border dark:border-gray-600 text-center">
                      {yourAnswer ? yourAnswer.toUpperCase() : "N/A"}
                    </td>
                    <td className="py-2 px-2 border dark:border-gray-600 text-center">
                      <span
                        className={`inline-block w-full py-1 px-2 rounded ${
                          isCorrect
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        }`}
                      >
                        {yourAnswer
                          ? isCorrect
                            ? "Correct"
                            : "Incorrect"
                          : "-"}
                      </span>
                    </td>
                    <td className="py-2 px-2 border dark:border-gray-600 text-center">
                      {correctness}
                    </td>
                    <td className="py-2 px-2 border dark:border-gray-600 text-center">
                      {record.time_spent || 0}s
                    </td>
                    <td className="py-2 px-2 border dark:border-gray-600 text-center">
                      {record.topper_time || 0}s
                    </td>
                  </tr>

                  {isExpanded && question && (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-2 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600"
                      >
                        <div className="space-y-2">
                          <div className="font-semibold">
                            {getQuestionText(question)}
                          </div>
                          <div className="space-y-1">
                            {["a", "b", "c", "d"].map((key) => {
                              const isUser = key === yourAnswer;
                              const isCorrectOpt = key === correctAnswer;
                              let textClass =
                                "text-gray-800 dark:text-gray-300";
                              if (isCorrectOpt)
                                textClass =
                                  "text-green-600 dark:text-green-400 font-semibold";
                              else if (isUser && !isCorrectOpt)
                                textClass =
                                  "text-red-600 dark:text-red-400";
                              const optionText = getOptionText(
                                question,
                                key.charCodeAt(0) - 96,
                                language
                              );
                              return (
                                <div
                                  key={key}
                                  className={`${textClass} flex items-start`}
                                >
                                  <span className="font-bold uppercase mr-2">
                                    {key}.
                                  </span>
                                  <div>
                                    <span>{optionText}</span>
                                    {isUser && (
                                      <span className="ml-2 italic text-gray-500">
                                        (Your Answer)
                                      </span>
                                    )}
                                    {isCorrectOpt && !isUser && (
                                      <span className="ml-2 italic text-gray-500">
                                        (Correct Answer)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {cleanExplanation(question.explanation) && (
                            <div className="mt-2">
                              <button
                                onClick={() =>
                                  window.open(
                                    cleanExplanation(question.explanation),
                                    "_blank"
                                  )
                                }
                                className="text-blue-600 dark:text-blue-400 underline text-sm"
                              >
                                View Explanation
                              </button>
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
    </div>
  );
};

export default PerformanceSolution;
