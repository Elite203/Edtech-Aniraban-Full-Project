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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Only POST method is allowed'
    ]);
    exit;
}

// Get POST data
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
if (!isset($input['email']) || empty(trim($input['email']))) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Email is required'
    ]);
    exit;
}

$email = trim($input['email']);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Invalid email format'
    ]);
    exit;
}

try {
    // Check if student exists and is verified
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, email FROM students WHERE email = ? AND verified = 'verified' AND status = 'active'");
    $stmt->execute([$email]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Student not found or account not verified'
        ]);
        exit;
    }

    $studentName = $student['first_name'] . ' ' . $student['last_name'];

    // Generate reset token
    $reset_token = bin2hex(random_bytes(32));

    // Store reset token in database using MySQL's current time to avoid timezone mismatch
    $stmt = $pdo->prepare("UPDATE students SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?");
    $stmt->execute([$reset_token, $student['id']]);

    // Send reset email using PHPMailer
    $reset_link = "https://anirbansacademy.com/forgot-password?token=" . $reset_token;
    
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
        $mail->addAddress($email, $studentName);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Password Reset Request - ANIRBAN\'S ACADEMY';

        $mailContent = '
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <tr>
                    <td style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
                        <h1>Password Reset Request</h1>
                        <p>ANIRBAN\'S ACADEMY</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px;">
                        <p>Hello <strong>' . htmlspecialchars($studentName) . '</strong>!</p>
                        <p>We received a request to reset your password for your ANIRBAN\'S ACADEMY account.</p>
                        
                        <p>To reset your password, please click the button below:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="' . $reset_link . '" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset My Password</a>
                        </div>
                        
                        <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; color: #856404; border-radius: 5px;">
                            <strong>Security Note:</strong><br>
                            • This link will expire in 1 hour for your security<br>
                            • If you didn\'t request this password reset, please ignore this email<br>
                            • Never share this reset link with anyone
                        </div>
                        
                        <p>If the button doesn\'t work, you can also copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #4f46e5;">' . $reset_link . '</p>
                        
                        <p>If you didn\'t request this password reset, please ignore this email and your account will remain secure.</p>
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
        $mail_sent = $mail->send();
    } catch (Exception $e) {
        error_log("Reset Password Mail Error: " . $e->getMessage());
        $mail_sent = false;
    }

    if ($mail_sent) {
        ob_clean();
        echo json_encode([
            'success' => true,
            'message' => 'Password reset link sent successfully to your email'
        ]);
    } else {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Failed to send password reset email'
        ]);
    }

} catch (PDOException $e) {
    error_log("Student password reset error: " . $e->getMessage());
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    error_log("General student password reset error: " . $e->getMessage());
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'An error occurred while processing your request'
    ]);
}
?>
