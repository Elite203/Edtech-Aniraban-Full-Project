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
    echo json_encode(['success' => false, 'error' => 'Configuration error']);
    exit;
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

ob_clean();

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
    exit;
}

if (!isset($input['student_id']) || !isset($input['invoice_pdf'])) {
    echo json_encode(['success' => false, 'error' => 'student_id and invoice_pdf are required']);
    exit;
}

$student_id = $input['student_id'];
$order_id = isset($input['order_id']) ? $input['order_id'] : 'Unknown';
$invoice_pdf = $input['invoice_pdf'];

try {
    // Save invoice to database
    if ($order_id !== 'Unknown') {
        $stmt = $pdo->prepare("UPDATE monthly_test_purchases SET invoice_pdf = ? WHERE student_id = ? AND order_id = ?");
        $stmt->execute([$invoice_pdf, $student_id, $order_id]);
        
        if ($stmt->rowCount() === 0) {
            // Fallback if order_id didn't match (maybe ALTER TABLE issue)
            $stmt = $pdo->prepare("UPDATE monthly_test_purchases SET invoice_pdf = ? WHERE student_id = ? ORDER BY id DESC LIMIT 1");
            $stmt->execute([$invoice_pdf, $student_id]);
        }
    } else {
        $stmt = $pdo->prepare("UPDATE monthly_test_purchases SET invoice_pdf = ? WHERE student_id = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$invoice_pdf, $student_id]);
    }

    // Fetch student details
    $stmt = $pdo->prepare("SELECT first_name, last_name, email FROM students WHERE id = ?");
    $stmt->execute([$student_id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        echo json_encode(['success' => false, 'error' => 'Student not found']);
        exit;
    }

    $name = trim($student['first_name'] . ' ' . $student['last_name']);
    $email = $student['email'];

    // Decode PDF
    $pdf_decoded = base64_decode(preg_replace('#^data:application/\w+;base64,#i', '', $invoice_pdf));

    // Send email using PHPMailer
    $mail = new PHPMailer(true);
    
    $mail->isSMTP();
    $mail->Host = 'smtp.hostinger.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'info@anirbansacademy.com';
    $mail->Password = 'Anirban2025@@##';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    $mail->setFrom('info@anirbansacademy.com', 'ANIRBAN\'S ACADEMY');
    $mail->addAddress($email, $name);

    $mail->isHTML(true);
    $mail->Subject = 'Purchase Confirmation - Premium Monthly Test';

    $mailContent = '
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #fff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <tr>
                <td style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
                    <h1>Purchase Confirmed!</h1>
                    <p>Premium Monthly Test Subscription</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 30px;">
                    <p>Hello <strong>' . htmlspecialchars($name) . '</strong>! 👋</p>
                    <p>Thank you for your purchase. Your payment was successful and your Premium Monthly Test subscription is now active.</p>
                    
                    <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #4f46e5; border-radius: 5px;">
                        <h3 style="margin: 0 0 10px 0; color: #4f46e5;">Payment Details:</h3>
                        <ul style="margin: 10px 0; padding-left: 20px; list-style: none;">
                            <li><strong>Order ID:</strong> ' . htmlspecialchars($order_id) . '</li>
                            <li><strong>Amount Paid:</strong> ₹10.00</li>
                            <li><strong>Payment Method:</strong> Paytm Online Payment</li>
                            <li><strong>Date:</strong> ' . date('d M Y, h:i A') . '</li>
                        </ul>
                    </div>
                    
                    <p>We have attached your payment invoice to this email for your records.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://anirbansacademy.com/current-affairs-data" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Access Your Tests Now</a>
                    </div>
                    
                    <p>If you have any questions or need assistance, don\'t hesitate to reach out to our support team at <a href="mailto:info@anirbansacademy.com">info@anirbansacademy.com</a></p>
                </td>
            </tr>
            <tr>
                <td style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                    <p>&copy; ' . date('Y') . ' ANIRBAN\'S ACADEMY. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>';

    $mail->Body = $mailContent;
    $mail->addStringAttachment($pdf_decoded, "Invoice_$order_id.pdf", 'base64', 'application/pdf');
    
    $mail->send();

    echo json_encode(['success' => true, 'message' => 'Invoice saved and email sent']);

} catch (Exception $e) {
    error_log("Save and Email Invoice Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
