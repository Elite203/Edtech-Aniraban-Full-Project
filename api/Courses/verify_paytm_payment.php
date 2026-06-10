<?php
// Handle form POST from Paytm (Callback URL for course purchases)
require_once '../config.php';
require_once '../CurrentAffairs/PaytmChecksum.php';

$paytm_mid = $_ENV['PAYTM_MID'] ?? getenv('PAYTM_MID');
$paytm_merchant_key = $_ENV['PAYTM_MERCHANT_KEY'] ?? getenv('PAYTM_MERCHANT_KEY');
$base_url = $_ENV['VITE_BACKEND_URL'] ?? getenv('VITE_BACKEND_URL');

$paytmParams = $_POST;
$receivedChecksum = isset($_POST['CHECKSUMHASH']) ? $_POST['CHECKSUMHASH'] : "";

// Remove CHECKSUMHASH from params for verification
unset($paytmParams['CHECKSUMHASH']);

$isVerified = false;
if (!empty($receivedChecksum) && !empty($paytm_merchant_key)) {
    $isVerified = PaytmChecksum::verifySignature($paytmParams, $paytm_merchant_key, $receivedChecksum);
}

if ($isVerified && isset($_POST['STATUS']) && $_POST['STATUS'] === 'TXN_SUCCESS') {
    $order_id = isset($_POST['ORDERID']) ? $_POST['ORDERID'] : '';
    
    $purchase_date = date('Y-m-d');
    $expiry_date = date('Y-m-d', strtotime('+2 days')); // Testing: default 2 days fallback

    try {
        // Update pending purchases to active (keeping the expiry_date if already populated)
        $stmt = $pdo->prepare("
            UPDATE test_series_purchases 
            SET status = 'active', purchase_date = ?, expiry_date = COALESCE(expiry_date, ?) 
            WHERE order_id = ? AND status = 'pending'
        ");
        $stmt->execute([$purchase_date, $expiry_date, $order_id]);
    } catch (PDOException $e) {
        error_log("Database error updating course purchase: " . $e->getMessage());
    }

    header("Location: " . $base_url . "/cart?payment=success&order_id=" . urlencode($order_id) . "&expiry_date=" . urlencode($expiry_date));
    exit;
}

// Redirect on failure and cleanup pending orders
if (isset($_POST['ORDERID'])) {
    $order_id = $_POST['ORDERID'];
    try {
        $stmt = $pdo->prepare("DELETE FROM test_series_purchases WHERE order_id = ? AND status = 'pending'");
        $stmt->execute([$order_id]);
    } catch (PDOException $e) {
        error_log("Database error cleaning up failed pending course purchases: " . $e->getMessage());
    }
}

header("Location: " . $base_url . "/cart?payment=failed");
exit;
?>
