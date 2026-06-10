
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const resources = [
  { title: "Blog", href: "/blog", description: "Articles and tips." },
  { title: "Current Affairs", href: "/current-affairs", description: "Latest news." },
  { title: "Downloads", href: "/downloads", description: "Free study material." },
  { title: "Books & Materials", href: "/books-study-material", description: "Recommended resources." },
  { title: "Free PDF Notes", href: "/free-pdf-notes", description: "Curated notes." },
];

const MobileMenu = ({ toggleMobileMenu, onLoginClick, onSignupClick }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [dynamicExams, setDynamicExams] = useState([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || localStorage.getItem("student_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/Courses/get_courses.php?exclude_images=1`);
        const data = await response.json();
        if (data.success) {
          const categories = [...new Set(data.courses.map(c => c.category).filter(Boolean))];
          setDynamicExams(categories.map((cat) => ({
            title: cat,
            href: `/courses?category=${encodeURIComponent(cat)}`,
            description: `Comprehensive preparation for ${cat} examinations.`,
          })));
        }
      } catch (error) {
        console.error("Error fetching exams for mobile menu:", error);
      }
    };
    fetchExams();
  }, []);

  const typingTest = {
    title: "Stenographer Free Typing Test",
    href: "/typing-test-setup",
    description: "Practice your typing speed and accuracy for stenographer exams.",
  };

  const allExams = [...dynamicExams, typingTest];

  // Logout handler
  const handleLogout = async () => {
    try {
      // Call backend logout API to clear server session
      await fetch(`${window.location.origin}/api/Auth/logout.php`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("student_user");
    localStorage.removeItem("user_id");
    setUser(null);
    toggleMobileMenu();
    navigate("/");
  };

  const navLinkClasses = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="lg:hidden bg-background border-t"
    >
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <NavLink to="/" className={navLinkClasses} onClick={toggleMobileMenu}>Home</NavLink>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="exams-mobile" className="border-b-0">
            <AccordionTrigger className="px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md hover:no-underline">Exams</AccordionTrigger>
            <AccordionContent className="pb-1">
              <ul className="space-y-1 pl-4">
                {allExams.map(exam => (
                  <li key={exam.title}>
                    <NavLink to={exam.href} className={navLinkClasses} onClick={toggleMobileMenu}>
                      {exam.title}
                      <p className="text-xs text-muted-foreground font-normal">{exam.description}</p>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="resources-mobile" className="border-b-0">
            <AccordionTrigger className="px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md hover:no-underline">Resources</AccordionTrigger>
            <AccordionContent className="pb-1">
              <ul className="space-y-1 pl-4">
                {resources.map(resource => (
                  <li key={resource.title}>
                    <NavLink to={resource.href} className={navLinkClasses} onClick={toggleMobileMenu}>
                      {resource.title}
                       <p className="text-xs text-muted-foreground font-normal">{resource.description}</p>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <NavLink to="/courses" className={navLinkClasses} onClick={toggleMobileMenu}>Courses</NavLink>
        <NavLink to="/about" className={navLinkClasses} onClick={toggleMobileMenu}>About Us</NavLink>
        <NavLink to="/contact" className={navLinkClasses} onClick={toggleMobileMenu}>Contact</NavLink>
        
        <div className="pt-4 pb-2 border-t">
          {user ? (
            <div className="space-y-2">
              <div className="px-3 py-2 bg-accent/50 rounded-md">
                <p className="font-semibold text-sm">
                  {user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User"}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <NavLink to="/dashboard/profile" className={navLinkClasses} onClick={toggleMobileMenu}>
                👤 Profile
              </NavLink>
              <NavLink to="/dashboard/orders" className={navLinkClasses} onClick={toggleMobileMenu}>
                📦 Orders
              </NavLink>
              <Button 
                variant="outline" 
                className="w-full text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950" 
                onClick={handleLogout}
              >
                🚪 Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={onLoginClick}>Login</Button>
              <Button className="w-full" onClick={onSignupClick}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MobileMenu;
