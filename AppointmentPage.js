let currentDate = new Date(2024, 1, 5); // Initialize the current date to February 1, 2024
const endDate = new Date(2024, 5, 30);// Define the end date as June 30, 2024
let appointments = {}; // Object to store appointments
const colors = ['#f5f242', '#f56c42', '#42f5a7', '#45f542', '#42f5bc', '#42ecf5', '#4275f5', '#6f42f5', '#d742f5', '#f5428d'];
let selectedWorker = null; // Store the currently selected worker
let workers = []; // Initialize the workers array
let viewMode = 'daily'; // 'daily', 'weekly', or 'monthly'
let username; 
let userPermission; 

// Function to fetch therapists from the server
function fetchTherapists() {
    $.ajax({
        url: 'fetch_workers.php',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            workers = data.map(worker => {
																  
                let certifications = [];
                if (Array.isArray(worker.certifications)) {
                    certifications = worker.certifications;
                } else if (typeof worker.certifications === 'string') {
                    certifications = worker.certifications.split(", ");
                }

                return {
                    ...worker,
                    certifications: certifications
                };
            });
            // populateWorkerList();
            // populateCertificationDropdown();
            if (userPermission == 2){
                populateAppointmentList(); 
                displayTherapistSchedule(username); 
            }else{
            populateWorkerList();
            populateCertificationDropdown();
                if (workers.length > 0){
                    displayTherapistSchedule(workers[0].name); //Display the first therapist's schedule
                }
            }
            // if (workers.length > 0) {
            //     displayTherapistSchedule(workers[0].name); // Display the first therapist's schedule
            // }
            fetchAppointments();
        },
        error: function(xhr, status, error) {
            console.error('Error fetching therapists:', error);
            alert('Failed to fetch therapists. Please try again later.');
        }
    });
}

// Function to fetch appointments from the server
function fetchAppointments() {
    $.ajax({
        url: 'fetch_appointments.php', 
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.error) {
                console.error('Error fetching appointments:', response.error);
                alert('Failed to fetch appointments. Please try again later.');
            } else {
                appointments = processAppointments(response);
                generateSchedule(currentDate);
                console.log('Appointments:', appointments);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching appointments:', error);
            alert('Failed to fetch appointments. Please try again later.');
        }
    });
}

	//Displays the name of user who logged in 
function displayUser(){
    $.ajax({
        url: 'verify_permission.php', 
        method: 'GET', 
        dataType: 'json', 
        success: function(response){
            if (response.hasOwnProperty('name')){
                username  = response.name; 
                userPermission = response.permission; 
                $('#welcomeName').html('Welcome ' + username); 
                if (userPermission == 2){
                    $("#deleteAppointmentButton").hide(); 
                    $("#clearCertificationFilter").hide(); 
                    $("#workerList").hide(); 
                }
            }else{
                $('#welomeName').html('Unknown user'); 
            }
        }
    }); 
}//end of display user 
									  


// Function to process appointments data received from the server
function processAppointments(data) {
    var processedAppointments = {};
    var therapistColors = {}; 

    data.forEach(function(appointment) {
        var therapistId = appointment.therapist_id;
        var key = `${therapistId}-${appointment.appointment_time}`;

        // Check if the therapist already has a color assigned
        if (!therapistColors.hasOwnProperty(therapistId)) {
            therapistColors[therapistId] = colors.pop(); 
        }

        processedAppointments[key] = {
            id: appointment.id,
            name: appointment.first_name, 
            lname: appointment.last_name, 
            dob: appointment.date_of_birth, 
            certifications: appointment.appointment_certifications.split(','), 
            color: therapistColors[therapistId] // Assign color based on therapist ID
        };
    });

    return processedAppointments;
}


