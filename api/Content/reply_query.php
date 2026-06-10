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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $queryId = $input['queryId'] ?? '';
    $replySubject = $input['replySubject'] ?? '';
    $replyMessage = $input['replyMessage'] ?? '';
    $recipientEmail = $input['recipientEmail'] ?? '';
    $recipientName = $input['recipientName'] ?? '';
    
    error_log("Reply Query API - Received data: " . json_encode($input));
    
    if (empty($queryId) || empty($replySubject) || empty($replyMessage) || empty($recipientEmail)) {
        error_log("Reply Query API - Missing required fields");
        echo json_encode(['success' => false, 'message' => 'Required fields missing']);
        exit();
    }
    
    if (!filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
        error_log("Reply Query API - Invalid email: " . $recipientEmail);
        echo json_encode(['success' => false, 'message' => 'Invalid email address']);
        exit();
    }
    
    try {
        // Connect to database
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        error_log("Reply Query API - Database connection successful");
        
        // Update query state to 'replied'
        $stmt = $pdo->prepare("UPDATE contact_page SET state = 'replied' WHERE id = :queryId");
        $updateResult = $stmt->execute(['queryId' => $queryId]);
        
        if (!$updateResult) {
            error_log("Reply Query API - Failed to update query state");
            throw new Exception("Failed to update query state");
        }
        
        error_log("Reply Query API - Query state updated successfully for ID: " . $queryId);
        
        // Send email reply
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
        $mail->addAddress($recipientEmail, $recipientName);

        // Content
        $mail->isHTML(true);
        $mail->Subject = htmlspecialchars($replySubject);

        $mailContent = '
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <tr>
                    <td style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
                        <h1>Reply from ANIRBAN\'S ACADEMY</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px;">
                        <p>Hello <strong>' . htmlspecialchars($recipientName) . '</strong>,</p>
                        <p>Thank you for contacting us. Here is our response to your query:</p>
                        
                        <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #4f46e5; border-radius: 5px;">
                            <h3 style="margin: 0 0 10px 0; color: #4f46e5;">Our Response:</h3>
                            <div style="white-space: pre-wrap; line-height: 1.6;">' . nl2br(htmlspecialchars($replyMessage)) . '</div>
                        </div>
                        
                        <p>If you have any further questions or need clarification, please don\'t hesitate to reach out to us again.</p>
                        
                        <p>Thank you for choosing ANIRBAN\'S ACADEMY. We appreciate your interest in our services!</p>
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
        
        error_log("Reply Query API - Attempting to send email to: " . $recipientEmail);
        $mail->send();
        error_log("Reply Query API - Email sent successfully to: " . $recipientEmail);
        
        echo json_encode(['success' => true, 'message' => 'Reply sent successfully and query marked as replied']);
        
    } catch (PDOException $e) {
        error_log("Reply Query API - Database Error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error occurred']);
    } catch (Exception $e) {
        error_log("Reply Query API - Email Error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to send reply email']);
    }
    
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
