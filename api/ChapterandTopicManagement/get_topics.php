<?php
require_once '../config.php';

try {
    $chapter_id = $_GET['chapter_id'] ?? null;
    
    if (!$chapter_id) {
        echo json_encode(['success' => false, 'message' => 'Chapter ID is required']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM chapter_topics WHERE chapter_id = ? ORDER BY created_at ASC");
    $stmt->execute([$chapter_id]);
    $topics = $stmt->fetchAll();

    echo json_encode(['success' => true, 'topics' => $topics]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
