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
        'message' => 'Configuration error'
    ]);
    exit;
}

header('Content-Type: application/json');
session_start();
ob_clean();

// Check if admin is authenticated
if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Only POST method is allowed'
    ]);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON data'
    ]);
    exit;
}

// Validate required fields
if (!isset($input['subject']) || empty(trim($input['subject']))) {
    echo json_encode([
        'success' => false,
        'message' => 'Subject is required'
    ]);
    exit;
}

if (!isset($input['description']) || empty(trim($input['description']))) {
    echo json_encode([
        'success' => false,
        'message' => 'Message content is required'
    ]);
    exit;
}

$subject = trim($input['subject']);
$description = $input['description']; // Keep HTML formatting

try {
    // Get admin info
    $stmt = $pdo->prepare("SELECT name FROM admins WHERE id = ?");
    $stmt->execute([$_SESSION['admin_id']]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    $adminName = $admin['name'] ?? 'Admin';

    // Get all active and verified students
    $stmt = $pdo->prepare("SELECT first_name, last_name, email FROM students WHERE status = 'active' AND verified = 'verified'");
    $stmt->execute();
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($students)) {
        echo json_encode([
            'success' => false,
            'message' => 'No active verified students found to send broadcast'
        ]);
        exit;
    }

    $totalStudents = count($students);
    $successfulSends = 0;
    $failedSends = 0;
    $errors = [];

    // PHPMailer configuration
    $mail = new PHPMailer(true);
    
    // Server settings
    $mail->isSMTP();
    $mail->Host = 'smtp.hostinger.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'info@anirbansacademy.com';
    $mail->Password = 'Anirban2025@@##';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;
    $mail->setFrom('info@anirbansacademy.com', 'ANIRBAN\'S ACADEMY');
    
    // Content settings
    $mail->isHTML(true);
    $mail->Subject = $subject;

    foreach ($students as $student) {
        try {
            $studentName = $student['first_name'] . ' ' . $student['last_name'];
            // Clear previous recipients
            $mail->clearAddresses();
            
            // Add current student
            $mail->addAddress($student['email'], $studentName);
            
            // Keep HTML formatting for email content
            $processedDescription = $description;
            
            // Create personalized email content
            $mailContent = '
            <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; }
                    .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; line-height: 1.6; }
                    .footer { background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                    .content a { color: #4f46e5; text-decoration: underline; word-break: break-word; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">ANIRBAN\'S ACADEMY</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>' . htmlspecialchars($studentName) . '</strong>,</p>
                        <div style="margin: 20px 0;">
                            ' . $processedDescription . '
                        </div>
                        <p style="margin-top: 30px; color: #666;">
                            Best regards,<br>
                            <strong>' . htmlspecialchars($adminName) . '</strong><br>
                            ANIRBAN\'S ACADEMY
                        </p>
                    </div>
                    <div class="footer">
                        <p style="margin: 10px 0;">
                            <img src="https://anirbansacademy.com/img/logo.png" alt="ANIRBAN\'S ACADEMY" style="max-width: 50px; vertical-align: middle; margin-right: 8px;">
                            <span style="vertical-align: middle;">ANIRBAN\'S ACADEMY</span>
                        </p>
                        <p>&copy; 2025 ANIRBAN\'S ACADEMY. All rights reserved.</p>
                        <p style="margin: 5px 0;">For support: info@anirbansacademy.com</p>
                    </div>
                </div>
            </body>
            </html>';
            
            $mail->Body = $mailContent;
            
            if ($mail->send()) {
                $successfulSends++;
            } else {
                $failedSends++;
                $errors[] = "Failed to send to {$student['email']}: " . $mail->ErrorInfo;
            }
            
        } catch (Exception $e) {
            $failedSends++;
            $errors[] = "Error sending to {$student['email']}: " . $e->getMessage();
            error_log("Broadcast mail error for {$student['email']}: " . $e->getMessage());
        }
    }

    // Log broadcast activity
    try {
        $stmt = $pdo->prepare("INSERT INTO activity_logs (activity_type, description, user_name, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->execute([
            'broadcast_email',
            "Broadcast email sent: '{$subject}' to {$successfulSends} students",
            $adminName
        ]);
    } catch (Exception $e) {
        error_log("Failed to log broadcast activity: " . $e->getMessage());
    }

    if ($successfulSends > 0) {
        $message = "Broadcast sent successfully to {$successfulSends} out of {$totalStudents} students";
        if ($failedSends > 0) {
            $message .= ". {$failedSends} emails failed to send.";
        }
        
        echo json_encode([
            'success' => true,
            'message' => $message,
            'totalSent' => $successfulSends,
            'totalFailed' => $failedSends,
            'totalStudents' => $totalStudents
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to send broadcast to any student',
            'errors' => array_slice($errors, 0, 5) // Return first 5 errors only
        ]);
    }

} catch (PDOException $e) {
    error_log("Broadcast database error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred. Please try again later.'
    ]);
} catch (Exception $e) {
    error_log("Broadcast error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while sending broadcast. Please try again.'
    ]);
}
?>
