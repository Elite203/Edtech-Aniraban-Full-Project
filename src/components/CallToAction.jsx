
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SplitText from "@/components/ui/SplitText";

const CallToAction = () => {
  const handleJourneyHeadingAnimationComplete = () => {
    console.log("CallToAction: Journey heading animation completed");
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="relative overflow-hidden rounded-2xl gradient-bg p-8 md:p-12">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center md:text-left mb-8 md:mb-0"
            >
              <div className="text-3xl md:text-4xl font-bold text-white mb-4">
                <SplitText
                  text="Are you ready to "
                  className="inline"
                  delay={90}
                  duration={0.8}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 50 }}
                  to={{ opacity: 1, y: 0 }}
                />
                <SplitText
                  text="Start"
                  className="inline text-yellow-400"
                  delay={200}
                  duration={0.8}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 50 }}
                  to={{ opacity: 1, y: 0 }}
                />
                <SplitText
                  text=" Your "
                  className="inline"
                  delay={300}
                  duration={0.8}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 50 }}
                  to={{ opacity: 1, y: 0 }}
                />
                <SplitText
                  text="Success"
                  className="inline text-yellow-400"
                  delay={400}
                  duration={0.8}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 50 }}
                  to={{ opacity: 1, y: 0 }}
                />
                <SplitText
                  text=" Journey?"
                  className="inline"
                  delay={500}
                  duration={0.8}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 50 }}
                  to={{ opacity: 1, y: 0 }}
                  onLetterAnimationComplete={handleJourneyHeadingAnimationComplete}
                />
              </div>
              <p className="text-indigo-100 max-w-xl">
                Join thousands of successful students who transformed their careers with ANIRBAN'S ACADEMY. Get access to expert guidance, quality study materials, and a supportive learning community.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/signup">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-white text-indigo-700 hover:bg-gray-100">
                  Contact Us
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
