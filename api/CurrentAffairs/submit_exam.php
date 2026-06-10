<?php
require_once '../config.php';

// Set timezone to IST
date_default_timezone_set('Asia/Kolkata');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data provided"]);
    exit;
}

$studentID = $data['StudentID'] ?? null;
$quizID = $data['QuizID'] ?? null;
$responses = $data['responses'] ?? null;

if (!$studentID || !$quizID) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Get current attempt number
    $stmt = $pdo->prepare("SELECT MAX(AttemptNumber) as max_attempt FROM CurrentAffairs_Student_Attempt WHERE StudentID = ? AND QuizID = ?");
    $stmt->execute([$studentID, $quizID]);
    $row = $stmt->fetch();
    $nextAttempt = ($row['max_attempt'] ?? 0) + 1;

    // 2. Insert into CurrentAffairs_Student_Attempt
    // Fixed column names: SubmitDate and SubmitTime as per SQL file
    $submitDate = date('Y-m-d');
    $submitTime = date('H:i:s');
    
    $stmt = $pdo->prepare("INSERT INTO CurrentAffairs_Student_Attempt (StudentID, QuizID, SubmitDate, SubmitTime, AttemptNumber) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$studentID, $quizID, $submitDate, $submitTime, $nextAttempt]);

    // 3. Fetch correct answers for comparison
    $stmt = $pdo->prepare("SELECT QuestionID, CorrectAnswer FROM CurrentAffairs_Questions WHERE QuizID = ?");
    $stmt->execute([$quizID]);
    $correctAnswers = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    // 4. Insert individual responses into CurrentAffairs_Student_Exam_Responses
    $stmtResp = $pdo->prepare("INSERT INTO CurrentAffairs_Student_Exam_Responses 
        (QuizID, StudentID, AttemptNumber, QuestionID, SelectedAnswer, IsCorrect, TimeSpent, MarkedForReview, NotAnswered) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    foreach ($responses as $qID => $resp) {
        $selected = $resp['selectedAnswer'] ?? null;
        $status = $resp['status'] ?? 'not_visited';
        
        // Correctness check (case insensitive)
        $isCorrect = 0;
        if ($selected && isset($correctAnswers[$qID])) {
            if (strtoupper(trim($correctAnswers[$qID])) === strtoupper(trim($selected))) {
                $isCorrect = 1;
            }
        }

        $timeSpent = $resp['timeSpent'] ?? 0;
        $marked = ($status === 'marked' || $status === 'answered_marked') ? 1 : 0;
        $notAnswered = ($status === 'not_answered' || $status === 'not_visited' || $status === 'marked') ? 1 : 0;

        $stmtResp->execute([
            $quizID,
            $studentID,
            $nextAttempt,
            $qID,
            $selected,
            $isCorrect,
            $timeSpent,
            $marked,
            $notAnswered
        ]);
    }

    // 5. Update Leaderboard (Store best attempt)
    // Calculate current attempt score
    $stmtQuiz = $pdo->prepare("SELECT PositiveMarking, NegativeMarking FROM CurrentAffairs_Quiz_Detail WHERE QuizID = ?");
    $stmtQuiz->execute([$quizID]);
    $quizMarks = $stmtQuiz->fetch();
    $pos = (float)($quizMarks['PositiveMarking'] ?? 2);
    $neg = (float)($quizMarks['NegativeMarking'] ?? 0);

    $correctCount = 0;
    $attemptedCount = 0;
    $totalTimeSpent = 0;
    foreach ($responses as $qID => $resp) {
        $selected = $resp['selectedAnswer'] ?? null;
        if ($selected !== null && $selected !== '') {
            $attemptedCount++;
            if (strtoupper(trim($correctAnswers[$qID])) === strtoupper(trim($selected))) {
                $correctCount++;
            }
        }
        $totalTimeSpent += ($resp['timeSpent'] ?? 0);
    }
    $currentScore = ($correctCount * $pos) - (($attemptedCount - $correctCount) * abs($neg));

    // Check if we should update leaderboard (if this is the best score)
    $stmtCheck = $pdo->prepare("SELECT Score FROM CurrentAffairs_Leaderboard WHERE QuizID = ? AND StudentID = ?");
    $stmtCheck->execute([$quizID, $studentID]);
    $existing = $stmtCheck->fetch();

    if (!$existing || $currentScore > $existing['Score']) {
        $stmtLeader = $pdo->prepare("
            INSERT INTO CurrentAffairs_Leaderboard 
                (QuizID, StudentID, Score, TotalCorrect, TotalAttempted, TotalTime, AttemptNumber, SubmitDate) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                Score = VALUES(Score),
                TotalCorrect = VALUES(TotalCorrect),
                TotalAttempted = VALUES(TotalAttempted),
                TotalTime = VALUES(TotalTime),
                AttemptNumber = VALUES(AttemptNumber),
                SubmitDate = VALUES(SubmitDate)
        ");
        $stmtLeader->execute([$quizID, $studentID, $currentScore, $correctCount, $attemptedCount, $totalTimeSpent, $nextAttempt, $submitDate]);
    }

    $pdo->commit();

    echo json_encode([
        "status" => "success", 
        "message" => "Exam submitted successfully",
        "data" => [
            "attemptNumber" => $nextAttempt,
            "date" => $submitDate,
            "time" => $submitTime
        ]
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => "System error: " . $e->getMessage()]);
}
?>
