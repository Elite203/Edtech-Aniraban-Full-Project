<?php
require_once '../config.php';
session_start();

header('Content-Type: application/json');

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

try {
    $adminId = $_SESSION['admin_id'];
    $currentPassword = trim($data['currentPassword'] ?? '');
    $newPassword = trim($data['newPassword'] ?? '');
    $confirmPassword = trim($data['confirmPassword'] ?? '');

    // Validate input
    if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }

    // Check if new password and confirm password match
    if ($newPassword !== $confirmPassword) {
        echo json_encode(['success' => false, 'message' => 'New password and confirm password do not match']);
        exit;
    }

    // Check password length
    if (strlen($newPassword) < 6) {
        echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters long']);
        exit;
    }

    // Get current password from database
    $stmt = $pdo->prepare("SELECT password FROM admins WHERE id = ?");
    $stmt->execute([$adminId]);
    $admin = $stmt->fetch();

    if (!$admin) {
        echo json_encode(['success' => false, 'message' => 'Admin not found']);
        exit;
    }

    // Verify current password
    if ($admin['password'] !== $currentPassword) {
        echo json_encode(['success' => false, 'message' => 'Current password did not match']);
        exit;
    }

    // Update password
    $updateStmt = $pdo->prepare("UPDATE admins SET password = ?, updated_at = NOW() WHERE id = ?");
    $updateStmt->execute([$newPassword, $adminId]);

    echo json_encode([
        'success' => true,
        'message' => 'Password updated successfully'
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
