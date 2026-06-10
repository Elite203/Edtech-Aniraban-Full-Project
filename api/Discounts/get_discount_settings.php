<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Ensure table, column, and row exist
    try {
        $q = $pdo->query("SHOW COLUMNS FROM `cart_discounts` LIKE 'coupon_enabled'");
        $columnExists = $q->fetch();
        if (!$columnExists) {
            $pdo->exec("ALTER TABLE `cart_discounts` ADD COLUMN `coupon_enabled` TINYINT(1) NOT NULL DEFAULT 0");
        }
    } catch (PDOException $e) {
        try {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `cart_discounts` (
                  `id` int(11) NOT NULL AUTO_INCREMENT,
                  `is_enabled` tinyint(1) NOT NULL DEFAULT 0,
                  `min_cart_value` decimal(10,2) NOT NULL DEFAULT 0.00,
                  `discount_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
                  `coupon_enabled` tinyint(1) NOT NULL DEFAULT 0,
                  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                  PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
            $pdo->exec("INSERT IGNORE INTO `cart_discounts` (id, is_enabled, min_cart_value, discount_percentage, coupon_enabled) VALUES (1, 0, 0, 0, 0)");
        } catch (Exception $ex) {}
    }

    // Ensure row id = 1 exists
    try {
        $check = $pdo->query("SELECT id FROM cart_discounts WHERE id = 1")->fetch();
        if (!$check) {
            $pdo->exec("INSERT IGNORE INTO `cart_discounts` (id, is_enabled, min_cart_value, discount_percentage, coupon_enabled) VALUES (1, 0, 0, 0, 0)");
        }
    } catch (Exception $e) {}

    $stmt = $pdo->prepare("SELECT is_enabled, min_cart_value, discount_percentage, coupon_enabled FROM cart_discounts WHERE id = 1");
    $stmt->execute();
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$settings) {
        // Fallback defaults if table row is missing
        $settings = [
            'is_enabled' => 0,
            'min_cart_value' => 0.00,
            'discount_percentage' => 0.00,
            'coupon_enabled' => 0
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'is_enabled' => (bool)$settings['is_enabled'],
            'min_cart_value' => (float)$settings['min_cart_value'],
            'discount_percentage' => (float)$settings['discount_percentage'],
            'coupon_enabled' => (bool)($settings['coupon_enabled'] ?? 0)
        ]
    ]);

} catch (PDOException $e) {
    // Return default settings if table doesn't exist yet (before sql run)
    echo json_encode([
        'success' => true,
        'data' => [
            'is_enabled' => false,
            'min_cart_value' => 0.00,
            'discount_percentage' => 0.00,
            'coupon_enabled' => false
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
