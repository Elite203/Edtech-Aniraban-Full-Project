-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 03, 2026 at 01:43 PM
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
-- Table structure for table `CurrentAffairs_Student_Attempt`
--

CREATE TABLE `CurrentAffairs_Student_Attempt` (
  `ID` int(11) NOT NULL,
  `StudentID` int(11) NOT NULL,
  `QuizID` int(11) NOT NULL,
  `SubmitDate` date NOT NULL,
  `SubmitTime` time NOT NULL,
  `AttemptNumber` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `CurrentAffairs_Student_Attempt`
--

INSERT INTO `CurrentAffairs_Student_Attempt` (`ID`, `StudentID`, `QuizID`, `SubmitDate`, `SubmitTime`, `AttemptNumber`) VALUES
(1, 7, 7, '2026-04-30', '14:15:17', 1),
(2, 7, 7, '2026-04-30', '14:20:02', 2),
(3, 33, 7, '2026-04-30', '15:42:56', 1),
(4, 7, 7, '2026-05-03', '18:35:07', 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `CurrentAffairs_Student_Attempt`
--
ALTER TABLE `CurrentAffairs_Student_Attempt`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_student_id_attempt` (`StudentID`),
  ADD KEY `fk_quiz_id_attempt` (`QuizID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `CurrentAffairs_Student_Attempt`
--
ALTER TABLE `CurrentAffairs_Student_Attempt`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `CurrentAffairs_Student_Attempt`
--
ALTER TABLE `CurrentAffairs_Student_Attempt`
  ADD CONSTRAINT `fk_quiz_id_attempt` FOREIGN KEY (`QuizID`) REFERENCES `CurrentAffairs_Quiz_Detail` (`QuizID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_id_attempt` FOREIGN KEY (`StudentID`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
