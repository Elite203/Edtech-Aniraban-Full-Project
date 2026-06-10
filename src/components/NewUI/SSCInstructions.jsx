import React, { useState, useEffect } from 'react';
import SSCHeader from './SSCHeader';
import SSCFooter from './SSCFooter';
import WatermarkComponent from './WatermarkComponent';
import FullscreenViolation from './FullScreenViolation';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStudentProfile } from './StudentProfileData';

const SSCInstructions = () => {
  const [isViolationVisible, setIsViolationVisible] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isNewAttempt = queryParams.get("new_attempt") === "true";
  
  const [examData, setExamData] = useState({
    duration: 0,
    totalQuestions: 0,
    negativeMarking: 0,
    subjects: [],
    hasSectionalTiming: false,
    loading: true,
    error: null
  });
  const navigate = useNavigate();
  const { user } = useStudentProfile();

  const setName = location.state?.setName || localStorage.getItem('sscSetName') || "SSC-Mock Test";
  const examSetId = location.state?.examSetId || localStorage.getItem('sscExamSetId');
  const courseId = location.state?.courseId || location.state?.course_id || localStorage.getItem('sscCourseId');
  const setNumber = location.state?.setNumber || location.state?.set_number || localStorage.getItem('sscSetNumber');

  useEffect(() => {
    const fetchExamData = async () => {
      if (!examSetId) {
        setExamData(prev => ({ ...prev, loading: false, error: "Exam Set ID not found" }));
        return;
      }

      try {
        const [statsRes, timingRes, negRes, marksRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Exams/get_set_stats.php?exam_set_id=${examSetId}`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/TimeManagement/get_exam_timing_details.php?exam_set_id=${examSetId}`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Marks/manage_negative_marking.php?exam_set_id=${examSetId}`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Marks/manage_exam_subjects_marks.php?exam_set_id=${examSetId}`)
        ]);

        const [stats, timing, neg, marks] = await Promise.all([
          statsRes.json(),
          timingRes.json(),
          negRes.json(),
          marksRes.json()
        ]);

        if (marks.success && timing.success && neg.success) {
          // Fetch overviews for each subject to get accurate question counts (including sub-questions)
          const overviews = await Promise.all(
            marks.data.map(sub => 
              fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Questions/get_subject_overview.php?subject_id=${sub.id}`)
                .then(res => res.json())
                .catch(() => ({ success: false }))
            )
          );

          // Determine the correct active duration
          const activeDuration = 
            timing.data.sectional_timing.total_calculated_sectional_time || 
            timing.data.subject_wise_timing.total_calculated_subject_time || 
            timing.data.overall_timing.total_time_minutes || 0;

          // Merge subject data
          const mergedSubjects = marks.data.map((sub, idx) => {
            const overview = overviews[idx];
            const timeInfo = timing.data.subject_wise_timing.subjects.find(s => s.subject_name === sub.subject_name);
            const sectionalInfo = timing.data.sectional_timing.sections.find(sec => 
              sec.subjects_in_section.some(ss => ss.subject_name === sub.subject_name)
            );

            return {
              ...sub,
              question_count: (overview && overview.success) ? overview.data.total_answerable : 0,
              time_allocated: timeInfo ? timeInfo.time_allocated : 0,
              section_number: sectionalInfo ? `PART-${String.fromCharCode(64 + parseInt(sectionalInfo.section_number))}` : '-'
            };
          });

          const totalQuestionsCount = mergedSubjects.reduce((sum, s) => sum + s.question_count, 0);

          setExamData({
            duration: activeDuration,
            totalQuestions: totalQuestionsCount,
            negativeMarking: neg.data.negative_marking,
            subjects: mergedSubjects,
            hasSectionalTiming: timing.data.sectional_timing.total_sections > 0,
            loading: false,
            error: null
          });
        } else {
          setExamData(prev => ({ ...prev, loading: false, error: "Failed to fetch exam details" }));
        }
      } catch (err) {
        console.error("Error fetching exam data:", err);
        setExamData(prev => ({ ...prev, loading: false, error: "Connection error" }));
      }
    };

    fetchExamData();
  }, [examSetId]);

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
    if (isNewAttempt) return;
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
  }, [isNewAttempt]);

  // Ensure a fresh start by clearing any old exam state from localStorage when landing on Instructions
  useEffect(() => {
    if (examSetId) {
      localStorage.removeItem(`sscExamState_${examSetId}`);
      localStorage.removeItem(`sscTimeLeft_${examSetId}`);
      localStorage.removeItem(`sscOverallTime_${examSetId}`);
    }
  }, [examSetId]);

  if (examData.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-xl font-bold animate-pulse text-blue-600">Loading instructions...</div>
      </div>
    );
  }

  if (examData.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-4">
        <div className="text-xl font-bold text-red-600 mb-4">{examData.error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-900 text-black dark:text-white">
      <FullscreenViolation isVisible={isViolationVisible} onReturn={enterFullscreen} />
      
      {/* Fixed Watermark Layer */}
      <WatermarkComponent text={user?.number} />

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <SSCHeader user={user} />

        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          <div className="instruction-header bg-[#dcd6c5] dark:bg-slate-800 p-2 px-4 font-bold text-[14px] border-b border-gray-400 dark:border-slate-600 mb-5 text-center sm:text-left">
            Instructions, Terms & Conditions - {setName}
          </div>

          <div className="content-area space-y-6">
            <section>
              <h2 className="section-title font-bold text-[14px] mb-2 mt-4">1. Exam Overview / परीक्षा का संक्षिप्त विवरण</h2>
              <ul className="list-disc ml-6 space-y-2 text-[13px]">
                <li>Duration: <span className="text-blue-700 dark:text-blue-400 font-bold">{examData.duration} minutes</span> / समयावधि: <span className="text-blue-700 dark:text-blue-400 font-bold">{examData.duration} मिनट</span></li>
                <li>Total Questions: <span className="text-blue-700 dark:text-blue-400 font-bold">{examData.totalQuestions}</span> / कुल प्रश्न: <span className="text-blue-700 dark:text-blue-400 font-bold">{examData.totalQuestions}</span></li>
                <li>Negative Marking: <span className="text-blue-700 dark:text-blue-400 font-bold">{examData.negativeMarking}</span> marks deducted for each wrong answer. / ऋणात्मक अंकन: प्रत्येक गलत उत्तर पर <span className="text-blue-700 dark:text-blue-400 font-bold">{examData.negativeMarking}</span> अंक काटे जाएंगे।</li>
                <li>Number of Sections: <span className="text-blue-700 dark:text-blue-400 font-bold">{examData.subjects.length}</span> / अनुभागों की संख्या: <span className="text-blue-700 dark:text-blue-400 font-bold">{examData.subjects.length}</span></li>
              </ul>

              <div className="overflow-x-auto mt-4">
                <table className="exam-table w-full max-w-[800px] border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-gray-400 dark:bg-slate-700 text-black dark:text-white">
                      {examData.hasSectionalTiming && <th className="border border-white p-2 text-center font-bold">Section</th>}
                      <th className="border border-white p-2 text-left font-bold">Subject</th>
                      <th className="border border-white p-2 text-center font-bold">Number of Questions</th>
                      <th className="border border-white p-2 text-center font-bold">Maximum Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examData.subjects.map((sub, index) => (
                      <tr key={sub.id} className={index % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-[#f9f9f9] dark:bg-slate-700/50"}>
                        {examData.hasSectionalTiming && <td className="border border-gray-300 dark:border-slate-600 p-2 text-center">{sub.section_number}</td>}
                        <td className="border border-gray-300 dark:border-slate-600 p-2 text-left">{sub.subject_name}</td>
                        <td className="border border-gray-300 dark:border-slate-600 p-2 text-center">{sub.question_count}</td>
                        <td className="border border-gray-300 dark:border-slate-600 p-2 text-center">{sub.sub_marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="section-title font-bold text-[14px] mb-2 mt-4">2. Timing & Submission / समय और उत्तर जमा करना</h2>
              <ul className="list-disc ml-6 space-y-2 text-[13px]">
                <li>The timer (top right) is server-controlled; Remaining time appears top right.<br/>ऊपरी दाएँ कोने में टाइमर सर्वर-नियंत्रित है; शेष समय वहीं दिखेगा।</li>
                <li>The exam auto-submits when time ends—no manual submission required.<br/>समय समाप्त होने पर परीक्षा स्वतः सबमिट हो जाएगी — मैन्युअल सबमिशन की आवश्यकता नहीं है।</li>
                <li>At the end, you may be asked to take a photo (ensure your face is aligned with area delineated). After seeing the "Thank you" message, raise your hand and on approval proceed for exit verification.<br/>अंत में, आपसे एक फोटो लेने को कहा जा सकता है ( सुनिश्चित करें कि आपका चेहरा चिह्नित क्षेत्र के भीतर हो) "Thank you" संदेश दिखाई देने के बाद, अपना हाथ उठाएँ और स्वीकृति मिलने के बाद ही बाहर निकलने की प्रक्रिया पूरी करें।</li>
              </ul>
            </section>

            <section>
              <h2 className="section-title font-bold text-[14px] mb-2 mt-4">3. Language / भाषा</h2>
              <ul className="list-disc ml-6 space-y-2 text-[13px]">
                <li>MCQ sections may be displayed in English, Hindi based on your language selection.<br/>MCQ अनुभाग अंग्रेज़ी, हिंदी में दिख सकते हैं — आपके द्वारा की गई भाषा चयन के आधार पर</li>
                <li>You can change your selection during the examination.<br/>आप भाषा चयन परीक्षा के दौरान बदल सकते हैं।</li>
                <li>For language-oriented sections, questions will be displayed in the selected language only.<br/>भाषा आधारित अनुभागों में प्रश्न केवल चयनित भाषा में ही प्रदर्शित होंगे।</li>
              </ul>
            </section>

            <section>
              <h2 className="section-title font-bold text-[14px] mb-2 mt-4">4. Navigation / नेविगेशन (परीक्षा में चलना)</h2>
              <ul className="list-disc ml-6 space-y-2 text-[13px]">
                <li>All sections are always visible, you can move freely between sections or questions in any order by clicking section names (top left) or question numbers.<br/>सभी अनुभाग हमेशा दिखाई देते हैं; आप किसी भी अनुभाग या प्रश्न पर सीधे क्लिक कर के जा सकते हैं।</li>
                <li>Use Previous or Save & Next to move between questions; use Mark for Review button to flag questions you wish to revisit later.<br/>प्रश्नों के बीच जाने के लिए Previous या Save & Next का उपयोग करें; किसी प्रश्न को बाद में देखने के लिए Mark for Review बटन दबाएँ।</li>
                <li>After the last question in a section, Save & Next takes you to the next section.<br/>किसी अनुभाग का अंतिम प्रश्न पूरा करने के बाद Save & Next अगला अनुभाग खोलेगा।</li>
              </ul>
            </section>

            <section>
              <h2 className="section-title font-bold text-[14px] mb-2 mt-4">5. Answering / उत्तर देना</h2>
              <ul className="list-disc ml-6 space-y-2 text-[13px]">
                <li>Each question has four options, out of which only one is correct. Select or change your answer at any time before saving.<br/>हर प्रश्न के चार विकल्प होते हैं, जिनमें से केवल एक ही सही होता है। सहेजने से पहले किसी भी समय अपना उत्तर चुनें या बदलें।</li>
                <li>Answers are saved only after clicking <b>Save & Next</b>.<br/>उत्तर चुनें या बदलें, लेकिन Save & Next पर क्लिक करने के बाद ही उत्तर सुरक्षित होता है।</li>
                <li>To change a saved answer, revisit and update it, then save again.<br/>अगर उत्तर बदलना है, तो प्रश्न पर फिर से जाकर नया उत्तर दें और फिर से सुरक्षित करें।</li>
              </ul>
            </section>

            <section>
              <h2 className="section-title font-bold text-[14px] mb-2 mt-4">6. Additional Notes / अतिरिक्त निर्देश</h2>
              <ul className="list-disc ml-6 space-y-2 text-[13px]">
                <li>Maintain silence in the exam hall and do not engage in any communication with other candidates.<br/>परीक्षा कक्ष में शांति बनाए रखें और अन्य उम्मीदवारों से बात न करें।</li>
                <li>The system saves responses for each question and auto-submits when time ends.<br/>हर उत्तर स्वचालित रूप से सिस्टम में सुरक्षित होता है और समय समाप्त होने पर स्वचालित रूप से जमा हो जाता है।</li>
                <li>If you have any queries regarding exam content, raise your hand and seek invigilator assistance without disturbing others.<br/>परीक्षा सामग्री से संबंधित कोई प्रश्न हो, तो हाथ उठाकर निरीक्षक से सहायता लें, दूसरों को परेशान न करें।</li>
                <li>In case of a technical issue (system hang, network loss, or power failure), immediately inform the invigilator without attempting to resolve it on your own.<br/>तकनीकी समस्या (सिस्टम हैंग, नेटवर्क फेल या बिजली चली जाना) होने पर निरीक्षक को तुरंत सूचित करें; स्वयं हल करने का प्रयास न करें।</li>
                <li>Bathroom breaks or leaving your seat are not allowed during the exam.<br/>परीक्षा के दौरान बाथरूम ब्रेक या सीट छोड़ने की अनुमति नहीं है।</li>
                <li>All exam materials (Rough sheets, pens) provided must be returned to the invigilator before exiting the exam hall.<br/>सभी परीक्षा सामग्री (रफ़ शीट, पेन) परीक्षा समाप्त होने पर निरीक्षक को लौटानी होगी।</li>
                <li>Do not attempt to capture screenshots or take photos of the exam screen at any time.<br/>किसी भी समय परीक्षा स्क्रीन की तस्वीर या स्क्रीनशॉट लेने का प्रयास न करें।</li>
                <li>Use only the designated computer and do not switch systems during the exam.<br/>केवल निर्दिष्ट कंप्यूटर का उपयोग करें और परीक्षा के दौरान सिस्टम न बदलें।</li>
                <li>Any attempt to use unfair means or malpractice will result in disqualification.<br/>अगर कोई अनुचित साधनों या नकल का प्रयास किया गया, तो आपकी परीक्षा रद्द कर दी जाएगी।</li>
                <li>Remain seated until the invigilator announces the end of the exam and confirms completion of all formalities.<br/>परीक्षा पूरी होने तक अपनी सीट पर बैठे रहें और निरीक्षक द्वारा औपचारिकताओं की पुष्टि होने के बाद ही उठें।</li>
                <li>Do not discuss or share any questions or answers with other candidates in the examination hall.<br/>परीक्षा कक्ष में किसी अन्य उम्मीदवार से प्रश्न या उत्तर पर चर्चा न करें और न ही साझा करें।</li>
              </ul>
            </section>
          </div>

          <div className="footer-area flex flex-col items-center mt-8 mb-8 gap-4">
            <div className="good-luck font-bold text-[12px]">Good Luck.</div>
            <div className="buttons-row flex gap-5">
              <button 
                className="action-btn bg-gradient-to-b from-[#f0e6cf] to-[#dcd6c5] dark:from-slate-700 dark:to-slate-800 border border-gray-400 dark:border-slate-600 px-6 py-1 font-bold text-[13px] shadow-sm hover:brightness-95 active:scale-95 transition-all"
                onClick={() => navigate('/ssc/custom', { state: { setName, examSetId, courseId, setNumber } })}
              >
                Back
              </button>
              <button 
                className="action-btn bg-gradient-to-b from-[#f0e6cf] to-[#dcd6c5] dark:from-slate-700 dark:to-slate-800 border border-gray-400 dark:border-slate-600 px-6 py-1 font-bold text-[13px] shadow-sm hover:brightness-95 active:scale-95 transition-all"
                onClick={() => navigate('/ssc/symbols', { state: { setName, examSetId, courseId, setNumber } })}
              >
                I Agree
              </button>
            </div>
          </div>
        </main>

        <SSCFooter />
      </div>
    </div>
  );
};

export default SSCInstructions;
