import React from 'react';

const SSCTestSummaryComponent = ({ answeredCount = 0, totalQuestions = 100, markedForReview = 0 }) => {
  const notAnsweredCount = totalQuestions - answeredCount;

  return (
    <div className="flex items-center justify-center w-full">
      <div className="bg-white dark:bg-slate-800 w-full max-w-[900px] shadow-[0px_4px_15px_rgba(0,0,0,0.3)] border border-[#ccc] dark:border-slate-700">
        {/* Header Bar */}
        <div className="bg-[#dcd6c5] dark:bg-slate-700 px-[15px] py-2 font-bold text-[14px] text-black dark:text-white text-left font-sans">
          Test Summary
        </div>
        
        {/* Content Area */}
        <div className="px-5 py-10 text-center font-serif text-[20px] font-bold text-black dark:text-slate-200 flex flex-col gap-5">
          <div className="m-0">
            You have answered <span className="text-[#ff0000] dark:text-red-500">{answeredCount}</span> questions out of <span className="text-[#ff0000] dark:text-red-500">{totalQuestions}</span> questions.
          </div>
          
          <div className="m-0">
            You have not answered <span className="text-[#ff0000] dark:text-red-500">{notAnsweredCount}</span> questions out of <span className="text-[#ff0000] dark:text-red-500">{totalQuestions}</span> questions.
          </div>
          
          <div className="m-0">
            You have Mark for review <span className="text-[#ff0000] dark:text-red-500">{markedForReview}</span> questions out of <span className="text-[#ff0000] dark:text-red-500">{totalQuestions}</span> questions.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSCTestSummaryComponent;
