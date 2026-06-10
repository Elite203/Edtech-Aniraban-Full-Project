<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

$exam_set_id = isset($_GET['exam_set_id']) ? intval($_GET['exam_set_id']) : 0;

if ($exam_set_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid Exam Set ID']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT SUM(sub_marks) as total_marks FROM subjects WHERE exam_set_id = ?");
    $stmt->execute([$exam_set_id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'total_marks' => $data['total_marks'] ?? 0]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
