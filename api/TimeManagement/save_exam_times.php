<?php
// save_exam_times.php
// Saves either the total time for a set OR the individual times for subjects in that set.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config.php';
// require_once '../Auth/admin_auth.php'; // Uncomment for production

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $exam_set_id = $input['exam_set_id'] ?? null;
    $total_time = $input['total_time'] ?? null;
    $is_sectional_enabled = $input['is_sectional_enabled'] ?? 0;
    $subject_times = $input['subject_times'] ?? null; // Expects an array: [{id: 1, time: 20, sectional_time: 15}, ...]

    if (empty($exam_set_id)) {
        http_response_code(400);
        throw new Exception("Missing required field: exam_set_id");
    }

    $pdo->beginTransaction();

    // Update is_sectional_enabled for the set
    $stmt = $pdo->prepare("UPDATE exam_sets SET is_sectional_enabled = ? WHERE id = ?");
    $stmt->execute([$is_sectional_enabled, $exam_set_id]);

    if ($total_time !== null) {
        // --- Save Total Time ---
        // We set subject-wise times to NULL to avoid confusion
        $stmt = $pdo->prepare("UPDATE exam_sets SET total_time_minutes = ? WHERE id = ?");
        $stmt->execute([$total_time, $exam_set_id]);
        
        $stmt = $pdo->prepare("UPDATE subjects SET time_minutes = NULL, sectional_time_minutes = NULL WHERE exam_set_id = ?");
        $stmt->execute([$exam_set_id]);
        
        $message = "Total time saved successfully.";

    } elseif ($subject_times !== null && is_array($subject_times)) {
        // --- Save Subject-wise or Sectional Times ---
        // We set total time to NULL to avoid confusion
        $stmt = $pdo->prepare("UPDATE exam_sets SET total_time_minutes = NULL WHERE id = ?");
        $stmt->execute([$exam_set_id]);

        $updateSubjectStmt = $pdo->prepare("UPDATE subjects SET time_minutes = ?, sectional_time_minutes = ?, section_number = ? WHERE id = ? AND exam_set_id = ?");
        
        foreach ($subject_times as $subject) {
            $subject_id = $subject['id'] ?? null;
            $time = $subject['time'] ?? null;
            $sectional_time = $subject['sectional_time'] ?? null;
            $section_number = $subject['section_number'] ?? null;
            
            if ($subject_id) {
                $updateSubjectStmt->execute([
                    $time !== null && is_numeric($time) ? $time : null,
                    $sectional_time !== null && is_numeric($sectional_time) ? $sectional_time : null,
                    $section_number !== null && is_numeric($section_number) ? $section_number : null,
                    $subject_id,
                    $exam_set_id
                ]);
            }
        }
        $message = $is_sectional_enabled ? "Sectional times saved successfully." : "Subject-wise times saved successfully.";

    } else {
        throw new Exception("Invalid data: Must provide either 'total_time' or a 'subject_times' array.");
    }

    $pdo->commit();

    echo json_encode(['success' => true, 'message' => $message]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
?>
