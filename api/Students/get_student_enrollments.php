<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_GET['student_id'])) {
    echo json_encode(['success' => false, 'message' => 'student_id is required']);
    exit;
}

$student_id = $_GET['student_id'];

try {
    $today = date('Y-m-d');
    
    // Automatically expire outdated active purchases for test series
    try {
        $stmt_update_ts = $pdo->prepare("
            UPDATE test_series_purchases 
            SET status = 'expired' 
            WHERE expiry_date < ? AND status = 'active'
        ");
        $stmt_update_ts->execute([$today]);
    } catch (Exception $e) {}

    // Automatically expire outdated active purchases for monthly tests
    try {
        $stmt_update_mt = $pdo->prepare("
            UPDATE monthly_test_purchases 
            SET status = 'expired' 
            WHERE expiry_date < ? AND status = 'active'
        ");
        $stmt_update_mt->execute([$today]);
    } catch (Exception $e) {}

    $ts_purchases = [];
    $mt_purchases = [];

    // Fetch test series purchases if table exists
    try {
        $stmt_ts = $pdo->prepare("
            SELECT tsp.id, tsp.course_id, tsp.purchase_date, tsp.expiry_date, tsp.status, tsp.price_paid, c.title AS course_name, 'Test Series' AS course_type
            FROM test_series_purchases tsp
            JOIN courses c ON tsp.course_id = c.id
            WHERE tsp.student_id = ? AND tsp.status != 'pending'
            ORDER BY tsp.purchase_date DESC
        ");
        $stmt_ts->execute([$student_id]);
        $ts_purchases = $stmt_ts->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {}

    // Fetch monthly test purchases if table exists
    try {
        $stmt_mt = $pdo->prepare("
            SELECT id, purchase_date, expiry_date, status, price_paid, 'Monthly Test (Current Affairs)' AS course_name, 'Monthly Test' AS course_type
            FROM monthly_test_purchases
            WHERE student_id = ? AND status != 'pending'
            ORDER BY purchase_date DESC
        ");
        $stmt_mt->execute([$student_id]);
        $mt_purchases = $stmt_mt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {}

    // Combine enrollments
    $enrollments = array_merge($ts_purchases, $mt_purchases);

    // Sort combined list by purchase_date desc
    usort($enrollments, function($a, $b) {
        return strcmp($b['purchase_date'], $a['purchase_date']);
    });

    echo json_encode([
        'success' => true,
        'status' => 'success',
        'data' => $enrollments
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
