import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react"; // 👈 added for toggle icon

const BASE_URL = import.meta.env.VITE_BASE_URL;

const LoginPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 toggle state
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

  useEffect(() => {
    // Skip session check if redirecting from add-to-cart flow
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      return;
    }

    // Check frontend state instead of backend session to prevent redirect loops
    const user = localStorage.getItem("user") || localStorage.getItem("student_user");
    if (user) {
      console.log("Already logged in frontend");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    // Safety check to ensure page is visible and scrolled correctly
    // This clears any artifacts left by ScrollSmoother if it was killed during navigation
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.body.style.pointerEvents = 'auto';
    
    const smoothWrapper = document.getElementById('smooth-wrapper');
    if (smoothWrapper) {
      smoothWrapper.style.visibility = 'visible';
      smoothWrapper.style.opacity = '1';
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginData = { email, password };
      console.log("Sending student login data:", loginData);
      console.log("Student login timestamp:", new Date().toISOString());

      const res = await fetch(`${BASE_URL}api/Students/validateStudents.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      const data = await res.json();
      console.log("Student login API response:", data);

      if (data.success) {
        console.log("Student activity data being stored:", {
          student_id: data.user.id,
          student_name: data.user.name,
          student_email: data.user.email,
          login_time: new Date().toLocaleString(),
          activity_type: 'login'
        });

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("image", JSON.stringify(data.image));
        localStorage.setItem("user_id", JSON.stringify(data.user.id));

        // Record login activity
        fetch(`${BASE_URL}api/StudentLoginDetect/record_login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: data.user.id })
        }).catch(err => console.error("Activity log failed", err));

        toast({
          title: "Login Successful!",
          description: `Welcome back, ${data.user.first_name || data.user.name || "User"}`,
        });
        
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          navigate("/");
        }
      } else {
        console.log("Student login failed:", data.message);
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Student login error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Try again later.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset password",
        variant: "destructive",
      });
      return;
    }

    setIsForgotPasswordLoading(true);

    try {
      const response = await fetch(`${BASE_URL}api/Students/student_reset_password.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Reset Link Sent",
          description: "Check your mailbox for password reset link",
          duration: 5000,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send reset link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <section className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900 overflow-hidden pointer-events-auto relative z-10">
      {/* Left side: Automatic Image Carousel (70% on desktop) */}
      <div className="hidden lg:block lg:w-[70%] relative overflow-hidden h-screen">
        <ImageCarousel />
      </div>

      {/* Right side: Login Form (30% on desktop) */}
      <div className="w-full lg:w-[30%] h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-4 z-10 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="max-w-md w-full mx-auto space-y-4 lg:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Link to="/" className="flex items-center justify-center mb-2 lg:mb-4">
              <span className="text-2xl lg:text-3xl font-bold text-gradient">
                ANIRBAN'S ACADEMY
              </span>
            </Link>
            <p className="text-xl lg:text-2xl font-bold text-foreground">Welcome Back!</p>
            <p className="mt-1 text-sm lg:text-base text-muted-foreground">
              Sign in to your account
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card p-6 lg:p-8 rounded-xl shadow-lg border dark:border-gray-700"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1 lg:space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 lg:h-10 text-sm"
                />
              </div>

              {/* Password Field with Toggle */}
              <div className="space-y-1 lg:space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isForgotPasswordLoading}
                    className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isForgotPasswordLoading ? "Sending..." : "Forgot password?"}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9 lg:h-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-xs text-muted-foreground"
                >
                  Remember me
                </label>
              </div>

              <Button type="submit" className="w-full h-9 lg:h-10 text-sm">
                Sign in
              </Button>
            </form>
          </motion.div>

          <motion.p
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center text-xs lg:text-sm text-muted-foreground mt-2 lg:mt-4"
          >
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              Sign up
            </Link>
          </motion.p>
        </div>
      </div>
    </section>
  );
};

const ImageCarousel = () => {
  const images = [
    "/bg/bg1.jpg",
    "/bg/bg2.jpg",
    "/bg/bg3.jpg",
    "/bg/bg4.jpg",
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-full">
      {images.map((img, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: currentIndex === index ? 1 : 0 }}
          transition={{ duration: 1.5 }}
        >
          <img
            src={img}
            alt={`Background ${index + 1}`}
            className="w-full h-full object-fill"
          />
          {/* Overlay to ensure text readability if needed, though here it's on the other side */}
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      ))}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              currentIndex === index ? "bg-white w-8" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default LoginPage;
