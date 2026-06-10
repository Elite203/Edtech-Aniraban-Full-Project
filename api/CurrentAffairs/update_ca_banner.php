<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config.php';

try {
    $insta = $_POST['insta_link'] ?? '#';
    $fb = $_POST['fb_link'] ?? '#';
    $wa = $_POST['wa_link'] ?? '#';
    $li = $_POST['li_link'] ?? '#';
    $tg = $_POST['tg_link'] ?? '#';

    $update_fields = "insta_link = :insta, fb_link = :fb, wa_link = :wa, li_link = :li, tg_link = :tg";
    $params = [
        ':insta' => $insta,
        ':fb' => $fb,
        ':wa' => $wa,
        ':li' => $li,
        ':tg' => $tg
    ];

    if (isset($_FILES['banner_image']) && $_FILES['banner_image']['tmp_name']) {
        $imgData = file_get_contents($_FILES['banner_image']['tmp_name']);
        $update_fields .= ", banner_image = :image";
        $params[':image'] = $imgData;
    }

    $query = "UPDATE ca_banner_settings SET $update_fields WHERE id = 1";
    $stmt = $pdo->prepare($query);

    if ($stmt->execute($params)) {
        echo json_encode(array("status" => "success", "message" => "Settings updated successfully"));
    } else {
        echo json_encode(array("status" => "error", "message" => "Failed to update settings"));
    }
} catch (PDOException $e) {
    echo json_encode(array("status" => "error", "message" => $e->getMessage()));
}

?>
