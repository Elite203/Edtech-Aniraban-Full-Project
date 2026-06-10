import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const useAutoLogout = (timeoutMinutes = 5) => {
  const navigate = useNavigate();
  const { showSessionExpired } = useAuth();
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const logout = useCallback(() => {
    // Clear any existing tokens
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('isAuthenticated');
    
    // Show logout message using custom popup via context
    showSessionExpired();
  }, [showSessionExpired]);

  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only set timeout if timeoutMinutes is valid
    if (timeoutMinutes && timeoutMinutes > 0) {
      timeoutRef.current = setTimeout(() => {
        logout();
      }, timeoutMinutes * 60 * 1000); // Convert minutes to milliseconds
    }
  }, [timeoutMinutes, logout]);

  const handleActivity = useCallback((event) => {
    // Reset timeout on any user activity
    resetTimeout();
  }, [resetTimeout]);

  useEffect(() => {
    // Only initialize if timeoutMinutes is valid
    if (!timeoutMinutes || timeoutMinutes <= 0) {
      return;
    }

    // List of events to track for user activity
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    // Add event listeners for activity tracking
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Set initial timeout
    resetTimeout();

    // Cleanup function
    return () => {
      // Remove event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleActivity, resetTimeout, timeoutMinutes]);

  // Update timeout when timeoutMinutes changes
  useEffect(() => {
    if (timeoutMinutes && timeoutMinutes > 0) {
      resetTimeout();
    } else {
      // Clear timeout if timeoutMinutes becomes invalid
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [timeoutMinutes, resetTimeout]);

  return {
    resetTimeout,
    logout
  };
};

export default useAutoLogout;