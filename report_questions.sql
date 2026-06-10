-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 03, 2026 at 12:47 PM
-- Server version: 11.8.6-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u958214831_Admin_Panel`
--

-- --------------------------------------------------------

--
-- Table structure for table `report_questions`
--

CREATE TABLE `report_questions` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `quiz_type` enum('old_ui','new_ui','current_affairs') NOT NULL DEFAULT 'old_ui',
  `issue_type` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` longblob DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `rating` int(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `is_checked` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `report_questions`
--

INSERT INTO `report_questions` (`id`, `student_id`, `question_id`, `quiz_type`, `issue_type`, `description`, `image`, `remarks`, `rating`, `created_at`, `is_checked`) VALUES
(11, 7, 254, 'old_ui', 'Wrong Translation to Hindi', 'fewfwf', NULL, 'efwfwfwf', 5, '2026-04-22 17:28:01', 0),
(25, 7, 1, 'old_ui', 'Answer not understand', 'dwwdad', NULL, 'awdwadwadwad', 5, '2026-05-03 12:00:37', 0),
(26, 7, 147, 'new_ui', 'Answer not understand', 'report from new ui ', NULL, 'dadawdad', 3, '2026-05-03 12:29:57', 0),
(27, 7, 1, 'current_affairs', 'Explanation Missing', 'reported question from current affairs ', NULL, 'dwadasdasdad', 4, '2026-05-03 12:42:19', 0),
(28, 7, 995, 'old_ui', 'Wrong Translation to Hindi', 'question reported from old ui solutions tab', NULL, 'hyhyththyth', 1, '2026-05-03 12:45:27', 0),
(29, 7, 207, 'new_ui', 'Image not visible', 'question reported from new ui check ', NULL, 'jyjuykuikukuik', 2, '2026-05-03 12:46:37', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `report_questions`
--
ALTER TABLE `report_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `question_id` (`question_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `report_questions`
--
ALTER TABLE `report_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `report_questions`
--
ALTER TABLE `report_questions`
  ADD CONSTRAINT `report_questions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
