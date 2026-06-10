import React, { lazy, useEffect, Suspense, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/Footer";
import HomePage from "@/pages/Public/HomePage";
import LoginPage from "@/pages/Auth/LoginPage";
import SignupPage from "@/pages/Auth/SignupPage";
import CartPage from "@/pages/User/CartPage";
import ForgotPasswordPage from "@/pages/Auth/ForgotPasswordPage";
import LoadingOverlay from "@/components/LoadingOverlay";

// Lazy-loaded components...
const CoursesPage = lazy(() => import("@/pages/Public/CoursesPage"));
const CourseDetailPage = lazy(() => import("@/pages/Public/CourseDetailPage"));
const AboutPage = lazy(() => import("@/pages/Public/AboutPage"));
const ContactPage = lazy(() => import("@/pages/Public/ContactPage"));
const MobileAppComingSoonPage = lazy(() => import("@/pages/Public/MobileAppComingSoonPage"));
const FreePdfNotesPage = lazy(() => import("@/pages/Public/FreePdfNotesPage"));
const BooksStudyMaterialPage = lazy(() => import("@/pages/Public/BooksStudyMaterialPage"));
const CurrentAffairsPage = lazy(() => import("@/pages/CurrentAffairs/CurrentAffairsPage"));
const BlogPage = lazy(() => import("@/pages/Public/BlogPage"));
const DownloadsPage = lazy(() => import("@/pages/Public/DownloadsPage"));
const TypingTestPage = lazy(() => import("@/pages/Exam/TypingTestPage"));
const TypingTestSetupPage = lazy(() => import("@/pages/Exam/TypingTestSetupPage"));
const DemoPage = lazy(() => import("@/pages/Public/DemoPage"));
const PolicyPage = lazy(() => import("@/pages/Public/PolicyPage"));
const JobVacancyPage = lazy(() => import("@/pages/Public/JobVacancyPage"));
const AskDoubtPage = lazy(() => import("@/pages/Public/AskDoubtPage"));
const PerformanceAnalysis = lazy(() => import("@/pages/Performance/PerformanceAnalysis"));
const PerformanceLeaderboard = lazy(() => import("@/pages/Performance/PerformanceLeaderboard"));
const PerformanceCompare = lazy(() => import("@/pages/Performance/PerformanceCompare"));
const PerformanceSolution = lazy(() => import("@/pages/Performance/PerformanceSolution"));
const QuestionDetailPage = lazy(() => import("@/pages/User/QuestionDetailPage"));
const ExamSolutionPage = lazy(() => import("@/pages/Exam/ExamSolutionPage"));
const FeatureDetails = lazy(() => import("@/pages/Public/FeatureDetails"));

// User Dashboard components
const Dashboard = lazy(() => import("@/user dashboard/components/Dashboard"));
const UserDashboard = lazy(() => import("@/user dashboard/components/UserDashboard"));
const UserProfile = lazy(() => import("@/user dashboard/components/UserProfile"));
const UserOrders = lazy(() => import("@/user dashboard/components/UserOrders"));
const Bookmarks = lazy(() => import("@/user dashboard/components/Bookmarks"));
const Reviews = lazy(() => import("@/user dashboard/components/Reviews"));
const Report = lazy(() => import("@/user dashboard/components/Report"));

const SSCReg = lazy(() => import("@/components/NewUI/SSCReg"));
const SSCWelcome = lazy(() => import("@/components/NewUI/SSCWelcome"));
const SSCLogin = lazy(() => import("@/components/NewUI/SSCLogin"));
const SSCVerify = lazy(() => import("@/components/NewUI/SSCVerify"));
const SSCPledge = lazy(() => import("@/components/NewUI/SSCPledge"));
const SSCCustomPage = lazy(() => import("@/components/NewUI/SSCcustomPage"));
const SSCInstructions = lazy(() => import("@/components/NewUI/SSCInstructions"));
const SSCSymbols = lazy(() => import("@/components/NewUI/SSCSymbols"));
const SSCLanguage = lazy(() => import("@/components/NewUI/SSCLanguage"));
const SSCSubjects = lazy(() => import("@/components/NewUI/SSCSubjects"));
const SSCMainExamPage = lazy(() => import("@/components/NewUI/SSCMainExamPage"));
const SSCOverallTestSummary = lazy(() => import("@/components/NewUI/SSCOverallTestSummary"));
const SSCThankYouPage = lazy(() => import("@/components/NewUI/SSCThankYouPage"));
const Current_Affairs_Exam_Instruction_Page = lazy(() => import("@/pages/Current_Affairs_Exam_Components/Current_Affairs_Exam_Instruction_Page"));
const Current_Affairs_Exam_Start_Page = lazy(() => import("@/pages/Current_Affairs_Exam_Components/Current_Affairs_Exam_Start_Page"));
const Current_Affairs_Exam_Page = lazy(() => import("@/pages/Current_Affairs_Exam_Components/Current_Affairs_Exam_Page"));
const Current_Affairs_ExamResult_Page = lazy(() => import("@/pages/Current_Affairs_Exam_Components/Current_Affairs_ExamResult_Page"));
const MonthlyTestPaymentPage = lazy(() => import("@/pages/CurrentAffairs/MonthlyTestPaymentPage"));
const MonthlyTestReferralPaymentPage = lazy(() => import("@/pages/CurrentAffairs/MonthlyTestReferralPaymentPage"));
const TestSeriesReferralPaymentPage = lazy(() => import("@/pages/User/TestSeriesReferralPaymentPage"));
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { CartProvider } from "@/contexts/CartContext";
import Preloader from "@/components/PreLoader";
import { Helmet } from "react-helmet-async";
import NotFoundPage from "@/pages/NotFound";
import TestPage from "@/pages/Exam/TestPage";
import CurrentAffairsData from "@/pages/CurrentAffairs/CurrentAffairsData";
import SummaryPage from "@/pages/User/SummaryPage";
import CategoryPage from "@/pages/Public/CategoryPage";
import MonthlyTest from "@/pages/Exam/MonthlyTest";
import Performance from "@/pages/Performance/Performance";
import ExamInstructionsPage from "@/pages/Exam/ExamInstructionsPage";
import ExamStartPage from "@/pages/Exam/ExamStartPage";
import ExamQuestionPage from "@/pages/Exam/ExamQuestionPage";
import ExamResultPage from "@/pages/Exam/ExamResultPage";
import DummyAdmitCardPage from "@/pages/Exam/DummyAdmitCardPage";
import ExamLoginPage from "@/pages/Auth/ExamLoginPage";
import AdminLoginPage from "@/pages/Admin/AdminLoginPage";
import ResetPasswordPage from "@/pages/Auth/ResetPasswordPage";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminUsersPage from "@/pages/Admin/AdminUsersPage";
import AdminChangePasswordPage from "@/pages/Admin/AdminChangePasswordPage";
import AdminSettingsPage from "@/pages/Admin/AdminSettingsPage";
import AdminCurrentAffairsPage from "@/pages/Admin/AdminCurrentAffairsPage";
import AdminTestSeriesPage from "@/pages/Admin/AdminTestSeriesPage";
import AdminDemoVideosPage from "@/pages/Admin/AdminDemoVideosPage";
import AdminAddTeachersPage from "@/pages/Admin/AdminAddTeachersPage";
import AdminUserActivityPage from "@/pages/Admin/AdminTeacherActivityPage";
import AdminStudentActivityPage from "@/pages/Admin/AdminStudentActivityPage";
import AdminQueriesPage from "@/pages/Admin/AdminQueriesPage";
import AdminReportQuestion from "@/pages/Admin/AdminReportQuestion";
import AdminPopupBannerPage from "@/pages/Admin/AdminPopupBannerPage";
import AdminDiscountsPage from "@/pages/Admin/AdminDiscountsPage";
import AdminOfficialSyllabus from "@/pages/Admin/AdminOfficialSyllabus";
import Broadcast from "@/pages/Admin/Broadcast";
import AdminCourseFinancing from "@/pages/Admin/AdminCourseFinancing";
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider as AdminThemeProvider } from '@/contexts/ThemeContext';

