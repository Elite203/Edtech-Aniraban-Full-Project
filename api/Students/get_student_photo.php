<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_GET['id'])) {
    http_response_code(400);
    exit('Student ID required');
}

try {
    require_once '../config.php';
    
    $student_id = (int)$_GET['id'];
    
    $stmt = $pdo->prepare("SELECT photo FROM students WHERE id = ?");
    $stmt->execute([$student_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result || !$result['photo']) {
        http_response_code(404);
        exit('Photo not found');
    }
    
    // Set appropriate headers for image
    header('Content-Type: image/jpeg');
    header('Content-Length: ' . strlen($result['photo']));
    header('Cache-Control: public, max-age=31536000');
    
    // Output the binary image data
    echo $result['photo'];
    
} catch (Exception $e) {
    http_response_code(500);
    exit('Error retrieving photo');
}
?>
