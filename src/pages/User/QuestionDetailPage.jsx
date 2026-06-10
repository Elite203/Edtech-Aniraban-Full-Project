import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const QuestionDetailPage = () => {
  const { examId, resultId, setId, qindex } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("en"); // 'en' or 'hi'
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${BASE_URL}api/Questions/get_questions.php`, {
          params: {
            exam_id: examId,
            result_id: resultId,
            set_id: setId,
            question_index: qindex,
            user_id: 1 // Add a default user_id or get it from auth context
          }
        });

        if (response.data.status === "success") {
          setQuestion(response.data.data);
        } else {
          setError(response.data.message || "Question not found");
        }
      } catch (err) {
        setError("Failed to load question data. Please try again.");
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [examId, resultId, setId, qindex, BASE_URL]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "hi" : "en");
  };

  const getQuestionText = () => {
    if (!question) return "";
    return language === "hi" && question.question_hi 
      ? question.question_hi 
      : question.question;
  };

  const getDetailText = () => {
    if (!question) return "";
    return language === "hi" && question.detail_hi 
      ? question.detail_hi 
      : question.detail;
  };

  if (loading) {
    return (
      <div className="p-6 text-center dark:text-white">
        Loading question data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
        <button
          onClick={() => navigate(-1)}
          className="ml-4 px-4 py-2 bg-gray-300 rounded"
        >
          Back
        </button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-6 text-center text-red-600">
        No question data available
        <button
          onClick={() => navigate(-1)}
          className="ml-4 px-4 py-2 bg-gray-300 rounded"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">Details</h2>
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {language === "en" ? "हिंदी में देखें" : "View in English"}
        </button>
      </div>


      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded">
        <div
          className="text-gray-800 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: getDetailText() }}
        />
      </div>

      {question.explanation && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded">
          <h3 className="font-semibold mb-2 dark:text-white">Explanation:</h3>
          <div className="text-gray-800 dark:text-gray-300">
            {question.explanation}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
        >
          Back
        </button>
        
        {/* <div className="text-sm text-gray-600 dark:text-gray-400">
          {question.stats && (
            <span>
              Attempts: {question.stats.total_attempts} | 
              Correct: {question.stats.correct_attempts} | 
              Min Time: {question.stats.min_time}s
            </span>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default QuestionDetailPage;