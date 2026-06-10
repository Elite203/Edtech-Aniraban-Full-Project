
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Users } from 'lucide-react';

const CourseDetailHero = ({ title, description, image, rating, students }) => {
  return (
    <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{title}</h1>
            <p className="text-lg md:text-xl opacity-90 mb-6">{description}</p>
            <div className="flex items-center space-x-6 mb-6">
              {rating && (
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1.5" fill="currentColor" />
                  <span className="font-semibold text-lg">{rating}</span>
                  <span className="ml-1 opacity-80 text-sm">(Average Rating)</span>
                </div>
              )}
              {students && (
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-1.5 opacity-80" />
                  <span className="font-semibold text-lg">{Number(students).toLocaleString()}</span>
                  <span className="ml-1 opacity-80 text-sm">Students Enrolled</span>
                </div>
              )}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="hidden md:block"
          >
            <img 
              src={image} 
              alt={title} 
              className="rounded-xl shadow-2xl object-cover w-full h-104 md:h-200"
              onError={(e) => {
                console.error(`❌ Failed to load hero image for course ${title}:`, image);
                e.target.src = '/api/placeholder/400/200';
              }}
              onLoad={() => {
                console.log(`✅ Successfully loaded hero image for course ${title}`);
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailHero;
