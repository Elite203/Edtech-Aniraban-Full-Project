import React, { useState, useEffect } from "react";
import CircularProgress from "./Animatedcircularbar";
import { ScrollSmoother } from "gsap/ScrollSmoother";

const SubjectWiseAnalysis = ({ records, marking, subjectStats, timeConfig }) => {
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
  console.log("SubjectWiseAnalysis Data:", { records, marking, subjectStats, timeConfig });
  const [activeSubjectTab, setActiveSubjectTab] = useState(null);
  const [subjectData, setSubjectData] = useState([]);

  const processedSubjectData = React.useMemo(() => {
    if (subjectStats && Object.keys(subjectStats).length > 0) {
      return Object.entries(subjectStats).map(([name, data]) => {
        const attempted = data.attemptedCount || 0;
        const correct = data.correctCount || 0;
        const incorrect = data.incorrectCount || 0;
        const totalQuestions = data.questionCount || 0;

        // Dynamically compute max marks and score based on actual marking configuration
        const posMark = Number(marking?.positive || 3);
        const negMark = Number(marking?.negative || 1);
        const maxMarks = totalQuestions * posMark;
        const score = Math.max(0, (correct * posMark) - (incorrect * negMark)); // Clamp to 0 if negative

        const timeSpent = data.timeSpent || 0;
        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

        return {
          name,
          attempted,
          correct,
          incorrect,
          score,
          totalQuestions,
          maxMarks,
          timeSpent,
          accuracy
        };
      });
    }

    if (!records || records.length === 0) return [];

    const subjects = {};
    records.forEach((record) => {
      // Robust subject identification (checking all possible keys from varying New/Old UI schemas)
      const subjectName = (record.subject || record.subject_name || record.subject_id || "General").toString().trim();

      if (!subjects[subjectName]) {
        subjects[subjectName] = {
          attempted: 0,
          correct: 0,
          incorrect: 0,
          score: 0,
          totalQuestions: 0,
          maxMarks: 0,
          timeSpent: 0,
        };
      }

      subjects[subjectName].totalQuestions++;
      subjects[subjectName].maxMarks += Number(marking?.positive || 3);
      subjects[subjectName].timeSpent += Number(record.time_spent || 0);

      const selected = record.selected_key || record.selected_option;
      if (selected && String(selected).trim()) {
        subjects[subjectName].attempted++;
        // Robust correctness check (handles is_correct: 1, "1", true, etc.)
        if (Number(record.is_correct) === 1) {
          subjects[subjectName].correct++;
          subjects[subjectName].score += Number(marking?.positive || 3);
        } else {
          subjects[subjectName].incorrect++;
          subjects[subjectName].score -= Number(marking?.negative || 1);
        }
      }
    });

    return Object.entries(subjects).map(([name, data]) => ({
      name,
      ...data,
      score: Math.max(0, data.score), // Clamp to 0 if negative (round off to zero)
      accuracy: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0,
    }));
  }, [records, marking, subjectStats]);

  useEffect(() => {
    setSubjectData(processedSubjectData);

    // If active tab doesn't exist in new data, or none selected, pick first
    const tabExists = processedSubjectData.find(s => s.name === activeSubjectTab);
    if (processedSubjectData.length > 0 && (!activeSubjectTab || !tabExists)) {
      setActiveSubjectTab(processedSubjectData[0].name);
    }
  }, [processedSubjectData, activeSubjectTab]);

  const activeData = React.useMemo(() => {
    return subjectData.find(s => s.name === activeSubjectTab);
  }, [subjectData, activeSubjectTab]);

  return (
    <div className="mb-6 max-w-5xl mx-auto p-4">
      <h3 className="text-center text-lg font-medium mb-4 dark:text-white font-black uppercase tracking-tight">Subject-wise Performance</h3>

      {/* Subject Tabs */}
      {subjectData.length > 0 && (
        timeConfig?.type === 'sectional' && timeConfig?.sections?.length > 0 ? (
          <div className="flex flex-col gap-4 mb-8">
            {timeConfig.sections.map((sec, idx) => {
              const secSubjects = sec.subjects || [];
              const relevantData = subjectData.filter(s => secSubjects.map(sub => sub.toUpperCase()).includes(s.name.toUpperCase()));
              if (relevantData.length === 0) return null;
              return (
                <div key={idx} className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                  <div className="font-bold uppercase tracking-wider mb-3 text-gray-700 dark:text-gray-300">
                    SECTION-{idx + 1}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {relevantData.map(subject => (
                      <button
                        key={subject.name}
                        onClick={() => setActiveSubjectTab(subject.name)}
                        className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all shadow-sm ${activeSubjectTab === subject.name
                          ? "bg-blue-600 text-white shadow-blue-500/30 scale-105"
                          : "bg-white text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border dark:border-gray-600"
                          }`}
                      >
                        {subject.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {subjectData.map((subject) => (
              <button
                key={subject.name}
                onClick={() => setActiveSubjectTab(subject.name)}
                className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all shadow-sm ${activeSubjectTab === subject.name
                  ? "bg-blue-600 text-white shadow-blue-500/30 scale-105"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                {subject.name}
              </button>
            ))}
          </div>
        )
      )}

      {/* Subject Analysis Block */}
      {activeData && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6 border border-gray-100 dark:border-gray-700 transition-all">
          {/* Subject Stats Display */}
          <div className="grid grid-cols-2 gap-4 mb-8 border-b dark:border-gray-700 pb-6 text-center">
            <div className="border-r dark:border-gray-700">
              <div className="text-4xl font-black text-blue-600 dark:text-blue-400 leading-none">
                {activeData.score.toFixed(0)} <span className="text-lg text-gray-400 dark:text-gray-500 ml-1">/ {activeData.maxMarks.toFixed(0)}</span>
              </div>
              <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-2">
                Marks Obtained
              </div>
            </div>
            <div>
              <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                {(() => {
                  const totalSecs = activeData.timeSpent || 0;
                  const mins = Math.floor(totalSecs / 60);
                  const secs = totalSecs % 60;
                  return `${mins}m ${secs}s`;
                })()}
              </div>
              <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-2">
                Time Spent
              </div>
            </div>
          </div>

          <h4 className="text-center text-xl font-black mb-8 dark:text-white uppercase tracking-wider">
            {activeData.name} Analysis
          </h4>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <CircularProgress
              label="Attempted"
              percentage={Math.round((activeData.attempted / (activeData.totalQuestions || 1)) * 100)}
              color="#4F46E5"
              subValue={`${activeData.attempted} / ${activeData.totalQuestions}`}
            />
            <CircularProgress
              label="Correct"
              percentage={Math.round((activeData.correct / (activeData.totalQuestions || 1)) * 100)}
              color="#16A34A"
              subValue={`${activeData.correct} / ${activeData.totalQuestions}`}
            />
            <CircularProgress
              label="Incorrect"
              percentage={Math.round((activeData.incorrect / (activeData.totalQuestions || 1)) * 100)}
              color="#DC2626"
              subValue={`${activeData.incorrect} / ${activeData.totalQuestions}`}
            />
            <CircularProgress
              label="Score"
              percentage={Math.round((activeData.score / (activeData.maxMarks || 1)) * 100)}
              color="#0EA5E9"
              subValue={`${activeData.score.toFixed(0)} / ${activeData.maxMarks}`}
            />
            <CircularProgress
              label="Accuracy"
              percentage={activeData.accuracy}
              color="#F59E0B"
              subValue={`${activeData.correct} / ${activeData.attempted}`}
            />
            <CircularProgress
              label="Percentile"
              percentage={Math.round((activeData.score / (activeData.maxMarks || 1)) * 100)}
              color="#8B5CF6"
              subValue={`${Math.round((activeData.score / (activeData.maxMarks || 1)) * 100)}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectWiseAnalysis;
