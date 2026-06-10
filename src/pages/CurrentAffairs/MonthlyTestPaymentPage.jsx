import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Clock, BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '../../components/InvoicePDF';
const MonthlyTestPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const hasCalledFinalize = useRef(false);
  // Quiz context passed from CurrentAffairsData if any
  const quizState = location.state?.quiz || null;

  const [price, setPrice] = useState(10.00);
  const [validityDays, setValidityDays] = useState(1);
  const [loadingPricing, setLoadingPricing] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchPricing = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_BASE_URL;
        const response = await axios.get(`${BASE_URL}api/Discounts/get_monthly_test_pricing.php`);
        if (response.data.success && response.data.data) {
          setPrice(response.data.data.price);
          setValidityDays(response.data.data.validity_days);
        }
      } catch (error) {
        console.error("Failed to load pricing info:", error);
      } finally {
        setLoadingPricing(false);
      }
    };
    fetchPricing();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('payment') === 'success') {
      const expiryDate = searchParams.get('expiry_date');
      const orderId = searchParams.get('order_id');

      if (hasCalledFinalize.current) return;
      hasCalledFinalize.current = true;

      if (expiryDate) {
        localStorage.setItem('premium_monthly_test_expiry', expiryDate);
      }

      const finalizePurchase = async () => {
        setIsGeneratingInvoice(true);
        try {
          toast({
            title: "Payment Successful",
            description: "Generating invoice and sending confirmation email...",
            variant: "default",
          });

          let currentPrice = 10.00;
          try {
            const BASE_URL = import.meta.env.VITE_BASE_URL;
            const pricingResponse = await axios.get(`${BASE_URL}api/Discounts/get_monthly_test_pricing.php`);
            if (pricingResponse.data.success && pricingResponse.data.data) {
              currentPrice = pricingResponse.data.data.price;
            }
          } catch (e) {
            console.error("Failed to fetch pricing for invoice:", e);
          }

          const localUser = localStorage.getItem("user");
          const userData = localUser ? JSON.parse(localUser) : {};

          const orderDetails = {
            studentName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Student',
            studentEmail: userData.email || '',
            orderId: orderId,
            purchaseDate: new Date().toISOString(),
            expiryDate: expiryDate,
            amount: parseFloat(currentPrice).toFixed(2)
          };

          const blob = await pdf(<InvoicePDF orderDetails={orderDetails} />).toBlob();

          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64data = reader.result;
            const BASE_URL = import.meta.env.VITE_BASE_URL;

            await axios.post(`${BASE_URL}api/CurrentAffairs/save_and_email_invoice.php`, {
              student_id: userData.id,
              order_id: orderId,
              invoice_pdf: base64data
            });

            toast({
              title: "Success",
              description: `Your premium access is valid until ${new Date(expiryDate).toLocaleDateString()}. Invoice sent to email.`,
              variant: "success",
            });
            navigate('/current-affairs-data', { replace: true });
          };
        } catch (error) {
          console.error("Error generating/sending invoice:", error);
          toast({
            title: "Payment Successful",
            description: "Access granted, but there was an issue sending the email invoice.",
            variant: "success",
          });
          navigate('/current-affairs-data', { replace: true });
        }
      };

      finalizePurchase();
    } else if (searchParams.get('payment') === 'failed') {
      toast({
        title: "Payment Failed",
        description: "Your payment could not be completed. Please try again.",
        variant: "destructive",
      });
    } else if (searchParams.has('error')) {
      toast({
        title: "Error",
        description: "An error occurred during payment verification.",
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

    const userData = JSON.parse(localUser);

    setIsProcessing(true);

    try {
      const BASE_URL = import.meta.env.VITE_BASE_URL;
      const response = await axios.post(`${BASE_URL}api/CurrentAffairs/create_paytm_order.php`, {
        student_id: userData.id,
        price: parseFloat(price)
      });

      if (response.data.status === 'success' && response.data.txnToken) {
        const { txnToken, order_id, amount, mid } = response.data;

        // Load Paytm script dynamically based on returned MID
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
            notifyMerchant: function (eventName, data) {
              console.log("notifyMerchant handler:", eventName, data);
              if (eventName === 'MERCHANT_CLOSE' || eventName === 'APP_CLOSED') {
                setIsProcessing(false);
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
            window.Paytm.CheckoutJS.init(config).then(function () {
              window.Paytm.CheckoutJS.invoke();
            }).catch(function (error) {
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
            window.Paytm.CheckoutJS.onLoad(function () {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="flex flex-col">
            {/* Top Section: Details */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white h-full">
              <div className="p-8 md:p-12">
                <div className="space-y-3 mb-8">
                  <h1 className="text-2xl md:text-3xl font-black leading-tight flex items-start gap-3">
                    <span className="text-2xl mt-1">🚀</span>
                    <span>BUY CURRENT AFFAIRS TEST (ANY MONTH)</span>
                  </h1>
                  <h2 className="text-lg md:text-xl font-bold flex items-start gap-3 text-blue-100">
                    <span className="text-xl">🔓</span>
                    <span>UNLOCK ALL TESTS UP TO 6 MONTHS</span>
                  </h2>
                  <p className="text-base md:text-lg font-semibold flex items-start gap-3 text-yellow-300">
                    <span className="text-xl">🎁</span>
                    <span>Includes FREE 18-Month Access Extension*</span>
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg md:text-xl font-bold mb-4 border-b border-blue-400/30 pb-2">WHAT YOU GET ?</h3>
                  <ul className="grid grid-cols-1 gap-3 text-sm md:text-base">
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Topic-Wise Page Save Feature for Quick Revision</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Access to Previous Months’ Tests</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Real & Latest Exam Pattern-Based Questions</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Exam-Oriented Practice Approach</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Bilingual Tests (English + Hindi)</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Detailed Performance Analysis</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>All India Rank (AIR) with Leaderboard</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Smart AI-Based Analytics</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Time Management Insights</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Unlimited Reattempts</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Previous Year Questions (PYQs) Included</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Customizable Test Schedule</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Performance Comparison Reports</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Expert-Curated Content</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Question Bookmark & Save Feature</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Detailed Answer Explanations</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">✅</span> <span>Category-Wise Expected Cut-Off Analysis</span></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-4 border-y border-blue-400/30 py-3 flex items-center gap-2">
                    <span>🎯</span> WHY CHOOSE OUR TEST SERIES?
                  </h3>
                  <ul className="grid grid-cols-1 gap-3 text-sm md:text-base text-blue-100">
                    <li className="flex items-start gap-2"><span className="shrink-0">⭐</span> <span>Designed for SSC, Railway, Banking, UPSC & State-Level Exams</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">⭐</span> <span>Updated Current Affairs Coverage</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">⭐</span> <span>Smart Revision System for Faster Preparation</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">⭐</span> <span>Improve Accuracy, Speed & Time Management</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">⭐</span> <span>Track Your Progress with Advanced Analytics</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">⭐</span> <span>Learn Through Detailed Solutions & Performance Reports</span></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Checkout or Loading */}
            {isGeneratingInvoice ? (
              <div className="p-8 md:p-12 flex flex-col justify-center items-center min-h-[400px]">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Finalizing Purchase</h2>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                  Generating your invoice and sending a confirmation email. Please do not close or refresh this page.
                </p>
              </div>
            ) : (
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>


                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Test Series</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current Affairs</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg dark:text-white">₹{parseFloat(price).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Validity</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Expiration Period</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg dark:text-white">{validityDays} Day{validityDays > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-semibold dark:text-white">₹{parseFloat(price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="font-semibold dark:text-white">₹0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-blue-600 dark:text-blue-400">₹{parseFloat(price).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Proceed to Secure Payment
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" /> Secure 256-bit SSL encryption
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MonthlyTestPaymentPage;
