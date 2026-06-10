<?php
require_once '../config.php';

$quizID = $_GET['quiz_id'] ?? null;

if (!$quizID) {
    echo json_encode(["status" => "error", "message" => "QuizID is required"]);
    exit;
}

try {
    // Get quiz marking details
    $stmtQuiz = $pdo->prepare("SELECT PositiveMarking, NegativeMarking FROM CurrentAffairs_Quiz_Detail WHERE QuizID = ?");
    $stmtQuiz->execute([$quizID]);
    $quiz = $stmtQuiz->fetch();
    
    $pos = (float)($quiz['PositiveMarking'] ?? 2);
    $neg = (float)($quiz['NegativeMarking'] ?? 0);

    // Get stats for all users (first attempt only for comparison)
    $stmt = $pdo->prepare("
        SELECT 
            StudentID as user_id,
            SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END) as correct_count,
            SUM(CASE WHEN IsCorrect = 0 AND SelectedAnswer IS NOT NULL THEN 1 ELSE 0 END) as incorrect_count,
            SUM(CASE WHEN SelectedAnswer IS NOT NULL THEN 1 ELSE 0 END) as attempted_count,
            SUM(TimeSpent) as total_time_spent
        FROM CurrentAffairs_Student_Exam_Responses
        WHERE QuizID = ? AND AttemptNumber = 1
        GROUP BY StudentID
    ");
    $stmt->execute([$quizID]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => $data,
        "marking" => [
            "positive" => $pos,
            "negative" => $neg
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
