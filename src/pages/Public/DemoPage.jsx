
import React, { useState, useEffect } from 'react';
import { AlertCircle, Play, ExternalLink } from 'lucide-react';
import { useTheme } from '../../components/ThemeProvider';
import axios from 'axios';

const DemoPage = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [videos, setVideos] = useState([]);
  const [videoTitles, setVideoTitles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    fetchDemoVideos();
  }, []);

  const extractVideoId = (url) => {
    if (!url) return null;
    
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      console.log('Extracted video ID:', match[1], 'from URL:', url);
      return match[1];
    }
    
    console.warn('Could not extract video ID from URL:', url);
    return null;
  };

  const fetchVideoTitle = async (videoId) => {
    try {
      if (!API_KEY) {
        console.error('YouTube API key not found');
        return null;
      }
      
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${API_KEY}`);
      
      if (!response.ok) {
        console.error('YouTube API response not OK:', response.status, response.statusText);
        return null;
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('YouTube API error:', data.error);
        return null;
      }
      
      if (data.items && data.items.length > 0) {
        return data.items[0].snippet.title;
      }
      
      console.warn('No video found for ID:', videoId);
      return null;
    } catch (error) {
      console.error('Error fetching video title for ID', videoId, ':', error);
      return null;
    }
  };

  const fetchDemoVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}api/Content/get_demo_videos.php`);
      if (response.data && response.data.success) {
        const videosData = Array.isArray(response.data.data.videos) ? response.data.data.videos : [];
        setVideos(videosData);
        
        // Fetch YouTube titles for all videos
        const titles = {};
        const titlePromises = videosData.map(async (video) => {
          const videoId = extractVideoId(video.video_link);
          if (videoId && API_KEY) {
            console.log('Fetching title for video ID:', videoId, 'from URL:', video.video_link);
            const title = await fetchVideoTitle(videoId);
            if (title) {
              titles[video.id] = title;
              console.log('Successfully fetched title:', title);
            } else {
              console.warn('Failed to fetch title for video ID:', videoId);
            }
          } else {
            console.warn('No video ID extracted or API key missing for:', video.video_link);
          }
        });
        
        await Promise.all(titlePromises);
        setVideoTitles(titles);
      } else {
        setVideos([]);
        setError(response.data?.message || 'Failed to fetch videos');
      }
    } catch (err) {
      console.error('Error fetching demo videos:', err);
      setVideos([]);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getThumbnailSrc = (videoId, thumbnail) => {
    if (!thumbnail) {
      return "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100' height='100' fill='%236366f1'/%3e%3ctext x='50' y='50' font-family='Arial' font-size='12' fill='white' text-anchor='middle' dy='0.3em'%3eNo Thumbnail%3c/text%3e%3c/svg%3e";
    }
    
    // Always use the dedicated thumbnail API when thumbnail exists
    return `${BASE_URL}api/Content/get_demo_thumbnail.php?id=${videoId}`;
  };

  const handleVideoClick = (videoLink) => {
    if (videoLink) {
      window.open(videoLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <section className={`container mx-auto px-6 py-16 flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)] ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Loading Demo Videos...
        </h2>
      </section>
    );
  }

  if (error || !Array.isArray(videos) || videos.length === 0) {
    return (
      <section className={`container mx-auto px-6 py-16 flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)] ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <AlertCircle className="w-24 h-24 text-indigo-500 mb-8" />
        <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          No Free Demo Videos Available Here
        </h1>
        <p className={`text-lg mb-8 max-w-md ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {error || 'We are currently updating our demo content. Please check back later or explore our courses for detailed information.'}
        </p>
      </section>
    );
  }

  return (
    <section className={`min-h-screen py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Free Demo Videos
          </h1>
          <p className={`text-base sm:text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Explore our collection of demo videos to get a preview of our course content.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer ${
                isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
              onClick={() => handleVideoClick(video.video_link)}
            >
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                <img
                  src={getThumbnailSrc(video.id, video.thumbnail)}
                  alt={video.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100' height='100' fill='%236366f1'/%3e%3ctext x='50' y='50' font-family='Arial' font-size='12' fill='white' text-anchor='middle' dy='0.3em'%3eNo Thumbnail%3c/text%3e%3c/svg%3e";
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className={`font-semibold text-lg mb-2 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {videoTitles[video.id] || 'Loading title...'}
                </h3>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Click to watch
                  </span>
                  <ExternalLink className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DemoPage;
