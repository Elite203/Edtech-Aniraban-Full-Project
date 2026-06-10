<?php
require_once '../config.php';

$quizID = $_GET['QuizID'] ?? null;
$questionID = $_GET['QuestionID'] ?? null;

try {
    if ($questionID) {
        $stmt = $pdo->prepare("SELECT * FROM CurrentAffairs_Questions WHERE QuestionID = ?");
        $stmt->execute([$questionID]);
        $data = $stmt->fetch();
    } else if ($quizID) {
        $stmt = $pdo->prepare("SELECT * FROM CurrentAffairs_Questions WHERE QuizID = ?");
        $stmt->execute([$quizID]);
        $data = $stmt->fetchAll();
    } else {
        echo json_encode(["status" => "error", "message" => "QuizID or QuestionID is required"]);
        exit;
    }

    echo json_encode(["status" => "success", "data" => $data]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
