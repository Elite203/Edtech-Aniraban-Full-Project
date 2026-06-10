import React, { useEffect, useState } from "react";
import axios from "axios";

const PerformanceCompare = () => {
  const [records, setRecords] = useState([]);
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("Score");
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem("user_id"));
     const month = localStorage.getItem("month");
        const year = localStorage.getItem("year");

        const resultRes = await axios.get(`${BASE_URL}api/CurrentAffairs/get_exam_result_data.php`, {
          params: { user_id: userId,month:month,year:year},
        });

        if (resultRes.data.status !== "success" || !Array.isArray(resultRes.data.data)) {
          setError("No result data found.");
          return;
        }

        const payload = resultRes.data.data;
        setRecords(payload);

        let att = 0, corr = 0, inc = 0;
        payload.forEach((record) => {
          if (record.selected_key && record.selected_key.trim()) {
            att++;
            if (record.is_correct == 1) {
              corr++;
            } else {
              inc++;
            }
          }
        });

        const sc = corr * 3 - inc;
        const acc = att > 0 ? Math.round((corr / att) * 100) : 0;

        setAttempted(att);
        setCorrect(corr);
        setIncorrect(inc);
        setScore(sc);
        setAccuracy(acc);
      } catch (err) {
        setError("Something went wrong while fetching result.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [BASE_URL]);

  const getComparisonData = () => {
    const avgTimePerQuestion = records.length > 0 
      ? records.reduce((sum, r) => sum + (r.time_spent || 0), 0) / records.length 
      : 0;
      
    return {
      Score: {
        you: score,
        topper: records.length * 3,
        average: Math.floor(records.length * 1.5)
      },
      Accuracy: {
        you: accuracy,
        topper: 100,
        average: 65
      },
      Attempt: {
        you: attempted,
        topper: records.length,
        average: Math.floor(records.length * 0.8)
      },
      Correct: {
        you: correct,
        topper: records.length,
        average: Math.floor(records.length * 0.6)
      },
      Incorrect: {
        you: incorrect,
        topper: 0,
        average: Math.floor(records.length * 0.2)
      },
      Time: {
        you: Math.min(avgTimePerQuestion, 60),
        topper: 10,
        average: 30
      }
    };
  };

  const comparisonData = getComparisonData();
  const currentData = comparisonData[selectedMetric];

  const metricColors = {
    Score: "bg-indigo-500",
    Accuracy: "bg-emerald-500",
    Attempt: "bg-blue-500",
    Correct: "bg-green-500",
    Incorrect: "bg-red-500",
    Time: "bg-amber-500"
  };

  const metricBorderColors = {
    Score: "border-indigo-200 dark:border-indigo-700",
    Accuracy: "border-emerald-200 dark:border-emerald-700",
    Attempt: "border-blue-200 dark:border-blue-700",
    Correct: "border-green-200 dark:border-green-700",
    Incorrect: "border-red-200 dark:border-red-700",
    Time: "border-amber-200 dark:border-amber-700"
  };

  const metricBgColors = {
    Score: "bg-indigo-50 dark:bg-indigo-900/30",
    Accuracy: "bg-emerald-50 dark:bg-emerald-900/30",
    Attempt: "bg-blue-50 dark:bg-blue-900/30",
    Correct: "bg-green-50 dark:bg-green-900/30",
    Incorrect: "bg-red-50 dark:bg-red-900/30",
    Time: "bg-amber-50 dark:bg-amber-900/30"
  };

  const metricTextColors = {
    Score: "text-indigo-600 dark:text-indigo-400",
    Accuracy: "text-emerald-600 dark:text-emerald-400",
    Attempt: "text-blue-600 dark:text-blue-400",
    Correct: "text-green-600 dark:text-green-400",
    Incorrect: "text-red-600 dark:text-red-400",
    Time: "text-amber-600 dark:text-amber-400"
  };

  if (loading) return <div className="text-center mt-20 dark:text-white">Loading comparison data...</div>;
  if (error) return <div className="text-center mt-20 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center text-2xl font-bold mb-8 text-gray-800 dark:text-white">Performance Comparison</h2>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {Object.keys(comparisonData).map((metric) => (
            <button
              key={metric}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedMetric === metric
                  ? `${metricColors[metric]} text-white`
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setSelectedMetric(metric)}
            >
              {metric}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-end h-64">
            <div className="flex flex-col justify-between h-full text-sm text-gray-500 dark:text-gray-400 w-8 mr-4">
              {[100, 50, 0].map((val) => (
                <span key={val}>{val}{selectedMetric === "Accuracy" ? "%" : ""}</span>
              ))}
            </div>

            <div className="flex-1 flex justify-between h-full">
              {["you", "topper", "average"].map((type) => {
                const value = currentData[type];
                const heightPercentage = Math.min((value / 100) * 90, 90);
                const barColor = metricColors[selectedMetric];

                return (
                  <div key={type} className="flex flex-col items-center flex-col-reverse w-12">
                    <div
                      className={`w-full rounded-t-lg ${barColor} transition-all duration-500`}
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">{type}</p>
                      <p className="text-sm font-bold dark:text-white">
                        {value}{selectedMetric === "Accuracy" ? "%" : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {["you", "topper", "average"].map((type) => {
            const value = currentData[type];
            const cardColor = metricBgColors[selectedMetric];
            const textColor = metricTextColors[selectedMetric];
            const borderColor = metricBorderColors[selectedMetric];
            
            return (
              <div 
                key={type} 
                className={`${cardColor} p-5 rounded-xl border ${type === "you" ? "border-2 " + borderColor : "border-gray-200 dark:border-gray-700"}`}
              >
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {type === "you" ? "Your Performance" : type === "topper" ? "Topper's Score" : "Average Score"}
                </h3>
                <p className={`text-3xl font-bold ${type === "you" ? textColor : "text-gray-700 dark:text-gray-200"}`}>
                  {value}{selectedMetric === "Accuracy" ? "%" : ""}
                </p>
                {type === "you" && (
                  <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                    {value < currentData.topper 
                      ? `You need ${currentData.topper - value} more to match the topper` 
                      : value === currentData.topper
                      ? "You're at the top!"
                      : "You're performing better than the topper!"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PerformanceCompare;