<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    if (!isset($_GET['student_id']) || !isset($_GET['course_id'])) {
        throw new Exception("student_id and course_id are required");
    }

    $student_id = $_GET['student_id'];
    $course_id = $_GET['course_id'];
    $today = date('Y-m-d');

    // 1. Fetch current active purchase of this specific course
    $stmt_active = $pdo->prepare("SELECT id, expiry_date FROM test_series_purchases WHERE student_id = ? AND course_id = ? AND expiry_date >= ? AND status = 'active' ORDER BY expiry_date DESC LIMIT 1");
    $stmt_active->execute([$student_id, $course_id, $today]);
    $active_sub = $stmt_active->fetch(PDO::FETCH_ASSOC);

    $active_purchase_id = $active_sub ? $active_sub['id'] : null;
    $current_referrals_count = 0;

    // 2. Count referrals in the current active cycle
    if ($active_purchase_id) {
        try {
            $stmt_count = $pdo->prepare("SELECT COUNT(*) FROM test_series_referrals WHERE referrer_purchase_id = ?");
            $stmt_count->execute([$active_purchase_id]);
            $current_referrals_count = (int)$stmt_count->fetchColumn();
        } catch (PDOException $e) {
            // referrals table might not exist yet
        }
    }

    // 3. Fetch overall referrals history
    $history = [];
    try {
        $stmt_history = $pdo->prepare("
            SELECT 
                r.created_at as referral_date, 
                s.first_name, 
                s.last_name, 
                s.email, 
                p.price_paid,
                (r.referrer_purchase_id = ?) as is_current_cycle
            FROM test_series_referrals r
            JOIN students s ON r.referee_id = s.id
            JOIN test_series_purchases p ON r.referee_purchase_id = p.id
            WHERE r.referrer_id = ? AND r.course_id = ?
            ORDER BY r.id DESC
        ");
        $stmt_history->execute([$active_purchase_id, $student_id, $course_id]);
        $rows = $stmt_history->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($rows as $row) {
            $history[] = [
                'name' => trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')) ?: 'Student',
                'email' => $row['email'] ?? 'N/A',
                'referral_date' => $row['referral_date'],
                'price_paid' => $row['price_paid'],
                'is_current_cycle' => (bool)$row['is_current_cycle']
            ];
        }
    } catch (PDOException $e) {
        // Ignore table missing errors
    }

    // 4. Check if the current student was referred by someone for this course
    $referred_by = null;
    try {
        $stmt_referred_by = $pdo->prepare("
            SELECT 
                r.created_at as referral_date, 
                s.first_name, 
                s.last_name, 
                s.email
            FROM test_series_referrals r
            JOIN students s ON r.referrer_id = s.id
            WHERE r.referee_id = ? AND r.course_id = ?
            LIMIT 1
        ");
        $stmt_referred_by->execute([$student_id, $course_id]);
        $row_ref = $stmt_referred_by->fetch(PDO::FETCH_ASSOC);
        if ($row_ref) {
            $referred_by = [
                'name' => trim(($row_ref['first_name'] ?? '') . ' ' . ($row_ref['last_name'] ?? '')) ?: 'Friend',
                'email' => $row_ref['email'] ?? 'N/A',
                'referral_date' => $row_ref['referral_date']
            ];
        }
    } catch (PDOException $e) {
        // Ignore table missing or errors
    }

    echo json_encode([
        'status' => 'success',
        'has_active_sub' => (bool)$active_sub,
        'current_referrals_count' => $current_referrals_count,
        'referrals_limit' => 12,
        'referred_by' => $referred_by,
        'history' => $history
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
