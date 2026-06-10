import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const DummyAdmitCardPage = () => {
  const { course_id, exam_set_id, set_number } = useParams();
  const navigate = useNavigate();
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [courseTitle, setCourseTitle] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [user, setUser] = useState({ name: "", image: "" });

  useEffect(() => {
    if (!course_id) return;
    fetch(`${BASE_URL}api/Courses/get_courses.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.data) {
          const matched = data.data.find(
            (course) => parseInt(course.id) === parseInt(course_id)
          );
          if (matched?.title) setCourseTitle(matched.title);
        }
      })
      .catch((err) => console.error("Error fetching course title:", err));
  }, [course_id]);

  useEffect(() => {
    if (!course_id || !exam_set_id) return;
    fetch(`${BASE_URL}api/Exams/get_exam_sets.php?course_id=${course_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.sets) {
          let matched = null;
          Object.values(data.sets).forEach((setGroup) => {
            if (parseInt(setGroup.exam_set_id) === parseInt(exam_set_id)) {
              matched = setGroup.exam_title;
            }
          });
          if (matched) setExamTitle(matched);
        }
      })
      .catch((err) => console.error("Error fetching exam title:", err));
  }, [exam_set_id, course_id]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser({
        name: storedUser.name,
        image: `${BASE_URL}${storedUser.image}`,
      });
    }
  }, []);

  // Countdown timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(`/exam/question/${course_id}/${exam_set_id}/${set_number}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate, course_id, exam_set_id, set_number]);

  // Go full screen on mount
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleStartExam = () => {
    navigate(`/exam/question/${course_id}/${exam_set_id}/${set_number}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col max-w-[1440px] mx-auto">
      {/* Header - Improved for mobile */}
      {/* <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-300 dark:border-gray-700 px-4 py-3 gap-2 sm:gap-0">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <img src="/img/logo.webp" alt="Logo" className="w-10 h-10 sm:w-14 sm:h-14" />
          <a
            href="/dummy_admit_card.pdf"
            download
            className="sm:hidden bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
          >
            DOWNLOAD
          </a>
        </div>
        <div className="text-center w-full sm:flex-1 sm:-ml-14">
          <h1 className="text-blue-700 dark:text-blue-400 font-bold text-sm sm:text-lg md:text-xl uppercase truncate px-2">
            {courseTitle} {examTitle} SET {set_number}
          </h1>
        </div>
        <a
          href="/dummy_admit_card.pdf"
          download
          className="hidden sm:block bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
        >
          DOWNLOAD ADMIT CARD
        </a>
      </div> */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-300 dark:border-gray-700 px-4 py-3 gap-2 sm:gap-0">
  {/* Logo + Mobile Download */}
  <div className="flex items-center justify-between w-full sm:w-auto">
    <img
      src="/img/logo.webp"
      alt="Logo"
      className="w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0"
    />
    <a
      href="/dummy_admit_card.pdf"
      download
      className="sm:hidden bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-3 py-1 rounded text-xs ml-2"
    >
      DOWNLOAD
    </a>
  </div>

  {/* Title */}
  <div className="flex-1 text-center px-2">
    <h1 className="text-blue-700 dark:text-blue-400 font-bold text-sm sm:text-lg md:text-xl uppercase break-words">
      {courseTitle} {examTitle} SET {set_number}
    </h1>
  </div>

  {/* Desktop Download */}
  <a
    href="/dummy_admit_card.pdf"
    download
    className="hidden sm:block bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
  >
    DOWNLOAD ADMIT CARD
  </a>
</div>


      {/* Main Content - Stacked on mobile, row on larger screens */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-2 sm:p-4 gap-4 sm:gap-6 overflow-auto">
        {/* Left Image - Smaller on mobile */}
        <div className="w-full lg:w-1/4 flex justify-center mt-2 sm:mt-0">
          <img
            src="https://i.pinimg.com/474x/7a/c3/9c/7ac39c6c2a01595c159107e1d3f3e84d.jpg"
            alt="Good Luck"
            className="w-32 sm:w-40 md:w-48 object-contain"
          />
        </div>

        {/* Center Quote Box - Adjusted padding and text size */}
        <div className="w-full lg:w-2/4 border border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-gray-800 rounded-lg p-3 sm:p-5 text-center shadow relative">
          <div className="text-sm sm:text-base md:text-lg font-semibold text-blue-800 dark:text-blue-300 leading-relaxed">
            "Success is not final; failure is not fatal
            <br />
            It is the courage to continue that counts."
            <br />
            <span className="block text-gray-700 dark:text-gray-400 font-medium mt-1 sm:mt-3 text-xs sm:text-sm">
              OR
            </span>
            <br />
            "सफलता अंतिम नहीं है; असफलता घातक नहीं है:
            <br />
            यह जारी रखने का साहस है जो मायने रखता है।" – चर्चिल
          </div>
        </div>

        {/* Right Countdown Box - Adjusted for mobile */}
        <div className="w-full lg:w-1/4 border border-red-300 dark:border-red-600 bg-red-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 text-center space-y-2 sm:space-y-4 mb-4 sm:mb-0">
          <p className="text-red-700 dark:text-red-400 font-bold text-xs sm:text-sm md:text-base leading-relaxed">
            COUNT DOWN FOR GO TO NEXT PAGE!
            <br />
            <span className="text-xl sm:text-2xl font-extrabold text-black dark:text-white">
              {formatTime(timer)}
            </span>
            <br />
            JUST WRITE DOWN THE TEXT AS SOON AS POSSIBLE!
          </p>

          <button
            onClick={handleStartExam}
            className="w-full py-1 sm:py-2 px-3 sm:px-4 rounded font-bold text-white text-xs sm:text-sm md:text-base bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            SKIP & START EXAM
          </button>
        </div>
      </div>

      {/* Bottom Navigation - Adjusted for mobile */}
      <div className="flex justify-between items-center p-2 sm:p-4 border-t dark:border-gray-700">
        <button
          onClick={handleGoBack}
          className="text-blue-700 dark:text-blue-400 hover:underline text-xs sm:text-sm"
        >
          &larr; Go Back
        </button>
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Time remaining: {formatTime(timer)}
        </div>
      </div>
    </div>
  );
};

export default DummyAdmitCardPage;