// Function to delete an appointment
function deleteAppointment() {
    const appointmentId = document.getElementById('deleteAppointmentButton').getAttribute('data-appointment-id');
    if (!appointmentId) {
        alert("No appointment selected for deletion.");
        return;
    }

    $.ajax({
        url: 'delete_appointment.php',
        type: 'POST',
        data: { 'appointmentId': appointmentId },
        success: function(response) {
            console.log('Appointment deleted successfully:', response);

            Object.keys(appointments).forEach(key => {
                if (appointments[key].id == appointmentId) {
                    delete appointments[key];
                }
            });
            // Refresh the schedule
            generateSchedule(currentDate); 
            closeAppointmentDetails(); 
        },
        error: function(error) {
            console.error('Error deleting appointment:', error);
        }
    });
}

// Event listener for DOMContentLoaded event
document.addEventListener("DOMContentLoaded", function() {
    adjustToFirstMonday();
    displayUser();
    fetchTherapists(); 
	 			   

    // Event listener for switching views
    document.getElementById("dailyViewBtn").addEventListener("click", function() {
        viewMode = 'daily';
        generateSchedule(currentDate);
    });
    // Event listener for switching views
    document.getElementById("weeklyViewBtn").addEventListener("click", function() {
        viewMode = 'weekly';
        document.querySelector('.schedule-table').classList.remove('monthly-view');
        generateSchedule(currentDate);
    });
    // Event listener for switching views
    document.getElementById("monthlyViewBtn").addEventListener("click", function() {
        viewMode = 'monthly';
        document.querySelector('.schedule-table').classList.add('monthly-view');
        generateSchedule(currentDate);
    });

    // Event listener for next week/month button
    document.getElementById("nextWeek").addEventListener("click", function() {
        if (viewMode === 'daily') {
            changeDay(1); // Next day
        } else if (viewMode === 'monthly') {
            changeMonth(1); // Next month
        } else {
            changeWeek(7); // Next week
        }
    });

    // Event listener for previous week/month button
    document.getElementById("prevWeek").addEventListener("click", function() {
        if (viewMode === 'daily') {
            changeDay(-1); // Previous day
        } else if (viewMode === 'monthly') {
            changeMonth(-1); // Previous month
        } else {
            changeWeek(-7); // Previous week
        }
    });

    // Event listener for search bar input
    document.getElementById("searchBar").addEventListener("input", populateWorkerList);
    
    // Event listener for certification dropdown change
    document.getElementById("certificationSelect").addEventListener("change", populateWorkerList);
    
    // Event listener for delete appointment button
    document.getElementById("deleteAppointmentButton").addEventListener("click", deleteAppointment);

    // Event listener for the Clear Filters button
    document.getElementById("clearCertificationFilter").addEventListener("click", clearCertificationFilter);
});

// Function to adjust the current date to the first Monday of the week
function adjustToFirstMonday() {
    if (currentDate.getDate() !== 5 || currentDate.getMonth() !== 1 || currentDate.getFullYear() !== 2024) {
        currentDate = new Date(2024, 1, 5);
    }
}


// Function to clear the certification filter
function clearCertificationFilter() {
    const certificationSelect = document.getElementById("certificationSelect");
    Array.from(certificationSelect.options).forEach(option => option.selected = false);
    populateWorkerList(); 
}

function changeDay(days) {
    let newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);

    const minDate = new Date(2024, 1, 5); 
    if (newDate < minDate) {
        console.log("Cannot navigate to dates before February 5, 2024");
        return;
    }
    if (newDate.getDay() === 0) { 
        newDate.setDate(newDate.getDate() + (days > 0 ? 1 : -1));
    }

    currentDate = newDate;
    generateSchedule(currentDate);
}

// Function to change the week based on the specified number of days
function changeWeek(days) {
    let newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);

    let weekStart = getWeekStart(newDate);


    const minDate = new Date(2024, 1, 1); 
    if (weekStart < minDate) {
        console.log("Cannot navigate to weeks before February 2024");
        return;
    }

    currentDate = newDate;
    generateSchedule(currentDate);
}
function changeMonth(increment) {
    let newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1);
    if (newDate >= new Date(2024, 1, 1)) { 
        currentDate = newDate;
        generateSchedule(currentDate);
    }
}

