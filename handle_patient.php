<?php
// handle_patient.php

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
    $dob = $_POST['dob'];  // Assuming the date of birth is in 'YYYY-MM-DD' format

    // Validate input data
    if (empty($first_name) || empty($last_name) || empty($dob)) {
        echo "Please provide all required fields.";
        exit;
    }

    // Prepare SQL statement to insert patient data into the database
    $stmt = $conn->prepare("INSERT INTO patients (first_name, last_name, date_of_birth) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $first_name, $last_name, $dob);

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