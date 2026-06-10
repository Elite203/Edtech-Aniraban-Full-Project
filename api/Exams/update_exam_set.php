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
if (!isset($data['id']) || !isset($data['set_number']) || !isset($data['set_name']) || !isset($data['subjects']) || !isset($data['is_paid'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$set_id = (int) $data['id'];
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

if (empty($subjects)) {
    echo json_encode(['success' => false, 'message' => 'At least one subject is required']);
    exit;
}

try {
    // Check if exam set exists
    $checkSetStmt = $pdo->prepare("SELECT id, course_id FROM exam_sets WHERE id = ?");
    $checkSetStmt->execute([$set_id]);
    $setData = $checkSetStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$setData) {
        echo json_encode(['success' => false, 'message' => 'Exam set not found']);
        exit;
    }
    
    // Begin transaction
    $pdo->beginTransaction();
    
    // Update exam set
    $updateSetStmt = $pdo->prepare("UPDATE exam_sets SET set_number = ?, set_name = ?, is_paid = ? WHERE id = ?");

    if ($updateSetStmt->execute([$set_number, $set_name, $is_paid, $set_id])) {
        // Fetch existing subjects for this exam set
        $existingSubjectsStmt = $pdo->prepare("SELECT id, subject_name FROM subjects WHERE exam_set_id = ? ORDER BY id ASC");
        $existingSubjectsStmt->execute([$set_id]);
        $existingSubjects = $existingSubjectsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Create a map of existing subject names to IDs
        $existingSubjectMap = [];
        foreach ($existingSubjects as $existingSubject) {
            $existingSubjectMap[strtoupper(trim($existingSubject['subject_name']))] = $existingSubject['id'];
        }
        
        // Normalize new subjects
        $newSubjectNames = [];
        foreach ($subjects as $subject) {
            $subjectName = '';
            if (is_object($subject)) {
                $subjectName = $subject->name ?? $subject->subject_name ?? '';
            } else {
                $subjectName = (string)$subject;
            }
            $normalizedName = strtoupper(trim($subjectName));
            if (!empty($normalizedName)) {
                $newSubjectNames[$normalizedName] = trim($subjectName);
            }
        }
        
        // Find subjects to delete (existing but not in new list)
        $subjectsToDelete = [];
        foreach ($existingSubjectMap as $existingName => $existingId) {
            if (!isset($newSubjectNames[$existingName])) {
                $subjectsToDelete[] = $existingId;
            }
        }
        
        // Delete only subjects that are not in the new list
        $subjectsDeleted = true;
        if (!empty($subjectsToDelete)) {
            $placeholders = implode(',', array_fill(0, count($subjectsToDelete), '?'));
            $deleteSubjectsStmt = $pdo->prepare("DELETE FROM subjects WHERE id IN ($placeholders)");
            $subjectsDeleted = $deleteSubjectsStmt->execute($subjectsToDelete);
        }
        
        if ($subjectsDeleted) {
            // Insert only new subjects (those not already existing)
            $subjectStmt = $pdo->prepare("INSERT INTO subjects (exam_set_id, subject_name) VALUES (?, ?)");
            $subjectsInserted = true;
            
            foreach ($newSubjectNames as $normalizedName => $originalName) {
                // Only insert if this subject doesn't already exist
                if (!isset($existingSubjectMap[$normalizedName])) {
                    if (!$subjectStmt->execute([$set_id, $originalName])) {
                        $subjectsInserted = false;
                        break;
                    }
                }
            }
            
            if ($subjectsInserted) {
                $pdo->commit();
                echo json_encode([
                    'success' => true, 
                    'message' => 'Exam set updated successfully'
                ]);
            } else {
                $pdo->rollBack();
                echo json_encode(['success' => false, 'message' => 'Failed to update subjects']);
            }
        } else {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Failed to delete old subjects']);
        }
    } else {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Failed to update exam set']);
    }
    
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
