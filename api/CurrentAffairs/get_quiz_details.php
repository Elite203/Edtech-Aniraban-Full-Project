<?php
require_once '../config.php';

$year = $_GET['year'] ?? null;
$month = $_GET['month'] ?? null;

if (!$year) {
    echo json_encode(["status" => "error", "message" => "Year is required"]);
    exit;
}

try {
    if ($month) {
        $stmt = $pdo->prepare("SELECT * FROM CurrentAffairs_Quiz_Detail WHERE Year = ? AND Month = ?");
        $stmt->execute([$year, $month]);
        $data = $stmt->fetch();
    } else {
        $stmt = $pdo->prepare("SELECT * FROM CurrentAffairs_Quiz_Detail WHERE Year = ?");
        $stmt->execute([$year]);
        $data = $stmt->fetchAll();
    }

    echo json_encode(["status" => "success", "data" => $data]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
