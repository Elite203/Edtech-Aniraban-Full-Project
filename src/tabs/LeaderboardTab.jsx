import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaCrown, FaStopwatch, FaTrophy, FaTimes, FaInfoCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BASE_URL;

import { ScrollSmoother } from "gsap/ScrollSmoother";

const LeaderboardTab = ({ course_id: propsCourseId, exam_set_id: propsExamSetId, set_number: propsSetNumber, current_user_id: propsUserId, isCoursePurchased = false }) => {
  useEffect(() => {
    try {
      if (typeof ScrollSmoother !== 'undefined' && ScrollSmoother) {
        const smoother = ScrollSmoother.get();
        if (smoother) smoother.kill();
      }
    } catch (e) {
      console.warn("Smooth scroll exclusion error:", e);
    }
  }, []);

  console.log("LeaderboardTab Props:", { propsCourseId, propsExamSetId, propsSetNumber, propsUserId });
  const params = useParams();
  const course_id = propsCourseId || params.course_id;
  const exam_set_id = propsExamSetId || params.exam_set_id;
  const set_number = propsSetNumber || params.set_number;

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(propsUserId || null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showInfoPopup, setShowInfoPopup] = useState(isCoursePurchased);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    if (!currentUserId) {
      const uid = localStorage.getItem("user_id");
      if (uid) {
        try {
          setCurrentUserId(JSON.parse(uid));
        } catch (e) {
          setCurrentUserId(uid);
        }
      }
    }
  }, [currentUserId]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchLeaderboard = async () => {
    if (!exam_set_id) return;
    setLoading(true);
    setError(null);

    try {
      const apiBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
      const apiUrl = `${apiBaseUrl}api/Leaderboard/get_leaderboard.php`;

      const response = await axios.get(apiUrl, {
        params: {
          course_id,
          exam_set_id,
          set_number,
          limit: 100 // Fetch more for a complete leaderboard
        },
        timeout: 15000
      });

      if (response.data.status !== "success") {
        throw new Error(response.data.message || "API request failed");
      }

      setLeaderboard(response.data.data || []);
      console.log("Leaderboard Data:", response.data.data || []);
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
      setError(error.message || "Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [course_id, exam_set_id, set_number]);

  const formatTime = (seconds) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? `${mins}m ` : ""}${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium animate-pulse">Calculating Ranks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-red-800 dark:text-red-100 mb-2">Error Loading Leaderboard</h2>
        <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all active:scale-95 shadow-lg shadow-blue-500/30"
        >
          Try Again
        </button>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="w-full max-w-5xl mx-auto px-2 md:px-4 py-8 select-none">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 inline-block">
          EXAM LEADERBOARD
        </h2>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
          <FaTrophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400 dark:text-gray-500 font-medium">No attempts recorded yet.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Be the first to secure a spot here!</p>
        </div>
      ) : (
        <>
          {/* Podium for Top 3 */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 mb-16 px-4">
            {/* Rank 2 */}
            {top3[1] && (
              <div className="order-2 md:order-1 flex flex-col items-center group w-full md:w-auto">
                <div className="relative mb-4">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-slate-300 shadow-xl overflow-hidden bg-white dark:bg-gray-800 ring-8 ring-slate-300/10 transition-transform group-hover:scale-105">
                    <img
                      src={top3[1].image || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[1].name)}&background=random`}
                      alt={top3[1].name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white">2</div>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-center truncate w-32">{top3[1].name}</h3>
                <div className="mt-1 flex flex-col items-center">
                  <span className="text-blue-600 dark:text-blue-400 font-black text-xl">{top3[1].score || 0}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter flex items-center gap-1">
                    <FaStopwatch className="text-[9px]" /> {formatTime(top3[1].total_time_spent)}
                  </span>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {top3[0] && (
              <div className="order-1 md:order-2 flex flex-col items-center group w-full md:w-auto scale-110 md:mx-6">
                <div className="relative mb-6">
                  <FaCrown className="absolute -top-10 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 drop-shadow-md animate-bounce" />
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-yellow-400 shadow-2xl overflow-hidden bg-white dark:bg-gray-800 ring-8 ring-yellow-400/20 transition-transform group-hover:scale-110">
                    <img
                      src={top3[0].image || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[0].name)}&background=random`}
                      alt={top3[0].name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white">1</div>
                </div>
                <h3 className="font-black text-gray-900 dark:text-white text-xl text-center truncate w-40">{top3[0].name}</h3>
                <div className="mt-1 flex flex-col items-center">
                  <span className="text-blue-600 dark:text-blue-400 font-black text-3xl">{top3[0].score || 0}</span>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <FaStopwatch /> {formatTime(top3[0].total_time_spent)}
                  </span>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {top3[2] && (
              <div className="order-3 md:order-3 flex flex-col items-center group w-full md:w-auto">
                <div className="relative mb-4">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-orange-300 shadow-xl overflow-hidden bg-white dark:bg-gray-800 ring-8 ring-orange-300/10 transition-transform group-hover:scale-105">
                    <img
                      src={top3[2].image || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[2].name)}&background=random`}
                      alt={top3[2].name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white">3</div>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-center truncate w-32">{top3[2].name}</h3>
                <div className="mt-1 flex flex-col items-center">
                  <span className="text-blue-600 dark:text-blue-400 font-black text-xl">{top3[2].score || 0}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter flex items-center gap-1">
                    <FaStopwatch className="text-[9px]" /> {formatTime(top3[2].total_time_spent)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard Table/List */}
          <div className="bg-white dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden mx-1 md:mx-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-gray-100 dark:border-gray-700/50">
                    <th className="px-6 md:px-8 py-5">Rank</th>
                    <th className="px-4 md:px-6 py-5">Student</th>
                    <th className="px-4 md:px-6 py-5 text-center">Marks</th>
                    <th className="px-6 md:px-8 py-5 text-right whitespace-nowrap">Time Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
                  {leaderboard.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((student, index) => {
                    const actualRank = ((currentPage - 1) * pageSize) + index + 1;
                    const isCurrentUser = String(currentUserId) === String(student.user_id);
                    return (
                      <tr key={student.user_id} className={`transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-600/5 ${isCurrentUser ? 'bg-blue-100/50 dark:bg-blue-900/30' : ''}`}>
                        <td className="px-6 md:px-8 py-5">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-bold text-sm ${actualRank <= 3
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                            {actualRank}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-5">
                          <div className="flex items-center gap-3 md:gap-4">
                            <img
                              src={student.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`}
                              alt={student.name}
                              className="w-10 h-10 md:w-12 md:h-12 rounded-2xl object-cover shadow-sm bg-gray-200 ring-2 ring-white dark:ring-gray-800"
                              onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className={`text-sm md:text-base font-bold truncate max-w-[120px] md:max-w-[200px] ${isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                                {student.name}
                              </span>
                              {isCurrentUser && (
                                <span className="w-fit text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest mt-0.5">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-5 text-center">
                          <span className="text-base md:text-xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                            {Number(student.score).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 md:px-8 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-gray-600">
                            <FaStopwatch className="text-blue-500/70" /> {formatTime(student.total_time_spent)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Sticky/Highlighted Current User Row (shown only if NOT on current page) */}
            {(() => {
              const studentRank = leaderboard.findIndex(s => String(s.user_id) === String(currentUserId));
              const isOnCurrentPage = studentRank >= (currentPage - 1) * pageSize && studentRank < currentPage * pageSize;
              const student = leaderboard[studentRank];

              if (student && !isOnCurrentPage) {
                return (
                  <div className="border-t-4 border-blue-600 bg-blue-50 dark:bg-blue-900/40 p-1">
                    <table className="w-full text-left border-collapse">
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
                        <tr className="bg-blue-100/60 dark:bg-blue-900/40">
                          <td className="px-6 md:px-8 py-5 w-[15%]">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl font-bold text-sm bg-blue-600 text-white border-2 border-white dark:border-gray-800 shadow-md">
                              {studentRank + 1}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-5 w-[40%]">
                            <div className="flex items-center gap-3 md:gap-4">
                              <img
                                src={student.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`}
                                alt={student.name}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-2xl object-cover shadow-sm bg-gray-200 ring-2 ring-white dark:ring-gray-800"
                                onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm md:text-base font-bold truncate max-w-[120px] md:max-w-[200px] text-blue-800 dark:text-blue-200">
                                  {student.name}
                                </span>
                                <span className="w-fit text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest mt-0.5">
                                  Your Rank
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-5 text-center w-[20%]">
                            <span className="text-base md:text-xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                              {Number(student.score).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 md:px-8 py-4 text-right w-[25%]">
                            <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                              <FaStopwatch className="text-blue-600" /> {formatTime(student.total_time_spent)}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              }
              return null;
            })()}

            {/* Pagination Controls */}
            {leaderboard.length > pageSize && (
              <div className="px-6 py-6 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap items-center justify-center gap-2">
                {(() => {
                  const totalPages = Math.ceil(leaderboard.length / pageSize);
                  const pages = [];
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200 ${currentPage === i
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}
              </div>
            )}
          </div>
        </>
      )}

      {/* Info Popup Modal */}
      <AnimatePresence>
        {showInfoPopup && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfoPopup(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-blue-100 dark:border-blue-900/30 p-8"
            >
              <button
                onClick={() => setShowInfoPopup(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 ring-8 ring-blue-50 dark:ring-blue-900/10">
                  <FaInfoCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ranking Rules</h3>

                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    🏆 The <span className="text-blue-600 dark:text-blue-400 font-bold">LEADERBOARD RECORDS</span> your rank, score & time for the <span className="text-blue-600 dark:text-blue-400 font-bold">FIRST ATTEMPT ONLY </span>Re-attempts won’t change your score or rank since the question pattern and solutions are already familiar.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    ⏱️ In case of a tie, the <span className="font-bold">faster completion time takes the lead.</span>.
                  </p>
                </div>

                <button
                  onClick={() => setShowInfoPopup(false)}
                  className="mt-8 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaderboardTab;