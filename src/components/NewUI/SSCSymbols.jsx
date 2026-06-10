import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SSCHeader from './SSCHeader';
import SSCFooter from './SSCFooter';
import WatermarkComponent from './WatermarkComponent';
import FullscreenViolation from './FullScreenViolation';
import { useStudentProfile } from './StudentProfileData';

const SSCSymbols = () => {
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

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-black dark:text-white">
      <FullscreenViolation isVisible={isViolationVisible} onReturn={enterFullscreen} />
      
      {/* Background/Overlay Components */}
      <WatermarkComponent text={user?.number} />

      {/* Header Components */}
      <SSCHeader user={user} />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full relative z-10">
        <div className="text-[#000080] dark:text-blue-400 font-bold text-[15px] text-center mb-6 px-4">
          The different symbols used in the next pages are shown below. Please go through them and understand their meaning before you start the test.
        </div>

        <div className="overflow-x-auto border border-gray-300 dark:border-slate-700 rounded-sm shadow-sm">
          <table className="w-full border-collapse text-[13px] bg-white dark:bg-slate-800">
            <thead>
              <tr className="bg-[#dcd6c5] dark:bg-slate-700 font-bold">
                <th className="p-2 border border-gray-300 dark:border-slate-600 w-24 md:w-32">Symbol</th>
                <th className="p-2 border border-gray-300 dark:border-slate-600 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-gray-300 dark:border-slate-700 text-center align-middle">
                  <input type="radio" readOnly className="scale-125 accent-blue-600 pointer-events-none" />
                </td>
                <td className="p-2 border border-gray-300 dark:border-slate-700 font-bold text-[#0000ff] dark:text-blue-400 leading-relaxed">
                  Option Not chosen
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-300 dark:border-slate-700 text-center align-middle">
                  <input type="radio" checked readOnly className="scale-125 accent-blue-600 pointer-events-none" />
                </td>
                <td className="p-2 border border-gray-300 dark:border-slate-700 font-bold text-[#0000ff] dark:text-blue-400 leading-relaxed">
                  Option chosen as correct (By clicking on it again you can delete your option and choose another option if desired.)
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-300 dark:border-slate-700 text-center align-middle">
                  <div className="w-6 h-6 bg-[#0000ff] border border-[#0000a0] flex items-center justify-center text-white font-bold text-[11px] mx-auto shadow-sm">12</div>
                </td>
                <td className="p-2 border border-gray-300 dark:border-slate-700 font-bold text-[#0000ff] dark:text-blue-400 leading-relaxed">
                  Question number shown in blue color indicates that you have not yet attempted the question.
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-300 dark:border-slate-700 text-center align-middle">
                  <div className="w-6 h-6 bg-[#008000] border border-[#006400] flex items-center justify-center text-white font-bold text-[11px] mx-auto shadow-sm">13</div>
                </td>
                <td className="p-2 border border-gray-300 dark:border-slate-700 font-bold text-[#0000ff] dark:text-blue-400 leading-relaxed">
                  Question number shown in green color indicates that you have answered the question.
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-300 dark:border-slate-700 text-center align-middle">
                  <div className="w-6 h-6 bg-[#ff0000] border border-[#8b0000] flex items-center justify-center text-white font-bold text-[11px] mx-auto shadow-sm">14</div>
                  <div className="text-[10px] -mt-0.5 text-black dark:text-white flex justify-center">▲</div>
                </td>
                <td className="p-2 border border-gray-300 dark:border-slate-700 font-bold text-[#0000ff] dark:text-blue-400 leading-relaxed">
                  You have not yet answered the question, but marked it for coming back for review later, if time permits.
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-300 dark:border-slate-700 text-center align-middle">
                  <div className="w-6 h-6 bg-[#ffff00] border border-[#cccc00] flex items-center justify-center text-black font-bold text-[11px] mx-auto shadow-sm">15</div>
                  <div className="text-[10px] -mt-0.5 text-black dark:text-white flex justify-center">▲</div>
                </td>
                <td className="p-2 border border-gray-300 dark:border-slate-700 font-bold text-[#0000ff] dark:text-blue-400 leading-relaxed">
                  You have answered the question, but marked it for review later, if time permits.
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-300 dark:border-slate-700 text-center align-middle">
                  <div className="bg-gradient-to-b from-[#4a8ad4] to-[#1f5a9e] text-white px-3 py-1 rounded-sm text-[12px] min-w-[100px] border border-slate-600 shadow-sm inline-block font-sans">Save & Next</div>
                </td>
                <td className="p-2 border border-gray-300 dark:border-slate-700 font-bold text-[#0000ff] dark:text-blue-400 leading-relaxed">
                  Clicking on this will take you to the next question.
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-300 dark:border-slate-700 text-center align-middle">
                  <div className="bg-gradient-to-b from-[#4a8ad4] to-[#1f5a9e] text-white px-3 py-1 rounded-sm text-[12px] min-w-[100px] border border-slate-600 shadow-sm inline-block font-sans">Previous</div>
                </td>
                <td className="p-2 border border-gray-300 dark:border-slate-700 font-bold text-[#0000ff] dark:text-blue-400 leading-relaxed">
                  Clicking on this will take you to the previous question.
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-300 dark:border-slate-700 text-center align-middle">
                  <div className="bg-gradient-to-b from-[#4a8ad4] to-[#1f5a9e] text-white px-3 py-1 rounded-sm text-[12px] min-w-[100px] border border-slate-600 shadow-sm inline-block whitespace-nowrap font-sans">Mark for Review</div>
                </td>
                <td className="p-2 border border-gray-300 dark:border-slate-700 font-bold text-[#0000ff] dark:text-blue-400 leading-relaxed">
                  By clicking on this button, you can mark the question for review later. Please note that if you answer the question and mark for review, the question will be treated as answered and evaluated even if you do not review it.
                </td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-300 dark:border-slate-700 text-center align-middle">
                  <div className="bg-gradient-to-b from-[#4a8ad4] to-[#1f5a9e] text-white px-3 py-1 rounded-sm text-[12px] min-w-[100px] border border-slate-600 shadow-sm inline-block whitespace-nowrap font-sans">Unmark For Review</div>
                </td>
                <td className="p-2 border border-gray-300 dark:border-slate-700 font-bold text-[#0000ff] dark:text-blue-400 leading-relaxed">
                  By clicking on this button, you can unmark the question for review
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-12 mb-12 px-2 md:px-10">
          <button 
            onClick={() => navigate('/ssc/instructions', { state: { setName, examSetId, courseId, setNumber } })}
            className="bg-[#1a4a7a] hover:bg-[#153a5f] text-white border border-black px-6 py-1.5 font-bold text-[13px] shadow-[2px_2px_2px_#888] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1"
          >
            &lt;&lt; Back
          </button>
          <button 
            onClick={() => navigate('/ssc/language', { state: { setName, examSetId, courseId, setNumber } })}
            className="bg-[#1a4a7a] hover:bg-[#153a5f] text-white border border-black px-6 py-1.5 font-bold text-[13px] shadow-[2px_2px_2px_#888] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1"
          >
            Continue &gt;&gt;
          </button>
        </div>
      </main>

      <SSCFooter />
    </div>
  );
};

export default SSCSymbols;
