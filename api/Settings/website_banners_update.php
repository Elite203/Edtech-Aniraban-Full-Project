<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

try {
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get banner image based on banner_name parameter
        $banner_name = $_GET['banner_name'] ?? 'hero_banner';
        $column = $banner_name === 'android_banner' ? 'android_banner' : 
                 ($banner_name === 'about_us_banner' ? 'about_us_banner' : 'hero_banner');
        
        $stmt = $pdo->prepare("SELECT {$column} as banner_data, image_type, image_name FROM website_banners ORDER BY id DESC LIMIT 1");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result && $result['banner_data']) {
            // Return image as base64
            $base64_image = base64_encode($result['banner_data']);
            echo json_encode([
                'success' => true,
                'data' => [
                    'image_data' => 'data:' . $result['image_type'] . ';base64,' . $base64_image,
                    'image_name' => $result['image_name'],
                    'image_type' => $result['image_type']
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Banner not found'
            ]);
        }
    } 
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Update banner image
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode([
                'success' => false,
                'message' => 'No image uploaded or upload error'
            ]);
            exit;
        }
        
        $file = $_FILES['image'];
        $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        if (!in_array($file['type'], $allowed_types)) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
            ]);
            exit;
        }
        
        // Read file content
        $image_data = file_get_contents($file['tmp_name']);
        $image_type = $file['type'];
        $image_name = $file['name'];
        
        // Get banner type from POST data
        $banner_name = $_POST['banner_name'] ?? 'hero_banner';
        $column = $banner_name === 'android_banner' ? 'android_banner' : 
                 ($banner_name === 'about_us_banner' ? 'about_us_banner' : 'hero_banner');
        
        // Check if banner exists
        $stmt = $pdo->prepare("SELECT id FROM website_banners LIMIT 1");
        $stmt->execute();
        $exists = $stmt->fetch();
        
        if ($exists) {
            // Update existing banner
            $stmt = $pdo->prepare("UPDATE website_banners SET {$column} = ?, image_type = ?, image_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $result = $stmt->execute([$image_data, $image_type, $image_name, $exists['id']]);
        } else {
            // Insert new banner - initialize specific columns
            if ($banner_name === 'android_banner') {
                $stmt = $pdo->prepare("INSERT INTO website_banners (android_banner, image_type, image_name) VALUES (?, ?, ?)");
            } elseif ($banner_name === 'about_us_banner') {
                $stmt = $pdo->prepare("INSERT INTO website_banners (about_us_banner, image_type, image_name) VALUES (?, ?, ?)");
            } else {
                $stmt = $pdo->prepare("INSERT INTO website_banners (hero_banner, image_type, image_name) VALUES (?, ?, ?)");
            }
            $result = $stmt->execute([$image_data, $image_type, $image_name]);
        }
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Banner updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update banner'
            ]);
        }
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
