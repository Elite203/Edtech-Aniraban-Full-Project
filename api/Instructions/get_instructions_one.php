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
    
    error_log('📖 GET_INSTRUCTIONS_ONE: exam_set_id=' . ($exam_set_id ?? 'null'));
    
    if ($exam_set_id) {
        // Get instructions for the specific exam set
        $stmt = $pdo->prepare("
            SELECT 
                i.id,
                i.exam_set_id,
                i.title_english,
                i.instruction_english,
                i.title_hindi,
                i.instruction_hindi,
                i.images,
                i.created_at,
                i.updated_at,
                e.exam_name,
                e.set_number
            FROM instructions_one i
            JOIN exam_sets e ON i.exam_set_id = e.id
            WHERE i.exam_set_id = ?
        ");
        
        $stmt->execute([$exam_set_id]);
        $instructions = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($instructions) {
            // Decode images if present
            if ($instructions['images']) {
                $instructions['images'] = json_decode($instructions['images'], true);
                error_log('📖 GET_INSTRUCTIONS_ONE: Images found, count=' . count($instructions['images']));
            } else {
                $instructions['images'] = [];
                error_log('📖 GET_INSTRUCTIONS_ONE: No images found');
            }
            
            echo json_encode([
                "success" => true,
                "instructions" => $instructions
            ]);
        } else {
            error_log('📖 GET_INSTRUCTIONS_ONE: No instructions found for exam_set_id=' . $exam_set_id);
            echo json_encode([
                "success" => false,
                "message" => "No instructions found for this exam set"
            ]);
        }
    } else {
        // Fallback: Get all instructions (for backward compatibility)
        $stmt = $pdo->prepare("
            SELECT 
                i.id,
                i.exam_set_id,
                i.title_english as title_eng,
                i.instruction_english as content_eng,
                i.title_hindi as title_hi,
                i.instruction_hindi as content_hi,
                i.images,
                i.created_at,
                i.updated_at
            FROM instructions_one i
            ORDER BY i.created_at DESC
        ");
        
        $stmt->execute();
        $instructions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Decode images for all instructions
        foreach ($instructions as &$instr) {
            if ($instr['images']) {
                $instr['images'] = json_decode($instr['images'], true);
            } else {
                $instr['images'] = [];
            }
        }
        
        error_log('📖 GET_INSTRUCTIONS_ONE: Fetched all instructions, count=' . count($instructions));
        
        echo json_encode([
            "success" => true,
            "data" => $instructions
        ]);
    }
    
} catch (Exception $e) {
    error_log('❌ GET_INSTRUCTIONS_ONE: Error - ' . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
