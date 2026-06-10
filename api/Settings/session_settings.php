<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database configuration
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Get current session settings
        $stmt = $pdo->prepare("SELECT * FROM session_settings ORDER BY id DESC LIMIT 1");
        $stmt->execute();
        $settings = $stmt->fetch();
        
        if ($settings) {
            echo json_encode([
                'success' => true,
                'data' => [
                    'sessionTimeout' => intval($settings['session_timeout'])
                ]
            ]);
        } else {
            // Return default settings if none exist
            echo json_encode([
                'success' => true,
                'data' => [
                    'sessionTimeout' => 5
                ]
            ]);
        }
    } else if ($method === 'POST' || $method === 'PUT') {
        // Save session settings
        $json = file_get_contents('php://input');
        $input = json_decode($json, true);
        
        if ($input === null && json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON data provided']);
            exit();
        }
        
        if (!isset($input['sessionTimeout'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Session timeout is required']);
            exit();
        }
        
        $sessionTimeout = intval($input['sessionTimeout']);
        
        // Validate session timeout range (Allow 1-120 to match frontend)
        if ($sessionTimeout < 1 || $sessionTimeout > 120) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Session timeout must be between 1 and 120 minutes']);
            exit();
        }
        
        // Check if settings exist
        $stmt = $pdo->prepare("SELECT id FROM session_settings LIMIT 1");
        $stmt->execute();
        $exists = $stmt->fetch();
        
        if ($exists) {
            // Update existing settings
            $stmt = $pdo->prepare("UPDATE session_settings SET 
                session_timeout = ?, 
                updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?");
            $result = $stmt->execute([$sessionTimeout, $exists['id']]);
        } else {
            // Insert new settings
            $stmt = $pdo->prepare("INSERT INTO session_settings 
                (session_timeout) 
                VALUES (?)");
            $result = $stmt->execute([$sessionTimeout]);
        }
        
        if ($result) {
            echo json_encode([
                'success' => true, 
                'message' => 'Session timeout updated successfully',
                'data' => [
                    'sessionTimeout' => $sessionTimeout
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save settings']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
}
?>
