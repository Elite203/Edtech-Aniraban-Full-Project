import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import { 
  BookOpen, 
  Newspaper, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Calendar,
  CreditCard,
  Timer,
  Copy,
  Users,
  Share2,
  Check,
  AlertCircle
} from 'lucide-react';

export default function UserOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('test-series');

  const [testSeriesOrders, setTestSeriesOrders] = useState([]);

  const { toast } = useToast();
  const [currentAffairsOrders, setCurrentAffairsOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [userData, setUserData] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [copied, setCopied] = useState(false);

  // Test series courses referral states
  const [courseReferralStats, setCourseReferralStats] = useState({});
  const [loadingCourseReferrals, setLoadingCourseReferrals] = useState({});
  const [openReferralCourseId, setOpenReferralCourseId] = useState(null);
  const [courseCopied, setCourseCopied] = useState({});

  const fetchReferralStats = async (studentId) => {
    try {
      setLoadingReferrals(true);
      const BASE_URL = import.meta.env.VITE_BASE_URL;
      const response = await axios.get(`${BASE_URL}api/CurrentAffairs/get_referral_stats.php?student_id=${studentId}`);
      if (response.data.status === 'success') {
        setReferralStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching referral stats:", error);
    } finally {
      setLoadingReferrals(false);
    }
  };

  const fetchCourseReferralStats = async (courseId, studentId) => {
    const sId = studentId || userData?.id;
    if (!sId) return;
    try {
      setLoadingCourseReferrals(prev => ({ ...prev, [courseId]: true }));
      const BASE_URL = import.meta.env.VITE_BASE_URL;
      const response = await axios.get(`${BASE_URL}api/Courses/get_referral_stats.php?student_id=${sId}&course_id=${courseId}`);
      if (response.data.status === 'success') {
        setCourseReferralStats(prev => ({ ...prev, [courseId]: response.data }));
      }
    } catch (error) {
      console.error("Error fetching course referral stats:", error);
    } finally {
      setLoadingCourseReferrals(prev => ({ ...prev, [courseId]: false }));
    }
  };

  useEffect(() => {
    const fetchOrdersAndData = async () => {
      try {
        const localUser = localStorage.getItem("user");
        if (!localUser) {
          setLoadingOrders(false);
          return;
        }
        const parsedUser = JSON.parse(localUser);
        setUserData(parsedUser);
        const BASE_URL = import.meta.env.VITE_BASE_URL;
        
        // 1. Fetch Current Affairs
        try {
          const caResponse = await axios.get(`${BASE_URL}api/CurrentAffairs/get_monthly_test_purchase.php?student_id=${parsedUser.id}`);
          if (caResponse.data.status === 'success' && caResponse.data.data) {
            const orderData = caResponse.data.data;
            setCurrentAffairsOrders([{
              id: orderData.id || 0,
              title: 'Premium Monthly Test (6 Months Validity)',
              purchaseDate: orderData.purchase_date || '',
              validityEnd: orderData.expiry_date || '',
              price: orderData.price_paid || '0.00',
              status: orderData.is_active ? 'active' : 'expired',
              paymentSlip: 'payment-slip-premium.pdf',
              invoicePdf: orderData.invoice_pdf || null
            }]);
            fetchReferralStats(parsedUser.id);
          }
        } catch (e) {
          console.error("Error fetching CA orders:", e);
        }

        // 2. Fetch test series purchases and performance records
        try {
          const [purchasesRes, performanceRes] = await Promise.all([
            axios.get(`${BASE_URL}api/Courses/get_test_series_purchases.php?student_id=${parsedUser.id}`),
            axios.get(`${BASE_URL}api/Solutions/get_user_performance.php?student_id=${parsedUser.id}`)
          ]);

          let perfList = [];
          if (performanceRes.data.success && performanceRes.data.data) {
            perfList = performanceRes.data.data;
          }

          if (purchasesRes.data.status === 'success' && purchasesRes.data.data) {
            const purchasesData = purchasesRes.data.data;
            const mappedOrders = purchasesData.map(p => {
              const courseAttempts = perfList
                .filter(perf => String(perf.course_id) === String(p.course_id))
                .map(perf => ({
                  setId: perf.set_id,
                  setNumber: perf.set_number,
                  score: perf.score,
                  totalMarks: perf.totalMarks || perf.total_marks || 100,
                  rank: perf.rank || 0,
                  date: perf.date
                }));

              return {
                id: p.id,
                courseId: p.course_id,
                title: p.course_title,
                purchaseDate: p.purchase_date,
                validityEnd: p.expiry_date,
                price: p.price_paid,
                status: p.status,
                setsUnlocked: courseAttempts.length,
                totalSets: 20,
                attempts: courseAttempts,
                invoicePdf: p.invoice_pdf || null
              };
            });
            setTestSeriesOrders(mappedOrders);
            
            // Fetch referral stats for active test series courses
            purchasesData.forEach(p => {
              if (p.status === 'active') {
                fetchCourseReferralStats(p.course_id, parsedUser.id);
              }
            });
          }
        } catch (e) {
          console.error("Error fetching test series orders:", e);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };
    
    fetchOrdersAndData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'expiring': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDaysLeft = (validityEnd) => {
    if (!validityEnd) return 0;
    try {
      // Replace hyphens with slashes to force local timezone parsing instead of UTC
      const end = new Date(validityEnd.replace(/-/g, '/'));
      if (isNaN(end.getTime())) return 0;
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return 0;
    }
  };

  const formatDateToDMY = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString.replace(/-/g, '/'));
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-IN');
    } catch (e) {
      return dateString;
    }
  };

  const renderTestSeriesContent = () => {
    return (
      <div className="space-y-6">
        {loadingOrders ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading your test series...</p>
        </div>
      ) : testSeriesOrders.length > 0 ? (
        testSeriesOrders.map((order) => (
          <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{order.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Purchased on {formatDateToDMY(order.purchaseDate)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">₹{order.price}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Sets Unlocked</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{order.setsUnlocked}/{order.totalSets}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-300">Attempts</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{order.attempts.length}</p>
                    </div>
                    <RefreshCw className="w-8 h-8 text-green-500 dark:text-green-400" />
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Days Left</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {order.status === 'expired' ? '0' : getDaysLeft(order.validityEnd)}
                      </p>
                    </div>
                    <Timer className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {order.invoicePdf ? (
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = order.invoicePdf;
                      link.download = `Invoice_Order_${order.id}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Payment Slip
                  </button>
                ) : (
                  <button disabled className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                    <Download className="w-4 h-4 mr-2" />
                    Slip Not Available
                  </button>
                )}
                {order.status === 'expired' ? (
                  <button 
                    onClick={() => navigate(`/courses/${order.courseId}`)}
                    className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Renew Subscription
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => navigate(`/courses/${order.courseId}`)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Continue Test Series
                    </button>
                    <button 
                      onClick={() => setOpenReferralCourseId(openReferralCourseId === order.courseId ? null : order.courseId)}
                      className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                        openReferralCourseId === order.courseId
                          ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400 font-semibold'
                          : 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold'
                      }`}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Refer & Earn
                    </button>
                  </>
                )}
              </div>

              {openReferralCourseId === order.courseId && order.status === 'active' && (() => {
                const stats = courseReferralStats[order.courseId];
                if (loadingCourseReferrals[order.courseId]) {
                  return (
                    <div className="mt-6 border-t border-gray-150 dark:border-gray-700 pt-6 flex justify-center items-center">
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                      <span className="text-xs text-gray-500">Loading referral statistics...</span>
                    </div>
                  );
                }
                if (!stats) return null;
                return (
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4 bg-gray-50/30 dark:bg-gray-900/10 p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Course Referral Program
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Share the learning with your friends. Both get reward validity on subscription!
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center sm:items-end min-w-[120px]">
                        <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Referrals Used</span>
                        <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                          {stats.current_referrals_count} <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">/ {stats.referrals_limit} used</span>
                        </span>
                      </div>
                    </div>

                    {/* Referral Link Box */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Your Unique Referral Link for this Course
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={userData ? `${window.location.origin}/test-series-referral?course_id=${order.courseId}&ref=${userData.id}` : ''}
                          className="flex-1 px-3 py-2 bg-white dark:bg-gray-950 border border-gray-350 dark:border-gray-700 rounded-lg text-xs text-gray-650 dark:text-gray-350 focus:outline-none select-all font-mono"
                          onClick={(e) => e.target.select()}
                        />
                        <button 
                          onClick={() => {
                            if (userData) {
                              navigator.clipboard.writeText(`${window.location.origin}/test-series-referral?course_id=${order.courseId}&ref=${userData.id}`);
                              setCourseCopied(prev => ({ ...prev, [order.courseId]: true }));
                              toast({
                                title: "Referral Link Copied!",
                                description: "Share this link with your friends to earn reward validity.",
                                duration: 3000
                              });
                              setTimeout(() => setCourseCopied(prev => ({ ...prev, [order.courseId]: false })), 2000);
                            }
                          }}
                          className={`flex items-center justify-center px-4 py-2 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap text-white ${
                            courseCopied[order.courseId]
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {courseCopied[order.courseId] ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                          {courseCopied[order.courseId] ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
                        * Note: Max 12 referrals allowed per subscription cycle. When your friends buy this course using your link, they get 6 Months validity (1 day for testing) + 1 day referral bonus (total 2 days) and you get +1 day extended to your active subscription of this course.
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        <span>Referrals progress in current cycle</span>
                        <span>{stats.current_referrals_count} / {stats.referrals_limit} Referrals</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (stats.current_referrals_count / stats.referrals_limit) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Referral history */}
                    <div className="pt-2">
                      <h5 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1.5 text-gray-500 dark:text-gray-400" />
                        Referral History ({stats.history ? stats.history.length : 0})
                      </h5>
                      
                      {(!stats.history || stats.history.length === 0) ? (
                        <div className="text-center py-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950/20">
                          <p className="text-xs text-gray-500 dark:text-gray-400">No referred friends for this course yet. Copy and share your link to start earning!</p>
                        </div>
                      ) : (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-xs text-xs bg-white dark:bg-gray-950">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Friend</th>
                                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Joined</th>
                                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {stats.history.map((ref, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors">
                                    <td className="px-4 py-2 whitespace-nowrap font-semibold text-gray-900 dark:text-gray-100">
                                      {ref.name}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono">
                                      {ref.email}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono">
                                      {formatDateToDMY(ref.referral_date)}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                        ref.is_current_cycle 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400' 
                                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                      }`}>
                                        {ref.is_current_cycle ? '+1 Day Applied' : 'Previous Cycle'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Referred by Friend block */}
                    {stats.referred_by && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                        <div>
                          <p className="text-[9px] font-semibold text-gray-450 dark:text-gray-500 uppercase tracking-wider">Joined via Friend's Referral</p>
                          <p className="font-bold text-gray-905 dark:text-white mt-0.5">{stats.referred_by.name} ({stats.referred_by.email})</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                            Reward Active
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

          {order.attempts.length > 0 && (
            <div className="p-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Performance History</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Test Set
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {order.attempts.map((attempt, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          Test Set {attempt.setId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {attempt.score}/{attempt.totalMarks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          #{attempt.rank}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDateToDMY(attempt.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                          <button 
                            onClick={() => navigate(`/exam/result/${order.courseId}/${attempt.setId}/${attempt.setNumber}?attempt_number=1`)}
                            className="hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            View Analysis
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 font-medium text-lg">No test series purchased yet</p>
          <p className="text-gray-400 text-sm mt-1">Your purchased courses will appear here</p>
        </div>
      )}
      </div>
    );
  };

  const renderCurrentAffairsContent = () => (
    <div className="space-y-6">
      {currentAffairsOrders.map((order) => (
        <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{order.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Purchased on {formatDateToDMY(order.purchaseDate)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">₹{order.price}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-300">Validity Left</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {order.status === 'expired' ? '0 Days' : (() => {
                      const days = getDaysLeft(order.validityEnd);
                      const months = Math.floor(days / 30);
                      const remainingDays = days % 30;
                      if (months > 0) {
                        return `${months} Months ${remainingDays > 0 ? `${remainingDays} Days` : ''}`;
                      }
                      return `${days} Days`;
                    })()}
                  </p>
                  <div className="text-xs text-orange-700 dark:text-orange-400 mt-1 flex flex-col">
                    <span>({order.status === 'expired' ? '0' : getDaysLeft(order.validityEnd)} total days)</span>
                    <span className="font-semibold mt-0.5">Expires on: {formatDateToDMY(order.validityEnd)}</span>
                  </div>
                </div>
                <Calendar className="w-8 h-8 text-orange-500 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {order.invoicePdf ? (
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = order.invoicePdf;
                  link.download = `Invoice_Order_${order.id}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Download Payment Slip
              </button>
            ) : (
              <button disabled className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                <CreditCard className="w-4 h-4 mr-2" />
                Slip Not Available
              </button>
            )}
            {order.status === 'expired' && (
              <button 
                onClick={() => navigate('/premium-monthly-test')}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Renew Subscription
              </button>
            )}
          </div>
        </div>
      ))}
      
      {/* Referral Section */}
      {referralStats && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Referral Program
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Share the learning with your friends. Both get +1 day validity on subscription!
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center sm:items-end min-w-[140px]">
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Current Cycle Stats</span>
                <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                  {referralStats.current_referrals_count} <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">/ {referralStats.referrals_limit} used</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {!referralStats.has_active_sub && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <span className="font-semibold">Subscription Expired:</span> You need an active subscription to participate in the referral program and receive extra validity days. Please renew your subscription to reactivate your link.
                </div>
              </div>
            )}
            
            {/* Referral Link Box */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your Unique Referral Link
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={userData ? `${window.location.origin}/premium-monthly-test-referral?ref=${userData.id}` : ''}
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 focus:outline-none select-all font-mono"
                  onClick={(e) => e.target.select()}
                />
                <button 
                  onClick={() => {
                    if (userData) {
                      navigator.clipboard.writeText(`${window.location.origin}/premium-monthly-test-referral?ref=${userData.id}`);
                      setCopied(true);
                      toast({
                        title: "Referral Link Copied!",
                        description: "Share this link with your friends to earn reward validity.",
                        duration: 3000
                      });
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  disabled={!referralStats.has_active_sub}
                  className={`flex items-center justify-center px-5 py-2.5 font-semibold text-sm rounded-lg transition-colors whitespace-nowrap ${
                    !referralStats.has_active_sub
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : copied 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                * Note: Max 12 referrals allowed per subscription cycle. When your friends buy a subscription using this link, they get +1 extra day (total 2 days) and you get +1 day extended to your active subscription.
              </p>
            </div>

            {/* Progress bar */}
            {referralStats.has_active_sub && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  <span>Referrals progress in current cycle</span>
                  <span>{referralStats.current_referrals_count} / {referralStats.referrals_limit} Referrals</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (referralStats.current_referrals_count / referralStats.referrals_limit) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Referral history */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                Referral History ({referralStats.history ? referralStats.history.length : 0})
              </h4>
              
              {(!referralStats.history || referralStats.history.length === 0) ? (
                <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/20">
                  <Users className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No referred friends yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Copy and share your referral link to earn extra days!</p>
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Friend Name</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Joined</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {referralStats.history.map((ref, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {ref.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {ref.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                              {formatDateToDMY(ref.referral_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                ref.is_current_cycle 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400' 
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {ref.is_current_cycle ? '+1 Day Applied' : 'Previous Cycle'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Referred by Friend Section */}
      {referralStats && referralStats.referred_by && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-lg shadow-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Referred by Friend</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  You joined using a friend's referral link and received extended validity! 😊
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-150 dark:border-gray-750">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Referrer Friend</p>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  {referralStats.referred_by.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {referralStats.referred_by.email}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Date Connected</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-305 mt-1 font-mono">
                  {formatDateToDMY(referralStats.referred_by.referral_date)}
                </p>
                <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                  Reward Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage your purchased content and subscriptions</p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('test-series')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'test-series'
                ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Test Series Courses
          </button>
          <button
            onClick={() => setActiveTab('current-affairs')}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'current-affairs'
                ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Newspaper className="w-4 h-4 mr-2" />
            Current Affairs
          </button>
        </div>
      </div>

      {activeTab === 'test-series' && renderTestSeriesContent()}
      {activeTab === 'current-affairs' && renderCurrentAffairsContent()}
    </div>
  );
}