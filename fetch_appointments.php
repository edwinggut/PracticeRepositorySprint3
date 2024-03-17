<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set response content type to JSON
header('Content-Type: application/json');

// Connect to the database
$conn = new mysqli('localhost', 'root', '', 'physical_therapy');

// Check database connection
if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error); 
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]); 
    exit;
}

// SQL query to retrieve appointments with patient details
$sql = "SELECT a.id, a.therapist_id, a.appointment_time, p.first_name, p.last_name, p.date_of_birth, a.appointment_certifications
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id";

$result = $conn->query($sql);

// Process query result
if ($result) {
    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        // Append each appointment to the appointments array
        $appointments[] = $row;
    }
    // Send appointments as JSON response
    echo json_encode($appointments);
} else {
    error_log("Error executing query: " . $conn->error); 
    echo json_encode(["error" => "Error executing query: " . $conn->error]); 
}

// Close database connection
$conn->close();
?>