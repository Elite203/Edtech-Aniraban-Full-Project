<?php
ob_start();
ini_set('display_errors', 0);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../vendor/autoload.php';

try {
    require_once '../config.php';
} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Configuration error'
    ]);
    exit;
}

header('Content-Type: application/json');
ob_clean();

// Handle both GET and POST requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // GET request - verify token
    $token = $_GET['token'] ?? '';
    
    if (empty($token)) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Token is required'
        ]);
        exit;
    }

    try {
        // Check if token is valid and not expired
        $stmt = $pdo->prepare("SELECT id, first_name, last_name, email FROM students WHERE reset_token = ? AND reset_expires > NOW() AND status = 'active'");
        $stmt->execute([$token]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$student) {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Invalid or expired reset token'
            ]);
            exit;
        }

        ob_clean();
        echo json_encode([
            'success' => true,
            'student' => [
                'id' => $student['id'],
                'first_name' => $student['first_name'],
                'last_name' => $student['last_name'],
                'name' => $student['first_name'] . ' ' . $student['last_name'],
                'email' => $student['email']
            ]
        ]);
        exit;

    } catch (PDOException $e) {
        error_log("Token verification error: " . $e->getMessage());
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Database error occurred'
        ]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Only POST method is allowed'
    ]);
    exit;
}

// POST request - update password
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON data'
    ]);
    exit;
}

// Validate required fields
if (!isset($input['token']) || !isset($input['password'])) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Token and password are required'
    ]);
    exit;
}

$token = trim($input['token']);
$password = trim($input['password']);

// Validate password
if (strlen($password) < 6) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Password must be at least 6 characters long'
    ]);
    exit;
}

try {
    // Check if token is valid and not expired
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, email FROM students WHERE reset_token = ? AND reset_expires > NOW() AND status = 'active'");
    $stmt->execute([$token]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Invalid or expired reset token'
        ]);
        exit;
    }

    $studentName = $student['first_name'] . ' ' . $student['last_name'];

    // Update password and clear reset token (storing as plain text to match current system)
    $stmt = $pdo->prepare("UPDATE students SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
    $stmt->execute([$password, $student['id']]);

    // Send confirmation email using PHPMailer
    try {
        $mail = new PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.hostinger.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'info@anirbansacademy.com';
        $mail->Password = 'Anirban2025@@##';
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        // Recipients
        $mail->setFrom('info@anirbansacademy.com', 'ANIRBAN\'S ACADEMY');
        $mail->addAddress($student['email'], $studentName);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Password Changed Successfully - ANIRBAN\'S ACADEMY';

        $mailContent = '
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <tr>
                    <td style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
                        <h1>Password Changed Successfully</h1>
                        <p>ANIRBAN\'S ACADEMY</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px;">
                        <p>Hello <strong>' . htmlspecialchars($studentName) . '</strong>!</p>
                        <p>Your password has been successfully changed for your ANIRBAN\'S ACADEMY account.</p>
                        
                        <div style="margin: 20px 0; padding: 15px; background-color: #d1edff; border-left: 4px solid #0ea5e9; color: #0c4a6e; border-radius: 5px;">
                            <strong>Security Confirmation:</strong><br>
                            • Password changed on: ' . date('Y-m-d H:i:s') . '<br>
                            • Your account is now secure with the new password<br>
                            • You can now login with your new password
                        </div>
                        
                        <p>If you did not make this change, please contact our support team immediately at <a href="mailto:info@anirbansacademy.com">info@anirbansacademy.com</a></p>
                        
                        <p>Thank you for keeping your account secure!</p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                        <p style="margin: 10px 0;">
                            <img src="https://anirbansacademy.com/img/logo.png" alt="ANIRBAN\'S ACADEMY" style="max-width: 50px; vertical-align: middle; margin-right: 8px;">
                            <span style="vertical-align: middle;">ANIRBAN\'S ACADEMY</span>
                        </p>
                        <p>&copy; 2025 ANIRBAN\'S ACADEMY. All rights reserved.</p>
                        <p style="margin: 5px 0;">For support: info@anirbansacademy.com</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>';

        $mail->Body = $mailContent;
        $mail->send();
    } catch (Exception $e) {
        error_log("Password Update Confirmation Mail Error: " . $e->getMessage());
    }

    ob_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Password updated successfully'
    ]);

} catch (PDOException $e) {
    error_log("Password update error: " . $e->getMessage());
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    error_log("General password update error: " . $e->getMessage());
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'An error occurred while updating password'
    ]);
}
?>
