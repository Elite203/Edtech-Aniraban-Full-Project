-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 07, 2026 at 02:30 AM
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
-- Table structure for table `monthly_test_referrals`
--

CREATE TABLE `monthly_test_referrals` (
  `id` int(11) NOT NULL,
  `referrer_id` int(11) NOT NULL,
  `referee_id` int(11) NOT NULL,
  `referrer_purchase_id` int(11) NOT NULL,
  `referee_purchase_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `monthly_test_referrals`
--

INSERT INTO `monthly_test_referrals` (`id`, `referrer_id`, `referee_id`, `referrer_purchase_id`, `referee_purchase_id`, `created_at`) VALUES
(1, 7, 8, 19, 21, '2026-06-05 22:45:52'),
(2, 40, 39, 22, 23, '2026-06-06 05:16:57');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `monthly_test_referrals`
--
ALTER TABLE `monthly_test_referrals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_referral` (`referrer_id`,`referee_id`),
  ADD KEY `referee_id` (`referee_id`),
  ADD KEY `referrer_purchase_id` (`referrer_purchase_id`),
  ADD KEY `referee_purchase_id` (`referee_purchase_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `monthly_test_referrals`
--
ALTER TABLE `monthly_test_referrals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `monthly_test_referrals`
--
ALTER TABLE `monthly_test_referrals`
  ADD CONSTRAINT `monthly_test_referrals_ibfk_1` FOREIGN KEY (`referrer_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `monthly_test_referrals_ibfk_2` FOREIGN KEY (`referee_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `monthly_test_referrals_ibfk_3` FOREIGN KEY (`referrer_purchase_id`) REFERENCES `monthly_test_purchases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `monthly_test_referrals_ibfk_4` FOREIGN KEY (`referee_purchase_id`) REFERENCES `monthly_test_purchases` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
