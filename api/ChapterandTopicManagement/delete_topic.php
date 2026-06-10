<?php
require_once '../config.php';

$data = json_decode(file_get_contents("php://input"), true);

try {
    $id = $data['id'] ?? null;
    
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Topic ID is required']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM chapter_topics WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true, 'message' => 'Topic deleted successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
