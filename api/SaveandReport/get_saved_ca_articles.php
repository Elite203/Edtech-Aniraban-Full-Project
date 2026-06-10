<?php
require_once '../config.php';

$student_id = $_GET['student_id'] ?? null;

if (!$student_id) {
    echo json_encode(['success' => false, 'message' => 'Student ID is required.']);
    exit;
}

try {
    $sql = "SELECT cas.id as bookmark_id, cas.saved_at, 
                   ca.id, ca.title_en, ca.title_hi, ca.short_summary_en, ca.short_summary_hi, 
                   ca.category, ca.published_at, ca.featured_image as image, ca.published_at as date,
                   ca.content_en, ca.content_hi, ca.tags, ca.youtube_link
            FROM Current_Affairs_Article_Save cas
            JOIN current_affairs ca ON cas.ca_id = ca.id
            WHERE cas.student_id = ?
            ORDER BY cas.saved_at DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$student_id]);
    $saved_articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Process image if it's a blob
    foreach ($saved_articles as &$article) {
        if ($article['image']) {
            $article['image'] = 'data:image/jpeg;base64,' . base64_encode($article['image']);
        }
    }

    echo json_encode(['success' => true, 'data' => $saved_articles]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error fetching saved articles: ' . $e->getMessage()]);
}
?>
