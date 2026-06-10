-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 18, 2026 at 08:40 PM
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
-- Table structure for table `exam_leaderboard`
--

CREATE TABLE `exam_leaderboard` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `set_id` int(11) NOT NULL,
  `total_marks` decimal(10,2) NOT NULL,
  `total_time` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam_leaderboard`
--

INSERT INTO `exam_leaderboard` (`id`, `student_id`, `course_id`, `set_id`, `total_marks`, `total_time`, `created_at`) VALUES
(1, 7, 16, 72, 210.00, 29, '2026-04-08 19:14:34'),
(2, 26, 16, 74, 4.50, 4, '2026-04-09 07:38:23'),
(3, 7, 3, 3, -5.00, 16, '2026-04-13 11:40:36'),
(4, 8, 3, 3, 35.50, 16, '2026-04-13 11:43:42'),
(5, 26, 3, 3, 26.50, 14, '2026-04-13 11:44:56'),
(6, 30, 3, 3, 26.50, 15, '2026-04-13 11:46:18'),
(7, 21, 3, 3, 22.00, 17, '2026-04-13 11:47:45'),
(8, 14, 3, 3, 17.50, 16, '2026-04-13 11:50:20'),
(9, 31, 3, 3, -1.50, 51, '2026-04-13 19:45:39'),
(10, 26, 16, 72, 30.00, 50, '2026-04-14 04:37:31'),
(11, 32, 16, 72, 270.00, 32, '2026-04-20 06:57:35'),
(12, 38, 24, 97, 2.00, 39, '2026-04-29 18:11:12'),
(13, 37, 24, 97, 3.00, 311, '2026-05-03 13:49:22'),
(14, 7, 24, 97, 0.00, 0, '2026-05-17 14:18:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `exam_leaderboard`
--
ALTER TABLE `exam_leaderboard`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_first_attempt` (`student_id`,`set_id`),
  ADD KEY `idx_set_ranking` (`set_id`,`total_marks` DESC,`total_time`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `exam_leaderboard`
--
ALTER TABLE `exam_leaderboard`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
