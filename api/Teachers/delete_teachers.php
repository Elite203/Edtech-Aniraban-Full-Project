<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST and DELETE methods
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Include database configuration
require_once '../config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Teacher ID is required']);
    exit();
}

$id = intval($input['id']);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid teacher ID']);
    exit();
}

try {
    // Check if admin exists
    $stmt = $pdo->prepare("SELECT id, name, email FROM admins WHERE id = ?");
    $stmt->execute([$id]);
    $teacher = $stmt->fetch();
    
    if (!$teacher) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Teacher not found']);
        exit();
    }

    // Delete the teacher
    $stmt = $pdo->prepare("DELETE FROM admins WHERE id = ?");
    $result = $stmt->execute([$id]);

    if ($result) {
        echo json_encode([
            'success' => true, 
            'message' => 'Teacher deleted successfully',
            'deleted_teacher' => [
                'id' => $teacher['id'],
                'name' => $teacher['name'],
                'email' => $teacher['email']
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete teacher']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
}
?>
