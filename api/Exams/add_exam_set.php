<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get input data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
if (!isset($data['exam_id']) || !isset($data['set_number']) || !isset($data['set_name']) || !isset($data['subjects']) || !isset($data['is_paid'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$exam_id = (int) $data['exam_id'];
$set_number = (int) $data['set_number'];
$set_name = trim($data['set_name']);
$subjects = $data['subjects'];
$is_paid = (int) $data['is_paid'];

// Validate set_name
if (empty($set_name)) {
    echo json_encode(['success' => false, 'message' => 'Set name is required']);
    exit;
}

// Validate subjects array
if (!is_array($subjects) || empty($subjects)) {
    echo json_encode(['success' => false, 'message' => 'Subjects must be a non-empty array']);
    exit;
}

// Filter out empty subjects and extract subject names if they are objects
$subjects = array_filter($subjects, function($subject) {
    if (is_object($subject)) {
        return !empty($subject->name ?? $subject->subject_name ?? '');
    }
    return !empty(trim((string)$subject));
});

// Map subjects to extract names
$subjects = array_map(function($subject) {
    if (is_object($subject)) {
        return $subject->name ?? $subject->subject_name ?? '';
    }
    return trim((string)$subject);
}, $subjects);

if (empty($subjects)) {
    echo json_encode(['success' => false, 'message' => 'At least one subject is required']);
    exit;
}

try {
    // Check if exam exists
    $checkExamStmt = $pdo->prepare("SELECT id, course_id FROM exam_sets WHERE id = ?");
    $checkExamStmt->execute([$exam_id]);
    $examData = $checkExamStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$examData) {
        echo json_encode(['success' => false, 'message' => 'Exam not found']);
        exit;
    }
    
    $course_id = $examData['course_id'];
    
    // Check if set number already exists for this exam
    $checkSetStmt = $pdo->prepare("SELECT id FROM exam_sets WHERE course_id = ? AND set_number = ? AND exam_name = (SELECT exam_name FROM exam_sets WHERE id = ?)");
    $checkSetStmt->execute([$course_id, $set_number, $exam_id]);
    $setExists = $checkSetStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($setExists) {
        echo json_encode(['success' => false, 'message' => 'Set number already exists for this exam']);
        exit;
    }
    
    // Get exam name from the original exam
    $getExamStmt = $pdo->prepare("SELECT exam_name FROM exam_sets WHERE id = ?");
    $getExamStmt->execute([$exam_id]);
    $examNameData = $getExamStmt->fetch(PDO::FETCH_ASSOC);
    $exam_name = $examNameData['exam_name'];
    
    // Begin transaction
    $pdo->beginTransaction();
    
    // Insert new exam set
    $insertStmt = $pdo->prepare("INSERT INTO exam_sets (course_id, exam_name, set_number, set_name, is_paid) VALUES (?, ?, ?, ?, ?)");

    if ($insertStmt->execute([$course_id, $exam_name, $set_number, $set_name, $is_paid])) {
        $examSetId = $pdo->lastInsertId();
        
        // Insert subjects
        $subjectStmt = $pdo->prepare("INSERT INTO subjects (exam_set_id, subject_name) VALUES (?, ?)");
        $subjectsInserted = true;
        
        foreach ($subjects as $subject) {
            $subjectName = '';
            if (is_object($subject)) {
                $subjectName = $subject->name ?? $subject->subject_name ?? '';
            } else {
                $subjectName = (string)$subject;
            }
            
            if (!$subjectStmt->execute([$examSetId, trim($subjectName)])) {
                $subjectsInserted = false;
                break;
            }
        }
        
        if ($subjectsInserted) {
            $pdo->commit();
            echo json_encode([
                'success' => true, 
                'message' => 'Exam set and subjects added successfully',
                'set_id' => $examSetId
            ]);
            exit;
        } else {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Failed to add subjects']);
            exit;
        }
    } else {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Failed to add exam set']);
        exit;
    }
    
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    exit;
}
?>
