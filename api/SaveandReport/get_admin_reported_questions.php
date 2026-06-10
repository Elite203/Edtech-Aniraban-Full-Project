<?php
require_once '../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $sql = "SELECT rq.id, rq.student_id, rq.question_id, rq.quiz_type, rq.issue_type, rq.description, rq.remarks, rq.rating, rq.created_at, rq.image, rq.is_checked,
                   CONCAT(s.first_name, ' ', s.last_name) as student_name,
                   CASE 
                       WHEN rq.quiz_type = 'current_affairs' THEN caq.Question_En
                       ELSE q.question_english 
                   END as question_english,
                   CASE 
                       WHEN rq.quiz_type = 'current_affairs' THEN caq.Question_Hi
                       ELSE q.question_hindi
                   END as question_hindi,
                   CASE 
                       WHEN rq.quiz_type = 'current_affairs' THEN 'Current Affairs'
                       ELSE sub.subject_name
                   END as subject_name,
                   CASE 
                       WHEN rq.quiz_type = 'current_affairs' THEN ca_quiz.Month
                       ELSE es.exam_name
                   END as exam_name,
                   CASE 
                       WHEN rq.quiz_type = 'current_affairs' THEN ca_quiz.Year
                       ELSE es.set_name
                   END as set_name,
                   CASE 
                       WHEN rq.quiz_type = 'current_affairs' THEN 'Current Affairs Quiz'
                       ELSE c.title
                   END as course_name
            FROM report_questions rq
            LEFT JOIN students s ON rq.student_id = s.id
            LEFT JOIN questions q ON rq.question_id = q.id AND rq.quiz_type != 'current_affairs'
            LEFT JOIN subjects sub ON q.subject_id = sub.id
            LEFT JOIN exam_sets es ON sub.exam_set_id = es.id
            LEFT JOIN courses c ON es.course_id = c.id
            LEFT JOIN CurrentAffairs_Questions caq ON rq.question_id = caq.QuestionID AND rq.quiz_type = 'current_affairs'
            LEFT JOIN CurrentAffairs_Quiz_Detail ca_quiz ON caq.QuizID = ca_quiz.QuizID
            ORDER BY rq.created_at DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert blob images to Base64 data URLs for the frontend
    foreach ($reports as &$report) {
        if ($report['image']) {
            // We don't know the exact mime type, but most are PNG or JPEG.
            // Using a generic image/png as base64 prefix should work for most browsers.
            $report['image_url'] = 'data:image/png;base64,' . base64_encode($report['image']);
        } else {
            $report['image_url'] = null;
        }
        // Remove the raw blob data from the response to reduce payload size
        unset($report['image']);
    }

    echo json_encode(['success' => true, 'data' => $reports]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error fetching reported questions: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'General error: ' . $e->getMessage()]);
}
?>
