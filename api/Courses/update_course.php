<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Only POST method allowed'
    ]);
    exit;
}

try {
    // Handle both FormData (file upload) and JSON input for backward compatibility
    $id = $_POST['id'] ?? '';
    $title = $_POST['title'] ?? '';
    $categoryId = $_POST['category_id'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? 0;
    $price_six_months = $_POST['price_six_months'] ?? null;
    $image = null;
    
    // Handle file upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $imageData = file_get_contents($_FILES['image']['tmp_name']);
        $image = base64_encode($imageData);
    }
    
    // Fallback to JSON input if no POST data
    if (empty($id) && empty($title) && empty($categoryId)) {
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input) {
            $id = $input['id'] ?? '';
            $title = $input['title'] ?? '';
            $categoryId = $input['category_id'] ?? '';
            $description = $input['description'] ?? '';
            $image = $input['image'] ?? '';
            $price = $input['price'] ?? 0;
            $price_six_months = $input['price_six_months'] ?? null;
        }
    }
    
    if (empty($id) || empty($title) || empty($categoryId)) {
        echo json_encode([
            'success' => false,
            'message' => 'ID, title and category are required'
        ]);
        exit;
    }
    
    // Check if course exists
    $stmt = $pdo->prepare("SELECT id FROM courses WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Course not found'
        ]);
        exit;
    }

    // Ensure column exists
    try {
        $colCheck = $pdo->query("SHOW COLUMNS FROM `courses` LIKE 'price_six_months'")->fetch();
        if (!$colCheck) {
            $pdo->exec("ALTER TABLE `courses` ADD COLUMN `price_six_months` decimal(10,2) DEFAULT NULL AFTER `price`");
        }
    } catch (Exception $e) {}
    
    // Only update image if new file was uploaded
    if ($image !== null) {
        $stmt = $pdo->prepare("UPDATE courses SET title = ?, category_id = ?, description = ?, image = ?, price = ?, price_six_months = ? WHERE id = ?");
        $stmt->execute([$title, $categoryId, $description, $image, $price, $price_six_months, $id]);
    } else {
        $stmt = $pdo->prepare("UPDATE courses SET title = ?, category_id = ?, description = ?, price = ?, price_six_months = ? WHERE id = ?");
        $stmt->execute([$title, $categoryId, $description, $price, $price_six_months, $id]);
    }
    
    // Fetch the updated course with category name
    $stmt = $pdo->prepare("
        SELECT c.id, c.title, cc.name as category, c.description, c.image, c.price, c.price_six_months, c.created_at 
        FROM courses c 
        LEFT JOIN course_categories cc ON c.category_id = cc.id 
        WHERE c.id = ?
    ");
    $stmt->execute([$id]);
    $course = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Course updated successfully',
        'course' => $course
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update course: ' . $e->getMessage()
    ]);
}
?>
