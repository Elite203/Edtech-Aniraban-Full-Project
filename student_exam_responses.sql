-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 19, 2026 at 06:18 PM
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
-- Table structure for table `student_exam_responses`
--

CREATE TABLE `student_exam_responses` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `set_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `selected_key` varchar(10) DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `time_spent` int(11) DEFAULT 0,
  `marked_for_review` tinyint(1) DEFAULT 0,
  `attempt_number` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_exam_responses`
--

INSERT INTO `student_exam_responses` (`id`, `student_id`, `course_id`, `set_id`, `question_id`, `selected_key`, `is_correct`, `time_spent`, `marked_for_review`, `attempt_number`, `created_at`) VALUES
(1, 7, 3, 96, 254, 'd', 0, 5, 0, 11, '2026-05-19 18:14:09'),
(2, 7, 3, 96, 255, 'a', 0, 2, 0, 11, '2026-05-19 18:14:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `student_exam_responses`
--
ALTER TABLE `student_exam_responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `set_id` (`set_id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `attempt_number` (`attempt_number`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `student_exam_responses`
--
ALTER TABLE `student_exam_responses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
