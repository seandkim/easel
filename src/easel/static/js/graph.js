$(document).ready(function() {
    var sites;
    var lastfivedays;
    var lastfivevis;
    var graph_data = [];
    var layout;

    
    $.get("/easel/dashboard/getProfile/").done(function(data) {
          sites = data.sites;
          for (var i = 0; i < sites.length; i++){
              var site = sites[i];
              var site_name = site.name;
              var visitors = site.weekdays;
              makeArray(visitors);            
              graph(lastfivedays, lastfivevis, site_name);
          }
          plot();
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
    
    function graph(lastfivedays, lastfivevis, site_name){
        var trace = {
          x: lastfivedays,
          y: lastfivevis,
          mode: 'lines+markers',
          type: 'scatter',
          name: site_name,
          marker: { size: 12 }
        };
        graph_data.push(trace);
 
        layout = {
          yaxis: {
            range: [0, 10]
          },
          title:'Visitors from last 5 days'
        };   
    }
    
    function plot(){
        Plotly.newPlot('graph1', graph_data, layout);
    }
    
    
});