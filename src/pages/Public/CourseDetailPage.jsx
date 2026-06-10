import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import CourseDetailHero from "@/components/courseDetail/CourseDetailHero";
import CourseDetailSidebar from "@/components/courseDetail/CourseDetailSidebar";
import CourseDetailAbout from "@/components/courseDetail/CourseDetailAbout";
import CourseDetailCurriculum from "@/components/courseDetail/CourseDetailCurriculum";
import CourseDetailReviews from "@/components/courseDetail/CourseDetailReviews";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  // Fetch course details
  useEffect(() => {
    console.log('📚 CourseDetailPage: Fetching course details for ID:', id);
    fetch(`${BASE_URL}api/Courses/get_courses.php`)
      .then((res) => res.json())
      .then((resJson) => {
        console.log('📚 CourseDetailPage: API Response:', resJson);
        if (resJson.success) {
          const found = resJson.courses.find(
            (c) => parseInt(c.id) === parseInt(id)
          );
          if (found) {
            // Transform the course data to match expected format
            const transformedCourse = {
              ...found,
              image: found.image ? (found.image.startsWith('data:') ? found.image : `data:image/jpeg;base64,${found.image}`) : '',
              students: found.students || "1000",
              lessons: found.lessons || "10",
              duration: found.duration || "Self-paced",
              rating: found.rating || "4.5"
            };
            console.log('✅ CourseDetailPage: Course found and transformed:', transformedCourse);
            setCourse(transformedCourse);
          } else {
            console.log('❌ CourseDetailPage: Course not found with ID:', id);
          }
        } else {
          console.error("❌ CourseDetailPage: API Error:", resJson.message);
        }
      })
      .catch((err) => console.error("❌ CourseDetailPage: Fetch course error:", err))
      .finally(() => {
        setLoading(false);
        // Safely refresh ScrollTrigger after a short delay to account for React rendering
        setTimeout(() => {
          if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger && typeof ScrollTrigger.refresh === 'function') {
            try {
              ScrollTrigger.refresh();
            } catch (e) {
              console.warn('CourseDetailPage: ScrollTrigger.refresh suppressed:', e);
            }
          }
        }, 100);
      });
  }, [id]);

  const handleEnrollNow = () => {
    toast({
      title: "Authentication Required",
      description: "Please login or sign up to enroll in this course.",
    });
    navigate("/login");
  };

  const handleAddToCart = () => {
    if (!course || !course.title || !course.id) {
      console.error("❌ Course data missing for cart");
      return;
    }
    addToCart(course);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const curriculum = [
    {
      title: "INTRODUCTION",
      lessons: [
  "Real & Latest Exam Pattern Based Tests",
  "Exam Oriented Approach",
  "BILINGUAL TEST English & Hindi",
  "VIDEO SOLUTION For Each & Every Question (For Better Understanding)",
  "Detailed Performance Analysis",
  "All India Rank (AIR) with LEADERBOARD",
  "Smart AI-Based Analytics",
  "Step-by-Step Solutions",
  "Time Management Insights",
  "Analysis Your Strong & Weak Points",
  "UNLIMITED Reattempts",
  "Mobile & Desktop Friendly",
  "Latest Pattern Updates",
  "Previous Year Questions (PYQs)",
  "Customizable Test Schedule",
  "Performance Comparison Reports",
  "Expert-Curated Content",
  "Question Save Features",
  "Detailed Concept Study",
  "Check CUT-OFF Marks Category Wise",
  "Free Demo Tests Available",
  "Secure & Proctored Environment",
  "Pocket Friendly Price"
],
    },
  ];

const features = [
  { text: "Real & Latest Exam Pattern Based Tests" },
  { text: "Exam Oriented Approach" },
  { text: "BILINGUAL TEST English & Hindi" },
  { text: "VIDEO SOLUTION For Each & Every Question (For Better Understanding)" },
  { text: "Detailed Performance Analysis" },
  { text: "All India Rank (AIR) with LEADERBOARD" },
  { text: "Smart AI-Based Analytics" },
  { text: "Step-by-Step Solutions" },
  { text: "Time Management Insights" },
  { text: "Analysis Your Strong & Weak Points" },
  { text: "UNLIMITED Reattempts" },
  { text: "Mobile & Desktop Friendly" },
  { text: "Latest Pattern Updates" },
  { text: "Previous Year Questions (PYQs)" },
  { text: "Customizable Test Schedule" },
  { text: "Performance Comparison Reports" },
  { text: "Expert-Curated Content" },
  { text: "Question Save Features" },
  { text: "Detailed Concept Study" },
  { text: "Check CUT-OFF Marks Category Wise" },
  { text: "Free Demo Tests Available" },
  { text: "Secure & Proctored Environment" },
  { text: "Pocket Friendly Price" }
];

  const reviews = [
    {
      id: 1,
      name: "Aarav Sharma",
      rating: 5,
      comment: "This course exceeded my expectations.",
    },
    { id: 2, name: "Diya Patel", rating: 4, comment: "Very informative." },
    { id: 3, name: "Rohan Mehta", rating: 5, comment: "Highly recommend!" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen container mx-auto px-6 py-12 text-center">
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        Course not found.
      </div>
    );
  }

  return (
    <section className="bg-background">
      <CourseDetailHero
    title={course.title}
    description={
      <div dangerouslySetInnerHTML={{ __html: course.description }} />
    }
    image={course.image || '/api/placeholder/400/200'}
    rating={course.rating}
    students={course.students}
  />

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <CourseDetailAbout
              description={
                course.longDescription ||
                "Our comprehensive TEST SERIES is specially designed for aspirants preparing for SSC, Banking,  Railway, State PSC, Defence, Cuet & All other competitive exams. our platform provides exam-oriented practice that boosts accuracy, speed, and confidence. all other details are maintained in INTRODUCTION TAB, please check before purchasing the TEST SERIES."
              }
            />
            <CourseDetailCurriculum curriculum={curriculum} courseId={id} />
            <CourseDetailReviews reviews={reviews} />
          </div>

          <CourseDetailSidebar
            course={course}
            features={features}
            onEnrollNow={handleEnrollNow}
            onAddToCart={handleAddToCart}
            price={course.price}
            lessons={course.lessons}
            duration={course.duration}
          />
        </div>
      </div>
    </section>
  );
};

export default CourseDetailPage;
