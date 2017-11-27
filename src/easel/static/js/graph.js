$(document).ready(function() {
    var visitors;
    var weekday;
    var lastfivedays;
    var lastfivevis;
    
    $.get("/easel/dashboard/getProfile/").done(function(data) {
          visitors = data;
          makeArray(visitors);
          graph(lastfivedays, lastfivevis)
    });
      
    function makeArray(visitors){
        var d = new Date();
        var today = d.getDay();
        weekday = new Array(7);
        weekday[0] = "Mon";
        weekday[1] = "Tue";
        weekday[2] = "Wed";
        weekday[3] = "Thur";
        weekday[4] = "Fri";
        weekday[5] = "Sat";
        weekday[6] = "Sun";

        lastfivedays = new Array(5);
        lastfivevis = new Array(5);
        var offset = 5;
        var len = 7;
        for (i = 0; i < 5; i++){
            lastfivedays[i] = weekday[((((today - offset + i) % len) + len) % len)];
            lastfivevis[i] = visitors[((((today - offset + i) % len) + len) % len)];
        }
    }
    
    function graph(lastfivedays, lastfivevis){
        var trace1 = {
          x: lastfivedays,
          y: lastfivevis,
          mode: 'markers',
          type: 'scatter',
          name: 'Site A',
          marker: { size: 12 }
        };

        var data = [trace1];
        
        var layout = {
          yaxis: {
            range: [0, 10]
          },
          title:'Visitors from last 5 days'
        };

        Plotly.newPlot('graph1', data, layout);
    }
    
});