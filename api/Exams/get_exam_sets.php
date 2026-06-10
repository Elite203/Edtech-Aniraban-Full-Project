<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $course_id = $_GET['course_id'];
    
    try {
        $stmt = $pdo->prepare("
            SELECT es.*, s.id as subject_id, s.subject_name
            FROM exam_sets es 
            LEFT JOIN subjects s ON es.id = s.exam_set_id 
            WHERE es.course_id = ? 
            ORDER BY es.set_number ASC, s.id ASC
        ");
        $stmt->execute([$course_id]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Group subjects by exam set ID
        $exam_sets_map = [];
        foreach ($result as $row) {
            $set_id = $row['id'];
            if (!isset($exam_sets_map[$set_id])) {
                $exam_sets_map[$set_id] = [
                    'id' => $row['id'],
                    'exam_name' => $row['exam_name'],
                    'set_number' => $row['set_number'],
                    'set_name' => $row['set_name'] ?? '',
                    'is_paid' => $row['is_paid'],
                    'total_time_minutes' => $row['total_time_minutes'],
                    'is_sectional_enabled' => $row['is_sectional_enabled'] ?? 0,
                    'subjects' => [],
                    'created_at' => $row['created_at']
                ];
            }
            
            // Add subject with both id and name if it exists
            if ($row['subject_id'] && $row['subject_name']) {
                $exam_sets_map[$set_id]['subjects'][] = [
                    'id' => $row['subject_id'],
                    'name' => $row['subject_name']
                ];
            }
        }
        
        $exam_sets = array_values($exam_sets_map);
        
        echo json_encode(['success' => true, 'exam_sets' => $exam_sets]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to fetch exam sets']);
    }
}
?>
