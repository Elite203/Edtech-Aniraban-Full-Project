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
    $id = $_POST['id'] ?? null;
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
    $published_at = $_POST['published_at'] ?? null;

    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Article ID is required']);
        exit;
    }

    try {
        // Build update query
        $query = "UPDATE current_affairs SET title_en = ?, title_hi = ?, short_summary_en = ?, short_summary_hi = ?, content_en = ?, content_hi = ?, category = ?, tags = ?, youtube_link = ?, status = ?";
        $params = [$title_en, $title_hi, $short_summary_en, $short_summary_hi, $content_en, $content_hi, $category, $tags, $youtube_link, $status];

        if ($published_at) {
            $query .= ", published_at = ?";
            $params[] = $published_at;
        }

        // Handle Image Upload - Store as BLOB
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $image_blob = file_get_contents($_FILES['image']['tmp_name']);
            if ($image_blob !== false) {
                $query .= ", featured_image = ?";
                $params[] = $image_blob;
            }
        }

        $query .= " WHERE id = ?";
        $params[] = $id;

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);

        echo json_encode(['status' => 'success', 'message' => 'Current Affair updated successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>
