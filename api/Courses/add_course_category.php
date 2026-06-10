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
    $name = trim($input['name'] ?? '');

    error_log("📊 add_course_category: Received request with name: " . $name);

    if (empty($name)) {
        echo json_encode([
            'success' => false,
            'message' => 'Category name is required'
        ]);
        exit;
    }

    // Check if category already exists
    $stmt = $pdo->prepare("SELECT id FROM course_categories WHERE name = ?");
    $stmt->execute([$name]);
    
    if ($stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Category already exists'
        ]);
        exit;
    }

    // Insert new category
    $stmt = $pdo->prepare("INSERT INTO course_categories (name) VALUES (?)");
    $stmt->execute([$name]);

    $categoryId = $pdo->lastInsertId();

    error_log("✅ add_course_category: Successfully created category with ID: " . $categoryId);

    echo json_encode([
        'success' => true,
        'message' => 'Category added successfully',
        'category' => [
            'id' => $categoryId,
            'name' => $name
        ]
    ]);

} catch (Exception $e) {
    error_log("❌ add_course_category: Error - " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to add category: ' . $e->getMessage()
    ]);
}
?>
