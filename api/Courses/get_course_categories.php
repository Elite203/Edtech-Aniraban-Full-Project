<?php
require_once '../config.php';

try {
    error_log("📊 get_course_categories: Fetching all categories");

    $stmt = $pdo->prepare("SELECT id, name, created_at, updated_at FROM course_categories ORDER BY name ASC");
    $stmt->execute();
    
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    error_log("✅ get_course_categories: Successfully fetched " . count($categories) . " categories");

    echo json_encode([
        'success' => true,
        'categories' => $categories
    ]);

} catch (Exception $e) {
    error_log("❌ get_course_categories: Error - " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch categories: ' . $e->getMessage()
    ]);
}
?>
