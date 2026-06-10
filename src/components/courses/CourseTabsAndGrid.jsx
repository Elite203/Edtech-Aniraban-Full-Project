import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseCard from "@/components/courses/CourseCard";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL; 

const CourseTabsAndGrid = ({ activeTab, setActiveTab }) => {
  const [courses, setCourses] = useState([]);
  const [courseCategories, setCourseCategories] = useState(["all"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/Courses/get_courses_api.php`);
        if (response.data?.status === "success" && Array.isArray(response.data.data)) {
          const courseData = response.data.data;
          setCourses(courseData);

          // Extract only those categories that have at least one course
          const uniqueCategories = [
            ...new Set(courseData.map(course => course.category).filter(Boolean))
          ];

          // Add "all" at the beginning
          setCourseCategories(["all", ...uniqueCategories]);

          // Default active tab
          if (!activeTab) {
            setActiveTab("all");
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [BASE_URL, activeTab, setActiveTab]);

  if (loading) {
    return <div className="text-center py-12">Loading courses...</div>;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Tabs List */}
      <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {courseCategories.map(category => (
          <TabsTrigger key={category} value={category} className="w-full">
            {category === "all" ? "All Courses" : category}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Tabs Content */}
      {courseCategories.map(categoryValue => {
        const coursesForThisTab =
          categoryValue === "all"
            ? courses
            : courses.filter(c => c.category === categoryValue);

        // Agar category me koi course nahi hai to is TabContent ko skip karo
        if (coursesForThisTab.length === 0) return null;

        return (
          <TabsContent key={categoryValue} value={categoryValue} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {coursesForThisTab.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default CourseTabsAndGrid;
