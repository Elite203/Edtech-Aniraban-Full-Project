CREATE TABLE `exam_attempt_number` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `set_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `new_ui` tinyint(1) DEFAULT 0,
  `old_ui` tinyint(1) DEFAULT 0,
  `date_of_submit` date DEFAULT NULL,
  `time_of_submit` time DEFAULT NULL,
  `attempt_number` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
