import React, { useEffect, useRef, useState } from "react";

const CheckMark = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" className="absolute top-0 right-0 bg-white text-green-500 rounded-full">
    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const SidebarSection = ({
  sidebarVisible,
  setSidebarVisible,
  user,
  answeredCount,
  unansweredCount,
  markedCount,
  notVisitedCount,
  answeredMarkedCount,
  currentQuestion,
  filteredQuestions,
  currentIndex,
  setCurrentIndex,
  answers,
  unanswered,
  reviewed,
  visited,
  globalQuestionIndex,
  setShowQuitModal,
  setShowSubmitModal,
  submittedSubjects,
  canAccessSubject
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (showCamera) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Camera error:", err));
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  }, [showCamera]);

  return (
    <div
      className={`bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out flex flex-col overflow-hidden
        fixed inset-y-0 right-0 z-50 w-[300px] h-full shadow-2xl lg:shadow-none lg:static lg:h-full
        ${sidebarVisible 
          ? "translate-x-0 lg:w-1/4" 
          : "translate-x-full lg:translate-x-0 lg:w-0"
        }`}
    >
      {sidebarVisible && (
        <>
          {/* Mobile close button */}
          {window.innerWidth < 1024 && (
            <button
              onClick={() => typeof setSidebarVisible === "function" && setSidebarVisible(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          <div className="p-4 overflow-y-auto flex-1">
            {/* User Profile - Horizontal layout with camera */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="font-bold text-xs sm:text-sm dark:text-white flex-1 min-w-0">{user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User"}</span>
              <div className="flex gap-1 flex-shrink-0">
                <img src={user.photo} alt="Profile" className="w-16 h-20 sm:w-20 sm:h-24 rounded border border-gray-300 dark:border-gray-600 object-cover" />
                <button
                  className="w-16 h-20 sm:w-20 sm:h-24 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {showCamera ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Camera Preview Modal */}
            {showCamera && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold dark:text-white">Passport Photo</h3>
                    <button
                      onClick={() => setShowCamera(false)}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 bg-black rounded border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    onClick={() => {
                      if (canvasRef.current && videoRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                        const link = document.createElement('a');
                        link.href = canvasRef.current.toDataURL();
                        link.download = 'passport-photo.png';
                        link.click();
                      }
                    }}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Capture & Download
                  </button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} width="160" height="200" style={{ display: 'none' }} />

            {/* Status Box - Adjusted for mobile */}
            <div className="bg-yellow-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-3 mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 relative">
                    <div
                      className="absolute inset-0 flex items-center justify-center text-white font-medium"
                      style={{
                        backgroundImage: "url('/img/green.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {answeredCount}
                    </div>
                  </div>
                  <span className="text-xs dark:text-white">Answered</span>
                </div>

                <div className="flex items-center gap-1">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 relative">
                    <div
                      className="absolute inset-0 flex items-center justify-center text-white font-medium"
                      style={{
                        backgroundImage: "url('/img/red.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {unansweredCount}
                    </div>
                  </div>
                  <span className="text-xs dark:text-white">Not Answered</span>
                </div>

                <div className="flex items-center gap-1">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 relative">
                    <div
                      className="absolute inset-0 rounded-full flex items-center justify-center text-white font-medium"
                      style={{
                        backgroundImage: "url('/img/pur.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {markedCount}
                    </div>
                  </div>
                  <span className="text-xs dark:text-white">Marked</span>
                </div>

                <div className="flex items-center gap-1">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded flex items-center justify-center">
                    {notVisitedCount}
                  </div>
                  <span className="text-xs dark:text-white">Not Visited</span>
                </div>
              </div>

              <div className="flex items-center pt-2 gap-2">
                <div className="h-8 w-8 sm:h-9 sm:w-9 relative">
                  <div
                    className="absolute inset-0 rounded-full flex items-center justify-center text-white font-medium"
                    style={{
                      backgroundImage: "url('/img/pur.png')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {answeredMarkedCount}
                    <span className="absolute top-0 right-0 text-xs bg-white text-green-600 rounded-full w-3 h-3 flex items-center justify-center">✓</span>
                  </div>
                </div>
                <span className="text-xs dark:text-white">Answered & Marked</span>
              </div>
            </div>

            {/* Question Navigation */}
            <div>
              <span
                className="block mb-2 font-bold text-center py-2 bg-blue-50 dark:bg-blue-900 rounded text-white"
                style={{
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  backgroundColor: '#008feeff',
                }}
              >
                {currentQuestion?.subject || "General"}
              </span>

              <div className="grid grid-cols-5 gap-2">
                {filteredQuestions.map((q, i) => {
                  const isAnswered = answers[q.id];
                  const isUnanswered = unanswered.includes(q.id);
                  const isActive = i === currentIndex;
                  const reviewStatus = reviewed[q.id];
                  const isVisited = visited.has(q.id);

                  let baseClass = "w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm flex items-center justify-center border rounded cursor-pointer relative";
                  let backgroundStyle = {};

                  if (isAnswered && !reviewStatus) {
                    baseClass += " text-white";
                    backgroundStyle = {
                      backgroundImage: "url('/img/green.png')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    };
                  }
                  else if (isUnanswered && !reviewStatus) {
                    baseClass += " text-white";
                    backgroundStyle = {
                      backgroundImage: "url('/img/red.png')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    };
                  }
                  else if (reviewStatus === "reviewedAnswered") {
                    baseClass += " rounded-full text-white border-purple-700";
                    backgroundStyle = {
                      backgroundImage: "url('/img/pur.png')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    };
                  }
                  else if (reviewStatus === "reviewedUnanswered") {
                    baseClass += " rounded-full text-white border-blue-500";
                    backgroundStyle = {
                      backgroundImage: "url('/img/pur.png')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    };
                  }
                  else if (isVisited) {
                    baseClass += " bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500";
                  }
                  else {
                    baseClass += " bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600";
                  }

                  if (isActive) baseClass += " ring-2 sm:ring-4";

                  return (
                    <span
                      key={i}
                      className={baseClass}
                      style={backgroundStyle}
                      onClick={() => {
                        setCurrentIndex(i);
                        if (window.innerWidth < 1024 && typeof setSidebarVisible === "function") {
                          setSidebarVisible(false);
                        }
                      }}
                    >
                      {i + 1}
                      {(reviewStatus === "reviewedAnswered") && (
                        <CheckMark />
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Buttons - Stacked on mobile */}
          <div className="p-3 border-t border-gray-300 dark:border-gray-700 flex flex-col sm:flex-row gap-2">
            <button
              className="bg-red-600 text-white w-full py-2 rounded hover:bg-red-700 text-sm sm:text-base"
              onClick={() => {
                setShowQuitModal(true);
              }}
            >
              Quit Test
            </button>
            <button
              className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 text-sm sm:text-base"
              onClick={() => setShowSubmitModal(true)}
            >
              Submit Test
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SidebarSection;