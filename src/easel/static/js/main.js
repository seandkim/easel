'use strict';
$(function() {
    /* ajax set up */
    // set up csrf tokens
    // https://docs.djangoproject.com/en/1.10/ref/csrf/
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

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

    /* show tab */
    var componentTabHidden = true;
    var pageTabHidden = true;
    var toolTabHidden = true;
    /* event listeners */
    $('#component-tab').on('click', componentToggle);
    $('#page-tab').on('click', pageToggle);
    $('#tool-tab').on('click', toolToggle);
    $('#page-list').hide();
    $('#tool-list').hide();
    $('#component-list').hide();

    /* slide up to begin with */
    function componentToggle() {
        var ind = $('#component-tab').find('.tab-indicator');
        if (componentTabHidden) {
            $('#component-list').slideDown('swing');
            ind.html('<i class="icon icon-down-dir"></i>');
        } else {
            $('#component-list').slideUp('swing');
            ind.html('<i class="icon icon-right-dir"></i>');
        }
        componentTabHidden = !componentTabHidden;
    }

    function pageToggle() {
      var ind = $('#page-tab').find('.tab-indicator');
        if (pageTabHidden) {
            $('#page-list').slideDown('swing');
            ind.html('<i class="icon icon-down-dir"></i>');
        } else {
            $('#page-list').slideUp('swing');
            ind.html('<i class="icon icon-right-dir"></i>');
        }
        pageTabHidden = !pageTabHidden;
    }

    function toolToggle() {
        var ind = $('#tool-tab').find('.tab-indicator');
        if (toolTabHidden) {
            $('#tool-list').slideDown('swing');
            ind.html('<i class="icon icon-down-dir"></i>');
        } else {
            $('#tool-list').slideUp('swing');
            ind.html('<i class="icon icon-right-dir"></i>');
        }
        toolTabHidden = !toolTabHidden;
    }

    var editor = new MediumEditor('.editable');

   
    /* make ajax call to page actions */
    $( "#publish" ).click(function() {
      console.log("sent ajax request to update");
      $.ajax({
          url: "/easel/savePage",
          method: "POST",
          data: { html : $('#page-preview').html() }
      }).success(function(data) {
          console.log("successful sent html of page");
      });
    });

    var cr_tabs = $('.cr-tabs > li');
    cr_tabs.on("click", function() {
       // get the unactivated tab
       var unactivated_tab = $('.cr-tabs').find('.active').attr('tab-target');
       $( unactivated_tab ).addClass('hidden');
       cr_tabs.removeClass('active');

       // replace page review with target tab
       $(this).addClass('active');
       var activated_tab = $(this).attr('tab-target');
       $(activated_tab).removeClass('hidden');
    });

    /* closing tab */
    $('.close-tab').click(function (e) {
      e.preventDefault();
      var close_li = $(this).closest('li');
      var close_tab = close_li.attr('tab-target');
      var isRemovingActive = close_li.hasClass('active');

      // remove content and tab indicator
      $(close_tab).remove();
      close_li.remove();

      // select the next open tab
      if (isRemovingActive) {
        var new_active_tab = $('.cr-tabs>li').last();
        new_active_tab.addClass('active');
        var activated_tab = new_active_tab.attr('tab-target');
        $(activated_tab).removeClass('hidden');
      } 
    });

    // TODO: fix the hovering bug
    cr_tabs.hover(function() {
       cr_tabs.removeClass('hover');
       $(this).addClass('hover');
    }, function() {
       cr_tabs.removeClass('hover');
    });

    /* hovering event of add page button */
    $('#add-page').hover(function() {
       $(this).find('a').html('<i class="icon-plus-circle"></i>');
    }, function() {
       $(this).find('a').html('<i class="icon-plus"></i>');
    });

    /* create graphs in dashboard */
    // var trace1 = {
    //   x: ["Mon", "Tue", "Wed", "Thur", "Fri"],
    //   y: [1, 6, 3, 6, 1],
    //   mode: 'markers',
    //   type: 'scatter',
    //   name: 'Site A',
    //   marker: { size: 12 }
    // };

    // var trace2 = {
    //   x: ["Mon", "Tue", "Wed", "Thur", "Fri"],
    //   y: [4, 1, 7, 1, 4],
    //   mode: 'markers',
    //   type: 'scatter',
    //   name: 'Site B',
    //   marker: { size: 12 }
    // };

    // var data = [ trace1, trace2 ];

    // var layout = {
    //   yaxis: {
    //     range: [0, 8]
    //   },
    //   title:'Visitors from last Week'
    // };

    // Plotly.newPlot('graph1', data, layout);


});
