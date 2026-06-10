<?php
require_once '../config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data provided"]);
    exit;
}

$action = $data['action'] ?? 'save';
$questionID = $data['QuestionID'] ?? null;
$quizID = $data['QuizID'] ?? null;

try {
    if ($action === 'delete') {
        if (!$questionID) {
            echo json_encode(["status" => "error", "message" => "QuestionID is required"]);
            exit;
        }
        $stmt = $pdo->prepare("DELETE FROM CurrentAffairs_Questions WHERE QuestionID = ?");
        $stmt->execute([$questionID]);
        echo json_encode(["status" => "success", "message" => "Question deleted successfully"]);
    } else {
        if (!$quizID) {
            echo json_encode(["status" => "error", "message" => "QuizID is required"]);
            exit;
        }

        $question_en = $data['Question_En'] ?? '';
        $question_hi = $data['Question_Hi'] ?? '';
        $optionA_en = $data['OptionA_En'] ?? '';
        $optionA_hi = $data['OptionA_Hi'] ?? '';
        $optionB_en = $data['OptionB_En'] ?? '';
        $optionB_hi = $data['OptionB_Hi'] ?? '';
        $optionC_en = $data['OptionC_En'] ?? '';
        $optionC_hi = $data['OptionC_Hi'] ?? '';
        $optionD_en = $data['OptionD_En'] ?? '';
        $optionD_hi = $data['OptionD_Hi'] ?? '';
        $optionE_en = $data['OptionE_En'] ?? '';
        $optionE_hi = $data['OptionE_Hi'] ?? '';
        $correctAnswer = $data['CorrectAnswer'] ?? 'A';
        $solutionLink = $data['SolutionLink'] ?? '';

        if ($questionID) {
            // Update
            $stmt = $pdo->prepare("UPDATE CurrentAffairs_Questions SET 
                Question_En = ?, Question_Hi = ?, 
                OptionA_En = ?, OptionA_Hi = ?, 
                OptionB_En = ?, OptionB_Hi = ?, 
                OptionC_En = ?, OptionC_Hi = ?, 
                OptionD_En = ?, OptionD_Hi = ?, 
                OptionE_En = ?, OptionE_Hi = ?, 
                CorrectAnswer = ?, SolutionLink = ? 
                WHERE QuestionID = ?");
            $stmt->execute([
                $question_en, $question_hi, 
                $optionA_en, $optionA_hi, 
                $optionB_en, $optionB_hi, 
                $optionC_en, $optionC_hi, 
                $optionD_en, $optionD_hi, 
                $optionE_en, $optionE_hi, 
                $correctAnswer, $solutionLink, $questionID
            ]);
            echo json_encode(["status" => "success", "message" => "Question updated successfully"]);
        } else {
            // Insert
            $stmt = $pdo->prepare("INSERT INTO CurrentAffairs_Questions 
                (QuizID, Question_En, Question_Hi, OptionA_En, OptionA_Hi, OptionB_En, OptionB_Hi, OptionC_En, OptionC_Hi, OptionD_En, OptionD_Hi, OptionE_En, OptionE_Hi, CorrectAnswer, SolutionLink) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $quizID, $question_en, $question_hi, 
                $optionA_en, $optionA_hi, 
                $optionB_en, $optionB_hi, 
                $optionC_en, $optionC_hi, 
                $optionD_en, $optionD_hi, 
                $optionE_en, $optionE_hi, 
                $correctAnswer, $solutionLink
            ]);
            echo json_encode(["status" => "success", "message" => "Question added successfully"]);
        }
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
