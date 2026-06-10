<?php
require_once '../config.php';

// Add table creation check here just in case
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `save_questions` (
        `id` INT(11) NOT NULL AUTO_INCREMENT,
        `student_id` INT(11) NOT NULL,
        `question_id` INT(11) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
        UNIQUE KEY `unique_save` (`student_id`, `question_id`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `report_questions` (
        `id` INT(11) NOT NULL AUTO_INCREMENT,
        `student_id` INT(11) NOT NULL,
        `question_id` INT(11) NOT NULL,
        `issue_type` VARCHAR(255) NOT NULL,
        `description` TEXT NOT NULL,
        `image` LONGBLOB DEFAULT NULL,
        `remarks` TEXT DEFAULT NULL,
        `rating` INT(1) DEFAULT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `Current_Affairs_Article_Save` (
        `id` INT(11) NOT NULL AUTO_INCREMENT,
        `student_id` INT(11) NOT NULL,
        `ca_id` INT(11) NOT NULL,
        `saved_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
        UNIQUE KEY `unique_save` (`student_id`, `ca_id`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Migration: Remove foreign key constraints on question_id to support multiple question tables (like Current Affairs)
    $tables = ['save_questions', 'report_questions'];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->prepare("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                                   WHERE TABLE_SCHEMA = DATABASE() 
                                   AND TABLE_NAME = ? 
                                   AND COLUMN_NAME = 'question_id' 
                                   AND REFERENCED_TABLE_NAME = 'questions'");
            $stmt->execute([$table]);
            $constraint = $stmt->fetchColumn();
            if ($constraint) {
                $pdo->exec("ALTER TABLE $table DROP FOREIGN KEY $constraint");
            }
        } catch (Exception $e) {
            // Ignore migration errors
        }
    }

} catch (PDOException $e) {
    // Table creation error - ignore if just permission issue on already existing tables
}

$student_id = $_GET['student_id'] ?? null;

if (!$student_id) {
    echo json_encode(['success' => false, 'message' => 'Student ID is required.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT question_id FROM save_questions WHERE student_id = ?");
    $stmt->execute([$student_id]);
    $saved = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $stmt = $pdo->prepare("SELECT ca_id FROM Current_Affairs_Article_Save WHERE student_id = ?");
    $stmt->execute([$student_id]);
    $savedArticles = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Fetch full report details to pre-fill the modal
    $stmt = $pdo->prepare("SELECT question_id, issue_type, description, remarks, rating FROM report_questions WHERE student_id = ?");
    $stmt->execute([$student_id]);
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format reported question IDs as a set for quick lookup
    $reportedIds = array_map(function($r) { return (int)$r['question_id']; }, $reports);

    echo json_encode(['success' => true, 'saved' => $saved, 'saved_articles' => $savedArticles, 'reported' => $reportedIds, 'reports' => $reports]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
