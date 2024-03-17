<?php
// delete_appointment.php
/*session_start(); // Ensure the session is started to access session variables*/

/*// Check if the user is logged in and has the 'admin' role
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    echo "Error: You do not have permission to delete appointments.";
    exit; // Prevent further execution for non-admin users
}*/

// Check if appointment ID is set
if(isset($_POST['appointmentId'])) {
    // Retrieve appointment ID
    $appointmentId = $_POST['appointmentId'];

    // Connect to database
    $conn = new mysqli('localhost', 'root', '', 'physical_therapy');
    // Check database connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Prepare SQL statement
    $stmt = $conn->prepare("DELETE FROM appointments WHERE id = ?");
    // Bind parameters
    $stmt->bind_param("i", $appointmentId);

    // Execute SQL statement
    if ($stmt->execute()) {
        // Check if appointment was deleted successfully
        if ($stmt->affected_rows > 0) {
            // Output success message
            echo "Appointment deleted successfully";
        } else {
            // Output message if no appointment was deleted
            echo "No appointment was deleted";
        }
    } else {
        // Output error message
        echo "Error deleting appointment: " . $stmt->error;
    }

    // Close prepared statement
    $stmt->close();
    // Close database connection
    $conn->close();
} else {
    // Handle missing parameter
    echo "Error: appointmentId parameter is missing";
}
?>
