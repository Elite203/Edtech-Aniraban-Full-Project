<?php
require_once '../config.php';

$studentID = $_GET['student_id'] ?? null;
$quizID = $_GET['quiz_id'] ?? null;

if (!$studentID || !$quizID) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM CurrentAffairs_Student_Attempt WHERE StudentID = ? AND QuizID = ? ORDER BY AttemptNumber DESC");
    $stmt->execute([$studentID, $quizID]);
    $attempts = $stmt->fetchAll();

    echo json_encode(["success" => true, "data" => $attempts]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
