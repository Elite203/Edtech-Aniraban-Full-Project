import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SSCHeader from './SSCHeader';
import SSCFooter from './SSCFooter';
import FullscreenViolation from './FullScreenViolation';
import { useStudentProfile } from './StudentProfileData';
import WatermarkComponent from './WatermarkComponent';

const SSCCustomPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useStudentProfile();
  const [isViolationVisible, setIsViolationVisible] = useState(false);
  const [instructions, setInstructions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem('sscLanguage') || 'english');

  const setName = location.state?.setName || localStorage.getItem('sscSetName') || "SSC-Mock Test";
  const examSetId = location.state?.examSetId || localStorage.getItem('sscExamSetId');
  const courseId = location.state?.courseId || location.state?.course_id || localStorage.getItem('sscCourseId');
  const setNumber = location.state?.setNumber || location.state?.set_number || localStorage.getItem('sscSetNumber');

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem('sscLanguage', newLang);
  };

  const enterFullscreen = async () => {
    try {
      const element = document.documentElement;
      if (!document.fullscreenElement) {
        if (element.requestFullscreen) await element.requestFullscreen();
        else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen();
        else if (element.msRequestFullscreen) await element.msRequestFullscreen();
      }
      setIsViolationVisible(false);
    } catch (err) {
      console.warn("Fullscreen request blocked:", err);
    }
  };

  useEffect(() => {
    if (examSetId) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Instructions/get_instructions_three.php?exam_set_id=${examSetId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setInstructions(data.data);
          }
        })
        .catch(err => console.error("Error fetching instructions:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [examSetId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setIsViolationVisible(true);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-black dark:text-slate-200">
      <FullscreenViolation isVisible={isViolationVisible} onReturn={enterFullscreen} />
      <WatermarkComponent text={user?.number} />
      <SSCHeader user={user} />

      <main className="flex-1 p-4 md:p-6 relative z-10">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-sm shadow-sm">
          <div className="bg-[#dcd6c5] dark:bg-slate-800 px-4 py-2 font-bold text-sm border-b border-gray-300 dark:border-slate-700 uppercase tracking-wider text-gray-700 dark:text-gray-200">
            EXAM GUIDELINES
          </div>
          <div className="p-4 md:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-500 animate-pulse">Loading instructions...</p>
              </div>
            ) : instructions ? (
              <div 
                className="ssc-instructions-content prose prose-sm md:prose-base dark:prose-invert max-w-none text-justify font-medium leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: language === 'hindi' ? instructions.instruction_hindi : instructions.instruction_english 
                }} 
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400 font-bold">No instructions found for this exam set.</p>
                <p className="text-xs text-gray-500 mt-1">Please contact your administrator if this is unexpected.</p>
              </div>
            )}
          </div>
        </div>

        <div className="footer-area flex flex-col items-center mt-8 mb-8 gap-4">
          <div className="good-luck font-bold text-[12px] text-gray-600 dark:text-gray-400">Good Luck.</div>
          <div className="buttons-row flex flex-wrap justify-center items-center gap-5">
            <button 
              className="action-btn bg-red-600 hover:bg-red-700 border border-red-700 px-8 py-1.5 font-bold text-[13px] shadow-sm active:scale-95 transition-all text-white rounded-sm"
              onClick={() => {
                alert("You are quitting the exam!");
                navigate('/courses');
              }}
            >
              Quit
            </button>
            <button 
              className="action-btn bg-gradient-to-b from-[#f0e6cf] to-[#dcd6c5] dark:from-slate-700 dark:to-slate-800 border border-gray-400 dark:border-slate-600 px-8 py-1.5 font-bold text-[13px] shadow-sm hover:brightness-95 active:scale-95 transition-all text-gray-800 dark:text-gray-200"
              onClick={() => navigate('/ssc/pledge', { state: { setName, examSetId, courseId, setNumber } })}
            >
              Back
            </button>
            <select 
              value={language}
              onChange={handleLanguageChange}
              className="bg-gradient-to-b from-[#f0e6cf] to-[#dcd6c5] dark:from-slate-700 dark:to-slate-800 border border-gray-400 dark:border-slate-600 px-4 py-1.5 font-bold text-[13px] shadow-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all text-gray-800 dark:text-gray-200 rounded-sm cursor-pointer"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
            </select>
            <button 
              className="action-btn bg-gradient-to-b from-[#f0e6cf] to-[#dcd6c5] dark:from-slate-700 dark:to-slate-800 border border-gray-400 dark:border-slate-600 px-8 py-1.5 font-bold text-[13px] shadow-sm hover:brightness-95 active:scale-95 transition-all text-gray-800 dark:text-gray-200"
              onClick={() => navigate('/ssc/instructions', { state: { setName, examSetId, courseId, setNumber } })}
            >
              Proceed
            </button>
          </div>
        </div>
      </main>

      <SSCFooter />
    </div>
  );
};

export default SSCCustomPage;
