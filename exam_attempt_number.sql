-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 16, 2026 at 12:24 PM
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
-- Table structure for table `exam_attempt_number`
--

CREATE TABLE `exam_attempt_number` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `set_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `new_ui` tinyint(1) DEFAULT 0,
  `old_ui` tinyint(1) DEFAULT 0,
  `date_of_submit` date DEFAULT NULL,
  `time_of_submit` time DEFAULT NULL,
  `attempt_number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_attempt_number`
--

INSERT INTO `exam_attempt_number` (`id`, `student_id`, `set_id`, `course_id`, `new_ui`, `old_ui`, `date_of_submit`, `time_of_submit`, `attempt_number`) VALUES
(1, 7, 3, 3, 1, 0, '2026-04-13', '17:12:07', 1),
(2, 8, 3, 3, 1, 0, '2026-04-13', '17:13:42', 1),
(3, 26, 3, 3, 1, 0, '2026-04-13', '17:14:56', 1),
(4, 30, 3, 3, 1, 0, '2026-04-13', '17:16:18', 1),
(5, 21, 3, 3, 1, 0, '2026-04-13', '17:17:45', 1),
(6, 14, 3, 3, 1, 0, '2026-04-13', '17:20:20', 1),
(7, 14, 3, 3, 1, 0, '2026-04-13', '19:34:35', 2),
(8, 14, 3, 3, 1, 0, '2026-04-13', '19:36:03', 3),
(9, 14, 3, 3, 1, 0, '2026-04-13', '19:40:46', 4),
(10, 14, 3, 3, 1, 0, '2026-04-13', '20:54:51', 5),
(11, 14, 3, 3, 0, 1, '2026-04-13', '22:08:20', 6),
(12, 14, 3, 3, 0, 1, '2026-04-13', '22:52:15', 7),
(13, 14, 3, 3, 0, 1, '2026-04-13', '22:53:46', 8),
(14, 7, 3, 3, 0, 1, '2026-04-13', '23:36:19', 2),
(15, 7, 72, 16, 0, 1, '2026-04-14', '00:48:30', 1),
(16, 31, 3, 3, 0, 1, '2026-04-14', '01:15:39', 1),
(17, 26, 72, 16, 0, 1, '2026-04-14', '10:07:31', 1),
(18, 26, 72, 16, 0, 1, '2026-04-14', '10:33:34', 2),
(19, 26, 3, 3, 0, 1, '2026-04-14', '10:34:57', 2),
(20, 26, 72, 16, 1, 0, '2026-04-14', '11:17:31', 3),
(21, 26, 72, 16, 0, 1, '2026-04-14', '11:36:30', 4),
(22, 26, 72, 16, 0, 1, '2026-04-14', '11:38:19', 5),
(23, 26, 3, 3, 0, 1, '2026-04-14', '11:42:14', 3),
(24, 26, 72, 16, 0, 1, '2026-04-14', '11:46:18', 6),
(25, 26, 72, 16, 0, 1, '2026-04-14', '11:52:49', 7),
(26, 26, 72, 16, 0, 1, '2026-04-14', '12:07:42', 8),
(27, 26, 72, 16, 0, 1, '2026-04-14', '12:22:20', 9),
(28, 26, 72, 16, 0, 1, '2026-04-14', '12:25:48', 10),
(29, 7, 3, 3, 0, 1, '2026-04-16', '14:24:04', 3),
(30, 7, 3, 3, 0, 1, '2026-04-16', '15:13:29', 4),
(31, 8, 3, 3, 0, 1, '2026-04-16', '16:14:42', 2),
(32, 26, 72, 16, 0, 1, '2026-04-16', '16:19:34', 11),
(33, 26, 72, 16, 0, 1, '2026-04-16', '17:10:28', 12);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `exam_attempt_number`
--
ALTER TABLE `exam_attempt_number`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `exam_attempt_number`
--
ALTER TABLE `exam_attempt_number`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
