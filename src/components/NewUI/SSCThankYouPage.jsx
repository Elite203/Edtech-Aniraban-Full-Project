import React, { useEffect } from 'react';
import { useStudentProfile } from './StudentProfileData';
import { useLocation, useNavigate } from 'react-router-dom';
import WatermarkComponent from './WatermarkComponent';

const SSCThankYouPage = () => {
  const { user } = useStudentProfile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.history.pushState(null, null, window.location.href);

    const handlePopState = (event) => {
      window.history.pushState(null, null, window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleViewAnalysis = () => {
    const state = location.state || {};
    console.log("🔍 Debugging SSC Redirection:");
    console.log("Navigation State:", state);
    
    // Get values from state or localStorage (checking both snake_case and camelCase)
    const course_id = state.course_id || localStorage.getItem('sscCourseId');
    const exam_set_id = state.exam_set_id || state.examSetId || localStorage.getItem('sscExamSetId');
    const set_number = state.set_number || localStorage.getItem('sscSetNumber');
    
    console.log("Extracted IDs:", { course_id, exam_set_id, set_number });
    console.log("LocalStorage Check:", {
      sscCourseId: localStorage.getItem('sscCourseId'),
      sscExamSetId: localStorage.getItem('sscExamSetId'),
      sscSetNumber: localStorage.getItem('sscSetNumber')
    });
    
    if (course_id && exam_set_id && set_number) {
      const targetUrl = `/exam/result/${course_id}/${exam_set_id}/${set_number}`;
      console.log("🚀 Redirecting to:", targetUrl);
      navigate(targetUrl);
    } else {
      console.error("❌ Redirection failed: Missing one or more required parameters.");
    }
  };

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      console.log("⏱️ Automatic redirect triggered...");
      handleViewAnalysis();
    }, 3000); // Increased to 3s to give more time for state/storage

    return () => clearTimeout(redirectTimer);
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-slate-900 flex justify-center items-center p-4 relative overflow-hidden">
      {/* Watermark with candidate number  <WatermarkComponent text={user?.number} /> */}
      
      
      <div className="thank-you-card bg-white dark:bg-slate-800 p-12 md:p-20 rounded-lg shadow-xl text-center flex flex-col items-center justify-center relative z-10 max-w-2xl w-full">
        <img 
          src="/img/ssc.webp" 
          alt="SSC Logo" 
          className="h-20 w-auto mb-8"
        />
        
        <div className="message-text text-2xl md:text-3xl font-bold text-[#222] dark:text-white whitespace-nowrap mb-8">
          Thank you for taking the test
        </div>

        <button 
          onClick={handleViewAnalysis}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded transition-colors text-sm"
        >
          View Detailed Analysis
        </button>
      </div>
    </div>
  );
};

export default SSCThankYouPage;
