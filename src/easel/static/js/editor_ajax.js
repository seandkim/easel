'use strict';

$(document).ready(function() {
    setupAjax();

    // TODO update sitename
    const siteName = 'dummy';
    doneLoading();

    /* publish button */
    $(".publish").click(function() {
        // TODO add loading animation
        var pagesToPublish = [];
        $.ajax({
            url: "/easel/sites/dummy/publish/",
            method: "POST",
            data: { pages: pagesToPublish },
            success: function(data) {
                console.log("successfully published the page");
            },
            error: function (e) {
                console.log(e);
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
       const pageName = $(this).find('.page-name').html();
       const openedTabs = $('ul.cr-tabs a:not(.close-tab)')
       const tabnames = []
       for (var i=0; i<openedTabs.length; i++) {
           tabnames.push(openedTabs[i].innerHTML)
       }
       if (!tabnames.includes(pageName)) {
           loadPageHTML(siteName, pageName, true, true);
       }
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

    function loadPageHTML(siteName, pageName, isOpened, isActive) {
        // create tab instantly
        var new_el = $($.parseHTML('<li tab-target="#' + pageName + '">' +
                '<a href=#>' + pageName + '</a>' +
                '<a href="#" class="close-tab"><span class="icon-close"></span></a>' +
                '</li>'));
        $('.cr-tabs').prepend(new_el);

        // hide the current active page
        $('#page-content > div:not(.hidden)').addClass('hidden')

        var content_div = $('#page-content').append(
            '<div id="' + pageName + '" class="hidden"></div>');
        if (isActive) {
            $('li[tab-target="#'+ pageName +'"]').trigger('click')
        }

        $.ajax({
            url: "/easel/sites/" + siteName + "/getPageHTML/" + pageName + '/',
            method: "POST",
            data: { isOpened: isOpened, isActive: isActive },
            dataType: "html",
            success: function(data) {
                console.log("successfully retrieved page html for " + pageName);
                const html = data;
                $('#page-content > div#'+pageName).append(html);
            },
            error: function(jqXHR, textStatus) {
                console.log("error in loading page", pageName, textStatus);
                new_el.remove() // remove the opened tab
                content_div.remove()
                // TODO display error message
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
