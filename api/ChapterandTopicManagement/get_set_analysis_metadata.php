<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_GET['exam_set_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing exam_set_id']);
    exit;
}

$examSetId = $_GET['exam_set_id'];

try {
    // Fetch unique chapter and topic names for the questions in this exam set
    $sql = "SELECT DISTINCT 
                c.name as chapter_name, 
                t.name as topic_name 
            FROM questions q
            JOIN subjects s ON q.subject_id = s.id
            LEFT JOIN chapter_topics t ON q.topic_id = t.id
            LEFT JOIN chapters c ON t.chapter_id = c.id
            WHERE s.exam_set_id = ?
            AND (c.name IS NOT NULL OR t.name IS NOT NULL)";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$examSetId]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $data
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
