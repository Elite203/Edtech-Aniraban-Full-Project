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
    $stmt = $pdo->prepare("SELECT id, positive_marking, negative_marking FROM exam_sets WHERE id = ?");
    $stmt->execute([$exam_set_id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($data) {
        echo json_encode(['success' => true, 'data' => $data]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Exam Set not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
