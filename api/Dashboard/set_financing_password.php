<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$admin_id = $_SESSION['admin_id'];

try {
    // Check if current user is super_admin
    $stmt = $pdo->prepare("SELECT role FROM admins WHERE id = ?");
    $stmt->execute([$admin_id]);
    $role = $stmt->fetch()['role'] ?? '';

    if ($role !== 'super_admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $item_type = $data['item_type'] ?? ''; // 'monthly_test' or 'test_series'
    $item_id = isset($data['item_id']) && $data['item_id'] !== '' ? (int)$data['item_id'] : null;
    $password = $data['password'] ?? '';

    if (empty($item_type) || $password === '') {
        echo json_encode(['success' => false, 'message' => 'Missing fields']);
        exit;
    }

    // Hash the password securely
    $hash = password_hash($password, PASSWORD_BCRYPT);

    // Ensure table exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `financing_passwords` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `item_type` VARCHAR(50) NOT NULL,
          `item_id` INT DEFAULT NULL,
          `password_hash` VARCHAR(255) NOT NULL,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY `uq_item` (`item_type`, `item_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $stmt = $pdo->prepare("
        INSERT INTO financing_passwords (item_type, item_id, password_hash)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE password_hash = ?
    ");
    $stmt->execute([$item_type, $item_id, $hash, $hash]);

    echo json_encode(['success' => true, 'message' => 'Password configured successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
