$(function() {
	/* variable declarations */
    var sidebarHidden = false;

    // hide sidebar
    $('#sidebar').css('right', '-' + $('#sidebar').outerWidth() + 'px');
    
    /* event listeners */
    $('#toggle').click(sidebarToggle);
    $('#slider-exit').click(sidebarToggle);

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
            $("#sidebar").animate({ right: '-' + $('#sidebar').outerWidth() + 'px' }, {
                duration: 700,
                easing: 'easeOutQuart'
            });
        }
        sidebarHidden = !sidebarHidden;
    }
});