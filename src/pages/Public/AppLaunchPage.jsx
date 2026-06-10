
import React from "react";
import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";

const AppLaunchPage = () => {
  return (
    <section className="container mx-auto px-6 py-20 flex flex-col items-center justify-center text-center min-h-[calc(100vh-10rem)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0, 0.71, 0.2, 1.01] }}
        className="p-8 md:p-12 bg-card rounded-xl shadow-2xl max-w-2xl w-full"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
          className="mb-8 inline-block"
        >
          <Smartphone className="h-24 w-24 md:h-32 md:w-32 text-primary" />
        </motion.div>
        
        <motion.h1 
          className="text-3xl md:text-5xl font-bold mb-6 zoomin-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          We will launch our mobile application soon..
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Stay tuned for an enhanced learning experience on the go! Our team is working hard to bring ANIRBAN'S ACADEMY to your fingertips.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default AppLaunchPage;
