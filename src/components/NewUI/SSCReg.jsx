import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FullscreenViolation from './FullScreenViolation';
import SSCHeader from './SSCHeader';
import SSCFooter from './SSCFooter';
import { useStudentProfile } from './StudentProfileData';
import WatermarkComponent from './WatermarkComponent';
import { useToast } from '../ui/use-toast';

const SSCReg = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setName, course_id, courseId, set_number, setNumber } = location.state || {};
  const [isViolationVisible, setIsViolationVisible] = useState(false);
  const { user, setUser } = useStudentProfile();
  const [isAdmitCardOpen, setIsAdmitCardOpen] = useState(false);
  const { toast } = useToast();

  const [post, setPost] = useState("");
  const [language, setLanguage] = useState("");
  const [examSetId, setExamSetId] = useState(null);

  // Capture course_id and set_number early
  useEffect(() => {
    console.log("📍 Entering SSCReg Page");
    console.log("Incoming location.state:", location.state);

    const finalCourseId = course_id || courseId;
    const finalSetNumber = set_number || setNumber;

    console.log("Processing Parameters:", {
      finalCourseId,
      finalSetNumber,
      setName,
      storedExamSetId: localStorage.getItem('sscExamSetId')
    });

    if (finalCourseId) {
      console.log("✅ Storing sscCourseId:", finalCourseId);
      localStorage.setItem('sscCourseId', finalCourseId.toString());
    } else {
      console.error("❌ course_id is MISSING in location.state");
    }

    if (finalSetNumber) {
      console.log("✅ Storing sscSetNumber:", finalSetNumber);
      localStorage.setItem('sscSetNumber', finalSetNumber.toString());
    } else {
      console.warn("⚠️ set_number is missing in location.state");
    }
  }, [course_id, courseId, set_number, setNumber, location.state]);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleLogin = () => {
    if (post && language && language !== "--Select Language--") {
      localStorage.setItem('sscSetName', post);
      localStorage.setItem('sscLanguage', language);
      if (examSetId) {
        localStorage.setItem('sscExamSetId', examSetId);
      }
      navigate('/ssc/welcome', {
        state: {
          setName: post,
          course_id: course_id || courseId,
          set_number: set_number || setNumber,
          examSetId: examSetId
        }
      });
    } else {
      toast({
        title: "Selection Required",
        description: "Please select both Post and Regional Language.",
        variant: "destructive",
      });
    }
  };

  const enterFullscreen = async () => {
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
      console.warn("Fullscreen request blocked or failed:", err);
    }
  };

  useEffect(() => {
    const storedId = localStorage.getItem('sscExamSetId');
    if (storedId) {
      setExamSetId(storedId);
    }

    enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsViolationVisible(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Exit fullscreen when leaving the page
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

      if (document.fullscreenElement) {
        // Fullscreen state is maintained during navigation
      }
    };
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-black dark:text-slate-200 transition-colors duration-300 relative">
      <WatermarkComponent text={user.number} />
      <FullscreenViolation
        isVisible={isViolationVisible}
        onReturn={enterFullscreen}
      />

      <SSCHeader user={user} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-3 md:pt-4 px-4 w-full max-w-[95%] md:max-w-4xl lg:max-w-5xl mx-auto relative z-10">

        <div className="relative flex flex-col md:flex-row items-center justify-center w-full mb-3 gap-2 md:gap-0">
          {/* 1. The Title */}
          <div className="exam-title text-[#0047ab] dark:text-blue-400 font-bold text-base md:text-lg text-center md:text-left">
            SSC Examination - {currentYear}
          </div>

          {/* 2. The Buttons */}
          <div className="flex gap-2 md:absolute md:right-0">
            <button
              type="button"
              onClick={() => {
                toast({
                  title: "Exam Quit",
                  description: "You have quit the exam.",
                  variant: "default",
                });
                navigate('/courses');
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-sm text-[10px] md:text-xs font-bold shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              Quit
            </button>
            <button
              type="button"
              onClick={() => setIsAdmitCardOpen(true)}
              className="bg-[#0047ab] hover:bg-blue-800 text-white px-3 py-1 rounded-sm text-[10px] md:text-xs font-bold shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              Download Admit Card
            </button>
          </div>
        </div>

        {/* Admit Card Popup */}
        {isAdmitCardOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="relative bg-white dark:bg-slate-900 rounded-sm shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
              <div className="flex justify-between items-center px-4 py-2 border-b dark:border-slate-800">
                <span className="font-bold text-sm text-[#0047ab] dark:text-blue-400 uppercase">E-Admission Certificate</span>
                <button
                  onClick={() => setIsAdmitCardOpen(false)}
                  className="text-gray-500 hover:text-red-500 transition-colors p-1"
                  title="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-1 bg-gray-200 dark:bg-slate-950">
                <img
                  src="/img/COUNTER PART1.png"
                  alt="Admit Card"
                  className="w-full h-auto block mx-auto"
                />
              </div>
            </div>
          </div>
        )}

        {/* Login Box Form */}
        <div className="login-box bg-[#eee8d5] dark:bg-slate-800 border border-gray-300 dark:border-slate-700 p-4 md:p-6 w-full max-w-xl relative mb-4 rounded-sm shadow-sm flex-shrink-0">
          <div className="absolute -top-[8px] left-0 w-24 md:w-32 h-[8px] bg-[#dcd6c5] dark:bg-slate-700 rounded-t-md"></div>

          <form className="space-y-3">
            <div className="form-group flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <label htmlFor="post" className="w-full md:w-40 text-sm font-bold">Post</label>
              <select
                id="post"
                value={post}
                onChange={(e) => setPost(e.target.value)}
                className="w-full md:w-48 p-0.5 border border-gray-400 dark:border-slate-600 dark:bg-slate-900 font-bold outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              >
                <option value="">--Select Post--</option>
                {setName && <option value={setName}>{setName}</option>}
              </select>
            </div>

            <div className="form-group flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <label htmlFor="language" className="w-full md:w-40 text-sm font-bold">Choose Regional Language</label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full md:w-48 p-0.5 border border-gray-400 dark:border-slate-600 dark:bg-slate-900 font-bold outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              >
                <option value="">--Select Language--</option>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
              </select>
            </div>

            <div className="login-btn-container flex justify-end pt-2">
              <button
                type="button"
                onClick={handleLogin}
                className="login-btn bg-gradient-to-b from-[#f0f0f0] to-[#dcdcdc] dark:from-slate-200 dark:to-slate-400 border border-gray-400 px-5 py-0.5 font-bold text-black shadow-sm active:shadow-inner hover:brightness-95 transition-all text-sm"
              >
                Login
              </button>
            </div>
          </form>
        </div>

        {/* Disclaimer Section */}
        <div className="disclaimer-section w-full max-w-4xl text-left leading-tight mb-2">
          <span className="disclaimer-label text-red-600 font-bold text-base block mb-1 uppercase">Disclaimer:</span>
          <p className="disclaimer-text text-[#0047ab] dark:text-blue-400 font-bold text-sm md:text-[15px] mb-2 text-justify">
            Please note that the format of the web-based mock test is provided for reference purposes only. This SSC mock test is a practice test designed to match the exact exam pattern, syllabus, difficulty level, and time limits of SSC exams. It helps you experience the real exam before the actual day. It cover all ssc exams SSC CGL, SSC CHSL, SSC MTS, SSC GD Constable, SSC CPO,
            SSC JE, SSC Stenographer with updated exam pattern.
          </p>
          <p className="disclaimer-text text-[#0047ab] dark:text-blue-400 font-bold text-sm md:text-[15px] mb-3 text-justify">
            Candidates are advised to refer to the official instructions and guidelines issued for each exam, as the final pattern and process will be determined solely by the directions provided by SSC.
          </p>

          <div className="browser-warning text-[#ff3300] font-bold text-2xl md:text-3xl lg:text-3xl text-center mt-16">
            This website is best viewed using the Chrome browser.
          </div>
        </div>
      </main>

      <SSCFooter />
    </div>
  );
};

export default SSCReg;
