<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$course_id = $_GET['course_id'] ?? null;
$exam_set_id = $_GET['exam_set_id'] ?? null;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;

if (!$exam_set_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing exam_set_id']);
    exit;
}

try {
    // Get each student's best attempt score
    $sql = "
        SELECT 
            s.id as user_id,
            CONCAT(COALESCE(s.first_name, ''), ' ', COALESCE(s.last_name, '')) as name,
            s.photo as image,
            best_scores.score,
            best_scores.correct_answers,
            best_scores.total_questions,
            best_scores.total_time_spent,
            best_scores.attempt_number
        FROM students s
        JOIN (
            SELECT 
                t1.student_id,
                t1.attempt_number,
                t1.score,
                t1.correct_answers,
                t1.total_questions,
                t1.total_time_spent
            FROM (
                SELECT 
                    ser.student_id,
                    ser.attempt_number,
                    SUM(CASE WHEN ser.is_correct = 1 THEN 3 WHEN ser.selected_key IS NOT NULL AND ser.selected_key != '' AND ser.is_correct = 0 THEN -1 ELSE 0 END) as score,
                    SUM(CASE WHEN ser.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
                    COUNT(DISTINCT ser.question_id) as total_questions,
                    SUM(ser.time_spent) as total_time_spent
                FROM student_exam_responses ser
                WHERE ser.set_id = ?
                GROUP BY ser.student_id, ser.attempt_number
            ) t1
            INNER JOIN (
                SELECT 
                    student_id,
                    MAX(score) as max_score
                FROM (
                    SELECT 
                        student_id,
                        SUM(CASE WHEN is_correct = 1 THEN 3 WHEN selected_key IS NOT NULL AND selected_key != '' AND is_correct = 0 THEN -1 ELSE 0 END) as score
                    FROM student_exam_responses
                    WHERE set_id = ?
                    GROUP BY student_id, attempt_number
                ) t2_inner
                GROUP BY student_id
            ) t2 ON t1.student_id = t2.student_id AND t1.score = t2.max_score
        ) best_scores ON s.id = best_scores.student_id
        GROUP BY s.id
        ORDER BY best_scores.score DESC, best_scores.total_time_spent ASC
        LIMIT $limit
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$exam_set_id, $exam_set_id]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Add percentage and convert image
    foreach ($results as &$row) {
        $row['percentage'] = $row['total_questions'] > 0 
            ? round(($row['correct_answers'] / $row['total_questions']) * 100, 2) 
            : 0;
        
        if (!empty($row['image'])) {
            $row['image'] = 'data:image/jpeg;base64,' . base64_encode($row['image']);
        } else {
            $row['image'] = null;
        }
    }

    echo json_encode([
        'status' => 'success',
        'data' => $results
    ]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
