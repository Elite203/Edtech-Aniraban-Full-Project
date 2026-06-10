<?php
require_once '../config.php';

try {
    $stmt = $pdo->query("
        SELECT s.id, s.name, s.logo, s.name as syllabus_name,
               c.title_text, c.subtitle_text,
               c.btn1_text, c.btn1_color, c.btn1_link,
               c.btn2_text, c.btn2_color, c.btn2_link,
               c.btn3_text, c.btn3_color, c.btn3_link,
               c.btn4_text, c.btn4_color, c.btn4_link,
               c.btn5_text, c.btn5_color, c.btn5_link,
               c.btn6_text, c.btn6_color, c.btn6_link,
               c.btn7_text, c.btn7_color, c.btn7_link,
               c.btn8_text, c.btn8_color, c.btn8_link,
               c.btn9_text, c.btn9_color, c.btn9_link,
               c.btn10_text, c.btn10_color, c.btn10_link,
               c.yt_link1, c.yt_link2, c.yt_link3, c.yt_link4,
               c.content_overview, c.quick_actions
        FROM official_syllabus s
        LEFT JOIN official_syllabus_cards_data c ON s.id = c.syllabus_id
        ORDER BY s.id DESC
    ");
    $items = $stmt->fetchAll();

    // Convert BLOB to Base64
    foreach ($items as &$item) {
        if ($item['logo']) {
            $item['logo'] = 'data:image/webp;base64,' . base64_encode($item['logo']);
        }
    }

    echo json_encode(['success' => true, 'data' => $items]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
