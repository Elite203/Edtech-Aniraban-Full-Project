<?php
require_once '../config.php';

header('Content-Type: application/json');

$student_id = $_GET['student_id'] ?? null;

if (!$student_id) {
    echo json_encode(['success' => false, 'message' => 'Missing student ID']);
    exit;
}

try {
    // 1. Fetch all first attempts for the student
    $stmt = $pdo->prepare("
        SELECT 
            ean.*,
            es.set_name,
            es.set_number,
            es.exam_name,
            es.positive_marking,
            es.negative_marking,
            c.title as course_title
        FROM exam_attempt_number ean
        JOIN exam_sets es ON ean.set_id = es.id
        JOIN courses c ON ean.course_id = c.id
        WHERE ean.student_id = ? AND ean.attempt_number = 1
        ORDER BY ean.date_of_submit DESC, ean.time_of_submit DESC
    ");
    $stmt->execute([$student_id]);
    $firstAttempts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $performanceData = [];

    foreach ($firstAttempts as $attempt) {
        $setId = $attempt['set_id'];
        $courseId = $attempt['course_id'];
        $pos = floatval($attempt['positive_marking'] ?? 3);
        $neg = floatval($attempt['negative_marking'] ?? 1);

        // A. Calculate metrics for THIS specific attempt
        $resStmt = $pdo->prepare("
            SELECT 
                COUNT(*) as total_attempted,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
                SUM(CASE WHEN is_correct = 0 AND selected_key IS NOT NULL AND selected_key != '' THEN 1 ELSE 0 END) as incorrect_count
            FROM student_exam_responses
            WHERE student_id = ? AND set_id = ? AND course_id = ? AND attempt_number = 1
        ");
        $resStmt->execute([$student_id, $setId, $courseId]);
        $metrics = $resStmt->fetch(PDO::FETCH_ASSOC);

        $corr = intval($metrics['correct_count']);
        $inc = intval($metrics['incorrect_count']);
        $att = intval($metrics['total_attempted']);

        $score = ($corr * $pos) - ($inc * $neg);
        $accuracy = $att > 0 ? round(($corr / $att) * 100) : 0;

        // B. Get Total Marks for this set
        $marksStmt = $pdo->prepare("SELECT SUM(sub_marks) as total_marks FROM subjects WHERE exam_set_id = ?");
        $marksStmt->execute([$setId]);
        $totalMarks = floatval($marksStmt->fetch(PDO::FETCH_ASSOC)['total_marks'] ?? 0);

        // C. Rank and Percentile calculation
        // We need all students' best scores for this set to determine rank
        $rankSql = "
            SELECT student_id, MAX(score) as score
            FROM (
                SELECT 
                    ser.student_id, 
                    ser.attempt_number,
                    SUM(CASE 
                        WHEN ser.is_correct = 1 THEN ? 
                        WHEN ser.is_correct = 0 AND ser.selected_key IS NOT NULL AND ser.selected_key != '' THEN -? 
                        ELSE 0 
                    END) as score
                FROM student_exam_responses ser
                WHERE ser.set_id = ?
                GROUP BY ser.student_id, ser.attempt_number
            ) t
            GROUP BY student_id
            ORDER BY score DESC
        ";
        $rankStmt = $pdo->prepare($rankSql);
        $rankStmt->execute([$pos, $neg, $setId]);
        $allScores = $rankStmt->fetchAll(PDO::FETCH_ASSOC);

        $totalCandidates = count($allScores);
        $rank = 1;
        foreach ($allScores as $s) {
            if ($s['score'] > $score) {
                $rank++;
            } else {
                break;
            }
        }

        $percentile = $totalCandidates > 1 
            ? round((($totalCandidates - $rank) / ($totalCandidates - 1)) * 100, 2) 
            : 100;

        $performanceData[] = [
            'id' => $attempt['id'],
            'test' => ($attempt['set_name'] ?: "SET " . $attempt['set_number']),
            'exam_name' => $attempt['exam_name'],
            'course_title' => $attempt['course_title'],
            'course_id' => $courseId,
            'set_id' => $setId,
            'set_number' => $attempt['set_number'],
            'date' => $attempt['date_of_submit'],
            'score' => $score,
            'totalMarks' => $totalMarks,
            'accuracy' => $accuracy,
            'rank' => $rank,
            'percentile' => $percentile,
            'total_candidates' => $totalCandidates
        ];
    }

    echo json_encode(['success' => true, 'data' => $performanceData]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
