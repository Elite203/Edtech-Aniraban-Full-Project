
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import axios from 'axios';

const MobileAppComingSoonPage = () => {
  const [backgroundImage, setBackgroundImage] = useState('/api/placeholder/1920/1080');
  const [isMobile, setIsMobile] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    const fetchAndroidBanner = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/Settings/website_banners_update.php?banner_name=android_banner`);
        if (response.data.success && response.data.data.image_data) {
          setBackgroundImage(response.data.data.image_data);
        }
      } catch (error) {
        console.error('Error fetching android banner:', error);
      }
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Disable GSAP animations on this page
    if (typeof window !== 'undefined' && window.gsap) {
      window.gsap.set('.animation-2', { clearProps: 'all' });
    }

    checkMobile();
    window.addEventListener('resize', checkMobile);

    fetchAndroidBanner();

    return () => {
      window.removeEventListener('resize', checkMobile);
      // Clean up any GSAP instances
      if (typeof window !== 'undefined' && window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      }
    };
  }, []);

  return (
    <div ref={pageRef} className="w-full min-h-screen relative overflow-hidden" data-gsap-disable="true">
      <section className="relative flex w-full min-h-screen">
        {/* The Background Image */}
        <img
          src={backgroundImage}
          alt="Descriptive text for the background image"
          className="absolute top-0 left-0 w-full h-full object-contain -z-10"
          onError={(e) => {
            e.target.src = '/api/placeholder/1920/1080';
          }}
        />
      </section>
    </div>
  );
};

export default MobileAppComingSoonPage;
