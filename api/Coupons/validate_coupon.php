<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    if (empty($_GET['coupon_code'])) {
        throw new Exception("Coupon code parameter is required");
    }

    $coupon_code = strtoupper(trim($_GET['coupon_code']));

    try {
        $stmt = $pdo->prepare("SELECT * FROM coupons WHERE coupon_code = ?");
        $stmt->execute([$coupon_code]);
        $coupon = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Attempt to auto-create coupons table
        try {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `coupons` (
                  `id` INT(11) NOT NULL AUTO_INCREMENT,
                  `coupon_code` VARCHAR(50) NOT NULL,
                  `discount_percentage` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                  `is_universal` TINYINT(1) NOT NULL DEFAULT 0,
                  `course_ids` TEXT DEFAULT NULL,
                  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `uq_coupon_code` (`coupon_code`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
            $stmt = $pdo->prepare("SELECT * FROM coupons WHERE coupon_code = ?");
            $stmt->execute([$coupon_code]);
            $coupon = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $ex) {
            $coupon = null;
        }
    }

    if (!$coupon) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid coupon code'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'coupon' => [
            'id' => (int)$coupon['id'],
            'coupon_code' => $coupon['coupon_code'],
            'discount_percentage' => (float)$coupon['discount_percentage'],
            'is_universal' => (bool)$coupon['is_universal'],
            'course_ids' => $coupon['course_ids']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
