<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get input data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
if (!isset($data['set_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required field: set_id']);
    exit;
}

$set_id = (int) $data['set_id'];

try {
    // Check if exam set exists
    $checkStmt = $pdo->prepare("SELECT id FROM exam_sets WHERE id = ?");
    $checkStmt->execute([$set_id]);
    $setExists = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$setExists) {
        echo json_encode(['success' => false, 'message' => 'Exam set not found']);
        exit;
    }
    
    // Begin transaction
    $pdo->beginTransaction();
    
    // Delete subjects first (due to foreign key constraint)
    $deleteSubjectsStmt = $pdo->prepare("DELETE FROM subjects WHERE exam_set_id = ?");
    $subjectsDeleted = $deleteSubjectsStmt->execute([$set_id]);
    
    if ($subjectsDeleted) {
        // Delete exam set
        $deleteSetStmt = $pdo->prepare("DELETE FROM exam_sets WHERE id = ?");
        
        if ($deleteSetStmt->execute([$set_id])) {
            $pdo->commit();
            echo json_encode([
                'success' => true, 
                'message' => 'Exam set and subjects deleted successfully'
            ]);
        } else {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Failed to delete exam set']);
        }
    } else {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Failed to delete subjects']);
    }
    
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
