-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 24, 2026 at 05:13 PM
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
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `exam_set_id` int(11) NOT NULL,
  `subject_name` varchar(255) NOT NULL,
  `time_minutes` int(11) DEFAULT NULL,
  `sectional_time_minutes` int(11) DEFAULT NULL,
  `section_number` int(11) DEFAULT NULL,
  `sub_marks` float DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `exam_set_id`, `subject_name`, `time_minutes`, `sectional_time_minutes`, `section_number`, `sub_marks`, `created_at`) VALUES
(79, 3, 's1', 100, NULL, NULL, 40, '2025-11-12 08:41:01'),
(206, 97, 'General Intelligence & Reasoning', NULL, NULL, NULL, 15, '2026-04-20 12:24:51'),
(207, 97, 'Quantitative Aptitude', NULL, NULL, NULL, 15, '2026-04-20 12:24:51'),
(213, 100, 'SEC1', NULL, 10, 1, 15, '2026-05-23 07:23:28'),
(214, 100, 'SEC2', NULL, 10, 1, 15, '2026-05-23 07:23:28'),
(215, 100, 'SEC3', NULL, 15, 2, 10, '2026-05-23 07:23:28'),
(216, 100, 'SEC4', NULL, 15, 2, 10, '2026-05-23 07:23:28'),
(217, 100, 'SEC5', NULL, 20, 3, 5, '2026-05-23 07:23:28'),
(218, 100, 'SEC6', NULL, 20, 3, 5, '2026-05-23 07:23:28'),
(219, 96, 'SUB1', 1, NULL, NULL, 1, '2026-05-23 07:23:41'),
(220, 96, 'SUB2', 1, NULL, NULL, 1, '2026-05-23 07:41:08');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_set_id` (`exam_set_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=221;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`exam_set_id`) REFERENCES `exam_sets` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
