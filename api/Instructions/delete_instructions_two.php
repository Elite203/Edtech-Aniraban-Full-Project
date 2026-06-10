<?php

require_once '../config.php';
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $exam_set_id = isset($data['exam_set_id']) ? intval($data['exam_set_id']) : null;

        if (!$exam_set_id) {
            echo json_encode([
                'success' => false,
                'message' => 'exam_set_id parameter is required'
            ]);
            exit;
        }

        console_log('🗑️ delete_instructions_two.php: Deleting instructions_two for exam_set_id: ' . $exam_set_id);

        $stmt = $pdo->prepare("DELETE FROM instructions_two WHERE exam_set_id = ?");
        $stmt->execute([$exam_set_id]);

        console_log('✅ delete_instructions_two.php: Successfully deleted instructions_two for exam_set_id: ' . $exam_set_id);

        echo json_encode([
            'success' => true,
            'message' => 'Instructions Two deleted successfully',
            'exam_set_id' => $exam_set_id
        ]);

    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request method'
        ]);
    }

} catch (Exception $e) {
    console_log('❌ delete_instructions_two.php: Error - ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

function console_log($message) {
    error_log($message);
}
?>
