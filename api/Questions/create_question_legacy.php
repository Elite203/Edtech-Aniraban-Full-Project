<?php
// --- create_question.php ---
// Creates a new question (normal, image, or passage)
// Expects input as 'multipart/form-data'

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Adjust for production
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
    // We expect 'multipart/form-data', with all text data in a JSON string
    if (!isset($_POST['data'])) {
        throw new Exception("Missing 'data' field in form-data.");
    }

    $data = json_decode($_POST['data'], true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON data provided: " . json_last_error_msg());
    }
    
    error_log("📥 Received data: " . json_encode($data));
    if (isset($data['sub_questions'])) {
        error_log("📥 Sub-questions count: " . count($data['sub_questions']));
        error_log("📥 Sub-questions: " . json_encode($data['sub_questions']));
    }

    $pdo->beginTransaction();

    // --- 1. Validate Core Data ---
    $subject_id = $data['subject_id'] ?? null;
    $question_type = $data['question_type'] ?? 'normal';
    
    if (empty($subject_id)) {
        throw new Exception("Missing required field: subject_id");
    }

    // --- 2. Handle Image Upload ---
    $image_data = null;
    $image_type = null;
    if ($question_type === 'image') {
        if (isset($_FILES['question_image']) && $_FILES['question_image']['error'] === UPLOAD_ERR_OK) {
            // Validate file (size, type)
            if ($_FILES['question_image']['size'] > 5 * 1024 * 1024) { // 5MB limit
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
            // Only require image if it's NOT a passage type (passages don't usually have main images, or maybe they do?)
            // Assuming image question type requires image.
            throw new Exception("An image file is required for a new 'image' type question.");
        }
    }

    // --- 3. Prepare SQL and Parameters ---
    $params = [
        ':subject_id' => $subject_id,
        ':topic_id' => $data['topic_id'] ?? null,
        ':parent_question_id' => $data['parent_question_id'] ?? null,
        ':question_type' => $question_type,
        ':passage_english' => $data['passage_english'] ?? null,
        ':passage_hindi' => $data['passage_hindi'] ?? null,
        ':question_image' => $image_data,
        ':question_image_type' => $image_type,
        ':question_english' => $data['question_english'] ?? null,
        ':question_hindi' => $data['question_hindi'] ?? null,
        ':option_a_english' => $data['option_a_english'] ?? null,
        ':option_a_hindi' => $data['option_a_hindi'] ?? null,
        ':option_b_english' => $data['option_b_english'] ?? null,
        ':option_b_hindi' => $data['option_b_hindi'] ?? null,
        ':option_c_english' => $data['option_c_english'] ?? null,
        ':option_c_hindi' => $data['option_c_hindi'] ?? null,
        ':option_d_english' => $data['option_d_english'] ?? null,
        ':option_d_hindi' => $data['option_d_hindi'] ?? null,
        ':option_e_english' => $data['option_e_english'] ?? null,
        ':option_e_hindi' => $data['option_e_hindi'] ?? null,
        ':correct_option' => $data['correct_option'] ?? null,
        ':solution_english' => $data['solution_english'] ?? null,
        ':solution_hindi' => $data['solution_hindi'] ?? null,
        ':youtube_link' => $data['youtube_link'] ?? null
    ];
    
    // Build column and placeholder lists
    $columns = implode(', ', array_map(fn($k) => substr($k, 1), array_keys($params)));
    $placeholders = implode(', ', array_keys($params));

    $sql = "INSERT INTO questions ($columns) VALUES ($placeholders)";
    $stmt = $pdo->prepare($sql);
    
    // Manually bind the BLOB param for safety
    $stmt->bindParam(':question_image', $params[':question_image'], PDO::PARAM_LOB);
    
    // Bind all other values
    foreach ($params as $key => &$value) {
        if ($key !== ':question_image') {
            $stmt->bindParam($key, $value);
        }
    }
    unset($value); // break reference

    $result = $stmt->execute();
    $new_id = $pdo->lastInsertId();

    // --- 4. Handle Sub-Questions (if any) ---
    if ($result && isset($data['sub_questions']) && is_array($data['sub_questions'])) {
        foreach ($data['sub_questions'] as $sub) {
             $subParams = [
                ':subject_id' => $subject_id,
                ':parent_question_id' => $new_id,
                ':question_type' => 'normal',
                ':passage_english' => null,
                ':passage_hindi' => null,
                ':question_image' => null,
                ':question_image_type' => null,
                ':question_english' => $sub['question_english'] ?? null,
                ':question_hindi' => $sub['question_hindi'] ?? null,
                ':option_a_english' => $sub['option_a_english'] ?? null,
                ':option_a_hindi' => $sub['option_a_hindi'] ?? null,
                ':option_b_english' => $sub['option_b_english'] ?? null,
                ':option_b_hindi' => $sub['option_b_hindi'] ?? null,
                ':option_c_english' => $sub['option_c_english'] ?? null,
                ':option_c_hindi' => $sub['option_c_hindi'] ?? null,
                ':option_d_english' => $sub['option_d_english'] ?? null,
                ':option_d_hindi' => $sub['option_d_hindi'] ?? null,
                ':option_e_english' => $sub['option_e_english'] ?? null,
                ':option_e_hindi' => $sub['option_e_hindi'] ?? null,
                ':correct_option' => $sub['correct_option'] ?? null,
                ':solution_english' => $sub['solution_english'] ?? null,
                ':solution_hindi' => $sub['solution_hindi'] ?? null,
                ':youtube_link' => $sub['youtube_link'] ?? null
            ];

            $sub_columns = implode(', ', array_map(fn($k) => substr($k, 1), array_keys($subParams)));
            $sub_placeholders = implode(', ', array_keys($subParams));
            
            $sub_sql = "INSERT INTO questions ($sub_columns) VALUES ($sub_placeholders)";
            $sub_stmt = $pdo->prepare($sub_sql);
            
            foreach ($subParams as $k => $v) {
                 $sub_stmt->bindValue($k, $v);
            }
            $sub_stmt->execute();
        }
    }
    
    $pdo->commit();

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Question added successfully', 'id' => $new_id]);
    } else {
        throw new Exception("Database query failed to execute.");
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
