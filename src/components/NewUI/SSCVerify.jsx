import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SSCHeader from './SSCHeader';
import SSCFooter from './SSCFooter';
import FullscreenViolation from  './FullScreenViolation';
import { useStudentProfile } from './StudentProfileData';
import WatermarkComponent from './WatermarkComponent';

const SSCVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useStudentProfile();
  const [isViolationVisible, setIsViolationVisible] = useState(false);
  const setName = location.state?.setName || localStorage.getItem('sscSetName') || "SSC-Mock Test";
  const examSetId = location.state?.examSetId || localStorage.getItem('sscExamSetId');
  const courseId = location.state?.courseId || location.state?.course_id || localStorage.getItem('sscCourseId');
  const setNumber = location.state?.setNumber || location.state?.set_number || localStorage.getItem('sscSetNumber');

  const testDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

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

  const handleContinue = () => {
    navigate('/ssc/pledge', { state: { setName, examSetId, courseId, setNumber } });
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950 text-black dark:text-slate-200 transition-colors duration-300 relative overflow-hidden">
      <FullscreenViolation isVisible={isViolationVisible} onReturn={enterFullscreen} />
      <WatermarkComponent text={user.number} />
      <SSCHeader user={user} />

      <main className="flex-1 min-h-0 flex flex-col items-center py-6 md:py-10 px-4 relative z-10 overflow-y-auto w-full">
        <div className="text-center text-[#0000ff] dark:text-blue-400 font-bold text-sm md:text-base mb-6 leading-tight max-w-2xl">
          If Your name and photograph do not match, please contact the Administrator.
        </div>

        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 shadow-sm border border-gray-200 dark:border-slate-800 rounded-sm overflow-hidden">
          <div className="bg-[#dcd6c5] dark:bg-slate-800 px-4 py-2 font-bold text-sm text-black dark:text-slate-200 border-b border-gray-300 dark:border-slate-700">
            Verify Name & Photograph
          </div>

          <div className="p-4 md:p-8 flex flex-col md:flex-row justify-between gap-8">
            {/* Left Side: Details */}
            <div className="flex-1 space-y-4">
              <div className="flex text-sm md:text-base">
                <span className="font-bold w-24 md:w-32">Roll No</span>
                <span className="font-bold mx-2">:</span>
                <span className="font-bold text-[#0000ff] dark:text-blue-400">{user.number}</span>
              </div>
              <div className="flex text-sm md:text-base">
                <span className="font-bold w-24 md:w-32">Name</span>
                <span className="font-bold mx-2">:</span>
                <span className="font-bold text-[#0000ff] dark:text-blue-400 uppercase">{user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User"}</span>
              </div>
              <div className="flex text-sm md:text-base">
                <span className="font-bold w-24 md:w-32">Test Date</span>
                <span className="font-bold mx-2">:</span>
                <span className="font-bold text-[#0000ff] dark:text-blue-400">{testDate}</span>
              </div>
            </div>

            {/* Right Side: Photos */}
            <div className="flex gap-6 md:gap-10 justify-center md:justify-end">
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-32 md:w-28 md:h-36 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 flex items-center justify-center overflow-hidden rounded-sm shadow-inner">
                  <img 
                    src={user.photo || "/img/pfp.jpg"} 
                    alt="Application" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = "/img/pfp.jpg"; }}
                  />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-400 uppercase text-center">Application Form Photo</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-32 md:w-28 md:h-36 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 flex items-center justify-center overflow-hidden rounded-sm shadow-inner">
                  <img 
                    src="/img/pfp.jpg" 
                    alt="Webcam" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-400 uppercase text-center">Exam center Webcam Photo</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center p-6 mt-4">
            <button 
              onClick={handleContinue}
              className="bg-gradient-to-b from-[#f0f0f0] to-[#dcdcdc] hover:from-white hover:to-[#e0e0e0] border border-gray-400 dark:border-slate-600 text-black px-10 py-1.5 font-bold text-sm md:text-base rounded-sm shadow-sm transition-all active:shadow-inner active:scale-95"
            >
              Continue
            </button>
          </div>
        </div>
      </main>

      <SSCFooter />
    </div>
  );
};

export default SSCVerify;
