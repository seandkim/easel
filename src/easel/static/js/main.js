'use strict';

/* main.js: for initialization and common component across site */
$(function() {

    /* initializations */
    $('.modal').modal();
    $('#alert-box').hide();

    /* side bar */
    var sidebarHidden = true;
    $('#sidebar').css('right', '-400px');
    $('#toggle').on('click', sidebarToggle);
    $('#slider-exit').on('click', sidebarToggle);
  
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

});
