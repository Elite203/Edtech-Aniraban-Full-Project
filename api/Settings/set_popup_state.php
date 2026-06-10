<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

// Log the start of the popup state update process
error_log("🚀 Popup state update started for banner_toggle table - Method: " . $_SERVER['REQUEST_METHOD']);
error_log("🔗 Database connection status: " . (isset($pdo) ? 'Available' : 'Not available'));

try {
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    error_log("📨 Input received: " . json_encode($input));
    
    if (!isset($input['state'])) {
        error_log("❌ No 'state' field in input data");
        throw new Exception('State field is required');
    }
    
    $state = (bool) $input['state'];
    error_log("📋 State to update in banner_toggle table: " . ($state ? 'true (enabled)' : 'false (disabled)'));
    
    // Check if record exists
    $check_sql = "SELECT id FROM banner_toggle LIMIT 1";
    error_log("🔍 Checking if banner_toggle table has records: " . $check_sql);
    $stmt = $pdo->prepare($check_sql);
    $stmt->execute();
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing) {
        // Update existing record
        $update_sql = "UPDATE banner_toggle SET state = ?, updated_at = CURRENT_TIMESTAMP";
        error_log("🔄 Updating existing record in banner_toggle table: " . $update_sql);
        $stmt = $pdo->prepare($update_sql);
        $update_result = $stmt->execute([$state]);
        
        if ($update_result) {
            error_log("✅ Popup state updated successfully in banner_toggle table");
        } else {
            error_log("❌ Update failed: " . json_encode($stmt->errorInfo()));
            throw new Exception('Failed to update popup state in banner_toggle table');
        }
    } else {
        // Insert new record
        $insert_sql = "INSERT INTO banner_toggle (state) VALUES (?)";
        error_log("➕ Inserting new record in banner_toggle table: " . $insert_sql);
        $stmt = $pdo->prepare($insert_sql);
        $insert_result = $stmt->execute([$state]);
        
        if ($insert_result) {
            error_log("✅ Popup state inserted successfully in banner_toggle table with ID: " . $pdo->lastInsertId());
        } else {
            error_log("❌ Insert failed: " . json_encode($stmt->errorInfo()));
            throw new Exception('Failed to insert popup state in banner_toggle table');
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Popup state updated successfully in banner_toggle table',
        'state' => $state
    ]);
    
} catch (Exception $e) {
    error_log("💥 Popup state update error occurred in banner_toggle table: " . $e->getMessage());
    error_log("📍 Error location: " . $e->getFile() . " line " . $e->getLine());
    error_log("🔍 Error trace: " . $e->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
