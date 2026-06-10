<?php

require_once '../config.php';
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Handle POST requests for adding teachers
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $name = isset($data['name']) ? trim($data['name']) : '';
        $email = isset($data['email']) ? trim($data['email']) : '';
        $password = isset($data['password']) ? trim($data['password']) : '';
        $role = isset($data['role']) ? trim($data['role']) : 'super_admin';
        $status = isset($data['status']) ? trim($data['status']) : 'active';

        // Validate required fields
        if (empty($name) || empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Name, email, and password are required']);
            exit;
        }

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Invalid email format']);
            exit;
        }

        // Validate role
        $allowedRoles = ['super_admin', 'ca_teacher', 'test_teacher'];
        if (!in_array($role, $allowedRoles)) {
            echo json_encode(['success' => false, 'message' => 'Invalid role']);
            exit;
        }

        // Validate status
        $allowedStatuses = ['active','suspended'];
        if (!in_array($status, $allowedStatuses)) {
            echo json_encode(['success' => false, 'message' => 'Invalid status']);
            exit;
        }

        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM admins WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Email already exists']);
            exit;
        }

        // Insert new teacher/admin
        $stmt = $pdo->prepare("INSERT INTO admins (name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        
        if ($stmt->execute([$name, $email, $password, $role, $status])) {
            $adminId = $pdo->lastInsertId();
            echo json_encode([
                'success' => true,
                'message' => 'Teacher added successfully',
                'admin_id' => $adminId
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to add teacher']);
        }

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed']);
}
