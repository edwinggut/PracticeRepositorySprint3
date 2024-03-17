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

    $(document).ready(function() {
        $('.btn').click(function(event) {
            event.preventDefault();
            var moreInfoDiv = $(this).closest('.box').find('.more-info');
            
            if (moreInfoDiv.is(':hidden')) {
                moreInfoDiv.slideDown();
            } else {
                moreInfoDiv.slideUp();
            }
        });
    });

 $(document).ready(function () {
            $(".quick-link").click(function (e) {
                e.preventDefault();
                var target = $(this).data("target");
                $('html, body').animate({
                    scrollTop: $("#" + target).offset().top
                }, 1000);
            });
        });
 $(document).ready(function() {
    $('.btn').click(function(event) {
        event.preventDefault();
        var bookSectionOffset = $('#book').offset().top;
        $('html, body').animate({
            scrollTop: bookSectionOffset
        }, 1000);
    });
});
 
$(document).ready(function() {
    $('.btn').click(function(event) {
        event.preventDefault();
        window.location.href = "loginPage.html";
    });

    document.getElementById("appointmentsLink").addEventListener("click", function(event) {
        event.preventDefault();
        window.location.href = "AppointmentPage.html";
    });
});

