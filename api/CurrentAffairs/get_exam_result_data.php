<?php
require_once '../config.php';

$studentID = $_GET['user_id'] ?? null;
$quizID = $_GET['quiz_id'] ?? null;
$month = $_GET['month'] ?? null;
$year = $_GET['year'] ?? null;
$attemptNumber = $_GET['attempt_number'] ?? null;

if (!$studentID) {
    echo json_encode(["status" => "error", "message" => "UserID is required"]);
    exit;
}

try {
    // If quiz_id is not provided, try to find it by month and year
    if (!$quizID && $month && $year) {
        $stmtQID = $pdo->prepare("SELECT QuizID FROM CurrentAffairs_Quiz_Detail WHERE Month = ? AND Year = ? LIMIT 1");
        $stmtQID->execute([$month, $year]);
        $quizID = $stmtQID->fetchColumn();
    }

    if (!$quizID) {
        echo json_encode(["status" => "error", "message" => "QuizID is required or not found for the given month/year"]);
        exit;
    }
    // 1. Get Quiz Details
    $stmtQuiz = $pdo->prepare("SELECT * FROM CurrentAffairs_Quiz_Detail WHERE QuizID = ?");
    $stmtQuiz->execute([$quizID]);
    $quiz = $stmtQuiz->fetch();

    if (!$quiz) {
        echo json_encode(["status" => "error", "message" => "Quiz not found"]);
        exit;
    }

    // 2. Get Attempt Details (if attempt_number not provided, get the latest one)
    if (!$attemptNumber) {
        $stmtAtt = $pdo->prepare("SELECT MAX(AttemptNumber) as max_att FROM CurrentAffairs_Student_Attempt WHERE StudentID = ? AND QuizID = ?");
        $stmtAtt->execute([$studentID, $quizID]);
        $attemptNumber = $stmtAtt->fetch()['max_att'] ?? 1;
    }

    $stmtAttemptInfo = $pdo->prepare("SELECT * FROM CurrentAffairs_Student_Attempt WHERE StudentID = ? AND QuizID = ? AND AttemptNumber = ?");
    $stmtAttemptInfo->execute([$studentID, $quizID, $attemptNumber]);
    $attemptInfo = $stmtAttemptInfo->fetch();

    $stmtLeader = $pdo->prepare("
        SELECT rank FROM (
            SELECT StudentID, Score, RANK() OVER (ORDER BY Score DESC, TotalTime ASC) as rank
            FROM CurrentAffairs_Leaderboard
            WHERE QuizID = ?
        ) as rankings
        WHERE StudentID = ?
    ");
    $stmtLeader->execute([$quizID, $studentID]);
    $userRank = $stmtLeader->fetchColumn() ?: "...";

    // 3. Get Questions and Responses
    $stmt = $pdo->prepare("
        SELECT 
            q.*, 
            r.SelectedAnswer as selected_key, 
            r.IsCorrect as is_correct, 
            r.TimeSpent as time_spent, 
            r.MarkedForReview as marked_for_review,
            r.NotAnswered as not_answered
        FROM CurrentAffairs_Questions q
        LEFT JOIN CurrentAffairs_Student_Exam_Responses r 
            ON q.QuestionID = r.QuestionID 
            AND r.StudentID = ? 
            AND r.AttemptNumber = ?
        WHERE q.QuizID = ?
        ORDER BY q.QuestionID ASC
    ");
    $stmt->execute([$studentID, $attemptNumber, $quizID]);
    $records = $stmt->fetchAll();

    // Calculate score
    $pos = (float)($quiz['PositiveMarking'] ?? 2);
    $neg = (float)($quiz['NegativeMarking'] ?? 0);
    
    $correctCount = 0;
    $incorrectCount = 0;
    $attemptedCount = 0;
    
    foreach ($records as $r) {
        $selected = $r['selected_key'];
        if ($selected !== null && $selected !== '') {
            $attemptedCount++;
            if ($r['is_correct'] == 1) {
                $correctCount++;
            } else {
                $incorrectCount++;
            }
        }
    }
    
    $score = ($correctCount * $pos) - ($incorrectCount * abs($neg));

    echo json_encode([
        "status" => "success",
        "data" => $records,
        "quiz" => $quiz,
        "attempt_info" => $attemptInfo,
        "summary" => [
            "attemptNumber" => $attemptNumber,
            "score" => $score,
            "correct" => $correctCount,
            "incorrect" => $incorrectCount,
            "attempted" => $attemptedCount,
            "total_questions" => count($records),
            "max_marks" => $quiz['MaxMarks'] ?? (count($records) * $pos),
            "rank" => $userRank
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
