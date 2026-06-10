<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

// Log the start of the banner fetch process
error_log("🔍 Banner fetch started - Method: " . $_SERVER['REQUEST_METHOD']);
error_log("🔗 Database connection status: " . (isset($pdo) ? 'Available' : 'Not available'));

try {
    
    // Get the latest banner
    $select_sql = "SELECT image_data, telegram_link, target_date, telegram_enabled, timer_enabled FROM banner_table ORDER BY created_at DESC LIMIT 1";
    error_log("📊 Executing query: " . $select_sql);
    $stmt = $pdo->prepare($select_sql);
    $stmt->execute();
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    error_log("📋 Query result: " . ($row ? "Found row with data" : "No row found"));
    
    if ($row && $row['image_data']) {
        $image_data_length = strlen($row['image_data']);
        error_log("📖 Image data retrieved, length: " . $image_data_length . " bytes");
        
        // Convert binary data to base64
        $base64_image = base64_encode($row['image_data']);
        error_log("🔄 Base64 conversion complete, length: " . strlen($base64_image) . " chars");
        
        echo json_encode([
            'success' => true,
            'banner' => $base64_image,
            'telegram_link' => $row['telegram_link'],
            'target_date' => $row['target_date'],
            'telegram_enabled' => (int)$row['telegram_enabled'],
            'timer_enabled' => (int)$row['timer_enabled']
        ]);
    } else {
        error_log("ℹ️ No banner found in database");
        echo json_encode([
            'success' => true,
            'banner' => null
        ]);
    }
    
} catch (Exception $e) {
    error_log("💥 Banner fetch error occurred: " . $e->getMessage());
    error_log("📍 Error location: " . $e->getFile() . " line " . $e->getLine());
    error_log("🔍 Error trace: " . $e->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
