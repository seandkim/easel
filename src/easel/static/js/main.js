$(function() {
	/* variable declarations */
    var sidebarHidden = true;

    // hide sidebar
    // TODO: fix sidebar width using $('#sidebar').outerWidth()
    $('#sidebar').css('right', '-400px');

    /* event listeners */
    $('#toggle').on('click', sidebarToggle);
    $('#slider-exit').on('click', sidebarToggle);

    var editor = new MediumEditor('.editable');

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
            $("#sidebar").animate({ right: '-400px' }, {
                duration: 700,
                easing: 'easeOutQuart'
            });
        }
        sidebarHidden = !sidebarHidden;
    }

    /* swap in tabs */

    /* create graphs in dashboard */
    var trace1 = {
      x: ["Mon", "Tue", "Wed", "Thur", "Fri"],
      y: [1, 6, 3, 6, 1],
      mode: 'markers',
      type: 'scatter',
      name: 'Site A',
      marker: { size: 12 }
    };

    var trace2 = {
      x: ["Mon", "Tue", "Wed", "Thur", "Fri"],
      y: [4, 1, 7, 1, 4],
      mode: 'markers',
      type: 'scatter',
      name: 'Site B',
      marker: { size: 12 }
    };

    var data = [ trace1, trace2 ];

    var layout = {
      yaxis: {
        range: [0, 8]
      },
      title:'Visitors from last Week'
    };

    Plotly.newPlot('graph1', data, layout);
        
});
