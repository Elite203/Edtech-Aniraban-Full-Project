<?php
require_once '../config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

try {
    $exam_set_id = $_GET['exam_set_id'] ?? null;
    
    error_log('📖 GET_INSTRUCTIONS_THREE: exam_set_id=' . ($exam_set_id ?? 'null'));
    
    if (!$exam_set_id) {
        throw new Exception("Exam set ID is required");
    }

    // Get instructions for the specific exam set
    $stmt = $pdo->prepare("
        SELECT 
            id,
            exam_set_id,
            instruction_english,
            instruction_hindi,
            created_at,
            updated_at
        FROM ssc_instructions_three
        WHERE exam_set_id = ?
    ");
    
    $stmt->execute([$exam_set_id]);
    $instructions = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($instructions) {
        echo json_encode([
            "success" => true,
            "data" => $instructions
        ]);
    } else {
        error_log('📖 GET_INSTRUCTIONS_THREE: No instructions found for exam_set_id=' . $exam_set_id);
        echo json_encode([
            "success" => false,
            "message" => "No instructions found for this exam set"
        ]);
    }
    
} catch (Exception $e) {
    error_log('❌ GET_INSTRUCTIONS_THREE: Error - ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
