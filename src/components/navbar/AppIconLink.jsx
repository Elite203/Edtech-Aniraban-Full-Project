
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AppIconLink = ({ to, iconSrc, altText, className }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`flex items-center ${className || ''}`}
    >
      <Link to={to} aria-label={altText}>
        <img src={iconSrc} alt={altText} className="h-6 w-6 sm:h-7 sm:w-7 object-contain" />
      </Link>
    </motion.div>
  );
};

export default AppIconLink;
