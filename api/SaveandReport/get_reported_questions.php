<?php
require_once '../config.php';

// Prevent any PHP errors/warnings from breaking the JSON response
error_reporting(0);
ini_set('display_errors', 0);

// Add table creation check here to ensure it exists
try {
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
        FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
} catch (PDOException $e) {
    // Ignore if permission denied but table exists
}

$student_id = $_GET['student_id'] ?? null;

// Ensure we return JSON even if we exit
if (!$student_id || $student_id === 'undefined') {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Valid Student ID is required.', 'data' => []]);
    exit;
}

try {
    $sql = "SELECT rq.id, rq.student_id, rq.question_id, rq.issue_type, rq.description, rq.remarks, rq.rating, rq.created_at, 
                   q.question_english, q.question_hindi, s.subject_name, es.set_name, es.set_number, c.title as course_name
            FROM report_questions rq
            JOIN questions q ON rq.question_id = q.id
            JOIN subjects s ON q.subject_id = s.id
            JOIN exam_sets es ON s.exam_set_id = es.id
            JOIN courses c ON es.course_id = c.id
            WHERE rq.student_id = ?
            ORDER BY rq.created_at DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$student_id]);
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'data' => $reports]);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Error fetching reported questions: ' . $e->getMessage(), 'data' => []]);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'General error: ' . $e->getMessage(), 'data' => []]);
}
?>
