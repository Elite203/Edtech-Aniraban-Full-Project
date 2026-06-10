<?php

require_once '../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $exam_set_id = isset($_GET['exam_set_id']) ? intval($_GET['exam_set_id']) : null;

        if (!$exam_set_id) {
            console_log('⚠️ get_instructions_two.php: exam_set_id not provided');
            echo json_encode([
                'success' => false,
                'message' => 'exam_set_id parameter is required'
            ]);
            exit;
        }

        console_log('📖 get_instructions_two.php: Fetching instructions_two for exam_set_id: ' . $exam_set_id);

        $stmt = $pdo->prepare("
            SELECT id, exam_set_id, test_duration, total_marks, 
                   instruction_two_english, instruction_two_hindi, 
                   red_warning_english, red_warning_hindi, 
                   declaration_english, declaration_hindi,
                   image_content, created_at, updated_at 
            FROM instructions_two 
            WHERE exam_set_id = ?
        ");
        
        $stmt->execute([$exam_set_id]);
        $instruction = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($instruction) {
            // Convert image_content to base64 if it exists
            if ($instruction['image_content']) {
                $instruction['image_content'] = base64_encode($instruction['image_content']);
            }
            
            console_log('✅ get_instructions_two.php: Instructions found for exam_set_id: ' . $exam_set_id);
            echo json_encode([
                'success' => true,
                'data' => $instruction
            ]);
        } else {
            console_log('ℹ️ get_instructions_two.php: No instructions found for exam_set_id: ' . $exam_set_id);
            echo json_encode([
                'success' => true,
                'data' => null
            ]);
        }

    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request method'
        ]);
    }

} catch (Exception $e) {
    console_log('❌ get_instructions_two.php: Error - ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

function console_log($message) {
    error_log($message);
}
?>