// Register GSAP plugins
try {
  // useGSAP is a hook, not a plugin. Registering it can cause issues in some environments.
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
} catch (e) {
  console.warn('GSAP plugin registration failed:', e);
}

// Global safety for GSAP internal objects that might be missing methods in minified builds
// specifically targeting the 'Oo.refresh/kill is not a function' errors
const ensureGsapMethods = (obj) => {
  if (obj && typeof obj === 'object') {
    if (typeof obj.refresh !== 'function') obj.refresh = () => { };
    if (typeof obj.kill !== 'function') obj.kill = () => { };
  }
  return obj;
};

// Apply defensive stubs to main plugins
if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger) {
  if (typeof ScrollTrigger.refresh !== 'function') ScrollTrigger.refresh = () => { };
  if (typeof ScrollTrigger.kill !== 'function') ScrollTrigger.kill = () => { };
}

// Admin Routes Component
const AdminRoutes = () => (
  <AuthProvider>
    <AdminThemeProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="student-activity" element={<AdminStudentActivityPage />} />
        <Route path="add-teachers" element={<AdminAddTeachersPage />} />
        <Route path="user-activity" element={<AdminUserActivityPage />} />
        <Route path="current-affairs" element={<AdminCurrentAffairsPage />} />
        <Route path="test-series" element={<AdminTestSeriesPage />} />
        <Route path="demo-videos" element={<AdminDemoVideosPage />} />
        <Route path="queries" element={<AdminQueriesPage />} />
        <Route path="reported-questions" element={<AdminReportQuestion />} />
        <Route path="broadcast" element={<Broadcast />} />
        <Route path="official-syllabus" element={<AdminOfficialSyllabus />} />
        <Route path="popup-banner" element={<AdminPopupBannerPage />} />
        <Route path="discounts" element={<AdminDiscountsPage />} />
        <Route path="course-financing" element={<AdminCourseFinancing />} />
        <Route path="change-password" element={<AdminChangePasswordPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Routes>
    </AdminThemeProvider>
  </AuthProvider>
);

function ScrollToTopOnRouteChange({ setIsLoading }) {
  const location = useLocation();
  const prevLocationRef = useRef(null);

  useEffect(() => {
    const authPages = ['/login', '/signup', '/forgot-password', '/anirban/login', '/anirban/reset-password'];
    const isAuthPage = authPages.includes(location.pathname);
    const isAdminPage = location.pathname.startsWith('/anirban');
    const wasAdminPage = prevLocationRef.current?.startsWith('/anirban');
    
    // Update previous location reference
    prevLocationRef.current = location.pathname;
    
    // Skip loading for admin-to-admin navigation (instant transition)
    if (isAdminPage && wasAdminPage) {
      setIsLoading(false);
      gsap.killTweensOf("*");
      if (!location.hash) {
        window.scrollTo({ top: 0, behavior: 'auto' }); 
      }
      return;
    }
    
    // Show loading for non-admin and non-auth navigation
    if (!isAuthPage) {
      setIsLoading(true);
    } else {
      // For auth pages, ensure any existing loading state is cleared immediately
      setIsLoading(false);
    }
    
    // Clear any GSAP animations that might be running
    gsap.killTweensOf("*");
    
    // Only scroll to top on pathname change (not hash change)
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' }); 
    }
    
    // Set a timeout to turn off loading.
    // This gives GSAP cleanup (from ConditionalScrollSmoother) time to finish
    // before the new page content is made visible.
    setTimeout(() => {
      try {
        const noSmoothScrollRoutes = [
          '/anirban', '/dashboard', '/login', '/signup', '/forgot-password',
          '/exam/instructions', '/exam/start', '/exam/question', '/exam/result', '/exam/login',
          '/ssc/instructions', '/ssc/symbols', '/ssc/language', '/ssc/subjects', '/ssc/main-exam', '/ssc/overall-summary', '/ssc/thank-you',
          '/current-affairs-exam',
          '/premium-monthly-test'
        ];
        const isNoSmoothScrollPage = noSmoothScrollRoutes.some(route => location.pathname.startsWith(route));

        if (!isAuthPage && !isNoSmoothScrollPage) {
          if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger && typeof ScrollTrigger.refresh === 'function') {
            try {
              ScrollTrigger.refresh();
            } catch (e) {
              console.warn('ScrollTrigger.refresh internal error:', e);
            }
          }
        }
      } catch (error) {
        console.warn('ScrollToTopOnRouteChange error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

  }, [location.pathname, setIsLoading]); // This dependency is correct

  return null;
}

// Component to conditionally initialize ScrollSmoother
function ConditionalScrollSmoother() {
  const location = useLocation();
  
  useGSAP(() => {
    // This effect runs *after* React has updated the DOM for the new route
    
    // Define all routes that should NOT use ScrollSmoother
    const noSmoothScrollRoutes = [
      '/anirban',
      '/dashboard',
      '/login',
      '/signup',
      '/forgot-password',
      '/exam/instructions',
      '/exam/start',
      '/exam/question',
      '/exam/result',
      '/exam/login',
      '/ssc/instructions',
      '/ssc/symbols',
      '/ssc/language',
      '/ssc/subjects',
      '/ssc/main-exam',
      '/ssc/overall-summary',
      '/ssc/thank-you',
      '/current-affairs-exam/instructions',
      '/current-affairs-exam/start',
      '/current-affairs-exam/question',
      '/current-affairs-exam/result',
      '/current-affairs-exam',
      '/premium-monthly-test'
    ];

    // For stability and to prevent React DOM reconciliation crashes during state updates,
    // we disable ScrollSmoother across the application.
    const isNoSmoothScrollPage = true;
    
    // --- IMPROVED LOGIC ---
    // If we are on a page that should NOT have smooth scroll, kill it immediately.
    if (isNoSmoothScrollPage) {
      if (typeof ScrollSmoother !== 'undefined' && ScrollSmoother && typeof ScrollSmoother.get === 'function') {
        try {
          const existingSmoother = ScrollSmoother.get();
          if (existingSmoother && typeof existingSmoother.kill === 'function') {
            existingSmoother.kill();
          }
        } catch (e) {
          console.warn('Failed to kill existing smoother:', e);
        }
      }
      return;
    }

    let smoother; 
    const timer = setTimeout(() => {
      try {
        if (typeof ScrollSmoother !== 'undefined' && ScrollSmoother && typeof ScrollSmoother.create === 'function') {
          // Double check if we navigated away before timeout
          const currentNoSmooth = noSmoothScrollRoutes.some(route => window.location.pathname.startsWith(route));
          if (currentNoSmooth) return;

          smoother = ScrollSmoother.create({
            smooth: 2,
            effects: true,
            smoothTouch: 0.1,
            normalizeScroll: false,
            ignoreMobileResize: true,
          });
        }
      } catch (error) {
        console.warn('ScrollSmoother.create internal error:', error);
      }
    }, 1500); // Increased timeout to ensure DOM is fully settled
    
    return () => {
      clearTimeout(timer);
      if (typeof ScrollSmoother !== 'undefined' && ScrollSmoother && typeof ScrollSmoother.get === 'function') {
        try {
          const activeSmoother = ScrollSmoother.get();
          if (activeSmoother && typeof activeSmoother.kill === 'function') {
            activeSmoother.kill();
          }
        } catch (e) {}
      }
      
      // Also kill all ScrollTriggers created by the previous page safely
      if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger && typeof ScrollTrigger.getAll === 'function') {
        try {
          const allTriggers = ScrollTrigger.getAll();
          if (Array.isArray(allTriggers)) {
            allTriggers.forEach(trigger => {
              if (trigger && typeof trigger.kill === 'function') {
                try { trigger.kill(); } catch (e) {}
              }
            });
          }
        } catch (e) {}
      }
    };

  }, [location.pathname]); // Re-run this logic on every path change

  return null; // This component renders nothing
}

function AppContent({ isLoading, setIsLoading }) {
  // ... (rest of AppContent is unchanged)
  const location = useLocation();
  
  // Determine if current page is an auth page
  const authPages = ['/login', '/signup', '/forgot-password', '/anirban/login', '/anirban/reset-password'];
  const isAuthPage = authPages.includes(location.pathname);
  
  return (
    <>
      <ScrollToTopOnRouteChange setIsLoading={setIsLoading} />
      <ConditionalScrollSmoother />
      <LoadingOverlay isVisible={isLoading} />
      <div id="smooth-wrapper" style={isAuthPage ? { visibility: 'visible', pointerEvents: 'auto' } : (isLoading ? { visibility: 'hidden', pointerEvents: 'none' } : { visibility: 'visible', pointerEvents: 'auto' })}>
        <div id="smooth-content" className="flex flex-col min-h-screen">
          <Suspense fallback={<Preloader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Admin Routes - wrapped with AuthProvider */}
            <Route path="/anirban/*" element={<AdminRoutes />} />

            {/* User Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<UserDashboard />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="orders" element={<UserOrders />} />
              <Route path="bookmarks" element={<Bookmarks />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="report" element={<Report />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />

              {/* Routes with Navbar and Footer */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <HomePage />
                  </main>
                  <Footer />
                </>
              } />
                <Route path="/test" element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <TestPage/>
                  </main>
                  <Footer />
                </>
              } />

            <Route path="/courses" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <CoursesPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/courses/:id" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <CourseDetailPage />
                </main>
                <Footer />
              </>
            } />
                  <Route path="/exam/instructions/:course_id/:exam_set_id/:set_number" element={
                  <>
                    <main className="flex-grow">
                      <ExamInstructionsPage/>
                    </main>
                  </>
                } />
        
                  <Route path="/exam/start/:course_id/:exam_set_id/:set_number" element={
                  <>
                    <main className="flex-grow">
                      <ExamStartPage/>
                    </main>
                  </>
                } />
            <Route path="/exam/question/:course_id/:exam_set_id/:set_number" element={
                  <>
                    <main className="flex-grow">
                      <ExamQuestionPage/>
                    </main>
                  </>
                } />
                <Route path="/exam/result/:course_id/:exam_set_id/:set_number" element={
                  <>
                    <main className="flex-grow">
                      <ExamResultPage/>
                    </main>
                  </>
                } />
                <Route path="/exam-solution/:course_id/:exam_set_id/:set_number/:question_index/:courseSlug/:setSlug/:slug" element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ExamSolutionPage />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/exam/solution/:course_id/:exam_set_id/:set_number/:question_index" element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <ExamSolutionPage />
                    </main>
                    <Footer />
                  </>
                } />
                <Route path="/ssc/mock-login" element={<SSCReg />} />
                <Route path="/ssc/welcome" element={<SSCWelcome />} />
                <Route path="/ssc/login" element={<SSCLogin />} />
                <Route path="/ssc/verify" element={<SSCVerify />} />
                <Route path="/ssc/pledge" element={<SSCPledge />} />
                <Route path="/ssc/custom" element={<SSCCustomPage />} />
                <Route path="/ssc/instructions" element={<SSCInstructions />} />
                <Route path="/ssc/symbols" element={<SSCSymbols />} />
                <Route path="/ssc/language" element={<SSCLanguage />} />
                <Route path="/ssc/subjects" element={<SSCSubjects />} />
                <Route path="/ssc/main-exam" element={<SSCMainExamPage />} />
                <Route path="/ssc/overall-summary" element={<SSCOverallTestSummary />} />
                <Route path="/ssc/thank-you" element={<SSCThankYouPage />} />
                <Route path="/exam/login" element={<ExamLoginPage />} />
                <Route path="/current-affairs-exam/instructions" element={<AdminThemeProvider><Current_Affairs_Exam_Instruction_Page /></AdminThemeProvider>} />
                <Route path="/current-affairs-exam/start" element={<AdminThemeProvider><Current_Affairs_Exam_Start_Page /></AdminThemeProvider>} />
                <Route path="/current-affairs-exam/question" element={<AdminThemeProvider><Current_Affairs_Exam_Page /></AdminThemeProvider>} />
                <Route path="/current-affairs-exam/result/:quiz_id" element={<AdminThemeProvider><Current_Affairs_ExamResult_Page /></AdminThemeProvider>} />
                

            

                
                
            <Route path="/contact" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <ContactPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/about" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <AboutPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/category-page/:category" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <CategoryPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/current-affairs" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <CurrentAffairsPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/current-affairs-data" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <CurrentAffairsData />
                </main>
                <Footer />
              </>
            } />
            <Route path="/premium-monthly-test" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <MonthlyTestPaymentPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/premium-monthly-test-referral" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <MonthlyTestReferralPaymentPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/test-series-referral" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <TestSeriesReferralPaymentPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/blog" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <BlogPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/downloads" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <DownloadsPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/typing-test" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <TypingTestPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/typing-test-setup" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <TypingTestSetupPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/demo" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <DemoPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/terms-and-conditions" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <PolicyPage policyType="Terms & Conditions" />
                </main>
                <Footer />
              </>
            } />
            <Route path="/privacy-policy" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <PolicyPage policyType="Privacy Policy" />
                </main>
                <Footer />
              </>
            } />
            <Route path="/refund-and-cancellation-policy" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <PolicyPage policyType="Refund & Cancellation Policy" />
                </main>
                <Footer />
              </>
            } />
            <Route path="/shipping-and-delivery-policy" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <PolicyPage policyType="Shipping & Delivery Policy" />
                </main>
                <Footer />
              </>
            } />
            <Route path="/job-vacancy" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <JobVacancyPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/ask-doubt" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <AskDoubtPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/free-pdf-notes" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <FreePdfNotesPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/books-study-material" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <BooksStudyMaterialPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/mobile-app-coming-soon" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <MobileAppComingSoonPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/monthly-test" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <MonthlyTest />
                </main>
                <Footer />
              </>
            } />
            <Route path="/cart" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <CartPage />
                </main>
                <Footer />
              </>
            } />

            <Route path="/summary/:slug" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <SummaryPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/performance" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Performance />
                </main>
                <Footer />
              </>
            } />
            <Route path="/performance-analysis" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <PerformanceAnalysis />
                </main>
                <Footer />
              </>
            } />
            <Route path="/performance-leaderboard" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <PerformanceLeaderboard />
                </main>
                <Footer />
              </>
            } />
            <Route path="/performance-compare" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <PerformanceCompare />
                </main>
                <Footer />
              </>
            } />
            <Route path="/performance-solution" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <PerformanceSolution />
                </main>
                <Footer />
              </>
            } />
            <Route path="/question/:id" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <QuestionDetailPage />
                </main>
                <Footer />
              </>
            } />
            <Route path="/feature-details" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <FeatureDetails />
                </main>
                <Footer />
              </>
            } />
          </Routes>
          </Suspense>
        </div>
      </div>
    </>
  );
}

