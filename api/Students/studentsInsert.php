<?php
ob_start();
ini_set('display_errors', 0);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../vendor/autoload.php';
require_once '../Utils/watermark_helper.php'; // <--- NEW: Include the helper file

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

// Console log the received data
error_log("StudentsInsert.php - Received data: " . json_encode($input));

if (!$input) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON data'
    ]);
    exit;
}

// Handle resend OTP request
if (isset($input['resend_otp']) && $input['resend_otp'] === true) {
    if (!isset($input['user_id']) || empty($input['user_id'])) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'User ID is required for resending OTP'
        ]);
        exit;
    }

    try {
        // Generate new OTP
        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $otp_expires_at = date('Y-m-d H:i:s', strtotime('+15 minutes'));

        // Update user with new OTP
        $stmt = $pdo->prepare("UPDATE students SET otp = ?, otp_expires_at = ? WHERE id = ? AND verified = 'pending'");
        $result = $stmt->execute([$otp, $otp_expires_at, $input['user_id']]);

        if ($result && $stmt->rowCount() > 0) {
            // Get user email
            $stmt = $pdo->prepare("SELECT email, first_name, last_name FROM students WHERE id = ?");
            $stmt->execute([$input['user_id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $fullName = $user['first_name'] . ' ' . $user['last_name'];
                // Send OTP email using PHPMailer
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
                    $mail->addAddress($user['email'], $fullName);

                    // Content
                    $mail->isHTML(true);
                    $mail->Subject = 'ANIRBAN\'S ACADEMY - Email Verification Code';

                    $mailContent = '
                    <html>
                    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                            <tr>
                                <td style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
                                    <h1>Welcome to ANIRBAN\'S ACADEMY!</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 30px;">
                                    <p>Dear <strong>' . htmlspecialchars($fullName) . '</strong>,</p>
                                    <p>Your email verification code is:</p>
                                    <div style="text-align: center; margin: 30px 0;">
                                        <span style="font-size: 36px; font-weight: bold; color: #4f46e5; background: #f3f4f6; padding: 20px; border-radius: 10px; letter-spacing: 5px;">' . $otp . '</span>
                                    </div>
                                    <p>This code will expire in 15 minutes.</p>
                                    <p>If you didn\'t request this, please ignore this email.</p>
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
                    error_log("Resend OTP Mail Error: " . $e->getMessage());
                }

                ob_clean();
                echo json_encode([
                    'success' => true,
                    'message' => 'New OTP has been sent to your email'
                ]);
                exit;
            }
        }

        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Failed to resend OTP'
        ]);
        exit;
    } catch (PDOException $e) {
        error_log("Resend OTP error: " . $e->getMessage());
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Database error occurred'
        ]);
        exit;
    }
}

// Validate required fields
$required_fields = ['first_name', 'last_name', 'email', 'password', 'number'];
$missing_fields = [];

foreach ($required_fields as $field) {
    if (!isset($input[$field]) || empty(trim($input[$field]))) {
        $missing_fields[] = $field;
    }
}

if (!empty($missing_fields)) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields: ' . implode(', ', $missing_fields)
    ]);
    exit;
}

// Sanitize input data
$first_name = trim($input['first_name']);
$last_name = trim($input['last_name']);
$email = trim(strtolower($input['email']));
$password = trim($input['password']);
$number = trim($input['number']);

// Validate names (no numbers allowed)
if (preg_match('/[0-9]/', $first_name) || preg_match('/[0-9]/', $last_name)) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Names cannot contain numbers'
    ]);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Invalid email format'
    ]);
    exit;
}

// Validate phone number (exactly 10 digits)
if (!preg_match('/^[0-9]{10}$/', $number)) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Phone number must be exactly 10 digits'
    ]);
    exit;
}

try {
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM students WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'An account with this email already exists'
        ]);
        exit;
    }

    // Generate OTP
    $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    $otp_expires_at = date('Y-m-d H:i:s', strtotime('+15 minutes'));

    // Insert new user with unverified status
    $stmt = $pdo->prepare("INSERT INTO students (first_name, last_name, email, password, number, status, verified, otp, otp_expires_at) VALUES (?, ?, ?, ?, ?, 'active', 'pending', ?, ?)");
    $result = $stmt->execute([$first_name, $last_name, $email, $password, $number, $otp, $otp_expires_at]);

    if ($result) {
        $user_id = $pdo->lastInsertId();
        $fullName = $first_name . ' ' . $last_name;

        // ============================================================
        // START WATERMARK BLOB GENERATION & UPDATE
        // ============================================================
        try {
            // Generate raw binary data using the helper
            $binaryImageData = createStudentWatermarkBlob($number);
            
            if ($binaryImageData) {
                // Update DB with BLOB
                $updateSql = "UPDATE students SET watermark_image = :w_img WHERE id = :uid";
                $updateStmt = $pdo->prepare($updateSql);
                
                // IMPORTANT: Bind as LOB (Large Object)
                $updateStmt->bindParam(':w_img', $binaryImageData, PDO::PARAM_LOB);
                $updateStmt->bindParam(':uid', $user_id);
                $updateStmt->execute();
            }
        } catch (Exception $imgEx) {
            // Log error but allow registration to proceed
            error_log("Watermark Generation Failed: " . $imgEx->getMessage());
        }
        // ============================================================
        // END WATERMARK GENERATION
        // ============================================================
        
        // Send OTP email using PHPMailer
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
            $mail->addAddress($email, $fullName);

            // Content
            $mail->isHTML(true);
            $mail->Subject = 'ANIRBAN\'S ACADEMY - Email Verification Code';

            $mailContent = '
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                    <tr>
                        <td style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
                            <h1>Welcome to ANIRBAN\'S ACADEMY!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <p>Dear <strong>' . htmlspecialchars($fullName) . '</strong>,</p>
                            <p>Thank you for registering with us! To complete your registration, please verify your email address.</p>
                            <p>Your email verification code is:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <span style="font-size: 36px; font-weight: bold; color: #4f46e5; background: #f3f4f6; padding: 20px; border-radius: 10px; letter-spacing: 5px;">' . $otp . '</span>
                            </div>
                            <p>This code will expire in 15 minutes.</p>
                            <p>If you didn\'t create this account, please ignore this email.</p>
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
            error_log("Registration OTP Mail Error: " . $e->getMessage());
            $mail_sent = false;
        }
        
        ob_clean();
        echo json_encode([
            'success' => true,
            'message' => 'Account created! Please check your email for verification code.',
            'user_id' => $user_id,
            'mail_sent' => $mail_sent
        ]);
    } else {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Failed to create account. Please try again.'
        ]);
    }

} catch (PDOException $e) {
    // Log error (you might want to log this to a file instead)
    error_log("User registration error: " . $e->getMessage());
    
    if ($e->getCode() == 23000) {
        // Duplicate entry error
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'An account with this email already exists'
        ]);
    } else {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Database error occurred. Please try again later.'
        ]);
    }
}
?>
