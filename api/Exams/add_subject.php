<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['exam_set_id']) || !isset($data['subject_name'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields: exam_set_id and subject_name']);
    exit;
}

$exam_set_id = (int) $data['exam_set_id'];
$subject_name = trim($data['subject_name']);

if (empty($subject_name)) {
    echo json_encode(['success' => false, 'message' => 'Subject name cannot be empty']);
    exit;
}

try {
    // Check if exam set exists
    $checkStmt = $pdo->prepare("SELECT id FROM exam_sets WHERE id = ?");
    $checkStmt->execute([$exam_set_id]);
    if (!$checkStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Exam set not found']);
        exit;
    }

    // Insert subject
    $insertStmt = $pdo->prepare("INSERT INTO subjects (exam_set_id, subject_name) VALUES (?, ?)");
    
    if ($insertStmt->execute([$exam_set_id, $subject_name])) {
        $subject_id = $pdo->lastInsertId();
        echo json_encode([
            'success' => true,
            'message' => 'Subject added successfully',
            'subject_id' => $subject_id,
            'subject_name' => $subject_name
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add subject']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
