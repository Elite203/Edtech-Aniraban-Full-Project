<?php
require_once '../config.php';

header('Content-Type: application/json');

// Only allow internal submissions or secure POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$student_id = isset($data['student_id']) ? (int)$data['student_id'] : 0;
$course_id = isset($data['course_id']) ? (int)$data['course_id'] : 0;
$set_id = isset($data['set_id']) ? (int)$data['set_id'] : 0;
$total_marks = isset($data['total_marks']) ? (float)$data['total_marks'] : 0.0;
$total_time = isset($data['total_time']) ? (int)$data['total_time'] : 0;
$attempt_number = isset($data['attempt_number']) ? (int)$data['attempt_number'] : 0;

if (!$student_id || !$set_id || $attempt_number != 1) {
    echo json_encode(['status' => 'error', 'message' => 'Not a first attempt or missing data', 'received' => ['student_id' => $student_id, 'set_id' => $set_id, 'attempt' => $attempt_number]]);
    exit;
}

try {
    // Check if entry already exists (extra safety)
    $check = $pdo->prepare("SELECT id FROM exam_leaderboard WHERE student_id = ? AND set_id = ?");
    $check->execute([$student_id, $set_id]);
    
    if (!$check->fetch()) {
        $stmt = $pdo->prepare("INSERT INTO exam_leaderboard (student_id, course_id, set_id, total_marks, total_time) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$student_id, $course_id, $set_id, $total_marks, $total_time]);
        
        echo json_encode(['status' => 'success', 'message' => 'Leaderboard updated']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Already recorded']);
    }

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
