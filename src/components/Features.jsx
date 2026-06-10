
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Video, FileText, Award, Users, Clock } from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import GovExamCard from "@/components/GovExamCard";
import WaveText from "@/components/WaveText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Textify from "textify.js";

const features = [
  {
    icon: <BookOpen className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />,
    title: "Comprehensive Study Material",
    description: "Access detailed notes, books, and resources prepared by subject experts."
  },
  {
    icon: <Video className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />,
    title: "Live & Recorded Classes",
    description: "Attend interactive live sessions or watch recorded lectures at your convenience."
  },
  {
    icon: <FileText className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />,
    title: "Practice Tests & Quizzes",
    description: "Test your knowledge with regular assessments and get instant feedback."
  },
  {
    icon: <Award className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />,
    title: "Expert Faculty",
    description: "Learn from experienced educators who have mentored thousands of successful candidates."
  },
  {
    icon: <Users className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />,
    title: "Doubt Solving Sessions",
    description: "Get your questions answered through dedicated doubt clearing sessions."
  },
  {
    icon: <Clock className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />,
    title: "Flexible Learning",
    description: "Study at your own pace with 24/7 access to all learning resources."
  }
];

// const sscLogoUrl = "/img/ssc.webp";
// const rrbLogoUrl = "/img/rrb.webp";
// const sbiLogoUrl = "/img/sbi.webp";


// Removed hardcoded govExams


const FeatureCard = ({ feature, index }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -5, cursor: 'pointer' }}
      onClick={() => navigate('/feature-details')}
      className="feature-card p-6 bg-background/80 dark:bg-card/80 group"
    >
      <div className="mb-4 transform transition-transform group-hover:scale-110">{feature.icon}</div>
      <p className="text-xl font-semibold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{feature.title}</p>
      <p className="text-muted-foreground">{feature.description}</p>
    </motion.div>
  );
};

const Features = () => {
  const [govExams, setGovExams] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchGovExams = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/OfficialSyllabus/get_syllabus.php`);
        const data = await response.json();
        if (data.success) {
          // Map API data to match GovExamCard prop names
          const mappedData = data.data.map(item => ({
            id: item.id,
            name: item.name,
            logoUrl: item.logo,
            title_text: item.title_text,
            subtitle_text: item.subtitle_text,
            btn1_text: item.btn1_text, btn1_color: item.btn1_color, btn1_link: item.btn1_link,
            btn2_text: item.btn2_text, btn2_color: item.btn2_color, btn2_link: item.btn2_link,
            btn3_text: item.btn3_text, btn3_color: item.btn3_color, btn3_link: item.btn3_link,
            btn4_text: item.btn4_text, btn4_color: item.btn4_color, btn4_link: item.btn4_link,
            btn5_text: item.btn5_text, btn5_color: item.btn5_color, btn5_link: item.btn5_link,
            btn6_text: item.btn6_text, btn6_color: item.btn6_color, btn6_link: item.btn6_link,
            btn7_text: item.btn7_text, btn7_color: item.btn7_color, btn7_link: item.btn7_link,
            btn8_text: item.btn8_text, btn8_color: item.btn8_color, btn8_link: item.btn8_link,
            btn9_text: item.btn9_text, btn9_color: item.btn9_color, btn9_link: item.btn9_link,
            btn10_text: item.btn10_text, btn10_color: item.btn10_color, btn10_link: item.btn10_link,
            yt_link1: item.yt_link1,
            yt_link2: item.yt_link2,
            yt_link3: item.yt_link3,
            yt_link4: item.yt_link4,
            content_overview: item.content_overview,
            quick_actions: item.quick_actions,
          }));
          setGovExams(mappedData);
        }
      } catch (error) {
        console.error("Error fetching gov exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGovExams();
  }, []);

  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Create ScrollTrigger with Textify animation for first heading
    ScrollTrigger.create({
      trigger: '.academy-heading-animation',
      start: 'top 80%',
      onEnter: () => {
        try {
          const el = document.querySelector('.academy-heading-animation');
          if (el) {
            const textify = new Textify({
              el: '.academy-heading-animation',
              animation: {
                stagger: 0.05,
                duration: 0.7,
                ease: 'expo.inOut',
                animateProps: { "y": "-100%", "opacity": 0, "skewX": -45 }
              }
            }, gsap);
            if (textify && typeof textify.play === 'function') {
              textify.play();
            }
          }
        } catch (err) {
          console.warn('Textify animation error:', err);
        }
      },
      onEnterBack: () => {
        try {
          const el = document.querySelector('.academy-heading-animation');
          if (el) {
            const textify = new Textify({
              el: '.academy-heading-animation',
              animation: {
                stagger: 0.05,
                duration: 0.7,
                ease: 'expo.inOut',
                animateProps: { "y": "-100%", "opacity": 0, "skewX": -45 }
              }
            }, gsap);
            if (textify && typeof textify.play === 'function') {
              textify.play();
            }
          }
        } catch (err) {
          console.warn('Textify animation error:', err);
        }
      },
    });

    // Create ScrollTrigger with Textify animation for syllabus heading
    ScrollTrigger.create({
      trigger: '.syllabus-heading-animation',
      start: 'top 80%',
      onEnter: () => {
        try {
          const el = document.querySelector('.syllabus-heading-animation');
          if (el) {
            const textify = new Textify({
              el: '.syllabus-heading-animation',
              animation: {
                stagger: 0.05,
                duration: 0.7,
                ease: 'expo.inOut',
                animateProps: { "y": "-100%", "opacity": 0, "skewX": -45 }
              }
            }, gsap);
            if (textify && typeof textify.play === 'function') {
              textify.play();
            }
          }
        } catch (err) {
          console.warn('Textify animation error:', err);
        }
      },
      onEnterBack: () => {
        try {
          const el = document.querySelector('.syllabus-heading-animation');
          if (el) {
            const textify = new Textify({
              el: '.syllabus-heading-animation',
              animation: {
                stagger: 0.05,
                duration: 0.7,
                ease: 'expo.inOut',
                animateProps: { "y": "-100%", "opacity": 0, "skewX": -45 }
              }
            }, gsap);
            if (textify && typeof textify.play === 'function') {
              textify.play();
            }
          }
        } catch (err) {
          console.warn('Textify animation error:', err);
        }
      },
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      <section className="py-16 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20"></div>

        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="academy-heading-animation text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white uppercase tracking-tight">
              Why Choose ANIRBAN'S ACADEMY ?
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              We provide a complete learning ecosystem designed to maximize your chances of success
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section id="official-syllabus" className="py-16 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="syllabus-heading-animation text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white uppercase tracking-tight">
              OFFICIAL SYLLABUS
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              We offer comprehensive coaching for a wide range of government examinations.
            </motion.p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 auto-rows-max">
            {loading ? (
              <div className="col-span-full py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading syllabus...</p>
              </div>
            ) : govExams.length > 0 ? (
              govExams.map((exam, index) => (
                <GovExamCard key={index} exam={exam} index={index} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">No syllabus items available.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
