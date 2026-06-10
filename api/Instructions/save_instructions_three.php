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
    
    error_log('📝 SAVE_INSTRUCTIONS_THREE: Received input');
    
    // Validate required fields
    $exam_set_id = $input['exam_set_id'] ?? null;
    $instruction_english = $input['instruction_english'] ?? '';
    $instruction_hindi = $input['instruction_hindi'] ?? '';
    
    if (!$exam_set_id) {
        throw new Exception("Exam set ID is required");
    }
    
    // Check if exam set exists
    $check_stmt = $pdo->prepare("SELECT id FROM exam_sets WHERE id = ?");
    $check_stmt->execute([$exam_set_id]);
    
    if (!$check_stmt->fetch()) {
        throw new Exception("Exam set not found");
    }
    
    // Check if instructions already exist for this exam set
    $existing_stmt = $pdo->prepare("SELECT id FROM ssc_instructions_three WHERE exam_set_id = ?");
    $existing_stmt->execute([$exam_set_id]);
    $existing = $existing_stmt->fetch();
    
    if ($existing) {
        // Update existing instructions
        $stmt = $pdo->prepare("
            UPDATE ssc_instructions_three 
            SET instruction_english = ?, instruction_hindi = ?, updated_at = current_timestamp()
            WHERE exam_set_id = ?
        ");
        $result = $stmt->execute([
            $instruction_english,
            $instruction_hindi,
            $exam_set_id
        ]);
        $message = "Instructions updated successfully";
    } else {
        // Insert new instructions
        $stmt = $pdo->prepare("
            INSERT INTO ssc_instructions_three (exam_set_id, instruction_english, instruction_hindi) 
            VALUES (?, ?, ?)
        ");
        $result = $stmt->execute([
            $exam_set_id,
            $instruction_english,
            $instruction_hindi
        ]);
        $message = "Instructions added successfully";
    }
    
    if ($result) {
        error_log('✅ SAVE_INSTRUCTIONS_THREE: ' . $message);
        echo json_encode([
            "success" => true,
            "message" => $message
        ]);
    } else {
        throw new Exception("Failed to save instructions");
    }
    
} catch (Exception $e) {
    error_log('❌ SAVE_INSTRUCTIONS_THREE: Error - ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
