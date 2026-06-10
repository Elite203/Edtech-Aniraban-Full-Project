<?php
ob_start();
ini_set('display_errors', 0);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

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
if (!isset($input['user_id']) || !isset($input['name']) || !isset($input['email'])) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'User ID, name, and email are required'
    ]);
    exit;
}

$user_id = trim($input['user_id']);
$name = trim($input['name']);
$email = trim($input['email']);

try {
    // Verify user exists and is verified
    $stmt = $pdo->prepare("SELECT id FROM students WHERE id = ? AND email = ? AND verified = 'verified'");
    $stmt->execute([$user_id, $email]);
    $user_exists = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user_exists) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'User not found or not verified'
        ]);
        exit;
    }

    // Send welcome email using PHPMailer
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
        $mail->addAddress($email, $name);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Welcome to ANIRBAN\'S ACADEMY - Your Learning Journey Begins!';

        $mailContent = '
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <tr>
                    <td style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
                        <h1>Welcome to ANIRBAN\'S ACADEMY!</h1>
                        <p>Your learning journey starts here</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px;">
                        <p>Hello <strong>' . htmlspecialchars($name) . '</strong>! 👋</p>
                        <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
                        
                        <p>We\'re thrilled to have you join our community of learners. ANIRBAN\'S ACADEMY is dedicated to helping you achieve your educational goals through our comprehensive courses and expert guidance.</p>
                        
                        <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #4f46e5; border-radius: 5px;">
                            <h3 style="margin: 0 0 10px 0; color: #4f46e5;">🎓 What You Get:</h3>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li><strong>200+ Comprehensive Courses</strong> - Access to a vast library of educational content</li>
                                <li><strong>Expert Faculty</strong> - Learn from experienced educators and industry professionals</li>
                                <li><strong>Mock Tests & Analysis</strong> - Regular assessments with detailed performance analysis</li>
                                <li><strong>24/7 Support</strong> - Our team is always here to help you succeed</li>
                                <li><strong>Community Learning</strong> - Connect with fellow students and share knowledge</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <p><strong>Ready to start learning?</strong></p>
                            <a href="https://anirbansacademy.com/login" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
                        </div>
                        
                        <div style="margin: 20px 0; padding: 15px; background-color: #dbeafe; border-left: 4px solid #4f46e5; border-radius: 5px;">
                            <h3 style="margin: 0 0 10px 0; color: #4f46e5;">Getting Started:</h3>
                            <ol style="margin: 10px 0; padding-left: 20px;">
                                <li>Log in to your account using your registered email and password</li>
                                <li>Complete your profile to personalize your experience</li>
                                <li>Browse our course catalog and enroll in courses that interest you</li>
                                <li>Start learning and track your progress</li>
                            </ol>
                        </div>
                        
                        <p>If you have any questions or need assistance, don\'t hesitate to reach out to our support team at <a href="mailto:info@anirbansacademy.com">info@anirbansacademy.com</a></p>
                        
                        <p>Once again, welcome to the ANIRBAN\'S ACADEMY family! We\'re excited to be part of your educational journey.</p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                        <p style="margin: 10px 0;">
                            <img src="https://anirbansacademy.com/img/logo.webp" alt="ANIRBAN\'S ACADEMY" style="max-width: 50px; vertical-align: middle; margin-right: 8px;">
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
        error_log("Welcome Mail Error: " . $e->getMessage());
        $mail_sent = false;
    }

    if ($mail_sent) {
        ob_clean();
        echo json_encode([
            'success' => true,
            'message' => 'Welcome email sent successfully'
        ]);
    } else {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Failed to send welcome email'
        ]);
    }

} catch (PDOException $e) {
    error_log("Welcome email error: " . $e->getMessage());
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    error_log("General welcome email error: " . $e->getMessage());
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'An error occurred while sending welcome email'
    ]);
}
?>
