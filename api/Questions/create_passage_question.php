<?php
// --- create_passage_question.php ---
// Creates a new passage and its sub-questions
// Expects input as 'multipart/form-data'

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

try {
    if (!isset($_POST['data'])) {
        throw new Exception("Missing 'data' field in form-data.");
    }

    $data = json_decode($_POST['data'], true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON data provided: " . json_last_error_msg());
    }

    $subject_id = $data['subject_id'] ?? null;
    if (empty($subject_id)) {
        throw new Exception("Missing required field: subject_id");
    }

    $pdo->beginTransaction();

    // 1. Insert into passages table
    $passageSql = "INSERT INTO passages (subject_id, topic_id, passage_english, passage_hindi, solution_english, solution_hindi, youtube_link) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $passageStmt = $pdo->prepare($passageSql);
    $passageStmt->execute([
        $subject_id,
        $data['topic_id'] ?? null,
        !empty($data['passage_english']) ? $data['passage_english'] : null,
        !empty($data['passage_hindi']) ? $data['passage_hindi'] : null,
        !empty($data['solution_english']) ? $data['solution_english'] : null,
        !empty($data['solution_hindi']) ? $data['solution_hindi'] : null,
        !empty($data['youtube_link']) ? $data['youtube_link'] : null
    ]);
    $passage_id = $pdo->lastInsertId();

    // 2. Insert sub-questions
    if (isset($data['sub_questions']) && is_array($data['sub_questions'])) {
        foreach ($data['sub_questions'] as $sub) {
            $subParams = [
                'passage_id' => $passage_id,
                'subject_id' => $subject_id,
                'topic_id' => $data['topic_id'] ?? null,
                'question_type' => 'passage',
                'question_english' => $sub['question_english'] ?? null,
                'question_hindi' => $sub['question_hindi'] ?? null,
                'option_a_english' => $sub['option_a_english'] ?? null,
                'option_a_hindi' => $sub['option_a_hindi'] ?? null,
                'option_b_english' => $sub['option_b_english'] ?? null,
                'option_b_hindi' => $sub['option_b_hindi'] ?? null,
                'option_c_english' => $sub['option_c_english'] ?? null,
                'option_c_hindi' => $sub['option_c_hindi'] ?? null,
                'option_d_english' => $sub['option_d_english'] ?? null,
                'option_d_hindi' => $sub['option_d_hindi'] ?? null,
                'option_e_english' => $sub['option_e_english'] ?? null,
                'option_e_hindi' => $sub['option_e_hindi'] ?? null,
                'correct_option' => $sub['correct_option'] ?? null,
                'solution_english' => $sub['solution_english'] ?? null,
                'solution_hindi' => $sub['solution_hindi'] ?? null,
                'youtube_link' => $data['youtube_link'] ?? null
            ];

            $cols = array_keys($subParams);
            $placeholders = array_map(fn($c) => ":$c", $cols);
            $sql = "INSERT INTO questions (" . implode(', ', $cols) . ") VALUES (" . implode(', ', $placeholders) . ")";
            
            $stmt = $pdo->prepare($sql);
            foreach ($subParams as $k => $v) {
                $stmt->bindValue(":$k", $v);
            }
            $stmt->execute();
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Passage and sub-questions added successfully', 'passage_id' => $passage_id]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) { $pdo->rollBack(); }
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
