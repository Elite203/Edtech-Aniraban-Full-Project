<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config.php';

try {
    if (!isset($pdo)) {
        throw new Exception("Database connection not established. Check config.php");
    }

    $query = "SELECT * FROM ca_banner_settings WHERE id = 1";
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    if($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Convert LONGBLOB to Base64 if it exists
        if($row['banner_image']) {
            $row['banner_image'] = 'data:image/jpeg;base64,' . base64_encode($row['banner_image']);
        }
        
        echo json_encode(array("status" => "success", "data" => $row));
    } else {
        echo json_encode(array("status" => "error", "message" => "No settings found in table"));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => $e->getMessage()));
}


?>
