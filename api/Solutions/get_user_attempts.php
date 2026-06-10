<?php
require_once '../config.php';

header('Content-Type: application/json');

$student_id = $_GET['student_id'] ?? null;

if (!$student_id) {
    echo json_encode(['success' => false, 'message' => 'Missing student ID']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            ean.*,
            es.set_name,
            es.set_number,
            es.exam_name,
            c.title as course_title
        FROM exam_attempt_number ean
        JOIN exam_sets es ON ean.set_id = es.id
        JOIN courses c ON ean.course_id = c.id
        WHERE ean.student_id = ?
        ORDER BY ean.date_of_submit DESC, ean.time_of_submit DESC
    ");
    $stmt->execute([$student_id]);
    $attempts = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $attempts]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
