<?php
// Since this is a redirect URL, it is accessed by the browser, not via AJAX usually.
// So we will do a PHP redirect at the end instead of JSON.

require_once '../config.php';

$order_id = $_GET['order_id'] ?? '';
$base_url = $_ENV['VITE_BACKEND_URL'] ?? getenv('VITE_BACKEND_URL');

if (empty($order_id)) {
    header("Location: " . $base_url . "/premium-monthly-test?error=missing_order_id");
    exit;
}

$client_id = $_ENV['CASHFREE_CLIENT_ID'] ?? getenv('CASHFREE_CLIENT_ID');
$client_secret = $_ENV['CASHFREE_CLIENT_SECRET'] ?? getenv('CASHFREE_CLIENT_SECRET');

if (empty($client_id) || empty($client_secret)) {
    die("Cashfree credentials not configured");
}

// Fetch order status from Cashfree
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://sandbox.cashfree.com/pg/orders/" . urlencode($order_id));
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
    header("Location: " . $base_url . "/premium-monthly-test?error=curl_error");
    exit;
}

$responseData = json_decode($response, true);

if (isset($responseData['order_status']) && $responseData['order_status'] === 'PAID') {
    
    // We encoded student ID in the order_id: ORDER_{TIMESTAMP}_{STUDENT_ID}
    $parts = explode('_', $order_id);
    if (count($parts) >= 3) {
        $student_id = $parts[2];
        
        $purchase_date = date('Y-m-d');
        
        // Check if there is an active subscription for this student to append validity
        $stmt_active = $pdo->prepare("SELECT expiry_date FROM monthly_test_purchases WHERE student_id = ? AND expiry_date >= ? ORDER BY expiry_date DESC LIMIT 1");
        $stmt_active->execute([$student_id, $purchase_date]);
        $active_sub = $stmt_active->fetch(PDO::FETCH_ASSOC);
        
        $base_date = $purchase_date;
        if ($active_sub && strtotime($active_sub['expiry_date']) >= strtotime($purchase_date)) {
            $base_date = $active_sub['expiry_date'];
        }
        
        // Currently setting validity to 1 day for testing purposes as requested
        $expiry_date = date('Y-m-d', strtotime($base_date . ' +1 days'));
        $price_paid = isset($responseData['order_amount']) ? $responseData['order_amount'] : 10.00;

        // Check if order was already recorded to prevent duplicate inserts on page refresh
        $is_recorded = false;
        try {
            $stmt_check = $pdo->prepare("SELECT id FROM monthly_test_purchases WHERE order_id = ?");
            $stmt_check->execute([$order_id]);
            if ($stmt_check->rowCount() > 0) {
                $is_recorded = true;
            }
        } catch (PDOException $e) {
            // If order_id column does not exist, we can't reliably check for duplicates this way.
            // But we will allow the insert attempt below which handles missing order_id column.
        }
        
        if (!$is_recorded) {
            // Include order_id in the table if possible, but the original table didn't have it.
            // Wait, the original table structure: (student_id, purchase_date, expiry_date, price_paid, status)
            // If the schema doesn't have order_id, we just insert.
            try {
                // Try inserting with order_id in case the column was added
                $stmt = $pdo->prepare("INSERT INTO monthly_test_purchases (student_id, purchase_date, expiry_date, price_paid, status, order_id) VALUES (?, ?, ?, ?, 'active', ?)");
                $stmt->execute([$student_id, $purchase_date, $expiry_date, $price_paid, $order_id]);
            } catch (PDOException $e) {
                // Fallback to original insert if order_id column does not exist
                $stmt = $pdo->prepare("INSERT INTO monthly_test_purchases (student_id, purchase_date, expiry_date, price_paid, status) VALUES (?, ?, ?, ?, 'active')");
                $stmt->execute([$student_id, $purchase_date, $expiry_date, $price_paid]);
            }
        }
        
        header("Location: " . $base_url . "/premium-monthly-test?payment=success&expiry_date=" . urlencode($expiry_date) . "&order_id=" . urlencode($order_id));
        exit;
    }
}

// If payment failed or pending
header("Location: " . $base_url . "/premium-monthly-test?payment=failed");
exit;
?>
