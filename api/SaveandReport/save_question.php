<?php
require_once '../config.php';

// Handle preflight OPTIONS request if not handled by config.php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents("php://input"), true);
$student_id = $data['student_id'] ?? null;
$question_id = $data['question_id'] ?? null;
$quiz_type = $data['quiz_type'] ?? 'old_ui';
$action = $data['action'] ?? 'save'; 

if (!$student_id || !$question_id) {
    echo json_encode(['success' => false, 'message' => 'Student ID and Question ID are required.']);
    exit;
}

try {
    if ($action === 'save') {
        $stmt = $pdo->prepare("INSERT IGNORE INTO save_questions (student_id, question_id, quiz_type) VALUES (?, ?, ?)");
        $stmt->execute([$student_id, $question_id, $quiz_type]);
        $msg = "Question saved successfully.";
    } else {
        $stmt = $pdo->prepare("DELETE FROM save_questions WHERE student_id = ? AND question_id = ?");
        $stmt->execute([$student_id, $question_id]);
        $msg = "Question removed from saved items.";
    }
    echo json_encode(['success' => true, 'message' => $msg]);
} catch (PDOException $e) {
    // If table missing, attempt to handle gracefully or return error
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'General error: ' . $e->getMessage()]);
}
?>
