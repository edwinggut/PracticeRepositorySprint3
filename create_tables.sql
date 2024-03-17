-- create_tables.sql

CREATE TABLE therapists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    certifications TEXT
);


CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE
);


CREATE TABLE availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    therapist_id INT,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    start_time TIME,
    end_time TIME,
    FOREIGN KEY (therapist_id) REFERENCES therapists(id)
);

CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    therapist_id INT,
    appointment_time DATETIME,
    appointment_certifications VARCHAR(255),
    therapy_type VARCHAR(255), -- Added column for therapy type
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (therapist_id) REFERENCES therapists(id)
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    therapist_id INT,
    admin_id INT, 
    username VARCHAR(50),
    password VARCHAR(255),
    permission INT CHECK (permission IN (1, 2)),
    FOREIGN KEY (therapist_id) REFERENCES therapists(id),
    FOREIGN KEY (admin_id) REFERENCES admin(id)
);


CREATE TABLE admin(
    id INT AUTO_INCREMENT PRIMARY KEY, 
    name VARCHAR(50)
); 
