<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Select only active current affairs
    $stmt = $pdo->prepare("SELECT id, title_en, title_hi, short_summary_en, short_summary_hi, content_en, content_hi, category, tags, youtube_link, published_at as date, featured_image as image FROM current_affairs WHERE status = 'active' ORDER BY published_at DESC");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert BLOB image to Base64 data URL
    foreach ($results as &$row) {
        if ($row['image']) {
            if (strpos($row['image'], 'img/') === 0) {
              // Legacy path
            } else {
              // Binary BLOB, convert to Base64 data URL
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
