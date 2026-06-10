<?php
// Handle form POST from Paytm (Callback URL for course referral purchases)
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
    $price_paid = isset($_POST['TXNAMOUNT']) ? $_POST['TXNAMOUNT'] : '0.00';
    
    // Parse order_id: CSR_{TIMESTAMP}_{STUDENT_ID}_{REFERRER_ID}_{COURSE_ID}
    $parts = explode('_', $order_id);
    if (count($parts) >= 5) {
        $student_id = $parts[2];
        $referrer_id = $parts[3];
        $course_id = $parts[4];
        
        $purchase_date = date('Y-m-d');
        // 6 months validity = 1 day for testing, +1 day referral bonus = 2 days total
        $expiry_date = date('Y-m-d', strtotime('+2 days')); 

        try {
            $pdo->beginTransaction();

            // 1. Get the referee pending purchase ID to update
            $stmt_referee_sub = $pdo->prepare("SELECT id FROM test_series_purchases WHERE order_id = ? AND status = 'pending' LIMIT 1");
            $stmt_referee_sub->execute([$order_id]);
            $referee_sub = $stmt_referee_sub->fetch(PDO::FETCH_ASSOC);

            if ($referee_sub) {
                $referee_purchase_id = $referee_sub['id'];

                // Update referee purchase status to active
                $stmt_update_referee = $pdo->prepare("
                    UPDATE test_series_purchases 
                    SET status = 'active', purchase_date = ?, expiry_date = COALESCE(expiry_date, ?) 
                    WHERE id = ?
                ");
                $stmt_update_referee->execute([$purchase_date, $expiry_date, $referee_purchase_id]);

                // 2. Fetch referrer active purchase for this course to extend and link
                $stmt_active_ref = $pdo->prepare("
                    SELECT id, expiry_date 
                    FROM test_series_purchases 
                    WHERE student_id = ? AND course_id = ? AND expiry_date >= ? AND status = 'active' 
                    ORDER BY expiry_date DESC LIMIT 1
                ");
                $stmt_active_ref->execute([$referrer_id, $course_id, $purchase_date]);
                $referrer_sub = $stmt_active_ref->fetch(PDO::FETCH_ASSOC);

                if ($referrer_sub) {
                    $referrer_purchase_id = $referrer_sub['id'];

                    // Check referrer limit of 12 referrals
                    $stmt_count = $pdo->prepare("SELECT COUNT(*) FROM test_series_referrals WHERE referrer_purchase_id = ?");
                    $stmt_count->execute([$referrer_purchase_id]);
                    $referral_count = (int)$stmt_count->fetchColumn();

                    // Check mutual referral again
                    $stmt_cross = $pdo->prepare("
                        SELECT id FROM test_series_referrals 
                        WHERE course_id = ? AND ((referrer_id = ? AND referee_id = ?) OR (referrer_id = ? AND referee_id = ?))
                    ");
                    $stmt_cross->execute([$course_id, $referrer_id, $student_id, $student_id, $referrer_id]);
                    $cross = $stmt_cross->fetch(PDO::FETCH_ASSOC);

                    if ($referral_count < 12 && !$cross) {
                        // Extend referrer expiry date by +1 day
                        $new_ref_expiry = date('Y-m-d', strtotime($referrer_sub['expiry_date'] . ' +1 days'));
                        $stmt_update_ref = $pdo->prepare("UPDATE test_series_purchases SET expiry_date = ? WHERE id = ?");
                        $stmt_update_ref->execute([$new_ref_expiry, $referrer_purchase_id]);

                        // Log referral connection
                        $stmt_ref_log = $pdo->prepare("
                            INSERT INTO test_series_referrals 
                            (referrer_id, referee_id, course_id, referrer_purchase_id, referee_purchase_id) 
                            VALUES (?, ?, ?, ?, ?)
                        ");
                        $stmt_ref_log->execute([$referrer_id, $student_id, $course_id, $referrer_purchase_id, $referee_purchase_id]);
                    }
                }
            }

            $pdo->commit();
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log("Database error processing course referral payment: " . $e->getMessage());
        }

        header("Location: " . $base_url . "/test-series-referral?payment=success&course_id=" . $course_id . "&ref=" . $referrer_id . "&order_id=" . urlencode($order_id) . "&expiry_date=" . urlencode($expiry_date));
        exit;
    }
}

// Redirect on failure and cleanup pending orders
if (isset($_POST['ORDERID'])) {
    $order_id = $_POST['ORDERID'];
    $parts = explode('_', $order_id);
    if (count($parts) >= 5) {
        $referrer_id = $parts[3];
        $course_id = $parts[4];
        
        try {
            $stmt = $pdo->prepare("DELETE FROM test_series_purchases WHERE order_id = ? AND status = 'pending'");
            $stmt->execute([$order_id]);
        } catch (PDOException $e) {
            error_log("Database error cleaning up failed pending course referrals: " . $e->getMessage());
        }
        
        header("Location: " . $base_url . "/test-series-referral?payment=failed&course_id=" . $course_id . "&ref=" . $referrer_id);
        exit;
    }
}

header("Location: " . $base_url . "/courses");
exit;
?>
