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

    /* make ajax call to page actions */
    $( "#publish" ).click(function() {
      console.log("sent ajax request to publish");
      $.ajax({
          url: "/sites/dummy/publish/",
          method: "POST",
          data: { html : $('#page-content').html() },
          success: function(data) {
            console.log("successful sent html of page");
          }
      });
    });

    /* make ajax call to page actions */
    $( ".new-page" ).click(function() {
      $.ajax({
          url: "/easel/sites/dummy/addPage/",
          method: "POST",
          // TODO change page name
          data: { pageName : 'newPage' },
          success: function(data) {
             console.log("successful sent html of page");
          }
      });
    });

    document.addEventListener("keypress", function(event) {
      console.log( "Handler for .keypress() called." );
      // $.ajax({
      //     url: "^sites/dummy/addPage/",
      //     method: "POST",
      //     data: { html : $('#page-content').html() },
      //     success: function(data) {
      //       console.log("successful sent html of page");
      //     }
      // });
    })
});
