import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  TrendingUp,
  Calendar,
  Activity,
  UserCheck,
  ClipboardList,
  PieChart,
  BarChart3,
  RefreshCw,
  X,
  ExternalLink,
  Globe
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart, 
  Area,
  PieChart as RechartsPieChart, 
  Pie, 
  Cell 
} from 'recharts';

const COLORS = ['#4F46E5', '#9333EA', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];


const AdminDashboard = () => {
  const { isDarkMode } = useTheme();
  const { adminUser } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [salesData, setSalesData] = useState({ monthly_test: [], test_series: [] });
  const [selectedSalesType, setSelectedSalesType] = useState('monthly_test');
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const [loadingSales, setLoadingSales] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedValidity, setSelectedValidity] = useState('all');

  useEffect(() => {
    setSelectedMonth('all');
    setSelectedValidity('all');
  }, [selectedSalesType]);

  const buildUrl = (path) => `${import.meta.env.VITE_BACKEND_URL}${path}`;

  const fetchSalesOverview = async () => {
    setLoadingSales(true);
    try {
      const response = await axios.get(buildUrl('/api/Dashboard/get_sales_overview.php'));
      if (response.data.success) {
        setSalesData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sales overview:', error);
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    // Only fetch metrics if super_admin
    if (adminUser?.role === 'super_admin') {
      fetchDashboardMetrics();
      fetchSalesOverview();
    } else {
      setLoading(false);
    }
  }, [adminUser]);

  useEffect(() => {
    // Auto-enable F11 fullscreen mode on page load
    const enableF11FullscreenOnLoad = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (error) {
        console.log('F11 Fullscreen not supported or blocked:', error);
      }
    };

    const timer = setTimeout(enableF11FullscreenOnLoad, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(buildUrl('/api/Dashboard/dashboard_metrics.php'));
      if (response.data.success) {
        setMetrics(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Failed to fetch dashboard metrics');
      console.error('Dashboard metrics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color = 'blue', loading = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow duration-200 ${isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
        }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>{title}</h3>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
              {loading ? (
                <div className={`w-16 h-8 animate-pulse rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}></div>
              ) : (
                value?.toLocaleString() || '0'
              )}
            </p>
          </div>
        </div>
        {change && (
          <div className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
    </motion.div>
  );

  const ServiceCard = ({ title, url, icon: Icon, color = 'blue' }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        const width = window.innerWidth * 0.9;
        const height = window.innerHeight * 0.9;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        window.open(url, "_blank", `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`);
      }}
      className={`cursor-pointer rounded-2xl shadow-sm border p-6 flex items-center justify-between transition-all duration-300 ${isDarkMode
        ? 'bg-gray-800 border-gray-700 hover:border-[#3936C9]'
        : 'bg-white border-gray-200 hover:border-[#3936C9]'
        }`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div>
          <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Open Popup View</p>
        </div>
      </div>
      <ExternalLink className="w-5 h-5 text-gray-400" />
    </motion.div>
  );

  const DigitalClock = ({ isDarkMode }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <p className="text-6xl font-black tracking-tighter text-[#3936C9] dark:text-blue-400">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400 mt-2">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
          </p>
        </div>

        <div className={`flex items-center gap-6 p-6 rounded-3xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="text-center border-r border-gray-200 dark:border-gray-600 pr-6">
            <p className="text-4xl font-black dark:text-white">{currentTime.getDate()}</p>
            <p className="text-xs font-bold text-gray-500 uppercase">{currentTime.toLocaleDateString('en-US', { month: 'short' })}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black dark:text-white">{currentTime.getFullYear()}</p>
            <p className="text-xs font-bold text-gray-500 uppercase">Year</p>
          </div>
        </div>
      </div>
    );
  };

  const ChartCard = ({ title, children, loading = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl shadow-sm border p-6 ${isDarkMode
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
        }`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>{title}</h3>
      {loading ? (
        <div className={`w-full h-64 animate-pulse rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}></div>
      ) : (
        children
      )}
    </motion.div>
  );

  // If role is teacher, show the gif and the digital clock/calendar
  if (adminUser?.role === 'test_teacher' || adminUser?.role === 'ca_teacher') {
    return (
      <AdminLayout>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center min-h-[70vh]">
          {/* Welcome GIF */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img
                src="/img/admin_dashboard.gif"
                alt="Welcome to Dashboard"
                className="max-w-full h-auto rounded-2xl shadow-2xl border-4 border-[#3936C9]/20"
              />
              <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full shadow-lg font-bold text-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                }`}>
                Welcome to Anirban's Academy
              </div>
            </motion.div>
          </div>

          {/* Date & Time Clock */}
          <div className="flex justify-center w-full max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full rounded-2xl shadow-sm border p-6 ${isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
                }`}
            >
              <h3 className={`text-lg font-semibold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                System Clock & Calendar
              </h3>
              <DigitalClock isDarkMode={isDarkMode} />
            </motion.div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {

    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium">{error}</div>
            <button
              onClick={fetchDashboardMetrics}
              className="mt-4 px-4 py-2 bg-[#3936C9] text-white rounded-lg hover:bg-[#2D2B9E] transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline-block mr-2" />
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const rawActiveData = salesData[selectedSalesType] || [];
  
  // Filter raw data by validity first if it's test series
  const filteredByValidity = (selectedSalesType === 'test_series' && selectedValidity !== 'all')
    ? rawActiveData.filter(item => item.validity === selectedValidity)
    : rawActiveData;

  const availableMonths = Array.from(new Set(
    filteredByValidity.map(item => {
      if (!item.purchase_date) return null;
      return item.purchase_date.substring(0, 7); // "YYYY-MM"
    }).filter(Boolean)
  )).sort();

  const uniqueMonths = availableMonths;
  const activeMonthFilter = (selectedMonth === 'all' && uniqueMonths.length === 1) ? uniqueMonths[0] : selectedMonth;



  const formatMonthKey = (monthKey) => {
    if (!monthKey) return '';
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  let chartData = [];
  if (selectedChartType === 'pie') {
    // Pie chart is always grouped by month, not date-wise
    const groups = {};
    filteredByValidity.forEach(item => {
      if (!item.purchase_date) return;
      const key = item.purchase_date.substring(0, 7);
      if (!groups[key]) {
        groups[key] = { name: formatMonthKey(key), Sales: 0, Count: 0 };
      }
      groups[key].Sales += item.price_paid;
      groups[key].Count += 1;
    });
    chartData = Object.keys(groups).sort().map(key => groups[key]);
  } else if (activeMonthFilter === 'all') {
    const groups = {};
    filteredByValidity.forEach(item => {
      if (!item.purchase_date) return;
      const key = item.purchase_date.substring(0, 7);
      if (!groups[key]) {
        groups[key] = { name: formatMonthKey(key), Sales: 0, Count: 0 };
      }
      groups[key].Sales += item.price_paid;
      groups[key].Count += 1;
    });
    chartData = Object.keys(groups).sort().map(key => groups[key]);
  } else {
    // If selectedMonth is selected or we fell back to a single month, filter and build daily data
    let dailyFilteredData = filteredByValidity.filter(item => item.purchase_date && item.purchase_date.startsWith(activeMonthFilter));
    const groups = {};
    const [year, month] = activeMonthFilter.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = String(i).padStart(2, '0');
      const dateKey = `${activeMonthFilter}-${dayStr}`;
      const formattedDate = new Date(year, parseInt(month) - 1, i).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      groups[dateKey] = { name: formattedDate, Sales: 0, Count: 0 };
    }
    dailyFilteredData.forEach(item => {
      const dateKey = item.purchase_date;
      if (groups[dateKey]) {
        groups[dateKey].Sales += item.price_paid;
        groups[dateKey].Count += 1;
      }
    });
    chartData = Object.keys(groups).sort().map(key => groups[key]);
  }

  const SalesOverviewChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[600px]">
          <p className="text-gray-500 font-medium">No sales data available</p>
        </div>
      );
    }

    return (
      <div className="w-full h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          {selectedChartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#F3F4F6'} />
              <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} fontSize={11} />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} fontSize={11} tickFormatter={(val) => `₹${val}`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', 
                  borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                  color: isDarkMode ? '#FFFFFF' : '#111827'
                }} 
                formatter={(value, name) => [name === 'Sales' ? `₹${value.toLocaleString()}` : value, name]}
              />
              <Legend />
              <Bar dataKey="Sales" fill="#4F46E5" name="Sales (₹)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="Count" fill="#10B981" name="Orders Count" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          ) : selectedChartType === 'trendline' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#F3F4F6'} />
              <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} fontSize={11} />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} fontSize={11} tickFormatter={(val) => `₹${val}`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', 
                  borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                  color: isDarkMode ? '#FFFFFF' : '#111827'
                }} 
                formatter={(value, name) => [name === 'Sales' ? `₹${value.toLocaleString()}` : value, name]}
              />
              <Legend />
              <Area type="monotone" dataKey="Sales" stroke="#4F46E5" fillOpacity={1} fill="url(#colorSales)" name="Sales (₹)" />
              <Area type="monotone" dataKey="Count" stroke="#10B981" fillOpacity={1} fill="url(#colorCount)" name="Orders Count" />
            </AreaChart>
          ) : (
            <RechartsPieChart>
              <Pie
                data={chartData}
                dataKey="Sales"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={155}
                fill="#8884d8"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', 
                  borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                  color: isDarkMode ? '#FFFFFF' : '#111827'
                }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales (₹)']}
              />
              <Legend />
            </RechartsPieChart>
          )}
        </ResponsiveContainer>
        {selectedChartType !== 'pie' && selectedMonth === 'all' && uniqueMonths.length === 1 && (
          <p className="text-xs text-indigo-500/80 dark:text-indigo-400/80 mt-2 italic text-center">
            Showing daily sales for {formatMonthKey(uniqueMonths[0])} (only one month of data available).
          </p>
        )}
        {selectedChartType !== 'pie' && selectedMonth === 'all' && uniqueMonths.length > 1 && (
          <p className="text-xs text-indigo-500/80 dark:text-indigo-400/80 mt-2 italic text-center">
            Tip: Select a specific month from the dropdown to view daily sales trends.
          </p>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={Users}
            title="Total Admins"
            value={metrics?.total_admins}
            color="purple"
            loading={loading}
          />
          <StatCard
            icon={GraduationCap}
            title="Current Affairs Teachers"
            value={metrics?.current_affairs_teachers}
            color="green"
            loading={loading}
          />
          <StatCard
            icon={BookOpen}
            title="Test Series Teachers"
            value={metrics?.test_series_teachers}
            color="blue"
            loading={loading}
          />
          <StatCard
            icon={Users}
            title="Total Students"
            value={metrics?.total_students}
            color="indigo"
            loading={loading}
          />
          <StatCard
            icon={UserCheck}
            title="New Students (This Month)"
            value={metrics?.new_students_this_month}
            color="emerald"
            loading={loading}
          />
          <StatCard
            icon={ClipboardList}
            title="Test Series Courses"
            value={metrics?.test_series_courses}
            color="amber"
            loading={loading}
          />
          <StatCard
            icon={FileText}
            title="Total Questions"
            value={metrics?.total_questions}
            color="rose"
            loading={loading}
          />
          <StatCard
            icon={BookOpen}
            title="Solution Pages"
            value={metrics?.total_solutions}
            color="cyan"
            loading={loading}
          />
          <StatCard
            icon={FileText}
            title="Current Affairs Pages"
            value={metrics?.current_affairs_pages}
            color="teal"
            loading={loading}
          />
          <StatCard
            icon={Activity}
            title="CA Categories"
            value={metrics?.current_affairs_categories}
            color="orange"
            loading={loading}
          />
          <StatCard
            icon={Calendar}
            title="Monthly Tests"
            value={metrics?.monthly_tests}
            color="violet"
            loading={loading}
          />
          <StatCard
            icon={TrendingUp}
            title="Active Users"
            value={metrics?.total_students + metrics?.current_affairs_teachers + metrics?.test_series_teachers}
            color="pink"
            loading={loading}
          />
        </div>

        {/* Google Services Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ServiceCard
            title="PageSpeed Insights"
            url="https://pagespeed.web.dev/analysis/https-anirbansacademy-com/5g9uy0lt6z?hl=en&form_factor=desktop"
            icon={TrendingUp}
            color="indigo"
          />
          <ServiceCard
            title="Google Analytics"
            url="https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fanalytics.google.com%2Fanalytics%2Fweb%2F%23&dsh=S1211303530%3A1778920768412449&followup=https%3A%2F%2Fanalytics.google.com%2Fanalytics%2Fweb%2F&passive=1209600&service=analytics&flowName=GlifWebSignIn&flowEntry=ServiceLogin&ifkv=AWa2PavOBP-oAnXvWVo31iyc-NHvHL0MAoXj7N8lVAXWVkKDPcziiK12s8cW4n5Tl23C2dBL-zLPNA"
            icon={BarChart3}
            color="emerald"
          />
          <ServiceCard
            title="Search Console"
            url="https://search.google.com/search-console?utm_source=about-page&resource_id=https://anirbansacademy.com/"
            icon={Globe}
            color="amber"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Sales Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl shadow-sm border p-6 ${isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
              }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Sales Overview
              </h3>
              
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedSalesType}
                  onChange={(e) => setSelectedSalesType(e.target.value)}
                  className={`text-xs sm:text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="monthly_test">Monthly Test Sales</option>
                  <option value="test_series">Test Series Sales</option>
                </select>

                {selectedSalesType === 'test_series' && (
                  <select
                    value={selectedValidity}
                    onChange={(e) => setSelectedValidity(e.target.value)}
                    className={`text-xs sm:text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">All Validities</option>
                    <option value="6 Months">6 Months Validity</option>
                    <option value="1 Year">1 Year Validity</option>
                  </select>
                )}

                {selectedChartType !== 'pie' && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className={`text-xs sm:text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="all">All Months</option>
                    {availableMonths.map(m => (
                      <option key={m} value={m}>{formatMonthKey(m)}</option>
                    ))}
                  </select>
                )}

                <select
                  value={selectedChartType}
                  onChange={(e) => setSelectedChartType(e.target.value)}
                  className={`text-xs sm:text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="bar">Bar Chart View</option>
                  <option value="trendline">Trendline (Area View)</option>
                  <option value="pie">Pie Chart Share</option>
                </select>
              </div>
            </div>

            {loadingSales ? (
              <div className="flex items-center justify-center h-[600px]">
                <RefreshCw className="w-8 h-8 animate-spin text-[#3936C9]" />
              </div>
            ) : (
              <SalesOverviewChart />
            )}
          </motion.div>
        </div>

        {/* Calendar and Activities Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Widget */}
          <ChartCard title="System Clock & Calendar" loading={loading}>
            <DigitalClock isDarkMode={isDarkMode} />
          </ChartCard>

          {/* Recent Activities */}
          <ChartCard title="Recent Activities" loading={loading}>
            <div className="space-y-4 h-64 overflow-y-auto">
              {metrics?.recent_activities?.length > 0 ? (
                metrics.recent_activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                  >
                    <div className="w-2 h-2 bg-[#3936C9] rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                        {activity.description}
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {activity.user_name} • {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Activity className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>No recent activities</p>
                  </div>
                </div>
              )}
            </div>
          </ChartCard>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;