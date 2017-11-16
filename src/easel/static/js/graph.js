$(function() {
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