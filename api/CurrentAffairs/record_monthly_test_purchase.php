<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['student_id'])) {
        throw new Exception("student_id is required");
    }

    $student_id = $data['student_id'];
    $purchase_date = date('Y-m-d');
    
    // Check if there is an active subscription for this student to append validity
    $stmt_active = $pdo->prepare("SELECT expiry_date FROM monthly_test_purchases WHERE student_id = ? AND expiry_date >= ? ORDER BY expiry_date DESC LIMIT 1");
    $stmt_active->execute([$student_id, $purchase_date]);
    $active_sub = $stmt_active->fetch(PDO::FETCH_ASSOC);
    
    $base_date = $purchase_date;
    if ($active_sub && strtotime($active_sub['expiry_date']) >= strtotime($purchase_date)) {
        $base_date = $active_sub['expiry_date'];
    }
    
    $expiry_date = date('Y-m-d', strtotime($base_date . ' +1 days'));
    $price_paid = isset($data['price']) ? $data['price'] : 10.00;

    $stmt = $pdo->prepare("INSERT INTO monthly_test_purchases (student_id, purchase_date, expiry_date, price_paid, status) VALUES (?, ?, ?, ?, 'active')");
    $stmt->execute([$student_id, $purchase_date, $expiry_date, $price_paid]);

    echo json_encode([
        'status' => 'success', 
        'message' => 'Purchase recorded successfully',
        'expiry_date' => $expiry_date
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
