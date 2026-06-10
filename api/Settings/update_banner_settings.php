<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        throw new Exception('No data provided');
    }

    $telegram_link = isset($data['telegram_link']) ? $data['telegram_link'] : null;
    $target_date = isset($data['target_date']) ? $data['target_date'] : null;
    $telegram_enabled = isset($data['telegram_enabled']) ? (int)$data['telegram_enabled'] : 1;
    $timer_enabled = isset($data['timer_enabled']) ? (int)$data['timer_enabled'] : 1;

    // We assume there's at least one row from a previous upload
    // If not, we might need to insert, but usually, upload comes first.
    // However, to be safe, let's check.
    
    $checkStmt = $pdo->query("SELECT id FROM banner_table LIMIT 1");
    $row = $checkStmt->fetch();

    if ($row) {
        $stmt = $pdo->prepare("UPDATE banner_table SET telegram_link = ?, target_date = ?, telegram_enabled = ?, timer_enabled = ?");
        $stmt->execute([$telegram_link, $target_date, $telegram_enabled, $timer_enabled]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO banner_table (telegram_link, target_date, telegram_enabled, timer_enabled) VALUES (?, ?, ?, ?)");
        $stmt->execute([$telegram_link, $target_date, $telegram_enabled, $timer_enabled]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Banner settings updated successfully'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
