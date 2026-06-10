<?php
require_once '../config.php';

$quizID = $_GET['quiz_id'] ?? null;

if (!$quizID) {
    echo json_encode(["status" => "error", "message" => "QuizID is required"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            QuestionID,
            COUNT(ID) as total,
            SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) as correct
        FROM CurrentAffairs_Student_Exam_Responses
        WHERE QuizID = ?
        GROUP BY QuestionID
    ");
    $stmt->execute([$quizID]);
    $data = $stmt->fetchAll(PDO::FETCH_UNIQUE | PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $data]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
