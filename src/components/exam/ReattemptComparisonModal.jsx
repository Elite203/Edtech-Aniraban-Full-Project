import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Target, Clock, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const ReattemptComparisonModal = ({ 
  isOpen, 
  onClose, 
  originalStats, 
  currentStats,
  setName 
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800"
        >
          {/* Header */}
          <div className="p-4 md:p-6 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Practice Analysis</h2>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{setName || "Exam Reattempt"}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 md:p-8 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              
              {/* Original Attempt Card */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <h3 className="text-sm md:text-lg font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Original Latest Attempt</h3>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <StatRow icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} label="Correct" value={originalStats.correct} total={originalStats.total} />
                  <StatRow icon={<AlertCircle className="w-5 h-5 text-red-500" />} label="Incorrect" value={originalStats.incorrect} total={originalStats.total} />
                  <StatRow icon={<HelpCircle className="w-5 h-5 text-gray-400" />} label="Unanswered" value={originalStats.unanswered} total={originalStats.total} />
                  <div className="pt-3 md:pt-4 border-t dark:border-gray-700 flex justify-between items-end">
                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Score</span>
                    <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{Number(originalStats.score.toFixed(2))}</span>
                  </div>
                </div>
              </div>

              {/* Current Practice Card */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 md:p-6 border border-blue-100 dark:border-blue-900/40 ring-1 ring-blue-500/20">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <h3 className="text-sm md:text-lg font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Current Reattempt</h3>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <StatRow icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} label="Correct" value={currentStats.correct} total={currentStats.total} />
                  <StatRow icon={<AlertCircle className="w-5 h-5 text-red-500" />} label="Incorrect" value={currentStats.incorrect} total={currentStats.total} />
                  <StatRow icon={<HelpCircle className="w-5 h-5 text-gray-400" />} label="Unanswered" value={currentStats.unanswered} total={currentStats.total} />
                  <div className="pt-3 md:pt-4 border-t border-blue-100 dark:border-blue-900/40 flex justify-between items-end">
                    <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-tighter text-xs md:text-sm">Current Score</span>
                    <div className="text-right">
                      {currentStats.score > originalStats.score && (
                        <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold block mb-1">
                          +{Number((currentStats.score - originalStats.score).toFixed(2))} Better!
                        </span>
                      )}
                      <span className="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400">{Number(currentStats.score.toFixed(2))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Message */}
            <div className="mt-6 md:mt-8 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-center border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                {currentStats.score >= originalStats.score 
                  ? "Great job! You've maintained or improved your accuracy in this practice session."
                  : "Keep practicing! Use this session to understand the questions you missed this time."}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 border-t dark:border-gray-800 flex justify-center bg-gray-50/50 dark:bg-gray-800/50">
            <button
              onClick={onClose}
              className="w-full md:w-auto px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95 text-center"
            >
              OK - Go to Results
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const StatRow = ({ icon, label, value, total }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-base font-bold text-gray-900 dark:text-white">{value}</span>
      <span className="text-[10px] text-gray-400">/ {total}</span>
    </div>
  </div>
);

export default ReattemptComparisonModal;
