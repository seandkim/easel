'use strict';

$(function() {
    setupAjax()

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
      newPageName = 'newPage' //TODO change to real new page name
      $.ajax({
          url: "/easel/sites/dummy/addPage/",
          method: "POST",
          // TODO change page name
          data: { pageName : newPageName },
          success: function(data) {
             console.log("successfully added the page");
          }
          // TODO display alert message (when same page name exists)
      });
    });

    document.addEventListener("keydown", function(e) {
      pageName = "home" //TODO find active page and its name
      // cmd+s in mac and ctrl+s in other platform
      if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        $.ajax({
            url: "/easel/sites/dummy/savePage/",
            method: "POST",
            data: { pageName: pageName,
                    html : $('#page-content').html() },

            success: function(data) {
              console.log("successful sent html of page");
            }
            // TODO add failure case
        });
      }
    }, false);
});

function setupAjax() {
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
}
