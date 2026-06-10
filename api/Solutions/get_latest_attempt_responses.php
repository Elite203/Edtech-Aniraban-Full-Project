<?php
require_once '../config.php';

header('Content-Type: application/json');

$student_id = $_GET['student_id'] ?? null;
$set_id = $_GET['set_id'] ?? null;

if (!$student_id || !$set_id) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    // The user's requested query to find the latest legitimate attempt's responses
    $query = "
        SELECT question_id, selected_key, is_correct 
        FROM student_exam_responses 
        WHERE student_id = ? 
          AND set_id = ? 
          AND attempt_number = (
              SELECT MAX(attempt_number) 
              FROM student_exam_responses 
              WHERE student_id = ? AND set_id = ?
          )
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute([$student_id, $set_id, $student_id, $set_id]);
    $responses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Map by question_id for easy frontend lookup
    $mappedResponses = [];
    foreach ($responses as $resp) {
        $mappedResponses[$resp['question_id']] = [
            'selected_key' => $resp['selected_key'],
            'is_correct' => (int)$resp['is_correct']
        ];
    }

    echo json_encode(['success' => true, 'responses' => $mappedResponses]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
