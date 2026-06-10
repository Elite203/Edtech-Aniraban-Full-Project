
import React from "react";
import { animate, motion, useMotionValue, useTransform, useInView } from "framer-motion";
import { Award, Users, BookOpen, Clock } from "lucide-react";
import { useEffect, useState } from "react";


const achievementsData = [
  { icon: <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />, value: 500, suffix: "+", label: "Students Taught" },
  { icon: <Award className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />, value: 100, suffix: "+", label: "Success Stories" },
  { icon: <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />, value: 200, suffix: "+", label: "Courses Offered" },
  { icon: <Clock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />, value: 10, suffix: "+", label: "Years of Excellence" }
];

const AnimatedCounter = ({ value, suffix, isInView }) => {
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { 
        duration: 2, 
        ease: "easeOut",
        onUpdate: (latest) => {
          setDisplayValue(Math.round(latest));
        }
      });
      return () => controls.stop();
    } else {
      count.set(0);
      setDisplayValue(0);
    }
  }, [isInView, value, count]);

  return (
    <motion.span className="text-3xl font-bold mb-2">
      {displayValue}
      {suffix}
    </motion.span>
  );
};

const OurAchievements = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { amount: 0.3 });

  return (
  <section className="py-16 bg-secondary/50">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <motion.h2
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          Our Achievements
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground max-w-2xl mx-auto"
        >
          A decade of excellence in education
        </motion.p>
      </div>
      
      <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {achievementsData.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-card rounded-xl p-6 shadow-md border text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                {stat.icon}
              </div>
            </div>
            <div className="mb-2">
              <AnimatedCounter 
                value={stat.value} 
                suffix={stat.suffix} 
                isInView={isInView} 
              />
            </div>
            <p className="text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default OurAchievements;
