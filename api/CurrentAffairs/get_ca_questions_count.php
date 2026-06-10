<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config.php';

try {
    if (!isset($pdo)) {
        throw new Exception("Database connection not established. Check config.php");
    }

    $query = "SELECT COUNT(*) as total FROM CurrentAffairs_Questions";
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $totalCount = $row ? intval($row['total']) : 0;

    echo json_encode(array("status" => "success", "total" => $totalCount));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => $e->getMessage()));
}
?>
