<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check authentication
if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$admin_id = $_SESSION['admin_id'];

try {
    // Get user role
    $stmt_role = $pdo->prepare("SELECT role FROM admins WHERE id = ?");
    $stmt_role->execute([$admin_id]);
    $role_row = $stmt_role->fetch();
    $role = $role_row['role'] ?? '';

    // Auto-create passwords table if it doesn't exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `financing_passwords` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `item_type` VARCHAR(50) NOT NULL,
          `item_id` INT DEFAULT NULL,
          `password_hash` VARCHAR(255) NOT NULL,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY `uq_item` (`item_type`, `item_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $monthly_test_financing = null;
    $course_financing = [];

    // 1. Current Affairs Monthly Test stats
    if ($role === 'super_admin' || $role === 'ca_teacher') {
        $mt_total_students = null;
        $mt_months = null;

        // Only super_admin gets the data directly
        if ($role === 'super_admin') {
            // Total distinct students enrolled
            $stmt_mt_students = $pdo->prepare("
                SELECT COUNT(DISTINCT student_id) as total_students 
                FROM monthly_test_purchases 
                WHERE status != 'pending'
            ");
            $stmt_mt_students->execute();
            $mt_total_students = (int)($stmt_mt_students->fetch()['total_students'] ?? 0);

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
            $mt_months = $stmt_mt_months->fetchAll(PDO::FETCH_ASSOC) ?: [];
            foreach ($mt_months as &$m) {
                $m['total_purchases'] = (int)$m['total_purchases'];
                $m['total_amount'] = (float)($m['total_amount'] ?? 0);
            }
        }

        $monthly_test_financing = [
            'total_students' => $mt_total_students,
            'monthly_breakdown' => $mt_months
        ];
    }

    // 2. Test Series Courses stats
    if ($role === 'super_admin' || $role === 'test_teacher') {
        // Fetch courses list
        $stmt_ts_courses = $pdo->prepare("
            SELECT 
                id as course_id,
                title as course_title
            FROM courses
            ORDER BY title ASC
        ");
        $stmt_ts_courses->execute();
        $courses_list = $stmt_ts_courses->fetchAll(PDO::FETCH_ASSOC) ?: [];

        $breakdown_rows = [];
        $students_rows = [];

        if ($role === 'super_admin') {
            // Fetch course students count for super_admin
            $stmt_ts_students_all = $pdo->prepare("
                SELECT 
                    course_id,
                    COUNT(DISTINCT student_id) as total_students
                FROM test_series_purchases
                WHERE status != 'pending'
                GROUP BY course_id
            ");
            $stmt_ts_students_all->execute();
            $students_rows = $stmt_ts_students_all->fetchAll(PDO::FETCH_ASSOC) ?: [];

            // Fetch month-wise breakdown for all test series
            $stmt_ts_breakdown = $pdo->prepare("
                SELECT 
                    course_id,
                    DATE_FORMAT(purchase_date, '%Y-%m') as purchase_month,
                    COUNT(*) as total_purchases,
                    SUM(price_paid) as total_amount
                FROM test_series_purchases
                WHERE status != 'pending'
                GROUP BY course_id, DATE_FORMAT(purchase_date, '%Y-%m')
                ORDER BY purchase_month DESC
            ");
            $stmt_ts_breakdown->execute();
            $breakdown_rows = $stmt_ts_breakdown->fetchAll(PDO::FETCH_ASSOC) ?: [];
        }

        // Map breakdowns to each course
        foreach ($courses_list as $course) {
            $c_id = (int)$course['course_id'];
            $c_title = $course['course_title'];
            
            $c_students = null;
            $months = null;

            if ($role === 'super_admin') {
                $c_students = 0;
                foreach ($students_rows as $s_row) {
                    if ((int)$s_row['course_id'] === $c_id) {
                        $c_students = (int)$s_row['total_students'];
                        break;
                    }
                }

                $months = [];
                foreach ($breakdown_rows as $row) {
                    if ((int)$row['course_id'] === $c_id) {
                        $months[] = [
                            'purchase_month' => $row['purchase_month'],
                            'total_purchases' => (int)$row['total_purchases'],
                            'total_amount' => (float)($row['total_amount'] ?? 0)
                        ];
                    }
                }
            }

            $course_financing[] = [
                'course_id' => $c_id,
                'course_title' => $c_title,
                'total_students' => $c_students,
                'monthly_breakdown' => $months
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'role' => $role,
        'data' => [
            'monthly_test' => $monthly_test_financing,
            'test_series' => $course_financing
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch course financing data: ' . $e->getMessage()
    ]);
}
?>
