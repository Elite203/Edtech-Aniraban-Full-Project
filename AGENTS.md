please implement the change without changing the originality of the code, making it mobile responsive, keeping dark/light mode compatible, do not run browser navigate, do not run any kind of tests and do not start or restart the dev server too also you just focus on the problem implement the fix and I will do the testing part and give a very short summary of changes made not so long and do not create a documentation readme file do not run E2E tests I am telling you not to verify the fix by running a development environment got my point.
Do not use powershell, bash or python commands for file search. Do not us js script either for file or content search.

# Repository Configuration

## Project Type
React + Vite frontend application with PHP backend API

## Target Framework
**targetFramework: Playwright**

## Key Stack
- Frontend: React 18, Vite, Tailwind CSS
- Backend: PHP with PDO
- State Management: React Context (Auth, Cart, Theme)
- API Communication: Axios

## Important APIs
- `get_questions.php` - Fetch questions with Base64 encoded image URLs
- `get_exam_questions_by_language.php` - Fetch language-specific questions
- `get_course_exam_questions_api.php` - Fetch exam questions (fallback)

## Recent Changes
- Fixed AdminTestSeriesPage.jsx "Add Set" form: openAddSetForm now initializes is_paid: 0
- Added Set Type (FREE/PAID) selector to Add Set Form modal with full dark/light mode support
- Mobile responsive with flex-wrap gap-4 md:gap-6 for radio button layout
- Modified ExamQuestionPage.jsx to fetch questions from get_questions.php with proper image handling
- Updated QuestionSection.jsx to display question_image_url with Base64 data URLs
- Added fallback chain: get_questions.php → get_course_exam_questions_api.php

## Mobile Responsive
All components use Tailwind CSS responsive classes (sm:, md:, lg:)

## Dark/Light Mode
ThemeContext provider manages theme; all components use `dark:` prefixed Tailwind classes