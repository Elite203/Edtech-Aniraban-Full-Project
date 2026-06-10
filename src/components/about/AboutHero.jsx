
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Textify from "textify.js";

const AboutHero = () => {
  const [aboutBannerImage, setAboutBannerImage] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const fetchAboutBanner = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/Settings/website_banners_update.php?banner_name=about_us_banner`);
        if (response.data.success && response.data.data.image_data) {
          // Preload the API image before setting it
          const apiImg = new Image();
          apiImg.src = response.data.data.image_data;
          apiImg.onload = () => {
            setAboutBannerImage(response.data.data.image_data);
            console.log('About Us banner loaded successfully');
          };
          apiImg.onerror = () => {
            console.log('Failed to load API banner');
          };
        } else {
          console.log('No about us banner found');
        }
      } catch (error) {
        console.error('Error fetching about banner:', error);
      }
    };

    fetchAboutBanner();

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Create ScrollTrigger with Textify animation for both spans
    const elements = document.querySelectorAll('.academy-heading-animation');
    elements.forEach((element, index) => {
      ScrollTrigger.create({
        trigger: element,
        start: 'top 80%',
        onEnter: () => {
          const textifyInstance = new Textify({
            el: `.academy-heading-animation:nth-child(${index + 1})`,
            animation: {
              stagger: 0.05,
              duration: 0.7,
              ease: 'expo.inOut',
              animateProps: {"y":"-100%","opacity":0,"skewX":-45}
            }
          }, gsap);
          if (textifyInstance && typeof textifyInstance.play === 'function') {
            textifyInstance.play();
          }
        },
        onEnterBack: () => {
          const textifyInstance = new Textify({
            el: `.academy-heading-animation:nth-child(${index + 1})`,
            animation: {
              stagger: 0.05,
              duration: 0.7,
              ease: 'expo.inOut',
              animateProps: {"y":"-100%","opacity":0,"skewX":-45}
            }
          }, gsap);
          if (textifyInstance && typeof textifyInstance.play === 'function') {
            textifyInstance.play();
          }
        },
      });
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient -z-10"></div>
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight uppercase tracking-tight">
              <span className="academy-heading-animation">About <span className="text-[#b3b613]">ANIRBAN'S ACADEMY</span> </span>
              
            </h1>
            <p className="text-lg text-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0">
              We are on a mission to transform education and make quality learning accessible to all. With our expert faculty and comprehensive courses, we help students achieve their dreams.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/courses">
                <Button size="lg">Explore Courses</Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">Contact Us</Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-20 transform -rotate-6 dark:opacity-30"></div>
              <div className="relative rounded-2xl overflow-hidden border shadow-xl bg-gray-200 dark:bg-gray-700 min-h-[300px]">
                {aboutBannerImage && (
                  <img  
                    alt="ANIRBAN'S ACADEMY team" 
                    className={`w-full h-auto rounded-2xl transition-opacity duration-300 ease-in-out ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    src={aboutBannerImage}
                    onLoad={() => setIsImageLoaded(true)}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