// Function to populate the certification dropdown with available certifications
function populateCertificationDropdown() {
    const certificationSet = new Set();
    workers.forEach(worker => {
        worker.certifications.forEach(cert => certificationSet.add(cert));
    });

    const certificationSelect = document.getElementById("certificationSelect");
    certificationSet.forEach(cert => {
        let option = document.createElement("option");
        option.value = cert;
        option.text = cert;
        certificationSelect.appendChild(option);
    });
}

function populateCertificationsDropdown(therapistName) {
    const therapist = workers.find(worker => worker.name === therapistName);
    const certificationsDropdown = document.getElementById("therapistCertifications");
    certificationsDropdown.innerHTML = '';

    therapist.certifications.forEach(cert => {
        let option = document.createElement("option");
        option.value = cert;
        option.text = cert;
        certificationsDropdown.appendChild(option);
    });
}

// Function to populate the worker list based on search criteria and selected certifications
function populateWorkerList() {
    const workerList = document.getElementById("workerList");
    const searchQuery = document.getElementById("searchBar").value.toLowerCase();
    const selectedCertifications = Array.from(document.getElementById("certificationSelect").selectedOptions).map(option => option.value);

    workerList.innerHTML = '';

    workers.filter(worker => {
        const matchesSearch = worker.name.toLowerCase().includes(searchQuery);
        const hasSelectedCertifications = selectedCertifications.every(cert => worker.certifications.includes(cert));
        return matchesSearch && hasSelectedCertifications;
    }).forEach(worker => {
        let li = document.createElement("li");
        li.innerHTML = `<strong>${worker.name}</strong><br><span>${worker.certifications.join(', ')}</span>`;
        li.addEventListener("click", function() {
            displayTherapistSchedule(worker.name);
        });
        if (selectedWorker && selectedWorker.name === worker.name) {
            li.classList.add("selected");
        }
        workerList.appendChild(li);
    });
}


function populateAppointmentList(){
    let li = document.createElement("li"); 
    li.innerHTML = '<strong>Edwing</strong?'; 
}

// Function to display the schedule of the selected therapist
function displayTherapistSchedule(therapistName) {
    selectedWorker = workers.find(worker => worker.name === therapistName);
    generateSchedule(currentDate);
    populateWorkerList();
    populateTherapistCertifications(); 
}

function populateTherapistCertifications() {
    const therapistCertificationsSelect = document.getElementById("appointmentCertifications"); 
    
    
    if (therapistCertificationsSelect) {
        therapistCertificationsSelect.innerHTML = ""; 

        
        if (selectedWorker && selectedWorker.certifications) {
            selectedWorker.certifications.forEach(certification => {
                let option = document.createElement("option");
                option.value = certification;
                option.text = certification;
                therapistCertificationsSelect.appendChild(option);
            });
        }
    } else {
        console.error("Element with ID 'appointmentCertifications' not found.");
    }
}

// Function to generate the schedule table based on the specified date
function generateSchedule(date) {
    if (viewMode === 'daily') {
        updateHeaderForDailyView(date);
        generateDailySchedule(date); // Generate daily view
    } else {
        restoreHeaderForWeeklyMonthlyViews();
        if (viewMode === 'weekly') {
            generateWeeklySchedule(date); // Generate weekly view
        } else if (viewMode === 'monthly') {
            generateMonthlySchedule(date); // Generate monthly view
        }
    }
    updateDateRangeDisplay();
}

//Function updates the header to display only the day of the week for the daily view.
function updateHeaderForDailyView(date) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 1; i <= 6; i++) {
        document.getElementById(`day${i}`).style.display = 'none';
    }
    document.getElementById('day1').textContent = dayNames[date.getDay()];
    document.getElementById('day1').style.display = '';
}

// Function restores the header for the weekly and monthly views.
function restoreHeaderForWeeklyMonthlyViews() {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 1; i <= 6; i++) {
        document.getElementById(`day${i}`).style.display = '';
        document.getElementById(`day${i}`).textContent = dayNames[i - 1];
    }
}

