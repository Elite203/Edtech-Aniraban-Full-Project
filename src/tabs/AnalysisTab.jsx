import React from "react";
import CircularProgress from "./Animatedcircularbar";

const AnalysisTab = ({
  attempted,
  correct,
  incorrect,
  score,
  accuracy,
  rank,
  totalCandidates,
  percentile,
  cutoff,
  records,
  totalMarks,
}) => {
  console.log("AnalysisTab Data:", { attempted, correct, incorrect, score, accuracy, rank, totalCandidates, percentile, cutoff, records, totalMarks });
  return (
    <>
      <h2 className="text-center text-xl font-semibold mb-6 dark:text-white">
        Overall Performance Summary
      </h2>

      {/* Top 4 Circles */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-5xl mx-auto mb-8">
        <CircularProgress
          label="Attempted"
          percentage={Math.round((attempted / (records.length || 1)) * 100)}
          color="#4F46E5"
          subValue={`${attempted} / ${records.length}`}
        />
        <CircularProgress
          label="Correct"
          percentage={Math.round((correct / (records.length || 1)) * 100)}
          color="#16A34A"
          subValue={`${correct} / ${records.length}`}
        />
        <CircularProgress
          label="Incorrect"
          percentage={Math.round((incorrect / (records.length || 1)) * 100)}
          color="#DC2626"
          subValue={`${incorrect} / ${records.length}`}
        />
        <CircularProgress
          label="Score"
          percentage={Math.max(0, Math.round((score / (totalMarks || records.length * 3 || 1)) * 100))}
          color="#0EA5E9"
          subValue={`${Math.max(0, score)} / ${totalMarks || records.length * 3}`}
        />
      </div>

      {/* Bottom 4 Items Centered */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-5xl mx-auto">
        <CircularProgress
          label="Accuracy"
          percentage={accuracy}
          color="#22C55E"
          subValue={`${correct} / ${attempted || 0}`}
        />
        <CircularProgress
          label="Percentile"
          percentage={Math.max(0, Math.round(parseFloat(percentile) || 0))}
          color="#8B5CF6"
          subValue={`${Math.max(0, parseFloat(percentile) || 0)}%`}
        />

        {/* Rank Circle */}
        <div className="flex flex-col items-center">
          <div className="w-[180px] h-[180px] md:w-[200px] md:h-[200px] flex justify-center items-center relative">
            <div className="absolute w-full h-full border-[16px] border-gray-200 dark:border-[#1a1a1a] rounded-full"></div>
            <div className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] bg-white dark:bg-[#333] rounded-full border-[5px] border-gray-100 dark:border-[#4a4a4a] flex flex-col justify-center items-center shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5),0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.5),inset_-5px_-5px_10px_rgba(255,255,255,0.05),0_0_15px_rgba(0,0,0,0.6)]">
              <span className="text-[20px] md:text-[24px] font-bold text-cyan-600 dark:text-cyan-400">
                {rank} / {totalCandidates}
              </span>
              <span className="text-[10px] md:text-[12px] font-semibold text-gray-500 dark:text-[#e0e0e0] tracking-[1px] mt-[2px]">
                RANK
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalysisTab;
