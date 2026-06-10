<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';
require_once 'PaytmChecksum.php';

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
    $referrer_id = isset($data['referrer_id']) ? $data['referrer_id'] : null;

    // Fetch student details from database to pass to Paytm
    $stmt = $pdo->prepare("SELECT * FROM students WHERE id = ?");
    $stmt->execute([$student_id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception("Student not found (ID: " . var_export($student_id, true) . ")");
    }

    $paytm_mid = $_ENV['PAYTM_MID'] ?? getenv('PAYTM_MID');
    $paytm_merchant_key = $_ENV['PAYTM_MERCHANT_KEY'] ?? getenv('PAYTM_MERCHANT_KEY');
    
    if (empty($paytm_mid) || empty($paytm_merchant_key)) {
        $env_path = __DIR__ . '/../.env';
        $debug_info = [
            'env_file_path' => $env_path,
            'env_file_real_path' => realpath($env_path),
            'env_file_exists' => file_exists($env_path),
            'env_keys' => array_keys($_ENV)
        ];
        throw new Exception("Paytm credentials not configured in .env. Debug info: " . json_encode($debug_info));
    }

    $order_id = "ORDER_" . time() . "_" . $student_id;
    if ($referrer_id) {
        $order_id .= "_" . $referrer_id;
    }
    $customer_id = "CUST_" . $student_id;
    $customer_name = trim(($student['first_name'] ?? '') . ' ' . ($student['last_name'] ?? ''));
    if (empty($customer_name)) $customer_name = "Student";
    $customer_email = !empty($student['email']) ? $student['email'] : "student@example.com";
    $customer_phone = !empty($student['number']) ? $student['number'] : "7777777777";

    // Clean phone number (remove spaces, etc.)
    $customer_phone = preg_replace('/[^0-9]/', '', $customer_phone);
    if (strlen($customer_phone) !== 10) {
        $customer_phone = "7777777777";
    }

    $base_url = $_ENV['VITE_BACKEND_URL'] ?? getenv('VITE_BACKEND_URL');

    // Build Payload
    $paytmParams = array();
    $paytmParams["body"] = array(
        "requestType"   => "Payment",
        "mid"           => $paytm_mid,
        "websiteName"   => "DEFAULT",
        "orderId"       => $order_id,
        "callbackUrl"   => $base_url . "/api/CurrentAffairs/verify_paytm_payment.php",
        "txnAmount"     => array(
            "value"     => number_format($price, 2, '.', ''),
            "currency"  => "INR",
        ),
        "userInfo"      => array(
            "custId"    => $customer_id
        ),
    );

    // Generate Checksum
    $checksum = PaytmChecksum::generateSignature(json_encode($paytmParams["body"], JSON_UNESCAPED_SLASHES), $paytm_merchant_key);

    $paytmParams["head"] = array(
        "signature" => $checksum,
        "version"   => "v1",
        "channelId" => "WEB"
    );

    $post_data = json_encode($paytmParams, JSON_UNESCAPED_SLASHES);

    // Production Endpoint
    $url = "https://secure.paytmpayments.com/theia/api/v1/initiateTransaction?mid=" . $paytm_mid . "&orderId=" . $order_id;

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
    
    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        throw new Exception("cURL Error: " . $err);
    }

    $responseData = json_decode($response, true);

    if (isset($responseData['body']['txnToken'])) {
        echo json_encode([
            'status' => 'success',
            'txnToken' => $responseData['body']['txnToken'],
            'order_id' => $order_id,
            'amount' => number_format($price, 2, '.', ''),
            'mid' => $paytm_mid
        ]);
    } else {
        $msg = isset($responseData['body']['resultInfo']['resultMsg']) ? $responseData['body']['resultInfo']['resultMsg'] : 'Failed to initiate Paytm transaction';
        throw new Exception("Paytm Error: " . $msg);
    }

} catch (Exception $e) {
    http_response_code(200);
    echo json_encode([
        'status' => 'error', 
        'message' => $e->getMessage(),
        'debug_response' => isset($responseData) ? $responseData : null,
        'debug_request' => isset($paytmParams) ? $paytmParams : null
    ]);
}
?>
