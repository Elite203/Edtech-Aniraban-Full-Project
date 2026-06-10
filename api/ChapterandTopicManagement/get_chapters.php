<?php
require_once '../config.php';

try {
    $stmt = $pdo->prepare("SELECT * FROM chapters ORDER BY created_at ASC");
    $stmt->execute();
    $chapters = $stmt->fetchAll();

    echo json_encode(['success' => true, 'chapters' => $chapters]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
