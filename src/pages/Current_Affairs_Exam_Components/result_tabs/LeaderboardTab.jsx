import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCrown, FaStopwatch, FaTrophy, FaTimes, FaInfoCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const LeaderboardTab = ({ quiz_id, current_user_id, BASE_URL }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInfoPopup, setShowInfoPopup] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [quiz_id]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!quiz_id) return;
      setLoading(true);
      try {
        const apiBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
        const fullUrl = `${apiBaseUrl}api/CurrentAffairs/get_leaderboard.php`;
        console.log("Leaderboard Debug - Requesting URL:", fullUrl, "for QuizID:", quiz_id);

        const response = await axios.get(fullUrl, {
          params: { quiz_id }
        });

        console.log("Leaderboard Debug - Raw Response:", response);
        console.log("Leaderboard Debug - Status:", response.status);
        console.log("Leaderboard Debug - Data Type:", typeof response.data);
        console.log("Leaderboard Debug - Data Content:", response.data);

        if (response.data && response.data.status === "success") {
          setLeaderboard(response.data.data || []);
        } else {
          const errMsg = response.data?.message || "Unknown error from server";
          console.error("Leaderboard Debug - API Error:", errMsg);
          throw new Error(errMsg);
        }
      } catch (err) {
        console.error("Leaderboard Debug - Fetch Failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [quiz_id, BASE_URL]);

  const formatTime = (seconds) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? `${mins}m ` : ""}${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Ranking Toppers...</p>
      </div>
    );
  }

  if (error) return <div className="text-center text-red-500 py-10 font-bold">{error}</div>;

  const myIndex = leaderboard.findIndex(student => String(student.user_id) === String(current_user_id));
  const myRank = myIndex !== -1 ? myIndex + 1 : null;
  const myInfo = myIndex !== -1 ? leaderboard[myIndex] : null;

  const totalPages = Math.ceil(leaderboard.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeaderboard = leaderboard.slice(indexOfFirstItem, indexOfLastItem);

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 select-none animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 inline-block uppercase tracking-tighter">
          EXAM LEADERBOARD
        </h2>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-12 text-center rounded-3xl border-2 border-dashed dark:border-gray-700">
          <FaTrophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-400 font-bold">No attempts recorded yet.</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="flex flex-col md:flex-row items-end justify-center gap-8 md:gap-4 mb-20 px-4">
            {/* Rank 2 */}
            {top3[1] && (
              <div className="order-2 md:order-1 flex flex-col items-center group w-full md:w-auto">
                <div className="relative mb-4">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-slate-300 shadow-xl overflow-hidden bg-white ring-8 ring-slate-300/10">
                    <img
                      src={top3[1].photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[1].name)}&background=random`}
                      alt={top3[1].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white">2</div>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-sm truncate w-32 text-center">{top3[1].name}</h3>
                <span className="text-red-600 font-black text-xl">{top3[1].score}</span>
              </div>
            )}

            {/* Rank 1 */}
            {top3[0] && (
              <div className="order-1 md:order-2 flex flex-col items-center group w-full md:w-auto scale-110 mb-4 md:mb-0">
                <div className="relative mb-6">
                  <FaCrown className="absolute -top-8 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 animate-bounce" />
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-yellow-400 shadow-2xl overflow-hidden bg-white ring-8 ring-yellow-400/20">
                    <img
                      src={top3[0].photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[0].name)}&background=random`}
                      alt={top3[0].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl border-2 border-white">1</div>
                </div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg text-center truncate w-40">{top3[0].name}</h3>
                <span className="text-red-600 font-black text-3xl">{top3[0].score}</span>
              </div>
            )}

            {/* Rank 3 */}
            {top3[2] && (
              <div className="order-3 md:order-3 flex flex-col items-center group w-full md:w-auto">
                <div className="relative mb-4">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-orange-300 shadow-xl overflow-hidden bg-white ring-8 ring-orange-300/10">
                    <img
                      src={top3[2].photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[2].name)}&background=random`}
                      alt={top3[2].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white">3</div>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-sm truncate w-32 text-center">{top3[2].name}</h3>
                <span className="text-red-600 font-black text-xl">{top3[2].score}</span>
              </div>
            )}
          </div>

          {/* List */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border dark:border-gray-700">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[500px] text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black border-b dark:border-gray-700">
                    <th className="px-8 py-5">Rank</th>
                    <th className="px-6 py-5">Student</th>
                    <th className="px-6 py-5 text-center">Marks</th>
                    <th className="px-6 py-5 text-center">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {currentLeaderboard.map((student, index) => {
                    const rank = indexOfFirstItem + index + 1;
                    return (
                      <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${String(current_user_id) === String(student.user_id) ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${rank <= 3 ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                            {rank}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`}
                              alt={student.name}
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                            <span className="font-bold text-sm dark:text-gray-200">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-lg font-black text-red-600">{student.score}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 font-bold text-xs">
                            <FaStopwatch size={12} className="text-gray-400" />
                            {formatTime(student.total_time)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center gap-2 px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === 1 
                      ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border dark:border-gray-650'
                  }`}
                >
                  Previous
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                              : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border dark:border-gray-650'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (
                      (pageNum === 2 && currentPage > 4) || 
                      (pageNum === totalPages - 1 && currentPage < totalPages - 3)
                    ) {
                      return (
                        <span key={pageNum} className="text-gray-400 text-xs px-1 select-none">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === totalPages 
                      ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border dark:border-gray-650'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* User's Own Rank Section */}
          {myRank && (
            <div className="mt-6 p-5 rounded-3xl bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/5 dark:to-orange-500/5 border border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={myInfo.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(myInfo.name)}&background=random`}
                    alt={myInfo.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-4 ring-red-500/20"
                  />
                  <div className="absolute -bottom-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-xl flex items-center justify-center border-2 border-white dark:border-gray-800">
                    #{myRank}
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-sm text-gray-850 dark:text-white uppercase tracking-tight">Your Ranking</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{myInfo.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Marks</p>
                  <p className="text-lg font-black text-red-600">{myInfo.score}</p>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                <div className="text-center">
                  <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Time Taken</p>
                  <p className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <FaStopwatch size={12} className="text-gray-400" />
                    {formatTime(myInfo.total_time)}
                  </p>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                <div className="text-center">
                  <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Status</p>
                  <p className="text-xs font-black text-green-600 dark:text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/25">
                    Ranked #{myRank}
                  </p>
                </div>
              </div>
            </div>
          )}
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
              className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-red-100 dark:border-red-900/30 p-8"
            >
              <button
                onClick={() => setShowInfoPopup(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6 ring-8 ring-red-50 dark:ring-red-900/10">
                  <FaInfoCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Ranking Rules</h3>

                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    🏆 The <span className="text-red-600 dark:text-red-400 font-bold uppercase">Leaderboard Records</span> your rank, score & time for the <span className="text-red-600 dark:text-red-400 font-bold uppercase">First Attempt Only</span>. Re-attempts won’t change your score or rank.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    ⏱️ In case of a tie, the <span className="font-bold">faster completion time takes the lead.</span>.
                  </p>
                </div>

                <button
                  onClick={() => setShowInfoPopup(false)}
                  className="mt-8 w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
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
