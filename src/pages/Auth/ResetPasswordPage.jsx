import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [adminName, setAdminName] = useState('');
  const [redirectCounter, setRedirectCounter] = useState(5);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
      return;
    }

    // Verify token
    const verifyToken = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Auth/reset_password.php?token=${token}`);
        const result = await response.json();
        
        if (result.success) {
          setTokenValid(true);
          setAdminName(result.admin.name);
        } else {
          setTokenValid(false);
          setError(result.message);
        }
      } catch (err) {
        setTokenValid(false);
        setError('Failed to verify reset token');
      }
    };

    verifyToken();
  }, [token]);

  useEffect(() => {
    if (success && redirectCounter > 0) {
      const timer = setTimeout(() => {
        setRedirectCounter(redirectCounter - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && redirectCounter === 0) {
      navigate('/anirban/login');
    }
  }, [success, redirectCounter, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Auth/reset_password.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#8B4513] via-[#CD853F] to-[#D2691E] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg md:text-xl">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#8B4513] via-[#CD853F] to-[#D2691E] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/anirban/login')}
            className="w-full bg-gradient-to-r from-[#DC143C] to-[#FF6347] text-white py-3 rounded-lg font-semibold shadow-lg hover:from-[#B22222] hover:to-[#DC143C] transition-all duration-200"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#8B4513] via-[#CD853F] to-[#D2691E] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Password Changed Successfully!</h2>
          <p className="text-gray-600 mb-4">Your password has been updated and a confirmation email has been sent.</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              You will be automatically redirected to the login page in <strong>{redirectCounter}</strong> seconds.
            </p>
          </div>
          <button
            onClick={() => navigate('/anirban/login')}
            className="w-full bg-gradient-to-r from-[#DC143C] to-[#FF6347] text-white py-3 rounded-lg font-semibold shadow-lg hover:from-[#B22222] hover:to-[#DC143C] transition-all duration-200"
          >
            Go to Login Now
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#8B4513] via-[#CD853F] to-[#D2691E] flex flex-col lg:flex-row overflow-hidden">
      
      {/* Top Left Logo */}
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

      {/* Left Side - Background Image */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="relative w-full lg:w-3/5 h-64 md:h-80 lg:h-full bg-gradient-to-br from-[#8B4513] to-[#CD853F] flex items-center justify-center overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{ backgroundImage: "url('/img/admmingg.png')" }}
        ></div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-10 text-left space-y-1 md:space-y-2 px-2 md:px-4"
        >
          <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-black shadow-2xl" 
              style={{ textShadow: '0 0 20px rgba(255,255,255,0.8), 2px 2px 4px rgba(0,0,0,0.5)' }}>
            RESET PASSWORD
          </h1>
          <p className="text-xs md:text-sm lg:text-base xl:text-lg font-semibold text-black shadow-lg"
             style={{ textShadow: '0 0 15px rgba(255,255,255,0.6), 1px 1px 3px rgba(0,0,0,0.4)' }}>
            Secure Your Admin Account
          </p>
        </motion.div>
      </motion.div>

      {/* Right Side - Reset Form */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="w-full lg:w-2/5 flex items-center justify-center p-3 md:p-4 lg:p-6 xl:p-8 bg-gradient-to-br from-[#CD853F]/20 to-[#D2691E]/20 lg:bg-transparent"
      >
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-[#DC143C] to-[#FF6347] rounded-full shadow-lg mb-3 md:mb-4"
            >
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </motion.div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-lg">RESET PASSWORD</h2>
            <p className="text-orange-100 text-sm md:text-base">Welcome back, {adminName}</p>
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
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="text-xs md:text-sm">{error}</span>
                </motion.div>
              )}

              {/* New Password Field */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 md:pl-10 pr-12 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-transparent outline-none transition-all"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-8 md:pl-10 pr-12 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC143C] focus:border-transparent outline-none transition-all"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                  </button>
                </div>
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
                    <span className="text-sm md:text-base">Updating Password...</span>
                  </div>
                ) : (
                  'Update Password'
                )}
              </motion.button>
            </form>

            <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-600">
              <button
                onClick={() => navigate('/anirban/login')}
                className="text-[#DC143C] hover:text-[#B22222] font-medium transition-colors"
              >
                Back to Login
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-center mt-4 md:mt-6"
          >
            <p className="text-orange-100 text-xs md:text-sm">© 2025 Anirban Academy's Admin Portal. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;