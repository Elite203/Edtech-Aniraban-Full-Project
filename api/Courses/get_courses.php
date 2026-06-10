<?php
// Increase memory limit to handle large binary/base64 conversions if needed
ini_set('memory_limit', '256M');
require_once '../config.php';

try {
    // Check if we should exclude image data (to speed up navbar/footer)
    $excludeImages = isset($_GET['exclude_images']) && $_GET['exclude_images'] === '1';
    
    // Set PDO to handle binary data correctly
    $pdo->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, false);
    
    $imageField = $excludeImages ? "NULL as image" : "c.image";
    
    // Ensure column exists
    try {
        $colCheck = $pdo->query("SHOW COLUMNS FROM `courses` LIKE 'price_six_months'")->fetch();
        if (!$colCheck) {
            $pdo->exec("ALTER TABLE `courses` ADD COLUMN `price_six_months` decimal(10,2) DEFAULT NULL AFTER `price`");
        }
    } catch (Exception $e) {}
    
    $stmt = $pdo->prepare("
        SELECT c.id, c.title, cc.name as category, c.description, $imageField, c.price, c.price_six_months, c.created_at 
        FROM courses c 
        LEFT JOIN course_categories cc ON c.category_id = cc.id 
        ORDER BY c.created_at DESC
    ");
    $stmt->execute();
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convert BLOB images to base64 data URLs for frontend display
    if (!$excludeImages) {
        foreach ($courses as &$course) {
            if (!empty($course['image'])) {
                $img = $course['image'];
                
                // 1. Check if it's already a data URL
                if (strpos($img, 'data:image') === 0) {
                    continue;
                }
                
                // 2. Check if it's a valid URL or path
                if (strpos($img, 'http://') === 0 || strpos($img, 'https://') === 0 || preg_match('/^\/?(assets|img)\//', $img)) {
                    continue;
                }
                
                // 3. Fast detection if it is already base64 encoded
                // Check if the first 1024 characters consist only of valid base64 characters
                $sample = substr($img, 0, 1024);
                if (preg_match('/^[A-Za-z0-9+\/=\s]+$/', $sample)) {
                    $course['image'] = 'data:image/jpeg;base64,' . trim($img);
                } else {
                    // Assume it's raw binary BLOB data
                    $course['image'] = 'data:image/jpeg;base64,' . base64_encode($img);
                }
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'courses' => $courses
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch courses: ' . $e->getMessage()
    ]);
}
?>
