
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare } from 'lucide-react';

const CourseDetailReviews = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-semibold">
              <MessageSquare className="w-6 h-6 mr-3 text-primary" />
              Student Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No reviews yet for this course. Be the first to leave a review!</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-semibold">
            <MessageSquare className="w-6 h-6 mr-3 text-primary" />
            Student Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-foreground">{review.name}</h4>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/50'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseDetailReviews;
