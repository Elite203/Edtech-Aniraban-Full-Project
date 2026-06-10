import React, { useState, useEffect } from 'react';

const SSCExamPageHeader = ({ user, onZoomIn, onZoomOut, timeLeft, examSet, isPracticeMode }) => {
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="flex flex-col md:flex-row items-center justify-between px-3 py-1 border-b-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors relative z-30">
      {/* Left: Logo & Exam Name */}
      <div className="flex flex-col items-center justify-center w-32 flex-shrink-0">
        <img 
          src="/img/ssc.webp" 
          alt="SSC Logo" 
          className="h-10 md:h-12 w-auto mb-0.5"
        />
        {/* <div className="font-bold text-[11px] md:text-[13px] text-black dark:text-white uppercase whitespace-nowrap">
          {examSet?.set_name || "SSC-Mock Test"}
        </div> */}
        
      </div>

      {/* Zoom Buttons (Hidden on small screens) */}
      <div className="hidden lg:flex gap-2.5 ml-5 mr-auto">
        <button 
          onClick={onZoomIn}
          className="bg-[#0066cc] text-white px-3.5 py-1 rounded-full font-bold text-xs shadow-sm hover:bg-[#0052a3] transition-colors"
        >
          Zoom (+)
        </button>
        <button 
          onClick={onZoomOut}
          className="bg-[#0066cc] text-white px-3.5 py-1 rounded-full font-bold text-xs shadow-sm hover:bg-[#0052a3] transition-colors"
        >
          Zoom (-)
        </button>
      </div>

      {/* Center: Title & Candidate Info */}
      <div className="text-center my-1.5 md:my-0 flex-1 px-4">
        <div className="text-base md:text-[18px] font-bold text-black dark:text-white uppercase tracking-tight mb-0.5">
          {examSet?.set_name || "SSC ONLINE MOCK TEST"}
        </div>
        <div className="text-[13px] md:text-[14px] font-bold text-black dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">
          Roll No : {user?.number || "291113405325"} [{user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Candidate Name"}]
        </div>
      </div>

      {/* Right: Timer & Photos */}
      <div className="flex items-center gap-4 flex-shrink-0 min-w-[220px] justify-end">
        {!isPracticeMode && (
          <div className="text-center">
            <div className="font-bold text-[10px] md:text-[12px] text-black dark:text-slate-300 uppercase mb-0.5">Time Left</div>
            <div className="bg-[#ffffcc] dark:bg-slate-800 text-red-600 dark:text-red-400 font-bold font-mono tracking-widest text-lg md:text-xl px-2.5 py-0.5 border border-gray-300 dark:border-slate-700 w-[110px] md:w-[130px] tabular-nums inline-block text-center">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
        <div className="flex gap-2">
      <div 
            className="user-icon h-12 w-12 md:h-16 md:w-16 bg-gray-200 dark:bg-slate-700 rounded-md bg-cover bg-center border border-gray-300 dark:border-slate-600 shadow-inner"
            style={{ 
              backgroundImage: user.photo ? `url(${user.photo})` : `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23888"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>')` 
            }}
          ></div>
          <div 
            className="user-icon h-12 w-12 md:h-16 md:w-16 bg-gray-200 dark:bg-slate-700 rounded-md bg-cover bg-center border border-gray-300 dark:border-slate-600 shadow-inner"
            style={{ 
              backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23888"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>')` 
            }}
          ></div>
        </div>
      </div>
    </header>
  );
};

export default SSCExamPageHeader;
