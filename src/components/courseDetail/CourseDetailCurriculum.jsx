
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ListChecks, PlayCircle, AlertCircle, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CourseDetailCurriculum = ({ curriculum, courseId }) => {
  const { addToCart } = useCart();
  const [course, setCourse] = useState(null);
  const [isCoursePurchased, setIsCoursePurchased] = useState(false);
  const [examSets, setExamSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examSubjects, setExamSubjects] = useState({});
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [selectedPaidSet, setSelectedPaidSet] = useState(null);
  const [showUISelectionModal, setShowUISelectionModal] = useState(false);
  const [pendingExamSet, setPendingExamSet] = useState(null);
  const [selectedUI, setSelectedUI] = useState('old');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (courseId) {
      setLoading(true);
      fetch(`${BASE_URL}api/Exams/get_exam_sets.php?course_id=${courseId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.exam_sets) {
            setExamSets(data.exam_sets);
            // Fetch subjects for each exam set
            data.exam_sets.forEach((set) => {
              fetch(`${BASE_URL}api/Questions/get_questions.php?exam_set_id=${set.id}`)
                .then((res) => res.json())
                .then((qData) => {
                  if (qData.success && qData.data && qData.data.length > 0) {
                    const subjects = [...new Set(qData.data.map((q) => q.subject || ""))].filter(Boolean);
                    setExamSubjects((prev) => ({
                      ...prev,
                      [set.id]: subjects,
                    }));
                  }
                })
                .catch((err) => console.error(`Error fetching subjects for exam ${set.id}:`, err));
            });
          }
        })
        .catch((err) => console.error("Error fetching exam sets:", err))
        .finally(() => setLoading(false));
    }
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;

    // Fetch course details
    fetch(`${BASE_URL}api/Courses/get_courses.php`)
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson.success) {
          const found = resJson.courses.find(
            (c) => parseInt(c.id) === parseInt(courseId)
          );
          if (found) {
            const transformedCourse = {
              ...found,
              image: found.image ? (found.image.startsWith('data:') ? found.image : `data:image/jpeg;base64,${found.image}`) : '',
              students: found.students || "1000",
              lessons: found.lessons || "10",
              duration: found.duration || "Self-paced",
              rating: found.rating || "4.5"
            };
            setCourse(transformedCourse);
          }
        }
      })
      .catch((err) => console.error("Error fetching course details:", err));

    // Fetch purchase status
    const localUser = localStorage.getItem('user');
    if (!localUser) {
      setIsCoursePurchased(false);
      return;
    }
    let userData;
    try { userData = JSON.parse(localUser); } catch { return; }
    if (!userData?.id) return;

    fetch(`${BASE_URL}api/Courses/get_test_series_purchases.php?student_id=${userData.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          const isActive = data.data.some(
            p => parseInt(p.course_id) === parseInt(courseId) && p.status === 'active'
          );
          setIsCoursePurchased(isActive);
        } else {
          setIsCoursePurchased(false);
        }
      })
      .catch(() => setIsCoursePurchased(false));
  }, [courseId]);

  // Group exam sets by exam name
  const groupedExams = examSets.reduce((acc, exam) => {
    if (!acc[exam.exam_name]) {
      acc[exam.exam_name] = [];
    }
    acc[exam.exam_name].push(exam);
    return acc;
  }, {});

  // Create curriculum with each exam as separate section
  const examCurriculum = Object.entries(groupedExams).map(([examName, sets]) => ({
    title: examName,
    lessons: sets,
    isExam: true
  }));

  const handleExamSetClick = async (examSet) => {
    try {
      const sessionRes = await fetch(`${BASE_URL}api/Auth/check-session.php`, {
        method: 'GET',
        credentials: 'include',
      });
      const sessionData = await sessionRes.json();

      if (!sessionData.logged_in) {
        // User not logged in - store redirect path and navigate to login
        const redirectPath = `/courses/${courseId}`;
        localStorage.setItem('redirectAfterLogin', redirectPath);
        navigate('/login');
        return;
      }

      // User is logged in - check if set is paid and course is not purchased
      const isSetPaid = examSet.is_paid === 1 || examSet.is_paid === '1' || examSet.is_paid === true;
      if (isSetPaid && !isCoursePurchased) {
        setSelectedPaidSet(examSet);
        setShowPaidModal(true);
        return;
      }

      // Set is free or unlocked - Show UI Selection Modal
      setPendingExamSet(examSet);
      setShowUISelectionModal(true);
    } catch (err) {
      console.error('Error checking session:', err);
      // On error, treat as not logged in and redirect to login
      const redirectPath = `/courses/${courseId}`;
      localStorage.setItem('redirectAfterLogin', redirectPath);
      navigate('/login');
    }
  };

  const handleUIContinue = () => {
    if (!pendingExamSet) return;

    setShowUISelectionModal(false);
    if (selectedUI === 'new') {
      // Trigger fullscreen on user interaction for better browser compatibility
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => console.warn(err));
      }
      localStorage.setItem('sscExamSetId', pendingExamSet.id);
      localStorage.setItem('sscSetNumber', pendingExamSet.set_number);
      localStorage.setItem('sscCourseId', courseId);
      navigate('/ssc/mock-login', {
        state: {
          setName: pendingExamSet.set_name || `Set ${pendingExamSet.set_number}`,
          course_id: courseId,
          set_number: pendingExamSet.set_number,
          examSetId: pendingExamSet.id
        }
      });
    } else {
      navigate(`/exam/instructions/${courseId}/${pendingExamSet.id}/${pendingExamSet.set_number}`);
    }
  };

  const combinedCurriculum = [
    ...curriculum,
    ...examCurriculum
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-2xl font-semibold">
            <ListChecks className="w-6 h-6 mr-3 text-primary" />
            Course Curriculum
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-4 text-muted-foreground">
              Loading exam sets...
            </div>
          )}
          <Accordion type="single" collapsible className="w-full">
            {combinedCurriculum.map((module, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-lg font-medium hover:no-underline">
                  {module.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pl-2 pt-2">
                    {module.isExam ? (
                      // Render exam sets as clickable styled buttons
                      module.lessons.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center">
                          <PlayCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                          <button
                            onClick={() => handleExamSetClick(set)}
                            className="flex-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-3 sm:px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors cursor-pointer text-left flex items-center justify-between gap-2 sm:gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium block truncate">{set.set_name || `Set ${set.set_number}`}</span>
                            </div>
                            <div className="flex-shrink-0">
                               {(() => {
                                 const isSetPaid = set.is_paid === 1 || set.is_paid === '1' || set.is_paid === true;
                                 if (isSetPaid) {
                                   if (isCoursePurchased) {
                                     return (
                                       <span className="px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold whitespace-nowrap bg-blue-200 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                         Unlocked
                                       </span>
                                     );
                                   } else {
                                     return (
                                       <span className="px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold whitespace-nowrap bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                                         Paid
                                       </span>
                                     );
                                   }
                                 } else {
                                   return (
                                     <span className="px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold whitespace-nowrap bg-green-200 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                                       Free
                                     </span>
                                   );
                                 }
                               })()}
                            </div>
                          </button>
                        </div>
                      ))
                    ) : (
                      // Render regular lessons
                      <ul className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <li key={lessonIndex} className="flex items-center text-muted-foreground">
                            <PlayCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                            {lesson}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Paid Set Modal */}
      {showPaidModal && selectedPaidSet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Premium Content</h2>
              </div>
              <button
                onClick={() => setShowPaidModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base">
              This exam set is part of our premium content. Please purchase the complete course to access <span className="font-semibold">{selectedPaidSet.set_name || `Set ${selectedPaidSet.set_number}`}</span> and other premium features.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaidModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  setShowPaidModal(false);
                  let courseToCart = course;
                  if (!courseToCart) {
                    try {
                      const res = await fetch(`${BASE_URL}api/Courses/get_courses.php`);
                      const resJson = await res.json();
                      if (resJson.success) {
                        const found = resJson.courses.find(c => parseInt(c.id) === parseInt(courseId));
                        if (found) {
                          courseToCart = {
                            ...found,
                            image: found.image ? (found.image.startsWith('data:') ? found.image : `data:image/jpeg;base64,${found.image}`) : '',
                            students: found.students || "1000",
                            lessons: found.lessons || "10",
                            duration: found.duration || "Self-paced",
                            rating: found.rating || "4.5"
                          };
                        }
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }
                  if (courseToCart) {
                    addToCart(courseToCart);
                  }
                  navigate(`/cart`);
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-700 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                Purchase Course
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* UI Selection Modal */}
      {showUISelectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Interface</h2>
            <div className="space-y-4 mb-6">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-200 dark:border-gray-700">
                <input
                  type="radio"
                  name="ui-selection"
                  value="old"
                  checked={selectedUI === 'old'}
                  onChange={(e) => setSelectedUI(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">TCS iON Pattern (All CBT)</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-200 dark:border-gray-700">
                <input
                  type="radio"
                  name="ui-selection"
                  value="new"
                  checked={selectedUI === 'new'}
                  onChange={(e) => setSelectedUI(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300 font-medium">EDUQUITY Pattern (SSC)</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUISelectionModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUIContinue}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-700 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CourseDetailCurriculum;
