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
        // Get current footer settings
        $stmt = $pdo->prepare("SELECT * FROM footer_settings ORDER BY id DESC LIMIT 1");
        $stmt->execute();
        $settings = $stmt->fetch();
        
        if ($settings) {
            echo json_encode([
                'success' => true,
                'data' => [
                    'site_name' => $settings['site_name'] ?? "ANIRBAN'S ACADEMY",
                    'site_description' => $settings['site_description'] ?? "Your path to success is to just built your concept. Don't rush towards the rules.",
                    'address' => $settings['address'] ?? 'ASANSOL, WESTBENGAL, PIN-713303',
                    'email' => $settings['email'] ?? '',
                    'whatsapp' => $settings['whatsapp'] ?? '',
                    'facebook' => $settings['facebook'] ?? '',
                    'twitter' => $settings['twitter'] ?? '',
                    'instagram' => $settings['instagram'] ?? '',
                    'youtube' => $settings['youtube'] ?? '',
                    'telegram' => $settings['telegram'] ?? '',
                    'telegram_test_link' => $settings['telegram_test_link'] ?? ''
                ]
            ]);
        } else {
            // Return default settings if none exist
            echo json_encode([
                'success' => true,
                'data' => [
                    'site_name' => "ANIRBAN'S ACADEMY",
                    'site_description' => "Your path to success is to just built your concept. Don't rush towards the rules.",
                    'address' => 'ASANSOL, WESTBENGAL, PIN-713303',
                    'email' => '',
                    'whatsapp' => '',
                    'facebook' => '',
                    'twitter' => '',
                    'instagram' => '',
                    'youtube' => '',
                    'telegram' => '',
                    'telegram_test_link' => ''
                ]
            ]);
        }
    } else if ($method === 'POST' || $method === 'PUT') {
        // Save footer settings
        $input = json_decode(file_get_contents('php://input'), true);
        
        $siteName = $input['site_name'] ?? "ANIRBAN'S ACADEMY";
        $siteDescription = $input['site_description'] ?? "Your path to success is to just built your concept. Don't rush towards the rules.";
        $address = $input['address'] ?? 'ASANSOL, WESTBENGAL, PIN-713303';
        $email = $input['email'] ?? '';
        $whatsapp = $input['whatsapp'] ?? '';
        $facebook = $input['facebook'] ?? '';
        $twitter = $input['twitter'] ?? '';
        $instagram = $input['instagram'] ?? '';
        $youtube = $input['youtube'] ?? '';
        $telegram = $input['telegram'] ?? '';
        $telegramTestLink = $input['telegram_test_link'] ?? '';
        
        // Check if settings exist
        $stmt = $pdo->prepare("SELECT id FROM footer_settings LIMIT 1");
        $stmt->execute();
        $exists = $stmt->fetch();
        
        if ($exists) {
            // Update existing settings
            $stmt = $pdo->prepare("UPDATE footer_settings SET 
                site_name = ?, 
                site_description = ?, 
                address = ?, 
                email = ?, 
                whatsapp = ?, 
                facebook = ?, 
                twitter = ?, 
                instagram = ?, 
                youtube = ?, 
                telegram = ?,
                telegram_test_link = ?,
                updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?");
            $result = $stmt->execute([$siteName, $siteDescription, $address, $email, $whatsapp, $facebook, $twitter, $instagram, $youtube, $telegram, $telegramTestLink, $exists['id']]);
        } else {
            // Insert new settings
            $stmt = $pdo->prepare("INSERT INTO footer_settings 
                (site_name, site_description, address, email, whatsapp, facebook, twitter, instagram, youtube, telegram, telegram_test_link) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $result = $stmt->execute([$siteName, $siteDescription, $address, $email, $whatsapp, $facebook, $twitter, $instagram, $youtube, $telegram, $telegramTestLink]);
        }
        
        if ($result) {
            echo json_encode([
                'success' => true, 
                'message' => 'Footer settings saved successfully',
                'data' => [
                    'site_name' => $siteName,
                    'site_description' => $siteDescription,
                    'address' => $address,
                    'email' => $email,
                    'whatsapp' => $whatsapp,
                    'facebook' => $facebook,
                    'twitter' => $twitter,
                    'instagram' => $instagram,
                    'youtube' => $youtube,
                    'telegram' => $telegram,
                    'telegram_test_link' => $telegramTestLink
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save footer settings']);
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
