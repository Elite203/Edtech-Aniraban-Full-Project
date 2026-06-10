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
    // 1. Fetch Exam Set Details
    $examStmt = $pdo->prepare("SELECT * FROM exam_sets WHERE id = ?");
    $examStmt->execute([$examSetId]);
    $examSet = $examStmt->fetch(PDO::FETCH_ASSOC);

    if (!$examSet) {
        echo json_encode(['success' => false, 'message' => 'Exam set not found']);
        exit;
    }

    // 2. Fetch Subjects for the Exam Set
    $subjectStmt = $pdo->prepare("SELECT * FROM subjects WHERE exam_set_id = ? ORDER BY section_number ASC, id ASC");
    $subjectStmt->execute([$examSetId]);
    $subjects = $subjectStmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Fetch Questions for the Exam Set (including sub-questions)
    $questionSql = "SELECT q.*, s.subject_name FROM questions q
                    INNER JOIN subjects s ON q.subject_id = s.id
                    WHERE s.exam_set_id = ?
                    ORDER BY s.section_number ASC, s.id ASC, 
                             CASE WHEN q.parent_question_id IS NULL THEN q.id ELSE q.parent_question_id END ASC,
                             CASE WHEN q.parent_question_id IS NULL THEN 0 ELSE 1 END ASC,
                             q.id ASC";
    $questionStmt = $pdo->prepare($questionSql);
    $questionStmt->execute([$examSetId]);
    $questionsRaw = $questionStmt->fetchAll(PDO::FETCH_ASSOC);

    $questions = [];
    foreach ($questionsRaw as $q) {
        if (isset($q['question_image']) && $q['question_image']) {
            $q['question_image_url'] = 'data:' . $q['question_image_type'] . ';base64,' . base64_encode($q['question_image']);
        } else {
            $q['question_image_url'] = null;
        }
        unset($q['question_image']);
        $questions[] = $q;
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'exam_set' => $examSet,
            'subjects' => $subjects,
            'questions' => $questions
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
