<?php
require_once '../config.php';

$studentID = $_GET['student_id'] ?? null;
$quizID = $_GET['quiz_id'] ?? null;
$attemptNumber = $_GET['attempt_number'] ?? null;

if (!$studentID || !$quizID) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

try {
    // 1. Get User's timing data
    $stmtUser = $pdo->prepare("
        SELECT QuestionID, TimeSpent 
        FROM CurrentAffairs_Student_Exam_Responses 
        WHERE StudentID = ? AND QuizID = ? AND AttemptNumber = ?
    ");
    $stmtUser->execute([$studentID, $quizID, $attemptNumber]);
    $userTiming = $stmtUser->fetchAll(PDO::FETCH_KEY_PAIR);

    // 2. Get Topper's timing data (for the first attempt of the topper)
    // Find the topper first (best score on first attempt)
    $stmtQuiz = $pdo->prepare("SELECT PositiveMarking, NegativeMarking FROM CurrentAffairs_Quiz_Detail WHERE QuizID = ?");
    $stmtQuiz->execute([$quizID]);
    $quiz = $stmtQuiz->fetch();
    $pos = (float)($quiz['PositiveMarking'] ?? 2);
    $neg = (float)($quiz['NegativeMarking'] ?? 0);

    $stmtTopper = $pdo->prepare("
        SELECT StudentID, AttemptNumber, 
               (SUM(CASE WHEN IsCorrect = 1 THEN ? ELSE 0 END) - SUM(CASE WHEN IsCorrect = 0 AND SelectedAnswer IS NOT NULL THEN ? ELSE 0 END)) as total_score
        FROM CurrentAffairs_Student_Exam_Responses
        WHERE QuizID = ? AND AttemptNumber = 1
        GROUP BY StudentID
        ORDER BY total_score DESC
        LIMIT 1
    ");
    $stmtTopper->execute([$pos, $neg, $quizID]);
    $topper = $stmtTopper->fetch();

    $topperTiming = [];
    if ($topper) {
        $stmtTopperTime = $pdo->prepare("
            SELECT QuestionID, TimeSpent 
            FROM CurrentAffairs_Student_Exam_Responses 
            WHERE StudentID = ? AND QuizID = ? AND AttemptNumber = 1
        ");
        $stmtTopperTime->execute([$topper['StudentID'], $quizID]);
        $topperTiming = $stmtTopperTime->fetchAll(PDO::FETCH_KEY_PAIR);
    }

    // 3. Compile Analytics
    $questions = [];
    $totalUserTime = 0;
    $totalTopperTime = 0;

    // Get all QuestionIDs for this quiz
    $stmtQ = $pdo->prepare("SELECT QuestionID FROM CurrentAffairs_Questions WHERE QuizID = ? ORDER BY QuestionID ASC");
    $stmtQ->execute([$quizID]);
    $qIDs = $stmtQ->fetchAll(PDO::FETCH_COLUMN);

    foreach ($qIDs as $qID) {
        $uTime = $userTiming[$qID] ?? 0;
        $tTime = $topperTiming[$qID] ?? 0;
        
        $questions[$qID] = [
            "user" => (int)$uTime,
            "topper" => (int)$tTime
        ];
        
        $totalUserTime += $uTime;
        $totalTopperTime += $tTime;
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "timing_mode" => "question",
            "overall" => [
                "user" => $totalUserTime,
                "topper" => $totalTopperTime
            ],
            "questions" => $questions,
            "sections" => [],
            "subjects" => []
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