function generateDailySchedule(date) {
    const scheduleBody = document.getElementById("schedule-body");
    scheduleBody.innerHTML = "";

    // Update the date and day of the week display
    document.getElementById("currentWeek").textContent = `${getFormattedDate(date)} - ${formatDayOfWeek(date.getDay())}`;

    // Generate rows for each hour
    for (let hour = 8; hour <= 17; hour++) {
        const row = document.createElement("tr");
        
        const timeCell = document.createElement("td");
        timeCell.textContent = formatHour(hour);
        row.appendChild(timeCell);

        const dayCell = document.createElement("td");
        updateDayCellWithAppointments(dayCell, date, hour);
        row.appendChild(dayCell);

        scheduleBody.appendChild(row);
    }
}

// Function to generate the weekly view schedule table
function generateWeeklySchedule(date) {
    const scheduleBody = document.getElementById("schedule-body");
    scheduleBody.innerHTML = "";

    let weekStart = getWeekStart(date);
    let weekEnd = getWeekEnd(date);
    document.getElementById("currentWeek").textContent = `${getFormattedDate(weekStart)} - ${getFormattedDate(weekEnd)} ${weekStart.getFullYear()}`;

    for (let hour = 8; hour <= 17; hour++) { 
        const row = document.createElement("tr");
        const timeCell = document.createElement("td");
        timeCell.textContent = formatHour(hour);
        row.appendChild(timeCell);

        for (let dayIndex = 0; dayIndex < 6; dayIndex++) { 
            const dayCell = document.createElement("td");
            const currentDay = new Date(weekStart);
            currentDay.setDate(weekStart.getDate() + dayIndex);

            if (currentDay.getDay() === 0) continue; 

            updateDayCellWithAppointments(dayCell, currentDay, hour, dayIndex);
            row.appendChild(dayCell);
        }
        scheduleBody.appendChild(row);
    }
}

// Function to generate the monthly view schedule table
function generateMonthlySchedule(date) {
    const scheduleBody = document.getElementById("schedule-body");
    scheduleBody.innerHTML = ""; 


    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);

    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    let currentDay = new Date(monthStart);
    while (currentDay.getDay() !== 1 && currentDay.getDate() === 1) {
        currentDay.setDate(currentDay.getDate() + 1);
    }

    while (currentDay < monthStart) {
        currentDay.setDate(currentDay.getDate() - 1);
    }

    while (currentDay <= monthEnd) {
        const weekRow = document.createElement("tr");

        for (let i = 0; i < 6; i++) {
            const dayCell = document.createElement("td");

            if (currentDay.getMonth() === monthStart.getMonth()) {
                dayCell.textContent = currentDay.getDate();
            } else {
                dayCell.classList.add("not-current-month");
            }

            weekRow.appendChild(dayCell);
            currentDay.setDate(currentDay.getDate() + 1);

            if (currentDay.getDay() === 0) {
                currentDay.setDate(currentDay.getDate() + 1);
            }
        }

        scheduleBody.appendChild(weekRow);
    }

    document.getElementById("currentWeek").textContent = `${monthStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
}

function updateDateRangeDisplay() {
    const dateDisplayElement = document.getElementById("currentWeek");
    if (viewMode === 'weekly') {
        let weekStart = getWeekStart(currentDate);
        let weekEnd = getWeekEnd(currentDate);
        dateDisplayElement.textContent = `Week of ${getFormattedDate(weekStart)} - ${getFormattedDate(weekEnd)} ${weekStart.getFullYear()}`;
    } else if (viewMode === 'monthly') {
        dateDisplayElement.textContent = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }
}


// Function to check if a given hour falls within the specified time range
function isTimeWithinRange(hour, startTime, endTime) {
    let startHour = parseInt(startTime.split(':')[0], 10);
    let endHour = parseInt(endTime.split(':')[0], 10);
    return hour >= startHour && hour <= endHour + (endTime.includes('00') ? 1 : 0);
}

// Function to update the day cell with appointments or availability
function updateDayCellWithAppointments(dayCell, currentDay, hour, dayIndex) {
    dayCell.classList.add("time-slot");
    const formattedDate = currentDay.toISOString().slice(0, 10);
    const appointmentKey = `${selectedWorker.id}-${formattedDate} ${formatHourForAppointment(hour)}`;

    if (appointments[appointmentKey]) {
        const appointment = appointments[appointmentKey];
        dayCell.style.backgroundColor = appointment.color;
        dayCell.textContent = appointment.title;
        dayCell.onclick = function() {
            showAppointmentDetails(appointmentKey);
        };
    } else if (selectedWorker) {
        const dayName = formatDayOfWeek(currentDay.getDay());
        const todaysAvailability = selectedWorker.availability.find(avail => avail.day_of_week === dayName);

        if (todaysAvailability && isTimeWithinRange(hour, todaysAvailability.start_time, todaysAvailability.end_time)) {
            dayCell.classList.add("available-slot");
            dayCell.addEventListener('click', function() {
                createAppointment(hour, dayIndex, currentDay, selectedWorker.id);
            });
        } else {
            dayCell.textContent = "Not Available";
            dayCell.classList.add("not-available");
        }
    } else {
        dayCell.textContent = "Not Available";
        dayCell.classList.add("not-available");
    }
}

// Function to format the hour for appointment creation
function formatHourForAppointment(hour) {
    return hour.toString().padStart(2, '0') + ':00:00';
}

// Function to parse time string and create a Date object
function parseTime(timeString, referenceDate) {
    let [hours, minutes] = timeString.split(':').map(Number);
    return new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), hours, minutes);
}

// Function to format the day of the week
function formatDayOfWeek(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
}

// Function to get the start date of the week for a given date
function getWeekStart(date) {
    const dateCopy = new Date(date);
    const day = dateCopy.getDay();
    const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(dateCopy.setDate(diff));
}

// Function to get the end date of the week for a given date
function getWeekEnd(date) {
    const dateCopy = new Date(getWeekStart(date));
    return new Date(dateCopy.setDate(dateCopy.getDate() + 6));
}

// Function to get formatted date string
function getFormattedDate(date) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Function to format the hour in AM/PM format
function formatHour(hour) {
    return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`;
}

