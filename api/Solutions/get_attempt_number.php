<?php
require_once '../config.php';

header('Content-Type: application/json');

$student_id = $_GET['student_id'] ?? null;
$set_id = $_GET['set_id'] ?? null;
$course_id = $_GET['course_id'] ?? null;

if (!$student_id || !$set_id || !$course_id) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT MAX(attempt_number) as last_attempt FROM exam_attempt_number WHERE student_id = ? AND set_id = ? AND course_id = ?");
    $stmt->execute([$student_id, $set_id, $course_id]);
    $row = $stmt->fetch();
    
    $next_attempt = ($row['last_attempt'] ?? 0) + 1;
    
    echo json_encode(['success' => true, 'attempt_number' => $next_attempt]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
