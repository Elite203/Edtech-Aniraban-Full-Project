<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['student_id'])) {
        throw new Exception("student_id is required");
    }

    $student_id = $data['student_id'];
    $price = isset($data['price']) ? $data['price'] : 10.00;

    // Fetch student details from database to pass to Cashfree
    $stmt = $pdo->prepare("SELECT * FROM students WHERE id = ?");
    $stmt->execute([$student_id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception("Student not found (ID: " . var_export($student_id, true) . ")");
    }

    $client_id = $_ENV['CASHFREE_CLIENT_ID'] ?? getenv('CASHFREE_CLIENT_ID');
    $client_secret = $_ENV['CASHFREE_CLIENT_SECRET'] ?? getenv('CASHFREE_CLIENT_SECRET');
    
    if (empty($client_id) || empty($client_secret)) {
        throw new Exception("Cashfree credentials not configured");
    }

    $order_id = "ORDER_" . time() . "_" . $student_id;
    $customer_id = "CUST_" . $student_id;
    $customer_name = trim(($student['first_name'] ?? '') . ' ' . ($student['last_name'] ?? ''));
    if (empty($customer_name)) $customer_name = "Student";
    $customer_email = !empty($student['email']) ? $student['email'] : "student@example.com";
    $customer_phone = !empty($student['number']) ? $student['number'] : "9999999999";

    // Clean phone number (remove spaces, etc.)
    $customer_phone = preg_replace('/[^0-9]/', '', $customer_phone);
    if (strlen($customer_phone) < 10) {
        $customer_phone = str_pad($customer_phone, 10, "0", STR_PAD_LEFT);
    } else if (strlen($customer_phone) > 10) {
        $customer_phone = substr($customer_phone, -10);
    }

    // Build Payload
    $base_url = $_ENV['VITE_BACKEND_URL'] ?? getenv('VITE_BACKEND_URL');
    $payload = [
        "order_amount" => $price,
        "order_currency" => "INR",
        "order_id" => $order_id,
        "customer_details" => [
            "customer_id" => $customer_id,
            "customer_name" => $customer_name,
            "customer_email" => $customer_email,
            "customer_phone" => $customer_phone
        ],
        "order_meta" => [
            // {order_id} is a dynamic variable supported by Cashfree but we can also just append it
            "return_url" => $base_url . "/api/CurrentAffairs/verify_cashfree_payment.php?order_id={order_id}"
        ]
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://sandbox.cashfree.com/pg/orders");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $headers = [
        "Content-Type: application/json",
        "x-api-version: 2023-08-01",
        "x-client-id: " . $client_id,
        "x-client-secret: " . $client_secret
    ];
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        throw new Exception("cURL Error: " . $err);
    }

    $responseData = json_decode($response, true);

    if (isset($responseData['payment_session_id'])) {
        // Also insert a "pending" record in DB? For now, we'll just insert on success in verify_cashfree_payment.php
        echo json_encode([
            'status' => 'success',
            'payment_session_id' => $responseData['payment_session_id'],
            'order_id' => $order_id
        ]);
    } else {
        throw new Exception("Failed to create Cashfree order: " . $response);
    }

} catch (Exception $e) {
    http_response_code(200); // Return 200 so axios parses it instead of throwing
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
