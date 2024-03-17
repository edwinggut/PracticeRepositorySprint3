
$(document).ready(function() {
    let menu = document.querySelector('#menu-btn');
    let navbar = document.querySelector('.navbar');

    menu.onclick = () => {
        menu.classList.toggle('fa-times');
        navbar.classList.toggle('active');  
    }
    window.onscroll = () => {
        menu.classList.remove('fa-times');
        navbar.classList.remove('active');  
    }



    //ajax request to validate username and password
    $('#loginForm').submit(function(event) {
        event.preventDefault();
        
        var username = $('#username').val();
        var password = $('#password').val();

        $.ajax({
            url: 'loginHandling.php',
            method: 'POST',
            dataType: 'json',
            data: { username: username, password: password },
            success: function(response) {
                if (response === 'CORRECT') {
                    window.location.href = 'AppointmentPage.html';
                } else if (response === 'INVALID') {
                    $('#message').html('Invalid username or password');
                }
            },
            error: function() {
                $('#message').html('Error occurred while trying to login. Please try again.');
            }
        });
    });
});