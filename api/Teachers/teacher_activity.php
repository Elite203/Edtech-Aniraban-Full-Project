<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

// Log the start of teacher activity API
error_log("🔍 Teacher Activity API started - Method: " . $_SERVER['REQUEST_METHOD']);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch teacher activity data
        error_log("📊 Fetching teacher activity data from database");
        
        $sql = "SELECT * FROM teacher_activity ORDER BY login_time DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        
        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log("📋 Found " . count($activities) . " teacher activity records");
        
        // Format the data for frontend with proper timezone handling
        $formattedActivities = array_map(function($activity) {
            // Ensure proper timezone handling for login_time
            $loginTime = $activity['login_time'];
            if ($loginTime) {
                // Convert to proper ISO format for JavaScript Date parsing
                $dateTime = new DateTime($loginTime);
                $loginTime = $dateTime->format('Y-m-d H:i:s');
            }
            
            return [
                'id' => $activity['id'],
                'name' => $activity['name'],
                'email' => $activity['email'],
                'teacher_type' => $activity['teacher_type'],
                'login_time' => $loginTime,
                'ip_address' => $activity['ip_address'] ?? 'Unknown',
                'location' => $activity['location'] ?? 'Unknown Location',
                'device_type' => $activity['device_type'] ?? 'Unknown Device',
                'user_agent' => $activity['user_agent'] ?? 'Unknown'
            ];
        }, $activities);
        
        error_log("✅ Successfully formatted " . count($formattedActivities) . " activity records");
        
        echo json_encode([
            'success' => true,
            'data' => $formattedActivities
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Store teacher activity data
        $data = json_decode(file_get_contents('php://input'), true);
        
        error_log("📝 Storing teacher activity data: " . json_encode($data));
        
        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $teacher_type = $data['teacher_type'] ?? '';
        
        // Get comprehensive device and location info directly via getSystemInfo()
        require_once '../Utils/getinfo.php';
        
        // Default values
        $ip_address = $data['ip_address'] ?? $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
        $device_type = $data['device_type'] ?? 'Unknown Device • Unknown Browser';
        $location = $data['location'] ?? 'Unknown Location';
        $user_agent = $data['user_agent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? '';
        $login_time = date('Y-m-d H:i:s');
        
        $getinfo_data = getSystemInfo();
        error_log("📱 POST: GetInfo direct call Response: " . json_encode($getinfo_data, JSON_PRETTY_PRINT));
        
        if ($getinfo_data && isset($getinfo_data['deviceInfo'])) {
            $deviceInfo = $getinfo_data['deviceInfo'];
            
            // Extract device and browser info
            $device_name = 'Unknown Device';
            $browser_name = $deviceInfo['browser'] ?? 'Unknown Browser';
            
            // Enhanced device naming
            if (!empty($deviceInfo['os'])) {
                $os = $deviceInfo['os'];
                $type = strtolower($deviceInfo['type'] ?? '');
                
                if (strpos($os, 'Windows') !== false) {
                    $device_name = 'Windows PC';
                } elseif (strpos($os, 'Mac') !== false || strpos($os, 'macOS') !== false) {
                    $device_name = 'Mac';
                } elseif (strpos($os, 'Linux') !== false) {
                    $device_name = 'Linux PC';
                } elseif (strpos($os, 'iOS') !== false) {
                    $device_name = ($type === 'tablet') ? 'iPad' : 'iPhone';
                } elseif (strpos($os, 'Android') !== false) {
                    $device_name = ($type === 'tablet') ? 'Android Tablet' : 'Android Phone';
                }
            }
            
            $device_type = $device_name . ' • ' . $browser_name;
            error_log("📱 POST: Detected device: " . $device_type);
            
            // Use location data from getinfo
            if (isset($getinfo_data['location']) && is_array($getinfo_data['location'])) {
                $locationData = $getinfo_data['location'];
                $location = ($locationData['city'] ?? 'Unknown') . ', ' . ($locationData['country'] ?? 'Unknown');
                error_log("🌍 POST: Detected location: " . $location);
            }
            
            // Use IP from getinfo
            if (isset($getinfo_data['ipAddress'])) {
                $ip_address = $getinfo_data['ipAddress'];
                error_log("🌐 POST: Detected IP: " . $ip_address);
            }
            
            // Use dateTime from getinfo
            if (isset($getinfo_data['dateTime'])) {
                $login_time = $getinfo_data['dateTime'];
                error_log("⏰ POST: Using getinfo dateTime: " . $login_time);
            }
        } else {
            error_log("⚠️ POST: getSystemInfo() returned no deviceInfo, using fallback");
        }
        
        $sql = "INSERT INTO teacher_activity (name, email, teacher_type, ip_address, location, device_type, user_agent, login_time) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([$name, $email, $teacher_type, $ip_address, $location, $device_type, $user_agent, $login_time]);
        
        error_log("📊 POST: Storing teacher activity with login_time: " . $login_time);
        
        if ($result) {
            error_log("✅ Successfully stored teacher activity for: " . $email);
            echo json_encode([
                'success' => true,
                'message' => 'Activity recorded successfully'
            ]);
        } else {
            error_log("❌ Failed to store teacher activity for: " . $email);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to record activity'
            ]);
        }
    }
    
} catch (Exception $e) {
    error_log("💥 Teacher Activity API error: " . $e->getMessage());
    error_log("📍 Error location: " . $e->getFile() . " line " . $e->getLine());
    
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
