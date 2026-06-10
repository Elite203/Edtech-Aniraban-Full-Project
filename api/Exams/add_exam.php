<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    error_log('add_exam.php - Input received: ' . json_encode($input));
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
        exit;
    }
    
    $course_id = $input['course_id'] ?? null;
    $exam_name = $input['exam_name'] ?? '';
    
    // Validation
    if (!$course_id) {
        error_log('add_exam.php - Validation failed: Course ID is missing');
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Course ID is required']);
        exit;
    }
    
    if (empty($exam_name)) {
        error_log('add_exam.php - Validation failed: Exam name is empty');
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Exam name is required']);
        exit;
    }
    
    try {
        // Check if course exists
        $check_stmt = $pdo->prepare("SELECT id FROM courses WHERE id = ?");
        $check_stmt->execute([$course_id]);
        if (!$check_stmt->fetch()) {
            error_log('add_exam.php - Course not found: ' . $course_id);
            throw new Exception("Course not found");
        }
        
        // Insert new exam (without set_number and subjects - those will be added later)
        // We'll store the exam with a temporary structure
        $stmt = $pdo->prepare("INSERT INTO exam_sets (course_id, exam_name, set_number) VALUES (?, ?, ?)");
        $result = $stmt->execute([$course_id, trim($exam_name), 0]);
        
        if (!$result) {
            error_log('add_exam.php - Failed to insert exam');
            throw new Exception("Failed to insert exam");
        }
        
        $exam_id = $pdo->lastInsertId();
        error_log('add_exam.php - Exam created successfully with ID: ' . $exam_id);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Exam added successfully', 
            'exam_id' => $exam_id
        ]);
        
    } catch (Exception $e) {
        error_log('add_exam.php Error: ' . $e->getMessage());
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Failed to add exam: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
