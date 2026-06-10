import React, { useEffect, useState } from "react";
import axios from "axios";

const PerformanceLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
   const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem("user_id"));
         const month = localStorage.getItem("month");
        const year = localStorage.getItem("year");
        
        const [resultRes, questionsRes, analysisRes] = await Promise.all([
          axios.get(`${BASE_URL}api/CurrentAffairs/get_exam_result_data.php`, {
             params: { user_id: userId,month:month,year:year } 
            }),
          axios.get(`${BASE_URL}api/Questions/get_questions.php`),
          axios.get(`${BASE_URL}api/CurrentAffairs/get_leaderboard.php`)
        ]);

        if (analysisRes.data.status !== "success" || !Array.isArray(analysisRes.data.data)) {
          throw new Error("Invalid leaderboard data");
        }

        if (resultRes.data.status !== "success" || !Array.isArray(resultRes.data.data)) {
          throw new Error("Invalid result data");
        }

        if (!Array.isArray(questionsRes.data)) {
          throw new Error("Invalid questions data");
        }

        const questionMap = {};
        questionsRes.data.forEach(q => {
          if (q.id) questionMap[q.id] = q;
        });

        const userResults = {};
        resultRes.data.data.forEach(record => {
          if (!userResults[record.user_id]) {
            userResults[record.user_id] = {
              attempted: 0,
              correct: 0,
              incorrect: 0
            };
          }
          if (record.selected_key && record.selected_key.trim()) {
            userResults[record.user_id].attempted++;
            if (record.is_correct == 1) {
              userResults[record.user_id].correct++;
            } else {
              userResults[record.user_id].incorrect++;
            }
          }
        });

        const combinedData = analysisRes.data.data.map(user => {
          const resultStats = userResults[user.user_id] || { attempted: 0, correct: 0, incorrect: 0 };
          const accuracy = user.total_questions > 0 
            ? Math.round((resultStats.correct / parseInt(user.total_questions)) * 100)
            : 0;
          
          return {
            ...user,
            ...resultStats,
            accuracy,
            score: resultStats.correct * 3 - resultStats.incorrect,
            avg_time_per_question: parseFloat(user.avg_time_per_question).toFixed(2)
          };
        });

        const sortedData = combinedData.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
          return a.avg_time_per_question - b.avg_time_per_question;
        });

        setLeaderboardData(sortedData);
      } catch (err) {
        setError(err.message || "Error fetching leaderboard data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) return <div className="text-center mt-20 dark:text-white">Loading leaderboard...</div>;
  if (error) return <div className="text-center mt-20 text-red-600 dark:text-red-400">{error}</div>;
  if (leaderboardData.length === 0) return <div className="text-center mt-20 dark:text-white">No leaderboard data available</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-blue-600 dark:text-blue-400">LEADERBOARD</h1>
      
      {/* Top 3 Winners - Mobile Stacked */}
      <div className="md:hidden mb-8 space-y-6">
        {leaderboardData.slice(0, 3).map((user, index) => (
          <div key={user.user_id} className={`flex flex-col items-center p-4 rounded-lg ${
            index === 0 ? "bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700" :
            index === 1 ? "bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" :
            "bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700"
          }`}>
            <div className={`rounded-full w-20 h-20 flex items-center justify-center mb-2 relative ${
              index === 0 ? "bg-yellow-300 dark:bg-yellow-600" :
              index === 1 ? "bg-gray-300 dark:bg-gray-600" :
              "bg-orange-300 dark:bg-orange-600"
            }`}>
              <span className={`absolute -top-2 -left-2 rounded-full w-8 h-8 flex items-center justify-center ${
                index === 0 ? "bg-yellow-600 dark:bg-yellow-800" :
                index === 1 ? "bg-gray-500 dark:bg-gray-700" :
                "bg-orange-500 dark:bg-orange-700"
              } text-white`}>
                {index + 1}
              </span>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden ${
                index === 0 ? "bg-yellow-200 dark:bg-yellow-500" :
                index === 1 ? "bg-gray-200 dark:bg-gray-500" :
                "bg-orange-200 dark:bg-orange-500"
              }`}>
                {user.image ? (
                  <img 
                    src={`${BASE_URL}${user.image}`} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = "https://via.placeholder.com/100"}
                  />
                ) : (
                  <span className={`${
                    index === 0 ? "text-3xl" : "text-2xl"
                  }`}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </span>
                )}
              </div>
            </div>
            <h3 className={`text-center font-semibold ${
              index === 0 ? "text-lg font-bold" : "font-semibold"
            } dark:text-white`}>
              {user.name}
            </h3>
            <div className="grid grid-cols-2 gap-2 mt-2 text-center w-full">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Score</p>
                <p className="font-medium dark:text-white">{user.score}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Correct</p>
                <p className="font-medium dark:text-white">{user.correct}/{user.total_questions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Accuracy</p>
                <p className="font-medium dark:text-white">{user.accuracy}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Avg Time</p>
                <p className="font-medium dark:text-white">{user.avg_time_per_question}s</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top 3 Winners - Desktop Horizontal */}
      <div className="hidden md:flex justify-center items-end mb-12 relative h-64">
        {/* 2nd Place (Left) */}
        {leaderboardData[1] && (
          <div className="flex flex-col items-center mx-4 w-1/4">
            <div className="bg-gray-300 dark:bg-gray-600 rounded-full w-24 h-24 flex items-center justify-center mb-2 relative">
              <span className="absolute -top-2 -left-2 bg-gray-500 dark:bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center">2</span>
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-500 flex items-center justify-center overflow-hidden">
                {leaderboardData[1].image ? (
                  <img 
                    src={`${BASE_URL}${leaderboardData[1].image}`} 
                    alt={leaderboardData[1].name} 
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = "https://via.placeholder.com/100"}
                  />
                ) : (
                  <span className="text-2xl">🥈</span>
                )}
              </div>
            </div>
            <h3 className="font-semibold text-center dark:text-white">
              {leaderboardData[1].name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Score: {leaderboardData[1].score}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {leaderboardData[1].correct}/{leaderboardData[1].total_questions} ({leaderboardData[1].accuracy}%)
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Avg: {leaderboardData[1].avg_time_per_question}s
            </p>
          </div>
        )}

        {/* 1st Place (Center) */}
        {leaderboardData[0] && (
          <div className="flex flex-col items-center mx-4 w-1/3">
            <div className="bg-yellow-300 dark:bg-yellow-600 rounded-full w-32 h-32 flex items-center justify-center mb-2 relative">
              <span className="absolute -top-2 -left-2 bg-yellow-600 dark:bg-yellow-800 text-white rounded-full w-8 h-8 flex items-center justify-center">1</span>
              <div className="w-28 h-28 rounded-full bg-yellow-200 dark:bg-yellow-500 flex items-center justify-center overflow-hidden">
                {leaderboardData[0].image ? (
                  <img 
                    src={`${BASE_URL}${leaderboardData[0].image}`} 
                    alt={leaderboardData[0].name} 
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = "https://via.placeholder.com/100"}
                  />
                ) : (
                  <span className="text-4xl">🥇</span>
                )}
              </div>
            </div>
            <h3 className="font-bold text-lg text-center dark:text-white">
              {leaderboardData[0].name}
            </h3>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Score: {leaderboardData[0].score}
            </p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {leaderboardData[0].correct}/{leaderboardData[0].total_questions} ({leaderboardData[0].accuracy}%)
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Avg: {leaderboardData[0].avg_time_per_question}s
            </p>
          </div>
        )}

        {/* 3rd Place (Right) */}
        {leaderboardData[2] && (
          <div className="flex flex-col items-center mx-4 w-1/4">
            <div className="bg-orange-300 dark:bg-orange-600 rounded-full w-24 h-24 flex items-center justify-center mb-2 relative">
              <span className="absolute -top-2 -left-2 bg-orange-500 dark:bg-orange-700 text-white rounded-full w-8 h-8 flex items-center justify-center">3</span>
              <div className="w-20 h-20 rounded-full bg-orange-200 dark:bg-orange-500 flex items-center justify-center overflow-hidden">
                {leaderboardData[2].image ? (
                  <img 
                    src={`${BASE_URL}${leaderboardData[2].image}`} 
                    alt={leaderboardData[2].name} 
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = "https://via.placeholder.com/100"}
                  />
                ) : (
                  <span className="text-2xl">🥉</span>
                )}
              </div>
            </div>
            <h3 className="font-semibold text-center dark:text-white">
              {leaderboardData[2].name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Score: {leaderboardData[2].score}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {leaderboardData[2].correct}/{leaderboardData[2].total_questions} ({leaderboardData[2].accuracy}%)
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Avg: {leaderboardData[2].avg_time_per_question}s
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard Table - Mobile Cards */}
      <div className="md:hidden space-y-4">
        {leaderboardData.map((user, index) => (
          <div key={user.user_id} className={`p-4 rounded-lg shadow ${
            index < 3 ? 
              index === 0 ? "bg-yellow-50 dark:bg-yellow-900" :
              index === 1 ? "bg-gray-100 dark:bg-gray-700" :
              "bg-orange-50 dark:bg-orange-900" :
            "bg-white dark:bg-gray-800"
          }`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                  index === 0 ? "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100" :
                  index === 1 ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200" :
                  index === 2 ? "bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-100" :
                  "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                }`}>
                  {index + 1}
                </span>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 mr-2 flex items-center justify-center overflow-hidden">
                    {user.image ? (
                      <img 
                        src={`${BASE_URL}${user.image}`} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = "https://via.placeholder.com/100"}
                      />
                    ) : (
                      <span className="text-xs">👤</span>
                    )}
                  </div>
                  <span className="dark:text-white">{user.name}</span>
                </div>
              </div>
              <span className="font-medium dark:text-white">Score: {user.score}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-300">Correct</p>
                <p className="dark:text-white">{user.correct}/{user.total_questions}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300">Accuracy</p>
                <p className="dark:text-white">{user.accuracy}%</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300">Avg Time</p>
                <p className="dark:text-white">{user.avg_time_per_question}s</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard Table - Desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Correct</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Accuracy</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {leaderboardData.map((user, index) => (
              <tr key={user.user_id} className={index < 3 ? "bg-gray-50 dark:bg-gray-700" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                    index === 0 ? "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100" :
                    index === 1 ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200" :
                    index === 2 ? "bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-100" :
                    "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 mr-3 flex items-center justify-center overflow-hidden">
                      {user.image ? (
                        <img 
                          src={`${BASE_URL}${user.image}`} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.src = "https://via.placeholder.com/100"}
                        />
                      ) : (
                        <span className="text-xs">👤</span>
                      )}
                    </div>
                    <div>
                      <span className="dark:text-white">{user.name}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right dark:text-white">
                  {user.score}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right dark:text-white">
                  {user.correct}/{user.total_questions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right dark:text-white">
                  {user.accuracy}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right dark:text-white">
                  {user.avg_time_per_question}s
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceLeaderboard;