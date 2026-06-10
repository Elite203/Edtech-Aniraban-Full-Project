import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Newspaper,
  Eye,
  Clock,
  CheckCircle,
  Star,
  Calendar,
  Tag,
  Loader2,
  ChevronDown,
  ChevronUp,
  Filter,
  Lock
} from 'lucide-react';

export default function Bookmarks() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('test-series');
  const [testSeriesBookmarks, setTestSeriesBookmarks] = useState([]);
  const [caArticles, setCaArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterYear, setFilterYear] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All');
  const [coursePurchases, setCoursePurchases] = useState([]);

  const user = JSON.parse(localStorage.getItem("student_user") || localStorage.getItem("user") || "{}");
  const student_id = user.id;

  const premiumExpiry = localStorage.getItem('premium_monthly_test_expiry');
  const isPremium = premiumExpiry && new Date(premiumExpiry) > new Date();

  useEffect(() => {
    if ((activeTab === 'test-series' || activeTab === 'ca-questions') && student_id) {
      fetchSavedQuestions();
    } else if (activeTab === 'current-affairs' && student_id) {
      fetchSavedArticles();
    }
  }, [activeTab, student_id]);

  useEffect(() => {
    if (student_id) {
      const fetchCoursePurchases = async () => {
        try {
          const BASE_URL = import.meta.env.VITE_BASE_URL || "";
          const response = await fetch(`${BASE_URL}api/Courses/get_test_series_purchases.php?student_id=${student_id}`);
          const data = await response.json();
          if (data.status === 'success' && data.data) {
            setCoursePurchases(data.data);
          }
        } catch (e) {
          console.error("Failed to fetch course purchases in Bookmarks:", e);
        }
      };
      fetchCoursePurchases();
    }
  }, [student_id]);

  const isCourseActive = (courseId) => {
    const purchase = coursePurchases.find(p => String(p.course_id) === String(courseId));
    return purchase && purchase.status === 'active';
  };

  const fetchSavedQuestions = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${apiUrl}/api/SaveandReport/get_saved_questions.php?student_id=${student_id}`);
      const data = await response.json();
      if (data.success) {
        setTestSeriesBookmarks(data.data);
      }
    } catch (error) {
      console.error("Error fetching saved questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedArticles = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${apiUrl}/api/SaveandReport/get_saved_ca_articles.php?student_id=${student_id}`);
      const data = await response.json();
      if (data.success) {
        setCaArticles(data.data);
      }
    } catch (error) {
      console.error("Error fetching saved articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const stripHtmlTags = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };


  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTestSeriesContent = () => {
    const questions = testSeriesBookmarks.filter(b => b.quiz_type !== 'current_affairs');

    // Get unique courses from the data
    const availableCourses = ['All', ...new Set(questions.map(b => b.course_name))].sort();

    const filteredQuestions = questions.filter(b => {
      return filterCourse === 'All' || b.course_name === filterCourse;
    });

    let content;
    if (loading) {
      content = (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading saved questions...</p>
        </div>
      );
    } else if (questions.length === 0) {
      content = (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No saved questions yet</p>
          <p className="text-gray-400 dark:text-gray-500">Your bookmarked questions will appear here</p>
        </div>
      );
    } else if (filteredQuestions.length === 0) {
      content = (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Filter className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No questions found for this course</p>
          <p className="text-gray-400 dark:text-gray-500">Try selecting a different course filter</p>
        </div>
      );
    } else {
      content = filteredQuestions.map((bookmark) => {
        const active = isCourseActive(bookmark.course_id);
        return (
          <div key={bookmark.bookmark_id} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow overflow-hidden">
            {!active && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-md bg-white/30 dark:bg-gray-900/40">
                <Lock className="w-10 h-10 text-slate-500 dark:text-slate-400 mb-2" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-305">Subscription Required</span>
              </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Subject</span>
                  <span className={`px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg text-xs font-medium`}>
                    {bookmark.subject_name}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Course</span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-lg text-xs font-medium">
                    {bookmark.course_name}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Exam Set</span>
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded-lg text-xs font-medium">
                    {bookmark.set_name || `Set ${bookmark.set_number}`}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">ID</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium">
                    #{bookmark.id}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                <Calendar className="w-4 h-4 inline mr-1" />
                {new Date(bookmark.saved_date).toLocaleDateString()}
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 line-clamp-2 break-words whitespace-normal">
              {stripHtmlTags(bookmark.question_english || bookmark.question_hindi)}
            </h3>

            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Type:</span> {bookmark.question_type}
              </div>
              {(bookmark.solution_english || bookmark.solution_hindi) && (
                <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Solution Available
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                disabled={!active}
                onClick={() => setExpandedId(expandedId === bookmark.bookmark_id ? null : bookmark.bookmark_id)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {expandedId === bookmark.bookmark_id ? <ChevronUp className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {expandedId === bookmark.bookmark_id ? 'Hide Details' : 'View Question'}
              </button>
              <button
                disabled={!active}
                onClick={() => navigate(`/exam/solution/${bookmark.course_id}/${bookmark.set_id}/${bookmark.set_number}/0`, { state: { record: bookmark } })}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Solution
              </button>
            </div>

            {expandedId === bookmark.bookmark_id && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Question</h4>
                  <div className="text-gray-900 dark:text-white prose dark:prose-invert max-w-none break-words whitespace-normal"
                    dangerouslySetInnerHTML={{ __html: bookmark.question_english || bookmark.question_hindi }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'option_a', label: 'A' },
                    { key: 'option_b', label: 'B' },
                    { key: 'option_c', label: 'C' },
                    { key: 'option_d', label: 'D' }
                  ].map((opt) => {
                    const isCorrect = bookmark.correct_option?.toLowerCase() === opt.label.toLowerCase();
                    return (
                      <div
                        key={opt.key}
                        className={`p-3 rounded-lg border ${isCorrect
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                          }`}
                      >
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mr-2">
                          {opt.label}:
                        </span>
                        <span
                          className={`text-sm ${isCorrect ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-700 dark:text-gray-300'} break-words whitespace-normal`}
                          dangerouslySetInnerHTML={{ __html: bookmark[`${opt.key}_english`] || bookmark[`${opt.key}_hindi`] }}
                        />
                        {isCorrect && <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />}
                      </div>
                    );
                  })}
                </div>

                {(bookmark.solution_english || bookmark.solution_hindi) && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                    <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Solution</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-normal"
                      dangerouslySetInnerHTML={{ __html: bookmark.solution_english || bookmark.solution_hindi }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      });
    }

    return (
      <div className="space-y-6">
        {/* Filters Section */}
        {questions.length > 0 && (
          <div className="flex flex-wrap gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">Filter by Course</label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                {availableCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setFilterCourse('All')}
              className="mt-auto mb-0.5 px-4 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

        <div className="space-y-4">
          {content}
        </div>
      </div>
    );
  };

  const renderCASavedQuestionsContent = () => {
    const caQuestions = testSeriesBookmarks.filter(b => b.quiz_type === 'current_affairs');

    // Get unique years and months from the data
    const availableYears = ['All', ...new Set(caQuestions.map(b => b.Year))].sort((a, b) => b - a);
    const availableMonths = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const filteredCAQuestions = caQuestions.filter(b => {
      const yearMatch = filterYear === 'All' || String(b.Year) === String(filterYear);
      const monthMatch = filterMonth === 'All' || b.Month === filterMonth;
      return yearMatch && monthMatch;
    });

    let content;
    if (loading) {
      content = (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading saved Current Affairs questions...</p>
        </div>
      );
    } else if (caQuestions.length === 0) {
      content = (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Newspaper className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No saved CA questions yet</p>
          <p className="text-gray-400 dark:text-gray-500">Saved questions from Current Affairs tests will appear here</p>
        </div>
      );
    } else if (filteredCAQuestions.length === 0) {
      content = (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Filter className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No questions found for this filter</p>
          <p className="text-gray-400 dark:text-gray-500">Try adjusting your year or month selection</p>
        </div>
      );
    } else {
      content = filteredCAQuestions.map((bookmark) => (
        <div key={bookmark.bookmark_id} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow overflow-hidden">
          {!isPremium && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-md bg-white/30 dark:bg-gray-900/40">
              <Lock className="w-10 h-10 text-gray-500 dark:text-gray-400 mb-2" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Premium Required</span>
            </div>
          )}
          <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Quiz</span>
                <span className={`px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400 rounded-lg text-xs font-medium`}>
                  {bookmark.Month} {bookmark.Year}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Type</span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-lg text-xs font-medium uppercase">
                  {bookmark.quiz_type?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">ID</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium">
                  #{bookmark.QuestionID}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              <Calendar className="w-4 h-4 inline mr-1" />
              {new Date(bookmark.saved_date).toLocaleDateString()}
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 break-words whitespace-normal">
            {stripHtmlTags(bookmark.Question_En || bookmark.Question_Hi)}
          </h3>

          <div className="flex flex-wrap gap-3">
            <button
              disabled={!isPremium}
              onClick={() => setExpandedId(expandedId === bookmark.bookmark_id ? null : bookmark.bookmark_id)}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {expandedId === bookmark.bookmark_id ? <ChevronUp className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {expandedId === bookmark.bookmark_id ? 'Hide Details' : 'View Question'}
            </button>
            {bookmark.SolutionLink ? (
              <button
                disabled={!isPremium}
                onClick={() => {
                  const slug = bookmark.SolutionLink.split('/').pop();
                  navigate(`/summary/${slug}`, { state: { fromExam: true } });
                }}
                className="flex items-center px-4 py-2 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                View Solution
              </button>
            ) : (
              <div className="flex items-center px-4 py-2 text-gray-400 dark:text-gray-500 text-sm font-medium italic">
                <CheckCircle className="w-4 h-4 mr-2 opacity-50" />
                No solutions available
              </div>
            )}
          </div>

          {expandedId === bookmark.bookmark_id && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Question</h4>
                <div className="text-gray-900 dark:text-white prose dark:prose-invert max-w-none break-words whitespace-normal"
                  dangerouslySetInnerHTML={{ __html: bookmark.Question_En || bookmark.Question_Hi }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'OptionA', label: 'A' },
                  { key: 'OptionB', label: 'B' },
                  { key: 'OptionC', label: 'C' },
                  { key: 'OptionD', label: 'D' }
                ].map((opt) => {
                  const isCorrect = bookmark.CorrectAnswer?.toUpperCase() === opt.label;
                  return (
                    <div
                      key={opt.key}
                      className={`p-3 rounded-lg border ${isCorrect
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                    >
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mr-2">
                        {opt.label}:
                      </span>
                      <span
                        className={`text-sm ${isCorrect ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-700 dark:text-gray-300'} break-words whitespace-normal`}
                        dangerouslySetInnerHTML={{ __html: bookmark[`${opt.key}_En`] || bookmark[`${opt.key}_Hi`] }}
                      />
                      {isCorrect && <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />}
                    </div>
                  );
                })}
              </div>

              {bookmark.SolutionLink && (
                <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800/30">
                  <h4 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">Solution Info</h4>
                  <div className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-normal">
                    Solution is available in the test results. {bookmark.SolutionLink && `Reference: ${bookmark.SolutionLink}`}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ));
    }

    return (
      <div className="space-y-6">
        {/* Filters Section */}
        {caQuestions.length > 0 && (
          <div className="flex flex-wrap gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">Filter by Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">Filter by Month</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              >
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => { setFilterYear('All'); setFilterMonth('All'); }}
              className="mt-auto mb-0.5 px-4 py-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        <div className="space-y-4">
          {content}
        </div>
      </div>
    );
  };

  const renderCurrentAffairsContent = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Process articles to add Year and Month for filtering
    const processedArticles = (caArticles || []).map(article => {
      // Robust date parsing: prioritize published_at/date, fallback to saved_at
      const dateSource = article.date || article.published_at || article.saved_at;
      const date = dateSource ? new Date(dateSource.replace(/-/g, '/').replace('T', ' ')) : new Date();
      const year = isNaN(date.getFullYear()) ? new Date().getFullYear() : date.getFullYear();
      const monthIdx = isNaN(date.getMonth()) ? 0 : date.getMonth();

      return {
        ...article,
        Year: year,
        Month: monthNames[monthIdx]
      };
    });

    const availableYears = ['All', ...new Set(processedArticles.map(a => String(a.Year)))].sort((a, b) => b - a);
    const availableMonths = ['All', ...monthNames];

    const filteredArticles = processedArticles.filter(article => {
      const yearMatch = filterYear === 'All' || String(article.Year) === String(filterYear);
      const monthMatch = filterMonth === 'All' || article.Month === filterMonth;
      return yearMatch && monthMatch;
    });

    let content;
    if (loading) {
      content = (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading saved articles...</p>
        </div>
      );
    } else if (caArticles.length === 0) {
      content = (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No saved articles yet</p>
          <p className="text-gray-400 dark:text-gray-500">Articles you save will appear here</p>
        </div>
      );
    } else if (filteredArticles.length === 0) {
      content = (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Filter className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No articles found for this filter</p>
          <p className="text-gray-400 dark:text-gray-500">Try adjusting your year or month selection</p>
        </div>
      );
    } else {
      content = filteredArticles.map((bookmark) => (
        <div key={bookmark.bookmark_id} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow overflow-hidden">
          {!isPremium && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-md bg-white/30 dark:bg-gray-900/40">
              <Lock className="w-10 h-10 text-gray-500 dark:text-gray-400 mb-2" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Premium Required</span>
            </div>
          )}
          <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs font-medium">
                {bookmark.category}
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-xs font-medium">
                {bookmark.Month} {bookmark.Year}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              <Calendar className="w-4 h-4 inline mr-1" />
              Saved: {new Date(bookmark.saved_at).toLocaleDateString()}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-4">
            {bookmark.image && (
              <div className="w-full md:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <img
                  src={bookmark.image.startsWith('data:')
                    ? bookmark.image
                    : (bookmark.image.startsWith('img/')
                      ? `${import.meta.env.VITE_BASE_URL}${bookmark.image}`
                      : bookmark.image)}
                  alt={bookmark.title_en}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {bookmark.title_en || bookmark.title_hi}
              </h3>
              <div
                className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: bookmark.short_summary_en || bookmark.short_summary_hi }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50 dark:border-gray-700">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Published: {new Date(bookmark.date || bookmark.published_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-3">
              <button
                disabled={!isPremium}
                onClick={() => {
                  const slug = (bookmark.title_en || '')
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                  navigate(`/summary/${slug}`, { state: { news: bookmark } });
                }}
                className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4 mr-2" />
                Read Full Article
              </button>
            </div>
          </div>
        </div>
      ));
    }

    return (
      <div className="space-y-6">
        {/* Filters Section */}
        {caArticles.length > 0 && (
          <div className="flex flex-wrap gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">Filter by Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">Filter by Month</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => { setFilterYear('All'); setFilterMonth('All'); }}
              className="mt-auto mb-0.5 px-4 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        <div className="space-y-4">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bookmarks</h1>
        <p className="text-gray-600 dark:text-gray-400">Access your saved questions, solutions, and current affairs content</p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto whitespace-nowrap scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setActiveTab('test-series')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all flex-shrink-0 whitespace-nowrap ${activeTab === 'test-series'
              ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Test Series Questions
          </button>
          <button
            onClick={() => setActiveTab('ca-questions')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all flex-shrink-0 whitespace-nowrap ${activeTab === 'ca-questions'
              ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Newspaper className="w-4 h-4 mr-2" />
            CA Saved Questions
          </button>
          <button
            onClick={() => setActiveTab('current-affairs')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all flex-shrink-0 whitespace-nowrap ${activeTab === 'current-affairs'
              ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Star className="w-4 h-4 mr-2" />
            CA Articles
          </button>
        </div>
      </div>

      {activeTab === 'test-series' && renderTestSeriesContent()}
      {activeTab === 'ca-questions' && renderCASavedQuestionsContent()}
      {activeTab === 'current-affairs' && renderCurrentAffairsContent()}
    </div>
  );
}