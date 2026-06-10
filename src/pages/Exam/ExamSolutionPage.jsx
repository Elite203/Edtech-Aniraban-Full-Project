import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import VideoPlayer from "../../Youtube Player/youtube components/VideoPlayer";
import { FaArrowLeft, FaCheck, FaTimes, FaVideo, FaBookOpen, FaGlobe, FaExpand, FaCompress } from "react-icons/fa";

const ExamSolutionPage = () => {
  const { course_id, exam_set_id, set_number, question_index } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [record, setRecord] = useState(location.state?.record || null);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("english");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("student_user") || localStorage.getItem("user") || "{}");
        const userId = user.id || localStorage.getItem("user_id");

        if (!userId) {
          navigate("/login");
          return;
        }

        const apiBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
        const response = await axios.get(`${apiBaseUrl}api/TimeManagement/get_exam_result_data.php`, {
          params: {
            user_id: userId,
            course_id,
            exam_set_id,
            set_number
          },
        });

        if (response.data.status === "success" && Array.isArray(response.data.data)) {
          const records = response.data.data;
          setAllRecords(records);
          
          let targetIndex = parseInt(question_index);
          
          // If we came from bookmarks or another page with a record ID in state, find its actual index in this set
          if (location.state?.record?.id) {
            // Compare with question_id because 'id' in result data is the response ID
            const foundIndex = records.findIndex(r => 
              parseInt(r.question_id) === parseInt(location.state.record.id) || 
              parseInt(r.id) === parseInt(location.state.record.id)
            );
            if (foundIndex !== -1 && foundIndex !== targetIndex) {
              targetIndex = foundIndex;
              // Update the URL to the correct index for this question
              // We use a simplified path to avoid complex slug generation at this stage
              navigate(`/exam/solution/${course_id}/${exam_set_id}/${set_number}/${foundIndex}`, { 
                state: location.state,
                replace: true 
              });
            }
          }

          if (records[targetIndex]) {
            setRecord(records[targetIndex]);
          } else {
            setError("Question not found");
          }
        } else {
          setError("Solution not found");
        }
      } catch (err) {
        setError("Failed to load solution");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [course_id, exam_set_id, set_number, BASE_URL, navigate]);

  const prevIndexRef = useRef(question_index);

  useEffect(() => {
    if (allRecords.length > 0) {
      const currentIndex = parseInt(question_index);
      if (allRecords[currentIndex]) {
        setRecord(allRecords[currentIndex]);

        // Only scroll to top if the question index has actually changed
        // We compare against the ref which we update ONLY after scrolling
        if (prevIndexRef.current !== question_index) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          prevIndexRef.current = question_index;
        }
      }
    }
  }, [question_index, allRecords]);

  const videoId = getYoutubeId(record.youtube_link);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] dark:text-white">Loading solution...</div>;
  if (error || !record) return <div className="flex items-center justify-center min-h-[60vh] text-red-500">{error || "Solution not available"}</div>;

  function stripHtmlTags(html) {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  function getOptionHtml(key) {
    const field = language === "hindi" ? `option_${key}_hindi` : `option_${key}_english`;
    return record[field] || record[`option_${key}`] || "";
  }

  function getQuestionHtml() {
    return (language === "hindi" && record.question_hindi) ? record.question_hindi : (record.question_english || record.question || "");
  }

  function getPassageHtml() {
    return (language === "hindi" && record.passage_hindi) ? record.passage_hindi : (record.passage_english || record.passage || "");
  }

  function getSolutionHtml() {
    return (language === "hindi" && record.solution_hindi) ? record.solution_hindi : (record.solution_english || record.solution || record.detail || "");
  }

  function getYoutubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|live\/|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }


  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleNavigate = (newIndex) => {
    if (newIndex >= 0 && newIndex < allRecords.length) {
      const currentRecord = allRecords[newIndex];
      const slugify = (text) => {
        if (!text) return "question";
        return text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-").substring(0, 50);
      };

      const courseSlug = location.pathname.split('/')[6] || 'course';
      const setSlug = location.pathname.split('/')[7] || 'set';

      const getNewQuestionHtml = (q) => {
        return (language === "hindi" && q.question_hindi) ? q.question_hindi : (q.question_english || q.question || "");
      };

      const questionText = stripHtmlTags(getNewQuestionHtml(currentRecord)).trim() || "question";
      const questionSlug = slugify(questionText);
      const finalSlug = `question-${newIndex + 1}-${questionSlug}`;

      navigate(`/exam-solution/${course_id}/${exam_set_id}/${set_number}/${newIndex}/${courseSlug}/${setSlug}/${finalSlug}`, {
        state: { ...location.state, record: currentRecord }
      });
    }
  };

  return (
    <div ref={containerRef} className={`min-h-screen transition-colors ${isFullscreen ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-900'}`}>
      <div className={`${isFullscreen ? 'w-full p-4 md:p-8' : 'max-w-[1600px] mx-auto px-4 py-6 md:py-8'}`}>
        {/* Unified Header Row */}
        <div className="flex flex-row items-center justify-between bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 gap-2 md:gap-4 sticky top-0 z-50">
          {/* Left: Back Button */}
          <button
            onClick={() => navigate(`/exam/result/${course_id}/${exam_set_id}/${set_number}`)}
            className="flex items-center gap-1.5 md:gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors text-sm md:text-base whitespace-nowrap"
          >
            <FaArrowLeft className="text-xs md:text-sm" />
            <span className="hidden sm:inline">Back to Results</span>
            <span className="sm:hidden">Back</span>
          </button>

          {/* Middle: Set Name */}
          <h1 className="text-sm md:text-base lg:text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider truncate max-w-[150px] sm:max-w-[300px] md:max-w-none text-center flex-1">
            {record.set_name || record.exam_name || `Set ${set_number}`}
          </h1>

          {/* Right: Controls (Language + Fullscreen) */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Language Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700 items-center">
              <FaGlobe className="text-gray-400 mx-1.5 hidden md:block" />
              <div className="flex">
                {["english", "hindi"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2.5 md:px-4 py-1 rounded-md text-[10px] md:text-xs font-black uppercase transition-all ${language === lang
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-blue-600"
                      }`}
                  >
                    {lang === "english" ? "ENGLISH" : "HINDI"}
                  </button>
                ))}
              </div>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 md:p-2.5 bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Question & Options (Scrollable) */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col h-full lg:max-h-[800px]">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b dark:border-gray-700 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigate(parseInt(question_index) - 1)}
                  disabled={parseInt(question_index) <= 0}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${parseInt(question_index) <= 0 ? 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white'}`}
                  title="Previous Question"
                >
                  Prev
                </button>

                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Q. {parseInt(question_index) + 1}
                </span>

                <button
                  onClick={() => handleNavigate(parseInt(question_index) + 1)}
                  disabled={parseInt(question_index) >= allRecords.length - 1}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${parseInt(question_index) >= allRecords.length - 1 ? 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white'}`}
                  title="Next Question"
                >
                  Next
                </button>

                <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium ml-1">
                  {record.subject || "Question Detail"}
                </span>
              </div>
              {record.selected_key && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${record.is_correct == 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {record.is_correct == 1 ? <><FaCheck /> Correct</> : <><FaTimes /> Incorrect</>}
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 overflow-y-auto flex-grow custom-scrollbar space-y-6">
              {getPassageHtml() && stripHtmlTags(getPassageHtml()).trim() !== "" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                  <h4 className="text-blue-800 dark:text-blue-300 font-bold mb-2 flex items-center gap-2">
                    <FaBookOpen /> Passage
                  </h4>
                  <div
                    className="text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: getPassageHtml() }}
                  />
                </div>
              )}

              <div className="space-y-4">
                <div
                  className="text-xl font-bold text-gray-900 dark:text-white leading-tight prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: getQuestionHtml() }}
                />
                {(record.question_image || record.question_img) && (
                  <div className="max-w-full bg-white p-2 rounded-lg border dark:border-gray-700">
                    <img
                      src={record.question_img || `data:${record.question_image_type || 'image/png'};base64,${record.question_image}`}
                      alt="Question"
                      className="w-full h-auto rounded"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {["a", "b", "c", "d", "e"].map((key) => {
                  const optionText = getOptionHtml(key);
                  const optionImgField = record[`option_${key}_img`];
                  const optionBlobField = record[`option_${key}_image`];

                  if (!optionText && !optionImgField && !optionBlobField) return null;

                  const isUser = record.selected_key?.toLowerCase() === key;
                  const isCorrect = (record.correct_option || record.correct_key)?.toLowerCase() === key;

                  let borderClass = "border-gray-200 dark:border-gray-700";
                  let bgClass = "bg-white dark:bg-gray-800";
                  if (isCorrect) {
                    borderClass = "border-green-500 ring-1 ring-green-500";
                    bgClass = "bg-green-50 dark:bg-green-900/20";
                  } else if (isUser && !isCorrect) {
                    borderClass = "border-red-500 ring-1 ring-red-500";
                    bgClass = "bg-red-50 dark:bg-red-900/20";
                  }

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-xl border-2 transition-all flex items-start gap-3 ${borderClass} ${bgClass}`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold uppercase flex-shrink-0 text-sm ${isCorrect ? 'bg-green-500 text-white' : isUser ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                        {key}
                      </span>
                      <div className="flex-grow overflow-hidden">
                        <div
                          className="text-gray-800 dark:text-gray-200 prose dark:prose-invert max-w-none break-words text-sm md:text-base"
                          dangerouslySetInnerHTML={{ __html: optionText }}
                        />
                        {(optionImgField || optionBlobField) && (
                          <img
                            src={optionImgField || `data:${record[`option_${key}_image_type`] || 'image/png'};base64,${optionBlobField}`}
                            className="mt-2 max-w-full h-auto rounded border dark:border-gray-600 bg-white"
                            alt={`Option ${key}`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Video Solution */}
          <div className="lg:col-span-8 space-y-4 lg:sticky lg:top-8">
            {videoId ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 p-4 md:p-6">
                <h3 className="text-xl font-black text-red-600 dark:text-red-500 flex items-center gap-2 uppercase tracking-tight mb-4">
                  <FaVideo /> Video Explanation
                </h3>
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border-2 border-gray-100 dark:border-gray-700">
                  <VideoPlayer videoId={videoId} />
                </div>
                <p className="mt-4 text-red-600 dark:text-red-500 text-sm md:text-base leading-relaxed">
                  Note: On desktop, questions with their respective options are already shown on the left side. On mobile, they appear at the top, <span className="font-bold">so they are not repeated in this video.For long descriptive/passage based question click “next” icon shown on top just after question number to change next question, scroll down to view it. FOR BETTER UNDERSTANDING : Just PAUSE the video to read them again side by side by your own & then PLAY it to see the detailed explanation.</span>
                </p>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                <FaVideo className="text-4xl text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No video explanation available for this question.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Detailed Solution */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="bg-blue-600/5 dark:bg-blue-600/10 p-6 md:p-10">
              <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-6 flex items-center justify-center gap-2 uppercase tracking-tight">
                Detailed Solution
              </h3>
              <div
                className="text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none text-lg"
                dangerouslySetInnerHTML={{ __html: getSolutionHtml() || "No detailed solution available." }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExamSolutionPage;
