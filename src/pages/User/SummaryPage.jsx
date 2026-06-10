import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Current_Affairs_Popup from '../Current_Affairs_Exam_Components/Current_Affairs_Popup';
import { Bookmark, BookmarkCheck, Loader2, Gift } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';


const SummaryPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [news, setNews] = useState(location.state?.news);
  const [loading, setLoading] = useState(!location.state?.news);
  const [allNews, setAllNews] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(location.state?.news?.language || 'English');
  const [isCAPopupOpen, setIsCAPopupOpen] = useState(false);
  const [isCAPopupMinimized, setIsCAPopupMinimized] = useState(localStorage.getItem('caPopupMinimized') === 'true');
  const user = JSON.parse(localStorage.getItem("student_user") || localStorage.getItem("user") || "{}");
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL;


  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
  };

  useEffect(() => {
    const fetchSaveStatus = async () => {
      if (!user?.id || !news?.id) return;
      
      try {
        setStatusLoading(true);
        const apiUrl = import.meta.env.VITE_BACKEND_URL || "";
        const response = await fetch(`${apiUrl}/api/SaveandReport/get_status.php?student_id=${user.id}`);
        const data = await response.json();
        
        if (data.success && data.saved_articles) {
          setIsSaved(data.saved_articles.includes(Number(news.id)) || data.saved_articles.includes(String(news.id)));
        }
      } catch (err) {
        console.error('Error fetching save status:', err);
      } finally {
        setStatusLoading(false);
      }
    };

    if (news?.id) {
      fetchSaveStatus();
    }
  }, [user?.id, news?.id]);

  const handleSaveArticle = async () => {
    if (!user?.id) {
      toast({
        title: "Login Required",
        description: "Please login to save articles.",
        variant: "destructive",
      });
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const premiumExpiry = localStorage.getItem('premium_monthly_test_expiry');
    const isPremium = premiumExpiry && new Date(premiumExpiry) > new Date();
    
    if (!isPremium) {
      toast({
        title: "Premium Required",
        description: "In order to save articles, purchase monthly test.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaveLoading(true);
      const apiUrl = import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${apiUrl}/api/SaveandReport/save_ca_article.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          ca_id: news.id,
          action: isSaved ? 'remove' : 'save'
        })
      });
      const data = await response.json();

      if (data.success) {
        setIsSaved(!isSaved);
        toast({
          title: isSaved ? "Removed" : "Saved",
          description: data.message,
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error saving article:', err);
      toast({
        title: "Error",
        description: "Failed to save article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        if (!news && slug) setLoading(true);
        const response = await fetch(`${BASE_URL}api/CurrentAffairs/get_current_affairs_api.php`);
        const data = await response.json();

        if (data.status === 'success') {
          setAllNews(data.data);
          if (!news && slug) {
            const foundNews = data.data.find(item => {
              const itemSlug = (item.title_en || item.title || '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
              return itemSlug === slug;
            });

            if (foundNews) {
              setNews(foundNews);
              setSelectedLanguage(foundNews.language || 'English');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, [slug]);

  if (loading) {
    return <div className="text-center mt-10 text-lg text-gray-600 dark:text-gray-300">Loading...</div>;
  }

  if (!news) {
    return (
      <div className="text-center mt-10 text-lg text-gray-600 dark:text-gray-300">
        No summary data available.
        <br />
        <button
          onClick={() => {
            if (location.state?.prevFilters) {
              navigate('/current-affairs-data', { state: location.state.prevFilters });
            } else {
              navigate(-1);
            }
          }}
          className="mt-4 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isHindi = selectedLanguage === 'Hindi';
  const displayTitle = isHindi ? (news.title_hi || news.title_en) : news.title_en;
  const displayShortSummary = isHindi ? (news.short_summary_hi || news.short_summary_en) : news.short_summary_en;
  const displayContent = isHindi ? (news.content_hi || news.content_en) : news.content_en;

  const summaryText = (displayContent || '').replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').slice(0, 600) + '...';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-gray-800 dark:text-gray-200">
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

      <Helmet>
        <title>{displayTitle} | Summary</title>
        <style>{`
          .ql-align-center { text-align: center; }
          .ql-align-right { text-align: right; }
          .ql-align-justify { text-align: justify; }
        `}</style>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-2 dark:border-gray-600 gap-4">
        <h1 className="text-2xl font-bold">
          SHORT SUMMARY FOR EXAM
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
          <button
            onClick={handleSaveArticle}
            disabled={saveLoading || statusLoading}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isSaved 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {saveLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            {isSaved ? 'Saved' : 'Save Article'}
          </button>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-center mb-4">
        {displayTitle}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded-md shadow mb-6 bg-white dark:bg-gray-900 dark:border-gray-700">
        <div>
          {displayShortSummary ? (
            <div
              className="leading-relaxed text-sm md:text-base text-gray-700 dark:text-gray-300 [&_p]:mb-2"
              dangerouslySetInnerHTML={{ __html: displayShortSummary }}
            />
          ) : (
            <p className="leading-relaxed text-sm md:text-base text-gray-700 dark:text-gray-300">
              {summaryText}
            </p>
          )}
          <div className="mt-2">
            <span className="bg-red-600 text-white text-xs px-3 py-1 rounded inline-block font-medium shadow-sm">
              Date: {news.date?.split(/[ T]/)[0]}
            </span>
          </div>
          {news.tags && (
            <div className="flex flex-wrap gap-2 mt-3">
              {news.tags.split(',').map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full border border-blue-100 dark:border-blue-800">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center">
          <img
            src={news.image?.startsWith('data:') ? news.image : `${BASE_URL}${news.image}`}
            alt={news.title}
            className="w-full max-w-md md:max-w-sm h-auto object-contain rounded-md shadow"
          />
        </div>
      </div>

      {news.youtube_link && (() => {
        const getEmbedUrl = (link) => {
          if (!link) return null;
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
          const match = link.match(regExp);
          return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
        };
        const embedUrl = getEmbedUrl(news.youtube_link);
        return embedUrl ? (
          <div className="mb-8 px-4 w-full max-w-2xl mx-auto">
            <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-lg">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        ) : null;
      })()}

      <div
        className="text-sm mb-8 px-4 leading-relaxed text-gray-800 dark:text-gray-200"
        dangerouslySetInnerHTML={{ __html: displayContent }}
      ></div>

      <div className="text-center mt-8">
        <button
          onClick={() => {
            if (location.state?.prevFilters) {
              navigate('/current-affairs-data', { state: location.state.prevFilters });
            } else {
              navigate(-1);
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Back to News
        </button>
      </div>
    </div>
  );
};

export default SummaryPage;
