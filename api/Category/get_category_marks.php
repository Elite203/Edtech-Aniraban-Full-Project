<?php
require_once '../config.php';

$exam_set_id = isset($_GET['exam_set_id']) ? intval($_GET['exam_set_id']) : 0;

if ($exam_set_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid Exam Set ID']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM category WHERE exam_set_id = ?");
    $stmt->execute([$exam_set_id]);
    $data = $stmt->fetch();

    if ($data) {
        echo json_encode(['success' => true, 'data' => $data]);
    } else {
        // Return default values if no record exists
        echo json_encode([
            'success' => true, 
            'data' => [
                'SC' => 0,
                'ST' => 0,
                'OBC' => 0,
                'EWS' => 0,
                'PWD' => 0,
                'General' => 0
            ]
        ]);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
