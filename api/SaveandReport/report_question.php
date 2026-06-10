<?php
require_once '../config.php';

// Handle preflight OPTIONS request if not handled by config.php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$student_id = $_POST['student_id'] ?? null;
$question_id = $_POST['question_id'] ?? null;
$quiz_type = $_POST['quiz_type'] ?? 'old_ui';
$issue_type = $_POST['issue_type'] ?? null;
$description = $_POST['description'] ?? null;
$remarks = $_POST['remarks'] ?? null;
$rating = $_POST['rating'] ?? null;
$image = null;

if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
    $image = file_get_contents($_FILES['image']['tmp_name']);
}

if (!$student_id || !$question_id || !$description) {
    echo json_encode(['success' => false, 'message' => 'Required fields (Student ID, Question ID, Description) are missing.']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO report_questions (student_id, question_id, quiz_type, issue_type, description, image, remarks, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$student_id, $question_id, $quiz_type, $issue_type, $description, $image, $remarks, $rating]);
    echo json_encode(['success' => true, 'message' => 'Question reported successfully.']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'General error: ' . $e->getMessage()]);
}
?>
