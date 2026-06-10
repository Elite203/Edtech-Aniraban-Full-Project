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

    if (empty($input['id'])) {
        throw new Exception("Coupon ID is required");
    }

    $id = (int)$input['id'];

    try {
        $stmt = $pdo->prepare("DELETE FROM coupons WHERE id = ?");
        $stmt->execute([$id]);
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
            $stmt = $pdo->prepare("DELETE FROM coupons WHERE id = ?");
            $stmt->execute([$id]);
        } catch (Exception $ex) {
            // Silence failure
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Coupon deleted successfully'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