// Function to create a new appointment
function createAppointment(hour, dayIndex, date, therapistId) {
    // Find the selected therapist based on therapistId
    const selectedTherapist = workers.find(worker => worker.id === therapistId);
    if (!selectedTherapist) {
        alert("Therapist not found.");
        return;
    }

    // Format the selected date and time for the appointment
    const selectedTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0, 0);
    selectedTime.setMinutes(selectedTime.getMinutes() - selectedTime.getTimezoneOffset());
    const formattedDateTime = selectedTime.toISOString().slice(0, 19).replace('T', ' ');

    // Populate the appointment form with the selected details
    document.getElementById('appointmentDate').value = formattedDateTime;
    document.getElementById('selectedTherapistId').value = therapistId;

    // Populate the certifications dropdown based on the selected therapist's certifications
    const certificationsDropdown = document.getElementById("appointmentCertifications");
    if (certificationsDropdown) {
        certificationsDropdown.innerHTML = ''; // Clear existing options
        selectedTherapist.certifications.forEach(certification => {
            let option = document.createElement("option");
            option.value = certification;
            option.text = certification;
            certificationsDropdown.appendChild(option);
        });
    } else {
        console.error("Element with ID 'appointmentCertifications' not found.");
        return;
    }

	// Display the appointment form							   
    document.getElementById('appointmentForm').style.display = 'block';
}

// Function to display the appointment form
function showAppointmentForm(hour, dayIndex, date) {
    document.getElementById('appointmentForm').style.display = 'block';
    document.getElementById('appointmentForm').setAttribute('data-hour', hour);
    document.getElementById('appointmentForm').setAttribute('data-day', dayIndex);
    document.getElementById('appointmentDate').value = date.toISOString();
}

