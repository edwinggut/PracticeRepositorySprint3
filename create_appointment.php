<?php
// Connect to the database
$conn = new mysqli('localhost', 'root', '', 'physical_therapy');

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the request method is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve data from the POST request
    $first_name = $_POST['first_name']; 
    $last_name = $_POST['last_name']; 
    $dob = $_POST['dob']; 
    $appointment_time = $_POST['appointment_time'];
    $therapist_id = $_POST['therapist_id']; 
    $certifications = implode(',', json_decode($_POST['certifications']));

    // Check if required data is provided
    if (empty($first_name) || empty($last_name) || empty($dob) || empty($certifications)) {
        echo "Error: First name, last name, date of birth, and certifications are required.";
        exit;
    }

    // Insert or retrieve patient
    $patient_stmt = $conn->prepare("SELECT id FROM patients WHERE first_name = ? AND last_name = ? AND date_of_birth = ?");
    $patient_stmt->bind_param("sss", $first_name, $last_name, $dob);
    $patient_stmt->execute();
    $patient_result = $patient_stmt->get_result();
    $patient_id = null;

    if ($patient_result->num_rows > 0) {
        $patient_row = $patient_result->fetch_assoc();
        $patient_id = $patient_row['id'];
    } else {
        $insert_patient_stmt = $conn->prepare("INSERT INTO patients (first_name, last_name, date_of_birth) VALUES (?, ?, ?)");
        $insert_patient_stmt->bind_param("sss", $first_name, $last_name, $dob);
        $insert_patient_stmt->execute();
        $patient_id = $conn->insert_id;
        $insert_patient_stmt->close();
    }
    $patient_stmt->close();

    if ($patient_id) {
        // Insert the new appointment
        $appointment_stmt = $conn->prepare("INSERT INTO appointments (patient_id, therapist_id, appointment_time, appointment_certifications) VALUES (?, ?, ?, ?)");
        $appointment_stmt->bind_param("iiss", $patient_id, $therapist_id, $appointment_time, $certifications);
        if ($appointment_stmt->execute()) {
            $newAppointmentId = $conn->insert_id;

            // Retrieve the details of the new appointment along with patient details
            $newAppointmentQuery = "SELECT a.id, a.therapist_id, a.appointment_time, p.first_name, p.last_name, p.date_of_birth, a.appointment_certifications
                                    FROM appointments a
                                    INNER JOIN patients p ON a.patient_id = p.id
                                    WHERE a.id = $newAppointmentId";

            $newAppointmentResult = $conn->query($newAppointmentQuery);

            if ($newAppointmentResult && $newAppointment = $newAppointmentResult->fetch_assoc()) {
                echo json_encode($newAppointment); // Send back the combined details of the new appointment
            } else {
                echo "Error: " . $conn->error;
            }
        } else {
            echo "Error: " . $appointment_stmt->error;
        }
        $appointment_stmt->close();
    } else {
        echo "Error: Patient could not be identified or created.";
    }
} else {
    echo "Error: Necessary data not provided.";
}

// Close the database connection
$conn->close();
?>