<?php
require_once '../config.php';
require_once 'GoogleAuthenticator.php';
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

$ga = new GoogleAuthenticator();

try {
    // Rate limiting check for brute force protection
    function checkRateLimit($identifier, $maxAttempts = 5, $timeWindow = 300) {
        $cacheFile = __DIR__ . '/temp/rate_limit_' . md5($identifier) . '.json';
        
        // Create temp directory if it doesn't exist
        if (!is_dir(__DIR__ . '/temp')) {
            mkdir(__DIR__ . '/temp', 0755, true);
        }
        
        $attempts = [];
        if (file_exists($cacheFile)) {
            $attempts = json_decode(file_get_contents($cacheFile), true) ?? [];
        }
        
        $now = time();
        // Remove attempts outside time window
        $attempts = array_filter($attempts, function($timestamp) use ($now, $timeWindow) {
            return ($now - $timestamp) < $timeWindow;
        });
        
        if (count($attempts) >= $maxAttempts) {
            return false;
        }
        
        $attempts[] = $now;
        file_put_contents($cacheFile, json_encode($attempts));
        return true;
    }

    if ($action === 'verify_2fa') {
        $adminId = $_SESSION['temp_admin_id'] ?? null;
        $code = trim($data['code'] ?? '');

        if (!$adminId || empty($code)) {
            echo json_encode(['success' => false, 'message' => 'Missing admin ID or 2FA code']);
            exit;
        }

        // Rate limiting check
        if (!checkRateLimit("2fa_verify_{$adminId}")) {
            echo json_encode(['success' => false, 'message' => 'Too many attempts. Please try again later.']);
            exit;
        }

        // Get admin's 2FA secret
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE id = ?");
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch();

        if (!$admin) {
            echo json_encode(['success' => false, 'message' => 'Admin not found']);
            exit;
        }

        // Check if admin has 2FA enabled
        if (!$admin['two_factor_enabled'] || empty($admin['two_factor_secret'])) {
            echo json_encode(['success' => false, 'message' => '2FA not set up for this account']);
            exit;
        }

        // Verify the 2FA code
        if ($ga->verifyCode($admin['two_factor_secret'], $code, 2)) {
            // Code is valid, complete the login
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_email'] = $admin['email'];
            $_SESSION['admin_name'] = $admin['name'];
            $_SESSION['admin_role'] = $admin['role'];
            
            // Clear temporary session data
            unset($_SESSION['temp_admin_id']);

            // Update last login
            $stmt = $pdo->prepare("UPDATE admins SET last_login = NOW() WHERE id = ?");
            $stmt->execute([$admin['id']]);

            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'id' => $admin['id'],
                    'name' => $admin['name'],
                    'email' => $admin['email'],
                    'role' => $admin['role']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid 2FA code']);
        }
    }

    elseif ($action === 'setup_2fa_during_login') {
        $adminId = $_SESSION['temp_admin_id'] ?? null;

        if (!$adminId) {
            echo json_encode(['success' => false, 'message' => 'No active login session']);
            exit;
        }

        // Get admin details
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE id = ?");
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch();

        if (!$admin) {
            echo json_encode(['success' => false, 'message' => 'Admin not found']);
            exit;
        }

        // Generate new secret if not exists
        if (empty($admin['two_factor_secret'])) {
            $secret = $ga->createSecret();
            
            // Store secret temporarily (not yet enabled)
            $stmt = $pdo->prepare("UPDATE admins SET two_factor_secret = ? WHERE id = ?");
            $stmt->execute([$secret, $adminId]);
        } else {
            $secret = $admin['two_factor_secret'];
        }
        
        // Generate QR code URL
        $qrCodeUrl = $ga->getQRCodeGoogleUrl(
            $admin['email'],
            $secret,
            'Anirban\'s Academy Admin Panel'
        );

        echo json_encode([
            'success' => true,
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl
        ]);
    }

    elseif ($action === 'complete_2fa_setup') {
        $adminId = $_SESSION['temp_admin_id'] ?? null;
        $code = trim($data['code'] ?? '');

        if (!$adminId || empty($code)) {
            echo json_encode(['success' => false, 'message' => 'Missing admin ID or 2FA code']);
            exit;
        }

        // Rate limiting check
        if (!checkRateLimit("2fa_setup_{$adminId}")) {
            echo json_encode(['success' => false, 'message' => 'Too many attempts. Please try again later.']);
            exit;
        }

        // Get admin's secret
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE id = ?");
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch();

        if (!$admin || empty($admin['two_factor_secret'])) {
            echo json_encode(['success' => false, 'message' => 'No 2FA secret found. Please try again.']);
            exit;
        }

        // Verify the code to ensure the user can generate codes
        if ($ga->verifyCode($admin['two_factor_secret'], $code, 2)) {
            // Enable 2FA and complete login
            $stmt = $pdo->prepare("UPDATE admins SET two_factor_enabled = 1, last_login = NOW() WHERE id = ?");
            $stmt->execute([$adminId]);

            // Complete login
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_email'] = $admin['email'];
            $_SESSION['admin_name'] = $admin['name'];
            $_SESSION['admin_role'] = $admin['role'];
            
            // Clear temporary session data
            unset($_SESSION['temp_admin_id']);

            echo json_encode([
                'success' => true,
                'message' => '2FA setup completed and login successful',
                'data' => [
                    'id' => $admin['id'],
                    'name' => $admin['name'],
                    'email' => $admin['email'],
                    'role' => $admin['role']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid 2FA code. Please try again.']);
        }
    }
    
    elseif ($action === 'generate_secret') {
        // Must be logged in to generate secret
        if (!isset($_SESSION['admin_id'])) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }

        $adminId = $_SESSION['admin_id'];
        
        // Get admin details
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE id = ?");
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch();

        if (!$admin) {
            echo json_encode(['success' => false, 'message' => 'Admin not found']);
            exit;
        }

        // Generate new secret
        $secret = $ga->createSecret();
        
        // Generate QR code URL
        $qrCodeUrl = $ga->getQRCodeGoogleUrl(
            $admin['email'],
            $secret,
            'Anirban\'s Academy Admin Panel'
        );

        // Store secret temporarily (not yet enabled)
        $stmt = $pdo->prepare("UPDATE admins SET two_factor_secret = ? WHERE id = ?");
        $stmt->execute([$secret, $adminId]);

        echo json_encode([
            'success' => true,
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl
        ]);
    }
    
    elseif ($action === 'enable_2fa') {
        if (!isset($_SESSION['admin_id'])) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }

        $adminId = $_SESSION['admin_id'];
        $code = trim($data['code'] ?? '');

        if (empty($code)) {
            echo json_encode(['success' => false, 'message' => '2FA code is required']);
            exit;
        }

        // Get admin's secret
        $stmt = $pdo->prepare("SELECT two_factor_secret FROM admins WHERE id = ?");
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch();

        if (!$admin || empty($admin['two_factor_secret'])) {
            echo json_encode(['success' => false, 'message' => 'No 2FA secret found. Generate one first.']);
            exit;
        }

        // Verify the code to ensure the user can generate codes
        if ($ga->verifyCode($admin['two_factor_secret'], $code, 2)) {
            // Enable 2FA
            $stmt = $pdo->prepare("UPDATE admins SET two_factor_enabled = 1 WHERE id = ?");
            $stmt->execute([$adminId]);

            echo json_encode(['success' => true, 'message' => '2FA enabled successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid 2FA code. Please try again.']);
        }
    }
    
    elseif ($action === 'disable_2fa') {
        if (!isset($_SESSION['admin_id'])) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }

        $adminId = $_SESSION['admin_id'];
        $code = trim($data['code'] ?? '');
        $password = trim($data['password'] ?? '');

        if (empty($code) || empty($password)) {
            echo json_encode(['success' => false, 'message' => '2FA code and password are required']);
            exit;
        }

        // Get admin details
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE id = ?");
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch();

        if (!$admin) {
            echo json_encode(['success' => false, 'message' => 'Admin not found']);
            exit;
        }

        // Verify password
        if ($admin['password'] !== $password) {
            echo json_encode(['success' => false, 'message' => 'Invalid password']);
            exit;
        }

        // Verify 2FA code if 2FA is enabled
        if ($admin['two_factor_enabled'] && !empty($admin['two_factor_secret'])) {
            if (!$ga->verifyCode($admin['two_factor_secret'], $code, 2)) {
                echo json_encode(['success' => false, 'message' => 'Invalid 2FA code']);
                exit;
            }
        }

        // Disable 2FA and clear secret
        $stmt = $pdo->prepare("UPDATE admins SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?");
        $stmt->execute([$adminId]);

        echo json_encode(['success' => true, 'message' => '2FA disabled successfully']);
    }
    
    elseif ($action === 'get_2fa_status') {
        if (!isset($_SESSION['admin_id'])) {
            echo json_encode(['success' => false, 'message' => 'Authentication required']);
            exit;
        }

        $adminId = $_SESSION['admin_id'];
        
        $stmt = $pdo->prepare("SELECT two_factor_enabled FROM admins WHERE id = ?");
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch();

        if (!$admin) {
            echo json_encode(['success' => false, 'message' => 'Admin not found']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'two_factor_enabled' => (bool)$admin['two_factor_enabled']
        ]);
    }
    
    else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
