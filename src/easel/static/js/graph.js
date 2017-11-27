$(document).ready(function() {
    var visitors;
    var weekday;
    var lastfivedays;
    var lastfivevis;
    
    $.get("/easel/dashboard/getProfile/").done(function(data) {
          console.log(data);
          visitors = data;
          console.log(visitors)
          makeArray(visitors);
          console.log('lastfivedays = ', lastfivedays)
          console.log('lastfivevis = ', lastfivevis)
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
    //      y: [, 6, 3, 2, 1],
          y: lastfivevis,
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