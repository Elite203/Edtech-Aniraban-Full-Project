<?php
// --- delete_question.php ---
// Deletes a question or a passage
// Expects 'application/json' input: { "id": 123 }

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = $data['id'] ?? null;
    if (empty($id)) {
        throw new Exception("Missing required field: id");
    }

    $pdo->beginTransaction();

    // 1. Try to delete from passages (sub-questions should be deleted via ON DELETE CASCADE if set, but we'll do it manually just in case)
    // First, check if it's a passage
    $stmtP = $pdo->prepare("SELECT id FROM passages WHERE id = ?");
    $stmtP->execute([$id]);
    if ($stmtP->rowCount() > 0) {
        // It's a passage. Delete sub-questions first
        $stmtS = $pdo->prepare("DELETE FROM questions WHERE passage_id = ?");
        $stmtS->execute([$id]);
        
        // Delete the passage
        $stmtD = $pdo->prepare("DELETE FROM passages WHERE id = ?");
        $stmtD->execute([$id]);
        
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Passage and its questions deleted successfully']);
        exit;
    }

    // 2. If not a passage, try to delete from questions (normal question)
    $stmtQ = $pdo->prepare("DELETE FROM questions WHERE id = ?");
    $stmtQ->execute([$id]);

    if ($stmtQ->rowCount() > 0) {
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Question deleted successfully']);
    } else {
        throw new Exception("Item not found or could not be deleted.");
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) { $pdo->rollBack(); }
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
