<?php
require_once '../config.php';

header('Content-Type: application/json');

$exam_set_id = $_GET['exam_set_id'] ?? null;

if (!$exam_set_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing exam_set_id']);
    exit;
}

try {
    // 1. Find the Overall Topper Student ID (Rank 1, Attempt #1)
    $sqlTopper = "SELECT 
                    ean.student_id
                FROM exam_attempt_number ean
                JOIN exam_sets es ON ean.set_id = es.id
                LEFT JOIN student_exam_responses ser ON (
                    ean.student_id = ser.student_id 
                    AND ean.set_id = ser.set_id 
                    AND ean.attempt_number = ser.attempt_number
                )
                WHERE ean.set_id = :exam_set_id 
                  AND ean.attempt_number = 1
                GROUP BY ean.student_id
                ORDER BY 
                    SUM(CASE 
                        WHEN ser.is_correct = 1 THEN COALESCE(es.positive_marking, 0)
                        WHEN (TRIM(ser.selected_key) IS NOT NULL AND TRIM(ser.selected_key) != '') AND (ser.is_correct IS NULL OR ser.is_correct != 1) THEN -ABS(COALESCE(es.negative_marking, 0))
                        ELSE 0 
                    END) DESC, 
                    COALESCE(SUM(ser.time_spent), 0) ASC
                LIMIT 1";

    $stmtTopper = $pdo->prepare($sqlTopper);
    $stmtTopper->bindValue(':exam_set_id', $exam_set_id, PDO::PARAM_INT);
    $stmtTopper->execute();
    $topper = $stmtTopper->fetch(PDO::FETCH_ASSOC);

    if (!$topper) {
        echo json_encode(['status' => 'success', 'data' => []]);
        exit;
    }

    $topper_id = $topper['student_id'];

    // 2. Fetch all response times for this topper for this set
    $sqlTimes = "SELECT 
                    question_id, 
                    time_spent 
                FROM student_exam_responses 
                WHERE student_id = :student_id 
                  AND set_id = :exam_set_id 
                  AND attempt_number = 1";
    
    $stmtTimes = $pdo->prepare($sqlTimes);
    $stmtTimes->bindValue(':student_id', $topper_id, PDO::PARAM_INT);
    $stmtTimes->bindValue(':exam_set_id', $exam_set_id, PDO::PARAM_INT);
    $stmtTimes->execute();
    $times = $stmtTimes->fetchAll(PDO::FETCH_ASSOC);

    // 3. Format as question_id => time_spent map
    $timesMap = [];
    foreach ($times as $row) {
        $timesMap[$row['question_id']] = (int)$row['time_spent'];
    }

    echo json_encode([
        'status' => 'success',
        'data' => $timesMap
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
