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
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['price']) || !isset($input['validity_days'])) {
        throw new Exception("Missing required pricing fields");
    }

    $price = (float)$input['price'];
    $validity_days = (int)$input['validity_days'];

    if ($price < 0) {
        throw new Exception("Price cannot be negative");
    }
    if ($validity_days <= 0) {
        throw new Exception("Validity must be at least 1 day");
    }

    // Ensure table and row exist
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `monthly_test_pricing` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `price` decimal(10,2) NOT NULL DEFAULT 10.00,
              `validity_days` int(11) NOT NULL DEFAULT 1,
              `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
              PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $ex) {}

    // Ensure row id = 1 exists
    try {
        $check = $pdo->query("SELECT id FROM monthly_test_pricing WHERE id = 1")->fetch();
        if (!$check) {
            $pdo->exec("INSERT IGNORE INTO `monthly_test_pricing` (id, price, validity_days) VALUES (1, 10.00, 1)");
        }
    } catch (Exception $e) {}

    // Execute UPDATE
    $stmt = $pdo->prepare("UPDATE monthly_test_pricing SET price = ?, validity_days = ? WHERE id = 1");
    $stmt->execute([$price, $validity_days]);

    echo json_encode([
        'success' => true,
        'message' => 'Monthly test pricing settings updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
