
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Video, FileText, Users, Clock, FileQuestion, StickyNote as NotebookTabs, Keyboard, Smartphone, AppWindow } from 'lucide-react';
import { Link } from "react-router-dom";

const HeroStatsOverlay = () => {
  const stats = [
    { value: "91%", label: "Concept Study", description: "Deep understanding" },
    { value: "97%", label: "Success Rate", description: "Proven results" },
    { value: "100%", label: "Syllabus Covered", description: "Full preparation" },
  ];

  return (
    <div className="absolute -bottom-20 inset-0 flex flex-col justify-end items-center p-2 sm:p-4 bg-gradient-to-t  to-transparent">
      <div className="grid grid-cols-3 gap-1 sm:gap-2 w-full max-w-xs sm:max-w-md">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
            className="text-center bg-black/50 p-1 sm:p-2 rounded-lg backdrop-blur-sm"
          >
            <p className="text-sm sm:text-lg font-bold text-white">{stat.value}</p>
            <p className="text-[10px] sm:text-xs font-medium text-indigo-300">{stat.label}</p>
            <p className="text-gray-300 text-[8px] sm:text-[10px] leading-tight">{stat.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const RotatingHeroText = () => {
  const sentences = [
    { text: 'YOUR PATH TO SUCCESS STARTS HERE', keyword: 'SUCCESS' },
    { text: 'STUDY FROM HOME NO NEED TO RUSH OUTSIDE', keyword: 'HOME' },
    { text: 'RECORDED CLASSES TO WATCH ANYTIME, ANYWHERE', keyword: 'RECORDED CLASSES' },
    { text: 'INTERACTIVE PLATFORM TO ASK DOUBT', keyword: 'ASK DOUBT' },
    { text: 'FREE TYPING TEST FOR STENOGRAPHER EXAM', keyword: 'FREE TYPING TEST' },
    { text: 'FREE PYQ TOPIC WISE', keyword: 'PYQ TOPIC WISE' },
    { text: 'NOTHING WILL WORK UNLESS YOU FOCUS ON MOCK TEST', keyword: 'MOCK TEST' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sentences.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentSentence = sentences[currentIndex];
  const parts = currentSentence.text.split(new RegExp(`(${currentSentence.keyword})`, 'gi'));

  return (
    <div className="relative min-h-[5rem] md:min-h-[6rem] lg:min-h-[7rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center md:justify-start"
        >
          <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white whitespace-pre-wrap">
            {parts.map((part, idx) => (
              <span
                key={`${part}-${idx}`}
                className={
                  part.toLowerCase() === currentSentence.keyword.toLowerCase()
                    ? 'text-blue-600 dark:text-blue-400'
                    : ''
                }
              >
                {part}
              </span>
            ))}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};


const HeroSection = () => {
  const [heroImageUrl, setHeroImageUrl] = useState("");

  // Fetch hero banner from API
  useEffect(() => {
    const fetchHeroBanner = async () => {
      try {
        console.log('Fetching hero banner from API...');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Settings/website_banners_update.php`);
        const data = await response.json();

        console.log('Hero banner API response:', data);

        if (data.success && data.data && data.data.image_data) {
          setHeroImageUrl(data.data.image_data);
          console.log('Hero banner loaded from API successfully');
        } else {
          console.log('No custom hero banner found from API');
        }
      } catch (error) {
        console.error('Error fetching hero banner:', error);
        console.log('Failed to load hero banner from API');
      }
    };

    fetchHeroBanner();
  }, []);

  const benefits = [
    { icon: <Users className="w-5 h-5 mr-2 text-indigo-400" />, text: "Expert Faculty" },
    { icon: <Video className="w-5 h-5 mr-2 text-indigo-400" />, text: "Live Classes" },
    { icon: <FileText className="w-5 h-5 mr-2 text-indigo-400" />, text: "Practice Tests" },
    { icon: <Clock className="w-5 h-5 mr-2 text-indigo-400" />, text: "Recorded Classes" },
    { icon: <FileQuestion className="w-5 h-5 mr-2 text-indigo-400" />, text: "Doubt Session" },
    { icon: <NotebookTabs className="w-5 h-5 mr-2 text-indigo-400" />, text: "PDF Notes" },
  ];

  return (
    <section className="relative py-16 md:py-20 overflow-hidden hero-gradient -mt-14">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-10 ">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-left"
          >
            <h1 className="font-extrabold mb-6 tracking-tight">
              <RotatingHeroText />
            </h1>
            <p className="text-m text-muted-foreground mb-8 max-w-xl mx-auto md:mx-0">
              Comprehensive preparation for competitive exams with expert guidance, quality study materials, and personalized learning paths.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-10">
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transform hover:scale-105 transition-transform duration-300 px-6">
                <Link to="/courses">
                  Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-indigo-600 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 shadow-lg transform hover:scale-105 transition-transform duration-300 px-6">
                <Link to="/demo">
                  Free Demo <BookOpen className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {/* <Button asChild size="lg" variant="outline" className="border-green-800 text-green-900 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 shadow-lg transform hover:scale-105 transition-transform duration-300 heartbeat-animation px-6">
                <Link to="/typing-test-setup">
                  Free Typing Test <Keyboard className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link to="/mobile-app-coming-soon" aria-label="Mobile App Coming Soon" className="android-button-3d">
                <AppWindow className="h-5 w-5" />
                <span>Android</span>
              </Link> */}
              <Link
                to="/current-affairs"
                aria-label="Current Affairs"
                className="android-button-3d"
                style={{ backgroundColor: '#980b0b' }}
              >
                <span style={{ color: 'white', fontFamily: 'Comic Sans MS' }}>
                  Current Affairs
                </span>
              </Link>
              {/* <Link
                to="#"
                aria-label="Image Resizer"
                className="android-button-3d"
                style={{ backgroundColor: '#f25304' }}
              >
                <span style={{ color: 'white', fontFamily: 'Lucida Calligraphy' }}>
                  IMAGE RESIZER
                </span>
              </Link> */}
              <Link
                to="#official-syllabus"
                aria-label="Detailed Syllabus"
                className="android-button-3d"
                style={{ backgroundColor: 'white' }}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('official-syllabus');
                  if (element) {
                    // Calculate scroll position accounting for scroll margin
                    const offsetTop = element.offsetTop - 80;
                    window.scrollTo({
                      top: Math.max(0, offsetTop),
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                <span style={{ color: 'black' }}>
                  DETAILED SYLLABUS
                </span>
              </Link>
              {/* <Link
                to="/job-vacancy"
                aria-label="Job Vacancy"
                className="android-button-3d"
                style={{ backgroundColor: '#04b9f2' }}
              >
                <span style={{ color: 'white' }}>
                  JOB VACANCY
                </span>
              </Link>
              <Link
                to="/ask-doubt"
                aria-label="Ask Doubt"
                className="android-button-3d"
                style={{ backgroundColor: '#03f384' }}
              >
                <span style={{ color: 'black' }}>
                  ASK DOUBT
                </span>
              </Link> */}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex items-center"
                >
                  {benefit.icon}
                  <span>{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 0 }}
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            whileHover={{
              scale: 1.05,
              transition: { type: "spring", stiffness: 200, damping: 10 },
            }}
            className="relative max-h-[400px] sm:max-h-[500px] md:h-full aspect-video mx-auto w-full"
          >
            {/* <div className="absolute -top-2 -left-2 w-16 h-16 sm:w-24 sm:h-24 bg-purple-300 rounded-full mix-blend-multiply filter blur-lg opacity-40 animate-blob"></div> */}
            {/* <div className="absolute -bottom-2 -right-2 w-16 h-16 sm:w-24 sm:h-24 bg-indigo-300 rounded-full mix-blend-multiply filter blur-lg opacity-40 animate-blob animation-delay-2000"></div>
            <div className="absolute -top-2 -right-5 w-16 h-16 sm:w-24 sm:h-24 bg-pink-300 rounded-full mix-blend-multiply filter blur-lg opacity-40 animate-blob animation-delay-4000"></div> */}

            {/* <div className="relative z-10 h-full w-full p-1 sm:p-1.5 bg-background/30 dark:bg-card/30 backdrop-blur-sm rounded-xl shadow-2xl"> */}
            <img
              alt=""
              className="rounded-lg w-full h-full"
              src={heroImageUrl || '/api/placeholder/600/400'}
              onError={(e) => {
                if (heroImageUrl) {
                  console.error('❌ Failed to load hero banner image');
                }
                e.target.src = '/api/placeholder/600/400';
              }}
              onLoad={() => {
                if (heroImageUrl) {
                  console.log('✅ Hero banner image loaded successfully');
                }
              }}
            />
            <HeroStatsOverlay />
            {/* </div> */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
