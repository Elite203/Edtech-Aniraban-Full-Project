-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 03, 2026 at 01:59 PM
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
-- Table structure for table `CurrentAffairs_Quiz_Detail`
--

CREATE TABLE `CurrentAffairs_Quiz_Detail` (
  `QuizID` int(11) NOT NULL,
  `Year` int(4) NOT NULL,
  `Month` varchar(20) NOT NULL,
  `OverallTime` int(11) NOT NULL COMMENT 'Time in minutes',
  `MaxMarks` decimal(10,2) NOT NULL,
  `PositiveMarking` decimal(10,2) NOT NULL,
  `NegativeMarking` decimal(10,2) NOT NULL,
  `Passing_General` decimal(10,2) DEFAULT 0.00,
  `Passing_OBC` decimal(10,2) DEFAULT 0.00,
  `Passing_SC` decimal(10,2) DEFAULT 0.00,
  `Passing_ST` decimal(10,2) DEFAULT 0.00,
  `Passing_EWS` decimal(10,2) DEFAULT 0.00,
  `Passing_PWD` decimal(10,2) DEFAULT 0.00,
  `Created_At` timestamp NULL DEFAULT current_timestamp(),
  `Updated_At` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `CurrentAffairs_Quiz_Detail`
--

INSERT INTO `CurrentAffairs_Quiz_Detail` (`QuizID`, `Year`, `Month`, `OverallTime`, `MaxMarks`, `PositiveMarking`, `NegativeMarking`, `Passing_General`, `Passing_OBC`, `Passing_SC`, `Passing_ST`, `Passing_EWS`, `Passing_PWD`, `Created_At`, `Updated_At`) VALUES
(7, 2026, 'January', 5, 20.00, 4.00, 1.00, 15.00, 10.00, 8.00, 8.00, 7.00, 7.00, '2026-04-30 07:52:05', '2026-04-30 07:52:27'),
(9, 2026, 'February', 60, 100.00, 2.00, 0.50, 80.00, 75.00, 70.00, 65.00, 60.00, 55.00, '2026-04-30 09:59:50', '2026-04-30 10:00:28'),
(12, 2027, 'March', 30, 50.00, 1.00, 2.00, 2.00, 3.00, 4.00, 5.00, 6.00, 7.00, '2026-04-30 10:01:36', '2026-04-30 10:01:57');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `CurrentAffairs_Quiz_Detail`
--
ALTER TABLE `CurrentAffairs_Quiz_Detail`
  ADD PRIMARY KEY (`QuizID`),
  ADD UNIQUE KEY `idx_year_month` (`Year`,`Month`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `CurrentAffairs_Quiz_Detail`
--
ALTER TABLE `CurrentAffairs_Quiz_Detail`
  MODIFY `QuizID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
