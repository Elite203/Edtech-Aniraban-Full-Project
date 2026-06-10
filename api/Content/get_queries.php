<?php
require_once '../config.php';

try {
    $query = "SELECT id, first_name, last_name, email, subject, message, created_at, COALESCE(state, 'pending') as state FROM contact_page ORDER BY created_at DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    
    $queries = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $queries
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching queries: ' . $e->getMessage()
    ]);
}
?>
