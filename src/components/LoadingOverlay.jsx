import React from 'react';
import { motion } from 'framer-motion';

const LoadingOverlay = ({ isVisible }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const dotVariants = {
    hidden: { y: 0, opacity: 1 },
    visible: (i) => ({
      y: [-30, 0, -30],
      opacity: 1,
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'mirror',
        delay: i * 0.2 - 0.4,
        ease: 'easeInOut'
      }
    })
  };

  return (
    <motion.div
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={containerVariants}
      transition={{ duration: 0.2 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isVisible ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md' : 'pointer-events-none'
      }`}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <div className="flex justify-center items-center gap-2.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={dotVariants}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400"
          />
        ))}
      </div>
    </motion.div>
  );
};

export default LoadingOverlay;