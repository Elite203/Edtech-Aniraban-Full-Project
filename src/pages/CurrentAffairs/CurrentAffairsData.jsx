import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';
import Current_Affairs_Popup from '../Current_Affairs_Exam_Components/Current_Affairs_Popup';
import { Gift } from 'lucide-react';


const BASE_URL = import.meta.env.VITE_BASE_URL;

const CurrentAffairsData = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [affairs, setAffairs] = useState([]);
  const [filteredAffairs, setFilteredAffairs] = useState([]);
  const [selectedYear, setSelectedYear] = useState(location?.state?.year || sessionStorage.getItem('ca_selected_year') || '');
  const [selectedMonth, setSelectedMonth] = useState(location?.state?.month || sessionStorage.getItem('ca_selected_month') || '');
  const [selectedCategory, setSelectedCategory] = useState(location?.state?.category || sessionStorage.getItem('ca_selected_category') || '');
  const [selectedLanguage, setSelectedLanguage] = useState(location?.state?.language || sessionStorage.getItem('ca_selected_language') || '');

  // Persist filters to sessionStorage
  useEffect(() => {
    if (selectedYear) sessionStorage.setItem('ca_selected_year', selectedYear);
    if (selectedMonth) sessionStorage.setItem('ca_selected_month', selectedMonth);
    if (selectedCategory !== undefined) sessionStorage.setItem('ca_selected_category', selectedCategory);
    if (selectedLanguage) sessionStorage.setItem('ca_selected_language', selectedLanguage);
  }, [selectedYear, selectedMonth, selectedCategory, selectedLanguage]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTestButtonDisabled, setIsTestButtonDisabled] = useState(false);
  const [isCAPopupOpen, setIsCAPopupOpen] = useState(false);
  const [isCAPopupMinimized, setIsCAPopupMinimized] = useState(localStorage.getItem('caPopupMinimized') === 'true');

  const formatDate = (date) => {
    if (!date) return '';
    // If it's already a YYYY-MM-DD string, return the date part directly
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      return date.split(/[ T]/)[0];
    }
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(location?.state?.date || '');

  const years = Array.from({ length: 2030 - 2020 + 1 }, (_, i) => 2020 + i);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Initialize defaults if empty
  useEffect(() => {
    if (!selectedYear) setSelectedYear(new Date().getFullYear().toString());
    if (!selectedMonth) setSelectedMonth(months[new Date().getMonth()]);
  }, []);

  const handlePrevMonth = () => {
    setSelectedDate('');
    let monthIdx = months.indexOf(selectedMonth);
    let year = parseInt(selectedYear);
    if (monthIdx === 0) {
      setSelectedMonth(months[11]);
      setSelectedYear((year - 1).toString());
    } else {
      setSelectedMonth(months[monthIdx - 1]);
    }
  };

  const handleNextMonth = () => {
    setSelectedDate('');
    let monthIdx = months.indexOf(selectedMonth);
    let year = parseInt(selectedYear);
    if (monthIdx === 11) {
      setSelectedMonth(months[0]);
      setSelectedYear((year + 1).toString());
    } else {
      setSelectedMonth(months[monthIdx + 1]);
    }
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const year = parseInt(selectedYear);
    const month = months.indexOf(selectedMonth);
    if (isNaN(year) || month === -1) return [];

    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const days = [];

    // Padding from previous month
    const prevMonthDays = daysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, currentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
    }

    // Padding for next month
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
    }

    return days;
  };

  const hasContent = (date) => {
    const dateStr = formatDate(date);
    return filteredAffairs.some(item => {
      // Handle both full ISO strings and YYYY-MM-DD strings from API
      const itemDateStr = (item.date && (item.date.includes('T') || item.date.includes(' ')))
        ? formatDate(item.date)
        : (item.date ? item.date.split(' ')[0] : '');
      return itemDateStr === dateStr;
    });
  };

  // Slider Settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  // Custom Next Arrow
  const NextArrow = (props) => {
    const { className, onClick } = props;
    return (
      <div
        className={`${className} !flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white z-10`}
        style={{ right: '-15px' }}
        onClick={onClick}
      >
      </div>
    );
  };

  const PrevArrow = (props) => {
    const { className, onClick } = props;
    return (
      <div
        className={`${className} !flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white z-10`}
        style={{ left: '-15px' }}
        onClick={onClick}
      >
      </div>
    );
  };

  // Fetch Current Affairs Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}api/CurrentAffairs/get_current_affairs_api.php`);
        const data = response.data;

        if (data.status === 'success') {
          const sortedData = data.data.sort((a, b) => new Date(a.date) - new Date(b.date));
          setAffairs(sortedData);
          setFilteredAffairs(sortedData);
        }
      } catch (err) {
        console.error('Error fetching current affairs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/CurrentAffairs/get_category_api.php`);
        const data = response.data;
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
      } catch (err) {
        console.error('Category API error:', err);
      }
    };

    fetchCategories();
  }, []);

  const [currentQuiz, setCurrentQuiz] = useState(null);

  // Check if Monthly Test button should be enabled based on dynamic quiz existence
  useEffect(() => {
    const checkTestAvailability = async () => {
      if (selectedYear && selectedMonth) {
        try {
          const response = await axios.get(`${BASE_URL}api/CurrentAffairs/get_quiz_details.php?year=${selectedYear}&month=${selectedMonth}`);
          if (response.data.status === 'success' && response.data.data) {
            setCurrentQuiz(response.data.data);
            setIsTestButtonDisabled(false);
          } else {
            setCurrentQuiz(null);
            setIsTestButtonDisabled(true);
          }
        } catch (err) {
          console.error('Error checking test availability:', err);
          setIsTestButtonDisabled(true);
        }
      } else {
        setIsTestButtonDisabled(true);
      }
    };

    checkTestAvailability();
  }, [selectedYear, selectedMonth]);


  // Apply Filters
  useEffect(() => {
    let temp = [...affairs];

    // Remove language filter from record set since one record has both languages
    // We just filter by year, month, and category
    if (selectedYear) {
      temp = temp.filter(item => {
        if (!item.date) return false;
        // Support both YYYY-MM-DD and other formats via Date object
        const d = new Date(item.date);
        if (isNaN(d.getTime())) return item.date.toString().includes(selectedYear);
        return d.getFullYear().toString() === selectedYear;
      });
    }
    if (selectedMonth) {
      temp = temp.filter(item => {
        if (!item.date) return false;
        const d = new Date(item.date);
        if (isNaN(d.getTime())) {
          // Fallback for non-standard formats like DD-MM-YYYY
          const parts = item.date.split(/[-/]/);
          if (parts.length >= 2) {
            const m = parseInt(parts[1]) - 1;
            return months[m] === selectedMonth;
          }
          return false;
        }
        return months[d.getMonth()] === selectedMonth;
      });
    }
    if (selectedCategory) {
      temp = temp.filter(item => {
        const itemCategories = (item.category || '').toLowerCase().split(',').map(c => c.trim());
        return itemCategories.includes(selectedCategory.toLowerCase().trim());
      });
    }

    setFilteredAffairs(temp);
    setCurrentPage(1);
  }, [selectedYear, selectedMonth, selectedCategory, selectedLanguage, affairs]);

  // Handle Read More
  const handleReadMore = (news) => {
    const slug = (news.title_en || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    navigate(`/summary/${slug}`, {
      state: {
        news,
        prevFilters: {
          year: selectedYear,
          month: selectedMonth,
          category: selectedCategory,
          language: selectedLanguage,
          date: selectedDate
        }
      }
    });
  };

  // News Card Component
  const NewsCard = ({ item }) => {
    const getImageUrl = (image) => {
      if (!image) return '';
      if (typeof image === 'string' && image.startsWith('data:')) return image;
      return `${BASE_URL}${image}`;
    };

    const isHindi = selectedLanguage === 'Hindi';
    const displayTitle = isHindi ? (item.title_hi || item.title_en) : item.title_en;
    const displayShortSummary = isHindi ? (item.short_summary_hi || item.short_summary_en) : item.short_summary_en;
    const displayContent = isHindi ? (item.content_hi || item.content_en) : item.content_en;

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-[550px] flex flex-col">
        {item.image && (
          <img
            src={getImageUrl(item.image)}
            alt={displayTitle}
            className="w-full h-48 object-cover bg-gray-50 dark:bg-gray-900"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex flex-wrap justify-center gap-1 mb-3">
            {(item.category || 'General').split(',').map((cat, idx) => (
              <span key={idx} className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium border border-red-200">
                {cat.trim()}
              </span>
            ))}
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm text-justify mb-3">{displayTitle}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 text-justify line-clamp-3">
            {((displayShortSummary || displayContent) || '').replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ')}
          </p>
          <div className="mt-auto">
            {item.tags && (
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.split(',').map((tag, index) => (
                  <span key={index} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] rounded-md border border-gray-200 dark:border-gray-600">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => handleReadMore(item)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors duration-300 w-full"
            >
              Read More
            </button>
          </div>
        </div>
      </div>
    );
  };

  const displayAffairs = selectedDate
    ? filteredAffairs.filter(item => {
      const itemDateStr = (item.date && (item.date.includes('T') || item.date.includes(' ')))
        ? formatDate(item.date)
        : (item.date ? item.date.split(' ')[0] : '');
      return itemDateStr === selectedDate;
    })
    : filteredAffairs;

  // Group articles by date for horizontal carousel layout
  const groupedAffairs = displayAffairs.reduce((acc, item) => {
    const dateKey = item.date ? item.date.split(/[ T]/)[0] : 'Unknown';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  // Sort dates descending (newest first) for rows
  const sortedDateEntries = Object.entries(groupedAffairs).sort((a, b) => new Date(b[0]) - new Date(a[0]));

  const scrollCarousel = (date, direction) => {
    const container = document.getElementById(`carousel-${date}`);
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <style>{`
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

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-red-600">LATEST CURRENT AFFAIRS WITH MONTHLY MOCK TESTS</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters - Updated for mobile responsiveness */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:flex md:flex-wrap md:justify-between gap-4">
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="col-span-2 md:col-span-1">
                <select
                  value={selectedYear}
                  onChange={(e) => { setSelectedYear(e.target.value); setSelectedDate(''); }}
                  className="w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 px-4 py-2 rounded text-sm"
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <select
                  value={selectedMonth}
                  onChange={(e) => { setSelectedMonth(e.target.value); setSelectedDate(''); }}
                  className="w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 px-4 py-2 rounded text-sm"
                >
                  <option value="">Select Month</option>
                  {months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <select
                  value={selectedLanguage}
                  onChange={(e) => { setSelectedLanguage(e.target.value); setSelectedDate(''); }}
                  className="w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 px-4 py-2 rounded text-sm"
                >
                  <option value="">Select Language</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setSelectedDate(''); }}
                  className="w-full bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 px-4 py-2 rounded text-sm"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <button
                onClick={() => {
                  const localUser = localStorage.getItem("user");
                  if (!localUser) {
                    localStorage.setItem('redirectAfterLogin', location.pathname);
                    navigate('/login');
                    return;
                  }

                  const premiumExpiry = localStorage.getItem('premium_monthly_test_expiry');
                  const isPremium = premiumExpiry && new Date(premiumExpiry) > new Date();

                  if (isPremium) {
                    navigate('/current-affairs-exam/instructions', { state: { year: selectedYear, month: selectedMonth, quiz: currentQuiz } });
                  } else {
                    navigate('/premium-monthly-test');
                  }
                }}
                disabled={isTestButtonDisabled}
                className={`w-full md:w-auto px-4 py-2 rounded text-sm font-medium transition-colors duration-300 ${isTestButtonDisabled
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
              >
                Monthly Test
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Calendar Sidebar - Micro Scale & Sticky */}
          <aside className="w-full lg:w-[300px] xl:w-[320px] lg:sticky lg:top-24 transition-all duration-300 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Compact Header Area */}
              <div className="relative bg-white dark:bg-gray-800 px-4 pt-6 pb-3 border-b dark:border-gray-700 overflow-hidden">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-100 dark:bg-orange-900/10 rounded-full opacity-50 blur-2xl"></div>

                <div className="flex items-baseline justify-between relative z-10">
                  <div className="flex items-baseline gap-1.5">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                      {selectedMonth}
                    </h2>
                    <div className="flex items-center">
                      <span className="text-lg md:text-xl font-bold text-red-600">/</span>
                      <span className="text-lg md:text-xl font-bold text-red-600 ml-0.5">{months.indexOf(selectedMonth) + 1}</span>
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-red-600 opacity-100 tracking-tighter">
                    {selectedYear}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 relative z-10 border-t pt-2 dark:border-gray-700">
                  <button onClick={handlePrevMonth} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <svg className="w-4 h-4 rotate-180" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className="text-[10px] font-black uppercase text-gray-400">Navigate</span>
                  <button onClick={handleNextMonth} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-2 md:p-3 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="grid grid-cols-7 mb-0 gap-px">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, idx) => (
                    <div key={day} className={`text-center text-[8px] md:text-[9px] font-black text-white py-1.5 rounded-t-lg ${idx === 0 || idx === 6 ? 'bg-[#FF4D4D]' : 'bg-[#FF9933]'}`}>
                      {day.substring(0, 3)}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
                  {generateCalendarDays().map((item, idx) => {
                    const dateStr = formatDate(item.date);
                    const isSelected = selectedDate === dateStr;
                    const hasArticles = hasContent(item.date);
                    const dayOfWeek = item.date.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(dateStr)}
                        disabled={!item.currentMonth}
                        className={`relative aspect-square flex flex-col items-center justify-center bg-white dark:bg-gray-800 transition-all duration-200 ${!item.currentMonth ? 'opacity-30' : 'hover:bg-red-50 dark:hover:bg-red-900/10'} ${item.currentMonth && isSelected ? 'bg-red-50 dark:bg-red-900/20 ring-1 ring-inset ring-red-500/50 z-10' : ''}`}
                      >
                        <span className={`text-xs md:text-lg font-black ${isWeekend && item.currentMonth ? 'text-red-600' : 'text-gray-800 dark:text-gray-100'}`}>
                          {item.day}
                        </span>
                        {hasArticles && <span className={`absolute top-0.5 right-0.5 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${isSelected ? 'bg-red-600' : 'bg-red-500'}`}></span>}
                        {formatDate(new Date()) === dateStr && <div className="absolute bottom-0.5 w-3/4 h-0.5 bg-blue-500 rounded-full"></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Articles Section - Scrollable Parent */}
          <section className="flex-1 min-w-0 w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b dark:border-gray-700 pb-4 gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                {selectedDate
                  ? `Articles for ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  : `${selectedMonth} ${selectedYear} Articles`}
              </h2>
              <span className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-sm self-start sm:self-center">
                {displayAffairs.length} Total Articles
              </span>
            </div>

            {displayAffairs.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-gray-300 dark:text-gray-600 mb-4 scale-150">
                  <svg className="w-16 h-16 mx-auto opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">No articles found for this selection.</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try selecting a different date or month.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {sortedDateEntries.map(([date, items]) => (
                  <div key={date} className="flex flex-col group">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <div className="text-[12px] font-bold text-red-600 dark:text-white uppercase tracking-[0.15em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-white shadow-sm animate-pulse"></span>
                        {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => scrollCarousel(date, 'left')}
                          className="p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => scrollCarousel(date, 'right')}
                          className="p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div id={`carousel-${date}`} className="flex items-stretch overflow-x-auto gap-6 pb-4 -mx-2 px-2 snap-x scrollbar-hide no-scrollbar">
                      {items.map((item) => (
                        <div key={item.id} className="w-[280px] sm:w-[320px] md:w-[380px] flex-shrink-0 snap-start h-full">
                          <NewsCard item={item} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>


    </div>
  );
};

export default CurrentAffairsData;

