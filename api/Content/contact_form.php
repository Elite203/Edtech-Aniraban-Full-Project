<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database configuration
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        // Handle form submission
        $input = json_decode(file_get_contents('php://input'), true);
        
        $firstName = trim($input['firstName'] ?? '');
        $lastName = trim($input['lastName'] ?? '');
        $email = trim($input['email'] ?? '');
        $subject = trim($input['subject'] ?? '');
        $message = trim($input['message'] ?? '');
        
        // Validation
        if (empty($firstName) || empty($lastName) || empty($email) || empty($subject) || empty($message)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit;
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Please enter a valid email address']);
            exit;
        }
              
        // Insert form data
        $stmt = $pdo->prepare("INSERT INTO contact_page (first_name, last_name, email, subject, message) VALUES (?, ?, ?, ?, ?)");
        $result = $stmt->execute([$firstName, $lastName, $email, $subject, $message]);
        
        if ($result) {
            // Send confirmation email to the user
            $mailData = [
                'firstName' => $firstName,
                'lastName' => $lastName,
                'email' => $email,
                'subject' => $subject,
                'message' => $message
            ];
            
            $mailResponse = file_get_contents(
                'https://anirbansacademy.com/api/contact_mail.php',
                false,
                stream_context_create([
                    'http' => [
                        'method' => 'POST',
                        'header' => 'Content-Type: application/json',
                        'content' => json_encode($mailData)
                    ]
                ])
            );
            
            echo json_encode([
                'success' => true, 
                'message' => 'We will reach out to you shortly'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to submit form. Please try again.']);
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (PDOException $e) {
    error_log("Contact Form Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred. Please try again later.']);
}
?>
