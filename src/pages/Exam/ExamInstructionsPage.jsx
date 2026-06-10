import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import WatermarkComponent from "../../components/NewUI/WatermarkComponent";
import FullscreenViolation from "../../components/NewUI/FullScreenViolation";
import { useStudentProfile } from "../../components/NewUI/StudentProfileData";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ExamInstructionsPage = () => {
  const { course_id, exam_set_id, set_number } = useParams();
  const navigate = useNavigate();
  const fullscreenExitedRef = useRef(false);
  const { user: profileUser } = useStudentProfile();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isNewAttempt = queryParams.get("new_attempt") === "true";

  const [courseTitle, setCourseTitle] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [setName, setSetName] = useState("");
  const [user, setUser] = useState({ name: "", image: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [language, setLanguage] = useState('english');
  const [instructions, setInstructions] = useState({
    title_eng: "",
    content_eng: "",
    title_hi: "",
    content_hi: ""
  });
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [error, setError] = useState(null);
  const [renderReady, setRenderReady] = useState(false);
  const [examDate, setExamDate] = useState("01/10/24");
  const [isViolationVisible, setIsViolationVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check authentication & fetch current date
  useEffect(() => {
    console.log('🔐 ExamInstructionsPage: Starting authentication check');
    const storedUser = JSON.parse(localStorage.getItem("student_user") || localStorage.getItem("user") || "null");
    if (!storedUser) {
      console.log('❌ ExamInstructionsPage: No stored user found');
      setIsAuthenticated(false);
    } else {
      console.log('✅ ExamInstructionsPage: User authenticated:', storedUser.name || storedUser.full_name || `${storedUser.first_name || ""} ${storedUser.last_name || ""}`.trim());
      setIsAuthenticated(true);
      setUser({
        name: storedUser.name || storedUser.full_name || `${storedUser.first_name || ""} ${storedUser.last_name || ""}`.trim() || "Guest",
        image: storedUser.image || storedUser.profile_image || `${BASE_URL}api/Students/get_student_photo.php?id=${storedUser.id}`
      });
    }
    setLoading(false);

    // Fetch current date from API
    fetch('https://worldtimeapi.org/api/timezone/Asia/Kolkata')
      .then(res => res.json())
      .then(data => {
        const dateObj = new Date(data.datetime);
        const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getFullYear()).slice(-2)}`;
        console.log('📅 ExamInstructionsPage: Current date fetched:', formattedDate);
        setExamDate(formattedDate);
      })
      .catch(err => {
        console.warn('⚠️ ExamInstructionsPage: Date API failed, using local date');
        const dateObj = new Date();
        const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getFullYear()).slice(-2)}`;
        setExamDate(formattedDate);
      });
    
    // Set render ready after a brief delay to ensure DOM is stable
    setTimeout(() => {
      console.log('✅ ExamInstructionsPage: Component ready for rendering');
      setRenderReady(true);
    }, 100);
  }, []);

  // Fetch course title
  useEffect(() => {
    if (!course_id) return;
    console.log('📚 ExamInstructionsPage: Fetching course title for ID:', course_id);
    fetch(`${BASE_URL}api/Courses/get_courses.php`)
      .then((res) => res.json())
      .then((data) => {
        console.log('📚 ExamInstructionsPage: Course API response:', data);
        if (data.success && data.courses && Array.isArray(data.courses)) {
          const matched = data.courses.find(
            (course) => parseInt(course.id) === parseInt(course_id)
          );
          if (matched?.title) {
            console.log('✅ ExamInstructionsPage: Course title found:', matched.title);
            setCourseTitle(matched.title);
          }
        }
      })
      .catch((err) => console.error("❌ ExamInstructionsPage: Error fetching course:", err));
  }, [course_id]);

  // Fetch exam title, set name and date
  useEffect(() => {
    if (!course_id || !exam_set_id) return;
    console.log('📋 ExamInstructionsPage: Fetching exam title for course:', course_id, 'exam_set:', exam_set_id);
    
    fetch(`${BASE_URL}api/Exams/get_exam_sets.php?course_id=${course_id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('📋 ExamInstructionsPage: Exam sets API response:', data);
        
        if (data.success && data.exam_sets && Array.isArray(data.exam_sets)) {
          const matched = data.exam_sets.find(set => parseInt(set.id) === parseInt(exam_set_id));
          if (matched && matched.exam_name) {
            console.log('✅ ExamInstructionsPage: Exam title found:', matched.exam_name);
            setExamTitle(matched.exam_name);
            if (matched.set_name) {
              console.log('✅ ExamInstructionsPage: Set name found:', matched.set_name);
              setSetName(matched.set_name);
            }
            
            // Extract and set exam date if available
            if (matched.exam_date) {
              try {
                const dateObj = new Date(matched.exam_date);
                const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getFullYear()).slice(-2)}`;
                console.log('📅 ExamInstructionsPage: Exam date extracted:', formattedDate);
                setExamDate(formattedDate);
              } catch (err) {
                console.warn('⚠️ ExamInstructionsPage: Date parsing failed, using default:', err);
              }
            }
          }
        } else if (data.success && data.exam_sets && typeof data.exam_sets === 'object') {
          // Handle legacy format if needed
          let matched = null;
          let matchedDate = null;
          Object.values(data.exam_sets).forEach((setGroup) => {
            if (parseInt(setGroup.exam_set_id || setGroup.id) === parseInt(exam_set_id)) {
              matched = setGroup.exam_name || setGroup.exam_title;
              matchedDate = setGroup.exam_date;
            }
          });
          if (matched) {
            console.log('✅ ExamInstructionsPage: Exam title found (legacy):', matched);
            setExamTitle(matched);
            
            // Extract and set exam date if available (legacy)
            if (matchedDate) {
              try {
                const dateObj = new Date(matchedDate);
                const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getFullYear()).slice(-2)}`;
                console.log('📅 ExamInstructionsPage: Exam date extracted (legacy):', formattedDate);
                setExamDate(formattedDate);
              } catch (err) {
                console.warn('⚠️ ExamInstructionsPage: Date parsing failed (legacy), using default:', err);
              }
            }
          }
        }
      })
      .catch((err) => console.error("❌ ExamInstructionsPage: Error fetching exam:", err));
  }, [course_id, exam_set_id]);

  // Fetch instructions for specific exam set
  useEffect(() => {
    if (!exam_set_id) {
      console.log('⚠️ ExamInstructionsPage: No exam_set_id provided');
      return;
    }
    
    console.log('📝 ExamInstructionsPage: Fetching instructions for exam_set_id:', exam_set_id);
    setDataLoading(true);
    
    fetch(`${BASE_URL}api/Instructions/get_instructions_one.php?exam_set_id=${exam_set_id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('📝 ExamInstructionsPage: Instructions API response:', data);
        if (data.success && data.instructions) {
          console.log('✅ ExamInstructionsPage: Instructions loaded successfully');
          setInstructions({
            title_eng: data.instructions.title_english,
            content_eng: data.instructions.instruction_english || "",
            title_hi: data.instructions.title_hindi,
            content_hi: data.instructions.instruction_hindi || ""
          });
        } else {
          console.log('⚠️ ExamInstructionsPage: No instructions found for exam set');
        }
        setDataLoading(false);
      })
      .catch((err) => {
        console.error("❌ ExamInstructionsPage: Error fetching instructions:", err);
        setError("Failed to load instructions");
        setDataLoading(false);
      });
  }, [exam_set_id]);

  // Full screen on mount and cleanup on unmount - only after component is ready
  useEffect(() => {
    if (!renderReady || !isAuthenticated) {
      console.log('🎯 ExamInstructionsPage: Waiting for component to be ready:', { renderReady, isAuthenticated });
      return;
    }
    
    console.log('🎯 ExamInstructionsPage: Fullscreen effect triggered - component is ready');
    let timeoutId;
    let fullscreenActive = false;
    
    const enterFullscreen = async () => {
      try {
        console.log('🎯 ExamInstructionsPage: Checking fullscreen status');
        console.log('🎯 ExamInstructionsPage: Current fullscreen element:', document.fullscreenElement);
        console.log('🎯 ExamInstructionsPage: Document visibility:', document.visibilityState);
        
        // Log scrollable content state
        const scrollableContent = document.querySelector('[class*="overflow-y-auto"]');
        if (scrollableContent) {
          console.log('🖱️ ExamInstructionsPage: Scrollable content element found:', {
            clientHeight: scrollableContent.clientHeight,
            scrollHeight: scrollableContent.scrollHeight,
            canScroll: scrollableContent.scrollHeight > scrollableContent.clientHeight
          });
        }
        
        if (!document.fullscreenElement && !fullscreenActive && document.visibilityState === 'visible') {
          console.log('🎯 ExamInstructionsPage: Entering fullscreen mode...');
          fullscreenActive = true;
          
          timeoutId = setTimeout(async () => {
            try {
              await document.documentElement.requestFullscreen();
              console.log('✅ ExamInstructionsPage: Successfully entered fullscreen');
              console.log('🖱️ ExamInstructionsPage: Fullscreen scroll container ready for scrolling');
            } catch (error) {
              console.warn('❌ ExamInstructionsPage: Fullscreen request failed:', error);
              fullscreenActive = false;
            }
          }, 500); // Increased delay
        } else {
          console.log('🎯 ExamInstructionsPage: Skipping fullscreen - conditions not met');
        }
      } catch (error) {
        console.warn('❌ ExamInstructionsPage: Fullscreen not supported:', error);
        fullscreenActive = false;
      }
    };

    // Add a delay to ensure DOM is fully rendered
    const mountTimer = setTimeout(() => {
      console.log('🎯 ExamInstructionsPage: Component fully mounted, attempting fullscreen');
      enterFullscreen();
    }, 800); // Increased delay to prevent white screen

    // Cleanup function - maintain fullscreen during navigation between exam pages
    return () => {
      console.log('🎯 ExamInstructionsPage: Component unmounting, cleaning up');
      
      if (timeoutId) {
        clearTimeout(timeoutId);
        console.log('🎯 ExamInstructionsPage: Cleared fullscreen timeout');
      }
      
      if (mountTimer) {
        clearTimeout(mountTimer);
        console.log('🎯 ExamInstructionsPage: Cleared mount timer');
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

  const handleNext = () => {
    const queryParams = new URLSearchParams(location.search);
    const isNewAttempt = queryParams.get("new_attempt") === "true";
    const nextUrl = `/exam/start/${course_id}/${exam_set_id}/${set_number}${isNewAttempt ? '?new_attempt=true' : ''}`;
    navigate(nextUrl, { state: location.state });
  };

  const handleGoBack = async () => {
    console.log('🔙 ExamInstructionsPage: Go back button clicked');
    
    // Exit fullscreen before navigating back
    if (document.fullscreenElement) {
      console.log('🔙 ExamInstructionsPage: Exiting fullscreen before navigation');
      try {
        await document.exitFullscreen();
        console.log('✅ ExamInstructionsPage: Fullscreen exited successfully');
      } catch (error) {
        console.warn('❌ ExamInstructionsPage: Failed to exit fullscreen:', error);
      }
    }
    
    // Small delay to ensure fullscreen exit is processed
    setTimeout(() => {
      console.log('🔙 ExamInstructionsPage: Navigating back');
      navigate(-1);
    }, 100);
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  // Show loading state
  if (loading || !renderReady) {
    console.log('🔄 ExamInstructionsPage: Showing loading state:', { loading, renderReady });
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
            Please log in to access the exam instructions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleLoginRedirect}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
            <button
              onClick={handleGoBack}
              className="bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-white px-6 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎨 ExamInstructionsPage: Rendering main component');
  console.log('🎨 ExamInstructionsPage: Current state:', { 
    isAuthenticated, 
    loading, 
    renderReady, 
    courseTitle, 
    examTitle,
    examDate,
    isFullscreen: !!document.fullscreenElement
  });
  console.log('🎨 ExamInstructionsPage: Viewport dimensions:', {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile
  });

  return (
    <div className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col" style={{ 
      visibility: renderReady ? 'visible' : 'hidden',
      height: '100vh',
      minHeight: '100vh',
      maxHeight: '100vh'
    }}>
      <FullscreenViolation isVisible={isViolationVisible} onReturn={handleReturnToExam} />
      
      <WatermarkComponent text={profileUser?.number} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-300 dark:border-gray-700 px-4 py-0 flex-shrink-0">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <img src={`/img/logo.webp`} alt="Logo" className="w-10 h-10 sm:w-14 sm:h-14" />
          {isMobile && (
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
          )}
        </div>
        
        <div className="text-center flex-1 sm:-ml-14 mt-2 sm:mt-0">
          <h1 className="text-blue-700 dark:text-blue-400 font-bold text-sm sm:text-lg md:text-xl uppercase">
            {setName || `SET ${set_number}`}
          </h1>
        </div>
        
        {/* Language Toggle - Desktop */}
        {!isMobile && (
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
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden">
        {/* Left Section */}
        <div className={`flex-1 flex flex-col p-4 sm:p-6 relative ${isMobile ? '' : 'border-r border-gray-300 dark:border-gray-700'}`}>
          <div 
            className="overflow-y-auto pr-2 flex-1 min-h-0 text-xs sm:text-sm leading-relaxed"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(156, 163, 175) rgb(229, 231, 235)'
            }}
            dangerouslySetInnerHTML={{
              __html: language === 'english' 
                ? instructions.content_eng 
                : instructions.content_hi || "<p>No Hindi content available</p>"
            }}
          />

          {/* Bottom Buttons */}
          <div className="flex justify-between items-center mt-0 pt-2 border-t border-gray-300 dark:border-gray-700 flex-shrink-0">
            <button
              onClick={handleGoBack}
              className="text-blue-700 hover:underline text-xs sm:text-sm"
            >
              {language === 'english' ? '← Go to Tests' : '← टेस्ट पर वापस जाएं'}
            </button>
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-4 py-1 sm:px-6 sm:py-2 rounded hover:bg-blue-700 text-xs sm:text-sm"
            >
              {language === 'english' ? 'Next' : 'अगला'}
            </button>
          </div>
        </div>

        {/* Right Sidebar - Only on desktop */}
        {!isMobile && (
          <div className="w-48 bg-blue-100 dark:bg-blue-950 border-l border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center p-4 flex-shrink-0">
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
        )}

        {/* Mobile User Profile - Fixed at bottom */}
        {isMobile && (
          <div className="bg-blue-100 dark:bg-blue-950 border-t border-gray-300 dark:border-gray-700 p-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center">
              <div className="border-2 border-white p-0.5 rounded-full shadow mr-2">
                <img
                  src={user.image}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/img/pfp.jpg';
                  }}
                />
              </div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                {user.name}
              </p>
            </div>
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-xs"
            >
              {language === 'english' ? 'Next' : 'अगला'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamInstructionsPage;