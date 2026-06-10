-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 01, 2025 at 04:28 PM
-- Server version: 11.8.3-MariaDB-log
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
-- Table structure for table `instructions_one`
--

CREATE TABLE `instructions_one` (
  `id` int(11) NOT NULL,
  `exam_set_id` int(11) NOT NULL,
  `title_english` varchar(255) NOT NULL,
  `instruction_english` longtext NOT NULL,
  `title_hindi` varchar(255) NOT NULL,
  `instruction_hindi` longtext NOT NULL,
  `images` longblob,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `instructions_one`
--

INSERT INTO `instructions_one` (`id`, `exam_set_id`, `title_english`, `instruction_english`, `title_hindi`, `instruction_hindi`, `created_at`, `updated_at`) VALUES
(1, 3, 'english title', '<p>adwdsadadasda</p>', 'hindi title', '<ol><li class=\"ql-align-center\">wdadawdawddawda<strong>dawdad<em>dawd<u>dawd</u><s><u>awdawddawda</u></s></em></strong></li></ol>', '2025-10-26 11:20:57', '2025-10-26 11:21:14');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `instructions_one`
--
ALTER TABLE `instructions_one`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_set_id` (`exam_set_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `instructions_one`
--
ALTER TABLE `instructions_one`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `instructions_one`
--
ALTER TABLE `instructions_one`
  ADD CONSTRAINT `instructions_one_ibfk_1` FOREIGN KEY (`exam_set_id`) REFERENCES `exam_sets` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
