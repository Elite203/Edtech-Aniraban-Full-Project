<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// Database configuration
require_once '../config.php';

try {
    // Create PDO connection
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    // Validate required fields
    if (!isset($input['student_id']) || empty($input['student_id'])) {
        throw new Exception('Student ID is required');
    }

    $student_id = (int)$input['student_id'];

    // Check if student exists
    $checkStmt = $pdo->prepare("SELECT id, first_name, last_name, email FROM students WHERE id = ?");
    $checkStmt->execute([$student_id]);
    $student = $checkStmt->fetch();

    if (!$student) {
        throw new Exception('Student not found');
    }

    // Delete the student
    $deleteStmt = $pdo->prepare("DELETE FROM students WHERE id = ?");
    $result = $deleteStmt->execute([$student_id]);

    if ($result && $deleteStmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Student deleted successfully',
            'data' => [
                'deleted_student' => [
                    'id' => $student['id'],
                    'first_name' => $student['first_name'],
                    'last_name' => $student['last_name'],
                    'email' => $student['email']
                ]
            ]
        ]);
    } else {
        throw new Exception('Failed to delete student');
    }

} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
