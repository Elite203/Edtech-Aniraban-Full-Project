<?php
session_start();
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Only POST method is allowed'
    ]);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON data'
    ]);
    exit;
}

// Validate required fields
if (!isset($input['email']) || !isset($input['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required'
    ]);
    exit;
}

$email = trim(strtolower($input['email']));
$password = trim($input['password']);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email format'
    ]);
    exit;
}

try {
    // First check if student exists with correct credentials regardless of status
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, email, number, status FROM students WHERE email = ? AND password = ?");
    $stmt->execute([$email, $password]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($student) {
        $fullName = $student['first_name'] . ' ' . $student['last_name'];
        // Check if student status is active
        if ($student['status'] !== 'active') {
            echo json_encode([
                'success' => false,
                'message' => 'Your account is suspended. Please contact the website administrator.'
            ]);
            exit;
        }

        // Set session variables
        $_SESSION['student_logged_in'] = true;
        $_SESSION['student_id'] = $student['id'];
        $_SESSION['student_name'] = $fullName;
        $_SESSION['student_email'] = $student['email'];

        error_log('🎯 Student login successful, recording activity for: ' . $student['email']);

        // Record student activity using getinfo.php integration
        recordStudentActivity($student['id'], $pdo);

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $student['id'],
                'first_name' => $student['first_name'],
                'last_name' => $student['last_name'],
                'email' => $student['email']
            ],
            'image' => '' // Empty image field for compatibility
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
    }

} catch (PDOException $e) {
    error_log("Student login error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred. Please try again later.'
    ]);
}

// Function to record student activity with getinfo.php integration
function recordStudentActivity($student_id, $pdo)
{
    try {
        console_log('📝 Starting student activity recording for ID: ' . $student_id);

        // Get comprehensive device and location info from getinfo.php API
        $getinfo_url = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/getinfo.php';
        console_log('🔍 Fetching device info from: ' . $getinfo_url);

        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => [
                    'User-Agent: ' . ($_SERVER['HTTP_USER_AGENT'] ?? ''),
                    'X-Forwarded-For: ' . ($_SERVER['REMOTE_ADDR'] ?? ''),
                    'X-Real-IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '')
                ]
            ]
        ]);

        $getinfo_response = @file_get_contents($getinfo_url, false, $context);

        // Default values
        $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
        $device_type = 'Unknown Device • Unknown Browser';
        $location = 'Unknown Location';
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $browser = 'Unknown Browser';
        $os = 'Unknown OS';
        $login_time = date('Y-m-d H:i:s'); // Default format

        if ($getinfo_response) {
            $getinfo_data = json_decode($getinfo_response, true);
            console_log('📱 GetInfo API Response: ' . json_encode($getinfo_data, JSON_PRETTY_PRINT));

            if ($getinfo_data && isset($getinfo_data['deviceInfo'])) {
                $deviceInfo = $getinfo_data['deviceInfo'];

                // Extract device and browser info
                $device_name = 'Unknown Device';
                $browser_name = $deviceInfo['browser'] ?? 'Unknown Browser';
                $browser = $browser_name;
                $os = $deviceInfo['os'] ?? 'Unknown OS';

                // Enhanced device naming
                if (!empty($deviceInfo['os'])) {
                    $osInfo = $deviceInfo['os'];
                    $type = strtolower($deviceInfo['type'] ?? '');

                    if (strpos($osInfo, 'Windows') !== false) {
                        $device_name = 'Windows PC';
                    } elseif (strpos($osInfo, 'Mac') !== false || strpos($osInfo, 'macOS') !== false) {
                        $device_name = 'Mac';
                    } elseif (strpos($osInfo, 'Linux') !== false) {
                        $device_name = 'Linux PC';
                    } elseif (strpos($osInfo, 'iOS') !== false) {
                        $device_name = ($type === 'tablet') ? 'iPad' : 'iPhone';
                    } elseif (strpos($osInfo, 'Android') !== false) {
                        $device_name = ($type === 'tablet') ? 'Android Tablet' : 'Android Phone';
                    }
                }

                $device_type = $device_name . ' • ' . $browser_name;
                console_log('📱 Detected device: ' . $device_type);

                // Use location data from getinfo API
                if (isset($getinfo_data['location']) && is_array($getinfo_data['location'])) {
                    $locationData = $getinfo_data['location'];
                    $location = ($locationData['city'] ?? 'Unknown') . ', ' . ($locationData['country'] ?? 'Unknown');
                    console_log('🌍 Detected location: ' . $location);
                }

                // Use IP from getinfo API
                if (isset($getinfo_data['ipAddress'])) {
                    $ip_address = $getinfo_data['ipAddress'];
                    console_log('🌐 Detected IP: ' . $ip_address);
                }

                // Use dateTime directly from getinfo API
                if (isset($getinfo_data['dateTime'])) {
                    $login_time = $getinfo_data['dateTime'];
                    console_log('⏰ Using getinfo dateTime: ' . $login_time);
                }
            }
        } else {
            console_log('⚠️ Failed to fetch data from getinfo.php API, using fallback detection');

            // Enhanced fallback detection
            if (preg_match('/Windows/i', $user_agent)) {
                $device_type = 'Windows PC • Unknown Browser';
                $os = 'Windows';
            } elseif (preg_match('/iPhone/i', $user_agent)) {
                $device_type = 'iPhone • Unknown Browser';
                $os = 'iOS';
            } elseif (preg_match('/iPad/i', $user_agent)) {
                $device_type = 'iPad • Unknown Browser';
                $os = 'iOS';
            } elseif (preg_match('/Android/i', $user_agent)) {
                if (preg_match('/Mobile/i', $user_agent)) {
                    $device_type = 'Android Phone • Unknown Browser';
                } else {
                    $device_type = 'Android Tablet • Unknown Browser';
                }
                $os = 'Android';
            } elseif (preg_match('/Mac/i', $user_agent)) {
                $device_type = 'Mac • Unknown Browser';
                $os = 'macOS';
            } elseif (preg_match('/Linux/i', $user_agent)) {
                $device_type = 'Linux PC • Unknown Browser';
                $os = 'Linux';
            }
        }

        // Insert student activity record
        $stmt = $pdo->prepare("
            INSERT INTO students_activity 
            (student_id, activity_type, device_type, browser, os, location, ip_address, user_agent, login_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $student_id,
            'login',
            $device_type,
            $browser,
            $os,
            $location,
            $ip_address,
            $user_agent,
            $login_time
        ]);

        console_log('✅ Student activity recorded successfully');

    } catch (PDOException $e) {
        console_log('❌ Error recording student activity: ' . $e->getMessage());
        // Don't fail the login if activity recording fails
    }
}

// Console logging function for debugging
function console_log($message)
{
    error_log('[STUDENT_LOGIN] ' . $message);
}
?>