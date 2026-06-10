<?php

require_once '../config.php';
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $exam_set_id = isset($data['exam_set_id']) ? intval($data['exam_set_id']) : null;
        $test_duration = isset($data['test_duration']) ? intval($data['test_duration']) : null;
        $total_marks = isset($data['total_marks']) ? intval($data['total_marks']) : null;
        $instruction_two_english = isset($data['instruction_two_english']) ? trim($data['instruction_two_english']) : '';
        $instruction_two_hindi = isset($data['instruction_two_hindi']) ? trim($data['instruction_two_hindi']) : '';
        $red_warning_english = isset($data['red_warning_english']) ? trim($data['red_warning_english']) : '';
        $red_warning_hindi = isset($data['red_warning_hindi']) ? trim($data['red_warning_hindi']) : '';
        $declaration_english = isset($data['declaration_english']) ? trim($data['declaration_english']) : '';
        $declaration_hindi = isset($data['declaration_hindi']) ? trim($data['declaration_hindi']) : '';
        $image_content = isset($data['image_content']) ? $data['image_content'] : null;

        // Validate required fields
        if (!$exam_set_id || !$test_duration || !$total_marks) {
            echo json_encode([
                'success' => false,
                'message' => 'Missing required fields: exam_set_id, test_duration, total_marks'
            ]);
            exit;
        }

        console_log('📝 add_instructions_two.php: Received data for exam_set_id: ' . $exam_set_id);

        // Check if instructions_two already exists for this exam_set_id
        $checkStmt = $pdo->prepare("SELECT id FROM instructions_two WHERE exam_set_id = ?");
        $checkStmt->execute([$exam_set_id]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            // Update existing record
            console_log('✏️ add_instructions_two.php: Updating existing instructions_two for exam_set_id: ' . $exam_set_id);
            
            $updateStmt = $pdo->prepare("
                UPDATE instructions_two 
                SET test_duration = ?, 
                    total_marks = ?, 
                    instruction_two_english = ?, 
                    instruction_two_hindi = ?, 
                    red_warning_english = ?, 
                    red_warning_hindi = ?, 
                    declaration_english = ?, 
                    declaration_hindi = ?
                    " . ($image_content ? ", image_content = ?" : "") . "
                WHERE exam_set_id = ?
            ");

            $params = [
                $test_duration,
                $total_marks,
                $instruction_two_english,
                $instruction_two_hindi,
                $red_warning_english,
                $red_warning_hindi,
                $declaration_english,
                $declaration_hindi
            ];

            if ($image_content) {
                $params[] = base64_decode($image_content);
            }
            $params[] = $exam_set_id;

            $updateStmt->execute($params);
            console_log('✅ add_instructions_two.php: Successfully updated instructions_two for exam_set_id: ' . $exam_set_id);

            echo json_encode([
                'success' => true,
                'message' => 'Instructions Two updated successfully',
                'exam_set_id' => $exam_set_id
            ]);
        } else {
            // Insert new record
            console_log('➕ add_instructions_two.php: Creating new instructions_two for exam_set_id: ' . $exam_set_id);
            
            $insertStmt = $pdo->prepare("
                INSERT INTO instructions_two (
                    exam_set_id, 
                    test_duration, 
                    total_marks, 
                    instruction_two_english, 
                    instruction_two_hindi, 
                    red_warning_english, 
                    red_warning_hindi, 
                    declaration_english, 
                    declaration_hindi
                    " . ($image_content ? ", image_content" : "") . "
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?" . ($image_content ? ", ?" : "") . ")
            ");

            $params = [
                $exam_set_id,
                $test_duration,
                $total_marks,
                $instruction_two_english,
                $instruction_two_hindi,
                $red_warning_english,
                $red_warning_hindi,
                $declaration_english,
                $declaration_hindi
            ];

            if ($image_content) {
                $params[] = base64_decode($image_content);
            }

            $insertStmt->execute($params);
            console_log('✅ add_instructions_two.php: Successfully created instructions_two for exam_set_id: ' . $exam_set_id);

            echo json_encode([
                'success' => true,
                'message' => 'Instructions Two created successfully',
                'exam_set_id' => $exam_set_id
            ]);
        }

    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request method'
        ]);
    }

} catch (Exception $e) {
    console_log('❌ add_instructions_two.php: Error - ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

function console_log($message) {
    error_log($message);
}
?>
