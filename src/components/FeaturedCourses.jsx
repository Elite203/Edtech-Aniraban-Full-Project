import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Textify from "textify.js";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const stripHtmlTags = (text) => {
  if (!text) return '';
  return text
    .replace(/<\/p>|<\/div>|<\/li>|<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const CourseCard = React.memo(({ course, index, onAddToCart, isPurchased, onGoToDashboard }) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="card-hover"
    >
      <Card className="overflow-hidden h-full flex flex-col bg-card">
        <div className="relative">
          <img
            alt={course.title}
            className="w-full h-48 object-cover"
            src={course.image?.startsWith('data:') ? course.image : `${BASE_URL}${course.image}`}
            loading="lazy"
          />
          {course.popular === "1" && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
              Popular
            </Badge>
          )}
          {isPurchased && (
            <Badge className="absolute top-3 left-3 bg-green-600 text-white">
              Purchased
            </Badge>
          )}
        </div>
        <CardHeader className="pb-3 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="mb-1">
                {course.category || "General"}
              </Badge>
            </div>
            <CardTitle className="text-base leading-tight mt-1 mb-2 line-clamp-2 min-h-[2.5rem] flex items-center">
              {course.title}
            </CardTitle>
          </div>
          <div className="text-sm leading-snug mt-auto flex-grow">
            <span className="line-clamp-5 block h-24 overflow-hidden text-muted-foreground">
              {stripHtmlTags(course.description)}
            </span>
          </div>
        </CardHeader>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t pt-3 gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-lg font-bold">
              ₹
              {course.price
               ? Number(course.price).toLocaleString()
                : "0"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {isPurchased ? (
              <Button
                onClick={onGoToDashboard}
                className="text-xs sm:text-sm px-3 py-2 bg-green-600 hover:bg-green-700 text-white border-0 shadow-md transition-all duration-200"
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => onAddToCart(course)}
                className="text-xs sm:text-sm px-3 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
            <Link to={`/courses/${course.id}`} className="w-full sm:w-auto">
              <Button className="w-full text-xs sm:text-sm px-3 py-2">View Detail</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
});

const FeaturedCourses = () => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState([]);

  const handleAddToCart = (course) => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please log in to add courses to your cart.",
        variant: "destructive",
      });
      localStorage.setItem("redirectAfterLogin", "/courses");
      navigate("/login");
      return;
    }

    addToCart(course);
    toast({
      title: "Added to Cart",
      description: `${course.title} has been added to your cart.`,
    });
  };

  useEffect(() => {
    // Fetch active purchases
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        const userData = JSON.parse(localUser);
        if (userData?.id) {
          fetch(`${BASE_URL}api/Courses/get_test_series_purchases.php?student_id=${userData.id}`)
            .then(res => res.json())
            .then(data => {
              if (data.status === 'success' && Array.isArray(data.data)) {
                const activeIds = data.data
                  .filter(p => p.status === 'active')
                  .map(p => parseInt(p.course_id));
                setPurchasedCourseIds(activeIds);
              }
            })
            .catch((err) => console.error("Error fetching purchases:", err));
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Create ScrollTrigger with Textify animation
    ScrollTrigger.create({
      trigger: '.animation-2',
      start: 'top 80%',
      onEnter: () => {
        try {
          const el = document.querySelector('.animation-2');
          if (el) {
            const textify = new Textify({
              el: '.animation-2',
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
          const el = document.querySelector('.animation-2');
          if (el) {
            const textify = new Textify({
              el: '.animation-2',
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

    fetch(`${BASE_URL}api/Courses/get_courses.php`)
      .then((res) => res.json())
      .then((resJson) => {
        console.log("API Response:", resJson); // Debug log
        if (resJson && resJson.success && resJson.courses && Array.isArray(resJson.courses)) {
          // Handle current API format with success and courses array
          const featuredCourses = resJson.courses.slice(0, 4);
          setCourses(featuredCourses);
        } else if (resJson && resJson.status === "success" && resJson.data && Array.isArray(resJson.data)) {
          // Handle legacy API format
          const featuredCourses = resJson.data.slice(0, 4);
          setCourses(featuredCourses);
        } else if (resJson && Array.isArray(resJson)) {
          // Handle case where API returns array directly
          const featuredCourses = resJson.slice(0, 4);
          setCourses(featuredCourses);
        } else {
          console.error("API Error:", resJson?.message || "Invalid data structure");
          setCourses([]);
        }
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setCourses([]);
      })
      .finally(() => setLoading(false));

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="animation-2 text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
            Featured Courses
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Explore our most popular courses designed by experts to help you
            achieve your goals.
          </motion.p>
        </div>

        {loading ? (
          <div className="text-center text-lg">Loading courses...</div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <CourseCard
                key={course.id || index}
                course={course}
                index={index}
                onAddToCart={handleAddToCart}
                isPurchased={purchasedCourseIds.includes(parseInt(course.id))}
                onGoToDashboard={() => navigate('/dashboard')}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-lg text-muted-foreground">
            No courses available at the moment.
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/courses">
            <Button size="lg" variant="outline">
              View All Courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
