
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useInView } from "framer-motion";

const OurStory = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const storyImageUrl = "/img/your.webp";

  return (
  <section className="py-16 bg-background">
    <div className="container mx-auto px-6">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <motion.h2
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          Our Story
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-foreground/80"
        >
          ANIRBAN'S ACADEMY is a powerful startup to help all those students who don't want to waste their valuable time by rushing towards offline coaching. As some cases in offline coaching students says they don't get as much compact lecture as an online teacher provides within limited time. So we made this LEARNING MANAGEMENT SYSTEM cost effective for those students who don't afford costly fees of coaching centres by providing online classes at affordable cost.
        </motion.p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-2xl font-bold mb-4">Our Mission</p>
          <p className="text-foreground/80 mb-6">
            To empower students with knowledge, skills, and confidence to excel in competitive exams and achieve their career goals.
          </p>
          
          <p className="text-2xl font-bold mb-4">Our Vision</p>
          <p className="text-foreground/80 mb-6">
            To be the most trusted educational platform that transforms the learning experience and creates a positive impact on students' lives.
          </p>
          
          <p className="text-2xl font-bold mb-4">Our Values</p>
          <ul className="space-y-3">
            {[
              { value: "Excellence", description: "We strive for excellence in everything we do." },
              { value: "Innovation", description: "We continuously innovate to enhance the learning experience." },
              { value: "Integrity", description: "We maintain the highest standards of integrity and ethics." },
              { value: "Student-Centric", description: "Our students are at the center of everything we do." }
            ].map(item => (
              <li key={item.value} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 mt-0.5" />
                <span className="text-foreground/80"><strong>{item.value}:</strong> {item.description}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative rounded-xl overflow-hidden">
            <img  alt="Our Mission and Vision" className="w-full h-auto rounded-xl object-cover aspect-video" src={storyImageUrl} />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
  );
};

export default OurStory;
