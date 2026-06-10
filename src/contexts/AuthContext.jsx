import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const showSessionExpired = () => {
    setSessionExpired(true);
  };

  const closeSessionExpired = () => {
    setSessionExpired(false);
    logout();
  };

  const buildUrl = (path) => `${import.meta.env.VITE_BACKEND_URL}${path}`;

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      
      // Skip authentication check for login and reset-password routes
      if (location.pathname === '/anirban/login' || location.pathname.includes('/anirban/reset-password')) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await axios.post(buildUrl('/api/Auth/admin_auth.php'), { action: 'check_session' });
        if (res.data.success && res.data.logged_in) {
          setAdminUser(res.data.data);
        } else {
          setAdminUser(null);
          navigate('/anirban/login', { replace: true });
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setAdminUser(null);
        navigate('/anirban/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate, location.pathname]);

  const login = async (email, password, loginType = 'super_admin') => {
    setLoading(true);
    try {
      const res = await axios.post(buildUrl('/api/Auth/admin_auth.php'), { action: 'login', email, password, loginType });
      if (res.data.success) {
        if (res.data.requires_2fa) {
          return { success: true, requires2fa: true, has_2fa_setup: res.data.has_2fa_setup };
        } else {
          setAdminUser(res.data.data);
          return { success: true };
        }
      } else {
        return { 
          success: false, 
          message: res.data.message || 'Login failed',
          status: res.data.status 
        };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (code) => {
    setLoading(true);
    try {
      const res = await axios.post(buildUrl('/api/Auth/two_factor_auth.php'), { action: 'verify_2fa', code });
      if (res.data.success) {
        setAdminUser(res.data.data);
        return { success: true };
      } else {
        return { success: false, message: res.data.message || '2FA verification failed' };
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const setup2FADuringLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(buildUrl('/api/Auth/two_factor_auth.php'), { action: 'setup_2fa_during_login' });
      if (res.data.success) {
        return { success: true, secret: res.data.secret, qrCodeUrl: res.data.qr_code_url };
      } else {
        return { success: false, message: res.data.message || 'Failed to setup 2FA' };
      }
    } catch (err) {
      console.error('2FA setup error:', err);
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const complete2FASetup = async (code) => {
    setLoading(true);
    try {
      const res = await axios.post(buildUrl('/api/Auth/two_factor_auth.php'), { action: 'complete_2fa_setup', code });
      if (res.data.success) {
        setAdminUser(res.data.data);
        return { success: true };
      } else {
        return { success: false, message: res.data.message || '2FA setup failed' };
      }
    } catch (err) {
      console.error('2FA setup completion error:', err);
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post(buildUrl('/api/Auth/admin_auth.php'), { action: 'logout' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAdminUser(null);
      setLoading(false);
      navigate('/anirban/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ adminUser, loading, login, logout, verify2FA, setup2FADuringLogin, complete2FASetup, sessionExpired, showSessionExpired, closeSessionExpired }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
