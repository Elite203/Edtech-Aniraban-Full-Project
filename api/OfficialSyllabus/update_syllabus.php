<?php
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id']) || !isset($data['name'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    $id = $data['id'];
    $name = $data['name'];
    $logo_base64 = isset($data['logo']) ? $data['logo'] : null;

    if ($logo_base64) {
        // Remove the data:image/...;base64, part if present
        if (preg_match('/^data:image\/(\w+);base64,/', $logo_base64, $type)) {
            $logo_base64 = substr($logo_base64, strpos($logo_base64, ',') + 1);
        }
        $logo_binary = base64_decode($logo_base64);

        $stmt = $pdo->prepare("UPDATE official_syllabus SET name = ?, logo = ? WHERE id = ?");
        $stmt->execute([$name, $logo_binary, $id]);
    } else {
        $stmt = $pdo->prepare("UPDATE official_syllabus SET name = ? WHERE id = ?");
        $stmt->execute([$name, $id]);
    }

    echo json_encode(['success' => true, 'message' => 'Syllabus updated successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
