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
    
    if (!isset($data['order_id'])) {
        throw new Exception("order_id is required");
    }

    $order_id = $data['order_id'];

    $stmt = $pdo->prepare("DELETE FROM test_series_purchases WHERE order_id = ? AND status = 'pending'");
    $stmt->execute([$order_id]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Pending order cleaned up successfully'
    ]);

} catch (Exception $e) {
    http_response_code(200);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
