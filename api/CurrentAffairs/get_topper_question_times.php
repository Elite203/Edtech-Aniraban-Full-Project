<?php
require_once '../config.php';

$quizID = $_GET['quiz_id'] ?? null;

if (!$quizID) {
    echo json_encode(["status" => "error", "message" => "QuizID is required"]);
    exit;
}

try {
    // Get the topper's ID (best score on first attempt)
    $stmtQuiz = $pdo->prepare("SELECT PositiveMarking, NegativeMarking FROM CurrentAffairs_Quiz_Detail WHERE QuizID = ?");
    $stmtQuiz->execute([$quizID]);
    $quiz = $stmtQuiz->fetch();
    $pos = (float)($quiz['PositiveMarking'] ?? 2);
    $neg = (float)($quiz['NegativeMarking'] ?? 0);

    $stmtTopper = $pdo->prepare("
        SELECT StudentID
        FROM CurrentAffairs_Student_Exam_Responses
        WHERE QuizID = ? AND AttemptNumber = 1
        GROUP BY StudentID
        ORDER BY (SUM(CASE WHEN IsCorrect = 1 THEN ? ELSE 0 END) - SUM(CASE WHEN IsCorrect = 0 AND SelectedAnswer IS NOT NULL THEN ? ELSE 0 END)) DESC, 
                 SUM(TimeSpent) ASC
        LIMIT 1
    ");
    $stmtTopper->execute([$pos, $neg, $quizID]);
    $topperId = $stmtTopper->fetchColumn();

    if (!$topperId) {
        echo json_encode(["status" => "success", "data" => []]);
        exit;
    }

    $stmtTimes = $pdo->prepare("
        SELECT QuestionID, TimeSpent 
        FROM CurrentAffairs_Student_Exam_Responses 
        WHERE QuizID = ? AND StudentID = ? AND AttemptNumber = 1
    ");
    $stmtTimes->execute([$quizID, $topperId]);
    $data = $stmtTimes->fetchAll(PDO::FETCH_KEY_PAIR);

    echo json_encode(["status" => "success", "data" => $data]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
