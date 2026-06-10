<?php
require_once '../config.php';

header('Content-Type: application/json');

$course_id = $_GET['course_id'] ?? null;
$exam_set_id = $_GET['exam_set_id'] ?? null;
$set_number = $_GET['set_number'] ?? null;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;

if (!$exam_set_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing exam_set_id']);
    exit;
}

try {
    // Start from exam_attempt_number to ensure every student who submitted is visible
    // Join with student_exam_responses to calculate the score for that specific attempt
    $sql = "SELECT 
                el.student_id as user_id,
                CONCAT(s.first_name, ' ', s.last_name) as name,
                s.photo as image_blob,
                el.total_marks as score,
                el.total_time as total_time_spent
            FROM exam_leaderboard el
            JOIN students s ON el.student_id = s.id
            WHERE el.set_id = :exam_set_id 
            ORDER BY score DESC, total_time_spent ASC
            LIMIT :limit";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':exam_set_id', $exam_set_id, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Transform blob to Base64
    foreach ($leaderboard as &$entry) {
        if ($entry['image_blob']) {
            $entry['image'] = 'data:image/jpeg;base64,' . base64_encode($entry['image_blob']);
        } else {
            $entry['image'] = null;
        }
        unset($entry['image_blob']);
        
        // Ensure numeric types
        $entry['score'] = round((float)$entry['score'], 2);
        $entry['total_time_spent'] = (int)$entry['total_time_spent'];
    }

    echo json_encode([
        'status' => 'success',
        'data' => $leaderboard
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
