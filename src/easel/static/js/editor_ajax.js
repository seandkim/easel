'use strict';

$(document).ready(function() {
  const siteName = 'dummy'
  // retrieve list of projects
  $.ajax({
      url: "/easel/sites/" + siteName + "/getPageNames/",
      method: "GET",
      success: function(data) {
        console.log("successfully retrieved page names");

        for (var i=0; i<data.pages.length; i++) {
          const page = data.pages[0]
          const pageName = page['name']
          const pageOpened = (page['opened'] == "True")
          const pageActive = (page['active'] == "True")
          if (pageOpened) {
            loadPageHTML(siteName, pageName)
          }

          if (pageActive) {
            // TODO focus on active tab.
            // TODO assert that there are only one active page?
          }
        }
      }
  });

  setupAjax()

  /* make ajax call to page actions */
  $( "#publish" ).click(function() {
    pagesToPublish = []
    console.log("sending ajax request to publish");
    $.ajax({
        url: "/easel/sites/dummy/publish/",
        method: "POST",
        data: { pages: pagesToPublish },
        success: function(data) {
          console.log("successfully published the page");
        }
    });
  });

  /* make ajax call to page actions */
  $( ".new-page" ).click(function() {
    var current_page = document.getElementsByClassName("active")
    var pageName = $($(current_page).children()[0]).html().toLowerCase()
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
    const pageName = "home" //TODO find active page and its name
    // cmd+s in mac and ctrl+s in other platform
    if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();
      $.ajax({
          url: "/easel/sites/dummy/savePage/",
          method: "POST",
          data: { pageName: pageName,
                  html : $('#page-content').html() },

          success: function(data) {
            console.log("successful saved the page");
          }
          // TODO add failure case
      });
    }
  });

  function loadPageHTML(siteName, pageName) {
    $.ajax({
        url: "/easel/sites/" + siteName + "/getPageHTML/" + pageName,
        method: "GET",
        dataType: "html",
        success: function(data) {
          console.log("successfully retrieved page html");
          const html = data
          // TODO replace content with html
        },
        error: function(jqXHR, textStatus) {
          console.log("error in loading page", pageName, textStatus);
        }
    });
  }

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

});
