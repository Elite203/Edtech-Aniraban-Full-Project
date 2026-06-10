<?php
// get_subjects_for_set.php
// Fetches all subjects for a specific exam_set_id

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

try {
    $exam_set_id = $_GET['exam_set_id'] ?? null;

    if (empty($exam_set_id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required field: exam_set_id']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, subject_name, time_minutes, sectional_time_minutes, section_number FROM subjects WHERE exam_set_id = ? ORDER BY id ASC");
    $stmt->execute([$exam_set_id]);
    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'subjects' => $subjects]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
