<?php
// Ensure clean JSON output
ob_start();
ini_set('display_errors', 0);
error_reporting(0);

try {
    require_once '../config.php';
} catch (Exception $e) {
    header('Content-Type: application/json');
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Configuration error'
    ]);
    exit;
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Only POST method is allowed'
    ]);
    exit;
}

// Get POST data (handle both JSON and form-data)
$input = null;
$photo_path = null;

// Check if it's a file upload request (multipart/form-data)
if (isset($_POST['action']) && ($_POST['action'] === 'update_profile' || $_POST['action'] === 'update_photo')) {
    $input = $_POST;
    
    // Handle photo upload
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        $file_type = $_FILES['photo']['type'];
        
        if (!in_array($file_type, $allowed_types)) {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Only JPEG, PNG, and GIF files are allowed'
            ]);
            exit;
        }
        
        // Check file size (max 5MB)
        if ($_FILES['photo']['size'] > 5 * 1024 * 1024) {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'File size must be less than 5MB'
            ]);
            exit;
        }
        
        // Read file content as binary data
        $photo_path = file_get_contents($_FILES['photo']['tmp_name']);
        
        if ($photo_path === false) {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Failed to read photo data'
            ]);
            exit;
        }
    }
} else {
    // Handle JSON data
    $input = json_decode(file_get_contents('php://input'), true);
}

if (!$input) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Invalid data received'
    ]);
    exit;
}

// Validate required fields based on action type
$action = $input['action'] ?? '';

