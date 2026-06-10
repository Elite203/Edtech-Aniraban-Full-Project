import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingCart, Zap, BookOpen, AlarmClock as ClockIcon, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';

const CourseDetailSidebar = ({ course, features, onEnrollNow, onAddToCart, price, lessons, duration }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart } = useCart();
  const [isInCart, setIsInCart] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const isLoggedIn = !!localStorage.getItem("user");

  useEffect(() => {
    if (course && course.id && cart.length > 0) {
      const courseInCart = cart.some(item => item.id === course.id);
      console.log('🛒 [Cart State Update] Course ID:', course.id, 'Cart Items:', cart.length, 'In Cart:', courseInCart);
      setIsInCart(courseInCart);
    }
  }, [cart, course]);

  useEffect(() => {
    if (!course?.id) return;
    const localUser = localStorage.getItem('user');
    if (!localUser) return;
    let userData;
    try { userData = JSON.parse(localUser); } catch { return; }
    if (!userData?.id) return;
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    fetch(`${BASE_URL}api/Courses/get_test_series_purchases.php?student_id=${userData.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          const isActive = data.data.some(
            p => parseInt(p.course_id) === parseInt(course.id) && p.status === 'active'
          );
          setIsPurchased(isActive);
        }
      })
      .catch(() => {});
  }, [course?.id]);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleEnrollNow = () => {
    console.log('═══════════════════════════════════════');
    console.log('🔴 [ENROLL NOW] Button Clicked');
    console.log('📊 [State] isLoggedIn:', isLoggedIn);
    console.log('📦 [Course] ID:', course?.id, 'Title:', course?.title);
    
    if (!isLoggedIn) {
      console.log('⚠️ [Auth] User not logged in - redirecting to login');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      console.log('💾 [Storage] Saved redirectAfterLogin:', window.location.pathname);
      toast({
        title: "Login Required",
        description: "Please login to enroll in this course.",
        duration: 3000,
      });
      console.log('🔔 [Toast] Login required toast shown');
      navigate("/login");
      console.log('🔀 [Navigation] Redirecting to /login');
      return;
    }

    if (!course || !course.title || !course.id) {
      console.error("❌ [Validation] Course data missing - course:", course);
      toast({
        title: "⚠️ Error",
        description: "Unable to enroll in course. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.log('🔔 [Toast] Error toast shown - missing course data');
      return;
    }

    try {
      console.log('⏳ [Action] Calling onEnrollNow() callback');
      onEnrollNow();
      console.log('✅ [Action] onEnrollNow() callback executed successfully');
      console.log('═══════════════════════════════════════');
    } catch (error) {
      console.error("❌ [Exception] Error during enrollment:", error);
      console.error("❌ [Stack Trace]", error.stack);
      toast({
        title: "⚠️ Error",
        description: "Failed to enroll in course.",
        variant: "destructive",
        duration: 3000,
      });
      console.log('🔔 [Toast] Error toast displayed');
      console.log('═══════════════════════════════════════');
    }
  };

  const handleCartClick = () => {
    console.log('═══════════════════════════════════════');
    console.log('🔴 [ADD TO CART] Button Clicked');
    console.log('📊 [State] isLoggedIn:', isLoggedIn, 'isInCart:', isInCart);
    console.log('📦 [Course] ID:', course?.id, 'Title:', course?.title, 'Price:', course?.price);
    
    if (!isLoggedIn) {
      console.log('⚠️ [Auth] User not logged in - redirecting to login');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      console.log('💾 [Storage] Saved redirectAfterLogin:', window.location.pathname);
      toast({
        title: "Login Required",
        description: "Please login to add courses to your cart.",
        duration: 3000,
      });
      console.log('🔔 [Toast] Login required toast shown');
      navigate("/login");
      console.log('🔀 [Navigation] Redirecting to /login');
      return;
    }

    if (!course || !course.title || !course.id) {
      console.error("❌ [Validation] Course data missing - course:", course);
      toast({
        title: "⚠️ Error",
        description: "Unable to add course to cart. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.log('🔔 [Toast] Error toast shown - missing course data');
      return;
    }

    if (isInCart) {
      console.log('ℹ️ [State] Course already in cart - skipping addition');
      toast({
        title: "ℹ️ Already in Cart",
        description: `${course.title} is already in your cart.`,
        duration: 3000,
      });
      console.log('🔔 [Toast] Already in cart toast shown');
      return;
    }

    try {
      console.log('⏳ [Action] Calling onAddToCart() callback');
      onAddToCart();
      console.log('✅ [Action] onAddToCart() callback executed successfully');
      
      console.log('⏳ [UI] Showing success toast');
      toast({
        title: "✅ Added to Cart!",
        description: `${course.title} has been added to your cart.`,
        duration: 3000,
      });
      console.log('✅ [Toast] Success toast displayed for:', course.title);
      console.log('═══════════════════════════════════════');
    } catch (error) {
      console.error("❌ [Exception] Error adding to cart:", error);
      console.error("❌ [Stack Trace]", error.stack);
      toast({
        title: "⚠️ Error",
        description: "Failed to add course to cart.",
        variant: "destructive",
        duration: 3000,
      });
      console.log('🔔 [Toast] Error toast displayed');
      console.log('═══════════════════════════════════════');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="lg:sticky top-24"
    >
      <Card className="shadow-xl overflow-hidden">
        <div className="bg-secondary/30 p-2"> 
           <img  
            src="/img/team.webp" 
            alt={course.title} 
            className="w-full h-48 object-cover rounded-t-md"
           />
        </div>
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="text-3xl font-bold text-primary text-center">
            ₹{price}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {isLoggedIn ? (
            <Button onClick={handleGoToDashboard} className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
              Go to Dashboard
            </Button>
          ) : (
            <Button onClick={handleEnrollNow} className="w-full bg-primary hover:bg-primary/90 text-lg py-3">
              Enroll Now
            </Button>
          )}

          {!isPurchased && (
            <Button 
              onClick={handleCartClick} 
              variant={isInCart ? "default" : "outline"}
              className={`w-full text-lg py-3 transition-all ${
                isInCart 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : ""
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  In Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          )}

          <div className="pt-4">
            <h4 className="font-semibold text-foreground mb-2">This course includes:</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                  {feature.text}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseDetailSidebar;
