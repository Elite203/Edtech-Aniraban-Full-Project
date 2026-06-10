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
    // Automatically expire outdated active purchases
    $today = date('Y-m-d');
    $stmt_update = $pdo->prepare("
        UPDATE test_series_purchases 
        SET status = 'expired' 
        WHERE expiry_date < ? AND status = 'active'
    ");
    $stmt_update->execute([$today]);

    // Clean up expired pending orders (older than 15 minutes)
    try {
        $pdo->exec("DELETE FROM test_series_purchases WHERE status = 'pending' AND created_at < NOW() - INTERVAL 15 MINUTE");
    } catch (Exception $e) {}

    // Set PDO to handle binary data correctly
    $pdo->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, false);

    // Fetch purchases
    $stmt = $pdo->prepare("
        SELECT tsp.id, tsp.course_id, tsp.purchase_date, tsp.expiry_date, tsp.status, tsp.price_paid, tsp.order_id, tsp.invoice_pdf, c.title AS course_title, c.image AS course_image
        FROM test_series_purchases tsp
        JOIN courses c ON tsp.course_id = c.id
        WHERE tsp.student_id = ? AND tsp.status != 'pending'
        ORDER BY tsp.purchase_date DESC
    ");
    $stmt->execute([$student_id]);
    $purchases = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert BLOB images to base64 data URLs for frontend display
    foreach ($purchases as &$purchase) {
        if (!empty($purchase['course_image'])) {
            $img = $purchase['course_image'];
            
            // 1. Check if it's already a data URL
            if (strpos($img, 'data:image') === 0) {
                continue;
            }
            
            // 2. Check if it's a valid URL or path
            if (strpos($img, 'http://') === 0 || strpos($img, 'https://') === 0 || preg_match('/^\/?(assets|img)\//', $img)) {
                continue;
            }
            
            // 3. Fast detection if it is already base64 encoded
            $sample = substr($img, 0, 1024);
            if (preg_match('/^[A-Za-z0-9+\/=\s]+$/', $sample)) {
                $purchase['course_image'] = 'data:image/jpeg;base64,' . trim($img);
            } else {
                // Assume it's raw binary BLOB data
                $purchase['course_image'] = 'data:image/jpeg;base64,' . base64_encode($img);
            }
        }
    }
    unset($purchase);

    echo json_encode([
        'status' => 'success',
        'data' => $purchases
    ]);

} catch (PDOException $e) {
    // If the table doesn't exist yet, return a clean empty array instead of failing
    echo json_encode([
        'status' => 'success',
        'data' => []
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
