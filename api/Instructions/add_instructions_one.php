<?php
require_once '../config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception("Invalid JSON input");
    }
    
    error_log('📝 ADD_INSTRUCTIONS_ONE: Received input');
    
    // Validate required fields
    $exam_set_id = $input['exam_set_id'] ?? null;
    $title_english = $input['title_english'] ?? '';
    $instruction_english = $input['instruction_english'] ?? '';
    $title_hindi = $input['title_hindi'] ?? '';
    $instruction_hindi = $input['instruction_hindi'] ?? '';
    $images = $input['images'] ?? null;
    
    error_log('📝 ADD_INSTRUCTIONS_ONE: exam_set_id=' . $exam_set_id . ', images present=' . ($images ? 'yes' : 'no'));
    
    if (!$exam_set_id) {
        throw new Exception("Exam set ID is required");
    }
    

    if (empty($instruction_english)) {
        throw new Exception("English instruction is required");
    }
    
    // Check if exam set exists
    $check_stmt = $pdo->prepare("SELECT id FROM exam_sets WHERE id = ?");
    $check_stmt->execute([$exam_set_id]);
    
    if (!$check_stmt->fetch()) {
        throw new Exception("Exam set not found");
    }
    
    // Check if instructions already exist for this exam set
    $existing_stmt = $pdo->prepare("SELECT id FROM instructions_one WHERE exam_set_id = ?");
    $existing_stmt->execute([$exam_set_id]);
    
    if ($existing_stmt->fetch()) {
        throw new Exception("Instructions already exist for this exam set");
    }
    
    // Convert images to JSON string if present
    $images_json = null;
    if ($images) {
        $images_json = json_encode($images);
        error_log('📝 ADD_INSTRUCTIONS_ONE: Images encoded to JSON, size=' . strlen($images_json) . ' bytes');
    }
    
    // Insert instructions with images
    $stmt = $pdo->prepare("
        INSERT INTO instructions_one (exam_set_id, title_english, instruction_english, title_hindi, instruction_hindi, images) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    $result = $stmt->execute([
        $exam_set_id,
        $title_english,
        $instruction_english,
        $title_hindi,
        $instruction_hindi,
        $images_json
    ]);
    
    if ($result) {
        $id = $pdo->lastInsertId();
        error_log('✅ ADD_INSTRUCTIONS_ONE: Instructions added successfully with ID=' . $id);
        echo json_encode([
            "success" => true,
            "message" => "Instructions added successfully",
            "id" => $id
        ]);
    } else {
        throw new Exception("Failed to add instructions");
    }
    
} catch (Exception $e) {
    error_log('❌ ADD_INSTRUCTIONS_ONE: Error - ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
