<?php
// api/get_exam_timing_details.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config.php'; // Ensure your database connection is included here

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    // Validate Input
    if (!isset($_GET['exam_set_id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "exam_set_id is required."]);
        exit;
    }

    $exam_set_id = intval($_GET['exam_set_id']);

    try {
        // ---------------------------------------------------------
        // PART 1: Fetch Overall Set Time
        // ---------------------------------------------------------
        $setQuery = "SELECT total_time_minutes FROM exam_sets WHERE id = ?";
        $stmtSet = $pdo->prepare($setQuery);
        $stmtSet->execute([$exam_set_id]);
        $setData = $stmtSet->fetch(PDO::FETCH_ASSOC);

        if (!$setData) {
            echo json_encode(["success" => false, "message" => "Exam Set not found."]);
            exit;
        }

        $overall_time = $setData['total_time_minutes'];

        // ---------------------------------------------------------
        // PART 2 & 3: Fetch Subjects for Subject-wise & Sectional Logic
        // ---------------------------------------------------------
        $subQuery = "SELECT id, subject_name, time_minutes, sectional_time_minutes, section_number 
                     FROM subjects 
                     WHERE exam_set_id = ? 
                     ORDER BY section_number ASC, id ASC";
        
        $stmtSub = $pdo->prepare($subQuery);
        $stmtSub->execute([$exam_set_id]);
        $subjects = $stmtSub->fetchAll(PDO::FETCH_ASSOC);

        // -- Process Data --
        $subject_list = [];
        $sections_map = [];
        
        // Accumulators for Totals
        $total_subject_wise_time = 0;
        $total_sectional_time = 0;

        foreach ($subjects as $row) {
            // A. Calculate Subject-wise Data
            $s_time = intval($row['time_minutes']);
            $total_subject_wise_time += $s_time;

            $subject_list[] = [
                "subject_id" => $row['id'],
                "subject_name" => $row['subject_name'],
                "time_allocated" => $row['time_minutes'] // Individual subject time
            ];

            // B. Prepare Sectional Data
            $sec_num = $row['section_number'];
            
            // Only consider valid section numbers (assuming > 0)
            if (!empty($sec_num)) {
                if (!isset($sections_map[$sec_num])) {
                    // Initialize this section group
                    $sec_time = intval($row['sectional_time_minutes']);
                    
                    $sections_map[$sec_num] = [
                        "section_number" => $sec_num,
                        "section_total_time" => $sec_time, 
                        "subjects_in_section" => []
                    ];
                }

                // Add subject to this specific section
                $sections_map[$sec_num]['subjects_in_section'][] = [
                    "subject_id" => $row['id'],
                    "subject_name" => $row['subject_name']
                ];
            }
        }

        // Calculate Total Sectional Time by summing unique sections
        foreach ($sections_map as $section) {
            $total_sectional_time += $section['section_total_time'];
        }

        // Re-index sections map to a clean array
        $sectional_data = array_values($sections_map);

        // ---------------------------------------------------------
        // Final Response Structure
        // ---------------------------------------------------------
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => [
                "exam_set_id" => $exam_set_id,
                
                // 1. Overall Time Logic
                "overall_timing" => [
                    "total_time_minutes" => $overall_time
                ],

                // 2. Subject-wise Time Logic
                "subject_wise_timing" => [
                    "total_calculated_subject_time" => $total_subject_wise_time, // <--- NEW TOTAL
                    "subjects" => $subject_list
                ],

                // 3. Sectional Time Logic
                "sectional_timing" => [
                    "total_calculated_sectional_time" => $total_sectional_time,    // <--- NEW TOTAL
                    "total_sections" => count($sectional_data),
                    "sections" => $sectional_data
                ]
            ]
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error.", "error" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
}
?>
