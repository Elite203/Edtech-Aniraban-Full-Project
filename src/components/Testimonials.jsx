import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Textify from "textify.js";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "SSC MTS 2024",
    content:
      "ANIRBAN'S ACADEMY's comprehensive study material and expert guidance were instrumental in my SSC MTS success. The structured approach and regular mock tests helped me identify my strengths and weaknesses.",
    avatar: "priya-sharma",
    rating: 5,
  },
  {
    id: 2,
    name: "Rahul Verma",
    role: "SBI PO 2023",
    content:
      "I had attempted banking exams twice before joining ANIRBAN'S ACADEMY. The personalized attention and strategic preparation approach made all the difference. Highly recommended for serious aspirants!",
    avatar: "rahul-verma",
    rating: 5,
  },
  {
    id: 3,
    name: "Ananya Patel",
    role: "SSC CGL 2022, AIR 112",
    content:
      "The faculty at ANIRBAN'S ACADEMY is exceptional. They not only teach the concepts but also share valuable tips and tricks to tackle the exam effectively. The doubt solving sessions were particularly helpful.",
    avatar: "ananya-patel",
    rating: 4,
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "RRB ALP",
    content:
      "As a working professional, I needed a flexible learning solution. ANIRBAN'S ACADEMY's recorded lectures and weekend doubt sessions were perfect for my schedule. The quality of content is unmatched.",
    avatar: "vikram-singh",
    rating: 5,
  },
  {
    id: 5,
    name: "Neha Gupta",
    role: "RBI Grade B 2023",
    content:
      "What sets ANIRBAN'S ACADEMY apart is their focus on conceptual clarity rather than rote learning. The current affairs section is updated daily, which was crucial for my RBI exam preparation.",
    avatar: "neha-gupta",
    rating: 5,
  },
  {
    id: 6,
    name: "Suresh Kumar",
    role: "UPSC Aspirant",
    content:
      "The guidance provided by ANIRBAN'S ACADEMY helped me improve my answer writing skills significantly. The feedback on mock tests was very constructive.",
    avatar: "suresh-kumar",
    rating: 4,
  },
];

const TestimonialCard = ({ testimonial }) => (
  <Card className="bg-card shadow-lg w-80 md:w-96 flex-shrink-0 mx-3">
    <CardContent className="p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < testimonial.rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
      <p className="text-card-foreground/80 mb-6 text-sm flex-grow">
        {testimonial.content}
      </p>
      <div className="flex items-center mt-auto">
        <Avatar className="h-12 w-12 mr-4">
          <AvatarImage src="" alt={testimonial.name} />
          <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            {testimonial.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Testimonials = () => {
  const controls = useAnimation();
  const scrollerRef = useRef(null);

  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Create ScrollTrigger with Textify animation
    ScrollTrigger.create({
      trigger: '.students-heading-animation',
      start: 'top 80%',
      onEnter: () => {
        try {
          const el = document.querySelector('.students-heading-animation');
          if (el) {
            const textify = new Textify({
              el: '.students-heading-animation',
              animation: {
                stagger: 0.05,
                duration: 0.7,
                ease: 'expo.inOut',
                animateProps: {"y":"-100%","opacity":0,"skewX":-45}
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
          const el = document.querySelector('.students-heading-animation');
          if (el) {
            const textify = new Textify({
              el: '.students-heading-animation',
              animation: {
                stagger: 0.05,
                duration: 0.7,
                ease: 'expo.inOut',
                animateProps: {"y":"-100%","opacity":0,"skewX":-45}
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

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const scrollWidth = scroller.scrollWidth / 2;
    const duration = scrollWidth / 50; // Adjust speed

    controls.start({
      x: -scrollWidth,
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: duration,
          ease: "linear",
        },
      },
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [controls]);

  const handleMouseEnter = () => controls.stop();
  const handleMouseLeave = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const scrollWidth = scroller.scrollWidth / 2;
    const duration = scrollWidth / 50;

    controls.start({
      x: -scrollWidth,
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: duration,
          ease: "linear",
        },
      },
    });
  };

  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-16 bg-secondary/50 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="students-heading-animation text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
            What Our Students Say
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Success stories from students who transformed their careers with
            ANIRBAN'S ACADEMY
          </motion.p>
        </div>
      </div>

      <div
        className="w-full overflow-x-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div ref={scrollerRef} className="flex" animate={controls}>
          {duplicatedTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={`${testimonial.id}-${index}`}
              testimonial={testimonial}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
