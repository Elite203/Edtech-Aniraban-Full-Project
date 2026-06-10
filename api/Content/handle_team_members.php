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
error_log('Team Members API - Method: ' . $_SERVER['REQUEST_METHOD']);
error_log('Team Members API - Request URI: ' . $_SERVER['REQUEST_URI']);

require_once '../config.php';

// Check if table exists
try {
    $stmt = $pdo->query("SHOW TABLES LIKE 'team_members'");
    if ($stmt->rowCount() == 0) {
        error_log('Team Members API Error: team_members table does not exist');
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database table not found. Please create the team_members table first.']);
        exit;
    }
    error_log('Team Members API - Table exists, continuing...');
} catch (Exception $e) {
    error_log('Team Members API Error: Cannot check table existence - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            handleGet();
            break;
        case 'POST':
            handlePost();
            break;
        case 'PUT':
            handlePut();
            break;
        case 'DELETE':
            handleDelete();
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    error_log('Team Members API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
}

function handleGet() {
    global $pdo;
    
    try {
        error_log('Team Members API - Executing GET request');
        
        $stmt = $pdo->prepare("SELECT * FROM team_members ORDER BY display_order ASC, created_at ASC");
        $stmt->execute();
        $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log('Team Members API - Found ' . count($members) . ' members in database');
        
        // Convert image data to base64 for display
           foreach ($members as &$member) {
        // Check if image_data exists and is not null
        if (isset($member['image_data']) && $member['image_data']) {
            // Create a Base64 data URL for the image
            // This can be used directly in an HTML <img> src attribute
            $member['image_base64'] = 'data:' . $member['image_type'] . ';base64,' . base64_encode($member['image_data']);
        } else {
            $member['image_base64'] = null;
        }
        // Unset the raw binary data to avoid sending large, unusable data in the JSON
        unset($member['image_data']);
    }
    
    // Send the successful JSON response
    echo json_encode([
        'success' => true,
        'count' => count($members),
        'data' => $members
    ]);

} catch (PDOException $e) {
    // Handle database errors
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'Database error: Failed to fetch team members.',
        'error' => $e->getMessage() // Optional: for debugging
    ]);
}
}

function handlePost() {
    global $pdo;
    
    try {
        error_log('Team Members API - Executing POST request');
        error_log('Team Members API - POST data: ' . print_r($_POST, true));
        error_log('Team Members API - FILES data: ' . print_r($_FILES, true));
        
        $name = $_POST['name'] ?? '';
        $role = $_POST['role'] ?? '';
        $bio = $_POST['bio'] ?? '';
        $display_order = $_POST['display_order'] ?? 0;
        
        if (empty($name) || empty($role)) {
            error_log('Team Members API - Validation failed: Name or role missing');
            echo json_encode(['success' => false, 'message' => 'Name and role are required']);
            return;
        }
        
        $image_data = null;
        $image_type = null;
        $image_size = null;
        
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            error_log('Team Members API - Processing image upload');
            
            $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            $file_type = $_FILES['image']['type'];
            
            if (!in_array($file_type, $allowed_types)) {
                error_log('Team Members API - Invalid file type: ' . $file_type);
                echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPEG, PNG, and WebP are allowed.']);
                return;
            }
            
            if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
                error_log('Team Members API - File size too large: ' . $_FILES['image']['size']);
                echo json_encode(['success' => false, 'message' => 'File size too large. Maximum size is 5MB.']);
                return;
            }
            
            $image_data = file_get_contents($_FILES['image']['tmp_name']);
            $image_type = $file_type;
            $image_size = $_FILES['image']['size'];
            
            error_log('Team Members API - Image processed successfully, size: ' . $image_size . ' bytes');
        }
        
        $stmt = $pdo->prepare("INSERT INTO team_members (name, role, bio, image_data, image_type, image_size, display_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$name, $role, $bio, $image_data, $image_type, $image_size, $display_order]);
        
        $member_id = $pdo->lastInsertId();
        
        error_log('Team Members API - Member added successfully with ID: ' . $member_id);
        
        echo json_encode([
            'success' => true,
            'message' => 'Team member added successfully',
            'member_id' => $member_id
        ]);
    } catch (PDOException $e) {
        error_log('Add team member error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to add team member: ' . $e->getMessage()]);
    }
}

function handlePut() {
    global $pdo;
    
    try {
        parse_str(file_get_contents("php://input"), $data);
        
        $id = $data['id'] ?? '';
        $name = $data['name'] ?? '';
        $role = $data['role'] ?? '';
        $bio = $data['bio'] ?? '';
        $display_order = $data['display_order'] ?? 0;
        
        if (empty($id) || empty($name) || empty($role)) {
            echo json_encode(['success' => false, 'message' => 'ID, name and role are required']);
            return;
        }
        
        $stmt = $pdo->prepare("UPDATE team_members SET name = ?, role = ?, bio = ?, display_order = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$name, $role, $bio, $display_order, $id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Team member updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Team member not found or no changes made']);
        }
    } catch (PDOException $e) {
        error_log('Update team member error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to update team member']);
    }
}

function handleDelete() {
    global $pdo;
    
    try {
        parse_str(file_get_contents("php://input"), $data);
        $id = $data['id'] ?? '';
        
        if (empty($id)) {
            echo json_encode(['success' => false, 'message' => 'Member ID is required']);
            return;
        }
        
        $stmt = $pdo->prepare("DELETE FROM team_members WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Team member deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Team member not found']);
        }
    } catch (PDOException $e) {
        error_log('Delete team member error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to delete team member']);
    }
}
?>
