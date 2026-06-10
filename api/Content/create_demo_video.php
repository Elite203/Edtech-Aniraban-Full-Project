<?php
require_once '../config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

try {
    // Validate required fields
    if (!isset($_POST['name']) || empty($_POST['name'])) {
        throw new Exception('Video name is required');
    }
    
    if (!isset($_POST['video_link']) || empty($_POST['video_link'])) {
        throw new Exception('Video link is required');
    }
    
    // Validate video link format
    if (!filter_var($_POST['video_link'], FILTER_VALIDATE_URL)) {
        throw new Exception('Please provide a valid video link');
    }
    
    $name = trim($_POST['name']);
    $video_link = trim($_POST['video_link']);
    $thumbnail_data = null;
    
    // Handle thumbnail upload if provided
    if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
        $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        $file_type = $_FILES['thumbnail']['type'];
        
        // Validate file type
        if (!in_array($file_type, $allowed_types)) {
            throw new Exception('Only JPG, JPEG, PNG and GIF files are allowed for thumbnail');
        }
        
        // Validate file size (5MB max)
        if ($_FILES['thumbnail']['size'] > 5 * 1024 * 1024) {
            throw new Exception('Thumbnail file size must be less than 5MB');
        }
        
        // Read file content directly into variable
        $thumbnail_data = file_get_contents($_FILES['thumbnail']['tmp_name']);
        
        if ($thumbnail_data === false) {
            throw new Exception('Failed to read thumbnail file');
        }
    }
    
    // Check if video with same name already exists
    $checkStmt = $pdo->prepare("SELECT id FROM demo_videos WHERE name = ?");
    $checkStmt->execute([$name]);
    
    if ($checkStmt->fetch()) {
        throw new Exception('A video with this name already exists');
    }
    
    // Insert new video into database
    $insertStmt = $pdo->prepare("
        INSERT INTO demo_videos (name, video_link, thumbnail, created_at, updated_at) 
        VALUES (?, ?, ?, NOW(), NOW())
    ");
    
    $result = $insertStmt->execute([$name, $video_link, $thumbnail_data]);
    
    if ($result) {
        $video_id = $pdo->lastInsertId();
        
        // Get the created video data
        $getVideoStmt = $pdo->prepare("
            SELECT id, name, video_link, thumbnail, created_at, updated_at 
            FROM demo_videos WHERE id = ?
        ");
        $getVideoStmt->execute([$video_id]);
        $video_data = $getVideoStmt->fetch();
        
        echo json_encode([
            'success' => true,
            'message' => 'Demo video created successfully',
            'data' => [
                'video' => [
                    'id' => (int)$video_data['id'],
                    'name' => $video_data['name'],
                    'video_link' => $video_data['video_link'],
                    'thumbnail' => base64_encode($video_data['thumbnail']),
                    'created_at' => $video_data['created_at'],
                    'updated_at' => $video_data['updated_at']
                ]
            ]
        ]);
    } else {
        throw new Exception('Failed to create demo video');
    }
    
} catch (PDOException $e) {
    error_log("Database Error in create_demo_video.php: " . $e->getMessage());
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
