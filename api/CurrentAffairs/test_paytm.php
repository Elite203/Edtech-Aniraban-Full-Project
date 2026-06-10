<?php
require_once 'PaytmChecksum.php';

$paytm_mid = "bPlxwQ13094918488206";
$paytm_merchant_key = "Dg042VaEYmiDsFFT";

$order_id = "TEST_" . time();
$customer_id = "CUST_1";

function testCallbackUrl($callbackUrl, $paytm_mid, $paytm_merchant_key, $order_id, $customer_id) {
    $paytmParams = array();
    $paytmParams["body"] = array(
        "requestType"   => "Payment",
        "mid"           => $paytm_mid,
        "websiteName"   => "WEBSTAGING",
        "orderId"       => $order_id,
        "callbackUrl"   => $callbackUrl,
        "txnAmount"     => array(
            "value"     => "1.00",
            "currency"  => "INR",
        ),
        "userInfo"      => array(
            "custId"    => $customer_id,
        ),
    );

    $checksum = PaytmChecksum::generateSignature(json_encode($paytmParams["body"], JSON_UNESCAPED_SLASHES), $paytm_merchant_key);
    $paytmParams["head"] = array(
        "signature" => $checksum,
        "version"   => "v1",
        "channelId" => "WEB"
    );

    $ch = curl_init("https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid=$paytm_mid&orderId=$order_id");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paytmParams, JSON_UNESCAPED_SLASHES));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $res = curl_exec($ch);
    curl_close($ch);

    return $res;
}

echo "Testing with default securegw callback:\n";
echo testCallbackUrl("https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=" . $order_id, $paytm_mid, $paytm_merchant_key, $order_id, $customer_id) . "\n\n";

echo "Testing with simple root domain callback:\n";
echo testCallbackUrl("https://anirbansacademy.com/", $paytm_mid, $paytm_merchant_key, $order_id, $customer_id) . "\n\n";

echo "Testing with HTTP localhost callback:\n";
echo testCallbackUrl("http://localhost/callback", $paytm_mid, $paytm_merchant_key, $order_id, $customer_id) . "\n\n";
?>
