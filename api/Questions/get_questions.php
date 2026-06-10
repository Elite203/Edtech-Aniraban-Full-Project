<?php
// --- get_questions.php ---
// Fetches questions and passages based on provided URL parameters
// ?subject_id=1 (Gets all questions and passages for a subject)
// ?parent_id=1 (Gets all sub-questions for a passage)
// ?id=1 (Gets a single question by its ID)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

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
    $results = [];

    if (isset($_GET['id'])) {
        // --- Fetch a Single Question ---
        $stmt = $pdo->prepare("SELECT q.*, ct.name as topic_name, c.name as chapter_name 
                                FROM questions q 
                                LEFT JOIN chapter_topics ct ON q.topic_id = ct.id 
                                LEFT JOIN chapters c ON ct.chapter_id = c.id
                                WHERE q.id = ?");
        $stmt->execute([$_GET['id']]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } elseif (isset($_GET['parent_id'])) {
        // --- Fetch all Sub-Questions for a Passage ---
        $stmt = $pdo->prepare("SELECT q.*, ct.name as topic_name, c.name as chapter_name 
                                FROM questions q 
                                LEFT JOIN chapter_topics ct ON q.topic_id = ct.id 
                                LEFT JOIN chapters c ON ct.chapter_id = c.id
                                WHERE q.passage_id = ? ORDER BY q.id ASC");
        $stmt->execute([$_GET['parent_id']]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } elseif (isset($_GET['subject_id'])) {
        // --- Fetch all questions (where passage_id IS NULL) and passages for a subject ---
        $subject_id = $_GET['subject_id'];

        // Fetch Normal Questions
        $stmtQ = $pdo->prepare("SELECT q.*, ct.name as topic_name, c.name as chapter_name 
                                FROM questions q 
                                LEFT JOIN chapter_topics ct ON q.topic_id = ct.id 
                                LEFT JOIN chapters c ON ct.chapter_id = c.id
                                WHERE q.subject_id = ? AND q.passage_id IS NULL");
        $stmtQ->execute([$subject_id]);
        $questions = $stmtQ->fetchAll(PDO::FETCH_ASSOC);

        // Fetch Passages
        $stmtP = $pdo->prepare("SELECT p.id, p.subject_id, p.topic_id, p.passage_english, p.passage_hindi, 
                                       NULLIF(p.solution_english, '') as solution_english, 
                                       NULLIF(p.solution_hindi, '') as solution_hindi, 
                                       NULLIF(p.youtube_link, '') as youtube_link, 
                                       'passage' as question_type, ct.name as topic_name, c.name as chapter_name, p.created_at,
                                       (SELECT COUNT(*) FROM questions sq WHERE sq.passage_id = p.id) as sub_questions_count 
                                FROM passages p 
                                LEFT JOIN chapter_topics ct ON p.topic_id = ct.id 
                                LEFT JOIN chapters c ON ct.chapter_id = c.id
                                WHERE p.subject_id = ?");
        $stmtP->execute([$subject_id]);
        $passages = $stmtP->fetchAll(PDO::FETCH_ASSOC);

        $results = array_merge($questions, $passages);

        // Sort by created_at DESC
        usort($results, function ($a, $b) {
            return (strtotime($b['created_at'] ?? 0)) - (strtotime($a['created_at'] ?? 0));
        });
    } elseif (isset($_GET['exam_set_id'])) {
        // --- Fetch all Questions and Passages for an Exam Set ---
        $exam_set_id = $_GET['exam_set_id'];

        // Fetch Normal Questions for the exam set (via subjects)
        $include_sub = isset($_GET['include_sub_questions']) && $_GET['include_sub_questions'] == '1';
        $q_condition = $include_sub ? "" : "AND q.passage_id IS NULL";
        $stmtQ = $pdo->prepare("SELECT q.*, s.subject_name as subject, ct.name as topic_name, c.name as chapter_name,
                                       p.passage_english, p.passage_hindi
                                FROM questions q 
                                INNER JOIN subjects s ON q.subject_id = s.id 
                                LEFT JOIN chapter_topics ct ON q.topic_id = ct.id 
                                LEFT JOIN chapters c ON ct.chapter_id = c.id
                                LEFT JOIN passages p ON q.passage_id = p.id
                                WHERE s.exam_set_id = ? $q_condition");
        $stmtQ->execute([$exam_set_id]);
        $questions = $stmtQ->fetchAll(PDO::FETCH_ASSOC);

        // Fetch Passages for the exam set (via subjects)
        $stmtP = $pdo->prepare("SELECT p.id, p.subject_id, p.topic_id, p.passage_english, p.passage_hindi, 
                                       NULLIF(p.solution_english, '') as solution_english, 
                                       NULLIF(p.solution_hindi, '') as solution_hindi, 
                                       NULLIF(p.youtube_link, '') as youtube_link, 
                                       'passage' as question_type, s.subject_name as subject, ct.name as topic_name, c.name as chapter_name, p.created_at,
                                       (SELECT COUNT(*) FROM questions sq WHERE sq.passage_id = p.id) as sub_questions_count 
                                FROM passages p 
                                INNER JOIN subjects s ON p.subject_id = s.id 
                                LEFT JOIN chapter_topics ct ON p.topic_id = ct.id 
                                LEFT JOIN chapters c ON ct.chapter_id = c.id
                                WHERE s.exam_set_id = ?");
        $stmtP->execute([$exam_set_id]);
        $passages = $stmtP->fetchAll(PDO::FETCH_ASSOC);

        $results = array_merge($questions, $passages);

        // Sort by subject ID then created_at
        usort($results, function ($a, $b) {
            return ($a['subject_id'] <=> $b['subject_id']) ?: (strtotime($b['created_at']) <=> strtotime($a['created_at']));
        });
    }

    // Convert blob images to Base64 data URLs for the frontend
    foreach ($results as &$q) {
        if (isset($q['question_image']) && $q['question_image']) {
            $q['question_image_url'] = 'data:' . $q['question_image_type'] . ';base64,' . base64_encode($q['question_image']);
        } else {
            $q['question_image_url'] = null;
        }
        unset($q['question_image']);
    }

    echo json_encode(['success' => true, 'data' => $results]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
