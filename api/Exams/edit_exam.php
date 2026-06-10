<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $exam_id = $input['exam_id'];
    $exam_name = $input['exam_name'];
    $set_number = $input['set_number'];
    $subjects = $input['subjects']; // Array of subject names
    
    try {
        // Begin transaction
        $pdo->beginTransaction();
        
        // Update exam_sets
        $stmt = $pdo->prepare("UPDATE exam_sets SET exam_name = ?, set_number = ? WHERE id = ?");
        $stmt->execute([$exam_name, $set_number, $exam_id]);
        
        // Delete existing subjects
        $stmt = $pdo->prepare("DELETE FROM subjects WHERE exam_set_id = ?");
        $stmt->execute([$exam_id]);
        
        // Insert new subjects
        foreach ($subjects as $subject_name) {
            $stmt = $pdo->prepare("INSERT INTO subjects (exam_set_id, subject_name) VALUES (?, ?)");
            $stmt->execute([$exam_id, $subject_name]);
        }
        
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Exam updated successfully']);
        
    } catch (Exception $e) {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Failed to update exam']);
    }
}
?>
