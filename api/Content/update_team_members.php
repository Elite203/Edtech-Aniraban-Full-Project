<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Start output buffering to prevent any unwanted output
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Log request details
error_log('Update Team Members API - Method: ' . $_SERVER['REQUEST_METHOD']);
error_log('Update Team Members API - Request URI: ' . $_SERVER['REQUEST_URI']);

require_once '../config.php';

// Check if table exists
try {
    $stmt = $pdo->query("SHOW TABLES LIKE 'team_members'");
    if ($stmt->rowCount() == 0) {
        error_log('Update Team Members API Error: team_members table does not exist');
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database table not found. Please create the team_members table first.']);
        exit;
    }
    error_log('Update Team Members API - Table exists, continuing...');
} catch (Exception $e) {
    error_log('Update Team Members API Error: Cannot check table existence - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'POST':
            handleUpdate();
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed. Only POST method is supported for updates.']);
    }
} catch (Exception $e) {
    error_log('Update Team Members API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
}

function handleUpdate() {
    global $pdo;
    
    try {
        error_log('Update Team Members API - Executing POST request for update');
        error_log('Update Team Members API - POST data: ' . print_r($_POST, true));
        error_log('Update Team Members API - FILES data: ' . print_r($_FILES, true));
        
        $id = $_POST['id'] ?? '';
        $name = $_POST['name'] ?? '';
        $role = $_POST['role'] ?? '';
        $bio = $_POST['bio'] ?? '';
        $display_order = $_POST['display_order'] ?? 0;
        
        if (empty($id) || empty($name) || empty($role)) {
            error_log('Update Team Members API - Validation failed: ID, name or role missing');
            echo json_encode(['success' => false, 'message' => 'ID, name and role are required']);
            return;
        }
        
        // First, check if the member exists
        $checkStmt = $pdo->prepare("SELECT id FROM team_members WHERE id = ?");
        $checkStmt->execute([$id]);
        
        if ($checkStmt->rowCount() === 0) {
            error_log('Update Team Members API - Member not found with ID: ' . $id);
            echo json_encode(['success' => false, 'message' => 'Team member not found']);
            return;
        }
        
        $image_data = null;
        $image_type = null;
        $image_size = null;
        $updateImage = false;
        
        // Check if new image is uploaded
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            error_log('Update Team Members API - Processing image upload');
            
            $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            $file_type = $_FILES['image']['type'];
            
            if (!in_array($file_type, $allowed_types)) {
                error_log('Update Team Members API - Invalid file type: ' . $file_type);
                echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPEG, PNG, and WebP are allowed.']);
                return;
            }
            
            if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
                error_log('Update Team Members API - File size too large: ' . $_FILES['image']['size']);
                echo json_encode(['success' => false, 'message' => 'File size too large. Maximum size is 5MB.']);
                return;
            }
            
            $image_data = file_get_contents($_FILES['image']['tmp_name']);
            $image_type = $file_type;
            $image_size = $_FILES['image']['size'];
            $updateImage = true;
            
            error_log('Update Team Members API - Image processed successfully, size: ' . $image_size . ' bytes');
        }
        
        // Update query based on whether image is being updated
        if ($updateImage) {
            $stmt = $pdo->prepare("UPDATE team_members SET name = ?, role = ?, bio = ?, image_data = ?, image_type = ?, image_size = ?, display_order = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$name, $role, $bio, $image_data, $image_type, $image_size, $display_order, $id]);
            error_log('Update Team Members API - Updated member with new image');
        } else {
            $stmt = $pdo->prepare("UPDATE team_members SET name = ?, role = ?, bio = ?, display_order = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$name, $role, $bio, $display_order, $id]);
            error_log('Update Team Members API - Updated member without changing image');
        }
        
        if ($stmt->rowCount() > 0 || $updateImage) {
            error_log('Update Team Members API - Member updated successfully with ID: ' . $id);
            echo json_encode([
                'success' => true,
                'message' => 'Team member updated successfully',
                'member_id' => $id
            ]);
        } else {
            error_log('Update Team Members API - No changes made for member ID: ' . $id);
            echo json_encode(['success' => false, 'message' => 'No changes made to team member']);
        }
    } catch (PDOException $e) {
        error_log('Update Team Members API error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to update team member: ' . $e->getMessage()]);
    }
}
?>
