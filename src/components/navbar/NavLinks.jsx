
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const resources = [
  {
    title: "Blog",
    href: "/blog",
    description: "Read articles, tips, and strategies for exam preparation.",
  },
  {
    title: "Current Affairs",
    href: "/current-affairs",
    description: "Stay updated with the latest news and events relevant to your exams.",
  },
  {
    title: "Downloads",
    href: "/downloads",
    description: "Access free study material, previous year papers, and more.",
  },
  {
    title: "Books and Study Materials",
    href: "/books-study-material",
    description: "Find recommended books and comprehensive study materials.",
  },
  {
    title: "Free PDF Notes",
    href: "/free-pdf-notes",
    description: "Download curated PDF notes for quick revision and learning.",
  }
];

const ListItem = React.forwardRef(({ className, title, children, href, logo, gradient, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <NavLink
          to={href}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
            gradient
          )}
          {...props}
        >
          {logo && <img src={logo} alt={`${title} logo`} className="h-9 w-9 mb-2" />}
          <div className={`text-sm font-medium leading-none ${gradient ? 'text-white' : ''}`}>{title}</div>
          <p className={`line-clamp-2 text-sm leading-snug ${gradient ? 'text-gray-200' : 'text-muted-foreground'}`}>
            {children}
          </p>
        </NavLink>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

const NavLinks = () => {
  const [dynamicExams, setDynamicExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/Courses/get_courses.php?exclude_images=1`);
        const data = await response.json();
        if (data.success) {
          const categories = [...new Set(data.courses.map(c => c.category).filter(Boolean))];
          setDynamicExams(categories.map((cat, index) => ({
            title: cat,
            href: `/courses?category=${encodeURIComponent(cat)}`,
            description: `Comprehensive preparation for ${cat} examinations.`,
            logo: undefined,
            gradient: index === 0 ? "dark-red-gradient-bg" : undefined,
          })));
        }
      } catch (error) {
        console.error("Error fetching exams for navbar:", error);
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

  const navLinkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavLink to="/" className={navLinkClasses}>
            Home
          </NavLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Exams</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {allExams.map((exam) => (
                <ListItem
                  key={exam.title}
                  title={exam.title}
                  href={exam.href}
                  logo={exam.logo}
                  gradient={exam.gradient}
                >
                  {exam.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavLink to="/courses" className={navLinkClasses}>
            Courses
          </NavLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {resources.map((resource) => (
                <ListItem
                  key={resource.title}
                  title={resource.title}
                  href={resource.href}
                >
                  {resource.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavLink to="/about" className={navLinkClasses}>
            About Us
          </NavLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavLink to="/contact" className={navLinkClasses}>
            Contact
          </NavLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavLinks;
