-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 12, 2025 at 08:01 AM
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
-- Table structure for table `teacher_activity`
--

CREATE TABLE `teacher_activity` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `teacher_type` enum('super_admin','test_teacher','ca_teacher') NOT NULL,
  `login_time` datetime NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `location` varchar(255) DEFAULT 'Unknown',
  `device_type` varchar(100) DEFAULT 'Unknown',
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teacher_activity`
--

INSERT INTO `teacher_activity` (`id`, `name`, `email`, `teacher_type`, `login_time`, `ip_address`, `location`, `device_type`, `user_agent`, `created_at`) VALUES
(1, 'Test', 'solankihardik334@gmail.com', 'super_admin', '2025-10-10 12:56:18', '103.100.217.192', 'Noida, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 12:56:18'),
(2, 'Hardik', 'whatuwant470@gmail.com', 'super_admin', '2025-10-10 12:57:26', '2409:40d0:b9:7589:14b7:12ff:fe55:f465', 'New Delhi, India', 'Linux PC • Chrome', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-10 12:57:26'),
(3, 'Test Teacher', 'test1@gmail.com', 'test_teacher', '2025-10-10 13:06:49', '103.100.217.192', 'Noida, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 13:06:49'),
(4, 'Hardik', 'whatuwant470@gmail.com', 'super_admin', '2025-10-10 13:34:37', '103.100.217.192', 'Noida, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 13:34:37'),
(5, 'Hardik', 'whatuwant470@gmail.com', 'super_admin', '2025-10-10 13:55:55', '103.100.217.192', 'Noida, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 13:55:55'),
(6, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-10 14:49:29', '2405:201:9002:7833:d940:abb9:562f:1e5c', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 14:49:29'),
(7, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-10 14:50:47', '2405:201:9002:7833:d940:abb9:562f:1e5c', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 14:50:47'),
(8, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-10 14:51:26', '2405:201:9002:7833:d940:abb9:562f:1e5c', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 14:51:26'),
(9, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-10 14:55:01', '2405:201:9002:7833:d940:abb9:562f:1e5c', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 14:55:01'),
(10, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-10 14:55:18', '2405:201:9002:7833:d940:abb9:562f:1e5c', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 14:55:18'),
(11, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-10 15:51:45', '2405:201:9002:7833:d940:abb9:562f:1e5c', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 15:51:45'),
(12, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-10 17:47:01', '2405:201:9002:7833:d940:abb9:562f:1e5c', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 17:47:01'),
(13, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-10 18:11:07', '2405:201:9002:7833:d940:abb9:562f:1e5c', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 18:11:07'),
(14, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-10 18:33:00', '2405:201:9002:7833:d940:abb9:562f:1e5c', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-10 18:33:00'),
(15, 'Test', 'solankihardik334@gmail.com', 'super_admin', '2025-10-10 23:47:43', '103.100.217.119', 'Noida, India', 'Linux PC • Chrome', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-10 23:47:43'),
(16, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-11 08:39:26', '2405:201:9002:7833:a432:8e8a:53d6:28d3', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-11 08:39:26'),
(17, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-11 09:40:52', '2405:201:9002:7833:a432:8e8a:53d6:28d3', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-11 09:40:52'),
(18, 'Hardik', 'whatuwant470@gmail.com', 'super_admin', '2025-10-11 09:46:17', '103.100.217.119', 'Noida, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-11 09:46:17'),
(19, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-11 10:26:57', '2405:201:9002:7833:a432:8e8a:53d6:28d3', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-11 10:26:57'),
(20, 'Hardik', 'whatuwant470@gmail.com', 'super_admin', '2025-10-11 10:40:52', '103.100.217.119', 'Noida, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-11 10:40:52'),
(21, 'Test', 'solankihardik334@gmail.com', 'super_admin', '2025-10-11 10:44:26', '103.100.217.119', 'Noida, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-11 10:44:26'),
(22, 'Test', 'solankihardik334@gmail.com', 'super_admin', '2025-10-11 12:43:41', '103.100.217.119', 'Noida, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-11 12:43:41'),
(23, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-11 14:37:03', '2405:201:9002:7833:ad3b:8466:9b84:9852', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-11 14:37:03'),
(24, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-11 14:38:53', '2405:201:9002:7833:ad3b:8466:9b84:9852', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-11 14:38:53'),
(25, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-11 14:54:49', '2405:201:9002:7833:ad3b:8466:9b84:9852', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-11 14:54:49'),
(26, 'Test', 'solankihardik334@gmail.com', 'super_admin', '2025-10-12 06:47:48', '103.100.217.119', 'Noida, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 06:47:48'),
(27, 'Test', 'solankihardik334@gmail.com', 'super_admin', '2025-10-12 06:55:46', '103.100.217.119', 'Noida, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 06:55:46'),
(28, 'Anirban', 'akmondal58@gmail.com', 'super_admin', '2025-10-12 07:31:15', '2405:201:9002:7833:dcc1:3ec7:90c7:7380', 'Asansol, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 07:31:15'),
(29, 'Test', 'solankihardik334@gmail.com', 'super_admin', '2025-10-12 07:57:39', '103.100.217.119', 'Noida, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 07:57:39'),
(30, 'Test', 'solankihardik334@gmail.com', 'super_admin', '2025-10-12 07:58:05', '103.100.217.119', 'Noida, India', 'Windows PC • Chrome', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-12 07:58:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `teacher_activity`
--
ALTER TABLE `teacher_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_login_time` (`login_time`),
  ADD KEY `idx_teacher_type` (`teacher_type`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `teacher_activity`
--
ALTER TABLE `teacher_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
