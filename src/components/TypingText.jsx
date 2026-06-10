import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

const TypingText = ({
  text,
  speed = 50,
  loop = false,
  onScroll = false,
  className = "",
  initialDelay = 0,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const timeoutRef = useRef(null);
  const charIndexRef = useRef(0);
  const isTypingRef = useRef(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: !loop });

  const clearTyping = () => {
    clearTimeout(timeoutRef.current);
    setDisplayedText("");
    charIndexRef.current = 0;
    isTypingRef.current = false;
  };

  const startTyping = () => {
    if (isTypingRef.current) return;
    isTypingRef.current = true;

    const type = () => {
      if (charIndexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(charIndexRef.current));
        charIndexRef.current += 1;
        timeoutRef.current = setTimeout(type, speed);
      } else if (loop) {
        timeoutRef.current = setTimeout(() => {
          clearTyping();
          startTyping();
        }, 1500);
      }
    };

    type();
  };

  useEffect(() => {
    if (onScroll && !isInView) return;

    const delay = setTimeout(() => {
      clearTyping();
      startTyping();
    }, initialDelay);

    return () => {
      clearTimeout(delay);
      clearTyping();
    };
  }, [text, speed, loop, onScroll, isInView, initialDelay]);

  return (
    <motion.span ref={containerRef} className={`${className} typing-cursor`}>
      {displayedText}
    </motion.span>
  );
};

export default TypingText;
