<?php
require_once '../config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data provided"]);
    exit;
}

$year = $data['year'] ?? null;
$month = $data['month'] ?? null;
$overallTime = $data['overallTime'] ?? 0;
$maxMarks = $data['maxMarks'] ?? 0;
$positiveMarking = $data['positiveMarking'] ?? 0;
$negativeMarking = $data['negativeMarking'] ?? 0;
$passingGeneral = $data['passingGeneral'] ?? 0;
$passingOBC = $data['passingOBC'] ?? 0;
$passingSC = $data['passingSC'] ?? 0;
$passingST = $data['passingST'] ?? 0;
$passingEWS = $data['passingEWS'] ?? 0;
$passingPWD = $data['passingPWD'] ?? 0;
$action = $data['action'] ?? 'save'; // save or delete

if (!$year || !$month) {
    echo json_encode(["status" => "error", "message" => "Year and Month are required"]);
    exit;
}

try {
    if ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM CurrentAffairs_Quiz_Detail WHERE Year = ? AND Month = ?");
        $stmt->execute([$year, $month]);
        echo json_encode(["status" => "success", "message" => "Quiz details deleted successfully"]);
    } else {
        // UPSERT logic
        $stmt = $pdo->prepare("INSERT INTO CurrentAffairs_Quiz_Detail 
            (Year, Month, OverallTime, MaxMarks, PositiveMarking, NegativeMarking, 
             Passing_General, Passing_OBC, Passing_SC, Passing_ST, Passing_EWS, Passing_PWD) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            OverallTime = VALUES(OverallTime),
            MaxMarks = VALUES(MaxMarks),
            PositiveMarking = VALUES(PositiveMarking),
            NegativeMarking = VALUES(NegativeMarking),
            Passing_General = VALUES(Passing_General),
            Passing_OBC = VALUES(Passing_OBC),
            Passing_SC = VALUES(Passing_SC),
            Passing_ST = VALUES(Passing_ST),
            Passing_EWS = VALUES(Passing_EWS),
            Passing_PWD = VALUES(Passing_PWD)");
        
        $stmt->execute([
            $year, $month, $overallTime, $maxMarks, $positiveMarking, $negativeMarking,
            $passingGeneral, $passingOBC, $passingSC, $passingST, $passingEWS, $passingPWD
        ]);

        echo json_encode(["status" => "success", "message" => "Quiz details saved successfully"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
