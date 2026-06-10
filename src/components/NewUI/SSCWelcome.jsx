import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SSCHeader from './SSCHeaderwithName';
import SSCFooter from './SSCFooter';
import FullscreenViolation from './FullscreenViolation';
import { useStudentProfile } from './StudentProfileData';
import WatermarkComponent from './WatermarkComponent';

const SSCWelcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [randomId, setRandomId] = useState('');
  const [isViolationVisible, setIsViolationVisible] = useState(false);
  const { user } = useStudentProfile();
  const currentYear = new Date().getFullYear();
  const setName = location.state?.setName || localStorage.getItem('sscSetName') || "SSC-Mock Test";
  const examSetId = location.state?.examSetId || localStorage.getItem('sscExamSetId');
  const courseId = location.state?.courseId || location.state?.course_id || localStorage.getItem('sscCourseId');
  const setNumber = location.state?.setNumber || location.state?.set_number || localStorage.getItem('sscSetNumber');

  const testDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (examSetId) {
      localStorage.setItem('sscExamSetId', examSetId);
    }
    if (courseId) {
      localStorage.setItem('sscCourseId', courseId.toString());
    }
    if (setNumber) {
      localStorage.setItem('sscSetNumber', setNumber.toString());
    }
    // 1. Generate a random number between 1000 and 9999
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    // 2. Set the ID state
    setRandomId(`M00110${randomNum}`);
  }, [examSetId]); // Runs when examSetId is available

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
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsViolationVisible(true);
      }
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-black dark:text-slate-200 transition-colors duration-300 relative overflow-x-hidden">
      
      <FullscreenViolation
        isVisible={isViolationVisible}
        onReturn={enterFullscreen}
      />
      
      <WatermarkComponent text={user.number} />
      
      <SSCHeader user={user} />

      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 py-2 md:py-4">
        
        {/* System No Header */}
        <div className="text-center mb-4 md:mb-6">
          <div className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">SYSTEM NO</div>
         <div className="text-3xl md:text-5xl font-black text-[#000080] dark:text-blue-400 mt-1">
      {/* 3. Display the state, fallback to a placeholder to prevent layout shift */}
      {randomId || "M00110...."}
    </div>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-10 px-2 md:px-12">
          
          {/* Left Side: Candidate Info */}
          <div className="w-full lg:flex-1 space-y-4 pt-4">
            {[
              { label: "Reg Number", value: user.number },
              { label: "Roll Number", value: user.number },
              { label: "Name", value: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User" },
              { label: "Post/Subject", value: setName }
            ].map((item, index) => (
              <div key={index} className="flex text-sm md:text-base border-b border-gray-100 dark:border-slate-800 pb-2">
                <div className="font-bold w-32 md:w-40 text-gray-700 dark:text-gray-300">{item.label}</div>
                <div className="font-bold text-blue-700 dark:text-blue-400">: {item.value}</div>
              </div>
            ))}
          </div>

          {/* Right Side: Login Box */}
          <div className="w-full lg:flex-[1.2] border-[4px] md:border-[6px] border-[#dcd6c5] dark:border-slate-800 p-4 md:p-6 text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl rounded-sm">
            <div className="text-[#0000ff] dark:text-blue-400 font-bold text-lg md:text-xl mb-3 uppercase tracking-tight">
              WELCOME TO SSC ONLINE TEST
            </div>
            
            <div className="space-y-1 mb-4">
              <div className="text-red-600 dark:text-red-400 font-bold text-sm md:text-base">Test Date: {testDate}</div>
              <div className="text-red-600 dark:text-red-400 font-bold text-sm md:text-base">Centre Name: Staff Selection Commission Centre</div>
            </div>

            {/* Photo Area */}
            <div className="flex justify-center gap-6 md:gap-12 mb-6">
              {[ 
                { label: "Registration Photo", src: user.photo || "/img/pfp.jpg" }, 
                { label: "Captured Photo", src: "/img/pfp.jpg" } 
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-20 h-28 md:w-28 md:h-36 bg-gray-200 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 flex items-center justify-center overflow-hidden rounded-sm relative shadow-inner">
                    <img 
                      src={item.src} 
                      alt={item.label} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/img/pfp.jpg";
                      }}
                    />
                  </div>
                  <div className="text-[10px] md:text-xs mt-2 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Login Action */}
            <div className="flex items-center justify-center md:justify-end gap-3 mt-4">
              <span className="font-bold text-sm md:text-base hidden sm:block italic">Click here to login</span>
              <span className="text-[#0000ff] dark:text-blue-400 font-bold text-xl md:text-2xl animate-pulse">→</span>
              <button 
                onClick={() => navigate('/ssc/login', { state: { setName, examSetId, courseId, setNumber } })}
                className="bg-gradient-to-b from-[#f8f8f8] to-[#d8d8d8] hover:from-white hover:to-[#e0e0e0] border border-gray-400 dark:border-slate-600 text-black px-8 py-2 font-bold text-sm md:text-base rounded-sm shadow-md transition-all active:shadow-inner active:scale-95"
              >
                Login
              </button>
            </div>
          </div>

        </div>
      </main>

      <SSCFooter />
    </div>
  );
};

export default SSCWelcome;
