<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $categoryId = intval($input['id'] ?? 0);

    error_log("🗑️ delete_course_category: Received request to delete category ID: " . $categoryId);

    if ($categoryId <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Valid category ID is required'
        ]);
        exit;
    }

    // Check if category exists
    $stmt = $pdo->prepare("SELECT id, name FROM course_categories WHERE id = ?");
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$category) {
        echo json_encode([
            'success' => false,
            'message' => 'Category not found'
        ]);
        exit;
    }

    // Check if any courses use this category
    $stmt = $pdo->prepare("SELECT COUNT(*) as course_count FROM courses WHERE category_id = ?");
    $stmt->execute([$categoryId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result['course_count'] > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Cannot delete category. ' . $result['course_count'] . ' courses are using this category.'
        ]);
        exit;
    }

    // Delete the category
    $stmt = $pdo->prepare("DELETE FROM course_categories WHERE id = ?");
    $stmt->execute([$categoryId]);

    error_log("✅ delete_course_category: Successfully deleted category: " . $category['name']);

    echo json_encode([
        'success' => true,
        'message' => 'Category deleted successfully'
    ]);

} catch (Exception $e) {
    error_log("❌ delete_course_category: Error - " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to delete category: ' . $e->getMessage()
    ]);
}
?>
