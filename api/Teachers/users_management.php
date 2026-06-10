<?php
require_once '../config.php';
session_start();

// Check if admin is authenticated
if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get users with pagination and filtering
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 50;
    $role = $_GET['role'] ?? '';
    $search = $_GET['search'] ?? '';
    $sort_by = $_GET['sort_by'] ?? 'created_at';
    $sort_order = $_GET['sort_order'] ?? 'DESC';
    
    $offset = ($page - 1) * $limit;
    
    try {
        $where_conditions = ["status != 'deleted'"];
        $params = [];
        
        if (!empty($role)) {
            $where_conditions[] = "role = ?";
            $params[] = $role;
        }
        
        if (!empty($search)) {
            $where_conditions[] = "(name LIKE ? OR email LIKE ? OR phone LIKE ?)";
            $search_param = "%{$search}%";
            $params[] = $search_param;
            $params[] = $search_param;
            $params[] = $search_param;
        }
        
        $where_clause = implode(' AND ', $where_conditions);
        
        // Get total count
        $count_sql = "SELECT COUNT(*) as total FROM users WHERE {$where_clause}";
        $count_stmt = $pdo->prepare($count_sql);
        $count_stmt->execute($params);
        $total_users = $count_stmt->fetch()['total'];
        
        // Get users data
        $sql = "SELECT 
                    id, name, email, phone, role, status, 
                    created_at, last_login, profile_image
                FROM users 
                WHERE {$where_clause} 
                ORDER BY {$sort_by} {$sort_order} 
                LIMIT ? OFFSET ?";
        
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => [
                'users' => $users,
                'total' => $total_users,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => ceil($total_users / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch users: ' . $e->getMessage()
        ]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    
    switch ($action) {
        case 'update_status':
            $user_id = $data['user_id'] ?? '';
            $new_status = $data['status'] ?? '';
            
            if (empty($user_id) || empty($new_status)) {
                echo json_encode(['success' => false, 'message' => 'User ID and status are required']);
                exit;
            }
            
            try {
                $stmt = $pdo->prepare("UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$new_status, $user_id]);
                
                echo json_encode(['success' => true, 'message' => 'User status updated successfully']);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => 'Failed to update user status: ' . $e->getMessage()]);
            }
            break;
            
        case 'delete_user':
            $user_id = $data['user_id'] ?? '';
            
            if (empty($user_id)) {
                echo json_encode(['success' => false, 'message' => 'User ID is required']);
                exit;
            }
            
            try {
                $stmt = $pdo->prepare("UPDATE users SET status = 'deleted', updated_at = NOW() WHERE id = ?");
                $stmt->execute([$user_id]);
                
                echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => 'Failed to delete user: ' . $e->getMessage()]);
            }
            break;
            
        case 'create_user':
            $name = $data['name'] ?? '';
            $email = $data['email'] ?? '';
            $phone = $data['phone'] ?? '';
            $role = $data['role'] ?? 'student';
            $password = $data['password'] ?? '';
            
            if (empty($name) || empty($email) || empty($password)) {
                echo json_encode(['success' => false, 'message' => 'Name, email, and password are required']);
                exit;
            }
            
            try {
                // Check if email already exists
                $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
                $stmt->execute([$email]);
                if ($stmt->fetch()) {
                    echo json_encode(['success' => false, 'message' => 'Email already exists']);
                    exit;
                }
                
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("
                    INSERT INTO users (name, email, phone, role, password, status, created_at) 
                    VALUES (?, ?, ?, ?, ?, 'active', NOW())
                ");
                $stmt->execute([$name, $email, $phone, $role, $hashed_password]);
                
                echo json_encode(['success' => true, 'message' => 'User created successfully']);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => 'Failed to create user: ' . $e->getMessage()]);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
