import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import WatermarkComponent from "../../components/NewUI/WatermarkComponent";
import FullscreenViolation from "../../components/NewUI/FullScreenViolation";
import { useStudentProfile } from "../../components/NewUI/StudentProfileData";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ExamStartPage = () => {
  const { course_id, exam_set_id, set_number } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fullscreenExitedRef = useRef(false);
  const { user: profileUser } = useStudentProfile();
  const queryParams = new URLSearchParams(location.search);
  const isNewAttempt = queryParams.get("new_attempt") === "true";

  const [courseTitle, setCourseTitle] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [setName, setSetName] = useState("");
  const [user, setUser] = useState({ name: "", image: "" });
  const [language, setLanguage] = useState("english");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [instructions, setInstructions] = useState({
    test_duration: "",
    total_marks: "",
    instruction_two_english: "",
    instruction_two_hindi: "",
    red_warning_english: "",
    red_warning_hindi: "",
    declaration_english: "",
    declaration_hindi: ""
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [renderReady, setRenderReady] = useState(false);
  const [error, setError] = useState(null);
  const [isViolationVisible, setIsViolationVisible] = useState(false);

  // Mobile responsive handler
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check authentication & initialize component
  useEffect(() => {
    console.log('🔐 ExamStartPage: Starting authentication check');
    const storedUser = JSON.parse(localStorage.getItem("student_user") || localStorage.getItem("user") || "null");
    if (!storedUser) {
      console.log('❌ ExamStartPage: No stored user found');
      setIsAuthenticated(false);
    } else {
      console.log('✅ ExamStartPage: User authenticated:', storedUser.name || storedUser.full_name || `${storedUser.first_name || ""} ${storedUser.last_name || ""}`.trim());
      setIsAuthenticated(true);
      setUser({
        name: storedUser.name || storedUser.full_name || `${storedUser.first_name || ""} ${storedUser.last_name || ""}`.trim() || "Guest",
        image: storedUser.image || storedUser.profile_image || `${BASE_URL}api/Students/get_student_photo.php?id=${storedUser.id}`
      });
    }
    setLoading(false);

    // Set render ready after a brief delay to ensure DOM is stable
    setTimeout(() => {
      console.log('✅ ExamStartPage: Component ready for rendering');
      setRenderReady(true);
    }, 100);
  }, []);

  // Fetch course title
  useEffect(() => {
    if (!course_id) return;
    console.log('📚 ExamStartPage: Fetching course title for ID:', course_id);
    fetch(`${BASE_URL}api/Courses/get_courses.php`)
      .then((res) => res.json())
      .then((data) => {
        console.log('📚 ExamStartPage: Course API response:', data);
        if (data.success && data.courses && Array.isArray(data.courses)) {
          const matched = data.courses.find(
            (course) => parseInt(course.id) === parseInt(course_id)
          );
          if (matched?.title) {
            console.log('✅ ExamStartPage: Course title found:', matched.title);
            setCourseTitle(matched.title);
          }
        }
      })
      .catch((err) => console.error("❌ ExamStartPage: Error fetching course:", err));
  }, [course_id]);

  // Fetch exam title and set name
  useEffect(() => {
    if (!course_id || !exam_set_id) return;
    console.log('📋 ExamStartPage: Fetching exam title for course:', course_id, 'exam_set:', exam_set_id);

    fetch(`${BASE_URL}api/Exams/get_exam_sets.php?course_id=${course_id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('📋 ExamStartPage: Exam sets API response:', data);

        if (data.success && data.exam_sets && Array.isArray(data.exam_sets)) {
          const matched = data.exam_sets.find(set => parseInt(set.id) === parseInt(exam_set_id));
          if (matched && matched.exam_name) {
            console.log('✅ ExamStartPage: Exam title found:', matched.exam_name);
            setExamTitle(matched.exam_name);
            if (matched.set_name) {
              console.log('✅ ExamStartPage: Set name found:', matched.set_name);
              setSetName(matched.set_name);
            }
          }
        } else if (data.success && data.exam_sets && typeof data.exam_sets === 'object') {
          // Handle legacy format if needed
          let matched = null;
          Object.values(data.exam_sets).forEach((setGroup) => {
            if (parseInt(setGroup.exam_set_id || setGroup.id) === parseInt(exam_set_id)) {
              matched = setGroup.exam_name || setGroup.exam_title;
            }
          });
          if (matched) {
            console.log('✅ ExamStartPage: Exam title found (legacy):', matched);
            setExamTitle(matched);
          }
        }
      })
      .catch((err) => console.error("❌ ExamStartPage: Error fetching exam:", err));
  }, [course_id, exam_set_id]);

  // Fetch instructions_two for specific exam set
  useEffect(() => {
    if (!exam_set_id) {
      console.log('⚠️ ExamStartPage: No exam_set_id provided');
      return;
    }

    console.log('📝 ExamStartPage: Fetching instructions_two for exam_set_id:', exam_set_id);

    fetch(`${BASE_URL}api/Instructions/get_instructions_two.php?exam_set_id=${exam_set_id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('📝 ExamStartPage: Instructions Two API response:', data);
        if (data.success && data.data) {
          console.log('✅ ExamStartPage: Instructions Two loaded successfully');
          setInstructions({
            test_duration: data.data.test_duration || "20",
            total_marks: data.data.total_marks || "50",
            instruction_two_english: data.data.instruction_two_english || "",
            instruction_two_hindi: data.data.instruction_two_hindi || "",
            red_warning_english: data.data.red_warning_english || "",
            red_warning_hindi: data.data.red_warning_hindi || "",
            declaration_english: data.data.declaration_english || "",
            declaration_hindi: data.data.declaration_hindi || ""
          });
        } else {
          console.log('⚠️ ExamStartPage: No instructions found for exam set');
        }
      })
      .catch((err) => {
        console.error("❌ ExamStartPage: Error fetching instructions two:", err);
        setError("Failed to load exam instructions");
      });
  }, [exam_set_id]);

  // Fullscreen on mount and cleanup on unmount - only after component is ready
  useEffect(() => {
    if (!renderReady || !isAuthenticated) {
      console.log('🎯 ExamStartPage: Waiting for component to be ready:', { renderReady, isAuthenticated });
      return;
    }

    console.log('🎯 ExamStartPage: Fullscreen effect triggered - component is ready');
    let timeoutId;
    let fullscreenActive = false;

    const enterFullscreen = async () => {
      try {
        console.log('🎯 ExamStartPage: Checking fullscreen status');
        console.log('🎯 ExamStartPage: Current fullscreen element:', document.fullscreenElement);
        console.log('🎯 ExamStartPage: Document visibility:', document.visibilityState);

        if (!document.fullscreenElement && !fullscreenActive && document.visibilityState === 'visible') {
          console.log('🎯 ExamStartPage: Entering fullscreen mode...');
          fullscreenActive = true;

          timeoutId = setTimeout(async () => {
            try {
              await document.documentElement.requestFullscreen();
              console.log('✅ ExamStartPage: Successfully entered fullscreen');
            } catch (error) {
              console.warn('❌ ExamStartPage: Fullscreen request failed:', error);
              fullscreenActive = false;
            }
          }, 500);
        } else {
          console.log('🎯 ExamStartPage: Skipping fullscreen - conditions not met');
        }
      } catch (error) {
        console.warn('❌ ExamStartPage: Fullscreen not supported:', error);
        fullscreenActive = false;
      }
    };

    const mountTimer = setTimeout(() => {
      console.log('🎯 ExamStartPage: Component fully mounted, attempting fullscreen');
      enterFullscreen();
    }, 800);

    // Cleanup function - maintain fullscreen during navigation between exam pages
    return () => {
      console.log('🎯 ExamStartPage: Component unmounting, cleaning up');

      if (timeoutId) {
        clearTimeout(timeoutId);
        console.log('🎯 ExamStartPage: Cleared fullscreen timeout');
      }

      if (mountTimer) {
        clearTimeout(mountTimer);
        console.log('🎯 ExamStartPage: Cleared mount timer');
      }

      fullscreenActive = false;
    };
  }, [renderReady, isAuthenticated]);

  useEffect(() => {
    if (isNewAttempt) return;
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement) {
        setIsViolationVisible(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsViolationVisible(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isNewAttempt]);

  const handleReturnToExam = async () => {
    try {
      const element = document.documentElement;
      if (!document.fullscreenElement) {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }
      }
      setIsViolationVisible(false);
    } catch (err) {
      console.warn("Failed to re-enter fullscreen:", err);
      setIsViolationVisible(false);
    }
  };

  const handleStart = () => {
    console.log('▶️ ExamStartPage: Start button clicked');
    if (agreed && selectedLanguage) {
      console.log('✅ ExamStartPage: All conditions met, saving language:', selectedLanguage);
      localStorage.setItem("selected_language", selectedLanguage);
      const queryParams = new URLSearchParams(location.search);
      const isNewAttempt = queryParams.get("new_attempt") === "true";
      const nextUrl = `/exam/question/${course_id}/${exam_set_id}/${set_number}?lang=${selectedLanguage}${isNewAttempt ? '&new_attempt=true' : ''}`;
      navigate(nextUrl, { state: location.state });
    } else {
      console.log('❌ ExamStartPage: Start conditions not met - agreed:', agreed, ', selectedLanguage:', selectedLanguage);
    }
  };

  const handleGoBack = () => {
    console.log('🔙 ExamStartPage: Go back button clicked');
    navigate(-1);
  };

  // Show loading state
  if (loading || !renderReady) {
    console.log('🔄 ExamStartPage: Showing loading state:', { loading, renderReady });
    return (
      <div className="h-screen w-full bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-800 dark:text-white text-lg">
          Loading...
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="h-screen w-full bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-center border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-800 dark:text-gray-200 mb-6">
            Please log in to access the exam.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="h-screen flex flex-col max-w-[100%] mx-auto bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
        <FullscreenViolation isVisible={isViolationVisible} onReturn={handleReturnToExam} />

        <WatermarkComponent text={profileUser?.number} />

        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-1 dark:border-gray-700 flex-shrink-0">
          <img src={`/img/logo.webp`} alt="Logo" className="w-10 h-10 sm:w-14 sm:h-14" />
          <div className="text-center flex-1 -ml-14 sm:-ml-16">
            <h1 className="text-blue-700 dark:text-blue-400 font-bold text-base sm:text-lg md:text-xl uppercase">
              {setName || `SET ${set_number}`}
            </h1>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center space-x-2">
            <span
              className={`text-sm cursor-pointer ${language === 'english' ? 'font-bold text-blue-600' : 'text-gray-500'}`}
              onClick={() => setLanguage('english')}
            >
              English
            </span>
            <span className="text-gray-400">|</span>
            <span
              className={`text-sm cursor-pointer ${language === 'hindi' ? 'font-bold text-blue-600' : 'text-gray-500'}`}
              onClick={() => setLanguage('hindi')}
            >
              हिंदी
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left Side */}
          <div className="flex-1 flex flex-col px-4 py-3 overflow-hidden gap-4 min-h-0">
            <div className="flex justify-between text-sm font-medium flex-shrink-0">
              <span>
                Duration: <strong>{instructions.test_duration} Mins</strong>
              </span>
              <span>
                Maximum Marks: <strong>{instructions.total_marks}</strong>
              </span>
            </div>

            {/* Instructions */}
            <div
              className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed min-h-0"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#999 #f0f0f0'
              }}
              dangerouslySetInnerHTML={{
                __html: language === 'english'
                  ? instructions.instruction_two_english
                  : instructions.instruction_two_hindi || instructions.instruction_two_english
              }}
            />

            {/* Bottom Section */}
            <div className="border-t dark:border-gray-700 -pt-10 flex-shrink-0">
              {/* Left Side - Vertical Stack: Language, Warning, Declaration */}
              <div className="flex flex-col gap-1 flex-shrink-0">

                {/* Language Selection */}
                <div className="flex items-center gap-2">
                  <label className="font-medium text-xs whitespace-nowrap">Choose your default language:</label>
                  <select
                    className="border px-2 py-1 rounded text-xs w-24 dark:bg-gray-800 dark:border-gray-600"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>

                {/* Warning */}
                <p className="text-red-500 text-xs mb-2">
                  {language === 'english'
                    ? instructions.red_warning_english
                    : instructions.red_warning_hindi || instructions.red_warning_english}
                </p>

                <p className="text-xs whitespace-nowrap font-bold">
                  Decleration:
                </p>

                {/* Checkbox */}
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <span className="text-[13px] leading-tight">
                    {language === 'english'
                      ? instructions.declaration_english
                      : instructions.declaration_hindi || instructions.declaration_english}
                  </span>
                </label>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex items-center justify-center gap-4 mt-auto pt-2 flex-shrink-0 relative">
              <button
                onClick={handleGoBack}
                className="absolute left-0 text-blue-700 dark:text-blue-400 hover:underline text-sm whitespace-nowrap"
              >
                &larr; Previous
              </button>
              <button
                onClick={handleStart}
                disabled={!agreed || !selectedLanguage}
                className={`px-6 py-2 rounded text-white transition-all text-sm
                  ${!agreed || !selectedLanguage
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {language === 'english' ? 'I am ready to begin' : 'मैं शुरू करने के लिए तैयार हूँ'}
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-48 bg-blue-100 dark:bg-blue-950 border-l dark:border-gray-700 flex flex-col items-center justify-center p-4 flex-shrink-0">
            <div className="border-3 border-white p-1 rounded-full shadow">
              <img
                src={user.image}
                alt="User"
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/img/pfp.jpg';
                }}
              />
            </div>
            <p className="text-sm font-semibold text-center mt-2 text-blue-900 dark:text-blue-300">
              {user.name}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="h-screen flex flex-col max-w-[100%] mx-auto bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <FullscreenViolation isVisible={isViolationVisible} onReturn={handleReturnToExam} />

      <WatermarkComponent text={profileUser?.number} />

      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-700 flex-shrink-0">
        <img src={`/img/logo.webp`} alt="Logo" className="w-12 h-12" />
        <div className="text-center flex-1 -ml-0">
          <h1 className="text-blue-700 dark:text-blue-400 font-bold text-sm uppercase">
            SET {set_number}
          </h1>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs cursor-pointer ${language === 'english' ? 'font-bold text-blue-600' : 'text-gray-500'}`}
            onClick={() => setLanguage('english')}
          >
            EN
          </span>
          <span className="text-gray-400">|</span>
          <span
            className={`text-xs cursor-pointer ${language === 'hindi' ? 'font-bold text-blue-600' : 'text-gray-500'}`}
            onClick={() => setLanguage('hindi')}
          >
            HI
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-h-0">
        {/* Top Section */}
        <div className="flex-1 flex flex-col px-4 py-4 overflow-hidden gap-4 min-h-0">
          <div className="flex justify-between text-sm font-medium flex-shrink-0">
            <span>Duration: <strong>{instructions.test_duration} Mins</strong></span>
            <span>Maximum Marks: <strong>{instructions.total_marks}</strong></span>
          </div>

          {/* Instructions */}
          <div
            className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed min-h-0"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#999 #f0f0f0'
            }}
            dangerouslySetInnerHTML={{
              __html: language === 'english'
                ? instructions.instruction_two_english
                : instructions.instruction_two_hindi || instructions.instruction_two_english
            }}
          />
        </div>

        {/* Bottom Section */}
        <div className="flex-shrink-0 flex flex-col px-4 pt-2 pb-6 border-t dark:border-gray-700">
          {/* Language Selection */}
          <div className="flex items-center gap-1 mb-2">
            <label className="font-medium text-xs whitespace-nowrap">Choose language:</label>
            <select
              className="border px-1 py-0.5 rounded text-xs w-20 dark:bg-gray-800 dark:border-gray-600"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="">-- Select --</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          {/* Warning */}
          <p className="text-xs text-red-500 mb-2">
            {language === 'english'
              ? instructions.red_warning_english
              : instructions.red_warning_hindi || instructions.red_warning_english}
          </p>

          {/* Vertical Stack: Declaration */}
          <div className="flex flex-col gap-2 mb-2 flex-shrink-0">
            {/* Checkbox */}
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 flex-shrink-0"
              />
              <span className="text-xs leading-tight">
                {language === 'english'
                  ? instructions.declaration_english
                  : instructions.declaration_hindi || instructions.declaration_english}
              </span>
            </label>
          </div>

          <div className="flex items-center justify-center gap-2 flex-shrink-0 relative mt-2">
            <button
              onClick={handleGoBack}
              className="absolute left-0 text-blue-700 dark:text-blue-400 hover:underline text-xs whitespace-nowrap"
            >
              &larr; Previous
            </button>
            <button
              onClick={handleStart}
              disabled={!agreed || !selectedLanguage}
              className={`px-4 py-1 rounded text-white text-xs font-medium
                ${!agreed || !selectedLanguage
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {language === 'english' ? 'Start Test' : 'टेस्ट शुरू करें'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamStartPage;