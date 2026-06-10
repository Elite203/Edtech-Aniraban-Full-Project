<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    if (!isset($_GET['referrer_id']) || !isset($_GET['course_id'])) {
        throw new Exception("referrer_id and course_id are required");
    }

    $referrer_id = $_GET['referrer_id'];
    $course_id = $_GET['course_id'];
    $student_id = isset($_GET['student_id']) ? $_GET['student_id'] : null;
    $today = date('Y-m-d');

    // 1. Cannot self-refer
    if ($student_id && $referrer_id == $student_id) {
        echo json_encode([
            'status' => 'success',
            'valid' => false,
            'reason' => 'self_referral_not_allowed'
        ]);
        exit;
    }

    // 2. Check if the referrer student exists
    $stmt_student = $pdo->prepare("SELECT id FROM students WHERE id = ?");
    $stmt_student->execute([$referrer_id]);
    $student = $stmt_student->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        echo json_encode([
            'status' => 'success',
            'valid' => false,
            'reason' => 'student_not_found'
        ]);
        exit;
    }

    // 3. Check if referrer has an active subscription for this course
    $stmt_sub = $pdo->prepare("SELECT id FROM test_series_purchases WHERE student_id = ? AND course_id = ? AND expiry_date >= ? AND status = 'active' LIMIT 1");
    $stmt_sub->execute([$referrer_id, $course_id, $today]);
    $sub = $stmt_sub->fetch(PDO::FETCH_ASSOC);

    if (!$sub) {
        echo json_encode([
            'status' => 'success',
            'valid' => false,
            'reason' => 'no_active_subscription'
        ]);
        exit;
    }

    // If referee student_id is provided, check existing relationships and active subscription status
    if ($student_id) {
        // 4. Check if referee already has an active subscription for this course (existing customers cannot be referred)
        $stmt_referee_sub = $pdo->prepare("SELECT id FROM test_series_purchases WHERE student_id = ? AND course_id = ? AND expiry_date >= ? AND status = 'active' LIMIT 1");
        $stmt_referee_sub->execute([$student_id, $course_id, $today]);
        $referee_sub = $stmt_referee_sub->fetch(PDO::FETCH_ASSOC);
        
        if ($referee_sub) {
            echo json_encode([
                'status' => 'success',
                'valid' => false,
                'reason' => 'referee_already_active'
            ]);
            exit;
        }

        // 5. Check if a cross-referral relationship already exists for this course
        $stmt_cross = $pdo->prepare("SELECT id FROM test_series_referrals WHERE course_id = ? AND ((referrer_id = ? AND referee_id = ?) OR (referrer_id = ? AND referee_id = ?))");
        $stmt_cross->execute([$course_id, $referrer_id, $student_id, $student_id, $referrer_id]);
        $cross = $stmt_cross->fetch(PDO::FETCH_ASSOC);

        if ($cross) {
            echo json_encode([
                'status' => 'success',
                'valid' => false,
                'reason' => 'mutual_referral_not_allowed'
            ]);
            exit;
        }
    }

    echo json_encode([
        'status' => 'success',
        'valid' => true
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
