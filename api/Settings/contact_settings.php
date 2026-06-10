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
        // Get current contact settings
        $stmt = $pdo->prepare("SELECT * FROM contact_settings ORDER BY id DESC LIMIT 1");
        $stmt->execute();
        $settings = $stmt->fetch();
        
        if ($settings) {
            echo json_encode([
                'success' => true,
                'data' => [
                    'address' => $settings['address'] ?? 'ASANSOL, WESTBENGAL, PIN-713303',
                    'email' => $settings['email'] ?? 'info@anirbansacademy.com',
                    'whatsapp' => $settings['whatsapp'] ?? '+918670509456',
                    'monday_friday' => $settings['monday_friday'] ?? 'Monday - Friday: 9:00 AM - 6:00 PM',
                    'saturday' => $settings['saturday'] ?? 'Saturday: 10:00 AM - 4:00 PM',
                    'sunday' => $settings['sunday'] ?? 'Sunday: Closed'
                ]
            ]);
        } else {
            // Return default settings if none exist
            echo json_encode([
                'success' => true,
                'data' => [
                    'address' => 'ASANSOL, WESTBENGAL, PIN-713303',
                    'email' => 'info@anirbansacademy.com',
                    'whatsapp' => '+918670509456',
                    'monday_friday' => 'Monday - Friday: 9:00 AM - 6:00 PM',
                    'saturday' => 'Saturday: 10:00 AM - 4:00 PM',
                    'sunday' => 'Sunday: Closed'
                ]
            ]);
        }
    } else if ($method === 'POST' || $method === 'PUT') {
        // Save contact settings
        $input = json_decode(file_get_contents('php://input'), true);
        
        $address = $input['address'] ?? 'ASANSOL, WESTBENGAL, PIN-713303';
        $email = $input['email'] ?? 'info@anirbansacademy.com';
        $whatsapp = $input['whatsapp'] ?? '+918670509456';
        $mondayFriday = $input['monday_friday'] ?? 'Monday - Friday: 9:00 AM - 6:00 PM';
        $saturday = $input['saturday'] ?? 'Saturday: 10:00 AM - 4:00 PM';
        $sunday = $input['sunday'] ?? 'Sunday: Closed';
        
        // Check if settings exist
        $stmt = $pdo->prepare("SELECT id FROM contact_settings LIMIT 1");
        $stmt->execute();
        $exists = $stmt->fetch();
        
        if ($exists) {
            // Update existing settings
            $stmt = $pdo->prepare("UPDATE contact_settings SET 
                address = ?, 
                email = ?, 
                whatsapp = ?, 
                monday_friday = ?, 
                saturday = ?, 
                sunday = ?,
                updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?");
            $result = $stmt->execute([$address, $email, $whatsapp, $mondayFriday, $saturday, $sunday, $exists['id']]);
        } else {
            // Insert new settings
            $stmt = $pdo->prepare("INSERT INTO contact_settings 
                (address, email, whatsapp, monday_friday, saturday, sunday) 
                VALUES (?, ?, ?, ?, ?, ?)");
            $result = $stmt->execute([$address, $email, $whatsapp, $mondayFriday, $saturday, $sunday]);
        }
        
        if ($result) {
            echo json_encode([
                'success' => true, 
                'message' => 'Contact settings saved successfully',
                'data' => [
                    'address' => $address,
                    'email' => $email,
                    'whatsapp' => $whatsapp,
                    'monday_friday' => $mondayFriday,
                    'saturday' => $saturday,
                    'sunday' => $sunday
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save contact settings']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (PDOException $e) {
    error_log("Contact Settings Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
}
?>
