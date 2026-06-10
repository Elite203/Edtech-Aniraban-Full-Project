import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { ChevronRight, Play } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const FeatureDetails = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const location = useLocation();
  const { exam } = location.state || {};

  const displayTitle = exam?.title_text || "Explore Our Learning Features";
  const displaySubtitle = exam?.subtitle_text || "Unlock your potential with our comprehensive resources designed for your success.";

  // Dynamic buttons from database
  const dynamicButtons = [];
  for (let i = 1; i <= 10; i++) {
    if (exam?.[`btn${i}_text`]?.trim()) {
      dynamicButtons.push({
        text: exam[`btn${i}_text`],
        color: exam[`btn${i}_color`] || '#3936C9',
        link: exam[`btn${i}_link`]
      });
    }
  }

  const defaultButtons = [
    { text: "Syllabus & Exam Pattern" },
    { text: "Previous Year Papers" },
    { text: "Study Materials" },
    { text: "Practice Quizzes" },
    { text: "Expert Guidance" }
  ];

  const displayButtons = dynamicButtons.length > 0 ? dynamicButtons : defaultButtons;

  // Helper to extract YouTube ID and format embed link
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const dynamicVideos = [
    getEmbedUrl(exam?.yt_link1),
    getEmbedUrl(exam?.yt_link2),
    getEmbedUrl(exam?.yt_link3),
    getEmbedUrl(exam?.yt_link4)
  ].filter(url => url !== null);

  const defaultVideos = [1, 2, 3, 4];
  const displayVideos = dynamicVideos.length > 0 ? dynamicVideos : defaultVideos;
  const isDynamic = dynamicVideos.length > 0;
  const wrapTables = (html) => {
    if (!html) return html;
    return html.replace(/<table([\s\S]*?)>([\s\S]*?)<\/table>/gi, '<div class="w-full overflow-x-auto my-6 border dark:border-gray-700 rounded-xl" style="touch-action: pan-x; -webkit-overflow-scrolling: touch;"><table$1>$2</table></div>');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6 pb-20 px-6">
      <Helmet>
        <title>Feature Details | ANIRBAN'S ACADEMY</title>
      </Helmet>

      <div className="container mx-auto px-4">
        {/* Top Center Title (No Box) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 pt-2 pb-4 leading-tight">
            {displayTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto px-4">
            {displaySubtitle}
          </p>
        </motion.div>

        {/* Buttons Section (Single Row) */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-6">
          {displayButtons.map((btn, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={btn.link ? { scale: 1.05, y: -2 } : { scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => btn.link && window.open(btn.link, '_blank')}
              style={btn.color ? { backgroundColor: btn.color, borderColor: btn.color, color: 'white' } : {}}
              className={`px-6 py-3 rounded-full font-semibold text-sm md:text-base whitespace-nowrap transition-all shadow-sm hover:shadow-md ${btn.link ? 'cursor-pointer' : 'cursor-default'} ${!btn.color ? 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400' : 'border-transparent'}`}
            >
              {btn.text}
            </motion.button>
          ))}
        </div>

        {/* Main Grid Container */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
          {/* Left Column (60%) */}
          <div className="lg:col-span-6 space-y-8 min-w-0 w-full">
            {/* Video Grid Section */}
            <div className={`grid gap-6 ${
              displayVideos.length === 1 ? 'grid-cols-1' : 
              displayVideos.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
              'grid-cols-1 md:grid-cols-2'
            }`}>
              {displayVideos.map((video, index) => (
                <motion.div
                  key={index}
                  className="group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                >
                  <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden mb-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                    {isDynamic ? (
                      <iframe
                        src={video}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`YouTube video ${index + 1}`}
                      ></iframe>
                    ) : (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                          <div className="w-12 h-12 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-indigo-600 fill-current" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">
                          15:20
                        </div>
                      </>
                    )}
                  </div>
                  {!isDynamic && (
                    <>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        Important Topic Mastery: Expert Session Part {video}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-2">
                        <span>2.4K views</span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                        <span>1 day ago</span>
                      </p>
                    </>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Content Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[300px]"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Content Overview</h2>
              {exam?.content_overview ? (
                <div 
                  className={`prose dark:prose-invert max-w-none ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} 
                    [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-6 [&_p]:mb-4 
                    [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6
                    [&_table]:w-full [&_table]:min-w-[500px] [&_table]:border-collapse [&_table]:my-6
                    [&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-600 [&_td]:p-3
                    [&_th]:border [&_th]:border-gray-300 [&_th]:dark:border-gray-600 [&_th]:p-3 [&_th]:bg-gray-50 [&_th]:dark:bg-gray-700/50`}
                  dangerouslySetInnerHTML={{ __html: wrapTables(exam.content_overview) }}
                />
              ) : (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column (40%) */}
          <div className="lg:col-span-4 space-y-8 min-w-0 w-full">
            {/* Ad Space Placeholder (Matching Video Grid Height) */}
            <div className="hidden lg:block bg-gray-50/50 dark:bg-gray-800/30 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm font-medium h-[480px]">
              ADVERTISEMENT SPACE
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[300px]"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Quick Actions</h2>
              {exam?.quick_actions ? (
                <div 
                  className={`prose dark:prose-invert max-w-none ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} 
                    [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-4 [&_p]:mb-3 
                    [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5
                    [&_table]:w-full [&_table]:min-w-[500px] [&_table]:border-collapse [&_table]:my-4
                    [&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-600 [&_td]:p-2
                    [&_th]:border [&_th]:border-gray-300 [&_th]:dark:border-gray-600 [&_th]:p-2 [&_th]:bg-gray-50 [&_th]:dark:bg-gray-700/50`}
                  dangerouslySetInnerHTML={{ __html: wrapTables(exam.quick_actions) }}
                />
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <div className="h-4 bg-indigo-200 dark:bg-indigo-800 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-indigo-100 dark:bg-indigo-900/40 rounded w-full"></div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                    <div className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-purple-100 dark:bg-purple-900/40 rounded w-full"></div>
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

export default FeatureDetails;
