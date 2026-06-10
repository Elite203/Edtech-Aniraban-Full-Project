<?php
require_once '../config.php';
session_start();

// Check if admin is authenticated
if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

try {
    // Get dashboard metrics
    $metrics = [];
    
    // Total admins
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM admins");
    $stmt->execute();
    $metrics['total_admins'] = $stmt->fetch()['total'] ?? 0;
    
    // Current Affairs Teachers
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM admins WHERE role = 'ca_teacher'");
    $stmt->execute();
    $metrics['current_affairs_teachers'] = $stmt->fetch()['total'] ?? 0;
    
    // Test Series Teachers
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM admins WHERE role = 'test_teacher'");
    $stmt->execute();
    $metrics['test_series_teachers'] = $stmt->fetch()['total'] ?? 0;
    
    // Total Students
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM students");
    $stmt->execute();
    $metrics['total_students'] = $stmt->fetch()['total'] ?? 0;
    
    // New Students (this month)
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM students WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");
    $stmt->execute();
    $metrics['new_students_this_month'] = $stmt->fetch()['total'] ?? 0;
    
    // Total Courses Available
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM courses");
    $stmt->execute();
    $metrics['test_series_courses'] = $stmt->fetch()['total'] ?? 0;

    
    // Total Questions Created
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM questions");
    $stmt->execute();
    $metrics['total_questions'] = $stmt->fetch()['total'] ?? 0;
    
    // Total Solution Pages
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM solutions");
    $stmt->execute();
    $metrics['total_solutions'] = $stmt->fetch()['total'] ?? 0;
    
    // Current Affairs Pages
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM current_affairs");
    $stmt->execute();
    $metrics['current_affairs_pages'] = $stmt->fetch()['total'] ?? 0;
    
    // Current Affairs Categories
    $stmt = $pdo->prepare("SELECT COUNT(DISTINCT category) as total FROM current_affairs");
    $stmt->execute();
    $metrics['current_affairs_categories'] = $stmt->fetch()['total'] ?? 0;
    
    // Monthly Tests Available
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM monthly_tests");
    $stmt->execute();
    $metrics['monthly_tests'] = $stmt->fetch()['total'] ?? 0;
    
    // Sales data for pie chart (last 6 months)
    $stmt = $pdo->prepare("
        SELECT 
            MONTH(created_at) as month,
            YEAR(created_at) as year,
            COUNT(*) as sales_count,
            SUM(amount) as sales_amount
        FROM orders 
        WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
        GROUP BY MONTH(created_at), YEAR(created_at)
        ORDER BY year, month
    ");
    $stmt->execute();
    $metrics['sales_data'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    
    // Visitors data for graph (last 30 days)
    $stmt = $pdo->prepare("
        SELECT 
            DATE(visit_date) as date,
            COUNT(*) as visitors
        FROM visitor_logs 
        WHERE visit_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        GROUP BY DATE(visit_date)
        ORDER BY date
    ");
    $stmt->execute();
    $metrics['visitors_data'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    
    // Recent activities
    $stmt = $pdo->prepare("
        SELECT 
            activity_type,
            description,
            created_at,
            user_name
        FROM activity_logs 
        ORDER BY created_at DESC 
        LIMIT 10
    ");
    $stmt->execute();
    $metrics['recent_activities'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    
    echo json_encode([
        'success' => true,
        'data' => $metrics
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch dashboard metrics: ' . $e->getMessage()
    ]);
}
?>
