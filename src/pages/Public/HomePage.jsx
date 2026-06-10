
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import HeroSection from "@/components/HeroSection";
import FeaturedCourses from "@/components/FeaturedCourses";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import StatsSection from "@/components/StatsSection";
import CallToAction from "@/components/CallToAction";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { X, Send, Clock } from "lucide-react";
import axios from "axios";

import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';

const AdPopup = ({ isOpen, onClose }) => {
  const [bannerData, setBannerData] = useState({
    image: null,
    telegramLink: '',
    targetDate: '',
    telegramEnabled: true,
    timerEnabled: true
  });
  const [loading, setLoading] = useState(true);

  const buildUrl = (path) => `${import.meta.env.VITE_BACKEND_URL}${path}`;

  useEffect(() => {
    if (isOpen) {
      fetchBanner();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const response = await axios.get(buildUrl('/api/Settings/get_banner.php'));
      if (response.data.success && response.data.banner) {
        setBannerData({
          image: response.data.banner,
          telegramLink: response.data.telegram_link,
          targetDate: response.data.target_date,
          telegramEnabled: response.data.telegram_enabled === 1,
          timerEnabled: response.data.timer_enabled === 1
        });
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ad-popup-overlay"
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[10000] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            key="ad-popup-modal"
            className="relative max-w-3xl w-full mx-4"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Floating Elements (Timer centered on mobile, Side-by-side on desktop) */}
            <div className="absolute bottom-full left-0 right-0 flex justify-center sm:justify-between items-end px-4 pointer-events-none translate-y-[1px] z-20 overflow-visible">
              {/* Telegram Button (Desktop Only) */}
              {bannerData.telegramLink && bannerData.telegramEnabled && (
                <motion.button
                  initial={{ opacity: 0, y: 10, scale: 1 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    y: { duration: 0.3 },
                    scale: {
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut"
                    }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(bannerData.telegramLink, '_blank')}
                  className="hidden sm:flex pointer-events-auto items-center gap-2 px-8 py-3.5 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-t-2xl shadow-lg transition-all font-black text-lg border-t border-l border-r border-white/30 whitespace-nowrap"
                >
                  <Send className="w-6 h-6" />
                  <span>Join Telegram for COUPON CODE</span>
                </motion.button>
              )}

              {/* High-End Flip Countdown (Centered on Mobile) */}
              {bannerData.targetDate && bannerData.timerEnabled && (
                <div className="pointer-events-auto bg-black/80 backdrop-blur-xl p-2 sm:p-3 rounded-t-xl sm:rounded-t-2xl border-t border-l border-r border-white/20 shadow-2xl scale-[0.65] sm:scale-[0.8] md:scale-[0.85] origin-bottom transform">
                  <div className="text-[10px] sm:text-[12px] uppercase tracking-[0.2em] text-yellow-400 font-black mb-1.5 sm:mb-2 text-center flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 sm:w-4 h-4 animate-pulse" />
                    <span>OFFER ENDS IN</span>
                  </div>
                  <div className="flex justify-center">
                    <FlipClockCountdown
                      to={new Date(bannerData.targetDate).getTime()}
                      labels={['DAYS', 'HOURS', 'MINS', 'SECS']}
                      labelStyle={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: '#cbd5e1', marginTop: 8 }}
                      digitBlockStyle={{ width: 22, height: 32, fontSize: 16, background: '#1e293b', color: '#f8fafc', borderRadius: 3 }}
                      dividerStyle={{ color: '#334155', height: 1 }}
                      separatorStyle={{ color: '#475569', size: '2px' }}
                      showSeparators={true}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Floating Elements (Mobile Only - Telegram Centered at Bottom) */}
            <div className="absolute top-full left-0 right-0 flex justify-center items-start pointer-events-none -translate-y-[1px] z-20 overflow-visible sm:hidden">
              {bannerData.telegramLink && bannerData.telegramEnabled && (
                <motion.button
                  initial={{ opacity: 0, y: -10, scale: 1 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    y: { duration: 0.3 },
                    scale: {
                      repeat: Infinity,
                      duration: 1.2,
                      ease: "easeInOut"
                    }
                  }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => window.open(bannerData.telegramLink, '_blank')}
                  className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-b-2xl shadow-[0_10px_30px_rgba(0,136,204,0.3)] transition-all font-black text-sm border-b border-l border-r border-white/20 whitespace-nowrap"
                >
                  <Send className="w-4 h-4" />
                  <span>Join Telegram for COUPON CODE</span>
                </motion.button>
              )}
            </div>


            {/* Main Content Box */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden border border-white/20 dark:border-gray-700">

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-all z-30 border border-white/10 group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              <div className="relative">
                {loading ? (
                  <div className="w-full aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : bannerData.image ? (
                  <div className="relative group">
                    <img
                      src={`data:image/jpeg;base64,${bannerData.image}`}
                      alt="Banner"
                      className="w-full h-auto object-contain bg-black/5 max-h-[75vh]"
                    />
                    {/* Visual Polish: Top Edge Highlight */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30" />
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 flex items-center justify-center p-12 text-center text-white">
                     <div>
                        <h3 className="text-4xl font-black mb-4 tracking-tight">EXCLUSIVE OFFER!</h3>
                        <p className="text-xl opacity-90 font-medium max-w-md mx-auto">Premium access to all courses at an unbeatable price.</p>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const SuccessGoalSection = () => {
  return (
    <section className="py-12 bg-background dark:bg-background">
      <div className="container mx-auto px-6 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-gradient continuous-heartbeat-animation"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          YOUR SUCCESS IS OUR GOAL
        </motion.h2>
      </div>
    </section>
  );
};

const HomePage = () => {
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [popupEnabled, setPopupEnabled] = useState(true);
  const [showFooterPopup, setShowFooterPopup] = useState(false);

  const buildUrlForPopupState = (path) => `${import.meta.env.VITE_BACKEND_URL}${path}`;

  // Handle hash-based navigation with scrollbar fix
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const elementId = hash.replace('#', '');
        setTimeout(() => {
          const element = document.getElementById(elementId);
          if (element) {
            const yOffset = -80;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });

            // Force scrollbar update by dispatching scroll event after scroll completes
            setTimeout(() => {
              window.dispatchEvent(new Event('scroll'));
            }, 1000);
          }
        }, 50);
      }
    };

    // Handle initial load with hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Check if popup is enabled before showing
  const checkPopupState = async () => {
    console.log('🔍 HomePage: Checking popup state from banner_toggle table...');

    try {
      const response = await axios.get(buildUrlForPopupState('/api/Settings/get_popup_state.php'));
      console.log('📊 HomePage: Popup state response:', response.data);

      if (response.data.success) {
        // Check for both 'state' and 'enabled' for backward compatibility
        const isEnabled = response.data.state !== undefined ? response.data.state : response.data.enabled;
        console.log('✅ HomePage: Popup state found in banner_toggle table:', isEnabled);
        console.log('📋 HomePage: Raw state value:', response.data.state);
        setPopupEnabled(isEnabled);
        return isEnabled;
      } else {
        console.log('ℹ️ HomePage: Using default popup state (enabled) - banner_toggle table might be empty');
        setPopupEnabled(true);
        return true;
      }
    } catch (error) {
      console.error('❌ HomePage: Error fetching popup state from banner_toggle table:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setPopupEnabled(true); // Default to enabled on error
      return true;
    }
  };

  useEffect(() => {
    let adTimer;
    const initializePopup = async () => {
      console.log('🚀 HomePage: Initializing popup check...');
      const isEnabled = await checkPopupState();

      if (isEnabled) {
        console.log('✅ HomePage: Popup is enabled, setting timer to show popup...');
        adTimer = setTimeout(() => {
          console.log('⏰ HomePage: Timer triggered, showing popup...');
          setShowAdPopup(true);
        }, 2000);
      } else {
        console.log('❌ HomePage: Popup is disabled, not showing popup');
      }
    };

    initializePopup();

    // Footer Scroll Popup Logic
    const footerTimer = setTimeout(() => {
      setShowFooterPopup(true);
    }, 5000);

    return () => {
      if (adTimer) clearTimeout(adTimer);
      clearTimeout(footerTimer);
    };
  }, []);

  const handleCloseFooterPopup = () => {
    setShowFooterPopup(false);
    // Reappear after 12 seconds
    setTimeout(() => {
      setShowFooterPopup(true);
    }, 12000);
  };

  const handleClosePopup = () => {
    console.log('❌ HomePage: User closed popup');
    setShowAdPopup(false);
  };

  return (
    <>
      <Helmet>
        <title>ANIRBAN'S ACADEMY</title>
      </Helmet>
      <div>
        <HeroSection />
        <FeaturedCourses />
        <Features />
        <SuccessGoalSection />
        <StatsSection />
        <Testimonials />
        <CallToAction />
        <AdPopup isOpen={showAdPopup} onClose={handleClosePopup} />

        {/* Footer Scroll Popup */}
        {createPortal(
          <AnimatePresence>
            {showFooterPopup && (
              <motion.div
                key="footer-popup"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 150 }}
                className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none flex justify-center"
              >
                <div className="relative pointer-events-auto max-w-[95%] md:max-w-3xl">
                  <button
                    onClick={handleCloseFooterPopup}
                    className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 backdrop-blur-sm z-[10000] transition-all duration-200"
                    aria-label="Close popup"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <img
                    src="/img/footer scroll.png"
                    alt="Special Promotion"
                    className="w-full h-auto object-contain max-h-[18vh] md:max-h-[22vh]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </>
  );
};

export default HomePage;
