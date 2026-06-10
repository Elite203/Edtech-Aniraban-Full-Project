import React from "react";
import CircularProgress from "../../../tabs/Animatedcircularbar";

const OverallAnalysisTab = ({
  attempted,
  correct,
  incorrect,
  score,
  accuracy,
  rank,
  totalCandidates,
  percentile,
  records,
  totalMarks,
}) => {
  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-center text-xl md:text-2xl font-black mb-8 dark:text-white uppercase tracking-wider">
        Overall Performance Summary
      </h2>

      {/* Top 4 Circles */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-12 max-w-5xl mx-auto mb-12">
        <div className="flex flex-col items-center gap-2">
          <CircularProgress
            label="Attempted"
            percentage={Math.round((attempted / (records.length || 1)) * 100)}
            color="#0091ea"
          />
          <span className="text-sm md:text-base font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-5 py-2 rounded-full border border-blue-100 dark:border-blue-800 shadow-sm">
            {attempted} / {records.length}
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CircularProgress
            label="Correct"
            percentage={Math.round((correct / (records.length || 1)) * 100)}
            color="#2e7d32"
          />
          <span className="text-sm md:text-base font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-5 py-2 rounded-full border border-green-100 dark:border-green-800 shadow-sm">
            {correct} / {records.length}
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CircularProgress
            label="Incorrect"
            percentage={Math.round((incorrect / (records.length || 1)) * 100)}
            color="#cc0000"
          />
          <span className="text-sm md:text-base font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-5 py-2 rounded-full border border-red-100 dark:border-red-800 shadow-sm">
            {incorrect} / {records.length}
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CircularProgress
            label="Score"
            percentage={Math.round((Math.max(0, score) / (totalMarks || records.length * 2 || 1)) * 100)}
            color="#ff9800"
          />
          <span className="text-sm md:text-base font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-5 py-2 rounded-full border border-orange-100 dark:border-orange-800 shadow-sm">
            {Math.max(0, score)} / {totalMarks}
          </span>
        </div>
      </div>

      {/* Bottom 3 Items Centered */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-12 max-w-5xl mx-auto">
        <CircularProgress
          label="Accuracy"
          percentage={accuracy}
          color="#22C55E"
        />
        <CircularProgress
          label="Percentile"
          percentage={Math.round(parseFloat(percentile))}
          color="#7b1fa2"
        />

        {/* Rank Circle */}
        <div className="flex flex-col items-center">
          <div className="w-[180px] h-[180px] md:w-[200px] md:h-[200px] flex justify-center items-center relative">
            <div className="absolute w-full h-full border-[16px] border-gray-200 dark:border-gray-800 rounded-full"></div>
            <div className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] bg-white dark:bg-gray-800 rounded-full border-[5px] border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.5),0_0_15px_rgba(0,0,0,0.6)]">
              <span className="text-[20px] md:text-[24px] font-black text-red-600 dark:text-red-400">
                {rank} / {totalCandidates}
              </span>
              <span className="text-[10px] md:text-[12px] font-bold text-gray-500 dark:text-gray-400 tracking-[2px] mt-1">
                RANK
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallAnalysisTab;
