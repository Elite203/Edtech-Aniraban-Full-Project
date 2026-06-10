================================================================================
                       ANIRBAN'S ACADEMY - WEBSITE OVERVIEW
================================================================================

This document provides a detailed overview of the design, features, architecture, 
and modular components of the Anirban's Academy E-Learning and Examination Platform.

--------------------------------------------------------------------------------
1. PROJECT ARCHITECTURE & STACK
--------------------------------------------------------------------------------
- Frontend: Single Page Application (SPA) powered by React.
  * Routing: React Router DOM (v6).
  * State Management: React Context API (Theme, Cart, Student Profile).
  * Styling: TailwindCSS framework classes with vanilla CSS fallbacks, fully responsive.
  * Animations: GSAP (GreenSock Animation Platform) and Framer Motion.
  * Icons: Lucide React.
  * Charts: Recharts.
  * HTTP client: Axios with credentials.

- Backend: Modular API endpoints written in PHP (located under /api/).
  * Database: MySQL/MariaDB database access using PHP PDO driver.
  * Session Management: PHP native sessions (`session_start`).
  * Integrations: Paytm payment gateway integration, SMTP email sending via PHPMailer.

--------------------------------------------------------------------------------
2. STUDENT FEATURES (STUDENT-FACING PORTAL)
--------------------------------------------------------------------------------
- User Accounts & Profile Management:
  * Email and phone verification, login/registration flows.
  * Student profile database storing photo, age, date of birth, and login logs.

- Exam Portal (Real-time Mock Test Engine):
  * Comprehensive instructions screen (supporting English/Hindi text instructions).
  * Countdown exam timer synchronized with the database to prevent client-side clock tampering.
  * Fullscreen guard mechanism (`FullScreenViolation.jsx`) displaying warning screens and preventing window/tab switching.
  * Interactive question palette displaying the status of each question using color-coded badges:
    - Gray: Not Visited (1)
    - Red: Not Answered (2)
    - Green: Answered (3)
    - Purple (Circle): Marked for Review (4)
    - Purple with Green dot: Answered & Marked for Review (5)
  * Instant auto-submission when the timer expires.
  * Detailed exam results, solutions panel with step-by-step explanations, and an interactive leaderboard displaying pages of student rankings and personal spotlight cards.

- Typing Test Module:
  * Practice typing tests designed for Stenographer and typing-speed exams.
  * Renders setup controls, speed metrics (WPM), accuracy calculations, and text comparison engines.

- E-Commerce & Checkout:
  * Shopping cart (`CartPage.jsx`) supporting item deletion and summary tracking.
  * Dynamic pricing rules matching either a minimum Cart Value Discount or flat/percent discount Coupon Codes (mutually exclusive settings).
  * Dynamic Paytm payment checkout JS overlay loading, callback verification, and success callbacks.
  * Automated invoices generation (base64 PDF saved to database and emailed to the student).
  * Order history panel allowing students to download transactional invoices.

- Study Resources:
  * Free demo video players, downloadable PDF notes, articles, blogs, and book recommendations.
  * Referral System: Subscribers can refer friends, extending both subscriptions (+1 validity day per reference up to 12 times per cycle).

--------------------------------------------------------------------------------
3. ADMIN & TEACHER FEATURES (ADMINISTRATION PORTAL)
--------------------------------------------------------------------------------
- Role-Based Access Control (RBAC):
  * Super Admin: Full database administration access, settings management, coupon code creation, and password configurations.
  * Test Teacher: Granted access only to Test Series courses.
  * Current Affairs Teacher: Granted access only to Current Affairs monthly tests.

- Course Financing Overview (`AdminCourseFinancing.jsx`):
  * Financial reporting module for monthly Current Affairs tests and Test Series courses.
  * Password Protection: Enrolled student numbers and monthly revenue metrics are securely locked behind hashed passwords. Teachers must input passwords to unlock detailed summaries.

- Test Series & Curriculum Builder (`AdminTestSeriesPage.jsx`):
  * Add, edit, or delete courses, chapters, topics, exam sets, and questions.
  * In-house WYSIWYG rich text editor (`CustomRichTextEditor.jsx`) supporting custom toolbar items to insert question status palette legend markers. Includes auto-translation to insert text in Hindi or English depending on context.

- System Configuration Page (`AdminSettingsPage.jsx`):
  * Customize site headers, contact info, support channels, and legal policies.
  * Broadcast notifications, manage homepage banner modals, and update promo videos.

- Activity Auditing:
  * Student Activity Tracker: Audit logins, devices, IP addresses, and timestamps.
  * Teacher Activity Tracker: Keep timestamps of admin panels access and configuration changes.

--------------------------------------------------------------------------------
4. DATABASE COMPONENT MODULES (.SQL FILES)
--------------------------------------------------------------------------------
- `students.sql` & `admins.sql`: Store credentials, session tokens, photos, and roles.
- `courses.sql`, `chapters.sql`, `chapter_topics.sql`, `exam_sets.sql`: Curriculum tables.
- `questions.sql` & `passages.sql`: Hold mock test database records and text snippets.
- `monthly_test_purchases.sql` & `test_series_purchases.sql`: Log payment details.
- `financing_passwords.sql`: Holds BCRYPT-hashed access passwords for financing sections.
- `cart_discounts.sql` & `coupons.sql`: Manage active sales discount triggers.
- `students_activity.sql` & `teacher_activity.sql`: Audit log tables.

================================================================================
