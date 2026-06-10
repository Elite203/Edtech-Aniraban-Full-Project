-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Feb 10, 2026 at 05:21 PM
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
-- Table structure for table `students_activity`
--

CREATE TABLE `students_activity` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `activity_type` varchar(50) DEFAULT 'login',
  `device_type` varchar(100) DEFAULT 'Unknown Device',
  `browser` varchar(100) DEFAULT 'Unknown Browser',
  `os` varchar(100) DEFAULT 'Unknown OS',
  `location` varchar(255) DEFAULT 'Location not available',
  `ip_address` varchar(45) DEFAULT 'Unknown IP',
  `user_agent` text DEFAULT NULL,
  `login_time` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students_activity`
--

INSERT INTO `students_activity` (`id`, `student_id`, `activity_type`, `device_type`, `browser`, `os`, `location`, `ip_address`, `user_agent`, `login_time`) VALUES
(5, 17, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.100.217.192', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 14:23:05'),
(6, 8, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 10', 'Noida, India', '103.100.217.192', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-10 14:24:04'),
(7, 7, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-11 10:45:22'),
(8, 8, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-12 06:57:44'),
(9, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 07:31:40'),
(10, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 07:40:05'),
(11, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 07:42:01'),
(12, 7, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 6.0', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-12 07:46:34'),
(13, 7, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 6.0', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-12 07:47:00'),
(14, 8, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-12 08:55:29'),
(15, 7, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-12 08:56:00'),
(16, 8, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 6.0', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-12 08:56:43'),
(17, 8, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 6.0', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-12 08:59:22'),
(18, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 09:01:17'),
(19, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 09:06:26'),
(20, 7, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 6.0', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '0000-00-00 00:00:00'),
(21, 7, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 6.0', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-12 14:44:11'),
(22, 8, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 6.0', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-12 14:45:08'),
(23, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 15:07:59'),
(24, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 15:09:53'),
(27, 7, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-12 18:05:55'),
(28, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 18:06:50'),
(29, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 18:39:50'),
(31, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Asansol, India', '2405:201:9002:7833:188f:5c35:2962:8419', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 21:05:08'),
(32, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.100.217.119', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 12:31:20'),
(34, 8, 'login', 'Android Phone • Chrome Mobile', 'Chrome Mobile', 'Android 6.0', 'Shibuya City, Japan', '103.255.3.227', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-26 11:00:45'),
(35, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.32', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 14:49:09'),
(38, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.178', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 13:14:26'),
(39, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.178', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 13:15:09'),
(43, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.178', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 14:32:27'),
(44, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.178', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 14:41:00'),
(45, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.178', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 21:19:04'),
(46, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.178', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-01 21:19:22'),
(47, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.178', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 11:17:32'),
(49, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.178', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 11:18:13'),
(50, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.178', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-02 11:48:59'),
(57, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-08 00:00:42'),
(59, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 16:59:12'),
(60, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 16:59:39'),
(61, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 16:59:56'),
(62, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 17:05:31'),
(63, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-11 19:29:24'),
(65, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 10:40:13'),
(66, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 10:44:21'),
(67, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 10:53:12'),
(68, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 10:55:18'),
(70, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-12 14:32:45'),
(73, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 22:14:30'),
(76, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-14 11:06:17'),
(78, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.44', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 19:45:05'),
(84, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.44', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 13:44:51'),
(96, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 16:50:20'),
(97, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 17:05:39'),
(100, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-20 22:37:14'),
(103, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-22 13:13:46'),
(104, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-22 13:16:24'),
(106, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Shibuya City, Japan', '103.255.3.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-22 15:10:51'),
(112, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-27 19:57:05'),
(115, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-30 23:18:09'),
(116, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.24', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 14:43:13'),
(117, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.17', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-05 18:17:58'),
(118, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.17', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-05 18:38:27'),
(119, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.17', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 12:23:31'),
(122, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-08 14:58:15'),
(123, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-08 18:12:40'),
(124, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-17 17:25:06'),
(125, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-19 17:33:02'),
(126, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-20 13:07:19'),
(130, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-21 17:36:00'),
(137, 21, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-22 15:12:27'),
(139, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-24 17:05:30'),
(140, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-24 17:16:05'),
(141, 21, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-24 18:13:01'),
(142, 21, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-24 18:28:36'),
(145, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-25 15:25:33'),
(147, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-25 16:54:07'),
(149, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-25 18:18:38'),
(154, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-26 18:08:26'),
(157, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-27 12:03:05'),
(158, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-27 20:35:13'),
(160, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-27 23:38:33'),
(167, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-29 18:02:01'),
(168, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-29 18:02:07'),
(169, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-29 18:13:03'),
(170, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-29 18:13:07'),
(172, 22, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Kolkata, India', '2401:4900:3a07:e806:6539:696d:660e:902a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-30 12:03:07'),
(173, 22, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Kolkata, India', '2401:4900:3a07:e806:6539:696d:660e:902a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-30 12:10:40'),
(174, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-31 23:43:51'),
(175, 22, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Bardhaman, India', '2405:201:9002:7861:9469:fd82:50a9:43a5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 13:19:59'),
(176, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 13:40:18'),
(177, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 17:06:38'),
(178, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-02 16:52:44'),
(179, 22, 'login', 'Linux PC • Chrome', 'Chrome', 'GNU/Linux ', 'Bardhaman, India', '2405:201:9002:7861:f141:8eb5:a23b:1ce8', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-02 19:21:21'),
(180, 22, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Bardhaman, India', '2405:201:9002:7861:fc5e:32dd:f19a:a1ee', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-02 20:37:04'),
(181, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-02 20:50:21'),
(182, 22, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Bardhaman, India', '2405:201:9002:7861:c86b:5044:439:3d4d', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-02 22:39:34'),
(183, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 21:14:00'),
(184, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-04 13:08:34'),
(185, 22, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Bardhaman, India', '2405:201:9002:7861:f8ca:1178:1081:f7ba', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-04 14:00:39'),
(186, 22, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Bardhaman, India', '2405:201:9002:7861:585f:b095:b63e:2415', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-04 15:52:48'),
(187, 22, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Bardhaman, India', '2405:201:9002:7861:dc7a:5bf3:9fa:5538', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-05 13:41:44'),
(188, 8, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-08 21:24:22'),
(189, 22, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Bardhaman, India', '2405:201:9002:7861:5c2a:ad7c:6663:53b4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-08 23:53:28'),
(190, 22, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Bardhaman, India', '2405:201:9002:7861:c065:395f:194e:4b6b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-09 12:19:33'),
(191, 22, 'login', 'Windows PC • Microsoft Edge', 'Microsoft Edge', 'Windows 10', 'Bardhaman, India', '2405:201:9002:7861:c065:395f:194e:4b6b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-09 12:26:01'),
(192, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-09 13:43:48'),
(193, 22, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Bardhaman, India', '2405:201:9002:7861:2dd8:9658:24af:40a6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-09 15:04:24'),
(194, 7, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Noida, India', '103.204.170.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-09 15:09:43'),
(195, 22, 'login', 'Windows PC • Chrome', 'Chrome', 'Windows 10', 'Bardhaman, India', '2405:201:9002:7861:f901:efd4:b2c6:59f7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-09 23:53:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `students_activity`
--
ALTER TABLE `students_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_login_time` (`login_time`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `students_activity`
--
ALTER TABLE `students_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=196;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `students_activity`
--
ALTER TABLE `students_activity`
  ADD CONSTRAINT `students_activity_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
