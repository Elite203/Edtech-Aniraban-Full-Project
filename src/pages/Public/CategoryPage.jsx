import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
const BASE_URL = import.meta.env.VITE_BASE_URL;
const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [affairs, setAffairs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (image) => {
    if (!image) return '';
    if (typeof image === 'string' && image.startsWith('data:')) return image;
    return `${BASE_URL}${image}`;
  };

  useEffect(() => {
    if (!category) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}api/CurrentAffairs/get_current_affairs_api.php`);
        const data = await response.json();

        if (data.status === 'success') {
          const filtered = data.data.filter(item => {
            const itemCategories = (item.category || '').toLowerCase().split(',').map(c => c.trim());
            return itemCategories.includes(decodeURIComponent(category).toLowerCase().trim());
          });


          const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
          setAffairs(sorted);
        } else {
          setAffairs([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setAffairs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  const handleReadMore = (news) => {
    const slug = (news.title_en || news.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    navigate(`/summary/${slug}`, { state: { news } });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white border-l-4 border-red-600 pl-4">
            Category: <span className="text-red-600 capitalize">{decodeURIComponent(category)}</span>
          </h1>
          <button
            onClick={() => navigate('/current-affairs')}
            className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 flex items-center gap-2 font-medium transition-colors"
          >
            ← Back to All
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : affairs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
            <p className="text-xl text-gray-500 dark:text-gray-400">No articles discovered in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {affairs.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 border-none rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col group">
                <div className="relative overflow-hidden h-48">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/600x400?text=News+Article';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {item.language || 'English'}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="text-xs text-red-600 dark:text-red-400 font-bold tracking-wider mb-2 uppercase">
                    {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3 leading-tight">
                    {item.title_en || item.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-justify">
                    {(item.short_summary_en || item.content_en || '').replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ')}
                  </p>
                  {item.tags && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.tags.split(',').map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] rounded-md border border-gray-200 dark:border-gray-600">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <button
                      onClick={() => handleReadMore(item)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-red-500/30 w-full md:w-auto"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;