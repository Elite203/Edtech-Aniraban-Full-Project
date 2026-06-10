import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  Eye, 
  Calendar, 
  Search, 
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  BookOpen,
  FileText
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';

const AdminTeacherActivityPage = () => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [selectedActivity, setSelectedActivity] = useState('all');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentServerTime, setCurrentServerTime] = useState(null);

  const buildUrl = (path) => `${import.meta.env.VITE_BACKEND_URL}${path}`;

  // Fetch current server time using getinfo.php for accurate timezone formatting
  const fetchServerTime = async () => {
    console.log('🕐 Fetching server time from getinfo.php for accurate timezone handling...');
    try {
      const response = await fetch(buildUrl('/api/Utils/getinfo.php'));
      const data = await response.json();
      
      console.log('⏰ Server time response:', data);
      
      if (data.dateTimeDetails) {
        setCurrentServerTime(data.dateTimeDetails);
        console.log('✅ Server timezone info updated:', {
          timezone: data.dateTimeDetails.timezone,
          time12Hour: data.dateTimeDetails.time12Hour,
          fullDate: data.dateTimeDetails.fullDate
        });
      }
    } catch (error) {
      console.error('❌ Error fetching server time:', error);
    }
  };

  // Fetch teacher activities from database
  const fetchTeacherActivities = async () => {
    console.log('🔍 Fetching teacher activities from database...');
    setLoading(true);
    
    try {
      const response = await fetch(buildUrl('/api/Teachers/teacher_activity.php'));
      const data = await response.json();
      
      console.log('📊 Teacher activities response:', data);
      
      if (data.success) {
        console.log('✅ Successfully fetched', data.data.length, 'teacher activities');
        
        // Log first activity to show enhanced getinfo integration
        if (data.data.length > 0) {
          console.log('📱 Sample activity with getinfo integration:', {
            email: data.data[0].email,
            device_type: data.data[0].device_type,
            location: data.data[0].location,
            ip_address: data.data[0].ip_address
          });
        }
        
        setActivities(data.data);
      } else {
        console.error('❌ Failed to fetch teacher activities:', data.message);
        setActivities([]);
      }
    } catch (error) {
      console.error('💥 Error fetching teacher activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-enable fullscreen on page load and fetch data
  useEffect(() => {
    const enableFullscreenOnLoad = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (error) {
        console.log('Fullscreen not supported or blocked:', error);
      }
    };

    console.log('🚀 AdminTeacherActivityPage mounted, starting initialization...');
    fetchServerTime(); // Fetch server time first for timezone reference
    fetchTeacherActivities();
    
    const timer = setTimeout(enableFullscreenOnLoad, 500);
    return () => clearTimeout(timer);
  }, []);

  // Updated stats for teacher activities
  const getActivityStats = () => {
    const totalActivities = activities.length;
    const todayActivities = activities.filter(activity => {
      const today = new Date().toDateString();
      const activityDate = new Date(activity.login_time).toDateString();
      return today === activityDate;
    }).length;
    
    const uniqueTeachers = new Set(activities.map(activity => activity.email)).size;
    
    console.log('📈 Calculated stats:', {
      total: totalActivities,
      today: todayActivities,
      unique: uniqueTeachers
    });
    
    return { totalActivities, todayActivities, uniqueTeachers };
  };

  const { totalActivities, todayActivities, uniqueTeachers } = getActivityStats();
  
  const stats = [
    {
      title: 'Total Login Activities',
      value: totalActivities.toString(),
      icon: Activity,
      color: 'bg-blue-500',
      change: '+12.5%'
    },
    {
      title: 'Logins Today',
      value: todayActivities.toString(),
      icon: Users,
      color: 'bg-green-500',
      change: '+8.2%'
    },
    {
      title: 'Unique Teachers',
      value: uniqueTeachers.toString(),
      icon: BookOpen,
      color: 'bg-purple-500',
      change: '+15.3%'
    },
    {
      title: 'Recent Activity',
      value: activities.length > 0 ? 'Active' : 'No Data',
      icon: Clock,
      color: 'bg-orange-500',
      change: activities.length > 0 ? '+5.8%' : '0%'
    }
  ];

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'login', label: 'Login/Logout' },
    { value: 'course', label: 'Course Access' },
    { value: 'test', label: 'Test Activities' },
    { value: 'download', label: 'Downloads' },
    { value: 'video', label: 'Video Watched' }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' }
  ];

  // Filter activities based on search and filters
  const filteredActivities = activities.filter(activity => {
    console.log('🔍 Filtering activity:', activity);
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.teacher_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActivity = selectedActivity === 'all' || 
                           activity.teacher_type.toLowerCase() === selectedActivity.toLowerCase();
    
    let matchesDate = true;
    if (activity.login_time) {
      const dateStr = typeof activity.login_time === 'string' ? activity.login_time.replace(' ', 'T') : activity.login_time;
      const activityDate = new Date(dateStr);
      if (!isNaN(activityDate.getTime())) {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        if (selectedDateRange === 'today') {
          matchesDate = activityDate.toDateString() === today.toDateString();
        } else if (selectedDateRange === 'yesterday') {
          const yesterday = new Date(startOfToday);
          yesterday.setDate(yesterday.getDate() - 1);
          matchesDate = activityDate.toDateString() === yesterday.toDateString();
        } else if (selectedDateRange === 'week') {
          const sevenDaysAgo = new Date(startOfToday);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          matchesDate = activityDate >= sevenDaysAgo;
        } else if (selectedDateRange === 'month') {
          const thirtyDaysAgo = new Date(startOfToday);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          matchesDate = activityDate >= thirtyDaysAgo;
        }
      }
    }
                            
    console.log('🎯 Filter check for:', activity.email, 'Selected:', selectedActivity, 'Teacher type:', activity.teacher_type, 'Date range:', selectedDateRange, 'Matches:', matchesSearch && matchesActivity && matchesDate);
    
    return matchesSearch && matchesActivity && matchesDate;
  });

  // Function to format date and time correctly using server timezone
  const formatDateTime = (dateTimeString) => {
    console.log('🕐 Formatting datetime with server timezone support:', dateTimeString);
    
    if (!dateTimeString) {
      console.error('❌ No datetime string provided');
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }

    try {
      // Parse the datetime string and convert to IST timezone
      const date = new Date(dateTimeString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('❌ Invalid date:', dateTimeString);
        return { date: 'Invalid Date', time: 'Invalid Time' };
      }

      // Convert to IST timezone (Asia/Kolkata) for accurate server time representation
      const istDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      
      const formattedDate = istDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
      
      const formattedTime = istDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
      
      console.log('✅ Formatted datetime with IST timezone:', { 
        original: dateTimeString, 
        date: formattedDate, 
        time: formattedTime,
        timezone: 'IST',
        serverTimeReference: currentServerTime?.timezone || 'IST'
      });
      
      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      console.error('❌ Error formatting datetime:', error, 'for string:', dateTimeString);
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  const getActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'login': return <Users className="w-4 h-4" />;
      case 'course enrolled': return <BookOpen className="w-4 h-4" />;
      case 'test completed': return <FileText className="w-4 h-4" />;
      case 'download': return <Download className="w-4 h-4" />;
      case 'video watched': return <Eye className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (action) => {
    switch (action.toLowerCase()) {
      case 'login': return 'text-green-600 bg-green-100';
      case 'course enrolled': return 'text-blue-600 bg-blue-100';
      case 'test completed': return 'text-purple-600 bg-purple-100';
      case 'download': return 'text-orange-600 bg-orange-100';
      case 'video watched': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Teacher Activity
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Monitor and analyze teacher login activities across the platform
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button 
              onClick={fetchTeacherActivities}
              disabled={loading}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-50'}`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-2`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-4`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Search Activities
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search by name, email, or teacher type..."
                  value={searchTerm}
                  onChange={(e) => {
                    console.log('🔍 Search term changed:', e.target.value);
                    setSearchTerm(e.target.value);
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Teacher Type
              </label>
              <select
                value={selectedActivity}
                onChange={(e) => {
                  console.log('📊 Teacher type filter changed:', e.target.value);
                  setSelectedActivity(e.target.value);
                }}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="all">All Teacher Types</option>
                <option value="super_admin">Super Admin</option>
                <option value="test_teacher">Test Teacher</option>
                <option value="ca_teacher">CA Teacher</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Date Range
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3936C9] focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button className={`w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} border transition-colors`}>
                <Filter className="w-4 h-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Activity Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}
        >
          <div className="overflow-x-auto w-full">
            <div className="max-h-[420px] overflow-y-auto min-w-[800px]">
              <table className="w-full">
                <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Teacher & Type
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Email
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Login Time
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Device & IP
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                {loading ? (
                  <tr>
                    <td colSpan="5" className={`px-6 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Loading teacher activities...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={`px-6 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No teacher activities found
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((activity) => {
                    const { date, time } = formatDateTime(activity.login_time);
                    console.log('🎯 Rendering activity for:', activity.email, 'with enhanced getinfo data:', {
                      datetime: { date, time },
                      device: activity.device_type,
                      location: activity.location,
                      ip: activity.ip_address
                    });
                    
                    return (
                    <motion.tr
                      key={activity.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-blue-100 text-blue-600`}>
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {activity.name}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                              activity.teacher_type === 'super_admin' ? 'bg-red-100 text-red-800' :
                              activity.teacher_type === 'test_teacher' ? 'bg-blue-100 text-blue-800' :
                              activity.teacher_type === 'ca_teacher' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.teacher_type.replace('_', ' ').toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {activity.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {date}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {activity.device_type || 'Unknown Device'}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          IP: {activity.ip_address || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {activity.location || 'Unknown Location'}
                        </div>
                      </td>
                    </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
          
          {/* Scroll indicator for mobile */}
          {filteredActivities.length > 0 && (
            <div className="px-6 py-3 text-center border-t border-gray-200 dark:border-gray-700">
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Scroll horizontally to view all columns • Showing {filteredActivities.length} total activities
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminTeacherActivityPage;