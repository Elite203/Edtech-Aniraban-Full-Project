<?php
require_once '../config.php';

header('Content-Type: application/json');

$user_id = $_GET['user_id'] ?? null;
$exam_set_id = $_GET['exam_set_id'] ?? null;
$course_id = $_GET['course_id'] ?? null;
$set_number = $_GET['set_number'] ?? null;
$attempt_number = $_GET['attempt_number'] ?? null;

if (!$user_id || !$exam_set_id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing parameters']);
    exit;
}

try {
    // If attempt_number is not provided, get the latest one
    if (!$attempt_number) {
        $attempt_stmt = $pdo->prepare("SELECT MAX(attempt_number) as attempt_number FROM exam_attempt_number WHERE student_id = ? AND set_id = ? AND course_id = ?");
        $attempt_stmt->execute([$user_id, $exam_set_id, $course_id]);
        $attempt_row = $attempt_stmt->fetch();
        $attempt_number = $attempt_row['attempt_number'] ?? 1;
    }

    // Fetch granular responses joined with question details
    $sql = "SELECT 
                ser.*,
                q.question_english,
                q.question_hindi,
                q.option_a_english,
                q.option_a_hindi,
                q.option_b_english,
                q.option_b_hindi,
                q.option_c_english,
                q.option_c_hindi,
                q.option_d_english,
                q.option_d_hindi,
                q.option_e_english,
                q.option_e_hindi,
                q.correct_option,
                COALESCE(NULLIF(p.solution_english, ''), NULLIF(q.solution_english, '')) as solution_english,
                COALESCE(NULLIF(p.solution_hindi, ''), NULLIF(q.solution_hindi, '')) as solution_hindi,
                q.question_image,
                q.question_image_type,
                q.question_type,
                COALESCE(NULLIF(p.youtube_link, ''), NULLIF(q.youtube_link, '')) as youtube_link,
                q.passage_id,
                COALESCE(NULLIF(p.passage_english, ''), NULLIF(q.passage_english, '')) as passage_english,
                COALESCE(NULLIF(p.passage_hindi, ''), NULLIF(q.passage_hindi, '')) as passage_hindi,
                s.subject_name as subject,
                ct.name as topic_name,
                c.name as chapter_name
            FROM student_exam_responses ser
            JOIN questions q ON ser.question_id = q.id
            LEFT JOIN passages p ON q.passage_id = p.id
            LEFT JOIN subjects s ON COALESCE(q.subject_id, p.subject_id) = s.id
            LEFT JOIN chapter_topics ct ON COALESCE(p.topic_id, q.topic_id) = ct.id
            LEFT JOIN chapters c ON ct.chapter_id = c.id
            WHERE ser.student_id = ? 
              AND ser.set_id = ? 
              AND ser.course_id = ? 
              AND ser.attempt_number = ?
            ORDER BY ser.id ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id, $exam_set_id, $course_id, $attempt_number]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert BLOB images to base64
    foreach ($results as &$res) {
        if (!empty($res['question_image'])) {
            $res['question_image'] = base64_encode($res['question_image']);
        }
    }

    // Calculate current attempt score
    $current_score = 0;
    foreach ($results as $res) {
        if (isset($res['selected_key']) && $res['selected_key'] !== '') {
            if ($res['is_correct'] == 1) {
                $current_score += 3;
            } else {
                $current_score -= 1;
            }
        }
    }

    // Calculate Rank and Percentile
    // Get all students' scores for this set
    $rank_sql = "
        SELECT 
            student_id,
            MAX(score) as score
        FROM (
            SELECT 
                student_id,
                attempt_number,
                SUM(CASE WHEN is_correct = 1 THEN 3 WHEN selected_key IS NOT NULL AND selected_key != '' AND is_correct = 0 THEN -1 ELSE 0 END) as score
            FROM student_exam_responses
            WHERE set_id = ?
            GROUP BY student_id, attempt_number
        ) t
        GROUP BY student_id
        ORDER BY score DESC
    ";
    $rank_stmt = $pdo->prepare($rank_sql);
    $rank_stmt->execute([$exam_set_id]);
    $all_scores = $rank_stmt->fetchAll(PDO::FETCH_ASSOC);

    $total_candidates = count($all_scores);
    $rank = 1;
    foreach ($all_scores as $s) {
        if ($s['score'] > $current_score) {
            $rank++;
        } else {
            break;
        }
    }

    $percentile = $total_candidates > 1 
        ? round((($total_candidates - $rank) / ($total_candidates - 1)) * 100, 2) 
        : 100;

    echo json_encode([
        'status' => 'success',
        'data' => $results,
        'attempt_number' => $attempt_number,
        'rank' => $rank,
        'total_candidates' => $total_candidates,
        'percentile' => $percentile
    ]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
