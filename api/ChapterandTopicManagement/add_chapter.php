<?php
require_once '../config.php';

$data = json_decode(file_get_contents("php://input"), true);

try {
    $name = $data['name'] ?? null;
    
    if (!$name) {
        echo json_encode(['success' => false, 'message' => 'Chapter name is required']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO chapters (name) VALUES (?)");
    $stmt->execute([$name]);

    echo json_encode(['success' => true, 'message' => 'Chapter added successfully', 'id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
