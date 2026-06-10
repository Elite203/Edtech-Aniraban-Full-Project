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
    // Fetch all questions with their chapter and topic names for the entire exam set
    // This logic accounts for sub-questions that might inherit subject/topic from their parent passage
    $sql = "SELECT 
                q.id as question_id,
                q.question_type,
                q.passage_id,
                COALESCE(ct.name, pct.name) as topic_name,
                COALESCE(c.name, pc.name) as chapter_name
            FROM questions q
            LEFT JOIN passages p ON q.passage_id = p.id
            -- Effective Subject Join
            JOIN subjects s ON COALESCE(q.subject_id, p.subject_id) = s.id
            -- Question's own topic/chapter
            LEFT JOIN chapter_topics ct ON q.topic_id = ct.id
            LEFT JOIN chapters c ON ct.chapter_id = c.id
            -- Parent passage's topic/chapter (fallback)
            LEFT JOIN chapter_topics pct ON p.topic_id = pct.id
            LEFT JOIN chapters pc ON pct.chapter_id = pc.id
            WHERE s.exam_set_id = ?
            AND q.question_type != 'passage'"; // Exclude passage containers, only count answerable items
            
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
