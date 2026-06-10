<?php

require_once '../config.php';
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Handle GET requests for certain actions
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';
} else {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = isset($data['action']) ? $data['action'] : 'login';
}

try {
    if ($action === 'login') {
        $email = isset($data['email']) ? trim($data['email']) : '';
        $password = isset($data['password']) ? trim($data['password']) : '';
        $loginType = isset($data['loginType']) ? trim($data['loginType']) : 'super_admin';

        if (empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Email and password are required']);
            exit;
        }

        // Use the loginType directly as it matches database roles
        $requiredRole = $loginType;

        // First check if user exists with any role
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = ?");
        $stmt->execute([$email]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        // Debug: Check if user exists at all
        if (!$admin) {
            echo json_encode(['success' => false, 'message' => 'User not found with this email']);
            exit;
        }

        // Check if role matches
        if ($admin['role'] !== $requiredRole) {
            echo json_encode(['success' => false, 'message' => 'Invalid role. Expected: ' . $requiredRole . ', Found: ' . $admin['role']]);
            exit;
        }

        // Check password
        if ($admin['password'] !== $password) {
            echo json_encode(['success' => false, 'message' => 'Invalid password']);
            exit;
        }

        if ($admin && $admin['password'] === $password) {
            // Check status after verifying credentials
            if ($admin['status'] === 'suspended') {
                echo json_encode([
                    'success' => false, 
                    'message' => 'Your login credentials have been suspended. Please contact your administrator.',
                    'status' => 'suspended'
                ]);
            } elseif ($admin['status'] === 'active') {
                // Record login activity in teacher_activity table
                try {
                    // Get comprehensive device and location info directly via getSystemInfo()
                    require_once '../Utils/getinfo.php';
                    
                    // Default values
                    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
                    $device_type = 'Unknown Device • Unknown Browser';
                    $location = 'Unknown Location';
                    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
                    $login_time = date('Y-m-d H:i:s');
                    
                    $getinfo_data = getSystemInfo();
                    error_log("📱 GetInfo direct call Response: " . json_encode($getinfo_data, JSON_PRETTY_PRINT));
                    
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
                        error_log("📱 Detected device: " . $device_type);
                        
                        // Use location data
                        if (isset($getinfo_data['location']) && is_array($getinfo_data['location'])) {
                            $locationData = $getinfo_data['location'];
                            $location = ($locationData['city'] ?? 'Unknown') . ', ' . ($locationData['country'] ?? 'Unknown');
                            error_log("🌍 Detected location: " . $location);
                        }
                        
                        // Use IP
                        if (isset($getinfo_data['ipAddress'])) {
                            $ip_address = $getinfo_data['ipAddress'];
                            error_log("🌐 Detected IP: " . $ip_address);
                        }
                        
                        // Use dateTime
                        if (isset($getinfo_data['dateTime'])) {
                            $login_time = $getinfo_data['dateTime'];
                            error_log("⏰ Using getinfo dateTime: " . $login_time);
                        }
                    } else {
                        error_log("⚠️ getSystemInfo() returned no deviceInfo, using fallback detection");
                        // Fallback to basic UA detection
                        if (preg_match('/Windows/i', $user_agent)) {
                            $device_type = 'Windows PC • Unknown Browser';
                        } elseif (preg_match('/iPhone/i', $user_agent)) {
                            $device_type = 'iPhone • Unknown Browser';
                        } elseif (preg_match('/Android/i', $user_agent)) {
                            $device_type = 'Android Device • Unknown Browser';
                        }
                    }
                    
                    // Log the data being sent to teacher_activity table
                    $teacher_activity_data = [
                        'name' => $admin['name'],
                        'email' => $admin['email'],
                        'teacher_type' => $admin['role'],
                        'ip_address' => $ip_address,
                        'location' => $location,
                        'device_type' => $device_type,
                        'user_agent' => $user_agent,
                        'login_time' => $login_time
                    ];
                    error_log("🔥 Vulnerable Teacher Activity data: " . json_encode($teacher_activity_data, JSON_PRETTY_PRINT));
                    
                    $activity_sql = "INSERT INTO teacher_activity (name, email, teacher_type, ip_address, location, device_type, user_agent, login_time) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                    $activity_stmt = $pdo->prepare($activity_sql);
                    $activity_stmt->execute([
                        $admin['name'],
                        $admin['email'],
                        $admin['role'],
                        $ip_address,
                        $location,
                        $device_type,
                        $user_agent,
                        $login_time
                    ]);
                    
                    error_log("✅ Login activity recorded for: " . $admin['email'] . " (" . $admin['role'] . ")");
                } catch (Exception $activity_error) {
                    error_log("⚠️ Failed to record login activity: " . $activity_error->getMessage());
                }
                
                // Always require 2FA for admin login - either existing or setup
                $_SESSION['temp_admin_id'] = $admin['id'];
                
                if ($admin['two_factor_enabled'] && !empty($admin['two_factor_secret'])) {
                    // User has 2FA enabled, just need code
                    echo json_encode([
                        'success' => true,
                        'requires_2fa' => true,
                        'has_2fa_setup' => true,
                        'message' => '2FA code required'
                    ]);
                } else {
                    // User needs to setup 2FA first
                    echo json_encode([
                        'success' => true,
                        'requires_2fa' => true,
                        'has_2fa_setup' => false,
                        'message' => '2FA setup required'
                    ]);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Account status not recognized. Please contact your administrator.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid credentials or access denied']);
        }
    }
    elseif ($action === 'check_session') {
        if (isset($_SESSION['admin_id'])) {
            echo json_encode([
                'success' => true,
                'logged_in' => true,
                'data' => [
                    'id' => $_SESSION['admin_id'],
                    'name' => $_SESSION['admin_name'],
                    'email' => $_SESSION['admin_email'],
                    'role' => $_SESSION['admin_role']
                ]
            ]);
        } else {
            echo json_encode(['success' => true, 'logged_in' => false]);
        }
    }
    elseif ($action === 'logout') {
        // Clear both regular and temporary session data
        session_unset();
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
    }
    elseif ($action === 'get_all_admins') {
        // Check if admin is logged in (optional - for security)
        // if (!isset($_SESSION['admin_id'])) {
        //     echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        //     exit;
        // }

        $stmt = $pdo->prepare("SELECT id, name, email, role, status, two_factor_enabled, last_login, created_at FROM admins ORDER BY created_at DESC");
        $stmt->execute();
        $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $admins
        ]);
    }

    else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
