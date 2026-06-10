<?php
// api/get_set_stats.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config.php'; 

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    if (!isset($_GET['exam_set_id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "exam_set_id is required."]);
        exit;
    }

    $exam_set_id = intval($_GET['exam_set_id']);

    try {
        // UPDATED QUERY:
        // We calculate normal questions and sub-questions separately to ensure
        // all answerable items are counted, matching the Subject Overview logic.
        $query = "
            SELECT 
                s.subject_name, 
                (SELECT COUNT(*) FROM questions WHERE subject_id = s.id AND passage_id IS NULL) as normal_count,
                (SELECT COUNT(*) FROM questions WHERE subject_id = s.id AND passage_id IS NOT NULL) as sub_count,
                (SELECT COUNT(*) FROM passages WHERE subject_id = s.id) as passage_count
            FROM subjects s
            WHERE s.exam_set_id = ?
            GROUP BY s.id, s.subject_name
        ";

        $stmt = $pdo->prepare($query);
        $stmt->execute([$exam_set_id]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $total_questions = 0;
        $formatted_subjects = [];

        foreach ($results as $row) {
            // Total answerable questions = normal + sub-questions
            $count = intval($row['normal_count']) + intval($row['sub_count']);
            $total_questions += $count;

            $formatted_subjects[] = [
                "subject_name" => $row['subject_name'],
                "count" => $count,
                "normal_count" => intval($row['normal_count']),
                "sub_count" => intval($row['sub_count']),
                "passage_count" => intval($row['passage_count'])
            ];
        }

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => [
                "exam_set_id" => $exam_set_id,
                "total_subjects" => count($results),
                "total_questions" => $total_questions,
                "subject_breakdown" => $formatted_subjects
            ]
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "message" => "Database error.", 
            "error" => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
}
?>
