import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ScrollSmoother } from "gsap/ScrollSmoother";

const TopicandChapterWiseAnalysis = ({ records }) => {
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

  console.log("TopicandChapterWiseAnalysis Records:", records);
  const { exam_set_id } = useParams();
  const [allMetaData, setAllMetaData] = useState([]);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Cinematic Color Palette
  const TOPIC_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'
  ];

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const apiBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
        const response = await axios.get(`${apiBaseUrl}api/ChapterandTopicManagement/get_set_analysis_metadata_v2.php`, {
          params: { exam_set_id }
        });
        if (response.data.success) {
          setAllMetaData(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };
    if (exam_set_id) {
      fetchMetaData();
    }
  }, [exam_set_id, BASE_URL]);

  const { chapterData, topicData, topicColorMap } = useMemo(() => {
    const chapters = {};
    const topics = {};
    const questionStats = {}; // { qId: { cKey, tKey, isCorrect } }
    
    // 1. Process all available metadata to establish the baseline (total questions)
    allMetaData.forEach(meta => {
      const qId = String(meta.question_id);
      if (!qId || qId === 'undefined') return;

      questionStats[qId] = {
        chapter: meta.chapter_name || 'Miscellaneous',
        topic: meta.topic_name || 'Uncategorized',
        isCorrect: false,
        isAccountedFor: true
      };
    });

    // 2. Process actual performance records
    // This updates 'correct' status and adds any questions missing from metadata baseline
    records.forEach((record) => {
      const qId = String(record.question_id || record.id);
      if (!qId || qId === 'undefined') return;

      const isCorrect = record.is_correct == 1;

      if (questionStats[qId]) {
        // Question exists in metadata, just update result
        questionStats[qId].isCorrect = isCorrect;
        
        // If it was miscellaneous in metadata, try to use record's subject/chapter
        if (questionStats[qId].chapter === 'Miscellaneous') {
          // If no chapter but has subject, categorize under subject
          questionStats[qId].chapter = record.chapter_name || record.subject || 'Miscellaneous';
          // Label the topic as Miscellaneous if it was uncategorized
          if (questionStats[qId].topic === 'Uncategorized' && !record.chapter_name && record.subject) {
             questionStats[qId].topic = 'Miscellaneous';
          }
        }
      } else {
        // Question missing from metadata fetch, add it now using record's own info
        const finalChapter = record.chapter_name || record.subject || 'Miscellaneous';
        const finalTopic = record.topic_name || (!record.chapter_name && record.subject ? 'Miscellaneous' : 'Uncategorized');
        
        questionStats[qId] = {
          chapter: finalChapter,
          topic: finalTopic,
          isCorrect: isCorrect,
          isAccountedFor: true
        };
      }
    });

    // 3. Define unique topics for color mapping
    const uniqueTopics = Array.from(new Set(Object.values(questionStats).map(s => s.topic)));
    const colorMap = {};
    uniqueTopics.forEach((t, i) => {
      colorMap[t] = TOPIC_COLORS[i % TOPIC_COLORS.length];
    });

    // 4. Aggregate stats into final structures
    Object.values(questionStats).forEach(stat => {
      const cKey = stat.chapter;
      const tKey = stat.topic;

      // Initialize chapter
      if (!chapters[cKey]) {
        chapters[cKey] = { name: cKey, correct: 0, total: 0, topics: {} };
      }
      // Initialize topic inside chapter
      if (!chapters[cKey].topics[tKey]) {
        chapters[cKey].topics[tKey] = { name: tKey, correct: 0, total: 0 };
      }
      // Initialize global topic
      if (!topics[tKey]) {
        topics[tKey] = { name: tKey, correct: 0, total: 0 };
      }

      // Increment counts
      chapters[cKey].total += 1;
      chapters[cKey].topics[tKey].total += 1;
      topics[tKey].total += 1;

      if (stat.isCorrect) {
        chapters[cKey].correct += 1;
        chapters[cKey].topics[tKey].correct += 1;
        topics[tKey].correct += 1;
      }
    });

    return {
      chapterData: Object.values(chapters).sort((a, b) => b.total - a.total),
      topicData: Object.values(topics).sort((a, b) => b.correct - a.correct),
      topicColorMap: colorMap
    };
  }, [records, allMetaData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
          <p className="text-sm text-green-600 font-bold">Correct: {payload[0].payload.correct}</p>
          <p className="text-sm text-gray-500">Total: {payload[0].payload.total}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-8">
      {/* Main Topic Visualization Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl">
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
          TOPIC ANALYSIS (QUESTIONS BY CORRECT ANSWERS)
        </h3>
        
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topicData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 'bold' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                label={{ value: 'NUMBER OF QUESTIONS', angle: -90, position: 'insideLeft', fill: '#6B7280', fontSize: 12, offset: 10 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Bar dataKey="correct" barSize={35}>
                {topicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={topicColorMap[entry.name]} radius={[4, 4, 0, 0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chapter Analysis Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl">
        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
          CHAPTER ANALYSIS
        </h3>
      </div>

      {/* Chapter Cards with Multi-color Topic Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chapterData.map((item) => (
          <div key={item.name} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.name}</h4>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                  {item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0}%
                </span>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Accuracy</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Multi-color Segmented Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 tracking-tighter">
                  <span>CHAPTER OVERVIEW</span>
                  <span>{item.total} Questions Total</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700/50 h-4 rounded-full overflow-hidden flex border dark:border-gray-600">
                  {Object.values(item.topics).map((topic, idx) => (
                    topic.total > 0 && (
                      <div 
                        key={idx}
                        style={{ 
                          width: `${(topic.total / item.total) * 100}%`,
                          backgroundColor: topicColorMap[topic.name]
                        }} 
                        className="h-full relative group"
                        title={`${topic.name}: ${topic.total} questions`}
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Topic Legend & Performance */}
              <div className="grid grid-cols-2 gap-3">
                {Object.values(item.topics).map((topic, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50">
                    <div 
                      className="w-3 h-3 rounded-sm flex-shrink-0" 
                      style={{ backgroundColor: topicColorMap[topic.name] }}
                    />
                    <div className="flex-grow min-w-0">
                      <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">{topic.name}</p>
                      <p className="text-[9px] font-bold text-blue-500 uppercase">
                        {topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0}% Acc.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-900 dark:text-white">
                        {topic.correct}/{topic.total}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chapter Results</span>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-black text-green-600">CORRECT: {item.correct}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-black text-red-600">WRONG: {item.total - item.correct}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicandChapterWiseAnalysis;
