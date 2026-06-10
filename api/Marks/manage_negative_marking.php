<?php
// api/manage_negative_marking.php

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
// 1. GET Request: Fetch Negative and Positive Marking for a Set
// ---------------------------------------------------------
if ($method === 'GET') {
    
    if (!isset($_GET['exam_set_id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "exam_set_id is required."]);
        exit;
    }

    $exam_set_id = intval($_GET['exam_set_id']);

    try {
        $query = "SELECT negative_marking, positive_marking FROM exam_sets WHERE id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$exam_set_id]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            http_response_code(200);
            echo json_encode([
                "success" => true, 
                "data" => [
                    "exam_set_id" => $exam_set_id,
                    "negative_marking" => $result['negative_marking'] !== null ? floatval($result['negative_marking']) : 0,
                    "positive_marking" => $result['positive_marking'] !== null ? floatval($result['positive_marking']) : 0
                ]
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Exam Set not found."]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error.", "error" => $e->getMessage()]);
    }
}

// ---------------------------------------------------------
// 2. POST Request: Insert / Update Negative and Positive Marking
// ---------------------------------------------------------
elseif ($method === 'POST') {
    
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->exam_set_id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required field: exam_set_id."]);
        exit;
    }

    $exam_set_id = intval($data->exam_set_id);
    $negative_marking = isset($data->negative_marking) ? floatval($data->negative_marking) : null;
    $positive_marking = isset($data->positive_marking) ? floatval($data->positive_marking) : null;

    try {
        // Build the UPDATE query dynamically based on what's provided
        $updateFields = [];
        $updateParams = [];
        
        if ($negative_marking !== null) {
            $updateFields[] = "negative_marking = ?";
            $updateParams[] = $negative_marking;
        }
        
        if ($positive_marking !== null) {
            $updateFields[] = "positive_marking = ?";
            $updateParams[] = $positive_marking;
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "No marking values provided to update."]);
            exit;
        }
        
        $updateParams[] = $exam_set_id;
        $query = "UPDATE exam_sets SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $stmt = $pdo->prepare($query);
        
        if ($stmt->execute($updateParams)) {
            
            if ($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode(["success" => true, "message" => "Marking values updated successfully."]);
            } else {
                $check = $pdo->prepare("SELECT id FROM exam_sets WHERE id = ?");
                $check->execute([$exam_set_id]);
                if($check->fetch()) {
                    http_response_code(200);
                    echo json_encode(["success" => true, "message" => "Values saved (no changes made)."]);
                } else {
                    http_response_code(404);
                    echo json_encode(["success" => false, "message" => "Exam Set ID not found."]);
                }
            }

        } else {
            throw new Exception("Query execution failed.");
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Update failed.", "error" => $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use GET or POST."]);
}
?>
