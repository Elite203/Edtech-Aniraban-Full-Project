import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SSCHeader from './SSCHeader';
import SSCFooter from './SSCFooter';
import FullscreenViolation from './FullScreenViolation';
import { useStudentProfile } from './StudentProfileData';
import WatermarkComponent from './WatermarkComponent';

const SSCPledge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useStudentProfile();
  const [isViolationVisible, setIsViolationVisible] = useState(false);
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
    navigate('/ssc/custom', { state: { setName, examSetId, courseId, setNumber } });
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950 text-black dark:text-slate-200 transition-colors duration-300 relative overflow-hidden">
      <FullscreenViolation isVisible={isViolationVisible} onReturn={enterFullscreen} />
      <WatermarkComponent text={user.number} />
      <SSCHeader user={user} />

      <main className="flex-1 flex flex-col items-center py-20 px-4 relative z-10 overflow-auto">
        <div className="process-title text-[#0000ff] dark:text-blue-400 font-bold text-base md:text-lg mb-4 uppercase">
          Hand writing process
        </div>

        <div className="instruction-text text-[#0000ff] dark:text-blue-400 font-bold text-sm md:text-base mb-4 text-center">
          Write the following Certification statement in the space provided on the admit card.
        </div>

        <div className="certification-box w-full max-w-4xl border-2 border-[#dcd6c5] dark:border-slate-700 p-5 md:p-8 mb-6 bg-white dark:bg-slate-900 shadow-sm">
          <p className="cert-text text-sm md:text-base text-black dark:text-slate-200 mb-4 leading-relaxed">
            Believe in your preparation and stay confident, because every hour of hard work has strengthened you for this moment. Stay calm and focused during the exam, trust your knowledge, and manage your time wisely. Remember that this test is only a step in your journey, not the final destination. Give your best with honesty and determination, and success will follow.
          </p>
          <p className="cert-text text-sm md:text-base text-black dark:text-slate-200 leading-relaxed">
            अपनी तैयारी पर भरोसा रखें और आत्मविश्वास बनाए रखें, क्योंकि हर घंटे की मेहनत ने आपको इस पल के लिए मजबूत बनाया है। परीक्षा के दौरान शांत और एकाग्र रहें, अपने ज्ञान पर विश्वास रखें और समय का सदुपयोग करें। याद रखें कि यह परीक्षा आपकी यात्रा का सिर्फ एक पड़ाव है, मंजिल नहीं। ईमानदारी और दृढ़ संकल्प के साथ अपना सर्वश्रेष्ठ प्रदर्शन करें, सफलता अवश्य मिलेगी।
          </p>
        </div>

        <div className="confirmation-msg text-red-600 dark:text-red-400 font-bold text-sm md:text-base mb-6 text-center">
          I hereby confirm that I have written the above text on the admit card.
        </div>

        <button 
          onClick={handleContinue}
          className="continue-btn bg-gradient-to-b from-[#f0f0f0] to-[#dcdcdc] hover:from-white hover:to-[#e0e0e0] border border-gray-400 dark:border-slate-600 text-black px-12 py-1.5 font-bold text-sm md:text-base rounded-sm shadow-sm transition-all active:shadow-inner active:scale-95"
        >
          Continue
        </button>
      </main>

      <SSCFooter />
    </div>
  );
};

export default SSCPledge;
