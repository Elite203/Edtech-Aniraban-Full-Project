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
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON input'
        ]);
        exit;
    }
    
    $id = $input['id'] ?? '';
    
    if (empty($id)) {
        echo json_encode([
            'success' => false,
            'message' => 'Course ID is required'
        ]);
        exit;
    }
    
    // Check if course exists
    $stmt = $pdo->prepare("SELECT id, title FROM courses WHERE id = ?");
    $stmt->execute([$id]);
    $course = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$course) {
        echo json_encode([
            'success' => false,
            'message' => 'Course not found'
        ]);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM courses WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Course deleted successfully',
        'deletedCourse' => $course
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to delete course: ' . $e->getMessage()
    ]);
}
?>
