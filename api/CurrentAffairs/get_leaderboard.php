<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

require_once '../config.php';

$quizID = $_GET['quiz_id'] ?? null;
$month = $_GET['month'] ?? null;
$year = $_GET['year'] ?? null;

if (!$quizID && $month && $year) {
    $stmtQID = $pdo->prepare("SELECT QuizID FROM CurrentAffairs_Quiz_Detail WHERE Month = ? AND Year = ? LIMIT 1");
    $stmtQID->execute([$month, $year]);
    $quizID = $stmtQID->fetchColumn();
}

if (!$quizID) {
    echo json_encode(["status" => "error", "message" => "QuizID is required or not found for the given month/year"]);
    exit;
}

try {
    if (!isset($pdo)) {
        throw new Exception("Database connection not established");
    }

    // Version: 2026-05-03 20:05
    // Use backticks for all table and column names to avoid reserved word conflicts
    $query = "
        SELECT 
            COALESCE(CONCAT(s.`first_name`, ' ', s.`last_name`), 'Anonymous User') AS `name`,
            s.`photo`,
            l.`StudentID` AS `user_id`,
            l.`Score` AS `score`,
            l.`TotalCorrect` AS `correct`,
            l.`TotalAttempted` AS `attempted`,
            l.`TotalTime` AS `total_time`,
            l.`SubmitDate` AS `date`
        FROM `CurrentAffairs_Leaderboard` l
        LEFT JOIN `students` s ON l.`StudentID` = s.`id`
        WHERE l.`QuizID` = ?
        ORDER BY l.`Score` DESC, l.`TotalTime` ASC, l.`SubmitDate` ASC
        LIMIT 100
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute([$quizID]);
    $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Encode binary photo data to Base64 for JSON transmission
    foreach ($leaderboard as &$student) {
        if (!empty($student['photo'])) {
            $student['photo'] = 'data:image/jpeg;base64,' . base64_encode($student['photo']);
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => $leaderboard
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "PDO Error: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "General Error: " . $e->getMessage()]);
}
