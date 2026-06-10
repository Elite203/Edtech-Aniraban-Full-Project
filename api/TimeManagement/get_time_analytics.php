<?php
require_once '../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$exam_set_id = $_GET['exam_set_id'] ?? null;
$student_id = $_GET['student_id'] ?? null;
$course_id = $_GET['course_id'] ?? null;
$set_number = $_GET['set_number'] ?? null;
$attempt_number = $_GET['attempt_number'] ?? 1;

if (!$exam_set_id || !$student_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required parameters']);
    exit;
}

try {
    // 1. Identify Overall Topper (Rank 1, Attempt 1)
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
    $topper_id = $topper ? $topper['student_id'] : null;

    // 2. Fetch Exam Structure & Timing Config
    $sqlStructure = "SELECT s.id as subject_id, s.subject_name, s.section_number, 
                            s.time_minutes, s.sectional_time_minutes,
                            es.is_sectional_enabled, es.total_time_minutes
                    FROM subjects s
                    JOIN exam_sets es ON s.exam_set_id = es.id
                    WHERE s.exam_set_id = :exam_set_id 
                    ORDER BY s.section_number ASC, s.id ASC";
    $stmtStructure = $pdo->prepare($sqlStructure);
    $stmtStructure->bindValue(':exam_set_id', $exam_set_id, PDO::PARAM_INT);
    $stmtStructure->execute();
    $subjects = $stmtStructure->fetchAll(PDO::FETCH_ASSOC);

    // Determine Timing Mode
    $timing_mode = 'overall'; // Default
    $has_subject_time = false;
    $has_sectional_time = false;
    $is_sectional_enabled = false;

    if (!empty($subjects)) {
        $is_sectional_enabled = (bool) $subjects[0]['is_sectional_enabled'];
        foreach ($subjects as $s) {
            if (!empty($s['time_minutes']))
                $has_subject_time = true;
            if (!empty($s['sectional_time_minutes']))
                $has_sectional_time = true;
        }
    }

    if ($is_sectional_enabled && $has_sectional_time) {
        $timing_mode = 'sectional';
    } elseif ($has_subject_time) {
        $timing_mode = 'subjective';
    }

    // 3. Fetch User and Topper Responses
    $userResponses = [];
    $topperResponses = [];

    // Fetch Student data (Specific attempt)
    $stmtUser = $pdo->prepare("SELECT question_id, time_spent, is_correct 
                              FROM student_exam_responses 
                              WHERE student_id = :uid 
                                AND set_id = :exam_set_id 
                                AND attempt_number = :att");
    $stmtUser->execute(['uid' => $student_id, 'exam_set_id' => $exam_set_id, 'att' => $attempt_number]);
    $userResponses = $stmtUser->fetchAll(PDO::FETCH_ASSOC);

    // Fetch Topper data (Strictly Attempt 1)
    if ($topper_id) {
        $stmtTopper = $pdo->prepare("SELECT question_id, time_spent, is_correct 
                                   FROM student_exam_responses 
                                   WHERE student_id = :uid 
                                     AND set_id = :exam_set_id 
                                     AND attempt_number = 1");
        $stmtTopper->execute(['uid' => $topper_id, 'exam_set_id' => $exam_set_id]);
        $topperResponses = $stmtTopper->fetchAll(PDO::FETCH_ASSOC);
    }

    // 4. Map questions to subjects
    $sqlQuestions = "SELECT q.id, q.subject_id 
                    FROM questions q 
                    INNER JOIN subjects s ON q.subject_id = s.id 
                    WHERE s.exam_set_id = :exam_set_id";
    $stmtQuestions = $pdo->prepare($sqlQuestions);
    $stmtQuestions->bindValue(':exam_set_id', $exam_set_id, PDO::PARAM_INT);
    $stmtQuestions->execute();
    $qToS = [];
    foreach ($stmtQuestions->fetchAll(PDO::FETCH_ASSOC) as $q) {
        $qToS[$q['id']] = $q['subject_id'];
    }

    // 5. Aggregate
    $analytics = [
        'overall' => ['user' => 0, 'topper' => 0],
        'subjects' => [],
        'sections' => [],
        'questions' => []
    ];

    // Initialize subject/section containers
    $subData = [];
    $secData = [];
    foreach ($subjects as $s) {
        $subData[$s['subject_id']] = ['name' => $s['subject_name'], 'user' => 0, 'topper' => 0, 'section' => $s['section_number']];
        if (!isset($secData[$s['section_number']])) {
            $secData[$s['section_number']] = ['name' => "Section " . $s['section_number'], 'user' => 0, 'topper' => 0];
        }
    }

    // Process User
    foreach ($userResponses ?? [] as $res) {
        $analytics['overall']['user'] += $res['time_spent'];
        $sid = $qToS[$res['question_id']] ?? null;
        if ($sid && isset($subData[$sid])) {
            $subData[$sid]['user'] += $res['time_spent'];
            $secData[$subData[$sid]['section']]['user'] += $res['time_spent'];
        }
        $analytics['questions'][$res['question_id']]['user'] = $res['time_spent'];
    }

    // Process Topper
    foreach ($topperResponses ?? [] as $res) {
        $analytics['overall']['topper'] += $res['time_spent'];
        $sid = $qToS[$res['question_id']] ?? null;
        if ($sid && isset($subData[$sid])) {
            $subData[$sid]['topper'] += $res['time_spent'];
            $secData[$subData[$sid]['section']]['topper'] += $res['time_spent'];
        }
        $analytics['questions'][$res['question_id']]['topper'] = $res['time_spent'];
    }

    $analytics['subjects'] = array_values($subData);
    $analytics['sections'] = array_values($secData);
    $analytics['timing_mode'] = $timing_mode;

    echo json_encode([
        'status' => 'success',
        'data' => $analytics,
        'topper_id' => $topper_id
    ]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
