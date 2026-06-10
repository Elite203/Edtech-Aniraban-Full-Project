import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Clock, BookOpen, CheckCircle, Loader2, Sparkles, AlertCircle, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '../../components/InvoicePDF';

const TestSeriesReferralPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const hasCalledFinalize = useRef(false);
  
  const [referrerId, setReferrerId] = useState(null);
  const [referrerName, setReferrerName] = useState("Your Friend");
  const [courseId, setCourseId] = useState(null);
  const [course, setCourse] = useState(null);
  const [isReferrerValid, setIsReferrerValid] = useState(true);
  const [isValidatingReferrer, setIsValidatingReferrer] = useState(true);
  const [referrerErrorReason, setReferrerErrorReason] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const searchParams = new URLSearchParams(location.search);
    const ref = searchParams.get('ref');
    const cId = searchParams.get('course_id');
    
    const verifyReferrerAndFetchCourse = async (id, courseIdVal) => {
      try {
        const localUser = localStorage.getItem("user");
        const userData = localUser ? JSON.parse(localUser) : null;
        const studentId = userData ? userData.id : '';
        const BASE_URL = import.meta.env.VITE_BASE_URL;

        // 1. Fetch all courses to locate our course metadata
        const courseRes = await axios.get(`${BASE_URL}api/Courses/get_courses.php`);
        if (courseRes.data.success && courseRes.data.courses) {
          const foundCourse = courseRes.data.courses.find(c => String(c.id) === String(courseIdVal));
          if (foundCourse) {
            setCourse(foundCourse);
          } else {
            setIsReferrerValid(false);
            setReferrerErrorReason('course_not_found');
            setIsValidatingReferrer(false);
            return;
          }
        }

        // 2. Validate the referral link
        const response = await axios.get(
          `${BASE_URL}api/Courses/verify_referrer.php?referrer_id=${id}&course_id=${courseIdVal}&student_id=${studentId}`
        );

        if (response.data.status === 'success' && response.data.valid) {
          setReferrerId(id);
          setCourseId(courseIdVal);
          setIsReferrerValid(true);
          
          // Optionally fetch referrer name from their stats API
          try {
            const statsRes = await axios.get(`${BASE_URL}api/Courses/get_referral_stats.php?student_id=${id}&course_id=${courseIdVal}`);
            if (statsRes.data.status === 'success' && statsRes.data.referred_by) {
              // Not directly available, default fallback or query student
            }
          } catch(e){}
        } else {
          setIsReferrerValid(false);
          setReferrerErrorReason(response.data.reason || 'invalid_link');
        }
      } catch (error) {
        console.error("Error verifying referrer/course:", error);
        setIsReferrerValid(false);
        setReferrerErrorReason('network_error');
      } finally {
        setIsValidatingReferrer(false);
      }
    };

    if (ref && cId) {
      verifyReferrerAndFetchCourse(ref, cId);
    } else {
      setIsReferrerValid(false);
      setIsValidatingReferrer(false);
    }
  }, [location.search]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('payment') === 'success') {
      const orderId = searchParams.get('order_id');
      const expiryDate = searchParams.get('expiry_date');
      const urlCourseId = searchParams.get('course_id');

      if (hasCalledFinalize.current) return;
      hasCalledFinalize.current = true;
      
      const finalizePurchase = async () => {
        setIsGeneratingInvoice(true);
        try {
          toast({
            title: "Payment Successful",
            description: "Generating invoice and sending confirmation email...",
            variant: "default",
          });

          const localUser = localStorage.getItem("user");
          const userData = localUser ? JSON.parse(localUser) : {};
          const BASE_URL = import.meta.env.VITE_BASE_URL;

          // Fetch courses to get name of purchased course
          let courseName = "Test Series Course";
          let paidPrice = "0.00";
          try {
            const courseRes = await axios.get(`${BASE_URL}api/Courses/get_courses.php`);
            if (courseRes.data.success && courseRes.data.courses) {
              const matched = courseRes.data.courses.find(c => String(c.id) === String(urlCourseId));
              if (matched) {
                courseName = matched.title;
                paidPrice = parseFloat(matched.price_six_months).toFixed(2);
              }
            }
          } catch (e) {
            console.error(e);
          }

          const expiryTimeStr = expiryDate ? new Date(expiryDate).toLocaleDateString() : '';
          const detailText = `Course Validity: 6 Months (2 Days Temporary) - Ends: ${expiryTimeStr}`;

          const orderDetails = {
            studentName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Student',
            studentEmail: userData.email || '',
            orderId: orderId,
            purchaseDate: new Date().toISOString(),
            expiryDate: expiryDate,
            amount: paidPrice,
            items: [{
              description: courseName,
              detail: detailText,
              amount: paidPrice
            }]
          };

          const blob = await pdf(<InvoicePDF orderDetails={orderDetails} />).toBlob();
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64data = reader.result;
            await axios.post(`${BASE_URL}api/Courses/save_and_email_invoice.php`, {
              student_id: userData.id,
              order_id: orderId,
              invoice_pdf: base64data
            });

            toast({
              title: "Success",
              description: `Your course access is valid until ${new Date(expiryDate).toLocaleDateString()}. Invoice sent to email.`,
              variant: "success",
            });
            navigate('/dashboard/orders', { replace: true });
          };
        } catch (error) {
          console.error("Error generating/sending invoice:", error);
          toast({
            title: "Payment Successful",
            description: "Access granted, but there was an issue sending the email invoice.",
            variant: "success",
          });
          navigate('/dashboard/orders', { replace: true });
        }
      };

      finalizePurchase();
    } else if (searchParams.get('payment') === 'failed') {
      toast({
        title: "Payment Failed",
        description: "Your payment could not be completed. Please try again.",
        variant: "destructive",
      });
    }
  }, [location, toast, navigate]);

  const handlePayment = async () => {
    const localUser = localStorage.getItem("user");
    if (!localUser) {
      localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
      navigate('/login');
      return;
    }

    if (!course || !referrerId || !courseId) return;

    const userData = JSON.parse(localUser);
    setIsProcessing(true);

    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL;
      const response = await axios.post(`${BASE_URL}api/Courses/create_paytm_order_referral.php`, {
        student_id: userData.id,
        course_id: courseId,
        referrer_id: referrerId
      });

      if (response.data.status === 'success' && response.data.txnToken) {
        const { txnToken, order_id, amount, mid } = response.data;

        const loadScript = () => {
          return new Promise((resolve) => {
            if (window.Paytm && window.Paytm.CheckoutJS) {
              resolve(true);
              return;
            }
            const script = document.createElement("script");
            script.src = `https://secure.paytmpayments.com/merchantpgpui/checkoutjs/merchants/${mid}.js`;
            script.async = true;
            script.crossOrigin = "anonymous";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const scriptLoaded = await loadScript();
        if (!scriptLoaded) {
          throw new Error("Paytm SDK failed to load");
        }

        const config = {
          root: "",
          flow: "DEFAULT",
          data: {
            orderId: order_id,
            token: txnToken,
            tokenType: "TXN_TOKEN",
            amount: amount
          },
          handler: {
            notifyMerchant: function(eventName, data) {
              console.log("notifyMerchant handler:", eventName, data);
              if (eventName === 'MERCHANT_CLOSE' || eventName === 'APP_CLOSED') {
                setIsProcessing(false);
                const BASE_URL = import.meta.env.VITE_BASE_URL;
                axios.post(`${BASE_URL}api/Courses/cleanup_pending_order.php`, { order_id: order_id })
                  .catch(err => console.error("Error cleaning up pending order:", err));
                toast({
                  title: "Payment Cancelled",
                  description: "You closed the payment portal. Please try again if you wish to subscribe.",
                  variant: "destructive",
                });
              }
            }
          }
        };

        if (window.Paytm && window.Paytm.CheckoutJS) {
          const initCheckout = () => {
            window.Paytm.CheckoutJS.init(config).then(function() {
              window.Paytm.CheckoutJS.invoke();
            }).catch(function(error) {
              console.error("Paytm initialization error:", error);
              toast({
                title: "Error",
                description: "Failed to initialize checkout overlay.",
                variant: "destructive",
              });
              setIsProcessing(false);
            });
          };

          if (typeof window.Paytm.CheckoutJS.init === 'function') {
            initCheckout();
          } else if (typeof window.Paytm.CheckoutJS.onLoad === 'function') {
            window.Paytm.CheckoutJS.onLoad(function() {
              initCheckout();
            });
          } else {
            console.error("Paytm CheckoutJS loaded but init and onLoad are not available.");
            setIsProcessing(false);
          }
        }
      } else {
        console.error("Paytm payment initiation failed. Full response data:", response.data);
        toast({
          title: "Error",
          description: response.data.message || "Failed to initialize checkout.",
          variant: "destructive",
          duration: 4000
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      const backendMessage = error.response?.data?.message;
      toast({
        title: "Error",
        description: backendMessage ? `Server Error: ${backendMessage}` : "An error occurred during payment processing.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (isValidatingReferrer) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center">
        <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-semibold tracking-wide">Securing referral connection...</p>
      </div>
    );
  }

  if (!isReferrerValid || !course) {
    const isAlreadyActive = referrerErrorReason === 'referee_already_active' || 
                            referrerErrorReason === 'mutual_referral_not_allowed' || 
                            referrerErrorReason === 'self_referral_not_allowed';

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 flex items-center justify-center relative overflow-hidden">
        {/* Glow ambient background element */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-slate-800 text-center z-10"
        >
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-550 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
            👋
          </div>
          {isAlreadyActive ? (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Checkout Blocked</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed font-medium">
                You cannot buy this course using a referral link because you currently have an active subscription or a mutual referral conflict exists. 😊
              </p>
              <button
                onClick={() => navigate('/dashboard/orders')}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> View Purchased Courses
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Invalid Invitation</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed font-medium">
                This invitation link is expired or invalid. You can still purchase the course at regular prices.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(`/courses/${courseId || ''}`)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md"
                >
                  Buy Course Directly
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-3.5 px-6 rounded-xl transition-all"
                >
                  Explore Other Courses
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Premium Decorative Ambient Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => navigate('/courses')}
          className="group mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Courses
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Course Presentation (Modern layout, different from Current Affairs) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Badge & Title */}
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/40 uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                Special Invited Referral Offer
              </span>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                Unlock <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">{course.title}</span>
              </h1>
            </div>

            {/* Course Features Highlight Box */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span className="p-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">🎁</span>
                  What is included in this referral offer?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Your friend invited you to subscribe. This premium test series will help you master the exact syllabus with real exam simulators.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Bilingual Practice Tests", desc: "Available in English & Hindi" },
                  { title: "Smart AI Analytics", desc: "Accuracy and time trackers" },
                  { title: "All India Rankings", desc: "Live leaderboard access" },
                  { title: "Unlimited Reattempts", desc: "Practice until perfected" },
                  { title: "Topic-wise Quick Save", desc: "Instant page revision" },
                  { title: "Detailed Answers", desc: "Step-by-step solutions" }
                ].map((feat, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl hover:scale-[1.01] transition-transform duration-200">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{feat.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Info Card */}
            <div className="bg-indigo-950/5 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 rounded-3xl p-8 flex gap-4 items-start shadow-inner">
              <UserCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-base font-extrabold text-indigo-900 dark:text-indigo-200">Referral Reward Active</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-medium">
                  By joining through this referral link, you get an extension of **+1 extra day** of premium access (total 2 days for testing) for free, and your friend gets +1 day validity added to their subscription.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Glassmorphism Checkout Card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-100 dark:border-slate-800 shadow-2xl rounded-3xl p-8 relative overflow-hidden"
            >
              
              {/* Decorative accent top header */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

              {isGeneratingInvoice ? (
                <div className="flex flex-col justify-center items-center min-h-[350px] py-8 text-center">
                  <Loader2 className="w-14 h-14 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Finalizing Access</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed font-medium">
                    Generating payment invoice pdf and sending confirmation mail. Please do not refresh.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Summary Title */}
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Checkout Details</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Review your subscription breakdown</p>
                  </div>

                  {/* Referral Sender Badge */}
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-3">
                    <span className="text-base">🤝</span>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-350">
                      Invited referral by friend!
                    </span>
                  </div>

                  {/* Course card info */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 items-center">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{course.title}</h4>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mt-1 block">
                            {course.category || 'Test Series'}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        ₹{parseFloat(course.price_six_months).toLocaleString()}
                      </span>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Validity Duration</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        6 Months (2 Days for Testing)
                      </span>
                    </div>
                  </div>

                  {/* Order breakdown */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        ₹{parseFloat(course.price_six_months).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Referral Tax</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">₹0.00</span>
                    </div>
                    
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Total Price</span>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                        ₹{parseFloat(course.price_six_months).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <div className="pt-2">
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-75"
                    >
                      {isProcessing ? (
                        <span className="animate-pulse flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing Order...
                        </span>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 text-indigo-200" />
                          Proceed to secure payment
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-4">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      Secure Paytm 256-bit SSL Gateway Encryption
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TestSeriesReferralPaymentPage;
