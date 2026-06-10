<?php
session_start();
require_once '../config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Only POST method is allowed'
    ]);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON data'
    ]);
    exit;
}

// Validate required fields
if (!isset($input['student_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Student ID is required'
    ]);
    exit;
}

$student_id = intval($input['student_id']);
$first_name = isset($input['first_name']) ? trim($input['first_name']) : '';
$last_name = isset($input['last_name']) ? trim($input['last_name']) : '';
$email = isset($input['email']) ? trim(strtolower($input['email'])) : '';
$password = isset($input['password']) ? trim($input['password']) : '';
$number = isset($input['number']) ? trim($input['number']) : '';
$status = isset($input['status']) ? trim($input['status']) : '';

// Validate email format if provided
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email format'
    ]);
    exit;
}

// Validate status if provided
if (!empty($status) && !in_array($status, ['active', 'inactive'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid status. Must be active or inactive'
    ]);
    exit;
}

try {
    // Check if student exists
    $stmt = $pdo->prepare("SELECT id, email FROM students WHERE id = ?");
    $stmt->execute([$student_id]);
    $existing_student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existing_student) {
        echo json_encode([
            'success' => false,
            'message' => 'Student not found'
        ]);
        exit;
    }
    
    // Check if email is already taken by another student
    if (!empty($email) && $email !== $existing_student['email']) {
        $stmt = $pdo->prepare("SELECT id FROM students WHERE email = ? AND id != ?");
        $stmt->execute([$email, $student_id]);
        if ($stmt->fetch()) {
            echo json_encode([
                'success' => false,
                'message' => 'Email is already taken by another student'
            ]);
            exit;
        }
    }
    
    // Build update query dynamically
    $update_fields = [];
    $update_values = [];
    
    if (!empty($first_name)) {
        $update_fields[] = "first_name = ?";
        $update_values[] = $first_name;
    }

    if (!empty($last_name)) {
        $update_fields[] = "last_name = ?";
        $update_values[] = $last_name;
    }
    
    if (!empty($email)) {
        $update_fields[] = "email = ?";
        $update_values[] = $email;
    }
    
    if (!empty($password)) {
        $update_fields[] = "password = ?";
        $update_values[] = $password;
    }
    
    if (!empty($number)) {
        $update_fields[] = "number = ?";
        $update_values[] = $number;
    }
    
    if (!empty($status)) {
        $update_fields[] = "status = ?";
        $update_values[] = $status;
    }
    
    // Add updated_at timestamp
    $update_fields[] = "updated_at = CURRENT_TIMESTAMP";
    
    // Add student_id for WHERE clause
    $update_values[] = $student_id;
    
    if (empty($update_fields)) {
        echo json_encode([
            'success' => false,
            'message' => 'No fields to update'
        ]);
        exit;
    }
    
    // Execute update
    $sql = "UPDATE students SET " . implode(', ', $update_fields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($update_values);
    
    if ($stmt->rowCount() > 0) {
        // Get updated student data
        $stmt = $pdo->prepare("SELECT id, first_name, last_name, email, number, status, created_at, updated_at, verified FROM students WHERE id = ?");
        $stmt->execute([$student_id]);
        $updated_student = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $updated_student['name'] = $updated_student['first_name'] . ' ' . $updated_student['last_name'];
        
        echo json_encode([
            'success' => true,
            'message' => 'Student updated successfully',
            'data' => $updated_student
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No changes were made or student not found'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Update student error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred. Please try again later.'
    ]);
}
?>
