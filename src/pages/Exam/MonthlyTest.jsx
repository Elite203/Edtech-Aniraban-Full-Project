import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const MonthlyTest = () => {
  const [questions, setQuestions] = useState([]);
  const [language, setLanguage] = useState("en");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState("");
  const [unanswered, setUnanswered] = useState([]);
  const [reviewed, setReviewed] = useState({});
  const [visited, setVisited] = useState(new Set());
  const [mainTimer, setMainTimer] = useState(1800);
  const [questionTimers, setQuestionTimers] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [user, setUser] = useState({ name: "", photo: "" });
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const lastFiveMinutesPlayed = useRef(false);
  const lastMinutePlayed = useRef(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Get selected year and month from location state
  const { year, month } = location.state || {};

  // UI counts
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = unanswered.length;
  const reviewedAnsweredCount = Object.values(reviewed).filter(
    (status) => status === "reviewedAnswered"
  ).length;
  const reviewedUnansweredCount = Object.values(reviewed).filter(
    (status) => status === "reviewedUnanswered"
  ).length;
  const notVisitedCount = questions.length - visited.size;
  const currentQuestion = questions[currentIndex];

  const mobileTopOffset = 64;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        navigate("/login");
        return;
      }
      const userData = JSON.parse(storedUser);
      setUser({
        name: userData.name || "Guest",
        photo: userData.image ? `${BASE_URL}${userData.image}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      });

      try {
        const mockQuestions = [
          {
            id: 1,
            language: "hindi",
            question_date: "2025-05-15", // Added question_date for filtering
            question:
              "Bihar emerged as the poorest state as per the first-ever Multi-dimensional Poverty (MPI) prepared by Niti Aayog and launched in November 2021.",
            question_hi:
              "बिहार नवंबर 2021 में नीति आयोग द्वारा तैयार और लॉन्च किए गए पहले बहु-आयामी गरीबी सूचकांक (MPI) के अनुसार सबसे गरीब राज्य के रूप में उभरा।",
            option1: "Bihar",
            option1_hi: "बिहार",
            option2: "Aliya Pradesh",
            option2_hi: "अलिया प्रदेश",
            option3: "Par Pradesh",
            option3_hi: "पर प्रदेश",
            option4: "None of these",
            option4_hi: "इनमें से कोई नहीं",
          },
        ];

        const response = await axios.get(`${BASE_URL}api/Questions/get_questions.php`);
        let fetchedQuestions = response?.data?.length ? response.data : mockQuestions;
        console.log("Fetched questions:", fetchedQuestions);

        // Filter questions based on selected year and month
        if (year && month) {
          const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          const selectedMonthIndex = months.indexOf(month);
          fetchedQuestions = fetchedQuestions.filter((q) => {
            const questionDate = new Date(q.question_date);
            return (
              !isNaN(questionDate.getTime()) &&
              questionDate.getFullYear().toString() === year &&
              months[questionDate.getMonth()] === month
            );
          });
          console.log("Filtered questions by year and month:", fetchedQuestions);
        }

        setQuestions(fetchedQuestions);
      } catch (err) {
        setError("Failed to load questions. Using mock data.");
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, year, month]);

  useEffect(() => {
    if (currentQuestion?.id) {
      setVisited((prev) => new Set(prev).add(currentQuestion.id));
    }
  }, [currentIndex, currentQuestion]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    const tryAutoFullscreen = () => {
      const elem = containerRef.current;
      if (elem?.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      }
    };
    
    const t = setTimeout(tryAutoFullscreen, 500);
    return () => {
      clearTimeout(t);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const toggleSidebar = () => setSidebarVisible((s) => !s);

  useEffect(() => {
    if (questions.length === 0 || mainTimer <= 0) return;
    const interval = setInterval(() => {
      setMainTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [questions, mainTimer]);

  useEffect(() => {
    if (mainTimer === 5 * 60 && !lastFiveMinutesPlayed.current) {
      playAudioAlert();
      lastFiveMinutesPlayed.current = true;
    } else if (mainTimer === 60 && !lastMinutePlayed.current) {
      playAudioAlert();
      lastMinutePlayed.current = true;
    }
  }, [mainTimer]);

  useEffect(() => {
    if (!currentQuestion) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setQuestionTimers((prev) => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1,
      }));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentIndex, currentQuestion]);

  useEffect(() => {
    if (!currentQuestion) return;
    setSelectedOption(answers[currentQuestion.id] || "");
  }, [currentIndex, currentQuestion, answers]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          if (next >= 2) setShowWarningModal(true);
          return next;
        });
      }
    };

    const preventCopy = (e) => e.preventDefault();
    const preventContext = (e) => e.preventDefault();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", preventCopy);
    document.addEventListener("cut", preventCopy);
    document.addEventListener("paste", preventCopy);
    document.addEventListener("contextmenu", preventContext);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("cut", preventCopy);
      document.removeEventListener("paste", preventCopy);
      document.removeEventListener("contextmenu", preventContext);
    };
  }, []);

  const playAudioAlert = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(
        "https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3"
      );
    }
    audioRef.current.play().catch(() => {});
  };

  const handleLanguageChange = (e) => setLanguage(e.target.value);
  const handleOptionChange = (e) => setSelectedOption(e.target.value);

  const handleSaveNext = () => {
    if (!currentQuestion) return;
    if (selectedOption) {
      setAnswers({ ...answers, [currentQuestion.id]: selectedOption });
      setUnanswered(unanswered.filter((id) => id !== currentQuestion.id));
      if (reviewed[currentQuestion.id]) {
        const newReviewed = { ...reviewed };
        delete newReviewed[currentQuestion.id];
        setReviewed(newReviewed);
      }
    } else {
      if (!unanswered.includes(currentQuestion.id)) setUnanswered([...unanswered, currentQuestion.id]);
      if (answers[currentQuestion.id]) {
        const newAnswers = { ...answers };
        delete newAnswers[currentQuestion.id];
        setAnswers(newAnswers);
      }
    }
    setSelectedOption("");
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleReviewNext = () => {
    if (!currentQuestion) return;
    const type = selectedOption ? "reviewedAnswered" : "reviewedUnanswered";
    setReviewed({ ...reviewed, [currentQuestion.id]: type });

    if (selectedOption) {
      //setAnswers({ ...answers, [currentQuestion.id]: selectedOption });
      setUnanswered(unanswered.filter((id) => id !== currentQuestion.id));
    } else {
      setUnanswered(unanswered.filter((id) => id !== currentQuestion.id));
      //if (!unanswered.includes(currentQuestion.id)) setUnanswered([...unanswered, currentQuestion.id]);
      if (answers[currentQuestion.id]) {
        const newAnswers = { ...answers };
        delete newAnswers[currentQuestion.id];
        setAnswers(newAnswers);
      }
    }
    setSelectedOption("");
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setSelectedOption("");
    if (answers[currentQuestion.id]) {
      const newAnswers = { ...answers };
      delete newAnswers[currentQuestion.id];
      setAnswers(newAnswers);
    }
    if (!unanswered.includes(currentQuestion.id)) setUnanswered([...unanswered, currentQuestion.id]);
    if (reviewed[currentQuestion.id]) {
      const newReviewed = { ...reviewed };
      delete newReviewed[currentQuestion.id];
      setReviewed(newReviewed);
    }
  };

  const handleFinalSubmit = () => {
    const userId = JSON.parse(localStorage.getItem("user"))?.id;
    if (!userId) {
      alert("User not logged in.");
      navigate("/login");
      return;
    }

    const submissionData = Object.entries(answers).map(([questionId, selected]) => {
      localStorage.setItem("month", month);
      localStorage.setItem("year", year);
      return {
        user_id: userId,
        question_id: questionId,
        selected_option: selected, // Now sends 'A', 'B', 'C', or 'D'
        time_spent: questionTimers[questionId] || 0,
        month: month,
        year: year,
      };
    });

    axios
      .post(`${BASE_URL}api/CurrentAffairs/save_answers.php`, { answers: submissionData })
      .then(() => {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
        }
        alert("Test submitted successfully!");
        setShowSubmitModal(false);
        navigate("/performance");
      })
      .catch(() => {
        alert("Failed to submit test.");
      });
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const CheckMark = () => (
    <svg viewBox="0 0 24 24" width="12" height="12" className="absolute top-0 right-0 bg-white text-green-500 rounded-full">
      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 dark:bg-gray-900">{error}</div>;
  if (questions.length === 0) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">No questions available</div>;

  const mobileSidebarStyle = {
    top: `${mobileTopOffset}px`,
    left: 0,
    right: 0,
    bottom: 0,
  };

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-white dark:bg-gray-900 flex flex-col" style={{ height: "100vh" }}>
      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" />

      {/* Header */}
      <div className="border-b border-gray-300 dark:border-gray-700 flex flex-wrap justify-between items-center px-4 py-3 flex-shrink-0">
        <div className="font-bold text-lg justify-between w-full sm:w-auto dark:text-white flex items-center">
          <span className="font-bold"></span>&nbsp;
          <span className="hidden sm:inline">
            {year && month ? `${month} ${year} - Current Affairs` : "Current Affairs"}
          </span>
          {isMobile && (
            <button onClick={toggleSidebar} className="ml-2 p-1 rounded-md bg-gray-200 dark:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0 justify-between w-full sm:justify-start sm:w-auto">
          <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded font-bold text-sm dark:text-white w-[135px] text-center">
            Time Left {formatTime(mainTimer)}
          </span>
         
          <button
            onClick={toggleFullscreen}
            className="hidden md:inline border rounded px-3 py-1 text-sm dark:text-white dark:border-gray-600"
          >
            {isFullscreen ? "Exit Full Screen" : "Switch Full Screen"}
          </button>

          <button
            onClick={toggleFullscreen}
            className="md:hidden p-2 border rounded dark:text-white dark:border-gray-600"
          >
            {isFullscreen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 3h6v2H5v4H3V3zm14 0v6h-2V5h-4V3h6zM3 17v-6h2v4h4v2H3zm14 0h-6v-2h4v-4h2v6z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 3h6v2H5v4H3V3zm14 0v6h-2V5h-4V3h6zM3 17v-6h2v4h4v2H3zm14 0h-6v-2h4v-4h2v6z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
      <button
  onClick={toggleSidebar}
  className={`absolute z-30 right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 dark:bg-gray-700 p-2 rounded-l-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 ${isMobile ? 'hidden' : ''}`}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 transform transition-transform duration-300 ${sidebarVisible ? 'rotate-180' : ''}`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
</button>


        <div className={`${isMobile && sidebarVisible ? "hidden" : "flex"} ${sidebarVisible ? "lg:w-3/4" : "w-full"} flex-col overflow-hidden transition-all duration-300`}>
          <div className="border-b border-gray-300 dark:border-gray-700 px-4 py-3 flex flex-wrap gap-2 items-center flex-shrink-0">
            <span className="font-medium dark:text-white">SECTIONS |</span>
            <button className="bg-green-900 text-white px-3 py-1 rounded text-xs sm:text-sm">General Awareness</button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 dark:bg-gray-800">
            {currentQuestion && (
              <>
                <div className="flex flex-wrap sm:flex-nowrap justify-between items-center mb-4 gap-1 sm:gap-3">
                  <h4 className="text-sm sm:text-lg font-semibold dark:text-white">
                    Q. {currentIndex + 1}
                  </h4>

                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <span className="dark:text-white hidden sm:inline">Mark</span>

                    <span className="bg-green-600 text-white px-1.5 py-0.5 rounded text-xs sm:text-sm font-medium">+3</span>
                    <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs sm:text-sm font-medium">-1</span>

                    <div className="w-[100px] sm:w-[80px] dark:text-white overflow-hidden">
                      <span>Time {formatTime(questionTimers[currentQuestion.id] || 0)}</span>
                    </div>

                    <div className="flex items-center">
                      <span className="mr-0.5 sm:mr-1 dark:text-white hidden sm:inline">View in</span>
                      <select
                        className="border rounded p-0.5 sm:p-1 text-xs sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        value={language}
                        onChange={handleLanguageChange}
                      >
                        <option value="en">English</option>
                        <option value="hindi">Hindi</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 dark:text-white">
                  <div className="text-sm sm:text-base leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: language === "hindi" && currentQuestion.question_hi ? currentQuestion.question_hi : currentQuestion.question,
                    }}
                  />
                  {["1", "2", "3", "4"].map((num) => {
                    const optionKey = `option${num}`;
                    const optionLetter = String.fromCharCode(64 + parseInt(num));
                    return (
                      <div key={num} className="flex items-start gap-2">
                        <input
                          type="radio"
                          id={`option${num}`}
                          name={`question${currentQuestion.id}`}
                          value={optionLetter}
                          checked={selectedOption === optionLetter}
                          onChange={handleOptionChange}
                          className="form-radio h-4 w-4 mt-1 dark:bg-gray-700"
                        />
                        <label
                          htmlFor={`option${num}`}
                          className="ml-2 text-sm sm:text-base"
                          dangerouslySetInnerHTML={{
                            __html:
                              language === "hindi" && currentQuestion[`${optionKey}_hi`]
                                ? currentQuestion[`${optionKey}_hi`]
                                : currentQuestion[optionKey],
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 p-3 flex flex-col sm:flex-row sm:justify-between gap-2 flex-shrink-0">
            <div className="space-x-0 sm:space-x-2 flex flex-col sm:flex-row gap-2">
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-xs sm:text-sm"
                onClick={handleReviewNext}
              >
                Mark for Review & Next
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 text-xs sm:text-sm"
                onClick={handleClearResponse}
              >
                Clear Response
              </button>
            </div>
            <div className="space-x-0 sm:space-x-2 flex flex-col sm:flex-row gap-2">
              <button
                className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 text-xs sm:text-sm"
                onClick={handleSaveNext}
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${sidebarVisible ? (isMobile ? "fixed z-40 w-full" : "w-full lg:w-1/4") : "w-0"}`}
          style={isMobile && sidebarVisible ? mobileSidebarStyle : {}}
        >
          {sidebarVisible && (
            <>
              <div className="p-4 overflow-y-auto flex-1">
                {isMobile && (
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold dark:text-white">Questions</h3>
                    <button onClick={toggleSidebar} className="p-1 rounded-md bg-gray-200 dark:bg-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="flex items-center mb-4">
                  <img src={user.photo} alt="Profile" className="w-10 h-10 rounded-full" />
                  <span className="font-bold ml-3 dark:text-white truncate">{user.name}</span>
                </div>

                <div className="bg-yellow-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-3 mb-4 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-white font-medium" style={{ backgroundImage: "url('/img/green.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>{answeredCount}</div>
                      </div>
                      <span className="dark:text-white">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-white font-medium" style={{ backgroundImage: "url('/img/red.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>{unansweredCount}</div>
                      </div>
                      <span className="dark:text-white">Not Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 relative">
                        <div className="absolute inset-0 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundImage: "url('/img/pur.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>{reviewedUnansweredCount}</div>
                      </div>
                      <span className="dark:text-white">Marked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded flex items-center justify-center">{notVisitedCount}</div>
                      <span className="dark:text-white">Not Visited</span>
                    </div>
                  </div>

                  <div className="flex items-center pt-2 gap-2">
                    <div className="h-9 w-9 relative">
                      <div className="absolute inset-0 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundImage: "url('/img/pur.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        {reviewedAnsweredCount}
                        <span className="absolute top-0 right-0 text-xs bg-white text-green-600 rounded-full w-4 h-4 flex items-center justify-center">✓</span>
                      </div>
                    </div>
                    <span className="dark:text-white text-xs">Answered & Marked</span>
                  </div>
                </div>

                <div>
                  <span className="block mb-2 font-bold text-center py-2 rounded text-white" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', backgroundColor: '#008feeff' }}>
                    General Awareness
                  </span>

                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, i) => {
                      const isAnswered = answers[q.id];
                      const isUnanswered = unanswered.includes(q.id);
                      const isActive = i === currentIndex;
                      const reviewStatus = reviewed[q.id];
                      const isVisited = visited.has(q.id);

                      let baseClass = "w-8 h-8 text-sm flex items-center justify-center border rounded cursor-pointer relative";
                      let backgroundStyle = {};
                      if (isAnswered && !reviewStatus) {
                        baseClass += " text-white";
                        backgroundStyle = { backgroundImage: "url('/img/green.png')", backgroundSize: 'cover', backgroundPosition: 'center' };
                      } else if (isUnanswered && !reviewStatus) {
                        baseClass += " text-white";
                        backgroundStyle = { backgroundImage: "url('/img/red.png')", backgroundSize: 'cover', backgroundPosition: 'center' };
                      } else if (reviewStatus === "reviewedAnswered") {
                        baseClass += " rounded-full text-white border-purple-700";
                        backgroundStyle = { backgroundImage: "url('/img/pur.png')", backgroundSize: 'cover', backgroundPosition: 'center' };
                      } else if (reviewStatus === "reviewedUnanswered") {
                        baseClass += " rounded-full text-white border-blue-500";
                        backgroundStyle = { backgroundImage: "url('/img/pur.png')", backgroundSize: 'cover', backgroundPosition: 'center' };
                      } else if (isVisited) {
                        baseClass += " bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500";
                      } else {
                        baseClass += " bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600";
                      }

                      if (isActive) baseClass += " ring-4 ";

                      return (
                        <span key={i} className={baseClass} style={backgroundStyle} onClick={() => { setCurrentIndex(i); if (isMobile) setSidebarVisible(false); }}>
                          {i + 1}
                          {(isAnswered || reviewStatus === "reviewedAnswered") && <CheckMark />}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-gray-300 dark:border-gray-700 flex gap-2">
                <button className="bg-red-600 text-white w-full py-2 rounded hover:bg-red-700" onClick={() => setShowQuitModal(true)}>Quit Test</button>
                <button className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700" onClick={() => setShowSubmitModal(true)}>Submit Test</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 dark:text-white">
                Review test before submit
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border p-2 sm:p-3 text-left dark:text-white">Section name</th>
                      <th className="border p-2 sm:p-3 text-center dark:text-white">Questions</th>
                      <th className="border p-2 sm:p-3 text-center dark:text-white">Answered</th>
                      <th className="border p-2 sm:p-3 text-center dark:text-white">Not Answered</th>
                      <th className="border p-2 sm:p-3 text-center dark:text-white">Marked Ans</th>
                      <th className="border p-2 sm:p-3 text-center dark:text-white">Marked Review</th>
                      <th className="border p-2 sm:p-3 text-center dark:text-white">Visited</th>
                      <th className="border p-2 sm:p-3 text-center dark:text-white">Not Visited</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="dark:border-gray-600">
                      <td className="border p-2 sm:p-3 dark:text-white">General Awareness</td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{questions.length}</td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{answeredCount}</td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{unansweredCount}</td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{reviewedAnsweredCount}</td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{reviewedUnansweredCount}</td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{visited.size}</td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{notVisitedCount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-end mt-4 sm:mt-6 gap-2 sm:gap-4">
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 text-sm sm:text-base"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm sm:text-base"
                  onClick={handleFinalSubmit}
                >
                  SUBMIT TEST
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQuitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Confirm Quit Test</h3>
              <p className="mb-6 dark:text-gray-300">Are you sure you want to quit the test? All progress will be lost.</p>
              <div className="flex justify-end space-x-4">
                <button className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500" onClick={() => setShowQuitModal(false)}>Cancel</button>
                <button className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700" onClick={() => { 
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
                  }
                  localStorage.removeItem("examState"); 
                  navigate("/"); 
                }}>Quit Test</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Warning!</h3>
              <p className="mb-4 dark:text-gray-300">You have switched tabs/windows multiple times. This behavior is not allowed during the exam.</p>
              <p className="mb-6 font-semibold dark:text-gray-300">Further violations may result in automatic test submission.</p>
              <div className="flex justify-center">
                <button className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700" onClick={() => setShowWarningModal(false)}>I Understand</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyTest;