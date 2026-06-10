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

    if (!isset($input['is_enabled']) || !isset($input['min_cart_value']) || !isset($input['discount_percentage']) || !isset($input['coupon_enabled'])) {
        throw new Exception("Missing required configuration fields");
    }

    $is_enabled = $input['is_enabled'] ? 1 : 0;
    $min_cart_value = (float)$input['min_cart_value'];
    $discount_percentage = (float)$input['discount_percentage'];
    $coupon_enabled = $input['coupon_enabled'] ? 1 : 0;

    // Enforce mutual exclusivity
    if ($is_enabled === 1) {
        $coupon_enabled = 0;
    }

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

    // Execute standard UPDATE query
    $stmt = $pdo->prepare("UPDATE cart_discounts SET is_enabled = ?, min_cart_value = ?, discount_percentage = ?, coupon_enabled = ? WHERE id = 1");
    $stmt->execute([$is_enabled, $min_cart_value, $discount_percentage, $coupon_enabled]);

    echo json_encode([
        'success' => true,
        'message' => 'Discount settings updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
      ]);
}
?>
