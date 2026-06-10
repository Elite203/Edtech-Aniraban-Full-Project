<?php
// Handle form POST from Paytm (Callback URL)
require_once '../config.php';
require_once 'PaytmChecksum.php';

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
    $price_paid = isset($_POST['TXNAMOUNT']) ? $_POST['TXNAMOUNT'] : '10.00';
    
    // We encoded student ID in the order_id: ORDER_{TIMESTAMP}_{STUDENT_ID}[_{REFERRER_ID}]
    $parts = explode('_', $order_id);
    if (count($parts) >= 3) {
        $student_id = $parts[2];
        $referrer_id = isset($parts[3]) ? $parts[3] : null;
        
        // Automatically update expired records status to 'expired'
        $stmt_update = $pdo->prepare("UPDATE monthly_test_purchases SET status = 'expired' WHERE expiry_date < ? AND status = 'active'");
        $stmt_update->execute([date('Y-m-d')]);
        
        $purchase_date = date('Y-m-d');
        
        // Check if there is an active subscription for this student to append validity
        $stmt_active = $pdo->prepare("SELECT expiry_date FROM monthly_test_purchases WHERE student_id = ? AND expiry_date >= ? ORDER BY expiry_date DESC LIMIT 1");
        $stmt_active->execute([$student_id, $purchase_date]);
        $active_sub = $stmt_active->fetch(PDO::FETCH_ASSOC);
        
        $base_date = $purchase_date;
        if ($active_sub && strtotime($active_sub['expiry_date']) >= strtotime($purchase_date)) {
            $base_date = $active_sub['expiry_date'];
        }
        
        // Referral validity extension logic
        $referrer_purchase_id = null;
        $extra_days = 0;
        if ($referrer_id && $referrer_id != $student_id && !$active_sub) {
            // Check if referrer has an active subscription
            $stmt_active_ref = $pdo->prepare("SELECT id, expiry_date FROM monthly_test_purchases WHERE student_id = ? AND expiry_date >= ? AND status = 'active' ORDER BY expiry_date DESC LIMIT 1");
            $stmt_active_ref->execute([$referrer_id, $purchase_date]);
            $referrer_sub = $stmt_active_ref->fetch(PDO::FETCH_ASSOC);
            
            if ($referrer_sub) {
                // Ensure no cross-referral relationship already exists
                $stmt_cross = $pdo->prepare("SELECT id FROM monthly_test_referrals WHERE (referrer_id = ? AND referee_id = ?) OR (referrer_id = ? AND referee_id = ?)");
                $stmt_cross->execute([$referrer_id, $student_id, $student_id, $referrer_id]);
                $cross = $stmt_cross->fetch(PDO::FETCH_ASSOC);

                if (!$cross) {
                    // Check if referrer has reached their limit of 12 referrals for this specific purchase ID
                    try {
                        $stmt_count = $pdo->prepare("SELECT COUNT(*) FROM monthly_test_referrals WHERE referrer_purchase_id = ?");
                        $stmt_count->execute([$referrer_sub['id']]);
                        $referral_count = $stmt_count->fetchColumn();
                        
                        if ($referral_count < 12) {
                            $referrer_purchase_id = $referrer_sub['id'];
                            $extra_days = 1; // Referee gets +1 extra day of validity
                        }
                    } catch (PDOException $e) {
                        // Ignore if referrals table doesn't exist yet
                    }
                }
            }
        }
        
        // Fetch validity days from monthly_test_pricing dynamically
        $validity_days = 1;
        try {
            $pricing_stmt = $pdo->prepare("SELECT validity_days FROM monthly_test_pricing WHERE id = 1");
            $pricing_stmt->execute();
            $pricing_row = $pricing_stmt->fetch(PDO::FETCH_ASSOC);
            if ($pricing_row) {
                $validity_days = (int)$pricing_row['validity_days'];
            }
        } catch (Exception $e) {}

        $total_days = $validity_days + $extra_days;
        $expiry_date = date('Y-m-d', strtotime($base_date . ' + ' . $total_days . ' days'));


        $is_recorded = false;
        $referee_purchase_id = null;
        try {
            $stmt_check = $pdo->prepare("SELECT id FROM monthly_test_purchases WHERE order_id = ?");
            $stmt_check->execute([$order_id]);
            $existing_row = $stmt_check->fetch(PDO::FETCH_ASSOC);
            if ($existing_row) {
                $is_recorded = true;
                $referee_purchase_id = $existing_row['id'];
            }
        } catch (PDOException $e) {
            // Ignore if column or check failed
        }
        
        if (!$is_recorded) {
            try {
                // Try inserting with order_id in case the column was added
                $stmt = $pdo->prepare("INSERT INTO monthly_test_purchases (student_id, purchase_date, expiry_date, price_paid, status, order_id) VALUES (?, ?, ?, ?, 'active', ?)");
                $stmt->execute([$student_id, $purchase_date, $expiry_date, $price_paid, $order_id]);
                $referee_purchase_id = $pdo->lastInsertId();
            } catch (PDOException $e) {
                // Fallback to original insert if order_id column does not exist
                $stmt = $pdo->prepare("INSERT INTO monthly_test_purchases (student_id, purchase_date, expiry_date, price_paid, status) VALUES (?, ?, ?, ?, 'active')");
                $stmt->execute([$student_id, $purchase_date, $expiry_date, $price_paid]);
                $referee_purchase_id = $pdo->lastInsertId();
            }
            
            // Log successful referral and extend referrer's validity if applicable
            if ($referrer_purchase_id && $referee_purchase_id) {
                try {
                    // Extend referrer's expiry date by +1 day
                    $new_ref_expiry = date('Y-m-d', strtotime($referrer_sub['expiry_date'] . ' +1 days'));
                    $stmt_update_ref = $pdo->prepare("UPDATE monthly_test_purchases SET expiry_date = ? WHERE id = ?");
                    $stmt_update_ref->execute([$new_ref_expiry, $referrer_purchase_id]);
                    
                    // Insert connection into monthly_test_referrals
                    $stmt_ref_log = $pdo->prepare("INSERT INTO monthly_test_referrals (referrer_id, referee_id, referrer_purchase_id, referee_purchase_id) VALUES (?, ?, ?, ?)");
                    $stmt_ref_log->execute([$referrer_id, $student_id, $referrer_purchase_id, $referee_purchase_id]);
                } catch (PDOException $e) {
                    // Ignore errors so referee's purchase recording doesn't fail
                }
            }
        }
        
        $redirect_page = $referrer_id ? "/premium-monthly-test-referral" : "/premium-monthly-test";
        header("Location: " . $base_url . $redirect_page . "?payment=success&expiry_date=" . urlencode($expiry_date) . "&order_id=" . urlencode($order_id));
        exit;
    }
}

// Redirect on failure
$redirect_page = "/premium-monthly-test";
if (isset($_POST['ORDERID'])) {
    $order_id = $_POST['ORDERID'];
    $parts = explode('_', $order_id);
    if (count($parts) >= 4) {
        $redirect_page = "/premium-monthly-test-referral";
    }
}
header("Location: " . $base_url . $redirect_page . "?payment=failed");
exit;
?>
