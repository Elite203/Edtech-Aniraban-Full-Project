import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Clock,
  Award,
  X,
  Layout,
  ChevronRight,
  ArrowRight,
  Zap,
  Target,
  User,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('enrolled');
  const [user, setUser] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [performanceRecords, setPerformanceRecords] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [showReattemptPopup, setShowReattemptPopup] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Sync subscription status from backend
        const syncSubscription = async () => {
          try {
            const BASE_URL = import.meta.env.VITE_BASE_URL;
            const response = await fetch(`${BASE_URL}api/CurrentAffairs/get_monthly_test_purchase.php?student_id=${parsedUser.id}`);
            const data = await response.json();
            if (data.status === 'success' && data.data) {
              const orderData = data.data;
              if (orderData.is_active && orderData.expiry_date) {
                localStorage.setItem('premium_monthly_test_expiry', orderData.expiry_date);
                setPremiumExpiry(orderData.expiry_date);
              } else {
                localStorage.removeItem('premium_monthly_test_expiry');
                setPremiumExpiry(null);
              }
            } else {
              localStorage.removeItem('premium_monthly_test_expiry');
              setPremiumExpiry(null);
            }
          } catch (e) {
            console.error("Failed to sync premium status:", e);
          }
        };
        syncSubscription();

        // Fetch test series purchases
        const fetchCoursePurchases = async () => {
          try {
            const BASE_URL = import.meta.env.VITE_BASE_URL;
            const response = await fetch(`${BASE_URL}api/Courses/get_test_series_purchases.php?student_id=${parsedUser.id}`);
            const data = await response.json();
            if (data.status === 'success' && data.data) {
              setCoursePurchases(data.data);
            }
          } catch (e) {
            console.error("Failed to fetch course purchases:", e);
          }
        };
        fetchCoursePurchases();
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'reattempt' && user?.id) {
      fetchAttempts();
    }
    if (activeTab === 'performance' && user?.id) {
      fetchPerformance();
    }
  }, [activeTab, user?.id]);

  const fetchAttempts = async () => {
    setLoadingAttempts(true);
    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL;
      const response = await fetch(`${BASE_URL}api/Solutions/get_user_attempts.php?student_id=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setAttempts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch attempts", error);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const fetchPerformance = async () => {
    setLoadingPerformance(true);
    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL;
      const response = await fetch(`${BASE_URL}api/Solutions/get_user_performance.php?student_id=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setPerformanceRecords(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch performance", error);
    } finally {
      setLoadingPerformance(false);
    }
  };

  const tabs = [
    { id: 'enrolled', label: 'Enrolled', icon: BookOpen },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
    { id: 'reattempt', label: 'Reattempts', icon: RefreshCw },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
  ];

  const [premiumExpiry, setPremiumExpiry] = useState(localStorage.getItem('premium_monthly_test_expiry'));
  const [coursePurchases, setCoursePurchases] = useState([]);
  const isPremium = premiumExpiry && new Date(premiumExpiry) > new Date();
  const hasExpiredPremium = premiumExpiry && new Date(premiumExpiry) <= new Date();

  const caCourseBase = {
    id: 'premium_monthly',
    title: 'Monthly Current Affairs Premium',
    progress: 100,
    totalLessons: 'Unlimited',
    completedLessons: 'Premium',
    image: '/img/ca_enrolled.png'
  };

  const enrolledCourses = [
    ...(isPremium ? [{
      ...caCourseBase,
      nextLesson: 'Valid till ' + new Date(premiumExpiry).toLocaleDateString()
    }] : []),
    ...coursePurchases.filter(p => p.status === 'active').map(p => ({
      id: p.course_id,
      title: p.course_title,
      progress: 100,
      totalLessons: '365 Days',
      completedLessons: 'Active',
      image: p.course_image || '/img/ca_enrolled.png',
      nextLesson: 'Valid till ' + new Date(p.expiry_date).toLocaleDateString()
    }))
  ];

  const completedCourses = [
    ...(hasExpiredPremium ? [{
      ...caCourseBase,
      nextLesson: 'Expired on ' + new Date(premiumExpiry).toLocaleDateString(),
      completedDate: new Date(premiumExpiry).toLocaleDateString(),
      score: '0'
    }] : []),
    ...coursePurchases.filter(p => p.status === 'expired').map(p => ({
      id: p.course_id,
      title: p.course_title,
      progress: 100,
      totalLessons: '365 Days',
      completedLessons: 'Expired',
      image: p.course_image || '/img/ca_enrolled.png',
      nextLesson: 'Expired on ' + new Date(p.expiry_date).toLocaleDateString(),
      completedDate: new Date(p.expiry_date).toLocaleDateString(),
      score: '0',
      isExpiredCourse: true
    }))
  ];

  const isCourseActive = (courseId, courseTitle) => {
    if (courseId === 'premium_monthly' || (courseTitle && courseTitle.toLowerCase().includes('current affairs'))) {
      return isPremium;
    }
    const purchase = coursePurchases.find(p => String(p.course_id) === String(courseId));
    return purchase && purchase.status === 'active';
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'enrolled':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {enrolledCourses.map((course) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-900 w-full">
                  <img src={course.image} alt={course.title} className="w-full h-auto block group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">In Progress</span>
                    <h3 className="text-xl font-bold text-white mt-2">{course.title}</h3>
                  </div>
                </div>
                <div className="p-6">

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-500 text-xs uppercase font-black tracking-wider">Attempts</span>
                      <span className="font-bold dark:text-white">{course.completedLessons}/{course.totalLessons}</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-500 text-xs uppercase font-black tracking-wider">Next up</span>
                      <span className="font-bold dark:text-white truncate">{course.nextLesson}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (course.id === 'premium_monthly') {
                        navigate('/current-affairs-exam/instructions');
                      } else {
                        navigate(`/courses/${course.id}`);
                      }
                    }}
                    className="w-full group/btn flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 px-6 rounded-2xl font-bold hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all"
                  >
                    Resume Course
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        );

      case 'completed':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {completedCourses.map((course) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-xl">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{course.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-700">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {course.isExpiredCourse || course.id === 'premium_monthly' ? 'Expiry Date' : 'Completion Date'}
                      </span>
                      <span className="text-sm font-bold dark:text-white">{course.completedDate}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {course.isExpiredCourse || course.id === 'premium_monthly' ? 'Status' : 'Final Score'}
                      </span>
                      <span className={`text-sm font-black ${course.isExpiredCourse || course.id === 'premium_monthly' ? 'text-red-500' : 'text-green-600'}`}>
                        {course.isExpiredCourse || course.id === 'premium_monthly' ? 'Expired' : `${course.score}%`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {course.isExpiredCourse || course.id === 'premium_monthly' ? (
                      <button
                        onClick={() => navigate(course.id === 'premium_monthly' ? '/premium-monthly-test-referral' : `/courses/${course.id}`)}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        Renew Subscription
                      </button>
                    ) : (
                      <>
                        <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-2xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                          Certificate
                        </button>
                        <button className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          Review
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        );

      case 'performance':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {loadingPerformance ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Fetching your analytics...</p>
              </div>
            ) : performanceRecords.length > 0 ? (
              performanceRecords.map((test, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 hover:border-blue-300 dark:hover:border-blue-900/50 transition-colors"
                >
                  {!isCourseActive(test.course_id, test.course_title) && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-md bg-white/30 dark:bg-slate-900/40">
                      <Lock className="w-10 h-10 text-slate-500 dark:text-slate-400 mb-2" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Subscription Required</span>
                    </div>
                  )}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
                        <Target className="w-3.5 h-3.5" /> Exam Performance
                      </span>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{test.test}</h4>
                      <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{test.course_title}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 text-right">
                      <span className="block text-[10px] uppercase font-black text-slate-400 tracking-widest">Submitted on</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{test.date}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="relative overflow-hidden p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                      <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">{test.score.toFixed(1)}</div>
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Score / {test.totalMarks}</div>
                      <Zap className="absolute -right-2 -bottom-2 w-16 h-16 text-blue-600/10 rotate-12" />
                    </div>
                    <div className="p-6 bg-green-50/50 dark:bg-green-900/10 rounded-3xl border border-green-100 dark:border-green-900/30">
                      <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-1">{test.percentile}%</div>
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Percentile</div>
                    </div>
                    <div className="p-6 bg-purple-50/50 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-900/30">
                      <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">#{test.rank}</div>
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Global Rank</div>
                    </div>
                    <div className="p-6 bg-orange-50/50 dark:bg-orange-900/10 rounded-3xl border border-orange-100 dark:border-orange-900/30">
                      <div className="text-3xl font-black text-orange-600 dark:text-orange-400 mb-1">{test.accuracy}%</div>
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Accuracy</div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      disabled={!isCourseActive(test.course_id, test.course_title)}
                      onClick={() => navigate(`/exam/result/${test.course_id}/${test.set_id}/${test.set_number}?attempt_number=1`)}
                      className="group flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 px-10 rounded-2xl font-black hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-lg shadow-slate-900/10 dark:shadow-none active:scale-95 text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      View Report
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Unlock Your Analytics</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Complete your first test to see a detailed breakdown of your performance.</p>
              </div>
            )}
          </motion.div>
        );

      case 'reattempt':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {loadingAttempts ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading your history...</p>
              </div>
            ) : attempts.length > 0 ? (
              attempts.map((attempt) => (
                <motion.div
                  key={attempt.id}
                  variants={itemVariants}
                  className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow overflow-hidden"
                >
                  {!isCourseActive(attempt.course_id, attempt.course_title) && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-md bg-white/30 dark:bg-slate-900/40">
                      <Lock className="w-10 h-10 text-slate-500 dark:text-slate-400 mb-2" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Subscription Required</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                      <RefreshCw className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{attempt.exam_name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{attempt.course_title}</span>
                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-500">Attempt #{attempt.attempt_number}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden lg:flex flex-col text-right">
                      <span className="text-[10px] uppercase font-black text-slate-400">Last Attempted</span>
                      <span className="text-sm font-bold dark:text-white">{attempt.date_of_submit}</span>
                    </div>
                    <button
                      disabled={!isCourseActive(attempt.course_id, attempt.attempt_title || attempt.course_title)}
                      onClick={() => {
                        setSelectedAttempt(attempt);
                        setShowReattemptPopup(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Re-attempt
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-800">
                <RefreshCw className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">No attempts yet</h3>
                <p className="text-slate-500 dark:text-slate-400">Your test history will appear here once you start practicing.</p>
              </div>
            )}
          </motion.div>
        );

      default:
        return <div className="py-20 text-center font-medium text-slate-500">Feature coming soon...</div>;
    }
  };

  return (
    <div className="pb-20">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-black rounded-full uppercase tracking-widest">
              Student Dashboard
            </span>
            <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
            <span className="text-xs text-slate-500 font-medium">Updated just now</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-4 flex-wrap"
          >
            <span>Welcome back, <br />
              <span className="text-blue-600 dark:text-blue-400">
                {user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Scholar"}
              </span>
            </span>
            {isPremium && (
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-sm md:text-base font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-yellow-500/30 ml-auto self-start mt-2 md:mt-0">
                Premium
              </span>
            )}
          </motion.h1>
        </div>


      </header>

      {/* Modern Tabs */}
      <nav className="mb-10 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 p-1.5 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-[1.5rem] transition-all duration-300 whitespace-nowrap
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Re-attempt UI Selection Popup */}
      <AnimatePresence>
        {showReattemptPopup && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReattemptPopup(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 p-10"
            >
              <button
                onClick={() => setShowReattemptPopup(false)}
                className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-8 ring-[12px] ring-blue-50 dark:ring-blue-900/10">
                  <Layout className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>

                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Choose Interface</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-10 px-4 font-medium">
                  Select the exam environment that best suits your preparation style.
                </p>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      setShowReattemptPopup(false);
                      if (selectedAttempt) {
                        navigate(`/ssc/main-exam?new_attempt=true`, {
                          state: {
                            course_id: selectedAttempt.course_id,
                            exam_set_id: selectedAttempt.set_id || selectedAttempt.exam_set_id,
                            set_number: selectedAttempt.set_number,
                            return_to: 'dashboard'
                          }
                        });
                      }
                    }}
                    className="group relative flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-2 border-transparent hover:border-indigo-500 rounded-[2rem] transition-all"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/20">N</div>
                      <div>
                        <div className="font-black text-slate-900 dark:text-white">EDUQUITY Pattern (SSC)</div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-widest mt-1">Recommended</div>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => {
                      setShowReattemptPopup(false);
                      if (selectedAttempt) {
                        const courseId = selectedAttempt.course_id;
                        const setId = selectedAttempt.set_id || selectedAttempt.exam_set_id;
                        const setNum = selectedAttempt.set_number;
                        navigate(`/exam/question/${courseId}/${setId}/${setNum}?new_attempt=true&lang=en`, {
                          state: { return_to: 'dashboard' }
                        });
                      }
                    }}
                    className="group relative flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-2 border-transparent hover:border-orange-500 rounded-[2rem] transition-all"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-orange-600/20">C</div>
                      <div>
                        <div className="font-black text-slate-900 dark:text-white">TCS iON Pattern (All CBT)</div>
                        <div className="text-[10px] text-orange-600 dark:text-orange-400 uppercase font-black tracking-widest mt-1">Old Interface</div>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-orange-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
