import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      const isMobileNow = window.innerWidth < 1024;
      setIsMobile(isMobileNow);
      if (isMobileNow) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Force disable smooth scroll for dashboard
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.documentElement.style.scrollBehavior = '';
      document.body.style.scrollBehavior = '';
    };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Fixed/Sticky Navbar at top */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      
      <div className="flex relative">
        {/* Mobile Toggle Button - Visible only when sidebar is closed on mobile */}
        {isMobile && !isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={toggleSidebar}
            className="fixed top-24 left-4 z-50 p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/40 lg:hidden border-2 border-white dark:border-slate-800"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        )}

        {/* Fixed Sidebar container */}
        <aside 
          className={`
            fixed top-20 bottom-0 left-0 z-40
            transition-all duration-300 ease-in-out
            bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
            border-r border-slate-200 dark:border-slate-800
            ${isSidebarOpen ? 'w-64' : 'w-20'}
            ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          `}
        >
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
          />
        </aside>

        {/* Backdrop for Mobile Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden mt-20"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content Area - Native Scroll */}
        <main 
          className={`
            flex-1 min-w-0 transition-all duration-300
            ${isMobile ? 'ml-0' : (isSidebarOpen ? 'ml-64' : 'ml-20')}
          `}
        >
          <div className="flex flex-col min-h-[calc(100vh-5rem)]">
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
              <Outlet context={{ isSidebarOpen, isMobile }} />
            </div>
            
            {/* Footer at the end of content */}
            <div className="mt-auto border-t border-slate-200 dark:border-slate-800">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
