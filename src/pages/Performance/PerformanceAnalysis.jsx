import React, { useEffect, useState } from "react";
import axios from "axios";
import AnimatedCircle from "../AnimatedCircle";

const PerformanceAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [rank, setRank] = useState(0);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [percentile, setPercentile] = useState(0);
  const [error, setError] = useState("");
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const cutoff = 14;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem("user_id"));
        const month = localStorage.getItem("month");
        const year = localStorage.getItem("year");
//console.log("mymymy",year);
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
        const total = 101244;
        const myRank = Math.max(1, Math.floor((1 - sc / (payload.length * 3)) * total));
        const perc = Math.round((1 - myRank / total) * 100);

        setAttempted(att);
        setCorrect(corr);
        setIncorrect(inc);
        setScore(sc);
        setAccuracy(acc);
        setRank(myRank);
        setTotalCandidates(total);
        setPercentile(perc);
      } catch (err) {
        setError("Something went wrong while fetching result.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const status = score >= cutoff ? "PASS" : "FAIL";

  if (loading) return <div className="text-center mt-20 dark:text-white">Loading results...</div>;
  if (error) return <div className="text-center mt-20 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <>
      <h2 className="text-center text-xl font-semibold mb-6 dark:text-white">
        Overall Performance Summary
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-8">
        <AnimatedCircle
          title="Attempted"
          value={attempted}
          total={records.length}
          color="#4F46E5"
        />
        <AnimatedCircle
          title="Correct"
          value={correct}
          total={records.length}
          color="#16A34A"
        />
        <AnimatedCircle
          title="Incorrect"
          value={incorrect}
          total={records.length}
          color="#DC2626"
        />
        <AnimatedCircle
          title="Score"
          value={score}
          total={records.length * 3}
          color="#0EA5E9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto justify-items-center">
        <AnimatedCircle
          title="Accuracy"
          value={accuracy}
          isPercent
          color="#22C55E"
        />
        <AnimatedCircle
          title="Percentile"
          value={percentile}
          isPercent
          color="#8B5CF6"
        />

        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full border-8 border-cyan-400 dark:border-cyan-500 flex items-center justify-center text-xs font-bold text-cyan-700 dark:text-cyan-300 text-center">
            {rank} / {totalCandidates}
          </div>
          <p className="mt-2 font-semibold dark:text-white">Rank</p>
        </div>

        <div className="flex flex-col items-center col-span-1 md:col-span-3">
          <div
            className={`px-4 py-2 font-bold text-lg rounded ${
              status === "PASS" 
                ? "bg-green-600 dark:bg-green-700" 
                : "bg-red-600 dark:bg-red-700"
            } text-white`}
          >
            {status}
          </div>
          <p className="mt-2 text-sm dark:text-gray-300">
            Cutoff: <span className="text-purple-600 dark:text-purple-400 font-bold">{cutoff}</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default PerformanceAnalysis;
