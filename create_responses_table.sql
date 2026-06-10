USE u958214831_Admin_Panel;
CREATE TABLE IF NOT EXISTS student_exam_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    set_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_key VARCHAR(10),
    is_correct TINYINT(1),
    time_spent INT DEFAULT 0,
    attempt_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (student_id),
    INDEX (set_id),
    INDEX (course_id),
    INDEX (attempt_number)
);