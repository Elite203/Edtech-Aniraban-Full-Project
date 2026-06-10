<?php
require_once '../config.php';

header('Content-Type: application/json');

$exam_set_id = $_GET['exam_set_id'] ?? null;

if (!$exam_set_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing exam_set_id']);
    exit;
}

try {
    // Specifically fetch the metrics of the student with the highest score (Attempt #1)
    $sql = "SELECT 
                ean.student_id as user_id,
                CONCAT(s.first_name, ' ', s.last_name) as name,
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
            JOIN students s ON ean.student_id = s.id
            JOIN exam_sets es ON ean.set_id = es.id
            LEFT JOIN student_exam_responses ser ON (
                ean.student_id = ser.student_id 
                AND ean.set_id = ser.set_id 
                AND ean.attempt_number = ser.attempt_number
            )
            WHERE ean.set_id = :exam_set_id 
              AND ean.attempt_number = 1
            GROUP BY ean.student_id
            ORDER BY score DESC, total_time_spent ASC
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':exam_set_id', $exam_set_id, PDO::PARAM_INT);
    $stmt->execute();
    $topper = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($topper) {
        $topper['score'] = round((float)$topper['score'], 2);
        $topper['total_time_spent'] = (int)$topper['total_time_spent'];
        $topper['correct_count'] = (int)$topper['correct_count'];
        $topper['incorrect_count'] = (int)$topper['incorrect_count'];
        $topper['attempted_count'] = (int)$topper['attempted_count'];
    }

    echo json_encode([
        'status' => 'success',
        'data' => $topper ? $topper : null
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
