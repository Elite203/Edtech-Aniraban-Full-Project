import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Loader2, BookOpen, Clock, List } from 'lucide-react';

const SSCTestSeriesInstructionsFour = ({ examSetId }) => {
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [timing, setTiming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, timingRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Exams/get_set_stats.php?exam_set_id=${examSetId}`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/TimeManagement/get_exam_timing_details.php?exam_set_id=${examSetId}`)
        ]);

        const statsData = await statsRes.json();
        const timingData = await timingRes.json();

        if (statsData.success && timingData.success) {
          setStats(statsData.data);
          setTiming(timingData.data);
        } else {
          setError('Failed to fetch some data');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (examSetId) {
      fetchData();
    }
  }, [examSetId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading exam details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-purple-600 hover:underline text-sm font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-purple-50 border-purple-100'}`}>
          <div className="flex items-center space-x-3 mb-3">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>Question Stats</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Questions:</span>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats?.total_questions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Subjects:</span>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats?.total_subjects}</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50 border-blue-100'}`}>
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>Timing Overview</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Overall Time:</span>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{timing?.overall_timing?.total_time_minutes} mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Sections:</span>
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{timing?.sectional_timing?.total_sections}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <List className="w-5 h-5 text-purple-600" />
          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subject-wise Breakdown</h4>
        </div>
        <div className={`overflow-hidden rounded-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <table className="w-full text-left text-sm">
            <thead className={isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}>
              <tr>
                <th className="px-4 py-3 font-medium">Subject Name</th>
                <th className="px-4 py-3 font-medium text-center">Questions</th>
                <th className="px-4 py-3 font-medium text-center">Allocated Time</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {stats?.subject_breakdown.map((subject, idx) => {
                const timeInfo = timing?.subject_wise_timing.subjects.find(s => s.subject_name === subject.subject_name);
                return (
                  <tr key={idx} className={isDarkMode ? 'bg-gray-700/30' : 'bg-white'}>
                    <td className={`px-4 py-3 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{subject.subject_name}</td>
                    <td className={`px-4 py-3 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{subject.count}</td>
                    <td className={`px-4 py-3 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{timeInfo?.time_allocated || '-'} mins</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sectional Breakdown */}
      {timing?.sectional_timing?.sections?.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <List className="w-5 h-5 text-blue-600" />
            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sectional Timing</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {timing.sectional_timing.sections.map((section, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Section {section.section_number}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${isDarkMode ? 'bg-blue-900/40 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                    {section.section_total_time} mins
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {section.subjects_in_section.map((sub, sIdx) => (
                    <span key={sIdx} className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {sub.subject_name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SSCTestSeriesInstructionsFour;
