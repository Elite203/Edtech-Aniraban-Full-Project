import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SSCHeader from './SSCHeader';
import SSCFooter from './SSCFooter';
import WatermarkComponent from './WatermarkComponent';
import FullscreenViolation from './FullscreenViolation';
import { useStudentProfile } from './StudentProfileData';

const SSCLanguage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useStudentProfile();
  const [isViolationVisible, setIsViolationVisible] = useState(false);
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('sscLanguage') || 'English');

  const setName = location.state?.setName || localStorage.getItem('sscSetName') || "SSC-Mock Test";
  const examSetId = location.state?.examSetId || localStorage.getItem('sscExamSetId');
  const courseId = location.state?.courseId || location.state?.course_id || localStorage.getItem('sscCourseId');
  const setNumber = location.state?.setNumber || location.state?.set_number || localStorage.getItem('sscSetNumber');

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
    localStorage.setItem('sscLanguage', selectedLang);
    navigate('/ssc/subjects', { state: { setName, examSetId, courseId, setNumber } });
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900 text-black dark:text-white transition-colors relative overflow-hidden">
      <FullscreenViolation isVisible={isViolationVisible} onReturn={enterFullscreen} />
      
      {/* Background/Overlay Components */}
      <WatermarkComponent text={user?.number} />

      {/* Header Components */}
      <SSCHeader user={user} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
        <div className="text-[#003399] dark:text-blue-400 font-bold text-base md:text-lg mb-6 text-center uppercase">
          SSC Online Computer Based Test
        </div>

        <div className="w-full max-w-[600px] border border-gray-400 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm overflow-hidden rounded-sm">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="p-4 border border-gray-400 dark:border-slate-600 font-bold text-sm md:text-base text-left bg-gray-50 dark:bg-slate-700/30">
                  Select Preferred Language to Display Questions
                </td>
                <td className="p-4 border border-gray-400 dark:border-slate-600 w-32 md:w-40 text-center">
                  <select 
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="w-full p-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-sm font-bold text-[13px] outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <button 
            onClick={handleContinue}
            className="continue-btn bg-[#003366] hover:bg-[#002244] text-white border-2 border-[#002244] px-8 py-1.5 font-bold text-[13px] shadow-md transition-all active:scale-95"
          >
            Continue &gt;&gt;
          </button>
        </div>
      </main>

      <SSCFooter />
    </div>
  );
};

export default SSCLanguage;
