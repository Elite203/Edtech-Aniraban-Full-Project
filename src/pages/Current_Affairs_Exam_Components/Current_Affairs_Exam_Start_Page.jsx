import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, User, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FullscreenViolation from '../../components/NewUI/FullScreenViolation';
import WatermarkComponent from '../../components/NewUI/WatermarkComponent';
import { useStudentProfile } from '../../components/NewUI/StudentProfileData';

const Current_Affairs_Exam_Start_Page = () => {
    const { isDarkMode } = useTheme();
    const { user } = useStudentProfile();
    const navigate = useNavigate();
    const location = useLocation();
    const quiz = location.state?.quiz;
    const [activeTab, setActiveTab] = useState('en');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isViolationVisible, setIsViolationVisible] = useState(false);

    useEffect(() => {
        if (!quiz) {
            navigate('/current-affairs');
        }
    }, [quiz]);

    useEffect(() => {
        if (quiz && user?.id) {
            sessionStorage.removeItem(`ca_exam_end_time_${quiz.QuizID}_${user.id}`);
            sessionStorage.removeItem(`ca_quiz_data_${user.id}`);
        }
    }, [quiz, user?.id]);


    // Fullscreen Logic
    useEffect(() => {
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

    const handleBegin = () => {
        if (agreed && selectedLanguage) {
            navigate('/current-affairs-exam/question', {
                state: {
                    quiz: quiz,
                    language: selectedLanguage
                }
            });
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className={`h-screen flex flex-col font-sans transition-colors duration-300 overflow-hidden bg-[#f0f2f5] dark:bg-gray-900 text-gray-900 dark:text-white`}>
            <FullscreenViolation isVisible={isViolationVisible} onReturn={handleReturnToExam} />
            <WatermarkComponent text={user?.number} />
            {/* Header */}
            <header className={`bg-[#cc0000] dark:bg-red-900 text-white py-3 px-4 text-center text-xl md:text-2xl font-bold rounded-b-[40px] mx-2 md:mx-4 mb-2 z-10 shadow-md`}>
                {quiz?.Month} {quiz?.Year} current affairs Mock test
            </header>

            {/* Main Container */}
            <div className="flex-1 flex flex-col md:flex-row p-2 md:p-3 gap-2 md:gap-3 overflow-hidden relative">
                {/* Start Section */}
                <div className={`flex-1 flex flex-col rounded-xl border transition-all duration-300 shadow-sm overflow-hidden bg-white dark:bg-gray-800 border-[#d1d1d1] dark:border-gray-700`}>
                    {/* Section Header */}
                    <div className="p-3 md:p-4 flex justify-between items-center border-b dark:border-gray-700">
                        <span className="bg-[#ff9800] text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full font-bold text-sm md:text-base shadow-sm">
                            FINAL PREPARATION
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
                        <div className="space-y-6">
                            {/* Exam Stats Header */}
                            <div className="grid grid-cols-2 md:flex md:flex-row justify-between border-b-2 border-red-600 pb-2 mb-4 gap-2">
                                <div className="font-bold text-[11px] md:text-sm uppercase">DURATION: <span className="text-red-600">{quiz?.OverallTime} Mins</span></div>
                                <div className="font-bold text-[11px] md:text-sm uppercase">MAX MARKS: <span className="text-red-600">{quiz?.MaxMarks}</span></div>
                                <div className="font-bold text-[11px] md:text-sm uppercase">POSITIVE: <span className="text-green-600">+{quiz?.PositiveMarking || 0}</span></div>
                                <div className="font-bold text-[11px] md:text-sm uppercase">NEGATIVE: <span className="text-red-600">-{quiz?.NegativeMarking || 0}</span></div>
                            </div>

                            <div className="prose dark:prose-invert max-w-none space-y-6 text-sm md:text-base">
                                {activeTab === 'en' ? (
                                    <>
                                        <div>
                                            <h4 className="font-bold underline mb-2">Read the following Instructions carefully:</h4>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>Total Time: <strong>{quiz?.OverallTime} Minutes</strong></li>
                                                <li>Total Marks: <strong>{quiz?.MaxMarks}</strong></li>
                                                <li>Positive Marking: <strong>{quiz?.PositiveMarking}</strong></li>
                                                <li>Negative Marking: <strong>{quiz?.NegativeMarking}</strong></li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-bold underline mb-1">Marking Scheme:</h4>
                                            <p>Each correct answer carries the marks specified above.</p>
                                            <ul className="list-disc pl-5">
                                                <li>Negative Marking: <strong>{quiz?.NegativeMarking > 0 ? quiz.NegativeMarking : 'None'}</strong></li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-bold underline mb-1">Passing Criteria:</h4>
                                            <ul className="list-disc pl-5">
                                                <li>General: <strong>{quiz?.Passing_General}</strong>, OBC: <strong>{quiz?.Passing_OBC}</strong></li>
                                                <li>SC: <strong>{quiz?.Passing_SC}</strong>, ST: <strong>{quiz?.Passing_ST}</strong></li>
                                                <li>EWS: <strong>{quiz?.Passing_EWS}</strong>, PWD: <strong>{quiz?.Passing_PWD}</strong></li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-bold underline mb-2">General Instructions:</h4>
                                            <ol className="list-decimal pl-5 space-y-3">
                                                <li>Read all questions carefully before answering & Attempt all questions to the best of your knowledge or by reading our <strong>COMPLETE CURRENT AFFAIRS FREE CONTENT</strong>.</li>
                                                <li>Each question has 4 options out of which only one is correct.</li>
                                                <li>Manage your time effectively.</li>
                                                <li>Do not spend too much time on a single question; move on and return to it later if needed.</li>
                                                <li>Do not engage in any unfair means during the test.</li>
                                                <li>There is no negative marking if you have not attempted the question.</li>
                                            </ol>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <h4 className="font-bold underline mb-2">निम्नलिखित निर्देशों को ध्यानपूर्वक पढ़ें:</h4>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>कुल समय: <strong>{quiz?.OverallTime} मिनट</strong></li>
                                                <li>कुल अंक: <strong>{quiz?.MaxMarks}</strong></li>
                                                <li>सकारात्मक अंकन: <strong>{quiz?.PositiveMarking}</strong></li>
                                                <li>नकारात्मक अंकन: <strong>{quiz?.NegativeMarking}</strong></li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-bold underline mb-1">अंकन योजना (Marking Scheme):</h4>
                                            <p>प्रत्येक सही उत्तर के लिए ऊपर निर्दिष्ट अंक दिए जाएंगे।</p>
                                            <ul className="list-disc pl-5">
                                                <li>नकारात्मक अंकन: <strong>{quiz?.NegativeMarking > 0 ? quiz.NegativeMarking : 'कोई नहीं'}</strong></li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-bold underline mb-1">उत्तीर्ण होने का मानदंड:</h4>
                                            <ul className="list-disc pl-5">
                                                <li>General: <strong>{quiz?.Passing_General}</strong>, OBC: <strong>{quiz?.Passing_OBC}</strong></li>
                                                <li>SC: <strong>{quiz?.Passing_SC}</strong>, ST: <strong>{quiz?.Passing_ST}</strong></li>
                                                <li>EWS: <strong>{quiz?.Passing_EWS}</strong>, PWD: <strong>{quiz?.Passing_PWD}</strong></li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-bold underline mb-2">सामान्य निर्देश:</h4>
                                            <ol className="list-decimal pl-5 space-y-3">
                                                <li>उत्तर देने से पहले सभी प्रश्नों को ध्यानपूर्वक पढ़ें और अपने सर्वोत्तम ज्ञान के अनुसार या हमारी <strong>COMPLETE CURRENT AFFAIRS FREE CONTENT</strong> पढ़कर सभी प्रश्नों का प्रयास करें।</li>
                                                <li>प्रत्येक प्रश्न के 4 विकल्प हैं जिनमें से केवल एक सही है।</li>
                                                <li>अपने समय का प्रभावी ढंग से प्रबंधन करें।</li>
                                                <li>एक ही प्रश्न पर बहुत अधिक समय न बिताएं; आगे बढ़ें और यदि आवश्यक हो तो बाद में उस पर लौटें।</li>
                                                <li>परीक्षण के दौरान किसी भी अनुचित साधन में शामिल न हों।</li>
                                                <li>यदि आपने प्रश्न का प्रयास नहीं किया है तो कोई नकारात्मक अंकन नहीं है।</li>
                                            </ol>
                                        </div>
                                    </>
                                )}

                                <div className="border-t border-dashed border-gray-400 dark:border-gray-600 pt-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                        <label className="font-bold whitespace-nowrap">
                                            {activeTab === 'en' ? 'Choose your default language:' : 'अपनी डिफ़ॉल्ट भाषा चुनें:'}
                                        </label>
                                        <select
                                            value={selectedLanguage}
                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#0091ea] outline-none min-w-[200px]"
                                        >
                                            <option value="">-- {activeTab === 'en' ? 'Select' : 'चुनें'} --</option>
                                            <option value="en">English</option>
                                            <option value="hi">Hindi</option>
                                        </select>
                                    </div>
                                    <p className="text-xs text-red-500 italic">
                                        {activeTab === 'en'
                                            ? 'Please note all questions will appear in your default language. This language can be changed for a particular question later on.'
                                            : 'कृपया ध्यान दें कि सभी प्रश्न आपकी डिफ़ॉल्ट भाषा में दिखाई देंगे। इस भाषा को बाद में किसी विशेष प्रश्न के लिए बदला जा सकता है।'}
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h4 className="font-bold underline mb-4">{activeTab === 'en' ? 'Declaration:' : 'घोषणा:'}</h4>
                                    <label className="flex items-start gap-4 cursor-pointer group">
                                        <div className="relative flex items-center mt-1">
                                            <input
                                                type="checkbox"
                                                checked={agreed}
                                                onChange={(e) => setAgreed(e.target.checked)}
                                                className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                            />
                                        </div>
                                        <span className="text-xs md:text-sm leading-relaxed text-justify">
                                            {activeTab === 'en' ? (
                                                <>
                                                    I have read all the instructions carefully and have understood them. I agree to abide by all the
                                                    rules and regulations governing this examination and will not engage in any form of cheating or
                                                    unfair practices. I understand that using unfair means of any sort for my own or someone else's
                                                    advantage will lead to my immediate disqualification. The decision of <strong>Anirbansacademy.com</strong> in
                                                    all such matters shall be final, binding, and not subject to any appeal or challenge.
                                                </>
                                            ) : (
                                                <>
                                                    मैंने सभी निर्देशों को ध्यान से पढ़ा है और उन्हें समझ लिया है। मैं इस परीक्षा को नियंत्रित करने वाले सभी नियमों और विनियमों का पालन करने के लिए सहमत हूं और किसी भी प्रकार की धोखाधड़ी या अनुचित प्रथाओं में शामिल नहीं होऊंगा। मैं समझता हूं कि अपने या किसी और के लाभ के लिए किसी भी प्रकार के अनुचित साधनों का उपयोग करने से मेरी तत्काल अयोग्यता हो जाएगी। ऐसे सभी मामलों में <strong>Anirbansacademy.com</strong> का निर्णय अंतिम, बाध्यकारी और किसी भी अपील या चुनौती के अधीन नहीं होगा।
                                                </>
                                            )}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t dark:border-gray-700">
                        <button
                            onClick={handleGoBack}
                            className="text-[#0091ea] hover:underline font-bold text-sm md:text-base"
                        >
                            &larr; Previous Instructions
                        </button>
                        <button
                            onClick={handleBegin}
                            disabled={!agreed || !selectedLanguage}
                            className={`w-full md:w-auto px-12 md:px-16 py-3 rounded-xl font-bold text-lg shadow-md transition-all ${agreed && selectedLanguage
                                ? 'bg-[#0091ea] hover:bg-[#0081d5] text-white hover:scale-105 active:scale-95'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                                }`}


























                        >
                            {activeTab === 'en' ? 'I am ready to begin' : 'मैं शुरू करने के लिए तैयार हूँ'}
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
                    <div className="mb-4 rounded-xl overflow-hidden border border-[#b3e5fc] dark:border-gray-700 shadow-sm p-1">
                        <img src="/img/CA2.png" alt="Current Affairs" className="w-full h-auto block rounded-lg" />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Current_Affairs_Exam_Start_Page;
