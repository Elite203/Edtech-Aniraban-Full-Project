import React, { useState } from 'react';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Calendar, 
  Edit3, 
  Trash2,
  Plus,
  AlertCircle
} from 'lucide-react';

export default function Reviews() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      courseTitle: 'UPSC Prelims Test Series 2024',
      rating: 5,
      reviewText: 'Excellent test series with comprehensive coverage of all topics. The question quality is outstanding and very close to actual UPSC pattern. Detailed solutions helped me understand concepts better.',
      reviewDate: '2024-11-15',
      helpful: 23,
      notHelpful: 2,
      instructor: 'Dr. Rajesh Kumar',
      verified: true
    },
    {
      id: 2,
      courseTitle: 'SSC CGL Mathematics Course',
      rating: 4,
      reviewText: 'Good course with clear explanations. The practice questions are helpful, though I wish there were more advanced level problems. Overall, it helped me improve my speed and accuracy.',
      reviewDate: '2024-10-22',
      helpful: 18,
      notHelpful: 1,
      instructor: 'Prof. Anita Sharma',
      verified: true
    },
    {
      id: 3,
      courseTitle: 'Current Affairs Monthly Package',
      rating: 4,
      reviewText: 'Well-organized current affairs content with good coverage of important events. The monthly tests are particularly useful for revision. Would recommend for regular practice.',
      reviewDate: '2024-09-08',
      helpful: 15,
      notHelpful: 0,
      instructor: 'Editorial Team',
      verified: true
    }
  ]);

  const [isWritingReview, setIsWritingReview] = useState(false);
  const [showCaution, setShowCaution] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [newReview, setNewReview] = useState({
    courseTitle: '',
    rating: 5,
    reviewText: ''
  });

  const renderStars = (rating, size = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const review = {
      id: Date.now(),
      courseTitle: newReview.courseTitle,
      rating: newReview.rating,
      reviewText: newReview.reviewText,
      reviewDate: new Date().toISOString().split('T')[0],
      helpful: 0,
      notHelpful: 0,
      instructor: 'Course Instructor',
      verified: true
    };
    setReviews([review, ...reviews]);
    setNewReview({ courseTitle: '', rating: 5, reviewText: '' });
    setIsWritingReview(false);
  };

  const handleDeleteReview = (id) => {
    setReviews(reviews.filter(review => review.id !== id));
  };

  const handleEditReview = (id) => {
    setEditingReview(id === editingReview ? null : id);
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Reviews</h1>
            <p className="text-gray-600 dark:text-gray-400">View and manage your course reviews and feedback</p>
          </div>
          <button
            onClick={() => setShowCaution(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Write Review
          </button>
        </div>
      </div>
      
      {/* Caution Modal */}
      {showCaution && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 text-amber-500 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Caution</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Please write review carefully do not give hate reviews and if some unwanted review is passed it will be deleted by the admin.
            </p>
            <button
              onClick={() => {
                setShowCaution(false);
                setIsWritingReview(true);
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Acknowledged
            </button>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {isWritingReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Write a Review</h3>
            
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Title</label>
                <input
                  type="text"
                  value={newReview.courseTitle}
                  onChange={(e) => setNewReview({ ...newReview, courseTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review</label>
                <textarea
                  value={newReview.reviewText}
                  onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Share your experience with this course..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setIsWritingReview(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{review.courseTitle}</h3>
                  {review.verified && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span>by {review.instructor}</span>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(review.reviewDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditReview(review.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center mb-4">
              {renderStars(review.rating)}
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({review.rating}/5)</span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{review.reviewText}</p>

            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-1 hover:text-green-600 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpful})</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-1 hover:text-red-600 transition-colors">
                  <ThumbsDown className="w-4 h-4" />
                  <span>Not Helpful ({review.notHelpful})</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No reviews yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Share your experience by writing your first review</p>
            <button
              onClick={() => setShowCaution(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Write Your First Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
