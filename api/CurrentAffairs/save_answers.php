<?php
require_once '../config.php';

// Set timezone to IST
date_default_timezone_set('Asia/Kolkata');

$data = json_decode(file_get_contents("php://input"), true);
$answers = $data['answers'] ?? [];

if (empty($answers)) {
    echo json_encode(["status" => "error", "message" => "No answers provided"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Get Quiz Metadata (from the first answer)
    $firstAns = $answers[0];
    $studentID = $firstAns['user_id'];
    $month = $firstAns['month'];
    $year = $firstAns['year'];

    // 2. Find the QuizID for this month/year
    $stmt = $pdo->prepare("SELECT QuizID, PositiveMarking, NegativeMarking FROM CurrentAffairs_Quiz_Detail WHERE Month = ? AND Year = ? LIMIT 1");
    $stmt->execute([$month, $year]);
    $quizInfo = $stmt->fetch();

    if (!$quizInfo) {
        // Fallback or error
        $pdo->rollBack();
        echo json_encode(["status" => "error", "message" => "No quiz found for $month $year"]);
        exit;
    }

    $quizID = $quizInfo['QuizID'];
    $pos = (float)($quizInfo['PositiveMarking'] ?? 2);
    $neg = (float)($quizInfo['NegativeMarking'] ?? 0);

    // 3. Get current attempt number
    $stmt = $pdo->prepare("SELECT MAX(AttemptNumber) as max_attempt FROM CurrentAffairs_Student_Attempt WHERE StudentID = ? AND QuizID = ?");
    $stmt->execute([$studentID, $quizID]);
    $row = $stmt->fetch();
    $nextAttempt = ($row['max_attempt'] ?? 0) + 1;

    // 4. Insert into CurrentAffairs_Student_Attempt
    $submitDate = date('Y-m-d');
    $submitTime = date('H:i:s');
    $stmt = $pdo->prepare("INSERT INTO CurrentAffairs_Student_Attempt (StudentID, QuizID, SubmitDate, SubmitTime, AttemptNumber) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$studentID, $quizID, $submitDate, $submitTime, $nextAttempt]);

    // 5. Fetch correct answers for scoring
    $stmt = $pdo->prepare("SELECT QuestionID, CorrectAnswer FROM CurrentAffairs_Questions WHERE QuizID = ?");
    $stmt->execute([$quizID]);
    $correctAnswers = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    // 6. Insert individual responses
    $stmtResp = $pdo->prepare("INSERT INTO CurrentAffairs_Student_Exam_Responses 
        (QuizID, StudentID, AttemptNumber, QuestionID, SelectedAnswer, IsCorrect, TimeSpent, MarkedForReview, NotAnswered) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $correctCount = 0;
    $attemptedCount = 0;
    $totalTimeSpent = 0;

    // Convert answers to an ID-indexed map for easier processing
    $responsesMap = [];
    foreach ($answers as $ans) {
        $responsesMap[$ans['question_id']] = $ans;
    }

    // Iterate through all questions in this quiz to record every response (even if not answered)
    $stmtAllQ = $pdo->prepare("SELECT QuestionID FROM CurrentAffairs_Questions WHERE QuizID = ?");
    $stmtAllQ->execute([$quizID]);
    $allQuestions = $stmtAllQ->fetchAll(PDO::FETCH_COLUMN);

    foreach ($allQuestions as $qID) {
        $ans = $responsesMap[$qID] ?? null;
        $selected = $ans['selected_option'] ?? null;
        $timeSpent = $ans['time_spent'] ?? 0;
        
        $isCorrect = 0;
        $notAnswered = 1;
        
        if ($selected && isset($correctAnswers[$qID])) {
            $notAnswered = 0;
            $attemptedCount++;
            if (strtoupper(trim($correctAnswers[$qID])) === strtoupper(trim($selected))) {
                $isCorrect = 1;
                $correctCount++;
            }
        }

        $totalTimeSpent += $timeSpent;

        $stmtResp->execute([
            $quizID,
            $studentID,
            $nextAttempt,
            $qID,
            $selected,
            $isCorrect,
            $timeSpent,
            0, // MarkedForReview - not explicitly tracked in current simplified MonthlyTest submission
            $notAnswered
        ]);
    }

    // 7. Update Leaderboard (Store best attempt)
    $currentScore = ($correctCount * $pos) - (($attemptedCount - $correctCount) * abs($neg));

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
        "message" => "Test submitted and recorded successfully",
        "data" => [
            "attemptNumber" => $nextAttempt,
            "score" => $currentScore,
            "correct" => $correctCount
        ]
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
