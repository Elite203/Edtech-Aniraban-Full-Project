-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 12, 2026 at 09:47 PM
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
-- Table structure for table `CurrentAffairs_Student_Exam_Responses`
--

CREATE TABLE `CurrentAffairs_Student_Exam_Responses` (
  `ID` int(11) NOT NULL,
  `QuizID` int(11) NOT NULL,
  `StudentID` int(11) NOT NULL,
  `AttemptNumber` int(11) NOT NULL DEFAULT 1,
  `QuestionID` int(11) NOT NULL,
  `SelectedAnswer` varchar(1) DEFAULT NULL,
  `IsCorrect` tinyint(1) DEFAULT 0,
  `TimeSpent` int(11) DEFAULT 0 COMMENT 'Time in seconds',
  `MarkedForReview` tinyint(1) DEFAULT 0,
  `NotAnswered` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `CurrentAffairs_Student_Exam_Responses`
--

INSERT INTO `CurrentAffairs_Student_Exam_Responses` (`ID`, `QuizID`, `StudentID`, `AttemptNumber`, `QuestionID`, `SelectedAnswer`, `IsCorrect`, `TimeSpent`, `MarkedForReview`, `NotAnswered`) VALUES
(1, 7, 7, 1, 1, 'B', 0, 10, 0, 0),
(2, 7, 7, 1, 2, NULL, 0, 8, 0, 1),
(3, 7, 7, 1, 1, 'A', 1, 2, 0, 0),
(4, 7, 7, 1, 2, 'B', 1, 4, 0, 0),
(5, 7, 33, 1, 1, 'B', 0, 14, 0, 0),
(6, 7, 33, 1, 2, NULL, 0, 231, 0, 1),
(7, 7, 7, 4, 1, 'A', 1, 6, 0, 0),
(8, 7, 7, 4, 2, 'B', 1, 7, 0, 0),
(9, 7, 7, 5, 1, 'A', 1, 5, 0, 0),
(10, 7, 7, 5, 2, 'B', 1, 3, 0, 0),
(11, 7, 7, 6, 1, 'A', 1, 2, 0, 0),
(12, 7, 7, 6, 2, 'B', 1, 3, 0, 0),
(13, 7, 7, 7, 1, NULL, 0, 5, 0, 1),
(14, 7, 7, 7, 2, NULL, 0, 1, 0, 1),
(15, 7, 7, 8, 1, 'B', 0, 3, 0, 0),
(16, 7, 7, 8, 2, 'A', 0, 3, 0, 0),
(17, 7, 7, 9, 1, 'A', 1, 3, 0, 0),
(18, 7, 7, 9, 2, 'A', 0, 3, 0, 1),
(19, 9, 33, 1, 3, NULL, 0, 2, 0, 1),
(20, 9, 33, 1, 4, NULL, 0, 0, 0, 1),
(21, 9, 33, 1, 5, NULL, 0, 0, 0, 1),
(22, 9, 33, 1, 6, NULL, 0, 0, 0, 1),
(23, 9, 33, 1, 7, NULL, 0, 0, 0, 1),
(24, 7, 33, 2, 1, NULL, 0, 5, 0, 1),
(25, 7, 33, 2, 2, NULL, 0, 0, 0, 1),
(26, 7, 33, 3, 1, 'A', 1, 4, 0, 0),
(27, 7, 33, 3, 2, 'B', 1, 6, 0, 1),
(28, 7, 33, 4, 1, NULL, 0, 8, 0, 1),
(29, 7, 33, 4, 2, NULL, 0, 0, 0, 1),
(30, 7, 33, 5, 1, NULL, 0, 1, 0, 1),
(31, 7, 33, 5, 2, NULL, 0, 2, 0, 1),
(32, 9, 33, 2, 3, NULL, 0, 1, 0, 1),
(33, 9, 33, 2, 4, NULL, 0, 0, 0, 1),
(34, 9, 33, 2, 5, 'C', 1, 2, 0, 0),
(35, 9, 33, 2, 6, NULL, 0, 11, 0, 1),
(36, 9, 33, 2, 7, NULL, 0, 0, 0, 1),
(37, 9, 33, 3, 3, NULL, 0, 116, 0, 1),
(38, 9, 33, 3, 4, 'B', 0, 2, 0, 0),
(39, 9, 33, 3, 5, NULL, 0, 1, 1, 1),
(40, 9, 33, 3, 6, 'D', 0, 2, 1, 0),
(41, 9, 33, 3, 7, NULL, 0, 4, 0, 1),
(42, 7, 33, 6, 1, NULL, 0, 7, 0, 1),
(43, 7, 33, 6, 2, NULL, 0, 0, 0, 1),
(44, 7, 33, 7, 1, 'A', 1, 5, 0, 0),
(45, 7, 33, 7, 2, NULL, 0, 1, 0, 1),
(46, 7, 33, 8, 1, NULL, 0, 14, 0, 1),
(47, 7, 33, 8, 2, NULL, 0, 0, 0, 1),
(48, 9, 33, 4, 3, NULL, 0, 5, 0, 1),
(49, 9, 33, 4, 4, NULL, 0, 0, 0, 1),
(50, 9, 33, 4, 5, NULL, 0, 0, 0, 1),
(51, 9, 33, 4, 6, NULL, 0, 0, 0, 1),
(52, 9, 33, 4, 7, NULL, 0, 0, 0, 1),
(53, 7, 33, 9, 1, NULL, 0, 103, 0, 1),
(54, 7, 33, 9, 2, NULL, 0, 0, 0, 1),
(55, 7, 33, 10, 1, NULL, 0, 4, 0, 1),
(56, 7, 33, 10, 2, NULL, 0, 0, 0, 1),
(57, 7, 33, 11, 1, NULL, 0, 2, 0, 1),
(58, 7, 33, 11, 2, NULL, 0, 0, 0, 1),
(59, 9, 33, 5, 3, NULL, 0, 4, 0, 1),
(60, 9, 33, 5, 4, NULL, 0, 0, 0, 1),
(61, 9, 33, 5, 5, NULL, 0, 0, 0, 1),
(62, 9, 33, 5, 6, NULL, 0, 0, 0, 1),
(63, 9, 33, 5, 7, NULL, 0, 0, 0, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `CurrentAffairs_Student_Exam_Responses`
--
ALTER TABLE `CurrentAffairs_Student_Exam_Responses`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_quiz_id_resp` (`QuizID`),
  ADD KEY `fk_student_id_resp` (`StudentID`),
  ADD KEY `fk_question_id_resp` (`QuestionID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `CurrentAffairs_Student_Exam_Responses`
--
ALTER TABLE `CurrentAffairs_Student_Exam_Responses`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `CurrentAffairs_Student_Exam_Responses`
--
ALTER TABLE `CurrentAffairs_Student_Exam_Responses`
  ADD CONSTRAINT `fk_question_id_resp` FOREIGN KEY (`QuestionID`) REFERENCES `CurrentAffairs_Questions` (`QuestionID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_quiz_id_resp` FOREIGN KEY (`QuizID`) REFERENCES `CurrentAffairs_Quiz_Detail` (`QuizID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_id_resp` FOREIGN KEY (`StudentID`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
