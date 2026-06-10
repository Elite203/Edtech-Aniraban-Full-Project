import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SSCHeader from './SSCHeader';
import SSCFooter from './SSCFooter';
import WatermarkComponent from './WatermarkComponent';
import FullscreenViolation from './FullScreenViolation';
import { useStudentProfile } from './StudentProfileData';

const SSCSubjects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useStudentProfile();
  const [isViolationVisible, setIsViolationVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [examData, setExamData] = useState({
    subjects: [],
    overallTime: 0,
    error: null
  });

  const setName = location.state?.setName || localStorage.getItem('sscSetName') || "SSC-Mock Test";
  const examSetId = location.state?.examSetId || localStorage.getItem('sscExamSetId');
  const courseId = location.state?.courseId || localStorage.getItem('sscCourseId');
  const setNumber = location.state?.setNumber || localStorage.getItem('sscSetNumber');

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
    if (countdown === null) return;
    if (countdown === 0) {
      navigate(`/ssc/main-exam`, { 
        state: { 
          examSetId, 
          courseId, 
          setNumber, 
          setName 
        } 
      });
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

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

  useEffect(() => {
    const fetchExamDetails = async () => {
      if (!examSetId) {
        setLoading(false);
        setExamData(prev => ({ ...prev, error: "Exam Set ID not found" }));
        return;
      }

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const [statsRes, marksRes, timingRes] = await Promise.all([
          fetch(`${backendUrl}/api/Exams/get_set_stats.php?exam_set_id=${examSetId}`),
          fetch(`${backendUrl}/api/Marks/manage_exam_subjects_marks.php?exam_set_id=${examSetId}`),
          fetch(`${backendUrl}/api/TimeManagement/get_exam_timing_details.php?exam_set_id=${examSetId}`)
        ]);

        const stats = await statsRes.json();
        const marks = await marksRes.json();
        const timing = await timingRes.json();

        if (marks.success && timing.success) {
          // Fetch overviews for each subject to get accurate question counts (including sub-questions)
          const overviews = await Promise.all(
            marks.data.map(sub => 
              fetch(`${backendUrl}/api/Questions/get_subject_overview.php?subject_id=${sub.id}`)
                .then(res => res.json())
                .catch(() => ({ success: false }))
            )
          );

          // Merge subject data
          const mergedSubjects = marks.data.map((sub, index) => {
            const overview = overviews[index];
            const timingInfo = timing.data.subject_wise_timing.subjects.find(s => s.subject_name === sub.subject_name);
            
            // Try to find section info from sectional_timing
            const sectionInfo = timing.data.sectional_timing.sections.find(sec => 
              sec.subjects_in_section.some(ss => ss.subject_name === sub.subject_name)
            );

            return {
              section: sectionInfo ? `PART-${String.fromCharCode(64 + parseInt(sectionInfo.section_number))}` : `PART-${String.fromCharCode(65 + index)}`,
              subject_name: sub.subject_name,
              question_count: (overview && overview.success) ? overview.data.total_answerable : 0,
              max_marks: sub.sub_marks
            };
          });

          setExamData({
            subjects: mergedSubjects,
            overallTime: timing.data.overall_timing.total_time_minutes,
            error: null
          });
        } else {
          setExamData(prev => ({ ...prev, error: "Failed to fetch exam details" }));
        }
      } catch (err) {
        console.error("Error fetching exam data:", err);
        setExamData(prev => ({ ...prev, error: "Connection error" }));
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [examSetId]);

  const handleStartTest = () => {
    // If we have at least the examSetId, we can proceed with the mock test
    if (examSetId) {
      // Clear any stale state from previous attempts of the same set
      localStorage.removeItem(`sscExamState_${examSetId}`);
      localStorage.removeItem(`sscTimeLeft_${examSetId}`);
      localStorage.removeItem(`sscOverallTime_${examSetId}`);
      
      setCountdown(5);
    } else {
      alert("Missing exam parameters (Exam Set ID). Please restart the process.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-black dark:text-slate-200 transition-colors relative overflow-x-hidden">
      <FullscreenViolation isVisible={isViolationVisible} onReturn={enterFullscreen} />
      
      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-[1000] bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <div className="text-2xl md:text-4xl font-black uppercase mb-8 tracking-tighter animate-pulse">
            Getting ready for the test...
          </div>
          <div className="relative flex items-center justify-center">
            <div className="absolute w-32 h-32 md:w-48 md:h-48 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute w-32 h-32 md:w-48 md:h-48 border-t-4 border-blue-500 rounded-full animate-spin"></div>
            <div className="text-6xl md:text-8xl font-black">{countdown}</div>
          </div>
          <div className="mt-10 text-gray-400 font-bold uppercase text-xs tracking-widest">
            The exam will begin shortly
          </div>
        </div>
      )}

      <WatermarkComponent text={user?.number} />
      <SSCHeader user={user} />

      <main className="flex-1 flex flex-col items-center p-4 md:p-8 relative z-10 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-gray-500 animate-pulse uppercase tracking-widest">Loading Exam Data...</p>
          </div>
        ) : examData.error ? (
          <div className="text-center py-20">
            <div className="text-red-600 dark:text-red-400 font-black text-xl mb-2 uppercase">Error Encountered</div>
            <p className="text-gray-500 font-bold uppercase text-xs tracking-tighter">{examData.error}</p>
          </div>
        ) : (
          <div className="w-full max-w-4xl flex flex-col items-center">
            {/* Summary Table */}
            <div className="w-full overflow-x-auto mb-8 shadow-sm">
              <table className="w-full border-collapse bg-[#f9f9f9] dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                <thead>
                  <tr className="bg-[#f0f0f0] dark:bg-slate-800">
                    <th className="border border-gray-300 dark:border-slate-700 p-2 md:p-3 text-[13px] font-bold text-black dark:text-white uppercase tracking-tight">Section</th>
                    <th className="border border-gray-300 dark:border-slate-700 p-2 md:p-3 text-[13px] font-bold text-black dark:text-white uppercase tracking-tight text-left">Subject</th>
                    <th className="border border-gray-300 dark:border-slate-700 p-2 md:p-3 text-[13px] font-bold text-black dark:text-white uppercase tracking-tight">Number of Questions</th>
                    <th className="border border-gray-300 dark:border-slate-700 p-2 md:p-3 text-[13px] font-bold text-black dark:text-white uppercase tracking-tight">Maximum Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {examData.subjects.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="border border-gray-200 dark:border-slate-800 p-2 md:p-3 text-center text-[13px] font-medium">{sub.section}</td>
                      <td className="border border-gray-200 dark:border-slate-800 p-2 md:p-3 text-left text-[13px] font-medium">{sub.subject_name}</td>
                      <td className="border border-gray-200 dark:border-slate-800 p-2 md:p-3 text-center text-[13px] font-medium">{sub.question_count}</td>
                      <td className="border border-gray-200 dark:border-slate-800 p-2 md:p-3 text-center text-[13px] font-medium">{sub.max_marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Instruction Paragraph */}
            <div className="w-full max-w-3xl text-center text-[#0000ff] dark:text-blue-400 font-bold text-sm md:text-base leading-relaxed mb-10 px-4">
              Once you click the <span className="text-red-600 dark:text-red-400">'Get Ready for the Test'</span> button below, the next page will display the <span className="text-red-600 dark:text-red-400">Start the Test</span> button. When you click <span className="text-red-600 dark:text-red-400">Start the Test</span>, the test gets loaded on the screen and the timer will begin. And you will get the maximum allotted time to complete the test. The remaining time will be shown at the top-right corner of the screen.
            </div>

            {/* Important Instruction Box */}
            <div className="w-full max-w-3xl border-2 border-[#ff3333] dark:border-red-600/50 bg-white dark:bg-slate-900/50 rounded-sm p-6 md:p-10 mb-12 shadow-[0_0_15px_rgba(255,0,0,0.1)] relative overflow-hidden group">
              <div className="flex items-center text-[#cc0000] dark:text-red-400 text-xl md:text-2xl font-bold mb-4">
                <span className="mr-3 text-2xl animate-pulse">⚠️</span> Important Instruction:
              </div>
              
              <div className="text-center font-bold text-sm md:text-base mb-4 text-black dark:text-slate-200">
                In case of any technical issue,
              </div>
              
              <ul className="list-disc pl-6 space-y-3 text-[13px] md:text-[14px] text-black dark:text-slate-300 font-medium">
                <li>Please do not panic.</li>
                <li>Raise your hand immediately to inform the invigilator.</li>
                <li>You may be re-assigned to another system immediately, if required.</li>
                <li>Please be assured that you will <span className="font-bold text-red-600 dark:text-red-400">NOT LOSE</span> any Examination <span className="font-bold text-red-600 dark:text-red-400">DATA or TIME</span>, as all progress is securely saved on the server.</li>
                <li>Once the test is resumed, the <span className="font-bold uppercase text-red-600 dark:text-red-400">EXAM TIMER WILL START FROM THE EXACT POINT OF DISRUPTION</span>, and all your <span className="font-bold uppercase text-red-600 dark:text-red-400">PREVIOUSLY SAVED ANSWERS WILL REMAIN INTACT.</span></li>
              </ul>
            </div>

            {/* Bottom Button Area */}
            <div className="flex items-center gap-3 mb-12">
              <span className="font-bold text-[14px] text-gray-700 dark:text-slate-300">Click here</span>
              <span className="text-[#0000ff] dark:text-blue-400 text-xl">&rarr;</span>
              <button 
                onClick={handleStartTest}
                className="bg-gradient-to-b from-[#33b5e5] to-[#0099cc] hover:from-[#0099cc] hover:to-[#007399] border border-[#006699] text-white px-8 py-2 font-bold text-[14px] rounded-sm shadow-md transition-all active:scale-95 uppercase tracking-wide"
              >
                Get ready for the Test
              </button>
            </div>
          </div>
        )}
      </main>

      <SSCFooter />
    </div>
  );
};

export default SSCSubjects;
