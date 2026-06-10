<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$loginType = $input['loginType'] ?? '';

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit();
}

// Only allow super_admin to use forgot password
if ($loginType !== 'super_admin') {
    echo json_encode(['success' => false, 'message' => 'Forgot password is only available for Admin users']);
    exit();
}

try {
    $db = $pdo;

    // Check if admin exists
    $query = "SELECT id, name, email FROM admins WHERE email = :email AND role = 'super_admin' AND status = 'active'";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'Admin not found or account inactive']);
        exit();
    }

    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    // Generate reset token
    $resetToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Store reset token in database
    $updateQuery = "UPDATE admins SET reset_token = :token, reset_expires = :expires WHERE id = :id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':token', $resetToken);
    $updateStmt->bindParam(':expires', $expiresAt);
    $updateStmt->bindParam(':id', $admin['id']);
    $updateStmt->execute();

    // Send reset email
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
    $mail->Subject = 'Password Reset Request - ANIRBAN\'S ACADEMY Admin Portal';

    $resetLink = "https://anirbansacademy.com/anirban/reset-password?token=" . $resetToken;

    $mailContent = '
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <tr>
                <td style="background-color: #DC143C; color: white; padding: 20px; text-align: center;">
                    <h1>Password Reset Request</h1>
                </td>
            </tr>
            <tr>
                <td style="padding: 30px;">
                    <p>Hello <strong>' . htmlspecialchars($admin['name']) . '</strong>,</p>
                    <p>We received a request to reset your password for the ANIRBAN\'S ACADEMY Admin Portal.</p>
                    <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="' . $resetLink . '" style="background-color: #DC143C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    <p style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; color: #856404;">
                        <strong>Security Note:</strong> If you did not request this password reset, please ignore this email and contact the system administrator immediately.
                    </p>
                    <p>For security reasons, if you do not reset your password within 1 hour, you will need to request a new reset link.</p>
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

    echo json_encode(['success' => true, 'message' => 'Password reset link has been sent to your email']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Failed to send email: ' . $e->getMessage()]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
}
?>
