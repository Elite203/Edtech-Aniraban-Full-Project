<?php
ob_start();
ini_set('display_errors', 0);

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
if (!isset($input['user_id']) || !isset($input['otp'])) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'User ID and OTP are required'
    ]);
    exit;
}

$user_id = trim($input['user_id']);
$otp = trim($input['otp']);

// Validate OTP format (6 digits)
if (!preg_match('/^[0-9]{6}$/', $otp)) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'OTP must be 6 digits'
    ]);
    exit;
}

try {
    // Check if user exists and OTP matches
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, email, otp, otp_expires_at FROM students WHERE id = ? AND verified = 'pending'");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'User not found or already verified'
        ]);
        exit;
    }

    $studentName = $user['first_name'] . ' ' . $user['last_name'];

    // Check if OTP has expired
    $current_time = new DateTime();
    $expiry_time = new DateTime($user['otp_expires_at']);

    if ($current_time > $expiry_time) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'OTP has expired. Please request a new one.'
        ]);
        exit;
    }

    // Verify OTP
    if ($user['otp'] !== $otp) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Invalid OTP. Please check and try again.'
        ]);
        exit;
    }

    // Update user as verified and clear OTP fields
    $stmt = $pdo->prepare("UPDATE students SET verified = 'verified', otp = NULL, otp_expires_at = NULL WHERE id = ?");
    $result = $stmt->execute([$user_id]);

    if ($result) {
        // Send welcome email
        $welcome_response = file_get_contents("https://anirbansacademy.com/api/student_welcome_mail.php", false, stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/json',
                'content' => json_encode([
                    'user_id' => $user_id,
                    'name' => $studentName,
                    'email' => $user['email']
                ])
            ]
        ]));

        ob_clean();
        echo json_encode([
            'success' => true,
            'message' => 'Email verification successful! Welcome to ANIRBAN\'S ACADEMY.'
        ]);
    } else {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Failed to verify account. Please try again.'
        ]);
    }

} catch (PDOException $e) {
    error_log("Email verification error: " . $e->getMessage());
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred. Please try again later.'
    ]);
} catch (Exception $e) {
    error_log("General verification error: " . $e->getMessage());
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'An error occurred. Please try again later.'
    ]);
}
?>