// Function to save the appointment details
function saveAppointment() {
    var appointmentName = document.getElementById("appointmentName").value;
    var appointmentLName = document.getElementById("appointmentLName").value;
    var appointmentDOB = document.getElementById("appointmentDOB").value;
    var appointmentDate = document.getElementById("appointmentDate").value;
    var selectedTherapistId = document.getElementById("selectedTherapistId").value;
    var certificationsDropdown = document.getElementById("appointmentCertifications");

    if (!certificationsDropdown) {
        console.error("Element with ID 'appointmentCertifications' not found.");
        return;
    }

    var selectedCertifications = Array.from(certificationsDropdown.selectedOptions).map(option => option.value);

    if (!appointmentName || !appointmentLName || !appointmentDOB || !appointmentDate || !selectedTherapistId || selectedCertifications.length === 0) {
        alert("All fields are required.");
        return;
    }

    var formData = new FormData();
    formData.append("first_name", appointmentName);
    formData.append("last_name", appointmentLName);
    formData.append("dob", appointmentDOB);
    formData.append("appointment_time", appointmentDate);
    formData.append("therapist_id", selectedTherapistId);
    formData.append("certifications", JSON.stringify(selectedCertifications));

    $.ajax({
        url: "create_appointment.php",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            console.log("Response from create_appointment.php:", response);
            try {
                var appointmentData = JSON.parse(response);
                let newAppointmentKey = `${appointmentData.therapist_id}-${appointmentData.appointment_time}`;
                appointments[newAppointmentKey] = {
                    id: appointmentData.id,
                    name: appointmentData.first_name,
                    lname: appointmentData.last_name,
                    dob: appointmentData.date_of_birth,
                    certifications: appointmentData.appointment_certifications.split(','), 
                    color: colors[Math.floor(Math.random() * colors.length)]
                };
                generateSchedule(currentDate); 
            } catch (error) {
                console.error("Error parsing JSON response:", error);
            }
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", error);
        }
    });

    document.getElementById("appointmentForm").style.display = "none";
    clearAppointmentForm();
}


// Function to display appointment details
function showAppointmentDetails(appointmentKey) {
    console.log("showAppointmentDetails called with appointmentKey:", appointmentKey);
    var appointment = appointments[appointmentKey];
    console.log("Retrieved appointment:", appointment);

    if (appointment) {
        console.log(appointment); 
        document.getElementById('detailFName').textContent = 'First Name: ' + (appointment.name || '');
        document.getElementById('detailLName').textContent = 'Last Name: ' + (appointment.lname || '');
        document.getElementById('detailDOB').textContent = 'DOB: ' + (appointment.dob || '');
        
        var certificationString = Array.isArray(appointment.certifications) ? appointment.certifications.join(', ') : '';
        document.getElementById('detailCertification').textContent = 'Certifications: ' + certificationString;
        document.getElementById('deleteAppointmentButton').setAttribute('data-appointment-id', appointment.id);
        document.getElementById('appointmentDetailView').style.display = 'block';
    }
}



// Function to close appointment details view
function closeAppointmentDetails() {
    document.getElementById('appointmentDetailView').style.display = 'none';
}

// Function to delete an appointment
function deleteAppointment() {
    const appointmentId = document.getElementById('deleteAppointmentButton').getAttribute('data-appointment-id');
    if (!appointmentId) {
        alert("No appointment selected for deletion.");
        return;
    }

    $.ajax({
        url: 'delete_appointment.php',
        type: 'POST',
        data: { 'appointmentId': appointmentId },
        success: function(response) {
            for (let key in appointments) {
                if (appointments[key].id === appointmentId) {
                    delete appointments[key];
                    break;
                }
            }
            generateSchedule(currentDate);
            closeAppointmentDetails();
        },
        error: function(error) {
            console.error('Error deleting appointment:', error);
        }
    });
}

// Function to cancel creating an appointment
function cancelAppointment() {
    clearAppointmentForm();
    document.getElementById('appointmentForm').style.display = 'none';
}

// Function to clear appointment form fields
function clearAppointmentForm() {
    document.getElementById('appointmentName').value = '';
    document.getElementById('appointmentLName').value = ''; 
    document.getElementById('appointmentDOB').value = '';
}

// Function to format hour into 12-hour format with AM/PM
function formatHour(hour) {
    let amPm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return hour + ' ' + amPm;
}
