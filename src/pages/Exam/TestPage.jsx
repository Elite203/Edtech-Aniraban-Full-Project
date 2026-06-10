import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const TestPage = () => {
  const [questions, setQuestions] = useState([]);
  const [language, setLanguage] = useState("hindi");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState("");
  const [unanswered, setUnanswered] = useState([]);
  const [reviewed, setReviewed] = useState({});
  const [mainTimer, setMainTimer] = useState(1800);
  const [questionTimers, setQuestionTimers] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  useEffect(() => {
    axios.get(`${BASE_URL}api/Questions/get_questions.php`).then((res) => {
      setQuestions(res.data);
    });
  }, []);

  useEffect(() => {
    const enterFullscreen = () => {
      const elem = containerRef.current;
      if (elem && elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    };
    enterFullscreen();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    if (questions.length === 0) return;
    const interval = setInterval(() => {
      setMainTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          alert("Time's up! Submitting test.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [questions]);

  const filteredQuestions = questions.filter((q) => q.language === language);
  const currentQuestion = filteredQuestions[currentIndex];

  useEffect(() => {
    if (!currentQuestion) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setQuestionTimers((prev) => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1,
      }));
    }, 1000);
    return () => {
      clearInterval(timerRef.current);
    };
  }, [currentIndex, language]);

  useEffect(() => {
    if (!currentQuestion) return;
    setSelectedOption(answers[currentQuestion.id] || "");
  }, [currentIndex, language, currentQuestion]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setCurrentIndex(0);
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleSaveNext = () => {
    if (!currentQuestion) return;
    if (selectedOption) {
      setAnswers({ ...answers, [currentQuestion.id]: selectedOption });
      setUnanswered(unanswered.filter((id) => id !== currentQuestion.id));
    } else if (!unanswered.includes(currentQuestion.id)) {
      setUnanswered([...unanswered, currentQuestion.id]);
    }
    setSelectedOption("");
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReviewNext = () => {
    if (!currentQuestion) return;
    const type = selectedOption ? "reviewedAnswered" : "reviewedUnanswered";
    setReviewed({ ...reviewed, [currentQuestion.id]: type });

    setSelectedOption("");
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-white">
      <div className="border-b border-gray-300 flex flex-wrap justify-between items-center px-4 py-3">
        <div className="font-bold text-lg w-full sm:w-auto">
          <span className="font-bold">testbook</span> SSC CGL Tier 1 2025 Full Test - 01
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <span className="bg-gray-200 px-3 py-1 rounded font-bold text-sm">
            Time Left {formatTime(mainTimer)}
          </span>
          <button onClick={toggleFullscreen} className="border rounded px-3 py-1 text-sm">
            {isFullscreen ? "Exit Full Screen" : "Switch Full Screen"}
          </button>
          <button className="border rounded px-3 py-1 text-sm">Pause</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-3/4 w-full">
          <div className="border-b border-gray-300 px-4 py-3 flex flex-wrap gap-2 items-center">
            <span className="font-medium">SECTIONS |</span>
            <a href="#" className="bg-green-900 text-white px-3 py-1 rounded">
              General Awareness
            </a>
          </div>

          <div className="px-4 py-3">
            {currentQuestion && (
              <>
                <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                  <h4 className="text-lg font-semibold">Question No. {currentIndex + 1}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span>Mark</span>
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">2</span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">-0.5</span>
                    <span>Time {formatTime(questionTimers[currentQuestion.id] || 0)}</span>
                    <div>
                      <label className="mr-1">View in</label>
                      <select
                        className="border rounded p-1"
                        value={language}
                        onChange={handleLanguageChange}
                      >
                        <option value="english">English</option>
                        <option value="hindi">Hindi</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p>{currentQuestion.question}</p>
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`option${num}`}
                        name={`question${currentQuestion.id}`}
                        value={currentQuestion[`option${num}`]}
                        checked={selectedOption === currentQuestion[`option${num}`]}
                        onChange={handleOptionChange}
                        className="form-radio"
                      />
                      <label htmlFor={`option${num}`}>
                        {currentQuestion[`option${num}`]}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-between mt-6 gap-2">
                  <div className="space-x-2">
                    <button
                      className="bg-purple-600 text-white px-4 py-2 rounded"
                      onClick={handleReviewNext}
                    >
                      Mark for Review & Next
                    </button>
                    <button
                      className="bg-gray-400 text-white px-4 py-2 rounded"
                      onClick={() => setSelectedOption("")}
                    >
                      Clear Response
                    </button>
                  </div>
                  <button
                    className="bg-cyan-600 text-white px-4 py-2 rounded"
                    onClick={handleSaveNext}
                  >
                    Save & Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        <div
          className={`fixed top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300 ${
            sidebarVisible ? "right-[25%]" : "right-0"
          }`}
        >
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="bg-gray-700 text-white px-2 py-1 rounded-l"
          >
            {sidebarVisible ? "⮜" : "⮞"}
          </button>
        </div>

        {/* Sidebar Panel */}
        <div
          className={`bg-gray-100 h-screen transition-all duration-300 ease-in-out overflow-hidden ${
            sidebarVisible ? "lg:w-1/4 w-full p-4" : "w-0 p-0"
          }`}
        >
          {sidebarVisible && (
            <>
              <div className="flex items-center mb-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-bold ml-3">Student Name</span>
              </div>

              <div>
                <span className="block mb-2 font-semibold">SECTION : General Awareness</span>
                <div className="flex flex-wrap gap-2">
                  {filteredQuestions.map((q, i) => {
                    const isAnswered = answers[q.id];
                    const isUnanswered = unanswered.includes(q.id);
                    const isActive = i === currentIndex;
                    const reviewStatus = reviewed[q.id];

                    let baseClass =
                      "w-8 h-8 text-sm flex items-center justify-center border border-black text-black rounded-full cursor-pointer";
                    if (isAnswered) baseClass += " bg-green-500 text-white";
                    if (isUnanswered) baseClass += " bg-red-500 text-white";
                    if (reviewStatus === "reviewedUnanswered") baseClass += " bg-blue-500 text-white";
                    if (reviewStatus === "reviewedAnswered") baseClass += " bg-purple-600 text-white";
                    if (isActive) baseClass += " ring-4";

                    return (
                      <span
                        key={i}
                        className={baseClass}
                        onClick={() => setCurrentIndex(i)}
                      >
                        {i + 1}
                      </span>
                    );
                  })}
                </div>
              </div>

              <button className="mt-6 bg-green-600 text-white w-full py-2 rounded">
                Submit Test
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
