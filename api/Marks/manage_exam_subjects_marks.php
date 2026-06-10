<?php
// api/manage_exam_subjects.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config.php'; // Ensure your database connection is included here

// Handle Preflight Request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// ---------------------------------------------------------
// 1. GET Request: Fetch Subjects & Marks for a Set
// ---------------------------------------------------------
if ($method === 'GET') {
    
    if (!isset($_GET['exam_set_id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "exam_set_id is required."]);
        exit;
    }

    $exam_set_id = intval($_GET['exam_set_id']);

    try {
        // Fetch id, name and the new sub_marks column
        $query = "SELECT id, subject_name, sub_marks FROM subjects WHERE exam_set_id = ? ORDER BY id ASC";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$exam_set_id]);
        
        $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Ensure numeric types for frontend
        foreach ($subjects as &$subject) {
            $subject['id'] = intval($subject['id']);
            // Use floatval for sub_marks as requested
            $subject['sub_marks'] = $subject['sub_marks'] !== null ? floatval($subject['sub_marks']) : 0;
        }

        echo json_encode([
            "success" => true, 
            "data" => $subjects
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error.", "error" => $e->getMessage()]);
    }
}

// ---------------------------------------------------------
// 2. POST Request: Insert or Update Subjects
// ---------------------------------------------------------
elseif ($method === 'POST') {
    
    // Expecting JSON: { "exam_set_id": 1, "subjects": [ { "id": 10, "subject_name": "Math", "sub_marks": 2.5 }, { "subject_name": "New Sub", "sub_marks": 1 } ] }
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['exam_set_id']) || !isset($data['subjects']) || !is_array($data['subjects'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing exam_set_id or subjects array."]);
        exit;
    }

    $exam_set_id = intval($data['exam_set_id']);
    $subjects = $data['subjects'];

    try {
        $pdo->beginTransaction();

        // Statements for Insert and Update
        $insertStmt = $pdo->prepare("INSERT INTO subjects (exam_set_id, subject_name, sub_marks) VALUES (?, ?, ?)");
        $updateStmt = $pdo->prepare("UPDATE subjects SET subject_name = ?, sub_marks = ? WHERE id = ? AND exam_set_id = ?");

        $processed_count = 0;

        foreach ($subjects as $subject) {
            $name = trim($subject['subject_name']);
            // Default marks to 0 if not provided
            $marks = isset($subject['sub_marks']) ? floatval($subject['sub_marks']) : 0;

            if (empty($name)) continue; // Skip empty names

            if (isset($subject['id']) && !empty($subject['id'])) {
                // --- UPDATE EXISTING SUBJECT ---
                $updateStmt->execute([$name, $marks, $subject['id'], $exam_set_id]);
            } else {
                // --- INSERT NEW SUBJECT ---
                $insertStmt->execute([$exam_set_id, $name, $marks]);
            }
            $processed_count++;
        }

        $pdo->commit();
        
        echo json_encode([
            "success" => true, 
            "message" => "Successfully processed $processed_count subjects (inserted/updated)."
        ]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Transaction failed.", "error" => $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use GET or POST."]);
}
?>
