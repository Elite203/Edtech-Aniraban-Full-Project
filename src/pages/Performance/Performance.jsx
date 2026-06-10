
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import PerformanceAnalysis from "./PerformanceAnalysis";
// import PerformanceSolution from "./PerformanceSolution";
// import PerformanceCompare from "./PerformanceCompare";
// import PerformanceLeaderboard from "./PerformanceLeaderboard";

// const Performance = () => {
//   const [tab, setTab] = useState("analysis");
//   const [darkMode, setDarkMode] = useState(false);
//   const navigate = useNavigate();

//   const toggleDarkMode = () => {
//     const newMode = !darkMode;
//     setDarkMode(newMode);
//     document.documentElement.classList.toggle('dark', newMode);
//   };

//   return (
//     <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-white dark:bg-gray-900 px-2 sm:px-4 py-4 sm:py-8`}>
   
//       <div className="fixed top-2 right-2 z-10 sm:absolute sm:top-4 sm:right-4">
//         <button
//           onClick={toggleDarkMode}
//           className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm sm:text-base"
//           aria-label="Toggle dark mode"
//         >
//           {darkMode ? '☀️' : '🌙'}
//         </button>
//       </div>


//       <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-4 sm:mb-8 pt-8 sm:pt-0">
//         {[
//           { id: "analysis", label: "ANALYSIS" },
//           { id: "solution", label: "SOLUTION" },
//           { id: "compare", label: "COMPARE" },
//           { id: "leaderboard", label: "LEADERBOARD" }
//         ].map(({ id, label }) => (
//           <button
//             key={id}
//             className={`px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${
//               tab === id 
//                 ? "bg-black dark:bg-gray-700 text-white" 
//                 : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
//             }`}
//             onClick={() => setTab(id)}
//           >
//             {label}
//           </button>
//         ))}
//       </div>


//       <div className="px-1 sm:px-4">
//         {tab === "analysis" && <PerformanceAnalysis />}
//         {tab === "solution" && <PerformanceSolution />}
//         {tab === "compare" && <PerformanceCompare />}
//         {tab === "leaderboard" && <PerformanceLeaderboard />}
//       </div>
//     </div>
//   );
// };

// export default Performance;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PerformanceAnalysis from "./PerformanceAnalysis";
import PerformanceSolution from "./PerformanceSolution";
import PerformanceCompare from "./PerformanceCompare";
import PerformanceLeaderboard from "./PerformanceLeaderboard";

const Performance = () => {
  const [tab, setTab] = useState("analysis");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? "dark" : ""} bg-white dark:bg-gray-900 px-2 sm:px-4 py-4 sm:py-8`}
    >
      {/* Dark Mode Toggle */}
      <div className="fixed top-2 right-2 z-10 sm:absolute sm:top-4 sm:right-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm sm:text-base"
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Home Icon + Tabs in one centered row */}
      <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mb-4 sm:mb-8 pt-8 sm:pt-0">
        {/* Home Icon Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center w-9 h-9 bg-black text-white rounded-lg hover:bg-red-600 hover:text-blue-300 transition-colors"
          aria-label="Go to Home"
        >
          {/* Simple Home SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
            className="w-5 h-5"
          >
            <path d="M10.707 1.293a1 1 0 0 0-1.414 0L2 8.586V18a2 2 0 0 0 2 2h4v-6h4v6h4a2 2 0 0 0 2-2V8.586l-7.293-7.293z" />
          </svg>
        </button>

        {/* Tabs */}
        {[
          { id: "analysis", label: "ANALYSIS" },
          { id: "solution", label: "SOLUTION" },
          { id: "compare", label: "COMPARE" },
          { id: "leaderboard", label: "LEADERBOARD" },
        ].map(({ id, label }) => (
          <button
            key={id}
            className={`px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${
              tab === id
                ? "bg-black dark:bg-gray-700 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-1 sm:px-4">
        {tab === "analysis" && <PerformanceAnalysis />}
        {tab === "solution" && <PerformanceSolution />}
        {tab === "compare" && <PerformanceCompare />}
        {tab === "leaderboard" && <PerformanceLeaderboard />}
      </div>
    </div>
  );
};

export default Performance;
