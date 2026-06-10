<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

// Log the start of the popup state fetch process
error_log("🔍 Popup state fetch started from banner_toggle table - Method: " . $_SERVER['REQUEST_METHOD']);
error_log("🔗 Database connection status: " . (isset($pdo) ? 'Available' : 'Not available'));

try {
    
    // Get the current popup state from banner_toggle table
    $select_sql = "SELECT state FROM banner_toggle ORDER BY updated_at DESC LIMIT 1";
    error_log("📊 Executing query on banner_toggle table: " . $select_sql);
    $stmt = $pdo->prepare($select_sql);
    $stmt->execute();
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    error_log("📋 Query result from banner_toggle table: " . ($row ? "Found row with state data" : "No row found"));
    
    if ($row !== false) {
        $state = (bool) $row['state'];
        error_log("📖 Popup state retrieved from banner_toggle table: " . ($state ? 'true (enabled)' : 'false (disabled)'));
        error_log("🔢 Raw database value: " . var_export($row['state'], true));
        
        echo json_encode([
            'success' => true,
            'state' => $state,
            'enabled' => $state // Keep for backward compatibility
        ]);
    } else {
        error_log("ℹ️ No popup state found in banner_toggle table, returning default (enabled)");
        echo json_encode([
            'success' => true,
            'state' => true,
            'enabled' => true // Default to enabled
        ]);
    }
    
} catch (Exception $e) {
    error_log("💥 Popup state fetch error occurred from banner_toggle table: " . $e->getMessage());
    error_log("📍 Error location: " . $e->getFile() . " line " . $e->getLine());
    error_log("🔍 Error trace: " . $e->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'state' => true, // Default to enabled on error
        'enabled' => true
    ]);
}
?>
