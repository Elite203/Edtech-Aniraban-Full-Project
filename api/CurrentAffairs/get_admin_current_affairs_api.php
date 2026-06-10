<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Select all articles for admin
    $stmt = $pdo->prepare("SELECT id, title_en, title_hi, short_summary_en, short_summary_hi, content_en, content_hi, category, tags, youtube_link, status, featured_image as image, published_at as date, created_at FROM current_affairs ORDER BY created_at DESC");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert BLOB image to Base64 data URL
    foreach ($results as &$row) {
        if ($row['image']) {
            // Check if it's a binary BLOB (not a legacy path string)
            if (strpos($row['image'], 'img/') === 0) {
                // It's a legacy path (e.g. "img/current_affairs/...")
                // Leave it as is, frontend will handle it with BASE_URL
            } else {
                // It's a binary BLOB, convert to Base64 data URL
                $mimeType = 'image/jpeg'; // Default
                if (class_exists('finfo')) {
                    $finfo = new finfo(FILEINFO_MIME_TYPE);
                    $detectedMime = $finfo->buffer($row['image']);
                    if ($detectedMime) $mimeType = $detectedMime;
                }
                $row['image'] = 'data:' . $mimeType . ';base64,' . base64_encode($row['image']);
            }
        }
    }

    echo json_encode(['status' => 'success', 'data' => $results]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
