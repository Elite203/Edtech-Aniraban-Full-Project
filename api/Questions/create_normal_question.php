<?php
// --- create_normal_question.php ---
// Creates a new normal or image question
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
    $question_type = $data['question_type'] ?? 'normal';
    
    // Auto-detect passage type if passage_id is provided
    if (isset($data['passage_id']) && !empty($data['passage_id'])) {
        $question_type = 'passage';
    }

    if (empty($subject_id)) {
        throw new Exception("Missing required field: subject_id");
    }

    $pdo->beginTransaction();

    $image_data = null;
    $image_type = null;
    if ($question_type === 'image') {
        if (isset($_FILES['question_image']) && $_FILES['question_image']['error'] === UPLOAD_ERR_OK) {
            if ($_FILES['question_image']['size'] > 5 * 1024 * 1024) {
                 throw new Exception("Image file size exceeds 5MB limit.");
            }
            $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $file_type = $_FILES['question_image']['type'];
            if (!in_array($file_type, $allowed_types)) {
                throw new Exception("Invalid image file type. Only JPEG, PNG, GIF, WebP allowed.");
            }
            $image_data = file_get_contents($_FILES['question_image']['tmp_name']);
            $image_type = $file_type;
        } else {
            throw new Exception("An image file is required for a new 'image' type question.");
        }
    }

    $params = [
        'subject_id' => $subject_id,
        'topic_id' => $data['topic_id'] ?? null,
        'passage_id' => $data['passage_id'] ?? null,
        'question_type' => $question_type,
        'question_image' => $image_data,
        'question_image_type' => $image_type,
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
    
    $cols = array_keys($params);
    $placeholders = array_map(fn($c) => ":$c", $cols);
    $sql = "INSERT INTO questions (" . implode(', ', $cols) . ") VALUES (" . implode(', ', $placeholders) . ")";
    
    $stmt = $pdo->prepare($sql);
    
    foreach ($params as $key => $value) {
        if ($key === 'question_image') {
            $stmt->bindValue(":$key", $value, PDO::PARAM_LOB);
        } else {
            $stmt->bindValue(":$key", $value);
        }
    }

    $stmt->execute();
    $new_id = $pdo->lastInsertId();
    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Normal question added successfully', 'id' => $new_id]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) { $pdo->rollBack(); }
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
