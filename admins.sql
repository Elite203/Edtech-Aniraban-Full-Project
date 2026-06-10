-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 09, 2025 at 09:34 AM
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
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','test_teacher','ca_teacher') NOT NULL DEFAULT 'super_admin',
  `status` enum('active','suspended') NOT NULL DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `two_factor_secret` varchar(32) DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `reset_token` varchar(64) DEFAULT NULL,
  `reset_expires` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`, `status`, `last_login`, `created_at`, `updated_at`, `two_factor_enabled`, `two_factor_secret`, `two_factor_recovery_codes`, `reset_token`, `reset_expires`) VALUES
(1, 'Hardik', 'whatuwant470@gmail.com', 'admin123', 'super_admin', 'active', '2025-10-09 09:01:19', '2025-10-03 15:11:43', '2025-10-09 09:01:19', 1, '4PZ2OM4RW4LO74FY', NULL, '55df6d13b1fe73d23493bd0875e7caf4b84f08807925bfd61af96de4b47ed178', '2025-10-06 11:40:31'),
(2, 'Anirban', 'akmondal58@gmail.com', 'akmondal123', 'super_admin', 'active', '2025-10-09 08:12:47', '2025-10-06 07:06:16', '2025-10-09 08:12:47', 1, '7HIKTOYQB6ZHYX23', NULL, NULL, NULL),
(3, 'Test', 'solankihardik334@gmail.com', 'admin123', 'super_admin', 'active', '2025-10-09 09:29:21', '2025-10-06 05:02:14', '2025-10-09 09:29:21', 1, 'ZXDAANH7FCHX2AFA', NULL, NULL, NULL),
(4, 'CA Test', 'test@gmail.com', 'admin123', 'ca_teacher', 'suspended', '2025-10-06 06:24:26', '2025-10-06 05:58:59', '2025-10-07 09:08:46', 0, NULL, NULL, NULL, NULL),
(5, 'Test Teacher', 'test1@gmail.com', 'admin123', 'test_teacher', 'active', NULL, '2025-10-06 11:02:02', '2025-10-06 11:02:02', 0, NULL, NULL, NULL, NULL),
(6, 'Ravi Sharma', 'ravi@anirbansacademy.com', 'Ravi@123', 'ca_teacher', 'active', NULL, '2025-10-06 12:06:03', '2025-10-06 12:06:03', 0, NULL, NULL, NULL, NULL),
(7, 'speed demon', 'speeddemon@gmail.com', 'admin', 'ca_teacher', 'active', NULL, '2025-10-06 12:23:16', '2025-10-06 12:23:16', 0, NULL, NULL, NULL, NULL),
(8, 'Keshav Aggarwal', 'keshav@gmail.com', 'admin', 'test_teacher', 'active', NULL, '2025-10-06 12:24:42', '2025-10-06 12:24:42', 0, NULL, NULL, NULL, NULL),
(9, 'KartikBhai', 'kartik@gmail.com', 'admin123', 'test_teacher', 'active', NULL, '2025-10-06 12:31:09', '2025-10-07 08:18:12', 0, NULL, NULL, NULL, NULL),
(13, 'Testing Again1', 'desikalakar69@rediffmail.com', 'admin123', 'ca_teacher', 'suspended', NULL, '2025-10-07 05:48:35', '2025-10-07 07:38:21', 0, NULL, NULL, NULL, NULL),
(14, 'Testing Again234fgrewfsdfg453', 'dasilvareiden@gmail.com', 'admin123', 'test_teacher', 'suspended', NULL, '2025-10-07 05:48:56', '2025-10-07 06:11:41', 0, NULL, NULL, NULL, NULL),
(18, 'cat', 'cat@gmail.com', 'dog000', 'test_teacher', 'suspended', '2025-10-07 10:00:58', '2025-10-07 09:51:29', '2025-10-07 10:01:20', 1, 'EVAPOS6MJOD2D4G3', NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `status` (`status`),
  ADD KEY `idx_reset_token` (`reset_token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
