<?php
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['name']) || !isset($data['logo'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    $name = $data['name'];
    $logo_base64 = $data['logo'];

    // Remove the data:image/...;base64, part
    if (preg_match('/^data:image\/(\w+);base64,/', $logo_base64, $type)) {
        $logo_base64 = substr($logo_base64, strpos($logo_base64, ',') + 1);
    }
    $logo_binary = base64_decode($logo_base64);

    $stmt = $pdo->prepare("INSERT INTO official_syllabus (name, logo) VALUES (?, ?)");
    $stmt->execute([$name, $logo_binary]);

    echo json_encode(['success' => true, 'message' => 'Syllabus added successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
