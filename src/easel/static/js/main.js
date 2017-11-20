'use strict';

/* main.js: for initialization and common component across site */

var sidebarHidden;

/*
 * Controls hide and show of sidebar
 */
function sidebarToggle() {
    if (sidebarHidden) {
        $("#sidebar").animate({ right: 0 }, {
            duration: 900,
            easing: 'easeOutQuart'
        });
    } else {
        $("#sidebar").animate({ right: '-400px' }, {
            duration: 900,
            easing: 'easeOutQuart'
        });
    }
    sidebarHidden = !sidebarHidden;
}

function hideAlertMsg() {
    console.log('hiding alert');
    $("#alert-box").animate({ right: '-300px' }, {
        duration: 900,
        easing: 'easeOutQuart'
    });
}

function showAlertMsg(msg) {
    console.log('showing alert');
    $('#alert-msg').html(msg);
    $("#alert-box").animate({ right: 0 }, {
        duration: 900,
        easing: 'easeOutQuart'
    });

    // hide after 2 seconds (2000ms)
    setTimeout(hideAlertMsg, 2000);
}

// main
$(function() {

    /* initializations */
    $('.modal').modal();
    $('.close-alert').click(hideAlertMsg);

    /* side bar */
    sidebarHidden = true;
    $('#sidebar').css('right', '-400px');
    $('#toggle').on('click', sidebarToggle);
    $('#slider-exit').on('click', sidebarToggle);

});
