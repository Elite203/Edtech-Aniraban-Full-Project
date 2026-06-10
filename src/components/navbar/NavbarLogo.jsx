
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NavbarLogo = () => {
  return (
    <Link to="/" className="flex items-center">
      <motion.div whileHover={{ scale: 1.4, rotate: 3 }}>
        <img  alt="Anirban's Academy Logo" className="h-20 w-auto mr-2" src="/img/logo.webp" loading="lazy" />
      </motion.div>
      <span className="text-2xl font-bold text-gradient uppercase tracking-tight logo-name">
        ANIRBAN'S ACADEMY
      </span>
    </Link>
  );
};

export default NavbarLogo;
