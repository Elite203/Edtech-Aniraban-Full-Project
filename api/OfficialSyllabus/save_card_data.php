<?php
require_once '../config.php';

// Get JSON data from request body
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['syllabus_id'])) {
    echo json_encode(['success' => false, 'message' => 'Syllabus ID is required']);
    exit;
}

$syllabus_id = $data['syllabus_id'];
$title_text = isset($data['title_text']) ? $data['title_text'] : null;
$subtitle_text = isset($data['subtitle_text']) ? $data['subtitle_text'] : null;

// New button fields
$btns = [];
for ($i = 1; $i <= 10; $i++) {
    $btns["btn{$i}_text"] = isset($data["btn{$i}_text"]) ? $data["btn{$i}_text"] : null;
    $btns["btn{$i}_color"] = isset($data["btn{$i}_color"]) ? $data["btn{$i}_color"] : null;
    $btns["btn{$i}_link"] = isset($data["btn{$i}_link"]) ? $data["btn{$i}_link"] : null;
}

// New YouTube links
$yt_links = [];
for ($i = 1; $i <= 4; $i++) {
    $yt_links["yt_link{$i}"] = isset($data["yt_link{$i}"]) ? $data["yt_link{$i}"] : null;
}

$content_overview = isset($data['content_overview']) ? $data['content_overview'] : null;
$quick_actions = isset($data['quick_actions']) ? $data['quick_actions'] : null;

try {
    // Check if entry already exists
    $checkStmt = $pdo->prepare("SELECT id FROM official_syllabus_cards_data WHERE syllabus_id = ?");
    $checkStmt->execute([$syllabus_id]);
    $existing = $checkStmt->fetch();

    if ($existing) {
        // Update existing entry
        $stmt = $pdo->prepare("UPDATE official_syllabus_cards_data SET 
            title_text = ?, 
            subtitle_text = ?,
            btn1_text = ?, btn1_color = ?, btn1_link = ?,
            btn2_text = ?, btn2_color = ?, btn2_link = ?,
            btn3_text = ?, btn3_color = ?, btn3_link = ?,
            btn4_text = ?, btn4_color = ?, btn4_link = ?,
            btn5_text = ?, btn5_color = ?, btn5_link = ?,
            btn6_text = ?, btn6_color = ?, btn6_link = ?,
            btn7_text = ?, btn7_color = ?, btn7_link = ?,
            btn8_text = ?, btn8_color = ?, btn8_link = ?,
            btn9_text = ?, btn9_color = ?, btn9_link = ?,
            btn10_text = ?, btn10_color = ?, btn10_link = ?,
            yt_link1 = ?, yt_link2 = ?, yt_link3 = ?, yt_link4 = ?,
            content_overview = ?, quick_actions = ?
            WHERE syllabus_id = ?");
        $stmt->execute([
            $title_text, $subtitle_text,
            $btns['btn1_text'], $btns['btn1_color'], $btns['btn1_link'],
            $btns['btn2_text'], $btns['btn2_color'], $btns['btn2_link'],
            $btns['btn3_text'], $btns['btn3_color'], $btns['btn3_link'],
            $btns['btn4_text'], $btns['btn4_color'], $btns['btn4_link'],
            $btns['btn5_text'], $btns['btn5_color'], $btns['btn5_link'],
            $btns['btn6_text'], $btns['btn6_color'], $btns['btn6_link'],
            $btns['btn7_text'], $btns['btn7_color'], $btns['btn7_link'],
            $btns['btn8_text'], $btns['btn8_color'], $btns['btn8_link'],
            $btns['btn9_text'], $btns['btn9_color'], $btns['btn9_link'],
            $btns['btn10_text'], $btns['btn10_color'], $btns['btn10_link'],
            $yt_links['yt_link1'], $yt_links['yt_link2'], $yt_links['yt_link3'], $yt_links['yt_link4'],
            $content_overview, $quick_actions,
            $syllabus_id
        ]);
        $message = 'Card data updated successfully';
    } else {
        // Insert new entry
        $stmt = $pdo->prepare("INSERT INTO official_syllabus_cards_data (
            syllabus_id, title_text, subtitle_text,
            btn1_text, btn1_color, btn1_link,
            btn2_text, btn2_color, btn2_link,
            btn3_text, btn3_color, btn3_link,
            btn4_text, btn4_color, btn4_link,
            btn5_text, btn5_color, btn5_link,
            btn6_text, btn6_color, btn6_link,
            btn7_text, btn7_color, btn7_link,
            btn8_text, btn8_color, btn8_link,
            btn9_text, btn9_color, btn9_link,
            btn10_text, btn10_color, btn10_link,
            yt_link1, yt_link2, yt_link3, yt_link4,
            content_overview, quick_actions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $syllabus_id, $title_text, $subtitle_text,
            $btns['btn1_text'], $btns['btn1_color'], $btns['btn1_link'],
            $btns['btn2_text'], $btns['btn2_color'], $btns['btn2_link'],
            $btns['btn3_text'], $btns['btn3_color'], $btns['btn3_link'],
            $btns['btn4_text'], $btns['btn4_color'], $btns['btn4_link'],
            $btns['btn5_text'], $btns['btn5_color'], $btns['btn5_link'],
            $btns['btn6_text'], $btns['btn6_color'], $btns['btn6_link'],
            $btns['btn7_text'], $btns['btn7_color'], $btns['btn7_link'],
            $btns['btn8_text'], $btns['btn8_color'], $btns['btn8_link'],
            $btns['btn9_text'], $btns['btn9_color'], $btns['btn9_link'],
            $btns['btn10_text'], $btns['btn10_color'], $btns['btn10_link'],
            $yt_links['yt_link1'], $yt_links['yt_link2'], $yt_links['yt_link3'], $yt_links['yt_link4'],
            $content_overview, $quick_actions
        ]);
        $message = 'Card data saved successfully';
    }

    echo json_encode(['success' => true, 'message' => $message]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
