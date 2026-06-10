<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Verify token
    $token = $_GET['token'] ?? '';
    
    if (empty($token)) {
        echo json_encode(['success' => false, 'message' => 'Invalid token']);
        exit();
    }

    try {
        $db = $pdo;

        $query = "SELECT id, name, email FROM admins WHERE reset_token = :token AND reset_expires > NOW() AND status = 'active'";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
            exit();
        }

        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'admin' => $admin]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error occurred']);
    }

} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Reset password
    $input = json_decode(file_get_contents('php://input'), true);
    $token = $input['token'] ?? '';
    $newPassword = $input['password'] ?? '';

    if (empty($token) || empty($newPassword)) {
        echo json_encode(['success' => false, 'message' => 'Token and password are required']);
        exit();
    }

    if (strlen($newPassword) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
        exit();
    }

    try {
        $db = $pdo;

        // Verify token again
        $query = "SELECT id, name, email FROM admins WHERE reset_token = :token AND reset_expires > NOW() AND status = 'active'";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
            exit();
        }

        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        // Update password and clear reset token
        $updateQuery = "UPDATE admins SET password = :password, reset_token = NULL, reset_expires = NULL, updated_at = NOW() WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':password', $newPassword);
        $updateStmt->bindParam(':id', $admin['id']);
        $updateStmt->execute();

        // Send confirmation email
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
        $mail->addAddress($admin['email'], $admin['name']);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Password Changed Successfully - ANIRBAN\'S ACADEMY Admin Portal';

        $mailContent = '
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <tr>
                    <td style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
                        <h1>Password Changed Successfully</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px;">
                        <p>Hello <strong>' . htmlspecialchars($admin['name']) . '</strong>,</p>
                        <p>Your password for the ANIRBAN\'S ACADEMY Admin Portal has been successfully changed.</p>
                        <p>If you did not make this change, please take the following actions immediately:</p>
                        <ul style="margin: 20px 0; padding-left: 20px;">
                            <li>Change your password again</li>
                            <li>Contact the system administrator</li>
                            <li>Check your account for any unauthorized access</li>
                            <li>Enable Two-Factor Authentication for added security</li>
                        </ul>
                        <div style="margin: 30px 0; padding: 15px; background-color: #d4edda; border-left: 4px solid #28a745; color: #155724;">
                            <strong>Security Tip:</strong> Use a strong, unique password and enable two-factor authentication to keep your account secure.
                        </div>
                        <p>You can now login to the admin portal with your new password.</p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                        <p style="margin: 10px 0;">
                            <img src="https://anirbansacademy.com/img/logo.png" alt="ANIRBAN\'S ACADEMY" style="max-width: 50px; vertical-align: middle; margin-right: 8px;">
                            <span style="vertical-align: middle;">ANIRBAN\'S ACADEMY Admin Portal</span>
                        </p>
                        <p>&copy; 2025 ANIRBAN\'S ACADEMY. All rights reserved.</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>';

        $mail->Body = $mailContent;
        $mail->send();

        echo json_encode(['success' => true, 'message' => 'Password changed successfully']);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Password updated but email notification failed']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error occurred']);
    }
}
?>
