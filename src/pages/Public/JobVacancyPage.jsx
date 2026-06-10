import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

const JobVacancyPage = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <Briefcase className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 text-white" />
        <motion.h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 zoom-in-text-animation"
        >
          Job Vacancy Section Coming Soon..
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          We're building a comprehensive job portal to connect you with exciting career opportunities. Stay tuned for the latest job openings, notifications, and career guidance.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-10"
        >
          <p className="text-blue-200">Your dream job awaits!</p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default JobVacancyPage;