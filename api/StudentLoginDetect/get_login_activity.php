<?php
require_once '../config.php';

$student_id = $_GET['student_id'] ?? null;

if ($student_id) {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 2;
    try {
        $query = "SELECT city, browser, device, login_at FROM student_logins WHERE student_id = ? ORDER BY login_at DESC LIMIT $limit";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$student_id]);
        $logins = $stmt->fetchAll();
        
        echo json_encode(["success" => true, "data" => $logins]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Student ID required"]);
}
?>