function App() {
  // ... (rest of App component is unchanged)
  const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
    const handleContextmenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextmenu);

    const handleKeyDown = (e) => {
      // Allow keyboard shortcuts if the user is in an input, textarea, or contenteditable element
      const isInput = e.target.tagName === 'INPUT' || 
                      e.target.tagName === 'TEXTAREA' || 
                      e.target.isContentEditable;

      if (isInput) return;

      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key.toLowerCase() === "c"))
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflowX = "hidden";

    // Set up global GSAP error handling
    gsap.config({
      nullTargetWarn: false,
      trialWarn: false
    });

    // Add global error handler for GSAP
    window.addEventListener('error', (event) => {
      if (event.message && (
        event.message.includes('play is not a function') || 
        event.message.includes('refresh is not a function') ||
        event.message.includes('kill is not a function')
      )) {
        event.preventDefault();
        console.warn('GSAP internal error suppressed and handled defensively');
      }
    });

    // Ensure scrollbar position is properly tracked during smooth scrolling
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.update();
        }
      }, 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener("contextmenu", handleContextmenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflowX = "auto";
      clearTimeout(scrollTimeout);
      
      // Clean up all GSAP instances on unmount
      gsap.killTweensOf("*");
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger && typeof trigger.kill === 'function') {
          trigger.kill();
        }
      });
      const smoother = ScrollSmoother.get();
      if (smoother && typeof smoother.kill === 'function') {
        smoother.kill();
      }
    };
  }, []);
 
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <CartProvider>
        <Router>
          <AppContent isLoading={isLoading} setIsLoading={setIsLoading} />
          <Toaster />
          <ScrollToTopButton />
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;

