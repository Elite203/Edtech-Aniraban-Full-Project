import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Current_Affairs_Popup from '../Current_Affairs_Exam_Components/Current_Affairs_Popup';
import { Gift } from 'lucide-react';


const CurrentAffairsPage = () => {
  const navigate = useNavigate();

  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [language, setLanguage] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [telegramTestLink, setTelegramTestLink] = useState('https://t.me/yourtelegram');
  const [showPopup, setShowPopup] = useState(false);
  const [isCAPopupOpen, setIsCAPopupOpen] = useState(false);
  const [isCAPopupMinimized, setIsCAPopupMinimized] = useState(localStorage.getItem('caPopupMinimized') === 'true');

  useEffect(() => {
    // Use sessionStorage for shown state so it reappears on new session (browser tab refresh)
    // but not every time they navigate back to the page in the same session.
    if (localStorage.getItem('caPopupMinimized') !== 'true' && sessionStorage.getItem('caPopupShown') !== 'true') {
      const timer = setTimeout(() => {
        setIsCAPopupOpen(true);
        sessionStorage.setItem('caPopupShown', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);





  const years = [new Date().getFullYear()];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    // Load categories
    fetch(`${BASE_URL}api/CurrentAffairs/get_category_api.php`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const rawCategories = data.data || [];
          const uniqueSet = new Set();
          rawCategories.forEach(item => {
            if (item.category) {
              item.category.split(',').forEach(c => {
                const trimmed = c.trim();
                if (trimmed) uniqueSet.add(trimmed);
              });
            }
          });
          const processed = Array.from(uniqueSet).sort().map(cat => ({ category: cat }));
          setCategories(processed);
        }
      })
      .catch(err => console.error('Category API error:', err));

    // Load footer settings for telegram test link
    fetch(`${BASE_URL}api/Settings/footer_settings.php`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.data.telegram_test_link) setTelegramTestLink(data.data.telegram_test_link);
        }
      })
      .catch(err => console.error('Footer settings API error:', err));
  }, []);

  const handleGoClick = () => {
    if (!year || !month || !language) {
      setShowPopup(true);
      return;
    }
    navigate(`/current-affairs-data`, {
      state: { year, month, language, category: selectedCategory },
    });
  };

  const handleCategoryClick = (category) => {
    navigate(`/category-page/${encodeURIComponent(category)}`);
  };

  const leftCategories = categories.slice(0, Math.ceil(categories.length / 2));
  const rightCategories = categories.slice(Math.ceil(categories.length / 2));

  return (
    <section className="container mx-auto px-4 pt-4 pb-12 flex flex-col items-center text-center min-h-[calc(100vh-200px)]">
      <style>{`
        @keyframes gentle-tilt {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(0.5deg); }
          75% { transform: rotate(-0.5deg); }
        }
        .animate-gentle-tilt {
          animation: gentle-tilt 3s infinite ease-in-out;
        }
        @keyframes vibrate {
          0% { transform: translate(0) rotate(0); }
          20% { transform: translate(-2px, 1px) rotate(-1deg); }
          40% { transform: translate(-2px, -1px) rotate(1deg); }
          60% { transform: translate(2px, 1px) rotate(0deg); }
          80% { transform: translate(2px, -1px) rotate(1deg); }
          100% { transform: translate(0) rotate(0); }
        }
        .animate-vibrate {
          animation: vibrate 0.3s infinite linear;
        }
        @keyframes marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @media (max-width: 767px) {
          .mobile-filters-bg-none {
            background-image: none !important;
          }
        }
      `}</style>

      {/* Current Affairs Exclusive Popup */}
      <Current_Affairs_Popup 
        isOpen={isCAPopupOpen} 
        onClose={() => {
          setIsCAPopupOpen(false);
          setIsCAPopupMinimized(true);
          localStorage.setItem('caPopupMinimized', 'true');
        }}
      />

      {/* Minimized Vibrating Icon */}
      {isCAPopupMinimized && (
        <div 
          className="fixed left-0 top-48 z-[99999] group pointer-events-auto"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setIsCAPopupOpen(true);
            setIsCAPopupMinimized(false);
            localStorage.setItem('caPopupMinimized', 'false');
          }}
        >


          <div className="animate-vibrate bg-gradient-to-r from-yellow-500 to-red-600 p-3 pr-4 rounded-r-3xl shadow-[5px_0_15px_rgba(234,179,8,0.5)] border-y-2 border-r-2 border-white/40 flex items-center gap-2 group-hover:pl-4 transition-all duration-300">
            <Gift className="text-white w-6 h-6 drop-shadow-lg" />
            <span className="text-white font-black text-[10px] hidden group-hover:block whitespace-nowrap tracking-tighter">CLAIM OFFER</span>
          </div>
        </div>
      )}


      {/* Marquee Section */}
      <div className="w-full overflow-hidden bg-red-700 py-3 mb-1 border-y border-red-800 shadow-lg relative group">
        <div className="whitespace-nowrap animate-marquee inline-block cursor-default">
          <span className="px-4 text-white font-bold text-sm md:text-base uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
            ACCESS YOUR FREE LATEST CURRENT AFFAIRS NOW AND STAY AHEAD OF THE COMPETITION – USEFUL FOR UPSC, STATE PCS (WBCS, BPSC, UPPCS), SSC CGL, SSC CHSL, SSC MTS, SSC GD, BANKING (IBPS PO, IBPS CLERK, SBI PO, SBI CLERK, RRB), RBI, NABARD, RAILWAYS (RRB NTPC, GROUP D, JE), DEFENCE (NDA, CDS, AFCAT), POLICE SI & CONSTABLE, CAPF, FCI, DDA, UGC NET, CTET, TET, CLAT AND OTHER COMPETITIVE EXAMS.
          </span>
        </div>
      </div>

      {/* Mobile-only Header Image with Buttons */}
      <div className="w-full md:hidden mb-6 px-4 relative">
        <img 
          src="/img/CA_Home1.png" 
          alt="Current Affairs Header" 
          className="w-full h-auto rounded-xl shadow-lg"
        />
        {/* YouTube Button (Left Bottom) */}
        <div className="absolute bottom-4 left-8">
          <button 
            onClick={() => navigate('/demo')}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-[10px] font-bold shadow-lg transition-all active:scale-95"
          >
            YouTube
          </button>
        </div>

        {/* Telegram Button (Right Bottom) */}
        <div className="absolute bottom-4 right-8">
          <a
            href={telegramTestLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1.5 rounded text-[10px] font-bold shadow-lg transition-all active:scale-95">
              Join Telegram
            </button>
          </a>
        </div>
      </div>

      {/* Filters */}
      <div
        className="w-full flex flex-wrap justify-center gap-2 mb-16 pt-10 md:pt-40 pb-10 md:pb-80 pl-0 md:pl-12 relative mobile-filters-bg-none"
        style={{
          backgroundImage: "url('/img/CA_Home1.png')",
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <select
          value={year}
          onChange={e => setYear(e.target.value)}
          className="border px-2 py-1.5 rounded bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-600 text-sm w-[110px] truncate"
        >
          <option value="">YEAR</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border px-2 py-1.5 rounded bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-600 text-sm w-[110px] truncate"
        >
          <option value="">MONTH</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="border px-2 py-1.5 rounded bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-600 text-sm w-[130px] truncate"
        >
          <option value="">LANGUAGE</option>
          <option value="English">ENGLISH</option>
          <option value="Hindi">HINDI</option>
        </select>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="border px-2 py-1.5 rounded bg-white dark:bg-gray-800 text-black dark:text-white dark:border-gray-600 text-sm w-[140px] truncate"
        >
          <option value="">CATEGORY</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat.category}>{cat.category.toUpperCase()}</option>
          ))}
        </select>


        <button
          onClick={handleGoClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-semibold"
        >
          GO
        </button>

        {/* YouTube Button (Left Bottom) - Desktop only */}
        <div className="hidden md:block absolute bottom-10 left-4 md:left-20">
          <button 
            onClick={() => navigate('/demo')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          >
            YouTube
          </button>
        </div>

        {/* Telegram Button (Right Bottom) - Desktop only */}
        <div className="hidden md:block absolute bottom-10 right-4 md:right-20">
          <a
            href={telegramTestLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95">
              Join Test (Telegram)
            </button>
          </a>
        </div>
      </div>


      {/* Mobile + Tablet categories - combined */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full justify-center mb-6 md:hidden">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => handleCategoryClick(cat.category)}
            className="bg-red-700 hover:bg-indigo-700 text-white py-2 px-4 rounded text-sm font-semibold w-full transform hover:scale-105 hover:shadow-xl transition-all duration-300 animate-gentle-tilt active:scale-95 shadow-md"
          >
            {cat.category.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main Section for Desktop */}
      <div className="hidden md:flex w-full max-w-6xl gap-4">
        {/* Left Panel */}
        <div className="flex flex-col gap-3 w-1/4">
          {leftCategories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => handleCategoryClick(cat.category)}
              className="bg-red-700 hover:bg-indigo-700 text-white py-2 rounded text-sm font-semibold transform hover:scale-105 hover:shadow-xl transition-all duration-300 animate-gentle-tilt active:scale-95 shadow-md"
            >
              {cat.category.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Center Section */}
        <div className="flex flex-col items-center flex-1">
          <img
            src="/img/CA_Home2.png"
            alt="News Illustration"
            className="w-full max-w-md h-auto mb-4"
          />
          <img
            src="/img/CA_Home3.png"
            alt="Current Affairs Banner"
            className="w-full max-w-md h-auto mb-4 rounded-lg shadow-md"
          />


        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-3 w-1/4">
          {rightCategories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => handleCategoryClick(cat.category)}
              className="bg-red-700 hover:bg-indigo-700 text-white py-2 rounded text-sm font-semibold transform hover:scale-105 hover:shadow-xl transition-all duration-300 animate-gentle-tilt active:scale-95 shadow-md"
            >
              {cat.category.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile center section */}
      <div className="md:hidden flex flex-col items-center w-full">
        <img
          src="/img/CA_Home2.png"
          alt="News Illustration"
          className="w-full max-w-md h-auto mb-4"
        />
        <img
          src="/img/CA_Home3.png"
          alt="Current Affairs Banner"
          className="w-full max-w-md h-auto mb-4 rounded-lg shadow-md"
        />


      </div>
      {/* Custom Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 transform transition-all duration-300 scale-100 border dark:border-gray-700">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Selection Required</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
              Please select year, month, and language to proceed.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CurrentAffairsPage;
