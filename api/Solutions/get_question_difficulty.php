<?php
require_once '../config.php';

header('Content-Type: application/json');

$exam_set_id = $_GET['exam_set_id'] ?? null;

if (!$exam_set_id) {
    echo json_encode(['status' => 'error', 'message' => 'exam_set_id is required']);
    exit;
}

try {
    // Select correct and total counts for Attempt #1 only, grouped by question
    $sql = "SELECT 
                question_id,
                COUNT(*) as total_students,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_students
            FROM student_exam_responses 
            WHERE set_id = ? AND attempt_number = 1
            GROUP BY question_id";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$exam_set_id]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $difficulty_data = [];
    foreach ($results as $row) {
        $difficulty_data[$row['question_id']] = [
            'total' => (int)$row['total_students'],
            'correct' => (int)$row['correct_students']
        ];
    }

    echo json_encode([
        'status' => 'success',
        'data' => $difficulty_data
    ]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
