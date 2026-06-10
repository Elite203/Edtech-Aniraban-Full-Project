import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Star, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const CourseCard = ({ course }) => {
  const courseImage =
    "/img/course.jpg";

  return (
    <motion.div
      id={`course-${course.id}`} 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="card-hover"
    >
      <Card className="overflow-hidden h-full flex flex-col bg-card">
        <div className="relative">
          <img
            alt={course.title}
            className="w-full h-48 object-cover"
            src={courseImage}
          />
          {course.popular && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
              Popular
            </Badge>
          )}
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="mb-2">
              {course.category === "UPSC"
                ? "SSC"
                : course.category === "SSC"
                ? "RAILWAY"
                : course.category === "GATE"
                ? "STATE LEVEL EXAMS"
                : course.category}
            </Badge>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="text-sm font-medium">{course.rating}</span>
            </div>
          </div>
          <CardTitle className="line-clamp-1">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{course.lessons} lessons</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground col-span-2">
              <Users className="h-4 w-4 mr-1" />
              <span>{course.students.toLocaleString()} students</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Course completion</span>
              <span className="font-medium">78%</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-4">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-lg font-bold">
              ₹{course.price.toLocaleString()}
            </p>
          </div>
          <Link to={`/courses/${course.id}`}>
            <Button>View Details</Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
