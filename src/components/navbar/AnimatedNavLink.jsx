
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const AnimatedNavLink = ({ to, children, className }) => {
  const navLinkClasses = ({ isActive }) =>
    `px-2 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-accent hover:text-accent-foreground"
    } ${className || ''}`;

  return (
    <motion.div
      className="heartbeat-animation"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <NavLink to={to} className={navLinkClasses}>
        {children}
      </NavLink>
    </motion.div>
  );
};

export default AnimatedNavLink;
