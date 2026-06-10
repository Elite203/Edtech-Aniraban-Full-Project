-- SQL to create students_activity table
-- Run this manually in your database

CREATE TABLE IF NOT EXISTS students_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    activity_type VARCHAR(50) DEFAULT 'login',
    device_type VARCHAR(100) DEFAULT 'Unknown Device',
    browser VARCHAR(100) DEFAULT 'Unknown Browser',
    os VARCHAR(100) DEFAULT 'Unknown OS',
    location VARCHAR(255) DEFAULT 'Location not available',
    ip_address VARCHAR(45) DEFAULT 'Unknown IP',
    user_agent TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_login_time (login_time),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;