<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
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

    $stmt = $pdo->prepare("SELECT price, validity_days FROM monthly_test_pricing WHERE id = 1");
    $stmt->execute();
    $pricing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pricing) {
        $pricing = [
            'price' => 10.00,
            'validity_days' => 1
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'price' => (float)$pricing['price'],
            'validity_days' => (int)$pricing['validity_days']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
