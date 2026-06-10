<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check authentication
if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

try {
    $monthly_sales = [];
    $test_series_sales = [];

    // Query test series purchases
    try {
        $stmt_ts = $pdo->prepare("
            SELECT 
                purchase_date,
                price_paid,
                DATEDIFF(expiry_date, purchase_date) as diff_days
            FROM test_series_purchases
            WHERE status != 'pending' AND purchase_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
            ORDER BY purchase_date ASC
        ");
        $stmt_ts->execute();
        $rows = $stmt_ts->fetchAll(PDO::FETCH_ASSOC) ?: [];
        foreach ($rows as $row) {
            $test_series_sales[] = [
                'purchase_date' => $row['purchase_date'],
                'price_paid' => (float)$row['price_paid'],
                'validity' => ($row['diff_days'] !== null && (int)$row['diff_days'] <= 185) ? '6 Months' : '1 Year'
            ];
        }
    } catch (Exception $e) {}

    // Query monthly test purchases
    try {
        $stmt_mt = $pdo->prepare("
            SELECT 
                purchase_date,
                price_paid
            FROM monthly_test_purchases
            WHERE status != 'pending' AND purchase_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
            ORDER BY purchase_date ASC
        ");
        $stmt_mt->execute();
        $rows = $stmt_mt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        foreach ($rows as $row) {
            $monthly_sales[] = [
                'purchase_date' => $row['purchase_date'],
                'price_paid' => (float)$row['price_paid'],
                'validity' => 'Monthly' // Monthly tests only have one validity
            ];
        }
    } catch (Exception $e) {}

    echo json_encode([
        'success' => true,
        'data' => [
            'monthly_test' => $monthly_sales,
            'test_series' => $test_series_sales
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch sales overview: ' . $e->getMessage()
    ]);
}
?>
