import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  User, 
  ShoppingCart, 
  Bookmark, 
  MessageSquare, 
  LogOut,
  BookOpen,
  X,
  Menu,
  BarChart,
  ChevronRight,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ isOpen, onToggle }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const authContext = useAuth();
  const [storedUser, setStoredUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const syncLocalUser = () => {
      const localUser = localStorage.getItem("user");
      if (!localUser) {
        setStoredUser(null);
        return;
      }
      try {
        setStoredUser(JSON.parse(localUser));
      } catch (error) {
        console.error("Failed to parse local user:", error);
        setStoredUser(null);
      }
    };

    syncLocalUser();
    window.addEventListener("storage", syncLocalUser);
    return () => window.removeEventListener("storage", syncLocalUser);
  }, []);

  const user = useMemo(() => {
    if (authContext?.adminUser) return authContext.adminUser;
    return storedUser;
  }, [authContext, storedUser]);

  const fetchUserData = async () => {
    if (!storedUser?.id) return;
    try {
      const response = await axios.get(`${BASE_URL}api/Students/get_student_profile.php?id=${storedUser.id}`);
      if (response.data.success) {
        const userData = response.data.student;
        const timestamp = new Date().getTime();
        const photoUrl = userData.id
          ? `${BASE_URL}api/Students/get_student_photo.php?id=${userData.id}&t=${timestamp}`
          : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        setUserProfile({ ...userData, profilePic: photoUrl });
      }
    } catch (error) {
      console.error('Error fetching user profile in sidebar:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [storedUser]);

  const handleLogout = async () => {
    if (typeof authContext?.logout === "function" && authContext?.adminUser) {
      await authContext.logout();
      return;
    }
    try {
      await fetch(`${BASE_URL}api/Auth/logout.php`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("user");
    setStoredUser(null);
    setUserProfile(null);
    toast({
      title: "Logged out successfully",
      description: "You've been securely logged out.",
    });
    navigate("/");
  };

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', path: '/dashboard/profile', label: 'My Profile', icon: User },
    { id: 'orders', path: '/dashboard/orders', label: 'Purchases', icon: ShoppingCart },
    { id: 'bookmarks', path: '/dashboard/bookmarks', label: 'Saved Items', icon: Bookmark },
    { id: 'report', path: '/dashboard/report', label: 'Analytics', icon: BarChart },
    { id: 'reviews', path: '/dashboard/reviews', label: 'My Reviews', icon: MessageSquare },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header with Toggle */}
      <div className={`p-4 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} border-b border-slate-100 dark:border-slate-800`}>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-sm uppercase">User Panel</span>
          </motion.div>
        )}
        <button 
          onClick={onToggle}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
          aria-label={isOpen ? "Collapse" : "Expand"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => `
                group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }
                ${!isOpen && 'justify-center'}
              `}
              title={!isOpen ? item.label : ''}
            >
              <Icon className={`w-5 h-5 min-w-[1.25rem] ${!isOpen && 'group-hover:scale-110 transition-transform'}`} />
              {isOpen && (
                <span className="text-sm font-semibold whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
              {isOpen && (
                <ChevronRight className={`ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity`} />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'} mb-4`}>
          <div className="relative group cursor-pointer" onClick={() => navigate('/dashboard/profile')}>
            <img
              src={userProfile?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="Profile"
              className="w-10 h-10 min-w-[2.5rem] rounded-xl object-cover ring-2 ring-transparent group-hover:ring-blue-500 transition-all"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-none mb-1">
                {user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "User"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                {user?.email || "No email"}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-2 py-2.5 rounded-xl transition-all duration-200
              ${isOpen 
                ? 'px-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20' 
                : 'justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10'
              }
            `}
            title={!isOpen ? "Logout" : ''}
          >
            <LogOut className="w-4 h-4" />
            {isOpen && <span className="text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}