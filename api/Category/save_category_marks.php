<?php
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['exam_set_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid data provided']);
    exit;
}

$exam_set_id = intval($data['exam_set_id']);
$sc = isset($data['SC']) ? intval($data['SC']) : 0;
$st = isset($data['ST']) ? intval($data['ST']) : 0;
$obc = isset($data['OBC']) ? intval($data['OBC']) : 0;
$ews = isset($data['EWS']) ? intval($data['EWS']) : 0;
$pwd = isset($data['PWD']) ? intval($data['PWD']) : 0;
$general = isset($data['General']) ? intval($data['General']) : 0;

try {
    // Check if record exists
    $stmt = $pdo->prepare("SELECT id FROM category WHERE exam_set_id = ?");
    $stmt->execute([$exam_set_id]);
    $exists = $stmt->fetch();

    if ($exists) {
        $stmt = $pdo->prepare("UPDATE category SET SC = ?, ST = ?, OBC = ?, EWS = ?, PWD = ?, General = ? WHERE exam_set_id = ?");
        $stmt->execute([$sc, $st, $obc, $ews, $pwd, $general, $exam_set_id]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO category (exam_set_id, SC, ST, OBC, EWS, PWD, General) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$exam_set_id, $sc, $st, $obc, $ews, $pwd, $general]);
    }

    echo json_encode(['success' => true, 'message' => 'Category numbers saved successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
