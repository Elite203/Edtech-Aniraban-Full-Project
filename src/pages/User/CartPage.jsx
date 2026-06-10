import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from "../../components/InvoicePDF";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Confetti = () => {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    const colors = ["#a855f7", "#3b82f6", "#10b981", "#eab308", "#ef4444", "#ec4899"];
    const newPieces = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: Math.random() * 2 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 360
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            x: `${p.x}vw`, 
            y: `${p.y}vh`, 
            rotate: p.rotation,
            opacity: 1 
          }}
          animate={{ 
            y: "110vh", 
            rotate: p.rotation + p.rotationSpeed,
            opacity: [1, 1, 0] 
          }}
          transition={{ 
            duration: p.duration, 
            delay: p.delay,
            ease: "easeOut"
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px"
          }}
        />
      ))}
    </div>
  );
};

const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courseData, setCourseData] = useState({});
  const hasCalledFinalize = useRef(false);
  const [discountSettings, setDiscountSettings] = useState({
    is_enabled: false,
    min_cart_value: 0,
    discount_percentage: 0,
    coupon_enabled: false
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [selectedValidity, setSelectedValidity] = useState(() => {
    const saved = localStorage.getItem("cart_validity");
    return saved ? JSON.parse(saved) : {};
  });

  const handleValidityChange = (courseId, value) => {
    setSelectedValidity(prev => {
      const updated = { ...prev, [courseId]: value };
      localStorage.setItem("cart_validity", JSON.stringify(updated));
      return updated;
    });
  };

  const getCurrentItemBasePrice = (item) => {
    const validity = selectedValidity[item.id] || "12";
    if (validity === "6") {
      const dbPriceSix = courseData[item.id]?.price_six_months;
      if (dbPriceSix && parseFloat(dbPriceSix) > 0) {
        return parseFloat(dbPriceSix);
      }
    }
    return parseFloat(item.price);
  };

  useEffect(() => {
    // Fetch all courses to get images for cart items
    fetch(`${BASE_URL}api/Courses/get_courses.php`)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.success) {
          const dataMap = {};
          resJson.courses.forEach((course) => {
            dataMap[course.id] = {
              image: course.image ? (course.image.startsWith('data:') ? course.image : `data:image/jpeg;base64,${course.image}`) : null,
              price: parseFloat(course.price) || 0,
              price_six_months: parseFloat(course.price_six_months) || 0
            };
          });
          setCourseData(dataMap);
        }
      })
      .catch((err) => console.error("❌ Error fetching courses:", err));

    // Fetch discount settings
    fetch(`${BASE_URL}api/Discounts/get_discount_settings.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setDiscountSettings(data.data);
        }
      })
      .catch((err) => console.error("❌ Error fetching discount settings:", err));
  }, []);

  const totalAmount = cart.reduce((sum, item) => sum + getCurrentItemBasePrice(item) * (item.quantity || 1), 0);
  
  // Cart Value discount eligibility
  const isDiscountEligible = !discountSettings.coupon_enabled && discountSettings.is_enabled && totalAmount >= discountSettings.min_cart_value;

  // Calculate item-level coupon discount if coupon mode is enabled
  let couponDiscountAmount = 0;
  if (discountSettings.coupon_enabled && appliedCoupon) {
    cart.forEach(item => {
      const isEligible = appliedCoupon.is_universal || 
        (appliedCoupon.course_ids && appliedCoupon.course_ids.split(',').includes(String(item.id)));
      if (isEligible) {
        couponDiscountAmount += getCurrentItemBasePrice(item) * (appliedCoupon.discount_percentage / 100);
      }
    });
  }

  const discountAmount = isDiscountEligible ? totalAmount * (discountSettings.discount_percentage / 100) : couponDiscountAmount;
  const finalTotal = totalAmount - discountAmount;
  const courseImage = "/img/course.jpg";

  useEffect(() => {
    if (isDiscountEligible) {
      setShowConfetti(true);
      toast({
        title: "🎉 Discount Applied!",
        description: `You've unlocked a ${discountSettings.discount_percentage}% discount on your cart!`,
      });
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isDiscountEligible, discountSettings.discount_percentage]);

  useEffect(() => {
    if (discountSettings.coupon_enabled && appliedCoupon) {
      if (cart.length === 0) {
        setAppliedCoupon(null);
        setCouponCode("");
        return;
      }
      const hasEligibleItem = cart.some(item => 
        appliedCoupon.is_universal || 
        (appliedCoupon.course_ids && appliedCoupon.course_ids.split(',').includes(String(item.id)))
      );
      if (!hasEligibleItem) {
        setAppliedCoupon(null);
        setCouponCode("");
        toast({
          title: "Coupon Removed",
          description: "Applied coupon was removed as there are no eligible items in the cart.",
          variant: "destructive"
        });
      }
    }
  }, [cart, appliedCoupon, discountSettings.coupon_enabled, toast]);


  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (!discountSettings.coupon_enabled) {
      toast({
        title: "Coupons Disabled",
        description: "Coupon code discounts are currently disabled by the administrator.",
        variant: "destructive"
      });
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response = await axios.get(`${BASE_URL}api/Coupons/validate_coupon.php?coupon_code=${couponCode.toUpperCase().trim()}`);
      if (response.data.success && response.data.coupon) {
        const coupon = response.data.coupon;
        
        // Check if coupon applies to at least one course in cart
        const hasEligibleItem = cart.some(item => 
          coupon.is_universal || 
          (coupon.course_ids && coupon.course_ids.split(',').includes(String(item.id)))
        );

        if (!hasEligibleItem) {
          toast({
            title: "Coupon Error",
            description: "This coupon is not applicable to any items in your cart.",
            variant: "destructive"
          });
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon(coupon);
          setShowConfetti(true);
          
          // Calculate discount total to show in toast
          let savedVal = 0;
          cart.forEach(item => {
            const isElig = coupon.is_universal || (coupon.course_ids && coupon.course_ids.split(',').includes(String(item.id)));
            if (isElig) {
              savedVal += getCurrentItemBasePrice(item) * (coupon.discount_percentage / 100);
            }
          });

          toast({
            title: "🎉 Coupon Applied!",
            description: `Coupon "${coupon.coupon_code}" successfully applied! Saved ₹${savedVal.toLocaleString()}`,
            variant: "success"
          });
          const timer = setTimeout(() => setShowConfetti(false), 5000);
        }
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      toast({
        title: "Invalid Coupon",
        description: error.response?.data?.message || "Invalid coupon code entered.",
        variant: "destructive"
      });
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast({
      title: "Coupon Removed",
      description: "Coupon code discount removed."
    });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('payment') === 'success') {
      const orderId = searchParams.get('order_id');
      const expiryDate = searchParams.get('expiry_date');

      if (hasCalledFinalize.current) return;
      hasCalledFinalize.current = true;

      const finalizePurchase = async () => {
        setIsGeneratingInvoice(true);
        try {
          toast({
            title: "Payment Successful",
            description: "Generating invoice and sending confirmation email...",
          });

          const localUser = localStorage.getItem("user");
          const userData = localUser ? JSON.parse(localUser) : {};

          // Fetch the latest courses to prevent race condition with courseData state
          const courseRes = await axios.get(`${BASE_URL}api/Courses/get_courses.php`);
          if (!courseRes.data.success || !courseRes.data.courses) {
            throw new Error("Failed to load course details for invoice");
          }
          const latestCourses = courseRes.data.courses;
          const dataMap = {};
          latestCourses.forEach((c) => {
            dataMap[c.id] = {
              price: parseFloat(c.price) || 0,
              price_six_months: parseFloat(c.price_six_months) || 0
            };
          });

          // Retrieve applied coupon from localStorage if saved
          const localCouponStr = localStorage.getItem('applied_coupon');
          let localCoupon = null;
          if (localCouponStr) {
            try {
              localCoupon = JSON.parse(localCouponStr);
            } catch (e) {}
          }

          const storedValidityStr = localStorage.getItem('cart_validity');
          let storedValidity = {};
          if (storedValidityStr) {
            try {
              storedValidity = JSON.parse(storedValidityStr);
            } catch (e) {}
          }

          const getInvoiceItemPrice = (item) => {
            const validity = storedValidity[item.id] || "12";
            if (validity === "6") {
              const dbPriceSix = dataMap[item.id]?.price_six_months;
              if (dbPriceSix && parseFloat(dbPriceSix) > 0) {
                return parseFloat(dbPriceSix);
              }
            }
            return parseFloat(item.price);
          };

          const totalInvoiceAmount = cart.reduce((sum, item) => sum + getInvoiceItemPrice(item) * (item.quantity || 1), 0);

          let invoiceDiscountAmount = 0;
          if (discountSettings.coupon_enabled && localCoupon) {
            cart.forEach(item => {
              const isEligible = localCoupon.is_universal || 
                (localCoupon.course_ids && localCoupon.course_ids.split(',').includes(String(item.id)));
              if (isEligible) {
                invoiceDiscountAmount += getInvoiceItemPrice(item) * (localCoupon.discount_percentage / 100);
              }
            });
          }

          const invoiceItems = cart.map(course => {
            const coursePrice = getInvoiceItemPrice(course);
            let finalPrice = coursePrice;
            if (discountSettings.coupon_enabled && localCoupon) {
              const isEligible = localCoupon.is_universal || 
                (localCoupon.course_ids && localCoupon.course_ids.split(',').includes(String(course.id)));
              if (isEligible) {
                finalPrice = coursePrice * (1 - localCoupon.discount_percentage / 100);
              }
            }
            const validity = storedValidity[course.id] || "12";
            const detailText = validity === "6"
              ? `Course Validity: 6 Months (1 Day Temporary) - Ends: ${new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
              : `Course Validity: 1 Year (2 Days Temporary) - Ends: ${new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;

            return {
              description: course.title,
              detail: detailText,
              amount: finalPrice.toFixed(2)
            };
          });

          let discountObj = null;
          if (isDiscountEligible) {
            const calcDiscount = totalInvoiceAmount * (discountSettings.discount_percentage / 100);
            discountObj = {
              percentage: discountSettings.discount_percentage,
              subtotal: totalInvoiceAmount.toFixed(2),
              amount: calcDiscount.toFixed(2)
            };
          } else if (discountSettings.coupon_enabled && localCoupon) {
            discountObj = {
              percentage: localCoupon.discount_percentage,
              subtotal: totalInvoiceAmount.toFixed(2),
              amount: invoiceDiscountAmount.toFixed(2),
              couponCode: localCoupon.coupon_code
            };
          }

          const orderDetails = {
            studentName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Student',
            studentEmail: userData.email || '',
            orderId: orderId,
            purchaseDate: new Date().toISOString(),
            expiryDate: expiryDate,
            amount: (totalInvoiceAmount - (isDiscountEligible ? parseFloat(discountObj.amount) : invoiceDiscountAmount)).toFixed(2),
            items: invoiceItems,
            discount: discountObj
          };

          const blob = await pdf(<InvoicePDF orderDetails={orderDetails} />).toBlob();

          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64data = reader.result;
            try {
              await axios.post(`${BASE_URL}api/Courses/save_and_email_invoice.php`, {
                student_id: userData.id,
                order_id: orderId,
                invoice_pdf: base64data
              });

              toast({
                title: "Success",
                description: "Invoice sent to your registered email.",
                variant: "success",
              });
            } catch (err) {
              console.error("Error sending invoice email:", err);
            }
            
            localStorage.removeItem('applied_coupon');
            clearCart();
            navigate('/dashboard', { replace: true });
          };
        } catch (error) {
          console.error("Error generating invoice:", error);
          toast({
            title: "Access Granted",
            description: "Payment was successful, but invoice generation failed.",
            variant: "success",
          });
          localStorage.removeItem('applied_coupon');
          clearCart();
          navigate('/dashboard', { replace: true });
        }
      };

      finalizePurchase();
    } else if (searchParams.get('payment') === 'failed') {
      toast({
        title: "Payment Failed",
        description: "Your transaction was unsuccessful. Please try again.",
        variant: "destructive",
      });
      navigate('/cart', { replace: true });
    }
  }, [window.location.search, discountSettings.coupon_enabled]);

  const handlePayment = async () => {
    const localUser = localStorage.getItem("user");
    if (!localUser) {
      localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
      navigate('/login');
      return;
    }

    // Check if any course does not have a validity selected
    const unselectedCourse = cart.find(item => !selectedValidity[item.id]);
    if (unselectedCourse) {
      toast({
        title: "Validity Required",
        description: `Please select a validity for the course "${unselectedCourse.title}" before proceeding to checkout.`,
        variant: "destructive"
      });
      return;
    }

    const userData = JSON.parse(localUser);
    setIsProcessing(true);

    // If coupon is active, cache it in localStorage to survive full page redirect
    if (discountSettings.coupon_enabled && appliedCoupon) {
      localStorage.setItem('applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('applied_coupon');
    }

    // Save selectedValidity mapping to localStorage to survive page redirect
    localStorage.setItem('cart_validity', JSON.stringify(selectedValidity));

    // Map courses payload with discounted prices if coupon applied
    const paymentCourses = cart.map(item => {
      let finalPrice = parseFloat(getCurrentItemBasePrice(item));
      if (discountSettings.coupon_enabled && appliedCoupon) {
        const isEligible = appliedCoupon.is_universal || 
          (appliedCoupon.course_ids && appliedCoupon.course_ids.split(',').includes(String(item.id)));
        if (isEligible) {
          finalPrice = finalPrice * (1 - appliedCoupon.discount_percentage / 100);
        }
      }
      return {
        id: item.id,
        price: finalPrice,
        title: item.title,
        validity: selectedValidity[item.id] || "12"
      };
    });

    try {
      const response = await axios.post(`${BASE_URL}api/Courses/create_paytm_order.php`, {
        student_id: userData.id,
        courses: paymentCourses,
        price: finalTotal
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
                axios.post(`${BASE_URL}api/Courses/cleanup_pending_order.php`, { order_id: order_id })
                  .catch(err => console.error("Error cleaning up pending order:", err));
                toast({
                  title: "Payment Cancelled",
                  description: "You closed the payment portal. Please try again to complete purchase.",
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
        throw new Error(response.data.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during payment processing.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = (courseId) => {
    removeFromCart(courseId);
    setSelectedValidity(prev => {
      const updated = { ...prev };
      delete updated[courseId];
      localStorage.setItem("cart_validity", JSON.stringify(updated));
      return updated;
    });
    toast({
      title: "Item Removed",
      description: "The course has been removed from your cart.",
    });
  };

  if (isGeneratingInvoice) {
    return (
      <div className="container mx-auto px-6 py-20 flex flex-col justify-center items-center min-h-[400px]">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Finalizing Purchase</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
          Generating your invoice and sending a confirmation email. Please do not close or refresh this page.
        </p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added any courses to your cart yet.</p>
          <Link to="/courses">
            <Button size="lg">
              Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-6 py-12">
      {showConfetti && <Confetti />}
      <div className="w-full mb-8">
        <div className="relative group w-full">
          {/* Outer Glow */}
          <div className="absolute -inset-4 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-[2rem] blur-3xl animate-pulse"></div>

          <motion.div
            className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Shining effect overlay */}
            <motion.div
              className="absolute top-0 left-[-150%] w-full h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/5 to-transparent -skew-x-12 z-20"
              animate={{ left: ["150%", "-150%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            />

            <img
              src="/img/cart.png"
              alt="Cart Promotion"
              className="w-full h-auto object-cover relative z-10 block"
            />
          </motion.div>
        </div>
      </div>

      <motion.h1
        layout
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold mb-10"
      >
        Your Shopping Cart
      </motion.h1>

      {isDiscountEligible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl text-green-800 dark:text-green-300 flex items-center gap-3 shadow-sm"
        >
          <span className="text-xl">🎉</span>
          <div className="flex-grow">
            <h3 className="font-bold text-sm">Cart Value Discount Applied!</h3>
            <p className="text-xs opacity-90">You have unlocked a {discountSettings.discount_percentage}% discount by ordering above ₹{discountSettings.min_cart_value.toLocaleString()}.</p>
          </div>
        </motion.div>
      )}

      {appliedCoupon && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl text-green-800 dark:text-green-300 flex items-center gap-3 shadow-sm"
        >
          <span className="text-xl">🎉</span>
          <div className="flex-grow">
            <h3 className="font-bold text-sm">Coupon Code Applied!</h3>
            <p className="text-xs opacity-90">You have successfully applied the coupon code <strong>{appliedCoupon.coupon_code}</strong> for a {appliedCoupon.discount_percentage}% discount on eligible items.</p>
          </div>
        </motion.div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item, index) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <img
                    loading="lazy"
                    src={courseData[item.id]?.image || courseImage}
                    alt={item.title}
                    className="w-full sm:w-48 h-48 sm:h-auto object-cover"
                  />
                  <div className="flex flex-col flex-grow">
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex flex-col gap-4">
                        <p className="text-xl font-semibold text-primary">
                          {discountSettings.coupon_enabled && appliedCoupon && (appliedCoupon.is_universal || (appliedCoupon.course_ids && appliedCoupon.course_ids.split(',').includes(String(item.id)))) ? (
                            <>
                              <span className="line-through text-gray-400 text-base mr-2">₹{getCurrentItemBasePrice(item).toLocaleString()}</span>
                              <span>₹{(getCurrentItemBasePrice(item) * (1 - appliedCoupon.discount_percentage / 100)).toLocaleString()}</span>
                            </>
                          ) : (
                            <span>₹{getCurrentItemBasePrice(item).toLocaleString()}</span>
                          )}
                        </p>

                        <div className="flex items-center gap-2">
                          <label htmlFor={`validity-${item.id}`} className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            Validity:
                          </label>
                          <select
                            id={`validity-${item.id}`}
                            value={selectedValidity[item.id] || ""}
                            onChange={(e) => handleValidityChange(item.id, e.target.value)}
                            className="px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                          >
                            <option value="">Select Validity</option>
                            <option value="12">1 Year (365 Days)</option>
                            <option value="6">6 Months (180 Days)</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 p-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove from Cart
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          layout
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: cart.length * 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} items)</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
              
              {isDiscountEligible && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                  <span>Discount ({discountSettings.discount_percentage}%)</span>
                  <span>- ₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider">Coupon Code</span>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-2.5 rounded-lg text-xs">
                    <div>
                      <span className="font-bold text-green-700 dark:text-green-400">{appliedCoupon.coupon_code}</span>
                      <span className="text-[10px] block text-gray-500 dark:text-gray-400 mt-0.5">({appliedCoupon.discount_percentage}% discount applied)</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER COUPON"
                      className="w-0 flex-grow px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <Button
                      type="submit"
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      size="sm"
                      className="px-4 text-xs h-8"
                    >
                      {isValidatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                    </Button>
                  </form>
                )}
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                  <span>Discount ({appliedCoupon.coupon_code})</span>
                  <span>- ₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold text-lg border-t pt-4">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>

              {isDiscountEligible ? (
                <p className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-100 dark:border-green-900/20">
                  ✨ <strong>Cart Value Discount Applied:</strong> Since your order is ₹{discountSettings.min_cart_value.toLocaleString()} or more, a {discountSettings.discount_percentage}% discount has been applied!
                </p>
              ) : (
                !discountSettings.coupon_enabled && discountSettings.is_enabled && (
                  <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-muted/50">
                    💡 Add ₹{(discountSettings.min_cart_value - totalAmount).toLocaleString()} more to unlock a <strong>{discountSettings.discount_percentage}% discount</strong> on your entire cart!
                  </p>
                )
              )}

              {appliedCoupon && (
                <p className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-100 dark:border-green-900/20">
                  ✨ <strong>Coupon Discount Applied:</strong> Coupon "{appliedCoupon.coupon_code}" has been successfully applied to eligible items in your cart.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                size="lg"
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 transition-transform duration-200 ease-in-out hover:scale-105"
                onClick={handlePayment}
              >
                {isProcessing ? "Processing..." : "Proceed to Checkout"}
              </Button>
              {cart.length > 0 && (
                <Button variant="outline" className="w-full" onClick={() => { 
                  clearCart(); 
                  setAppliedCoupon(null); 
                  setCouponCode(""); 
                  setSelectedValidity({});
                  localStorage.removeItem("cart_validity");
                  toast({ title: "Cart Cleared", description: "All items removed from cart." }); 
                }}>
                  Clear Cart
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </section>
    </section>
  );
};

export default CartPage;

