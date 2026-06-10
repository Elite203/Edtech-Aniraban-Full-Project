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

    if (empty($input['coupon_code'])) {
        throw new Exception("Coupon code is required");
    }
    if (!isset($input['discount_percentage']) || (float)$input['discount_percentage'] < 0 || (float)$input['discount_percentage'] > 100) {
        throw new Exception("Valid discount percentage (0-100) is required");
    }

    $coupon_code = strtoupper(trim($input['coupon_code']));
    $discount_percentage = (float)$input['discount_percentage'];
    $is_universal = !empty($input['is_universal']) ? 1 : 0;
    $course_ids = isset($input['course_ids']) ? trim($input['course_ids']) : null;

    if (!$is_universal && empty($course_ids)) {
        throw new Exception("Please select at least one course for specific coupons");
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO coupons (coupon_code, discount_percentage, is_universal, course_ids) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$coupon_code, $discount_percentage, $is_universal, $course_ids]);
    } catch (PDOException $e) {
        if ($e->errorInfo[1] === 1062) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'This coupon code already exists'
            ]);
            exit;
        }

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
            
            $stmt = $pdo->prepare("
                INSERT INTO coupons (coupon_code, discount_percentage, is_universal, course_ids) 
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$coupon_code, $discount_percentage, $is_universal, $course_ids]);
        } catch (Exception $ex) {
            if ($ex instanceof PDOException && $ex->errorInfo[1] === 1062) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'This coupon code already exists'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Database error: ' . $e->getMessage()
                ]);
            }
            exit;
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Coupon created successfully'
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
