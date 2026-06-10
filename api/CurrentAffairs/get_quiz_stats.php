<?php
require_once '../config.php';

$quizID = $_GET['quiz_id'] ?? null;

if (!$quizID) {
    echo json_encode(["status" => "error", "message" => "QuizID is required"]);
    exit;
}

try {
    // We need to calculate scores for all attempts or just the best one per user?
    // Usually leaderboard uses the best score per user.
    
    // First, get quiz marking details
    $stmtQuiz = $pdo->prepare("SELECT PositiveMarking, NegativeMarking FROM CurrentAffairs_Quiz_Detail WHERE QuizID = ?");
    $stmtQuiz->execute([$quizID]);
    $quiz = $stmtQuiz->fetch();
    
    $pos = (float)($quiz['PositiveMarking'] ?? 2);
    $neg = (float)($quiz['NegativeMarking'] ?? 0);

    // Calculate scores for all users
    $stmt = $pdo->prepare("
        SELECT 
            StudentID,
            AttemptNumber,
            SUM(CASE WHEN IsCorrect = 1 THEN ? ELSE 0 END) - 
            SUM(CASE WHEN IsCorrect = 0 AND SelectedAnswer IS NOT NULL THEN ? ELSE 0 END) as score
        FROM CurrentAffairs_Student_Exam_Responses
        WHERE QuizID = ?
        GROUP BY StudentID, AttemptNumber
    ");
    $stmt->execute([$pos, $neg, $quizID]);
    $allScores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($allScores)) {
        echo json_encode([
            "status" => "success",
            "highest_marks" => 0,
            "avg_marks" => 0,
            "total_candidates" => 0
        ]);
        exit;
    }

    $scores = array_column($allScores, 'score');
    $highest = max($scores);
    $avg = array_sum($scores) / count($scores);

    echo json_encode([
        "status" => "success",
        "highest_marks" => round($highest, 2),
        "avg_marks" => round($avg, 2),
        "total_candidates" => count(array_unique(array_column($allScores, 'StudentID')))
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
