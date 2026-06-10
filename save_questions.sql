-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 16, 2026 at 04:37 PM
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
-- Table structure for table `save_questions`
--

CREATE TABLE `save_questions` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `quiz_type` enum('old_ui','new_ui','current_affairs') NOT NULL DEFAULT 'old_ui',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `save_questions`
--

INSERT INTO `save_questions` (`id`, `student_id`, `question_id`, `quiz_type`, `created_at`) VALUES
(9, 7, 128, 'old_ui', '2026-04-06 11:15:43'),
(12, 14, 147, 'old_ui', '2026-04-13 15:21:40'),
(17, 7, 147, 'old_ui', '2026-04-18 17:59:18'),
(18, 7, 202, 'old_ui', '2026-04-18 18:23:23'),
(19, 33, 220, 'old_ui', '2026-04-21 07:49:32'),
(23, 7, 1, 'old_ui', '2026-05-03 12:04:48'),
(25, 33, 3, 'current_affairs', '2026-05-04 06:16:26'),
(26, 33, 2, 'current_affairs', '2026-05-16 15:39:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `save_questions`
--
ALTER TABLE `save_questions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_save` (`student_id`,`question_id`),
  ADD KEY `question_id` (`question_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `save_questions`
--
ALTER TABLE `save_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `save_questions`
--
ALTER TABLE `save_questions`
  ADD CONSTRAINT `save_questions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
