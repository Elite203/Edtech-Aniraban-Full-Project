import React from 'react';
import { motion } from 'framer-motion';
import { FileQuestion } from 'lucide-react';

const AskDoubtPage = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-gradient-to-br from-green-500 via-emerald-500 to-lime-500 p-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <FileQuestion className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 text-white" />
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 zoom-in-text-animation"
        >
          Ask Doubt Section Coming Soon..
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          We're developing an interactive doubt clearing platform where you can ask questions, get instant answers, and connect with expert faculty members for personalized guidance.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-10"
        >
          <p className="text-green-200">Clear your doubts, achieve your goals!</p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AskDoubtPage;