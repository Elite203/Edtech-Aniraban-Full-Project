-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 03, 2026 at 02:17 PM
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
-- Table structure for table `CurrentAffairs_Leaderboard`
--

CREATE TABLE `CurrentAffairs_Leaderboard` (
  `ID` int(11) NOT NULL,
  `QuizID` int(11) NOT NULL,
  `StudentID` int(11) NOT NULL,
  `Score` decimal(10,2) NOT NULL,
  `TotalCorrect` int(11) NOT NULL,
  `TotalAttempted` int(11) NOT NULL,
  `TotalTime` int(11) NOT NULL COMMENT 'Time in seconds',
  `AttemptNumber` int(11) NOT NULL,
  `SubmitDate` date NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `CurrentAffairs_Leaderboard`
--

INSERT INTO `CurrentAffairs_Leaderboard` (`ID`, `QuizID`, `StudentID`, `Score`, `TotalCorrect`, `TotalAttempted`, `TotalTime`, `AttemptNumber`, `SubmitDate`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 7, 7, 20.00, 2, 2, 5, 6, '2026-05-03', '2026-05-03 14:16:36', '2026-05-03 14:16:36');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `CurrentAffairs_Leaderboard`
--
ALTER TABLE `CurrentAffairs_Leaderboard`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `idx_quiz_student` (`QuizID`,`StudentID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `CurrentAffairs_Leaderboard`
--
ALTER TABLE `CurrentAffairs_Leaderboard`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
