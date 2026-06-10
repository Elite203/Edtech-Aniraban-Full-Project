<?php
require_once '../config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$student_id = $data['student_id'] ?? null;
$set_id = $data['set_id'] ?? null;
$course_id = $data['course_id'] ?? null;
$ui_type = $data['ui_type'] ?? null; // 'new' or 'old'
$responses = $data['responses'] ?? []; // Array of granular responses

if (!$student_id || !$set_id || !$course_id) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    // Ensure responses and attempt history tables exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS exam_attempt_number (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        set_id INT NOT NULL,
        course_id INT NOT NULL,
        new_ui TINYINT(1) DEFAULT 0,
        old_ui TINYINT(1) DEFAULT 0,
        date_of_submit DATE DEFAULT NULL,
        time_of_submit TIME DEFAULT NULL,
        attempt_number INT NOT NULL,
        INDEX (student_id),
        INDEX (set_id),
        INDEX (course_id),
        INDEX (attempt_number)
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS student_exam_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        set_id INT NOT NULL,
        question_id INT NOT NULL,
        selected_key VARCHAR(10),
        is_correct TINYINT(1),
        time_spent INT DEFAULT 0,
        marked_for_review TINYINT(1) DEFAULT 0,
        attempt_number INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (student_id),
        INDEX (set_id),
        INDEX (course_id),
        INDEX (attempt_number)
    )");

    // Get last attempt number
    $stmt = $pdo->prepare("SELECT MAX(attempt_number) as last_attempt FROM exam_attempt_number WHERE student_id = ? AND set_id = ? AND course_id = ?");
    $stmt->execute([$student_id, $set_id, $course_id]);
    $row = $stmt->fetch();
    $next_attempt = ($row['last_attempt'] ?? 0) + 1;

    $new_ui = ($ui_type === 'new') ? 1 : 0;
    $old_ui = ($ui_type === 'old') ? 1 : 0;
    $date_of_submit = date('Y-m-d');
    $time_of_submit = date('H:i:s');

    // Begin transaction
    $pdo->beginTransaction();

    // Insert into attempt history
    $stmt = $pdo->prepare("INSERT INTO exam_attempt_number (student_id, set_id, course_id, new_ui, old_ui, date_of_submit, time_of_submit, attempt_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$student_id, $set_id, $course_id, $new_ui, $old_ui, $date_of_submit, $time_of_submit, $next_attempt]);

    // Insert granular responses
    if (!empty($responses)) {
        $resp_stmt = $pdo->prepare("INSERT INTO student_exam_responses (student_id, course_id, set_id, question_id, selected_key, is_correct, time_spent, marked_for_review, attempt_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($responses as $resp) {
            $resp_stmt->execute([
                $student_id,
                $course_id,
                $set_id,
                $resp['question_id'],
                $resp['selected_key'] ?? null,
                $resp['is_correct'] ?? 0,
                $resp['time_spent'] ?? 0,
                $resp['marked_for_review'] ?? 0,
                $next_attempt
            ]);
        }
    }

    $pdo->commit();

    echo json_encode(['success' => true, 'attempt_number' => $next_attempt]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
