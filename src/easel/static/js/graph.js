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
        weekday[0] = "Sun";
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thur";
        weekday[5] = "Fri";
        weekday[6] = "Sat";

        lastfivedays = new Array(5);
        lastfivevis = new Array(5);

        for (i = 0; i < 5; i++){
            lastfivedays[i] = weekday[((((today - 4 + i) % 7) + 7) % 7)];
            lastfivevis[i] = visitors[((((today - 4 + i) % 7) + 7) % 7)];
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