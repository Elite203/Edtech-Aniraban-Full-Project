<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.hostinger.com'; // Replace with your Hostinger SMTP
    $mail->SMTPAuth   = true;
    $mail->Username   = 'info@anirbansacademy.com'; // Your Hostinger email
    $mail->Password   = 'Anirban2025@@##';
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    // Recipients
    $mail->setFrom('info@anirbansacademy.com', 'ANIRBAN\'S ACADEMY');
    $mail->addAddress('solankihardik334@gmail.com', 'Recipient Name');

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'ANIRBAN\'S ACADEMY';

    $mailContent = '
    <html>
  <body
    style="
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      color: #333;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        max-width: 600px;
        margin: auto;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 10px;
        overflow: hidden;
      "
    >
      <tr>
        <td
          style="
            background-color: #3936c9;
            color: white;
            padding: 20px;
            text-align: center;
          "
        >
          <h1>Welcome to ANIRBAN\'S ACADEMY!</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px; text-align: center">
          <p>Hello <strong>Recipient Name</strong>,</p>
          <p>
            We are thrilled to have you onboard. Explore our courses and
            resources to kickstart your learning journey.
          </p>
          <br /><br /><br /><br />
          <p style="margin: 20px 0">
            <img
              src="https://anirbansacademy.com/img/logo.png"
              alt="ANIRBAN\'S ACADEMY"
              style="max-width: 50px; vertical-align: middle; margin-right: 8px"
            />
            <span style="vertical-align: middle">ANIRBAN\'S ACADEMY</span>
          </p>
        </td>
      </tr>
      <tr>
        <td
          style="
            background-color: #f1f1f1;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          "
        >
          &copy; 2025 ANIRBAN\'S ACADEMY. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
</html>
    ';

    $mail->Body = $mailContent;

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Email sent successfully!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => "Mailer Error: {$mail->ErrorInfo}"]);
}
