
import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Target, CheckCircle, BookMarked } from "lucide-react";

const stats = [
  {
    icon: <Target className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
    value: 90,
    label: "Concept Study",
    description: "Focus on deep understanding"
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
    value: 97,
    label: "Success Rate",
    description: "Proven track record of results"
  },
  {
    icon: <BookMarked className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
    value: 100,
    label: "Syllabus Covered",
    description: "Comprehensive exam preparation"
  }
];

const AnimatedCounter = ({ value, delay, inView }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const count = useMotionValue(0);

  useEffect(() => {
    const unsubscribe = count.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });

    if (inView) {
      // Reset to 0 when coming into view
      count.set(0);
      setDisplayValue(0);
      
      const timer = setTimeout(() => {
        const controls = animate(count, value, { duration: 2 });
        return () => controls.stop();
      }, delay);
      
      return () => {
        clearTimeout(timer);
        unsubscribe();
      };
    } else {
      // Reset to 0 when out of view
      count.set(0);
      setDisplayValue(0);
    }
    
    return () => unsubscribe();
  }, [count, value, delay, inView]);

  return <span>{displayValue}%</span>;
};

const StatsSection = () => {
  const [inView, setInView] = useState(false);

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              onViewportEnter={() => setInView(true)}
              onViewportLeave={() => setInView(false)}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-lg p-4 shadow-sm border text-center"
            >
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                  {stat.icon}
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold mb-1">
                <AnimatedCounter value={stat.value} delay={index * 100} inView={inView} />
              </p>
              <p className="text-sm sm:text-md font-medium text-card-foreground mb-0.5">{stat.label}</p>
              <p className="text-muted-foreground text-xs sm:text-sm">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
