<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

// Log the start of the upload process
error_log("🚀 Banner upload started - Method: " . $_SERVER['REQUEST_METHOD']);
error_log("📁 Files received: " . json_encode(array_keys($_FILES)));
error_log("🔗 Database connection status: " . (isset($pdo) ? 'Available' : 'Not available'));

try {

    if (!isset($_FILES['banner_image'])) {
        error_log("❌ No file uploaded - FILES array: " . json_encode($_FILES));
        throw new Exception('No file uploaded');
    }

    $file = $_FILES['banner_image'];
    
    error_log("📋 File details: " . json_encode([
        'name' => $file['name'],
        'type' => $file['type'], 
        'size' => $file['size'],
        'tmp_name' => $file['tmp_name'],
        'error' => $file['error']
    ]));
    
    // Validate file type
    $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowed_types)) {
        error_log("❌ Invalid file type: " . $file['type'] . ". Allowed: " . implode(', ', $allowed_types));
        throw new Exception('Invalid file type. Only JPG, PNG, and GIF files are allowed.');
    }
    
    // Validate file size (max 5MB)
    $max_size = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $max_size) {
        error_log("❌ File too large: " . $file['size'] . " bytes. Max: " . $max_size . " bytes");
        throw new Exception('File too large. Maximum size is 5MB.');
    }
    
    error_log("✅ File validation passed");
    
    // Read file content
    $image_data = file_get_contents($file['tmp_name']);
    if (!$image_data) {
        error_log("❌ Failed to read file content from: " . $file['tmp_name']);
        throw new Exception('Failed to read file');
    }
    
    // Get additional fields
    $telegram_link = isset($_POST['telegram_link']) ? $_POST['telegram_link'] : null;
    $target_date = isset($_POST['target_date']) ? $_POST['target_date'] : null;
    $telegram_enabled = isset($_POST['telegram_enabled']) ? (int)$_POST['telegram_enabled'] : 1;
    $timer_enabled = isset($_POST['timer_enabled']) ? (int)$_POST['timer_enabled'] : 1;

    error_log("📖 File read successfully, data length: " . strlen($image_data) . " bytes");
    
    // Delete existing banner (only one banner allowed)
    $delete_sql = "DELETE FROM banner_table";
    error_log("🗑️ Executing delete query: " . $delete_sql);
    $delete_result = $pdo->exec($delete_sql);
    error_log("🗑️ Deleted " . $delete_result . " existing banners");
    
    // Insert new banner
    $insert_sql = "INSERT INTO banner_table (image_data, telegram_link, target_date, telegram_enabled, timer_enabled) VALUES (?, ?, ?, ?, ?)";
    error_log("💾 Executing insert query: " . $insert_sql);
    $stmt = $pdo->prepare($insert_sql);
    $stmt->bindParam(1, $image_data, PDO::PARAM_LOB);
    $stmt->bindParam(2, $telegram_link);
    $stmt->bindParam(3, $target_date);
    $stmt->bindParam(4, $telegram_enabled, PDO::PARAM_INT);
    $stmt->bindParam(5, $timer_enabled, PDO::PARAM_INT);
    $insert_result = $stmt->execute();
    
    if ($insert_result) {
        error_log("✅ Banner inserted successfully with ID: " . $pdo->lastInsertId());
    } else {
        error_log("❌ Insert failed: " . json_encode($stmt->errorInfo()));
        throw new Exception('Failed to insert banner into database');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Banner uploaded successfully'
    ]);
    
} catch (Exception $e) {
    error_log("💥 Upload error occurred: " . $e->getMessage());
    error_log("📍 Error location: " . $e->getFile() . " line " . $e->getLine());
    error_log("🔍 Error trace: " . $e->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
