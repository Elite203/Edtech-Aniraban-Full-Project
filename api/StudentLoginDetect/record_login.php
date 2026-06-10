<?php
require_once '../config.php';
require_once '../vendor/autoload.php';

use Jenssegers\Agent\Agent;

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->student_id)) {
    $agent = new Agent();
    
    $ip = $_SERVER['REMOTE_ADDR'];
    // For local development
    if ($ip == '127.0.0.1' || $ip == '::1') {
        $ip = '8.8.8.8'; 
    }
    
    $city = 'Unknown';
    try {
        // Attempt using Stevebauman\Location if available correctly
        if (class_exists('Stevebauman\Location\Location')) {
            $location = new \Stevebauman\Location\Location();
            $position = $location->get($ip);
            if ($position) {
                $city = $position->cityName;
            }
        } else {
            // Fallback to a simple API call if the library is tricky
            $details = json_decode(file_get_contents("http://ip-api.com/json/{$ip}"));
            if ($details && $details->status == 'success') {
                $city = $details->city;
            }
        }
    } catch (\Exception $e) {
        // Silent fail for city
    }
    
    $browser = $agent->browser();
    $platform = $agent->platform();
    $device = $agent->device();
    
    // Create a more descriptive device string
    $deviceString = $device ? $device : ($agent->isDesktop() ? 'Desktop' : 'Mobile');
    $browserString = $browser . ' on ' . $platform;
    
    $isBot = $agent->isRobot() ? 1 : 0;
    
    try {
        $query = "INSERT INTO student_logins (student_id, ip_address, city, browser, device, is_bot) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$data->student_id, $ip, $city, $browserString, $deviceString, $isBot]);
        
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Student ID required"]);
}
?>
