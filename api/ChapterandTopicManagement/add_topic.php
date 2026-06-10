<?php
require_once '../config.php';

$data = json_decode(file_get_contents("php://input"), true);

try {
    $chapter_id = $data['chapter_id'] ?? null;
    $name = $data['name'] ?? null;
    
    if (!$chapter_id || !$name) {
        echo json_encode(['success' => false, 'message' => 'Chapter ID and Topic name are required']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO chapter_topics (chapter_id, name) VALUES (?, ?)");
    $stmt->execute([$chapter_id, $name]);

    echo json_encode(['success' => true, 'message' => 'Topic added successfully', 'id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
