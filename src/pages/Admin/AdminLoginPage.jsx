import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle, ChevronDown, UserCircle, Smartphone, QrCode, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLoginPage = () => {
  const { login, verify2FA, setup2FADuringLogin, complete2FASetup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState('super_admin');
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [has2FASetup, setHas2FASetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showSuspendedPopup, setShowSuspendedPopup] = useState(false);

  const loginTypes = [
    { value: 'super_admin', label: 'Admin Login', icon: Shield },
    { value: 'test_teacher', label: 'Test Series Teacher Login', icon: UserCircle },
    { value: 'ca_teacher', label: 'Current Affairs Teacher Login', icon: UserCircle }
  ];

  // Auto-enable F11 fullscreen mode on page load
  useEffect(() => {
    const enableF11FullscreenOnLoad = () => {
      try {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!isMobile && !document.fullscreenElement) {
          // Try multiple approaches for fullscreen
          const requestFullscreen = async () => {
            try {
              if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
              } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
              } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
              } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
              }
            } catch (err) {
              console.log('Fullscreen request failed:', err);
              // Try window maximization as fallback
              try {
                window.moveTo(0, 0);
                window.resizeTo(screen.width, screen.height);
              } catch (resizeErr) {
                console.log('Window resize failed:', resizeErr);
              }
            }
          };

          // Try immediate fullscreen
          requestFullscreen();
          
          // Add click listener for user interaction fallback
          const handleFirstClick = async () => {
            if (!document.fullscreenElement) {
              try {
                await requestFullscreen();
              } catch (err) {
                console.log('Click-triggered fullscreen failed:', err);
              }
            }
            document.removeEventListener('click', handleFirstClick);
          };
          
          document.addEventListener('click', handleFirstClick);
          
          // Cleanup function
          return () => {
            document.removeEventListener('click', handleFirstClick);
          };
        }
      } catch (error) {
        console.log('Fullscreen setup error:', error);
      }
    };

    // Execute immediately and set up event listeners
    const cleanup = enableF11FullscreenOnLoad();
    
    return cleanup || (() => {});
  }, []);

  // Toast auto-hide effect
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Login attempt - Data being sent:', { email: formData.email, loginType });
      const result = await login(formData.email, formData.password, loginType); // use AuthContext login
      console.log('Login response:', result);
      if (result.success) {
        // Log the data that will be sent to teacher_activity table
        console.log('🔥 Vulnerable Teacher Activity data:', {
          email: formData.email,
          loginType: loginType,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        if (result.requires2fa) {
          setHas2FASetup(result.has_2fa_setup);
          if (!result.has_2fa_setup) {
            // User needs to setup 2FA - get QR code
            const setupResult = await setup2FADuringLogin();
            if (setupResult.success) {
              setQrCodeUrl(setupResult.qrCodeUrl);
              setSecretKey(setupResult.secret);
            } else {
              setError(setupResult.message || 'Failed to setup 2FA');
              return;
            }
          }
          setShow2FA(true);
        } else {
          navigate('/anirban/dashboard', { replace: true }); // redirect after successful login
        }
      } else {
        if (result.status === 'suspended') {
          setShowSuspendedPopup(true);
        } else {
          setError(result.message || 'Login failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Login error caught:', err);
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();

    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('2FA attempt - Data being sent:', { twoFactorCode, has2FASetup });
      let result;
      if (has2FASetup) {
        // User already has 2FA setup, just verify
        console.log('Verifying existing 2FA with code:', twoFactorCode);
        result = await verify2FA(twoFactorCode);
      } else {
        // User is setting up 2FA for the first time
        console.log('Setting up new 2FA with code:', twoFactorCode);
        result = await complete2FASetup(twoFactorCode);
      }
      console.log('2FA response:', result);
      
      if (result.success) {
        navigate('/anirban/dashboard', { replace: true });
      } else {
        setError(result.message || '2FA verification failed. Please try again.');
      }
    } catch (err) {
      console.error('2FA error caught:', err);
      setError('2FA verification failed. Please try again.');
      console.error('2FA error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could show a success message here if needed
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address in the email field first');
      return;
    }

    // Only allow super_admin to use forgot password
    if (loginType !== 'super_admin') {
      setError('Forgot password is only available for Admin users. Please contact your administrator.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Auth/forgot_password.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          loginType
        })
      });

      const result = await response.json();

      if (result.success) {
        setError('');
        // Show toast notification
        showToastMessage('Password reset link has been sent to your mailbox. Please check your email.');
      } else {
        setError(result.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#8B4513] via-[#CD853F] to-[#D2691E] flex flex-col lg:flex-row overflow-hidden">
      
      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur-sm border border-green-200 rounded-lg shadow-2xl px-4 py-3 md:px-6 md:py-4 max-w-sm md:max-w-md w-[90%] md:w-auto"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm md:text-base font-medium text-green-800 leading-tight">
                {toastMessage}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Left Logo - Overlaying */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="absolute top-2 left-2 md:top-4 md:left-4 z-20 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24"
      >
        <img 
          src="/img/admin panel inside top logo.png" 
          alt="Urban's Academy Logo" 
          className="w-full h-full object-contain drop-shadow-2xl"
        />
      </motion.div>

      {/* Left Side - Background Image (60%) */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="relative w-full lg:w-3/5 h-64 md:h-80 lg:h-full bg-gradient-to-br from-[#8B4513] to-[#CD853F] flex items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{ backgroundImage: "url('/img/admmingg.png')" }}
        ></div>
        
        {/* Bottom Left Text Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-10 text-left space-y-1 md:space-y-2 px-2 md:px-4"
        >
          <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-black shadow-2xl" 
              style={{ textShadow: '0 0 20px rgba(255,255,255,0.8), 2px 2px 4px rgba(0,0,0,0.5)' }}>
            ADMIN PORTAL
          </h1>
          <p className="text-xs md:text-sm lg:text-base xl:text-lg font-semibold text-black shadow-lg"
             style={{ textShadow: '0 0 15px rgba(255,255,255,0.6), 1px 1px 3px rgba(0,0,0,0.4)' }}>
            Just Build Your Concept - Anirban's Academy
          </p>
        </motion.div>
      </motion.div>

      {/* Right Side - Login Form (40%) */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="w-full lg:w-2/5 flex items-center justify-center p-3 md:p-4 lg:p-6 xl:p-8 bg-gradient-to-br from-[#CD853F]/20 to-[#D2691E]/20 lg:bg-transparent"
      >
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center space-x-3 md:space-x-4 mb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-[#DC143C] to-[#FF6347] rounded-full shadow-lg"
              >
                <Shield className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
              </motion.div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-black drop-shadow-lg">WELCOME BACK!</h2>
            </div>
            <p className="text-black text-sm md:text-base">Sign in to access the dashboard</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 border border-orange-200"
          >
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
                >
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm">{error}</span>
                </motion.div>
              )}

              {/* Login Type Dropdown */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-medium text-black">Login As</label>
                <div className="relative">
                  <select
                    value={loginType}
                    onChange={(e) => setLoginType(e.target.value)}
                    className="w-full pl-8 md:pl-10 pr-10 py-2.5 md:py-3 text-sm md:text-base text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-transparent outline-none transition-all appearance-none bg-white cursor-pointer"
                  >
                    {loginTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-medium text-black">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-8 md:pl-10 pr-4 py-2.5 md:py-3 text-sm md:text-base text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-transparent outline-none transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-medium text-black">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-8 md:pl-10 pr-10 md:pr-12 py-2.5 md:py-3 text-sm md:text-base text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-transparent outline-none transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link - Available for All Login Types */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs md:text-sm text-[#DC143C] hover:text-[#B22222] font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#DC143C] to-[#FF6347] text-white py-2.5 md:py-3 text-sm md:text-base rounded-lg font-semibold shadow-lg hover:from-[#B22222] hover:to-[#DC143C] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm md:text-base">Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </form>

            <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-black">
              Authorized personnel only
              {loginType === 'super_admin' && ' - Admin Portal'}
              {loginType === 'test_teacher' && ' - Test Series Teachers'}
              {loginType === 'ca_teacher' && ' - Current Affairs Teachers'}
            </div>
          </motion.div>

          {/* 2FA Verification/Setup Modal */}
          {show2FA && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col"
              >
                <div className="p-4 md:p-6 lg:p-8 overflow-y-auto scrollbar-hide flex-1">
                <form onSubmit={handle2FASubmit} className="space-y-4 md:space-y-6">
                  <div className="text-center mb-4 md:mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-[#DC143C] to-[#FF6347] rounded-full shadow-lg mb-3 md:mb-4">
                      {has2FASetup ? <Smartphone className="w-6 h-6 md:w-8 md:h-8 text-white" /> : <QrCode className="w-6 h-6 md:w-8 md:h-8 text-white" />}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
                      {has2FASetup ? 'Two-Factor Authentication' : 'Setup Two-Factor Authentication'}
                    </h3>
                    <p className="text-sm md:text-base text-black">
                      {has2FASetup 
                        ? 'Enter the 6-digit code from your Google Authenticator app'
                        : 'Scan QR code with Google Authenticator and enter the code'
                      }
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
                    >
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-xs md:text-sm">{error}</span>
                    </motion.div>
                  )}

                  {/* QR Code Section - Only for new setup - Horizontal Layout */}
                  {!has2FASetup && qrCodeUrl && (
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                      {/* QR Code */}
                      <div className="flex-1 w-full">
                        <h4 className="font-semibold text-black mb-2 text-sm md:text-base">Step 1: Scan QR Code</h4>
                        <p className="text-xs md:text-sm text-black mb-3">
                          Open Google Authenticator app and scan this QR code:
                        </p>
                        <div className="flex justify-center mb-4 md:mb-0">
                          <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 border rounded-lg" />
                        </div>
                      </div>

                      {/* Manual Entry */}
                      <div className="flex-1 w-full">
                        <h4 className="font-semibold text-black mb-2 text-sm md:text-base">Step 2: Manual Entry (Alternative)</h4>
                        <p className="text-xs md:text-sm text-black mb-3">
                          Or manually enter this secret key in your authenticator app:
                        </p>
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                          <div className="flex-1 p-2 md:p-3 bg-gray-100 rounded-lg font-mono text-xs break-all">
                            {showSecret ? secretKey : '•'.repeat(32)}
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="p-2 text-black hover:text-black flex-shrink-0"
                          >
                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(secretKey)}
                            className="p-2 text-black hover:text-black flex-shrink-0"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!has2FASetup && qrCodeUrl && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-black mb-2 text-sm md:text-base">Step 3: Enter Verification Code</h4>
                      <p className="text-xs md:text-sm text-black mb-4">
                        After scanning the QR code or adding the secret key, enter the 6-digit code below:
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs md:text-sm font-medium text-black">
                      {has2FASetup ? 'Authentication Code' : 'Verification Code'}
                    </label>
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                        setTwoFactorCode(value);
                        setError('');
                      }}
                      className="w-full px-4 py-2.5 md:py-3 text-sm text-center text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-transparent outline-none transition-all font-mono md:text-xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                      autoComplete="off"
                    />
                    <p className="text-xs text-black text-center">
                      Enter the 6-digit code from your Google Authenticator app
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShow2FA(false);
                        setTwoFactorCode('');
                        setError('');
                        setQrCodeUrl('');
                        setSecretKey('');
                      }}
                      className="flex-1 bg-gray-100 text-black py-2.5 md:py-3 text-sm md:text-base rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || twoFactorCode.length !== 6}
                      className="flex-1 bg-gradient-to-r from-[#DC143C] to-[#FF6347] text-white py-2.5 md:py-3 text-sm md:text-base rounded-lg font-semibold shadow-lg hover:from-[#B22222] hover:to-[#DC143C] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm md:text-base">
                            {has2FASetup ? 'Verifying...' : 'Setting up...'}
                          </span>
                        </div>
                      ) : (
                        has2FASetup ? 'Verify' : 'Login Securely'
                      )}
                    </button>
                  </div>
                </form>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Suspended Account Popup */}
          {showSuspendedPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowSuspendedPopup(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">Account Suspended</h3>
                  <p className="text-black mb-6">
                    Your login credentials have been suspended. Please contact your administrator.
                  </p>
                  <button
                    onClick={() => setShowSuspendedPopup(false)}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-center mt-4 md:mt-6"
          >
            <p className="text-black text-xs md:text-sm">© 2025 Anirban Academy's Admin Portal. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;