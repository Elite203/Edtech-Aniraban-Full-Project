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
    exit('Video ID required');
}

try {
    require_once '../config.php';
    
    $video_id = (int)$_GET['id'];
    
    $stmt = $pdo->prepare("SELECT thumbnail FROM demo_videos WHERE id = ?");
    $stmt->execute([$video_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result || !$result['thumbnail']) {
        http_response_code(404);
        exit('Thumbnail not found');
    }
    
    // Set appropriate headers for image
    header('Content-Type: image/png');
    header('Content-Length: ' . strlen($result['thumbnail']));
    header('Cache-Control: public, max-age=31536000');
    
    // Output the binary image data
    echo $result['thumbnail'];
    
} catch (Exception $e) {
    http_response_code(500);
    exit('Error retrieving thumbnail');
}
?>
