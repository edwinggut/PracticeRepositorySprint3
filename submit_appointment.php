<?php
// submit_patient.php

// Connect to the database
$conn = new mysqli('localhost', 'root', '', 'physical_therapy');

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve data from the POST request
    $first_name = $_POST['first_name'];
    $last_name = $_POST['last_name'];
    $dob = $_POST['dob'];  
    $certification = $_POST['certification'];  // Retrieve certification data

    // Validate the input
    if (empty($first_name) || empty($last_name) || empty($dob) || empty($certification)) {
        echo "All fields are required.";
        exit;
    }

    // Prepare SQL statement to insert patient data into the database
    $stmt = $conn->prepare("INSERT INTO patients (first_name, last_name, date_of_birth, certification) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $first_name, $last_name, $dob, $certification);  // Bind certification data

    // Execute the SQL statement
    if ($stmt->execute()) {
        echo "New patient record created successfully";
    } else {
        echo "Error: " . $stmt->error;
    }

    // Close the statement
    $stmt->close();
}

// Close the database connection
$conn->close();
?>