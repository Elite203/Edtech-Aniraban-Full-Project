import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FullscreenViolation = ({ isVisible, onReturn }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      if (!audioRef.current) {
        audioRef.current = new Audio('/Violation.mp3');
        audioRef.current.loop = true;
      }
      audioRef.current.play().catch(err => console.warn("Audio play blocked:", err));
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] bg-black/95 flex flex-col items-center justify-center text-center text-white p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full"
          >
            <motion.h2 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-red-500 text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter"
            >
              ⚠️ SECURITY VIOLATION
            </motion.h2>
            
            <div className="space-y-4 mb-10">
              <p className="text-xl md:text-2xl font-medium">You attempted to exit the secure environment.</p>
              <p className="text-lg md:text-xl text-gray-400">This incident has been logged and reported to the proctor.</p>
            </div>

            <button
              onClick={onReturn}
              className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 text-xl font-bold rounded-md transition-colors shadow-[0_0_20px_rgba(220,38,38,0.5)] active:scale-95"
            >
              RETURN TO EXAM
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullscreenViolation;
