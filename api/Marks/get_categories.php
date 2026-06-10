<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

try {
    // The user mentioned get_course_categories.php but category table has SC, ST, OBC, EWS, PWD, General columns.
    // Let's return the columns from category table as categories.
    $categories = ['General', 'OBC', 'SC', 'ST', 'EWS', 'PWD'];
    echo json_encode(['success' => true, 'categories' => $categories]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
