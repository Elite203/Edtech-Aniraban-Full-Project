<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    if (!isset($_GET['student_id'])) {
        throw new Exception("student_id is required");
    }

    $student_id = $_GET['student_id'];

    // Automatically update expired records status to 'expired'
    $stmt_update = $pdo->prepare("UPDATE monthly_test_purchases SET status = 'expired' WHERE expiry_date < ? AND status = 'active'");
    $stmt_update->execute([date('Y-m-d')]);

    $stmt = $pdo->prepare("SELECT * FROM monthly_test_purchases WHERE student_id = ? ORDER BY id DESC LIMIT 1");
    $stmt->execute([$student_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        // check if active
        if (strtotime($result['expiry_date']) > time()) {
            $result['is_active'] = true;
        } else {
            $result['is_active'] = false;
        }
        echo json_encode(['status' => 'success', 'data' => $result]);
    } else {
        echo json_encode(['status' => 'success', 'data' => null]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
