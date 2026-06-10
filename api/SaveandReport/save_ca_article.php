<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents("php://input"), true);
$student_id = $data['student_id'] ?? null;
$ca_id = $data['ca_id'] ?? null;
$action = $data['action'] ?? 'save'; 

if (!$student_id || !$ca_id) {
    echo json_encode(['success' => false, 'message' => 'Student ID and CA ID are required.']);
    exit;
}

try {
    if ($action === 'save') {
        $stmt = $pdo->prepare("INSERT IGNORE INTO Current_Affairs_Article_Save (student_id, ca_id) VALUES (?, ?)");
        $stmt->execute([$student_id, $ca_id]);
        $msg = "Article saved successfully.";
    } else {
        $stmt = $pdo->prepare("DELETE FROM Current_Affairs_Article_Save WHERE student_id = ? AND ca_id = ?");
        $stmt->execute([$student_id, $ca_id]);
        $msg = "Article removed from saved items.";
    }
    echo json_encode(['success' => true, 'message' => $msg]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'General error: ' . $e->getMessage()]);
}
?>
