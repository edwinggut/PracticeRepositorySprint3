<?php
session_start();

if(isset($_SESSION['name']) && isset($_SESSION['permission'])) {
    $name = $_SESSION['name'];
    $permission = $_SESSION['permission']; 
    echo json_encode(array('name' => $name, 'permission' => $permission));
} else {
    echo json_encode(array('error' => 'Session variable not set'));
}
?>
