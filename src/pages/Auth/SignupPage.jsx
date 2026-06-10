import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Eye, EyeOff, X, Check, Mail } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Constant data moved outside components to prevent re-creation and avoid TDZ
const IMAGES = [
  "/bg/bg5.jpg",
  "/bg/bg6.jpg",
  "/bg/bg7.jpg",
  "/bg/bg8.jpg",
];

const PASSWORD_REQUIREMENTS = [
  { id: 1, text: "At least 8 characters", validator: (pwd) => pwd.length >= 8 },
  { id: 2, text: "At least one uppercase letter", validator: (pwd) => /[A-Z]/.test(pwd) },
  { id: 3, text: "At least one lowercase letter", validator: (pwd) => /[a-z]/.test(pwd) },
  { id: 4, text: "At least one number", validator: (pwd) => /[0-9]/.test(pwd) },
  { id: 5, text: "At least one special character", validator: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full">
      {IMAGES.map((img, index) => (
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
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      ))}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {IMAGES.map((_, index) => (
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

const SignupPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP verification state
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempUserId, setTempUserId] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

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

  // Check password strength
  const checkPasswordStrength = () => {
    const passedRequirements = PASSWORD_REQUIREMENTS.filter(req => req.validator(password)).length;
    const percentage = (passedRequirements / PASSWORD_REQUIREMENTS.length) * 100;
    
    if (percentage === 0) return { strength: "None", color: "bg-gray-300" };
    if (percentage < 40) return { strength: "Weak", color: "bg-red-500" };
    if (percentage < 70) return { strength: "Moderate", color: "bg-yellow-500" };
    return { strength: "Strong", color: "bg-green-500" };
  };

  // Timer effect for resend OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle OTP verification
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`${BASE_URL}api/Students/student_mail_verify.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: tempUserId,
          otp: otp
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Email Verified",
          description: "Your account has been successfully verified! Welcome to ANIRBAN'S ACADEMY.",
          duration: 5000,
        });

        // Reset all form states
        setFirstName("");
        setLastName("");
        setEmail("");
        setNumber("");
        setPassword("");
        setConfirmPassword("");
        setOtp("");
        setShowOtpForm(false);
        setTempUserId(null);

        navigate("/login");
      } else {
        toast({
          title: "Verification Failed",
          description: result.error || "Invalid or expired OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      const response = await fetch(`${BASE_URL}api/Students/studentsInsert.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resend_otp: true,
          user_id: tempUserId
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "OTP Resent",
          description: "A new OTP has been sent to your email.",
          duration: 3000,
        });
        setResendTimer(60);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resend OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all password requirements are met
    const unmetRequirements = PASSWORD_REQUIREMENTS
      .filter(req => !req.validator(password))
      .map(req => req.text);

    if (unmetRequirements.length > 0) {
      toast({
        title: "Password Requirements Not Met",
        description: `Your password must include: ${unmetRequirements.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Validate names (no numbers or spaces allowed)
    if (/[0-9\s]/.test(firstName) || /[0-9\s]/.test(lastName)) {
      toast({
        title: "Error",
        description: "Names cannot contain numbers or spaces",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number (exactly 10 digits)
    if (!/^[0-9]{10}$/.test(number)) {
      toast({
        title: "Error",
        description: "Phone number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      number,
    };

    console.log("Signup payload being sent:", payload);

    try {
      const response = await fetch(`${BASE_URL}api/Students/studentsInsert.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code.",
          duration: 4000,
        });

        // Show OTP form and store temp user ID
        setTempUserId(result.user_id);
        setShowOtpForm(true);
        setResendTimer(60);
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to connect to the server.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900 lg:overflow-hidden pointer-events-auto relative z-10">
      {/* Left side: Automatic Image Carousel (70% on desktop) */}
      <div className="hidden lg:block lg:w-[70%] relative overflow-hidden h-screen">
        <ImageCarousel />
      </div>

      {/* Right side: Signup Form (30% on desktop) */}
      <div className="w-full lg:w-[30%] h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-4 z-10 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="max-w-md w-full mx-auto space-y-2 lg:space-y-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-xl lg:text-3xl font-bold text-gradient">Create Account</h1>
            <p className="text-xs lg:text-lg text-muted-foreground">
              Join our community today
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card p-4 lg:p-6 rounded-xl shadow-lg border"
          >
            {!showOtpForm ? (
              <form onSubmit={handleSubmit} className="space-y-2 lg:space-y-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3">
                  <div className="space-y-0.5 lg:space-y-1">
                    <Label htmlFor="first-name" className="text-[10px] lg:text-xs">First Name</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      placeholder="John"
                      className="h-8 lg:h-9 text-sm"
                      onChange={(e) => {
                        const value = e.target.value.replace(/[0-9\s]/g, '');
                        setFirstName(value);
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-0.5 lg:space-y-1">
                    <Label htmlFor="last-name" className="text-[10px] lg:text-xs">Last Name</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      placeholder="Doe"
                      className="h-8 lg:h-9 text-sm"
                      onChange={(e) => {
                        const value = e.target.value.replace(/[0-9\s]/g, '');
                        setLastName(value);
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-0.5 lg:space-y-1">
                  <Label htmlFor="email" className="text-[10px] lg:text-xs">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="mail@example.com"
                    className="h-8 lg:h-9 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-0.5 lg:space-y-1">
                  <Label htmlFor="phone" className="text-[10px] lg:text-xs">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="1234567890"
                    className="h-8 lg:h-9 text-sm"
                    value={number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setNumber(value);
                      }
                    }}
                    maxLength="10"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3">
                  <div className="space-y-0.5 lg:space-y-1">
                    <Label htmlFor="password" title="Password" className="text-[10px] lg:text-xs">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        placeholder="••••••••"
                        className="h-8 lg:h-9 text-sm"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-3 w-3 text-gray-400" /> : <Eye className="h-3 w-3 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-0.5 lg:space-y-1">
                    <Label htmlFor="confirm-password" title="Confirm" className="text-[10px] lg:text-xs">Confirm</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        placeholder="••••••••"
                        className="h-8 lg:h-9 text-sm"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-3 w-3 text-gray-400" /> : <Eye className="h-3 w-3 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </div>

                {password && (
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        Strength: <span className="font-medium">{checkPasswordStrength().strength}</span>
                      </span>
                      <div className="w-1/2 bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${checkPasswordStrength().color}`}
                          style={{ width: `${(PASSWORD_REQUIREMENTS.filter(req => req.validator(password)).length / PASSWORD_REQUIREMENTS.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                      {PASSWORD_REQUIREMENTS.map((req) => (
                        <li key={req.id} className="flex items-center text-[9px] text-muted-foreground leading-none">
                          {req.validator(password) ? (
                            <Check className="h-2 w-2 text-green-500 mr-1 shrink-0" />
                          ) : (
                            <X className="h-2 w-2 text-red-500 mr-1 shrink-0" />
                          )}
                          <span className="truncate">{req.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    required
                  />
                  <div className="ml-2 text-[10px] lg:text-xs">
                    <label htmlFor="terms" className="text-muted-foreground">
                      I agree to the <Link to="/terms-and-conditions" className="text-indigo-600">Terms & Conditions</Link>
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full h-8 lg:h-9 text-sm">
                  Create Account
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerification} className="space-y-3 lg:space-y-4 py-2">
                <div className="text-center space-y-1">
                  <div className="flex justify-center">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                      <Mail className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold">Verify your email</h3>
                  <p className="text-[10px] text-muted-foreground px-4">
                    We've sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="otp" className="text-[10px] lg:text-xs block text-center uppercase tracking-wider font-semibold">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength="6"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setOtp(value);
                    }}
                    className="text-center text-xl h-10 lg:h-12 tracking-[0.5em] font-bold"
                    required
                    autoFocus
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-9 lg:h-10 text-sm" 
                  disabled={isVerifying || otp.length !== 6}
                >
                  {isVerifying ? "Verifying..." : "Verify & Sign Up"}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-[10px] text-muted-foreground">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className="text-[10px] text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50"
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOtpForm(false)}
                    className="block w-full text-[10px] text-muted-foreground hover:text-foreground underline"
                  >
                    Change email address
                  </button>
                </div>
              </form>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center text-[10px] lg:text-xs text-muted-foreground"
          >
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-medium">
              Sign in
            </Link>
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default SignupPage;
