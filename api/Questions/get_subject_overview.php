<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

$subject_id = $_GET['subject_id'] ?? null;

if (!$subject_id) {
    echo json_encode(['success' => false, 'message' => 'Missing subject_id']);
    exit;
}

try {
    // 1. Count Normal Questions (passage_id is NULL)
    $stmtNormal = $pdo->prepare("SELECT COUNT(*) FROM questions WHERE subject_id = ? AND passage_id IS NULL");
    $stmtNormal->execute([$subject_id]);
    $normal_count = $stmtNormal->fetchColumn();

    // 2. Count Passages
    $stmtPassages = $pdo->prepare("SELECT COUNT(*) FROM passages WHERE subject_id = ?");
    $stmtPassages->execute([$subject_id]);
    $passage_count = $stmtPassages->fetchColumn();

    // 3. Count Sub-questions (passage_id is NOT NULL)
    $stmtSub = $pdo->prepare("SELECT COUNT(*) FROM questions WHERE subject_id = ? AND passage_id IS NOT NULL");
    $stmtSub->execute([$subject_id]);
    $sub_question_count = $stmtSub->fetchColumn();

    // 4. Chapter-wise and Topic-wise breakdown for all questions (normal + sub)
    // We'll also include topics for passages.
    
    // Total answerable questions = normal + sub
    $total_answerable = $normal_count + $sub_question_count;

    // Get breakdown by Chapter/Topic
    $breakdown_sql = "
        SELECT 
            c.name as chapter_name, 
            ct.name as topic_name, 
            COUNT(q.id) as question_count
        FROM questions q
        LEFT JOIN chapter_topics ct ON q.topic_id = ct.id
        LEFT JOIN chapters c ON ct.chapter_id = c.id
        WHERE q.subject_id = ?
        GROUP BY c.id, ct.id
        ORDER BY c.name, ct.name
    ";
    $stmtBreakdown = $pdo->prepare($breakdown_sql);
    $stmtBreakdown->execute([$subject_id]);
    $breakdown = $stmtBreakdown->fetchAll(PDO::FETCH_ASSOC);

    // Grouping breakdown by chapter for better display
    $chapter_breakdown = [];
    foreach ($breakdown as $row) {
        $cName = $row['chapter_name'] ?: 'Uncategorized';
        if (!isset($chapter_breakdown[$cName])) {
            $chapter_breakdown[$cName] = [
                'chapter_name' => $cName,
                'total_questions' => 0,
                'topics' => []
            ];
        }
        $chapter_breakdown[$cName]['total_questions'] += $row['question_count'];
        $chapter_breakdown[$cName]['topics'][] = [
            'topic_name' => $row['topic_name'] ?: 'No Topic',
            'count' => $row['question_count']
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'total_answerable' => $total_answerable,
            'normal_questions' => $normal_count,
            'passages' => $passage_count,
            'sub_questions' => $sub_question_count,
            'chapter_breakdown' => array_values($chapter_breakdown)
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
