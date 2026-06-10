<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple API without complex parameters
try {
    // Database connection
    require_once '../config.php';
    
    // Simple query to get all students
    $query = "SELECT id, first_name, last_name, email, number, photo, status, verified, created_at FROM students ORDER BY created_at DESC LIMIT 100";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $students = [];
    foreach ($result as $row) {
        // Convert MEDIUMBLOB photo to base64 if it exists
        $profile_picture = null;
        if (!empty($row['photo'])) {
            $profile_picture = 'data:image/jpeg;base64,' . base64_encode($row['photo']);
        }
        
        $students[] = [
            'id' => (int)$row['id'],
            'first_name' => $row['first_name'] ?? '',
            'last_name' => $row['last_name'] ?? '',
            'name' => ($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''),
            'email' => $row['email'] ?? '',
            'phone' => $row['number'] ?? '',
            'profile_picture' => $profile_picture,
            'status' => $row['status'] ?? 'inactive',
            'is_verified' => ($row['verified'] ?? 'pending') === 'verified',
            'created_at' => $row['created_at'] ?? '',
            'role' => 'student'
        ];
    }
    
    // Get simple metrics
    $metrics_query = "SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_students,
        SUM(CASE WHEN verified = 'verified' THEN 1 ELSE 0 END) as verified_students,
        SUM(CASE WHEN verified = 'pending' THEN 1 ELSE 0 END) as unverified_students
        FROM students";
    
    $metrics_stmt = $pdo->prepare($metrics_query);
    $metrics_stmt->execute();
    $metrics = $metrics_stmt->fetch(PDO::FETCH_ASSOC);
    
    $response = [
        'success' => true,
        'data' => [
            'students' => $students,
            'total' => count($students),
            'total_pages' => 1,
            'current_page' => 1,
            'metrics' => [
                'total_students' => (int)$metrics['total_students'],
                'active_students' => (int)$metrics['active_students'],
                'inactive_students' => (int)$metrics['inactive_students'],
                'suspended_students' => 0,
                'verified_students' => (int)$metrics['verified_students'],
                'unverified_students' => (int)$metrics['unverified_students'],
                'new_today' => 0,
                'new_this_week' => 0
            ]
        ]
    ];
    
    echo json_encode($response);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
