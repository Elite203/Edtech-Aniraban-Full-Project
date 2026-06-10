
import React from "react";
import { motion } from "framer-motion";
import { PlayCircle as PlayCircleIcon, XCircle } from 'lucide-react';

const FreeDemoPage = () => {
  return (
    <section className="container mx-auto px-6 py-20 flex flex-col items-center justify-center text-center min-h-[calc(100vh-10rem)]">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
        className="p-8 md:p-12 bg-card rounded-xl shadow-2xl max-w-2xl w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="mb-8"
        >
          <XCircle className="h-24 w-24 md:h-32 md:w-32 text-destructive mx-auto" />
        </motion.div>
        
        <motion.h1 
          className="text-3xl md:text-5xl font-bold mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          NO FREE DEMO VIDEOS AVAILABLE HERE
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          We apologize, but currently, there are no free demo videos available. Please check back later or explore our course offerings.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default FreeDemoPage;
