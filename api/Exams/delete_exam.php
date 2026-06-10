<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $exam_id = $input['exam_id'];
    
    try {
        // Begin transaction
        $pdo->beginTransaction();
        
        // Delete subjects first (foreign key constraint)
        $stmt = $pdo->prepare("DELETE FROM subjects WHERE exam_set_id = ?");
        $stmt->execute([$exam_id]);
        
        // Delete exam_set
        $stmt = $pdo->prepare("DELETE FROM exam_sets WHERE id = ?");
        $stmt->execute([$exam_id]);
        
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Exam deleted successfully']);
        
    } catch (Exception $e) {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Failed to delete exam']);
    }
}
?>
