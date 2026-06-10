<?php
// Set timezone to Asia/Kolkata
date_default_timezone_set('Asia/Kolkata');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database configuration
$host = '193.203.184.228';
//$host = 'localhost';
$dbname = 'u958214831_Admin_Panel';
$username = 'u958214831_anirban';
$password = 'TBjP;y$^2Vj';

try {
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        // PERSISTENT CONNECTIONS are key here to reuse the 500 slots
        PDO::ATTR_PERSISTENT => true, 
        PDO::ATTR_TIMEOUT => 2, // Don't let a request hang for long
    ];
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, $options);
    // Set timezone to Asia/Kolkata
    $pdo->exec("SET time_zone = '+05:30'");
} catch(PDOException $e) {
    header('Content-Type: application/json', true, 500);
    echo json_encode(['success' => false, 'message' => 'DB Busy']);
    exit;
}

// Load .env variables if they exist
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines !== false) {
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value, " \t\n\r\0\x0B\""); // remove quotes
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }
}
