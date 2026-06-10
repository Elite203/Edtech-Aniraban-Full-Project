
import React from "react";
import { motion } from "framer-motion";

const WaveText = ({ text, className = "" }) => {
  return (
    <span className={`wave-text ${className}`}>
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
};

export default WaveText;
