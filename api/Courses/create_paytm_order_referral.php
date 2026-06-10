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
    
    if (!isset($data['student_id']) || !isset($data['course_id']) || !isset($data['referrer_id'])) {
        throw new Exception("student_id, course_id, and referrer_id are required");
    }

    $student_id = $data['student_id'];
    $course_id = $data['course_id'];
    $referrer_id = $data['referrer_id'];
    $today = date('Y-m-d');

    // 1. Validations
    if ($student_id == $referrer_id) {
        throw new Exception("Self-referral is not allowed");
    }

    // Check student (referee)
    $stmt_student = $pdo->prepare("SELECT id, first_name, last_name, email, number FROM students WHERE id = ?");
    $stmt_student->execute([$student_id]);
    $student = $stmt_student->fetch(PDO::FETCH_ASSOC);
    if (!$student) {
        throw new Exception("Student (referee) not found");
    }

    // Check referrer
    $stmt_referrer = $pdo->prepare("SELECT id FROM students WHERE id = ?");
    $stmt_referrer->execute([$referrer_id]);
    if (!$stmt_referrer->fetch()) {
        throw new Exception("Referrer student not found");
    }

    // Check course and its price_six_months
    $stmt_course = $pdo->prepare("SELECT id, title, price_six_months FROM courses WHERE id = ?");
    $stmt_course->execute([$course_id]);
    $course = $stmt_course->fetch(PDO::FETCH_ASSOC);
    if (!$course) {
        throw new Exception("Course not found");
    }

    $price = (float)($course['price_six_months'] ?? 0.00);
    if ($price <= 0) {
        throw new Exception("Course does not support 6-month validity pricing or pricing is invalid");
    }

    // Check if referrer has active purchase for this course
    $stmt_referrer_sub = $pdo->prepare("SELECT id FROM test_series_purchases WHERE student_id = ? AND course_id = ? AND expiry_date >= ? AND status = 'active' LIMIT 1");
    $stmt_referrer_sub->execute([$referrer_id, $course_id, $today]);
    $referrer_sub = $stmt_referrer_sub->fetch(PDO::FETCH_ASSOC);
    if (!$referrer_sub) {
        throw new Exception("Referrer does not have an active subscription for this course");
    }

    // Check referrer referral limit (max 12 per purchase cycle)
    $stmt_count = $pdo->prepare("SELECT COUNT(*) FROM test_series_referrals WHERE referrer_purchase_id = ?");
    $stmt_count->execute([$referrer_sub['id']]);
    $referral_count = (int)$stmt_count->fetchColumn();
    if ($referral_count >= 12) {
        throw new Exception("Referrer has reached the limit of 12 referrals for this course subscription cycle");
    }

    // Check if referee already has active purchase for this course
    $stmt_referee_sub = $pdo->prepare("SELECT id FROM test_series_purchases WHERE student_id = ? AND course_id = ? AND expiry_date >= ? AND status = 'active' LIMIT 1");
    $stmt_referee_sub->execute([$student_id, $course_id, $today]);
    if ($stmt_referee_sub->fetch()) {
        throw new Exception("You already have an active subscription for this course");
    }

    // Check cross referral
    $stmt_cross = $pdo->prepare("SELECT id FROM test_series_referrals WHERE course_id = ? AND ((referrer_id = ? AND referee_id = ?) OR (referrer_id = ? AND referee_id = ?))");
    $stmt_cross->execute([$course_id, $referrer_id, $student_id, $student_id, $referrer_id]);
    if ($stmt_cross->fetch()) {
        throw new Exception("Mutual referral is not allowed");
    }

    $paytm_mid = $_ENV['PAYTM_MID'] ?? getenv('PAYTM_MID');
    $paytm_merchant_key = $_ENV['PAYTM_MERCHANT_KEY'] ?? getenv('PAYTM_MERCHANT_KEY');
    
    if (empty($paytm_mid) || empty($paytm_merchant_key)) {
        throw new Exception("Paytm credentials not configured in environment settings.");
    }

    // Generate unique order ID under length 50: CSREF_TIMESTAMP_STUDENT_REFERRER_COURSE
    $timestamp = time();
    $order_id = "CSR_" . $timestamp . "_" . $student_id . "_" . $referrer_id . "_" . $course_id;
    
    // Referral purchase expiry (6 months validity = 1 day for testing, +1 day referral bonus = 2 days total)
    $days = 2; 
    $expiry_date = date('Y-m-d', strtotime("+$days days"));

    // Clean up expired pending orders (older than 15 minutes)
    try {
        $pdo->exec("DELETE FROM test_series_purchases WHERE status = 'pending' AND created_at < NOW() - INTERVAL 15 MINUTE");
    } catch (Exception $e) {}

    // Insert pending purchase
    $pdo->beginTransaction();
    $stmt_insert = $pdo->prepare("
        INSERT INTO test_series_purchases (student_id, course_id, price_paid, status, order_id, expiry_date) 
        VALUES (?, ?, ?, 'pending', ?, ?)
    ");
    $stmt_insert->execute([$student_id, $course_id, $price, $order_id, $expiry_date]);
    $pdo->commit();

    $customer_id = "CUST_" . $student_id;
    $customer_name = trim(($student['first_name'] ?? '') . ' ' . ($student['last_name'] ?? ''));
    if (empty($customer_name)) $customer_name = "Student";
    $customer_email = !empty($student['email']) ? $student['email'] : "student@example.com";
    $customer_phone = !empty($student['number']) ? $student['number'] : "7777777777";

    $customer_phone = preg_replace('/[^0-9]/', '', $customer_phone);
    if (strlen($customer_phone) !== 10) {
        $customer_phone = "7777777777";
    }

    $base_url = $_ENV['VITE_BACKEND_URL'] ?? getenv('VITE_BACKEND_URL');

    // Build Paytm Params
    $paytmParams = array();
    $paytmParams["body"] = array(
        "requestType"   => "Payment",
        "mid"           => $paytm_mid,
        "websiteName"   => "DEFAULT",
        "orderId"       => $order_id,
        "callbackUrl"   => $base_url . "/api/Courses/verify_paytm_payment_referral.php",
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
