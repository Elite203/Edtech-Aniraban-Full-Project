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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $firstName = $input['firstName'] ?? '';
    $lastName = $input['lastName'] ?? '';
    $email = $input['email'] ?? '';
    $subject = $input['subject'] ?? '';
    $message = $input['message'] ?? '';
    
    if (empty($firstName) || empty($lastName) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Required fields missing']);
        exit();
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address']);
        exit();
    }
    
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
        $mail->addAddress($email, $firstName . ' ' . $lastName);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Query Received - ANIRBAN\'S ACADEMY';

        $mailContent = '
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <tr>
                    <td style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
                        <h1>Thank You for Contacting Us</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px;">
                        <p>Hello <strong>' . htmlspecialchars($firstName . ' ' . $lastName) . '</strong>,</p>
                        <p>Thank you for reaching out to us. We have successfully received your query and our team will get in touch with you shortly.</p>
                        
                        <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #4f46e5; border-radius: 5px;">
                            <h3 style="margin: 0 0 10px 0; color: #4f46e5;">Your Query Details:</h3>
                            <p style="margin: 5px 0;"><strong>Subject:</strong> ' . htmlspecialchars($subject) . '</p>
                            <p style="margin: 5px 0;"><strong>Message:</strong> ' . htmlspecialchars($message) . '</p>
                        </div>
                        
                        <p>Our team typically responds within 24-48 hours during business days. If you have any urgent questions, please feel free to call us directly.</p>
                        
                        <div style="margin: 30px 0; padding: 15px; background-color: #dbeafe; border-left: 4px solid #4f46e5; color: #1e40af;">
                            <strong>What happens next?</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Our team will review your query</li>
                                <li>We\'ll prepare a detailed response</li>
                                <li>You\'ll receive a personalized reply via email</li>
                                <li>If needed, we may schedule a call to discuss further</li>
                            </ul>
                        </div>
                        
                        <p>Thank you for choosing ANIRBAN\'S ACADEMY. We look forward to helping you achieve your learning goals!</p>
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
        
        echo json_encode(['success' => true, 'message' => 'Confirmation email sent successfully']);
        
    } catch (Exception $e) {
        error_log("Contact Mail Error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to send confirmation email']);
    }
    
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
