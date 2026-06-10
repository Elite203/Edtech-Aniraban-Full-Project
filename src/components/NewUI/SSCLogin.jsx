import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SSCHeader from './SSCHeader';
import SSCFooter from './SSCFooter';
import FullscreenViolation from './FullscreenViolation';
import { useStudentProfile } from './StudentProfileData';
import WatermarkComponent from './WatermarkComponent';
import { useToast } from '../ui/use-toast';

const SSCLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useStudentProfile();
  const { toast } = useToast();
  const userName = user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";
  const [password, setPassword] = useState('');
  const [isViolationVisible, setIsViolationVisible] = useState(false);
  const currentYear = new Date().getFullYear();
  const setName = location.state?.setName || localStorage.getItem('sscSetName') || "SSC-Mock Test";
  const examSetId = location.state?.examSetId || localStorage.getItem('sscExamSetId');
  const courseId = location.state?.courseId || location.state?.course_id || localStorage.getItem('sscCourseId');
  const setNumber = location.state?.setNumber || location.state?.set_number || localStorage.getItem('sscSetNumber');

  const expectedPassword = (user.first_name || user.name || "User").substring(0, 4).toUpperCase() + (user.number?.substring(0, 4) || "");

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

  const typeChar = (char) => setPassword(prev => prev + char);
  const backspace = () => setPassword(prev => prev.slice(0, -1));

  const handleLogin = () => {
    if (password === expectedPassword) {
      // Logic for successful login can be added here
      navigate('/ssc/verify', { state: { setName, examSetId, courseId, setNumber } });
    } else {
      toast({
        title: "Invalid Password",
        description: `Please enter the correct password. Hint: ${expectedPassword}`,
        variant: "destructive",
      });
    }
  };

  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '@', 'BackSpace'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '#'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '%'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950 text-black dark:text-slate-200 transition-colors duration-300 relative overflow-hidden">
      <FullscreenViolation isVisible={isViolationVisible} onReturn={enterFullscreen} />
      <WatermarkComponent text={user.number} />
      <SSCHeader user={user} />

      <main className="flex-1 flex flex-col items-center justify-center py-2 px-4 relative z-10 overflow-hidden">
        <div className="text-center text-[#0000ff] dark:text-blue-400 font-bold text-base md:text-lg mb-2 leading-tight">
          You are about to take the test on<br />
          {setName} Examination - {currentYear}
        </div>

        <div className="text-[#0000ff] dark:text-blue-400 font-bold text-xs md:text-sm mb-3 uppercase text-center leading-tight">
          PASSWORD IS {expectedPassword}
          <div className="text-[10px] md:text-xs normal-case font-medium mt-1">
            (e.g., If name is <span className="underline font-bold">ROBI</span>N and number is <span className="underline font-bold">1234</span>567890, password is ROBI1234)
          </div>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-[600px] mb-4">
          <div className="bg-[#dcd6c5] dark:bg-slate-800 w-40 md:w-48 py-1 px-4 font-bold text-xs md:text-sm border-t border-x border-gray-400 rounded-t-sm" 
               style={{ clipPath: 'polygon(0 0, 90% 0, 100% 100%, 0% 100%)' }}>
            Candidate Login
          </div>
          
          <div className="bg-[#eee8d5] dark:bg-slate-900 border border-gray-400 p-3 md:p-6 shadow-md">
            <div className="bg-white/90 dark:bg-slate-800/90 border border-gray-300 p-3 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-2 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <label className="w-16 md:w-20 font-bold text-xs md:text-sm">Roll No.</label>
                  <span className="font-bold">:</span>
                  <input type="text" value={user.number} readOnly className="border border-black px-2 py-0.5 w-40 md:w-48 text-xs md:text-sm font-bold bg-gray-50 text-black outline-none" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-16 md:w-20 font-bold text-xs md:text-sm">Password</label>
                  <span className="font-bold">:</span>
                  <input type="password" value={password} readOnly className="border border-black px-2 py-0.5 w-40 md:w-48 text-xs md:text-sm font-bold bg-white text-black outline-none" />
                </div>
              </div>
              <button onClick={handleLogin} className="bg-gradient-to-b from-gray-100 to-gray-300 hover:from-white hover:to-gray-200 border border-gray-500 px-6 md:px-8 py-1 font-bold text-xs md:text-sm text-black shadow-sm active:shadow-inner transition-all self-end md:self-center">
                Login
              </button>
            </div>
          </div>
        </div>

        {/* Virtual Keyboard */}
        <div className="border border-black p-2 bg-white dark:bg-slate-800 shadow-lg inline-block transform scale-90 md:scale-100">
          <div className="space-y-1">
            {keyboardRows.map((row, idx) => (
              <div key={idx} className="flex justify-center gap-1">
                {row.map(key => (
                  <button
                    key={key}
                    onClick={() => key === 'BackSpace' ? backspace() : typeChar(key)}
                    className={`h-8 md:h-9 border border-black font-bold flex items-center justify-center transition-colors active:bg-gray-300 dark:active:bg-slate-600 ${
                      key === 'BackSpace'
                        ? 'w-[15vw] sm:w-auto sm:px-3 text-[10px] md:text-xs'
                        : 'w-[7vw] min-w-[24px] max-w-[36px] sm:w-8 md:w-9 text-xs sm:text-sm md:text-base'
                    } bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 shadow-sm`}
                  >
                    {key === 'BackSpace' ? (
                      <>
                        <span className="hidden sm:inline">BackSpace</span>
                        <span className="inline sm:hidden">⌫</span>
                      </>
                    ) : key}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 text-red-600 dark:text-red-400 font-bold text-sm md:text-base text-center">
          Please Use Virtual Keyboard to Enter Your Password.
        </div>
      </main>

      <SSCFooter />
    </div>
  );
};

export default SSCLogin;
