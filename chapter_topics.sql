-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Mar 26, 2026 at 11:47 AM
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
-- Table structure for table `chapter_topics`
--

CREATE TABLE `chapter_topics` (
  `id` int(11) NOT NULL,
  `chapter_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chapter_topics`
--

INSERT INTO `chapter_topics` (`id`, `chapter_id`, `name`, `created_at`) VALUES
(1, 1, 'TOPIC1', '2026-02-28 12:16:10'),
(2, 1, 'TOPIC2', '2026-02-28 12:16:16'),
(3, 2, 'percentage', '2026-02-28 14:05:31'),
(4, 2, 'Ratio & proportion', '2026-02-28 14:05:53'),
(5, 2, '3d mensuration', '2026-02-28 14:06:17'),
(6, 1, 'ms ppt', '2026-02-28 14:06:29'),
(7, 1, 'networking', '2026-02-28 14:06:47'),
(8, 1, 'dbms', '2026-02-28 14:06:55'),
(9, 1, 'linux os', '2026-02-28 14:07:33'),
(10, 3, 'mughals', '2026-02-28 14:17:07'),
(11, 1, 'EXCEL', '2026-02-28 14:31:01'),
(12, 1, 'PYTHON', '2026-02-28 15:14:47'),
(13, 4, 'RIVER', '2026-02-28 15:19:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chapter_topics`
--
ALTER TABLE `chapter_topics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chapter_id` (`chapter_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chapter_topics`
--
ALTER TABLE `chapter_topics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chapter_topics`
--
ALTER TABLE `chapter_topics`
  ADD CONSTRAINT `chapter_topics_ibfk_1` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
