-- Create instructions_two table for test series
CREATE TABLE IF NOT EXISTS instructions_two (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_set_id INT NOT NULL,
  test_duration INT NOT NULL COMMENT 'Duration in minutes',
  total_marks INT NOT NULL,
  instruction_two_english LONGTEXT NOT NULL COMMENT 'Instruction Two in English',
  instruction_two_hindi LONGTEXT NOT NULL COMMENT 'Instruction Two in Hindi',
  red_warning_english TEXT NOT NULL COMMENT 'Red warning text in English',
  red_warning_hindi TEXT NOT NULL COMMENT 'Red warning text in Hindi',
  declaration_english TEXT NOT NULL COMMENT 'Declaration text in English',
  declaration_hindi TEXT NOT NULL COMMENT 'Declaration text in Hindi',
  image_content LONGBLOB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_set_id) REFERENCES exam_sets(id) ON DELETE CASCADE,
  INDEX idx_exam_set_id (exam_set_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;