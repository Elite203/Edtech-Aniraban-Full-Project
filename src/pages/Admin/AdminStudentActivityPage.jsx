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
  GraduationCap
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';

const AdminStudentActivityPage = () => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentServerTime, setCurrentServerTime] = useState(null);

  const buildUrl = (path) => `${import.meta.env.VITE_BACKEND_URL}${path}`;

  // Fetch current server time using getinfo.php for accurate timezone formatting
  const fetchServerTime = async () => {
    console.log('🕐 Fetching server time from getinfo.php for accurate student activity timezone handling...');
    try {
      const response = await fetch(buildUrl('/api/Utils/getinfo.php'));
      const data = await response.json();
      
      console.log('⏰ Server time response for student activities:', data);
      
      if (data.dateTimeDetails) {
        setCurrentServerTime(data.dateTimeDetails);
        console.log('✅ Student activity server timezone info updated:', {
          timezone: data.dateTimeDetails.timezone,
          time12Hour: data.dateTimeDetails.time12Hour,
          fullDate: data.dateTimeDetails.fullDate
        });
      }
    } catch (error) {
      console.error('❌ Error fetching server time for student activities:', error);
    }
  };

  // Fetch student activities from database
  const fetchStudentActivities = async () => {
    console.log('🔍 Fetching student activities from database...');
    setLoading(true);
    
    try {
      const response = await fetch(buildUrl('/api/Dashboard/student_activity.php'));
      const data = await response.json();
      
      console.log('📊 Student activities response:', data);
      
      if (data.success) {
        console.log('✅ Successfully fetched', data.data.length, 'student activities');
        
        // Log first activity to show enhanced getinfo integration
        if (data.data.length > 0) {
          console.log('📱 Sample student activity with getinfo integration:', {
            email: data.data[0].email,
            device_type: data.data[0].device_type,
            location: data.data[0].location,
            ip_address: data.data[0].ip_address
          });
        }
        
        setActivities(data.data);
      } else {
        console.error('❌ Failed to fetch student activities:', data.message);
        setActivities([]);
      }
    } catch (error) {
      console.error('💥 Error fetching student activities:', error);
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

    console.log('🚀 AdminStudentActivityPage mounted, starting initialization...');
    fetchServerTime(); // Fetch server time first for timezone reference
    fetchStudentActivities();
    
    const timer = setTimeout(enableFullscreenOnLoad, 500);
    return () => clearTimeout(timer);
  }, []);

  // Updated stats for student activities
  const getActivityStats = () => {
    const totalActivities = activities.length;
    const todayActivities = activities.filter(activity => {
      const today = new Date().toDateString();
      const activityDate = new Date(activity.login_time).toDateString();
      return today === activityDate;
    }).length;
    
    const uniqueStudents = new Set(activities.map(activity => activity.email)).size;
    
    console.log('📈 Calculated student stats:', {
      total: totalActivities,
      today: todayActivities,
      unique: uniqueStudents
    });
    
    return { totalActivities, todayActivities, uniqueStudents };
  };

  const { totalActivities, todayActivities, uniqueStudents } = getActivityStats();
  
  const stats = [
    {
      title: 'Total Student Logins',
      value: totalActivities.toString(),
      icon: Activity,
      color: 'bg-blue-500',
      change: '+12.5%'
    },
    {
      title: 'Logins Today',
      value: todayActivities.toString(),
      icon: GraduationCap,
      color: 'bg-green-500',
      change: '+8.2%'
    },
    {
      title: 'Unique Students',
      value: uniqueStudents.toString(),
      icon: Users,
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

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Filter activities based on search and filters
  const filteredActivities = activities.filter(activity => {
    console.log('🔍 Filtering student activity:', activity);
    
    const matchesSearch = activity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.device_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    console.log('🎯 Filter check for student:', activity.email, 'Matches search:', matchesSearch);
    
    return matchesSearch;
  });

  // Function to format date and time correctly using server timezone for student activities
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return { date: 'Invalid Date', time: 'Invalid Time' };

    try {
      // The server already sends time in IST format (YYYY-MM-DD HH:MM:SS)
      // Parsing it directly as local time
      const dateObj = new Date(dateTimeString.replace(' ', 'T'));
      
      const formattedDate = dateObj.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      const formattedTime = dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      
      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      console.error('❌ Error formatting student activity datetime:', error);
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  const getActionIcon = () => {
    return <Users className="w-4 h-4" />;
  };

  const getActionColor = () => {
    return 'text-green-600 bg-green-100';
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Student Activity
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Monitor and analyze student login activities across the platform
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button 
              onClick={fetchStudentActivities}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Search Activities
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search by name, email, or device..."
                  value={searchTerm}
                  onChange={(e) => {
                    console.log('🔍 Student search term changed:', e.target.value);
                    setSearchTerm(e.target.value);
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-[#3936C9] focus:border-transparent`}
                />
              </div>
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

        {/* Activities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border w-full overflow-hidden`}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Student Activities
            </h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Showing {filteredActivities.length} of {activities.length} activities
            </p>
          </div>

          <div className="overflow-x-auto w-full">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-[#3936C9] border-t-transparent rounded-full animate-spin"></div>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading activities...</span>
                </div>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center p-12">
                <Activity className={`w-12 h-12 mx-auto ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No activities found</p>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {activities.length === 0 ? 'No student activities recorded yet.' : 'Try adjusting your search filters.'}
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto min-w-[800px]">
                <table className="w-full">
                  <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} sticky top-0`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-[10px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Student</th>
                      <th className={`px-4 py-3 text-left text-[10px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Activity</th>
                      <th className={`px-4 py-3 text-left text-[10px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Device</th>
                      <th className={`px-4 py-3 text-left text-[10px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Location</th>
                      <th className={`px-4 py-3 text-left text-[10px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>IP Address</th>
                      <th className={`px-4 py-3 text-left text-[10px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredActivities.map((activity, index) => {
                      const { date, time } = formatDateTime(activity.login_time);
                      return (
                        <tr key={activity.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              {activity.profile_picture ? (
                                <img 
                                  src={activity.profile_picture} 
                                  alt={activity.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`w-8 h-8 bg-[#3936C9] rounded-full flex items-center justify-center ${
                                  activity.profile_picture ? 'hidden' : ''
                                }`}
                              >
                                <span className="text-white font-semibold text-[10px]">
                                  {activity.name ? activity.name.charAt(0).toUpperCase() : 'S'}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {activity.name || 'Unknown Student'}
                                </div>
                                <div className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {activity.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getActionColor()}`}>
                              {getActionIcon()}
                              <span className="ml-1">Login</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className={`text-[10px] ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {activity.device_type || 'Unknown Device'}
                            </div>
                            <div className={`text-[9px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {activity.browser || 'Unknown Browser'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className={`text-[10px] ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {activity.location || 'Unknown Location'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className={`text-[10px] font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {activity.ip_address || 'Unknown IP'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className={`text-[10px] ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {date}
                            </div>
                            <div className={`text-[9px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {time}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminStudentActivityPage;