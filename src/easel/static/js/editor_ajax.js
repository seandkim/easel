'use strict';

$(document).ready(function() {
    setupAjax();

    // TODO update sitename
    const siteName = 'dummy';
    doneLoading();

    /* publish button */
    $(".publish").click(function() {
        addLoading();
        var pagesToPublish = [];
        $.ajax({
            url: "/easel/sites/dummy/publish/",
            method: "POST",
            data: { pages: pagesToPublish },
            success: function(data) {
                console.log("successfully published the page");
                doneLoading();
            },
            error: function (e) {
                console.log(e);
                doneLoading();
            }
        });
    });

    /* add new page button */
    $(".add-new-page").click(function() {
        var newPageName = 'new page' //TODO

        $.ajax({
            url: "/easel/sites/dummy/addPage/",
            method: "POST",
            // TODO change page name
            data: { pageName: newPageName },
            success: function(data) {
                console.log("successfully added the page");
            },
            error: function(e) {
                // TODO display alert message (when same page name exists)
            }
        });
    });

    /* open new page */
    $(document).on('click', '.file', function(event) {
       event.preventDefault();
       console.log($(this).find('.page-name').html());
       loadPageHTML(siteName, $(this).find('.page-name').html(), true);
    });

    /* saving by cmd+s */
    document.addEventListener("keydown", function(e) {
        var current_page = document.getElementsByClassName("active")
        var pageName = $($(current_page).children()[0]).html().toLowerCase()

        // cmd+s in mac and ctrl+s in other platform
        if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            $.ajax({
                url: "/easel/sites/dummy/savePage/",
                method: "POST",
                data: {
                    pageName: pageName,
                    html: $('#page-content').html()
                },
                success: function(data) {
                    console.log("successful saved the page");
                },
                error: function(e) {
                    // TODO add error handling
                    console.log(e);
                }
            });
        }
    });

    function loadPageHTML(siteName, pageName, isActive) {
        $.ajax({
            url: "/easel/sites/" + siteName + "/getPageHTML/" + pageName,
            method: "GET",
            dataType: "html",
            success: function(data) {
                console.log("successfully retrieved page html for " + pageName);
                const html = data;
                var new_el = $($.parseHTML('<li tab-target="#' + pageName + '">' +
                        '<a href=#>' + pageName + '</a>' +
                        '<a href="#" class="close-tab"><span class="icon-close"></span></a>' +
                        '</li>'));
                $('.cr-tabs').prepend(new_el);
                $('#page-content').append(
                        '<div id="' + pageName + '" class="hidden">' +
                        html +
                        '</div>');
                if (isActive) {
                    new_el.trigger('click');
                }
            },
            error: function(jqXHR, textStatus) {
                console.log("error in loading page", pageName, textStatus);
            }
        });
    }

    function doneLoading() {
      $('.preload').remove();
    };

    function addLoading() {
        $('html').append(
            '<div class="preload preloader-overlay">' +
                '<div class="spinner-wrapper">' +
                    '<div class="spinner">' +
                        '<div class="double-bounce1"></div>' +
                        '<div class="double-bounce2"></div>' +
                    '</div>' +
                '<div class="loading">LOADING...</div>' +
                '</div>' +
            '</div>');
    }

    document.addEventListener("keydown", function(e) {
        var current_page = document.getElementsByClassName("active")
        var pageName = $($(current_page).children()[0]).html().toLowerCase()
        var html = $('#'+pageName).html()

        // cmd+s in mac and ctrl+s in other platform
        if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
          e.preventDefault();
          $.ajax({
              url: "/easel/sites/dummy/savePage/",
              method: "POST",
              data: { pageName: pageName,
                      html : html },

              success: function(data) {
                console.log("successful saved the page");
              }
              // TODO add failure case
          });
        }
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
});
