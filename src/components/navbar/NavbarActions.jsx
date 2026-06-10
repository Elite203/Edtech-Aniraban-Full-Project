import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Moon,
  Sun,
  ShoppingCart,
  User,
  LayoutDashboard,
  ShoppingBag,
  Bookmark,
  Star,
  LogOut,
  BarChart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const NavbarActions = ({ theme, setTheme, cartItemCount, onCartClick }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [storedUser, setStoredUser] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const authContext = useAuth();

  const [premiumExpiry, setPremiumExpiry] = useState(localStorage.getItem('premium_monthly_test_expiry'));
  const isPremium = premiumExpiry && new Date(premiumExpiry) > new Date();

  useEffect(() => {
    if (storedUser && storedUser.id) {
      const fetchSubscription = async () => {
        try {
          const BASE_URL = import.meta.env.VITE_BASE_URL;
          const response = await fetch(`${BASE_URL}api/CurrentAffairs/get_monthly_test_purchase.php?student_id=${storedUser.id}`);
          const data = await response.json();
          if (data.status === 'success' && data.data) {
            const orderData = data.data;
            if (orderData.is_active && orderData.expiry_date) {
              localStorage.setItem('premium_monthly_test_expiry', orderData.expiry_date);
              setPremiumExpiry(orderData.expiry_date);
            } else {
              localStorage.removeItem('premium_monthly_test_expiry');
              setPremiumExpiry(null);
            }
          } else {
            localStorage.removeItem('premium_monthly_test_expiry');
            setPremiumExpiry(null);
          }
        } catch (error) {
          console.error("Error syncing premium status:", error);
        }
      };
      fetchSubscription();
    } else {
      setPremiumExpiry(null);
    }
  }, [storedUser]);

  useEffect(() => {
    const syncLocalUser = () => {
      const localUser = localStorage.getItem("user") || localStorage.getItem("student_user");
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

    return () => {
      window.removeEventListener("storage", syncLocalUser);
    };
  }, []);

  const user = useMemo(() => {
    if (authContext?.adminUser) {
      return authContext.adminUser;
    }
    return storedUser;
  }, [authContext, storedUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (typeof authContext?.logout === "function" && authContext?.adminUser) {
      await authContext.logout();
      return;
    }

    try {
      await fetch(`${window.location.origin}/api/Auth/logout.php`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("user");
    localStorage.removeItem("student_user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("premium_monthly_test_expiry");
    setStoredUser(null);
    setPremiumExpiry(null);
    setShowProfileMenu(false);

    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });

    navigate("/");
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>

      <div className="relative">
        <Button variant="ghost" size="icon" onClick={onCartClick} aria-label="View Cart">
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Button>
      </div>

      {user ? (
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="User Profile"
          >
            <User className="h-5 w-5" />
          </Button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-[min(15rem,calc(100vw-1rem))] bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User"}
                    </p>
                    {isPremium && (
                      <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex-shrink-0">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email || "No email added"}</p>
                  <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">Track your progress and manage account</p>
                </div>


                <div className="flex flex-col p-2 space-y-1">
                  <Link to="/dashboard" onClick={() => setShowProfileMenu(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/dashboard/profile" onClick={() => setShowProfileMenu(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Link to="/dashboard/orders" onClick={() => setShowProfileMenu(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Orders
                    </Button>
                  </Link>
                  <Link to="/dashboard/bookmarks" onClick={() => setShowProfileMenu(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Bookmark
                    </Button>
                    <Link to="/dashboard/report" onClick={() => setShowProfileMenu(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <BarChart className="h-4 w-4 mr-2" />
                        Report
                      </Button>
                    </Link>
                  </Link>
                  <Link to="/dashboard/reviews" onClick={() => setShowProfileMenu(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Star className="h-4 w-4 mr-2" />
                      Reviews
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="hidden lg:flex items-center space-x-2">
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link to="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      )}
    </>
  );
};

export default NavbarActions;
