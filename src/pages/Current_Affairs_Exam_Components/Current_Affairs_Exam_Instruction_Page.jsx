import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, User, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FullscreenViolation from '../../components/NewUI/FullScreenViolation';
import WatermarkComponent from '../../components/NewUI/WatermarkComponent';
import { useStudentProfile } from '../../components/NewUI/StudentProfileData';
import axios from 'axios';

const Current_Affairs_Exam_Instruction_Page = () => {
  const { isDarkMode } = useTheme();
  const { user } = useStudentProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState(location.state?.quiz || null);
  const [activeTab, setActiveTab] = useState('en');
  const [isViolationVisible, setIsViolationVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(!location.state?.quiz);

  useEffect(() => {
    if (!quiz) {
      const year = location.state?.year || new Date().getFullYear();
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const month = location.state?.month || months[new Date().getMonth()];
      
      axios.get(`${import.meta.env.VITE_BASE_URL}api/CurrentAffairs/get_quiz_details.php?year=${year}&month=${month}`)
        .then(response => {
          if (response.data.status === 'success' && response.data.data) {
            setQuiz(response.data.data);
          } else {
            // Fallback to fetch all quizzes for the year and pick the latest one
            return axios.get(`${import.meta.env.VITE_BASE_URL}api/CurrentAffairs/get_quiz_details.php?year=${year}`);
          }
        })
        .then(fallbackResponse => {
            if (fallbackResponse && fallbackResponse.data.status === 'success' && fallbackResponse.data.data && fallbackResponse.data.data.length > 0) {
                // Set to the first available quiz for the year if month-specific failed
                setQuiz(fallbackResponse.data.data[0]);
            }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [quiz, location.state]);

  useEffect(() => {
    if (quiz && user?.id) {
      sessionStorage.removeItem(`ca_exam_end_time_${quiz.QuizID}_${user.id}`);
      sessionStorage.removeItem(`ca_quiz_data_${user.id}`);
    }
  }, [quiz, user?.id]);

  // Fullscreen Logic
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Fullscreen request failed:", err);
      }
    };

    enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsViolationVisible(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsViolationVisible(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleReturnToExam = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsViolationVisible(false);
    } catch (err) {
      console.warn("Failed to re-enter fullscreen:", err);
      setIsViolationVisible(false);
    }
  };

  const handleNext = () => {
    navigate('/current-affairs-exam/start', { state: { quiz } });
  };


  const handleGoBack = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn("Failed to exit fullscreen:", err);
    }
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f0f2f5] dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#cc0000]"></div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col font-sans transition-colors duration-300 overflow-hidden bg-[#f0f2f5] dark:bg-gray-900 text-gray-900 dark:text-white`}>
      <FullscreenViolation isVisible={isViolationVisible} onReturn={handleReturnToExam} />
      <WatermarkComponent text={user?.number} />
      {/* Header */}
      <header className={`bg-[#cc0000] dark:bg-red-900 text-white py-3 px-4 text-center text-xl md:text-2xl font-bold rounded-b-[40px] mx-2 md:mx-4 mb-2 z-10 shadow-md`}>
        {quiz?.Month || 'January'} {quiz?.Year || '2026'} current affairs Mock test
      </header>


      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row p-2 md:p-3 gap-2 md:gap-3 overflow-hidden relative">
        {/* Instruction Section */}
        <div className={`flex-1 flex flex-col rounded-xl border transition-all duration-300 shadow-sm overflow-hidden bg-white dark:bg-gray-800 border-[#d1d1d1] dark:border-gray-700`}>
          {/* Section Header */}
          <div className="p-3 md:p-4 flex justify-between items-center border-b dark:border-gray-700">
            <span className="bg-[#ff9800] text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full font-bold text-sm md:text-base shadow-sm">
              INSTRUCTIONS
            </span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
              <button
                onClick={() => setActiveTab('en')}
                className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${activeTab === 'en' ? 'bg-[#0091ea] text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                ENGLISH
              </button>
              <button
                onClick={() => setActiveTab('hi')}
                className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${activeTab === 'hi' ? 'bg-[#0091ea] text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                HINDI
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            <div className="prose dark:prose-invert max-w-none">
              {activeTab === 'en' ? (
                <div className="space-y-4 text-sm md:text-base">
                  <h3 className="text-lg font-bold text-[#0091ea]">General Instructions:</h3>
                  <ol className="list-decimal pl-5 space-y-4">
                    <li>Total duration of the exam was mentioned before starting the test.</li>
                    <li>The examination time will be governed by the server. A countdown timer displayed at the top right corner of the screen will indicate the remaining time. Once the timer reaches zero, the examination will automatically conclude; no manual submission is required.</li>
                    <li>The Question Palette displayed on the right side of the screen indicates the status of each question using the following symbols:
                      <div className="mt-3 space-y-3 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-800 dark:text-gray-200">01</div>
                          <span className="text-sm">You have not visited the question yet.</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-[#cc0000] text-white rounded-t-xl flex items-center justify-center text-[10px] font-bold">02</div>
                          <span className="text-sm">You have not answered the question.</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-[#2e7d32] text-white rounded-lg flex items-center justify-center text-[10px] font-bold">03</div>
                          <span className="text-sm">You have answered the question.</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-[#7b1fa2] text-white rounded-full flex items-center justify-center text-[10px] font-bold">04</div>
                          <span className="text-sm">You have NOT answered the question, but have marked the question for review.</span>
                        </div>
                        <div className="flex items-center gap-3 relative">
                          <div className="w-7 h-7 bg-[#7b1fa2] text-white rounded-full flex items-center justify-center text-[10px] font-bold">05</div>
                          <div className="absolute top-0 right-[calc(100%-1.75rem)] w-3 h-3 bg-[#2e7d32] rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                          <span className="text-sm">You have answered the question, but marked it for review.</span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium italic text-gray-600 dark:text-gray-400">
                        The “Marked for Review” status indicates that the candidate intends to revisit the question. If a question is answered and marked for review, the response will be considered for evaluation unless modified.
                      </p>
                    </li>
                    <li>
                      <p className="font-bold mb-1 underline">Navigation Instructions:</p>
                      <p className="mb-2">To answer the question, just do the following:</p>
                      <ul className="list-[lower-alpha] pl-6 space-y-2">
                        <li>Click on a question number in the Question Palette to navigate directly to that question. This action does not save the current response.</li>
                        <li>Click on <strong>Save & Next</strong> to save your response and proceed to the next question.</li>
                        <li>Click on <strong>Mark for Review & Next</strong> to save your response, mark the question for review, and proceed to the next question.</li>
                      </ul>
                      <p className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 text-xs font-bold text-red-700 dark:text-red-400">
                        Note: Responses will not be saved if you navigate to another question without clicking Save & Next or Mark for Review & Next.
                      </p>
                    </li>
                    <li>
                      <p className="font-bold mb-1 underline">Answering Instructions:</p>
                      <p className="mb-2">Procedure for answering a multiple choice (MCQ) type question:</p>
                      <ul className="list-[lower-alpha] pl-6 space-y-2">
                        <li>Select the correct option (A, B, C, or D) by clicking on the corresponding option.</li>
                        <li>To deselect an option, click on it again or use the <strong>Clear Response</strong> button.</li>
                        <li>To change your answer, select a different option.</li>
                        <li>Click on <strong>Save & Next</strong> to record your response.</li>
                      </ul>
                    </li>
                    <li>To mark a question for review, click on <strong>Mark for Review & Next</strong>. If an answer is provided and the question is marked for review, the response will be considered for evaluation unless changed.</li>
                    <li>To modify an already answered question, revisit the question and follow the standard answering procedure.</li>
                    <li>Only those questions for which responses have been saved or marked for review after answering will be considered for evaluation.</li>
                    <li>Candidates are advised to regularly monitor the timer and ensure timely completion of the examination.</li>
                    <li>Any form of malpractice or deviation from the prescribed instructions may result in disqualification.</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-4 text-sm md:text-base">
                  <h3 className="text-lg font-bold text-[#0091ea]">सामान्य निर्देश:</h3>
                  <ol className="list-decimal pl-5 space-y-4">
                    <li>परीक्षा की कुल अवधि टेस्ट शुरू होने से पहले बताई गई थी।</li>
                    <li>परीक्षा का समय सर्वर द्वारा नियंत्रित किया जाएगा। स्क्रीन के ऊपरी दाएं कोने में प्रदर्शित काउंटडाउन टाइमर शेष समय को इंगित करेगा। एक बार टाइमर शून्य पर पहुंचने के बाद, परीक्षा स्वचालित रूप से समाप्त हो जाएगी; कोई मैनुअल सबमिशन आवश्यक नहीं है।</li>
                    <li>स्क्रीन के दाईं ओर प्रदर्शित प्रश्न पैलेट निम्नलिखित प्रतीकों का उपयोग करके प्रत्येक प्रश्न की स्थिति को इंगित करता है:
                      <div className="mt-3 space-y-3 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-800 dark:text-gray-200">01</div>
                          <span className="text-sm">आपने अभी तक प्रश्न नहीं देखा है।</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-[#cc0000] text-white rounded-t-xl flex items-center justify-center text-[10px] font-bold">02</div>
                          <span className="text-sm">आपने प्रश्न का उत्तर नहीं दिया है।</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-[#2e7d32] text-white rounded-lg flex items-center justify-center text-[10px] font-bold">03</div>
                          <span className="text-sm">आपने प्रश्न का उत्तर दे दिया है।</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-[#7b1fa2] text-white rounded-full flex items-center justify-center text-[10px] font-bold">04</div>
                          <span className="text-sm">आपने प्रश्न का उत्तर नहीं दिया है, लेकिन समीक्षा के लिए चिह्नित किया है।</span>
                        </div>
                        <div className="flex items-center gap-3 relative">
                          <div className="w-7 h-7 bg-[#7b1fa2] text-white rounded-full flex items-center justify-center text-[10px] font-bold">05</div>
                          <div className="absolute top-0 right-[calc(100%-1.75rem)] w-3 h-3 bg-[#2e7d32] rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                          <span className="text-sm">आपने प्रश्न का उत्तर दे दिया है, लेकिन समीक्षा के लिए चिह्नित किया है।</span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium italic text-gray-600 dark:text-gray-400">
                        "समीक्षा के लिए चिह्नित" स्थिति इंगित करती है कि उम्मीदवार प्रश्न पर फिर से विचार करना चाहता है। यदि किसी प्रश्न का उत्तर दिया जाता है और समीक्षा के लिए चिह्नित किया जाता है, तो प्रतिक्रिया को मूल्यांकन के लिए माना जाएगा जब तक कि संशोधित न किया जाए।
                      </p>
                    </li>
                    <li>
                      <p className="font-bold mb-1 underline">नेविगेशन निर्देश:</p>
                      <p className="mb-2">प्रश्न का उत्तर देने के लिए, बस निम्नलिखित करें:</p>
                      <ul className="list-[lower-alpha] pl-6 space-y-2">
                        <li>सीधे उस प्रश्न पर जाने के लिए प्रश्न पैलेट में प्रश्न संख्या पर क्लिक करें। यह क्रिया वर्तमान प्रतिक्रिया को सहेजती नहीं है।</li>
                        <li>अपनी प्रतिक्रिया को सहेजने और अगले प्रश्न पर जाने के लिए <strong>Save & Next</strong> पर क्लिक करें।</li>
                        <li>अपनी प्रतिक्रिया को सहेजने, समीक्षा के लिए प्रश्न को चिह्नित करने और अगले प्रश्न पर जाने के लिए <strong>Mark for Review & Next</strong> पर क्लिक करें।</li>
                      </ul>
                      <p className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 text-xs font-bold text-red-700 dark:text-red-400">
                        नोट: यदि आप 'Save & Next' या 'Mark for Review & Next' पर क्लिक किए बिना किसी अन्य प्रश्न पर जाते हैं तो प्रतिक्रियाएं सहेजी नहीं जाएंगी।
                      </p>
                    </li>
                    <li>
                      <p className="font-bold mb-1 underline">उत्तर देने के निर्देश:</p>
                      <p className="mb-2">बहुविकल्पीय (MCQ) प्रकार के प्रश्न का उत्तर देने की प्रक्रिया:</p>
                      <ul className="list-[lower-alpha] pl-6 space-y-2">
                        <li>संबंधित विकल्प पर क्लिक करके सही विकल्प (A, B, C, या D) चुनें।</li>
                        <li>किसी विकल्प को अचयनित करने के लिए, उस पर फिर से क्लिक करें या <strong>Clear Response</strong> बटन का उपयोग करें।</li>
                        <li>अपना उत्तर बदलने के लिए, एक अलग विकल्प चुनें।</li>
                        <li>अपनी प्रतिक्रिया रिकॉर्ड करने के लिए <strong>Save & Next</strong> पर क्लिक करें।</li>
                      </ul>
                    </li>
                    <li>किसी प्रश्न को समीक्षा के लिए चिह्नित करने के लिए, <strong>Mark for Review & Next</strong> पर क्लिक करें। यदि उत्तर दिया गया है और प्रश्न को समीक्षा के लिए चिह्नित किया गया है, तो प्रतिक्रिया को मूल्यांकन के लिए माना जाएगा जब तक कि बदला न जाए।</li>
                    <li>पहले से उत्तर दिए गए प्रश्न को संशोधित करने के लिए, प्रश्न पर दोबारा जाएं और मानक उत्तर देने की प्रक्रिया का पालन करें।</li>
                    <li>केवल उन्हीं प्रश्नों पर मूल्यांकन के लिए विचार किया जाएगा जिनके उत्तर सहेजे गए हैं या उत्तर देने के बाद समीक्षा के लिए चिह्नित किए गए हैं।</li>
                    <li>उम्मीदवारों को सलाह दी जाती है कि वे नियमित रूप से टाइमर की निगरानी करें और परीक्षा को समय पर पूरा करना सुनिश्चित करें।</li>
                    <li>किसी भी प्रकार के कदाचार या निर्धारित निर्देशों से विचलन के परिणामस्वरूप अयोग्यता हो सकती है।</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 flex justify-between border-t dark:border-gray-700">
            <button
              onClick={handleGoBack}
              className="text-[#0091ea] hover:underline font-bold text-sm md:text-base"
            >
              &larr; Back to Dashboard
            </button>
            <button
              onClick={handleNext}
              className="bg-[#ff9800] hover:bg-[#f57c00] text-white px-8 md:px-12 py-2 rounded-lg font-bold text-sm md:text-base shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              Next
            </button>
          </div>
        </div>

        {/* Sidebar Profile */}
        <div className="hidden md:flex w-[320px] flex-col p-4 rounded-2xl border transition-colors bg-[#e1f5fe] dark:bg-gray-800 border-[#b3e5fc] dark:border-gray-700">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-20 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600 overflow-hidden">
              {user?.photo ? (
                <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-gray-400" />
              )}
            </div>
            <div className="w-16 h-20 bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-500 rounded-lg flex items-center justify-center">
              <Camera size={32} className="text-gray-600 dark:text-gray-300" />
            </div>
          </div>
          <div className="text-center font-bold mb-4 uppercase tracking-wide">{user.name}</div>

          {/* CA Image Integration */}
          <div className="mb-4 rounded-xl overflow-hidden border border-[#b3e5fc] dark:border-gray-700 shadow-sm">
            <img src="/img/CA1.png" alt="Current Affairs" className="w-full h-auto block" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Current_Affairs_Exam_Instruction_Page;
