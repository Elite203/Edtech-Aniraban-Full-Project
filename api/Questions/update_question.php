<?php
// --- update_question.php ---
// Updates an existing question
// Expects input as 'multipart/form-data'

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Adjust for production
header('Access-Control-Allow-Methods: POST, OPTIONS'); // Use POST for multipart
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config.php';
// require_once '../Auth/admin_auth.php'; // Uncomment when ready

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
    
    error_log("📥 Update data: " . json_encode($data));
    if (isset($data['sub_questions'])) {
        error_log("📥 Update sub-questions count: " . count($data['sub_questions']));
    }

    // --- 1. Validate ID ---
    $question_id = $data['id'] ?? null;
    if (empty($question_id)) {
        throw new Exception("Missing required field: id");
    }
    
    $pdo->beginTransaction();

    // Auto-detect passage type if passage_id is provided
    if (isset($data['passage_id']) && !empty($data['passage_id'])) {
        $data['question_type'] = 'passage';
    }

    // --- 2. Prepare SQL and Parameters ---
    $params = [
        ':subject_id' => $data['subject_id'],
        ':topic_id' => $data['topic_id'] ?? null,
        ':passage_id' => $data['passage_id'] ?? null,
        ':parent_question_id' => $data['parent_question_id'] ?? null,
        ':question_type' => $data['question_type'],
        ':passage_english' => $data['passage_english'] ?? null,
        ':passage_hindi' => $data['passage_hindi'] ?? null,
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
        ':youtube_link' => $data['youtube_link'] ?? null,
        ':id' => $question_id
    ];
    
    // Build the SET part of the query
    $sql_parts = [];
    foreach ($params as $key => $value) {
        if ($key !== ':id') {
            $sql_parts[] = substr($key, 1) . " = $key"; // "subject_id = :subject_id"
        }
    }

    // --- 3. Handle Optional Image Replacement ---
    if (isset($_FILES['question_image']) && $_FILES['question_image']['error'] === UPLOAD_ERR_OK) {
        // Validate new image file
        $file_type = $_FILES['question_image']['type'];
        if (!in_array($file_type, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) {
            throw new Exception("Invalid image file type.");
        }
        
        $sql_parts[] = "question_image = :question_image";
        $sql_parts[] = "question_image_type = :question_image_type";
        
        $params[':question_image'] = file_get_contents($_FILES['question_image']['tmp_name']);
        $params[':question_image_type'] = $file_type;
    }

    $sql = "UPDATE questions SET " . implode(', ', $sql_parts) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);

    // Bind BLOB param if it exists
    if (isset($params[':question_image'])) {
        $stmt->bindParam(':question_image', $params[':question_image'], PDO::PARAM_LOB);
        unset($params[':question_image']); // Don't bind twice
    }
    
    // Bind all other values
    foreach ($params as $key => &$value) {
        if ($key !== ':question_image') {
            $stmt->bindParam($key, $value);
        }
    }
    unset($value);

    $result = $stmt->execute();

    if (!$result) {
        throw new Exception("Database query failed to execute.");
    }

    // --- 4. Handle Sub-Questions (if any) ---
    if (isset($data['sub_questions']) && is_array($data['sub_questions'])) {
        $deleteStmt = $pdo->prepare("DELETE FROM questions WHERE parent_question_id = :parent_id");
        $deleteStmt->bindParam(':parent_id', $question_id);
        $deleteStmt->execute();
        
        foreach ($data['sub_questions'] as $sub) {
             $subParams = [
                ':subject_id' => $data['subject_id'],
                ':parent_question_id' => $question_id,
                ':question_type' => 'passage',
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
        echo json_encode(['success' => true, 'message' => 'Question updated successfully', 'id' => $question_id]);
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
