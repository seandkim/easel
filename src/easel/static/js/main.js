$(function() {
	/* variable declarations */
    var sidebarHidden = true;

    // hide sidebar
    $('#sidebar').css('right', '-' + $('#sidebar').width() + 'px');
    
    /* event listeners */
    $('#toggle').on('click', sidebarToggle);
    $('#slider-exit').on('click', sidebarToggle);

    /* 
     * Controls hide and show of sidebar
     */
    function sidebarToggle() {
        if (sidebarHidden) {
            $("#sidebar").animate({ right: 0 }, {
                duration: 700,
                easing: 'easeOutQuart'
            });
        } else {
            $("#sidebar").animate({ right: '-' + $('#sidebar').width() + 'px' }, {
                duration: 700,
                easing: 'easeOutQuart'
            });
        }
        sidebarHidden = !sidebarHidden;
    }
});