if ($action === 'update_profile') {
    // Profile update validation
    $required_fields = ['first_name', 'last_name', 'number', 'student_id'];
    $missing_fields = [];
    
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            $missing_fields[] = $field;
        }
    }
    
    if (!empty($missing_fields)) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Missing required fields: ' . implode(', ', $missing_fields)
        ]);
        exit;
    }
    
    // Sanitize input data
    $student_id = trim($input['student_id']);
    $first_name = trim($input['first_name']);
    $last_name = trim($input['last_name']);
    $number = trim($input['number']);
    $age = isset($input['age']) ? trim($input['age']) : null;
    $date_of_birth = isset($input['date_of_birth']) ? trim($input['date_of_birth']) : null;
    $state = isset($input['state']) ? trim($input['state']) : 'Maharashtra';
    
    // Validate names (only letters allowed, no numbers, spaces, or special characters)
    if (!preg_match('/^[a-zA-Z]+$/', $first_name) || !preg_match('/^[a-zA-Z]+$/', $last_name)) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Names must contain only letters and no spaces or special characters'
        ]);
        exit;
    }
    
    // Validate age if provided
    if ($age !== null && $age !== '') {
        if (!is_numeric($age) || $age < 1 || $age > 120) {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Age must be a number between 1 and 120'
            ]);
            exit;
        }
    }
    
    // Validate date of birth if provided
    if ($date_of_birth !== null && $date_of_birth !== '') {
        $date_obj = DateTime::createFromFormat('Y-m-d', $date_of_birth);
        if (!$date_obj || $date_obj->format('Y-m-d') !== $date_of_birth) {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Invalid date of birth format. Use YYYY-MM-DD'
            ]);
            exit;
        }
        
        // Check if date is not in the future
        if ($date_obj > new DateTime()) {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Date of birth cannot be in the future'
            ]);
            exit;
        }
    }
    
    // Validate phone number (exactly 10 digits)
    if (!preg_match('/^[0-9]{10}$/', $number)) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Phone number must be exactly 10 digits'
        ]);
        exit;
    }
    
    try {
        // Check if student exists
        $stmt = $pdo->prepare("SELECT id FROM students WHERE id = ?");
        $stmt->execute([$student_id]);
        $student = $stmt->fetch();
        
        if (!$student) {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Student not found'
            ]);
            exit;
        }
        
        // Build update query based on whether photo was uploaded
        if ($photo_path) {
            $stmt = $pdo->prepare("UPDATE students SET first_name = ?, last_name = ?, number = ?, age = ?, date_of_birth = ?, state = ?, photo = ?, updated_at = NOW() WHERE id = ?");
            $result = $stmt->execute([$first_name, $last_name, $number, $age, $date_of_birth, $state, $photo_path, $student_id]);
        } else {
            $stmt = $pdo->prepare("UPDATE students SET first_name = ?, last_name = ?, number = ?, age = ?, date_of_birth = ?, state = ?, updated_at = NOW() WHERE id = ?");
            $result = $stmt->execute([$first_name, $last_name, $number, $age, $date_of_birth, $state, $student_id]);
        }
        
        if ($result) {
            // Get updated student data
            $stmt = $pdo->prepare("SELECT id, first_name, last_name, number, age, date_of_birth, state, photo FROM students WHERE id = ?");
            $stmt->execute([$student_id]);
            $updated_student = $stmt->fetch();
            
            // Convert photo BLOB to base64 if exists
            if ($updated_student['photo']) {
                $updated_student['photo'] = 'data:image/jpeg;base64,' . base64_encode($updated_student['photo']);
            }
            
            ob_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully',
                'student' => $updated_student
            ]);
            exit;
        } else {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Failed to update profile'
            ]);
        }
        
    } catch (PDOException $e) {
        error_log("Profile update error: " . $e->getMessage());
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Database error occurred. Please try again later.'
        ]);
    }
    
} elseif ($action === 'update_photo') {
    // Photo-only update validation
    $required_fields = ['student_id'];
    $missing_fields = [];
    
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            $missing_fields[] = $field;
        }
    }
    
    if (!empty($missing_fields)) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Missing required fields: ' . implode(', ', $missing_fields)
        ]);
        exit;
    }
    
    if (!$photo_path) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'No photo file provided'
        ]);
        exit;
    }
    
    $student_id = trim($input['student_id']);
    
    try {
        // Check if student exists
        $stmt = $pdo->prepare("SELECT id, first_name, last_name, number, age, date_of_birth FROM students WHERE id = ?");
        $stmt->execute([$student_id]);
        $student = $stmt->fetch();
        
        if (!$student) {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Student not found'
            ]);
            exit;
        }
        
        // Update only the photo
        $stmt = $pdo->prepare("UPDATE students SET photo = ?, updated_at = NOW() WHERE id = ?");
        $result = $stmt->execute([$photo_path, $student_id]);
        
        if ($result) {
            // Get updated student data
            $stmt = $pdo->prepare("SELECT id, first_name, last_name, number, age, date_of_birth, photo FROM students WHERE id = ?");
            $stmt->execute([$student_id]);
            $updated_student = $stmt->fetch();
            
            // Convert photo BLOB to base64 if exists
            if ($updated_student['photo']) {
                $updated_student['photo'] = 'data:image/jpeg;base64,' . base64_encode($updated_student['photo']);
            }
            
            ob_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Profile picture updated successfully',
                'student' => $updated_student
            ]);
            exit;
        } else {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Failed to update profile picture'
            ]);
        }
        
    } catch (PDOException $e) {
        error_log("Photo update error: " . $e->getMessage());
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Database error occurred. Please try again later.'
        ]);
    }
    
} elseif ($action === 'change_password') {
    // Password change validation
    $required_fields = ['student_id', 'current_password', 'new_password'];
    $missing_fields = [];
    
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            $missing_fields[] = $field;
        }
    }
    
    if (!empty($missing_fields)) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Missing required fields: ' . implode(', ', $missing_fields)
        ]);
        exit;
    }
    
    $student_id = trim($input['student_id']);
    $current_password = trim($input['current_password']);
    $new_password = trim($input['new_password']);
    
    // Check password length
    if (strlen($new_password) < 6) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'New password must be at least 6 characters long'
        ]);
        exit;
    }
    
    try {
        // Get current password from database
        $stmt = $pdo->prepare("SELECT password FROM students WHERE id = ?");
        $stmt->execute([$student_id]);
        $student = $stmt->fetch();
        
        if (!$student) {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Student not found'
            ]);
            exit;
        }
        
        // Verify current password (plain text comparison)
        if ($student['password'] !== $current_password) {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Current password is incorrect'
            ]);
            exit;
        }
        
        // Update password
        $stmt = $pdo->prepare("UPDATE students SET password = ?, updated_at = NOW() WHERE id = ?");
        $result = $stmt->execute([$new_password, $student_id]);
        
        if ($result) {
            ob_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Password updated successfully'
            ]);
            exit;
        } else {
            ob_clean();
            echo json_encode([
                'success' => false,
                'error' => 'Failed to update password'
            ]);
        }
        
    } catch (PDOException $e) {
        error_log("Password update error: " . $e->getMessage());
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Database error occurred. Please try again later.'
        ]);
    }
    
} else {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Invalid action specified'
    ]);
    exit;
}
?>
