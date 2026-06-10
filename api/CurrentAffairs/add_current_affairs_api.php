<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Collect data from POST
    $title_en = $_POST['title_en'] ?? '';
    $title_hi = $_POST['title_hi'] ?? '';
    $short_summary_en = $_POST['short_summary_en'] ?? '';
    $short_summary_hi = $_POST['short_summary_hi'] ?? '';
    $content_en = $_POST['content_en'] ?? '';
    $content_hi = $_POST['content_hi'] ?? '';
    $category = $_POST['category'] ?? '';
    $tags = $_POST['tags'] ?? '';
    $youtube_link = $_POST['youtube_link'] ?? '';
    $status = $_POST['status'] ?? 'draft';
    $published_at = $_POST['published_at'] ?? date('Y-m-d H:i:s');
    $created_by = $_POST['created_by'] ?? 1; // Default to admin ID 1

    // Basic Validation
    if (empty($title_en) || empty($content_en)) {
        echo json_encode(['status' => 'error', 'message' => 'English title and content are required']);
        exit;
    }

    $image_blob = null;

    // Handle Image Upload - Store as BLOB
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $image_blob = file_get_contents($_FILES['image']['tmp_name']);
        if ($image_blob === false) {
            echo json_encode(['status' => 'error', 'message' => 'Failed to read image file']);
            exit;
        }
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO current_affairs (title_en, title_hi, short_summary_en, short_summary_hi, content_en, content_hi, category, tags, youtube_link, featured_image, status, published_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title_en, $title_hi, $short_summary_en, $short_summary_hi, $content_en, $content_hi, $category, $tags, $youtube_link, $image_blob, $status, $published_at, $created_by]);

        echo json_encode(['status' => 'success', 'message' => 'Current Affair added successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>
