-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 18, 2026 at 09:14 PM
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
-- Table structure for table `exam_sets`
--

CREATE TABLE `exam_sets` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `exam_name` varchar(255) NOT NULL,
  `set_number` int(11) NOT NULL,
  `set_name` varchar(255) NOT NULL DEFAULT '',
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `total_time_minutes` int(11) DEFAULT NULL,
  `negative_marking` float DEFAULT 0,
  `positive_marking` float DEFAULT 0,
  `is_sectional_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_sets`
--

INSERT INTO `exam_sets` (`id`, `course_id`, `exam_name`, `set_number`, `set_name`, `is_paid`, `total_time_minutes`, `negative_marking`, `positive_marking`, `is_sectional_enabled`, `created_at`) VALUES
(3, 3, 'c exam 1', 1, 'Hey', 0, NULL, 0.5, 4, 0, '2025-10-16 09:04:57'),
(96, 3, 'c exam 1', 2, 'SECTION', 0, NULL, 0.2, 1, 0, '2026-04-08 19:11:54'),
(97, 24, 'exam tesing for demo 1 ', 5, 'demo set name test (total time)', 0, 60, 0.5, 1, 0, '2026-04-20 10:08:21');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `exam_sets`
--
ALTER TABLE `exam_sets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `exam_sets`
--
ALTER TABLE `exam_sets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `exam_sets`
--
ALTER TABLE `exam_sets`
  ADD CONSTRAINT `exam_sets_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
