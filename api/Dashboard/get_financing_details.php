<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$admin_id = $_SESSION['admin_id'];

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $item_type = $data['item_type'] ?? ''; // 'monthly_test' or 'test_series'
    $item_id = isset($data['item_id']) && $data['item_id'] !== '' ? (int)$data['item_id'] : null;
    $password = $data['password'] ?? '';

    if (empty($item_type) || $password === '') {
        echo json_encode(['success' => false, 'message' => 'Missing fields']);
        exit;
    }

    // Get user role
    $stmt_role = $pdo->prepare("SELECT role FROM admins WHERE id = ?");
    $stmt_role->execute([$admin_id]);
    $role = $stmt_role->fetch()['role'] ?? '';

    // Verify access rights: test_teacher cannot view monthly_test, ca_teacher cannot view test_series
    if ($role === 'test_teacher' && $item_type !== 'test_series') {
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    if ($role === 'ca_teacher' && $item_type !== 'monthly_test') {
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }

    // Check password in DB
    $stmt_pw = null;
    if ($item_type === 'monthly_test') {
        $stmt_pw = $pdo->prepare("SELECT password_hash FROM financing_passwords WHERE item_type = 'monthly_test'");
        $stmt_pw->execute();
    } else {
        $stmt_pw = $pdo->prepare("SELECT password_hash FROM financing_passwords WHERE item_type = 'test_series' AND item_id = ?");
        $stmt_pw->execute([$item_id]);
    }

    $pw_row = $stmt_pw->fetch();
    if (!$pw_row) {
        echo json_encode(['success' => false, 'message' => 'Password not configured for this item']);
        exit;
    }

    if (!password_verify($password, $pw_row['password_hash'])) {
        echo json_encode(['success' => false, 'message' => 'Incorrect password']);
        exit;
    }

    // Password verified! Fetch details
    $monthly_breakdown = [];
    $total_students = 0;

    if ($item_type === 'monthly_test') {
        // Fetch total student count
        $stmt_mt_students = $pdo->prepare("
            SELECT COUNT(DISTINCT student_id) as total_students 
            FROM monthly_test_purchases 
            WHERE status != 'pending'
        ");
        $stmt_mt_students->execute();
        $total_students = (int)($stmt_mt_students->fetch()['total_students'] ?? 0);

        // Fetch monthly breakdown
        $stmt_mt_months = $pdo->prepare("
            SELECT 
                DATE_FORMAT(purchase_date, '%Y-%m') as purchase_month,
                COUNT(*) as total_purchases,
                SUM(price_paid) as total_amount
            FROM monthly_test_purchases
            WHERE status != 'pending'
            GROUP BY DATE_FORMAT(purchase_date, '%Y-%m')
            ORDER BY purchase_month DESC
        ");
        $stmt_mt_months->execute();
        $monthly_breakdown = $stmt_mt_months->fetchAll(PDO::FETCH_ASSOC) ?: [];
        foreach ($monthly_breakdown as &$m) {
            $m['total_purchases'] = (int)$m['total_purchases'];
            $m['total_amount'] = (float)($m['total_amount'] ?? 0);
        }
    } else {
        // Fetch total student count for the specific course
        $stmt_ts_students = $pdo->prepare("
            SELECT COUNT(DISTINCT student_id) as total_students 
            FROM test_series_purchases 
            WHERE status != 'pending' AND course_id = ?
        ");
        $stmt_ts_students->execute([$item_id]);
        $total_students = (int)($stmt_ts_students->fetch()['total_students'] ?? 0);

        // Fetch monthly breakdown
        $stmt_ts_breakdown = $pdo->prepare("
            SELECT 
                DATE_FORMAT(purchase_date, '%Y-%m') as purchase_month,
                COUNT(*) as total_purchases,
                SUM(price_paid) as total_amount
            FROM test_series_purchases
            WHERE status != 'pending' AND course_id = ?
            GROUP BY DATE_FORMAT(purchase_date, '%Y-%m')
            ORDER BY purchase_month DESC
        ");
        $stmt_ts_breakdown->execute([$item_id]);
        $monthly_breakdown = $stmt_ts_breakdown->fetchAll(PDO::FETCH_ASSOC) ?: [];
        foreach ($monthly_breakdown as &$m) {
            $m['total_purchases'] = (int)$m['total_purchases'];
            $m['total_amount'] = (float)($m['total_amount'] ?? 0);
        }
    }

    echo json_encode([
        'success' => true,
        'total_students' => $total_students,
        'monthly_breakdown' => $monthly_breakdown
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to verify password and load details: ' . $e->getMessage()
    ]);
}
?>
