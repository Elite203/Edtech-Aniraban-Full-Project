<?php
header('Content-Type: application/json');
require_once '../config.php'; // This file creates the $pdo variable

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $exam_set_id = isset($_GET['exam_set_id']) ? intval($_GET['exam_set_id']) : 0;
    
    if (!$exam_set_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'exam_set_id is required']);
        exit;
    }

    // --- FIX: Using $pdo and PDO-style fetching ---
    $examSetQuery = "SELECT total_time_minutes, is_sectional_enabled FROM exam_sets WHERE id = ?";
    $stmt = $pdo->prepare($examSetQuery);
    $stmt->execute([$exam_set_id]);
    $examSet = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$examSet) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Exam set not found']);
        exit;
    }

    // If sectional is enabled
    if ($examSet['is_sectional_enabled']) {
        $subjectsQuery = "SELECT subject_name, sectional_time_minutes, section_number FROM subjects WHERE exam_set_id = ? ORDER BY id ASC";
        $stmt = $pdo->prepare($subjectsQuery);
        $stmt->execute([$exam_set_id]);

        $subjects = [];
        $sections = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $sectionNum = $row['section_number'] ? intval($row['section_number']) : 0;
            $subjects[] = [
                'name' => $row['subject_name'],
                'sectional_time_minutes' => $row['sectional_time_minutes'],
                'section_number' => $sectionNum
            ];
            
            if ($sectionNum > 0) {
                if (!isset($sections[$sectionNum])) {
                    $sections[$sectionNum] = [
                        'id' => $sectionNum,
                        'name' => "SECTION - $sectionNum",
                        'time_minutes' => intval($row['sectional_time_minutes']),
                        'subjects' => []
                    ];
                }
                $sections[$sectionNum]['subjects'][] = $row['subject_name'];
            }
        }

        echo json_encode([
            'success' => true,
            'type' => 'sectional',
            'sections' => array_values($sections),
            'subjects' => $subjects
        ]);
        exit;
    }

    // If overall time is defined, return it with all subjects accessible
    if ($examSet['total_time_minutes'] && $examSet['total_time_minutes'] > 0) {
        echo json_encode([
            'success' => true,
            'type' => 'overall',
            'total_time_minutes' => intval($examSet['total_time_minutes']),
            'subjects' => [] // Frontend will know all subjects are accessible
        ]);
        exit;
    }

    // --- FIX: Using $pdo and PDO-style fetching ---
    // Otherwise, fetch subject-wise times
    $subjectsQuery = "SELECT subject_name, time_minutes FROM subjects WHERE exam_set_id = ? ORDER BY id ASC";
    $stmt = $pdo->prepare($subjectsQuery);
    $stmt->execute([$exam_set_id]);

    $subjects = [];
    $totalTime = 0;

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $timeMinutes = $row['time_minutes'] ? intval($row['time_minutes']) : 0;
        $subjects[] = [
            'name' => $row['subject_name'],
            'time_minutes' => $timeMinutes
        ];
        $totalTime += $timeMinutes;
    }

    echo json_encode([
        'success' => true,
        'type' => 'subject_wise',
        'total_time_minutes' => $totalTime,
        'subjects' => $subjects
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
