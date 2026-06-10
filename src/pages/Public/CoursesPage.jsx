import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, BookOpen, ShoppingCart, LayoutDashboard } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";

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
            src={course.image || '/api/placeholder/400/200'}
            loading="lazy"
            onError={(e) => {
              console.error(`❌ Failed to load image for course ${course.title}:`, course.image);
              e.target.src = '/api/placeholder/400/200';
            }}
            onLoad={() => {
              console.log(`✅ Successfully loaded image for course ${course.title}`);
            }}
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
          <CardDescription className="text-sm leading-snug mt-auto flex-grow">
            <span className="line-clamp-5 block h-24 overflow-hidden text-muted-foreground">
              {stripHtmlTags(course.description)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t pt-3 gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-lg font-bold">
              ₹{course.price ? Number(course.price).toLocaleString() : "0"}
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

const CoursesPage = () => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(categoryParam || "all");
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [loading, setLoading] = useState(true);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState([]);

  useEffect(() => {
    if (categoryParam) {
      setActiveTab(categoryParam);
    } else {
      setActiveTab("all");
    }
  }, [categoryParam]);

  useEffect(() => {
    const localUser = localStorage.getItem('user');
    if (!localUser) return;
    const userData = JSON.parse(localUser);
    if (!userData?.id) return;
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
      .catch(() => {});
  }, []);

  useEffect(() => {
    console.log('📚 CoursesPage: Fetching courses from API...');
    fetch(`${BASE_URL}api/Courses/get_courses.php`)
      .then((res) => res.json())
      .then((resJson) => {
        console.log('📚 CoursesPage: API Response:', resJson);
        if (resJson.success) {
          // Handle courses with BLOB images (already converted by API)
          const transformedCourses = resJson.courses.map((course, index) => {
            console.log(`🖼️ Course ${course.id} (${course.title}):`, {
              hasImage: !!course.image,
              imageType: typeof course.image,
              imageLength: course.image ? course.image.length : 0,
              isDataUrl: course.image ? course.image.startsWith('data:') : false,
              first50Chars: course.image ? course.image.substring(0, 50) : 'No image'
            });
            
            return {
              ...course,
              // Image is already in data URL format from API, use as-is or fallback to empty
              image: course.image || ''
            };
          });
          setCourses(transformedCourses);
          console.log('✅ CoursesPage: Courses loaded successfully:', transformedCourses.length, 'courses');

          // Extract unique categories from data
          const uniqueCats = [
            ...new Set(transformedCourses.map((c) => c.category).filter(Boolean)),
          ];

          // Only keep categories that have at least one course
          const validCats = uniqueCats.filter((cat) =>
            transformedCourses.some((c) => c.category === cat)
          );

          // Add "all" at the start
          setCategories(["all", ...validCats]);
          console.log('📂 CoursesPage: Categories loaded:', validCats);

          // Default active tab only if no category param is present
          if (!categoryParam) {
            setActiveTab("all");
          }
        } else {
          console.error("❌ CoursesPage: API Error:", resJson.message);
        }
      })
      .catch((err) => {
        console.error("❌ CoursesPage: Fetch Error:", err);
      })
      .finally(() => {
        setLoading(false);
        // Safely refresh ScrollTrigger after a short delay to account for React rendering
        setTimeout(() => {
          if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger && typeof ScrollTrigger.refresh === 'function') {
            try {
              ScrollTrigger.refresh();
            } catch (e) {
              console.warn('CoursesPage: ScrollTrigger.refresh suppressed:', e);
            }
          }
        }, 100);
      });
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAddToCart = (course) => {
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please log in to add courses to your cart.",
        variant: "destructive",
      });
      localStorage.setItem('redirectAfterLogin', '/courses');
      navigate('/login');
      return;
    }
    
    addToCart(course);
    toast({
      title: "Added to Cart",
      description: `${course.title} has been added to your cart.`,
    });
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesCategory = activeTab === "all";
    if (!matchesCategory) {
      matchesCategory = course.category === activeTab;
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover comprehensive courses designed to help you excel in competitive exams.
        </p>
      </div>

      {/* Search Filter */}
      <div className="mb-6 text-center">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded w-full md:w-1/2"
        />
      </div>

      {/* Dynamic Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-w-7xl mx-auto mb-8">
        {categories.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`w-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            {tab === "all" ? "All Courses" : tab}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="min-h-96">
        {loading ? (
          <div className="text-center text-lg">Loading courses...</div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCourses.map((course, index) => (
              <CourseCard
                key={index}
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
            No courses found.
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesPage;
