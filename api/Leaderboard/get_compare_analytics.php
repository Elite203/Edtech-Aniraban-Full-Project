<?php
require_once '../config.php';

header('Content-Type: application/json');

$exam_set_id = $_GET['exam_set_id'] ?? null;

if (!$exam_set_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing exam_set_id']);
    exit;
}

try {
    // This query aggregates metrics per student AND per subject
    // It captures every student who submitted Attempt #1
    $sql = "SELECT 
                ean.student_id as user_id,
                COALESCE(sub.subject_name, 'General') as subject_name,
                SUM(CASE 
                    WHEN ser.is_correct = 1 
                        THEN COALESCE(es.positive_marking, 0)
                    WHEN (TRIM(ser.selected_key) IS NOT NULL AND TRIM(ser.selected_key) != '') AND (ser.is_correct IS NULL OR ser.is_correct != 1) 
                        THEN -ABS(COALESCE(es.negative_marking, 0))
                    ELSE 0 
                END) as score,
                SUM(CASE WHEN ser.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
                SUM(CASE WHEN (TRIM(ser.selected_key) IS NOT NULL AND TRIM(ser.selected_key) != '') AND (ser.is_correct IS NULL OR ser.is_correct != 1) THEN 1 ELSE 0 END) as incorrect_count,
                SUM(CASE WHEN (TRIM(ser.selected_key) IS NOT NULL AND TRIM(ser.selected_key) != '') THEN 1 ELSE 0 END) as attempted_count,
                COALESCE(SUM(ser.time_spent), 0) as total_time_spent
            FROM exam_attempt_number ean
            JOIN exam_sets es ON ean.set_id = es.id
            JOIN students s ON ean.student_id = s.id
            LEFT JOIN student_exam_responses ser ON (
                ean.student_id = ser.student_id 
                AND ean.set_id = ser.set_id 
                AND ean.attempt_number = ser.attempt_number
            )
            LEFT JOIN questions q ON ser.question_id = q.id
            LEFT JOIN subjects sub ON q.subject_id = sub.id
            WHERE ean.set_id = :exam_set_id 
              AND ean.attempt_number = 1
            GROUP BY ean.student_id, sub.id, sub.subject_name
            ORDER BY ean.student_id ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':exam_set_id', $exam_set_id, PDO::PARAM_INT);
    $stmt->execute();
    $analytics = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Grouping into a more structured format is optional, 
    // but returning a flat list is more flexible for frontend processing.
    foreach ($analytics as &$row) {
        $row['score'] = (float)$row['score'];
        $row['correct_count'] = (int)$row['correct_count'];
        $row['incorrect_count'] = (int)$row['incorrect_count'];
        $row['attempted_count'] = (int)$row['attempted_count'];
        $row['total_time_spent'] = (int)$row['total_time_spent'];
    }

    echo json_encode([
        'status' => 'success',
        'data' => $analytics
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
