
import React from "react";
import AboutHero from "@/components/about/AboutHero";
import OurStory from "@/components/about/OurStory";
import OurAchievements from "@/components/about/OurAchievements";
import OurTeam from "@/components/about/OurTeam";
import { Helmet } from "react-helmet-async";

const AboutPage = () => {
  return (
    <div>
      <Helmet>
       <meta name="description" content="ANIRBAN'S ACADEMY is a quality education platform designed to empower learners with expert coaching and exam preparation for various government and competitive exams." />
  <meta name="keywords" content="Anirban's Academy, government exams, competitive exam coaching, online education, UPSC, SSC, banking, teaching jobs, coaching classes" />
  <meta name="author" content="Anirban's Academy" /> 
      </Helmet>
      <AboutHero />
      <OurStory />
      <OurAchievements />
      <OurTeam />
    </div>
  );
};

export default AboutPage;
