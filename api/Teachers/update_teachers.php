<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST and PUT methods
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Include database configuration
require_once '../config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['id']) || !isset($input['name']) || !isset($input['email']) || !isset($input['role']) || !isset($input['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

$id = intval($input['id']);
$name = trim($input['name']);
$email = trim($input['email']);
$role = trim($input['role']);
$status = trim($input['status']);
$password = isset($input['password']) ? trim($input['password']) : null;

// Validation
if (empty($name) || empty($email) || empty($role) || empty($status)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

if (!in_array($role, ['super_admin', 'ca_teacher', 'test_teacher'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid role']);
    exit();
}

if (!in_array($status, ['active', 'suspended'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid status']);
    exit();
}

try {
    // Check if admin exists
    $stmt = $pdo->prepare("SELECT id FROM admins WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Teacher not found']);
        exit();
    }

    // Check if email already exists for another admin
    $stmt = $pdo->prepare("SELECT id FROM admins WHERE email = ? AND id != ?");
    $stmt->execute([$email, $id]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        exit();
    }

    // Prepare update query
    if (!empty($password)) {
        // Update with password
        $stmt = $pdo->prepare("UPDATE admins SET name = ?, email = ?, password = ?, role = ?, status = ? WHERE id = ?");
        $result = $stmt->execute([$name, $email, $password, $role, $status, $id]);
    } else {
        // Update without password
        $stmt = $pdo->prepare("UPDATE admins SET name = ?, email = ?, role = ?, status = ? WHERE id = ?");
        $result = $stmt->execute([$name, $email, $role, $status, $id]);
    }

    if ($result) {
        echo json_encode([
            'success' => true, 
            'message' => 'Teacher updated successfully',
            'admin_id' => $id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update teacher']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
}
?>
