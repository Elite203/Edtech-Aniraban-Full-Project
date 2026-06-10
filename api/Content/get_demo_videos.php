<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_log("get_demo_videos.php: Starting execution");

try {
    require_once '../config.php';
    error_log("get_demo_videos.php: Config loaded successfully");
    
    if (!isset($pdo)) {
        error_log("get_demo_videos.php: PDO connection not found");
        throw new Exception("Database connection not established");
    }
    
    error_log("get_demo_videos.php: PDO connection exists");
    
    // Query to get all demo videos ordered by creation date (newest first)
    $stmt = $pdo->prepare("
        SELECT 
            id,
            name,
            video_link,
            thumbnail,
            created_at,
            updated_at
        FROM demo_videos 
        ORDER BY created_at DESC
    ");
    
    error_log("get_demo_videos.php: Executing query");
    $stmt->execute();
    $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("get_demo_videos.php: Query executed, found " . count($videos) . " videos");
    
    // Format the response data
    $formattedVideos = array_map(function($video) {
        return [
            'id' => (int)$video['id'],
            'name' => $video['name'],
            'video_link' => $video['video_link'],
            'thumbnail' => $video['thumbnail'] ? 'has_thumbnail' : null,
            'created_at' => $video['created_at'],
            'updated_at' => $video['updated_at']
        ];
    }, $videos);
    
    error_log("get_demo_videos.php: Formatted videos data");
    
    $response = [
        'success' => true,
        'message' => 'Demo videos retrieved successfully',
        'data' => [
            'videos' => $formattedVideos,
            'total' => count($formattedVideos)
        ]
    ];
    
    error_log("get_demo_videos.php: Sending response: " . json_encode($response));
    
    // Return success response
    echo json_encode($response);
    
} catch (PDOException $e) {
    error_log("Database Error in get_demo_videos.php: " . $e->getMessage());
    http_response_code(500);
    $error_response = [
        'success' => false,
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ];
    error_log("get_demo_videos.php: Sending database error response: " . json_encode($error_response));
    echo json_encode($error_response);
} catch (Exception $e) {
    error_log("General Error in get_demo_videos.php: " . $e->getMessage());
    http_response_code(500);
    $error_response = [
        'success' => false,
        'message' => 'An error occurred while fetching videos',
        'error' => $e->getMessage()
    ];
    error_log("get_demo_videos.php: Sending general error response: " . json_encode($error_response));
    echo json_encode($error_response);
}

error_log("get_demo_videos.php: Script execution completed");
?>
