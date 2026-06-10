<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!function_exists('console_log')) {
    function console_log($message) {
        error_log('[STUDENT_ACTIVITY] ' . $message);
    }
}

require_once '../config.php';
require_once '../Utils/getinfo.php'; // Include the file to use its function

ini_set('display_errors', 0); // Keep 0 for production to prevent breaking JSON
error_reporting(E_ALL);

try {

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Increased limit to 500 and querying from student_logins
        $stmt = $pdo->prepare("
            SELECT sl.*, s.first_name, s.last_name, s.email
            FROM student_logins sl
            LEFT JOIN students s ON sl.student_id = s.id
            ORDER BY sl.login_at DESC
            LIMIT 500
        ");
        $stmt->execute();
        
        $formattedActivities = [];
        while ($activity = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $loginTime = $activity['login_at'];
            
            $formattedActivities[] = [
                'id' => $activity['id'],
                'student_id' => $activity['student_id'],
                'name' => trim(($activity['first_name'] ?? '') . ' ' . ($activity['last_name'] ?? '')) ?: 'Unknown Student',
                'email' => $activity['email'] ?? 'Unknown Email',
                'profile_picture' => 'api/get_photo.php?id=' . $activity['student_id'],
                'activity_type' => 'login',
                'login_time' => $loginTime,
                'ip_address' => $activity['ip_address'] ?? 'Unknown',
                'location' => $activity['city'] ?? 'Unknown Location',
                'device_type' => $activity['device'] ?? 'Unknown Device',
                'browser' => $activity['browser'] ?? 'Unknown Browser',
                'os' => '',
                'user_agent' => ''
            ];
        }
        
        echo json_encode(['success' => true, 'data' => $formattedActivities]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['student_id'])) {
            echo json_encode(['success' => false, 'message' => 'Student ID required']);
            exit;
        }

        // DIRECT FUNCTION CALL - No extra HTTP/DB connection overhead
        $systemData = getSystemInfo(); 

        $student_id = $input['student_id'];
        $activity_type = $input['activity_type'] ?? 'login';
        
        // Use gathered data
        $ip_address = $systemData['ipAddress'];
        $location = $systemData['location']['city'] . ', ' . $systemData['location']['country'];
        $browser = $systemData['deviceInfo']['browser'];
        $os = $systemData['deviceInfo']['os'];
        $login_time = $systemData['dateTime'];
        $user_agent = $systemData['deviceInfo']['fullUserAgent'];

        // Determine Device Type String
        $type = strtolower($systemData['deviceInfo']['type']);
        $device_name = 'Unknown Device';
        if (strpos($os, 'Windows') !== false) $device_name = 'Windows PC';
        elseif (strpos($os, 'Mac') !== false) $device_name = 'Mac';
        elseif (strpos($os, 'iOS') !== false) $device_name = ($type === 'tablet') ? 'iPad' : 'iPhone';
        elseif (strpos($os, 'Android') !== false) $device_name = ($type === 'tablet') ? 'Android Tablet' : 'Android Phone';
        
        $device_type = $device_name . ' • ' . $browser;

        $stmt = $pdo->prepare("
            INSERT INTO students_activity 
            (student_id, activity_type, device_type, browser, os, location, ip_address, user_agent, login_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $result = $stmt->execute([
            $student_id, $activity_type, $device_type, $browser, $os, $location, $ip_address, $user_agent, $login_time
        ]);

        echo json_encode(['success' => $result]);
    }
} catch (Throwable $e) {
    error_log("Student activity error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
} finally {
    $pdo = null; // ALWAYS close the connection
}
