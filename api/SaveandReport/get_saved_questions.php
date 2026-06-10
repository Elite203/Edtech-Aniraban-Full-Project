<?php
require_once '../config.php';

$student_id = $_GET['student_id'] ?? null;

if (!$student_id) {
    echo json_encode(['success' => false, 'message' => 'Student ID is required.']);
    exit;
}

try {
    // 1. Fetch Regular Test Series Questions
    $sql1 = "SELECT sq.id as bookmark_id, sq.created_at as saved_date, sq.quiz_type, 
                   q.*, s.subject_name, es.set_name, es.set_number, c.title as course_name, 
                   es.course_id, es.id as set_id
            FROM save_questions sq
            JOIN questions q ON sq.question_id = q.id
            JOIN subjects s ON q.subject_id = s.id
            JOIN exam_sets es ON s.exam_set_id = es.id
            JOIN courses c ON es.course_id = c.id
            WHERE sq.student_id = ? AND sq.quiz_type IN ('old_ui', 'new_ui')";
            
    $stmt1 = $pdo->prepare($sql1);
    $stmt1->execute([$student_id]);
    $test_series = $stmt1->fetchAll(PDO::FETCH_ASSOC);

    // 2. Fetch Current Affairs Questions
    $sql2 = "SELECT sq.id as bookmark_id, sq.created_at as saved_date, sq.quiz_type, 
                   caq.*, qd.Year, qd.Month
            FROM save_questions sq
            JOIN CurrentAffairs_Questions caq ON sq.question_id = caq.QuestionID
            JOIN CurrentAffairs_Quiz_Detail qd ON caq.QuizID = qd.QuizID
            WHERE sq.student_id = ? AND sq.quiz_type = 'current_affairs'";
            
    $stmt2 = $pdo->prepare($sql2);
    $stmt2->execute([$student_id]);
    $current_affairs = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    // Merge results
    $all_bookmarks = array_merge($test_series, $current_affairs);
    
    // Sort by saved_date DESC
    usort($all_bookmarks, function($a, $b) {
        return strtotime($b['saved_date']) - strtotime($a['saved_date']);
    });

    echo json_encode(['success' => true, 'data' => $all_bookmarks]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error fetching saved questions: ' . $e->getMessage()]);
}
?>
