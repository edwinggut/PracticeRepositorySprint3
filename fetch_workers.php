<?php
// fetch_workers.php

// Establish connection to the database
$conn = new mysqli('localhost', 'root', '', 'physical_therapy');

// Check if the connection was successful
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Query to join Therapists and Availability tables
$sql = "SELECT t.id, t.name, t.certifications, a.day_of_week, a.start_time, a.end_time 
        FROM therapists t 
        LEFT JOIN availability a ON t.id = a.therapist_id";

$result = $conn->query($sql);

$workers = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $therapist_id = $row['id'];
        if (!isset($workers[$therapist_id])) {
            // Initialize the worker array if it doesn't exist
            $workers[$therapist_id] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'certifications' => explode(', ', $row['certifications']), 
                'availability' => []
            ];
        }
        // Check if availability data exists
        if ($row['day_of_week'] && $row['start_time'] && $row['end_time']) {
            // Add availability data to the worker's availability array
            $workers[$therapist_id]['availability'][] = [
                'day_of_week' => $row['day_of_week'],
                'start_time' => $row['start_time'],
                'end_time' => $row['end_time']
            ];
        }
    }
}

// Return JSON response
echo json_encode(array_values($workers));

// Close the database connection
$conn->close();
?>