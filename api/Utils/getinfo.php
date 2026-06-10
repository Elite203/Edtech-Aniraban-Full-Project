<?php
use DeviceDetector\DeviceDetector;

// Prevent duplicate inclusion errors
if (!function_exists('get_visitor_ip_details')) {

    require_once '../vendor/autoload.php';

    /**
     * Intelligently gets the real visitor IP address.
     */
    function get_visitor_ip_details() {
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            return ['ip' => $_SERVER['HTTP_CF_CONNECTING_IP'], 'source' => 'HTTP_CF_CONNECTING_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ipList = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            return ['ip' => trim($ipList[0]), 'source' => 'HTTP_X_FORWARDED_FOR'];
        } elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
            return ['ip' => $_SERVER['HTTP_X_REAL_IP'], 'source' => 'HTTP_X_REAL_IP'];
        } elseif (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return ['ip' => $_SERVER['HTTP_CLIENT_IP'], 'source' => 'HTTP_CLIENT_IP'];
        } else {
            return ['ip' => $_SERVER['REMOTE_ADDR'], 'source' => 'REMOTE_ADDR'];
        }
    }

    /**
     * Gathers all system info without echoing JSON.
     */
    function getSystemInfo() {
        date_default_timezone_set('Asia/Kolkata'); 
        $ipDetails = get_visitor_ip_details();
        $ipAddress = $ipDetails['ip'];
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

        $dd = new DeviceDetector($userAgent);
        $dd->parse();

        $deviceInfo = [
            'type' => $dd->getDeviceName(),
            'brand' => $dd->getBrandName(),
            'model' => $dd->getModel(),
            'os' => $dd->getOs('name') . ' ' . $dd->getOs('version'),
            'browser' => $dd->getClient('name'),
            'fullUserAgent' => $userAgent
        ];

        $locationData = ['country' => 'Unknown', 'region' => 'Unknown', 'city' => 'Unknown', 'isp' => 'Unknown'];
        if (filter_var($ipAddress, FILTER_VALIDATE_IP) && $ipAddress !== '::1' && $ipAddress !== '127.0.0.1') {
            $json = @file_get_contents("http://ip-api.com/json/{$ipAddress}");
            if ($json) {
                $data = json_decode($json, true);
                if ($data && ($data['status'] ?? '') == 'success') {
                    $locationData = [
                        'country' => $data['country'] ?? 'N/A',
                        'region' => $data['regionName'] ?? 'N/A',
                        'city' => $data['city'] ?? 'N/A',
                        'isp' => $data['isp'] ?? 'N/A',
                    ];
                }
            }
        }

        return [
            'dateTime' => date('Y-m-d H:i:s'),
            'ipAddress' => $ipAddress,
            'ipDetectionSource' => $ipDetails['source'],
            'deviceInfo' => $deviceInfo,
            'location' => $locationData
        ];
    }
}

// Only output JSON if this file is accessed directly via browser/API
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    header('Content-Type: application/json');
    echo json_encode(getSystemInfo(), JSON_PRETTY_PRINT);
}
