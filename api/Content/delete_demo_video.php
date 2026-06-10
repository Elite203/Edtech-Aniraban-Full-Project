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
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    // Validate required fields
    if (!isset($input['video_id']) || empty($input['video_id'])) {
        throw new Exception('Video ID is required');
    }

    $video_id = (int)$input['video_id'];

    // Check if video exists and get its data
    $checkStmt = $pdo->prepare("SELECT id, name, video_link, thumbnail FROM demo_videos WHERE id = ?");
    $checkStmt->execute([$video_id]);
    $video = $checkStmt->fetch();

    if (!$video) {
        throw new Exception('Video not found');
    }

    // Delete thumbnail file if it exists
    if ($video['thumbnail'] && file_exists('../' . $video['thumbnail'])) {
        unlink('../' . $video['thumbnail']);
    }

    // Delete the video from database
    $deleteStmt = $pdo->prepare("DELETE FROM demo_videos WHERE id = ?");
    $result = $deleteStmt->execute([$video_id]);

    if ($result && $deleteStmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Demo video deleted successfully',
            'data' => [
                'deleted_video' => [
                    'id' => $video['id'],
                    'name' => $video['name'],
                    'video_link' => $video['video_link']
                ]
            ]
        ]);
    } else {
        throw new Exception('Failed to delete video');
    }

} catch (PDOException $e) {
    error_log("Database Error in delete_demo_video.php: " . $e->getMessage());
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
