<?php
require_once '../config.php';

$data = json_decode(file_get_contents("php://input"), true);

try {
    $id = $data['id'] ?? null;
    $name = $data['name'] ?? null;
    
    if (!$id || !$name) {
        echo json_encode(['success' => false, 'message' => 'Topic ID and name are required']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE chapter_topics SET name = ? WHERE id = ?");
    $stmt->execute([$name, $id]);

    echo json_encode(['success' => true, 'message' => 'Topic updated successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
