<?php
session_start(); 
// Connect to the database
$conn = new mysqli('localhost', 'root', '', 'physical_therapy');

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    $username = $_POST['username']; 
    $password = $_POST['password']; 
}


$stmt = $conn->prepare("SELECT therapist_id, admin_id, username, password, permission FROM users WHERE username = ?"); 
$stmt->bind_param("s", $username);
$stmt->execute(); 
$result = $stmt->get_result(); 
$user = $result->fetch_assoc();
$result_name = $user['username']; 
$result_pass = $user['password']; 
$permission = $user['permission']; 


if ($permission == 1) {
    $adminId = $user['admin_id']; 
    $stmtTwo = $conn->prepare("SELECT name FROM admin WHERE id = ?");
    $stmtTwo->bind_param("s", $adminId); 
} elseif ($permission == 2) {
    $therapistId = $user['therapist_id']; 
    $stmtTwo = $conn->prepare("SELECT name FROM Therapists WHERE id = ?");
    $stmtTwo->bind_param("s", $therapistId); 
}

$stmtTwo->execute(); 
$resultTwo = $stmtTwo->get_result(); 
$row = $resultTwo->fetch_assoc();
$name = $row['name']; 



if ($result_pass === $password){
    echo json_encode('CORRECT'); 
    $_SESSION['name'] = $name;
    $_SESSION['permission'] = $permission; 

}else{
    echo json_encode('INVALID'); 
}


?>