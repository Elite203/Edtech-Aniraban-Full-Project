<?php
// --- update_normal_question.php ---
// Updates an existing normal or image question
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

    $id = $data['id'] ?? null;
    if (empty($id)) {
        throw new Exception("Missing required field: id");
    }

    // Auto-detect passage type if passage_id is provided
    if (isset($data['passage_id']) && !empty($data['passage_id'])) {
        $data['question_type'] = 'passage';
    }

    $pdo->beginTransaction();

    $params = [
        'subject_id' => $data['subject_id'],
        'topic_id' => $data['topic_id'] ?? null,
        'passage_id' => $data['passage_id'] ?? null,
        'question_type' => $data['question_type'],
        'question_english' => $data['question_english'] ?? null,
        'question_hindi' => $data['question_hindi'] ?? null,
        'option_a_english' => $data['option_a_english'] ?? null,
        'option_a_hindi' => $data['option_a_hindi'] ?? null,
        'option_b_english' => $data['option_b_english'] ?? null,
        'option_b_hindi' => $data['option_b_hindi'] ?? null,
        'option_c_english' => $data['option_c_english'] ?? null,
        'option_c_hindi' => $data['option_c_hindi'] ?? null,
        'option_d_english' => $data['option_d_english'] ?? null,
        'option_d_hindi' => $data['option_d_hindi'] ?? null,
        'option_e_english' => $data['option_e_english'] ?? null,
        'option_e_hindi' => $data['option_e_hindi'] ?? null,
        'correct_option' => $data['correct_option'] ?? null,
        'solution_english' => $data['solution_english'] ?? null,
        'solution_hindi' => $data['solution_hindi'] ?? null,
        'youtube_link' => $data['youtube_link'] ?? null
    ];

    $sql_parts = [];
    foreach ($params as $key => $value) {
        $sql_parts[] = "$key = :$key";
    }

    if (isset($_FILES['question_image']) && $_FILES['question_image']['error'] === UPLOAD_ERR_OK) {
        $file_type = $_FILES['question_image']['type'];
        $sql_parts[] = "question_image = :question_image";
        $sql_parts[] = "question_image_type = :question_image_type";
        $params['question_image'] = file_get_contents($_FILES['question_image']['tmp_name']);
        $params['question_image_type'] = $file_type;
    }

    $sql = "UPDATE questions SET " . implode(', ', $sql_parts) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $params['id'] = $id;

    foreach ($params as $key => $value) {
        if ($key === 'question_image') {
            $stmt->bindValue(":$key", $value, PDO::PARAM_LOB);
        } else {
            $stmt->bindValue(":$key", $value);
        }
    }

    $stmt->execute();
    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Normal question updated successfully']);

} catch (Exception $e) {
    if ($pdo->inTransaction()) { $pdo->rollBack(); }
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
