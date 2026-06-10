<?php
session_start();
require_once '../config.php';

// Set proper JSON header
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Only GET method is allowed'
    ]);
    exit;
}

// Get student ID from GET parameter or session
$student_id = $_GET['id'] ?? $_SESSION['student_id'] ?? null;

if (!$student_id) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Student ID is required'
    ]);
    exit;
}

try {
    // 1. FETCH DATA (Including watermark_image)
    // We explicitly select 'watermark_image' (the BLOB column)
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, number, age, date_of_birth, photo, watermark_image, state, created_at FROM students WHERE id = ? AND status = 'active'");
    $stmt->execute([$student_id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$student) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Student profile not found'
        ]);
        exit;
    }
    
    // 2. PROCESS WATERMARK IMAGE
    // Convert BLOB to Base64 Data URI for the frontend
    $watermarkUrl = null;
    
    if (!empty($student['watermark_image'])) {
        // Convert the raw binary data to base64
        $base64Data = base64_encode($student['watermark_image']);
        // Format it as a PNG data URI so the <img> or style={{backgroundImage}} can read it
        $watermarkUrl = 'data:image/png;base64,' . $base64Data;
    }

    // 3. Prepare response data
    $response = [
        'success' => true,
        'student' => [
            'id' => $student['id'],
            'first_name' => $student['first_name'],
            'last_name' => $student['last_name'],
            'number' => $student['number'],
            'age' => $student['age'],
            'date_of_birth' => $student['date_of_birth'],
            'state' => $student['state'],
            'registrationDate' => $student['created_at'],
            'watermark_url' => $watermarkUrl, // <--- This is what you use in React
            'hasPhoto' => !empty($student['photo'])
        ]
    ];
    
    echo json_encode($response);
    
} catch (PDOException $e) {
    error_log("Get student profile error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
}
?>
