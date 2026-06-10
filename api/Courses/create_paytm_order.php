<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';
require_once '../CurrentAffairs/PaytmChecksum.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['student_id']) || !isset($data['courses']) || empty($data['courses'])) {
        throw new Exception("student_id and courses list are required");
    }

    $student_id = $data['student_id'];
    $courses = $data['courses'];
    $price = isset($data['price']) ? (float)$data['price'] : 0.00;

    // Fetch student details
    $stmt = $pdo->prepare("SELECT * FROM students WHERE id = ?");
    $stmt->execute([$student_id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception("Student not found (ID: " . var_export($student_id, true) . ")");
    }

    $paytm_mid = $_ENV['PAYTM_MID'] ?? getenv('PAYTM_MID');
    $paytm_merchant_key = $_ENV['PAYTM_MERCHANT_KEY'] ?? getenv('PAYTM_MERCHANT_KEY');
    
    if (empty($paytm_mid) || empty($paytm_merchant_key)) {
        throw new Exception("Paytm credentials not configured in environment settings.");
    }

    // Generate unique order ID: CS{STUDENT_ID}T{SHORT_TIMESTAMP}
    $order_id = "CS" . $student_id . "T" . substr(time(), -7);
    
    // Calculate subtotal of courses
    $subtotal = 0.00;
    foreach ($courses as $c) {
        $subtotal += (float)$c['price'];
    }

    // Determine the discount ratio to allocate to each item
    $discount_ratio = 1.00;
    if ($subtotal > 0) {
        $discount_ratio = $price / $subtotal;
    }

    // Clean up expired pending orders (older than 15 minutes)
    try {
        $pdo->exec("DELETE FROM test_series_purchases WHERE status = 'pending' AND created_at < NOW() - INTERVAL 15 MINUTE");
    } catch (Exception $e) {}

    // Begin transaction to record pending orders
    $pdo->beginTransaction();

    // Prepare statement for pending insertions with calculated expiry_date
    $stmt_insert = $pdo->prepare("
        INSERT INTO test_series_purchases (student_id, course_id, price_paid, status, order_id, expiry_date) 
        VALUES (?, ?, ?, 'pending', ?, ?)
    ");

    foreach ($courses as $c) {
        $course_id = $c['id'];
        $course_price = (float)$c['price'];
        $allocated_price = $course_price * $discount_ratio;

        $validity = isset($c['validity']) ? $c['validity'] : '12';
        $days = ($validity === '6') ? 1 : 2; // Testing: 6 months = 1 day, 1 year = 2 days
        $expiry_date = date('Y-m-d', strtotime("+$days days"));

        $stmt_insert->execute([$student_id, $course_id, $allocated_price, $order_id, $expiry_date]);
    }

    $pdo->commit();

    $customer_id = "CUST_" . $student_id;
    $customer_name = trim(($student['first_name'] ?? '') . ' ' . ($student['last_name'] ?? ''));
    if (empty($customer_name)) $customer_name = "Student";
    $customer_email = !empty($student['email']) ? $student['email'] : "student@example.com";
    $customer_phone = !empty($student['number']) ? $student['number'] : "7777777777";

    // Clean phone number
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
        "callbackUrl"   => $base_url . "/api/Courses/verify_paytm_payment.php",
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
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(200);
    echo json_encode([
        'status' => 'error', 
        'message' => $e->getMessage()
    ]);
}
?>
