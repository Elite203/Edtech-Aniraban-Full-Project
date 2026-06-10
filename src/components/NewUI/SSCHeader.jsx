import React from 'react';

const SSCHeader = ({ user }) => {
  return (
    <>
      {/* Top Header Area */}
      <header className="flex justify-between items-center px-4 py-1 md:px-8 md:py-2 bg-white dark:bg-slate-900 transition-colors shadow-sm relative z-10">
        <div className="header-left flex-shrink-0">
          <img 
            src="/img/ssc.webp" 
            alt="SSC Logo" 
            className="h-12 md:h-14 w-auto"
          />
        </div>

        <div className="header-center font-bold text-lg md:text-xl lg:text-2xl text-center flex-1 px-4 uppercase">
          SSC ONLINE MOCK TEST
        </div>

        <div className="header-right flex items-center gap-3">
          <div className="text-right hidden md:block">
            {/* Comment
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Candidate Name</div>
            <div className="text-sm font-black text-blue-700 dark:text-blue-400">{user.name}</div> */}
            
          </div>
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
      </header>

      {/* Blue Navigation Strip */}
      <div className="h-8 bg-[#0047ab] w-full flex-shrink-0 relative z-10"></div>
    </>
  );
};

export default SSCHeader;
