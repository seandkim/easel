'use strict';

var editMode = "editable";

$(document).ready(function() {
    setupAjax();
    doneLoading();
    checkTabPresent();
    addModeSwitcher(); // event listener to switch editable/sortable mode
    changeStyleOnMode(true);

    // TODO update sitename
    const siteName = 'dummy';
    var files;

    /* publish button */
    $(".publish").click(function() {
        // TODO add loading animation
        var pagesToPublish = [];
        $.ajax({
            url: "/easel/sites/dummy/publish/",
            method: "POST",
            data: { pages: pagesToPublish },
            success: function(data) {
                showAlertMsg("Successfully publish site.");
            },
            error: function (e) {
                console.log(e);
            }
        });
    });

    $("#upload-media-form").submit(upload);
    $("#paste-url-form").submit(addPastedURLimgCmp);
    $(".close-img-upload").click(resetImgForm);
    // handler after user select image to upload in library upload form
    $(document).on('click', '.img-to-upload', addSelectedLibraryMedia);


    /* react to after user pasting an url for an image */
    function addPastedURLimgCmp(e) {
        e.preventDefault();
        var url = $(this).find('input[name="url"]').val();
        createImgComponent(url);
    }

    function addSelectedLibraryMedia() {
        var url = $( this ).find('img').attr('src');
        createImgComponent(url);
    }

    /* upload file data */
    function upload(e) {
        e.preventDefault();
        var formData = new FormData($(this)[0]);
        var mediaName = formData.get('name');
        var caption = formData.get('caption');
        console.log('uploading media named ' + mediaName);

        for (var [key, value] of formData.entries()) {
          console.log(key, value);
        }

        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            success: function(data) {
                showAlertMsg('successfully uploaded file');
                // TODO harcoded img path
                var url = '/easel/projects/ungrouped/getMediaPhoto/' + mediaName;
                createImgComponent(url);
            },
            error: function(data) {
                // TODO error handling
            }
        });
        return false;
    }

    function createImgComponent(url) {
        var active_tab = $( '.cr-tabs>li.active' ).attr('tab-target');
        var active_tab_content = $( active_tab );
        console.log('creating component ' + '<img src="' + url + '"> in ' + active_tab);
        active_tab_content.prepend(
            '<div class="ud"><img class="ud" src="' + url + '"><div>'
        );
        $('#select-img-modal').modal('close');
        resetImgForm();
    }

    function resetImgForm() {
        $('#local-opt, #library-opt, #link-opt').removeClass('selected');
        $('#local-upload, #library-upload, #link-upload').addClass('hidden');
    }

    /* open new tab */
    $(document).on('click', '.file', function(event) {
       event.preventDefault();
       const pageName = $(this).find('.page-name').html();
       $('#page-list i.' + pageName).removeClass('icon-file').addClass('icon-file-o')
       const openedTabs = $('ul.cr-tabs a:not(.close-tab)')
       const tabnames = []
       for (var i=0; i<openedTabs.length; i++) {
           tabnames.push(openedTabs[i].innerHTML)
       }
       if (!tabnames.includes(pageName)) {
           loadPageHTML(siteName, pageName, true, true);
       }
    });

    /* close new tab */
    $(document).on("click", ".close-tab", function(e) {
      e.preventDefault();
      e.stopPropagation(); // stops event listener for clicking new tab
      var pageName = $(this).prev().html()
      var close_li = $(this).closest('li');
      var isRemovingActive = close_li.hasClass('active');

      // remove content and tab indicator
      $('#page-content > div#'+pageName).remove()
      close_li.remove();
      // change file icon to closed
      $('#page-list i.' + pageName).removeClass('icon-file-o').addClass('icon-file')

      // ajax call to server
      changePageStatus(pageName, false, false);

      // select the next open tab
      if (isRemovingActive) {
        if ($('.cr-tabs > li').length > 0) {
            var new_active_tab = $('.cr-tabs > li').last();
            new_active_tab.trigger('click');
            var new_pageName = new_active_tab.find('a:not(.close-tab)').html();
            changePageStatus(new_pageName, true, true);
        }
      }
      checkTabPresent();
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
                    showAlertMsg("Page saved!");
                },
                error: function(e) {
                    // TODO add error handling
                    console.log(e);
                }
            });
        }
    });

    /* when you add page */
    $('#add-page-modal form').submit(function(e,data) {
        e.preventDefault()
        // TODO for efficiency, better to append tab beforehand and handle error case
        var pageName = $(this).find('input#id_pageName').val();
        var username = $(this).find('input[name="username"]:not(#id_username)').attr('value')

        $('#add-page-modal').modal('close');
        $.ajax({
            url: "/easel/sites/" + siteName + "/addPage/",
            method: "POST",
            data: {username: username, pageName: pageName},
            success: function(data) {
                console.log("successfully added the page");
                var file = $('<div class="file">'+
                                '<i class="'+pageName+' icon icon-file"></i> '+
                                '<span class="page-name">'+pageName+'</span>'+
                             '</div>');
                $('#page-list').append(file);
                file.trigger('click');
                // if `pages` menu is closed, open it
                // TODO bug: doesn't work the second time
                if ($('#page-tab').find('i').hasClass('icon-right-dir')) {
                    $('#page-tab').trigger('click')
                }
            },
            error: function(jqXHR, textStatus) {
                console.error("failed to add the page", textStatus);
            }
        });
    })

    function loadPageHTML(siteName, pageName, isOpened, isActive) {
        // create tab instantly and add it to page tab
        var new_el = $($.parseHTML('<li tab-target="#' + pageName + '">' +
                '<a href=#>' + pageName + '</a>' +
                '<a href="#" class="close-tab"><span class="icon-close"></span></a>' +
                '</li>'));
        $('.cr-tabs').prepend(new_el);

        // hide the current active page
        $('#page-content > div:not(.hidden)').addClass('hidden');
        // check if need to remove empty message
        checkTabPresent();
        // append new active tab with empty content
        var content_div = $('#page-content').append(
            '<div id="' + pageName + '" class="hidden"></div>'
        );
        // add preloader until done loading
        addLoading('#' + pageName);
        // trigger click event on the tab
        if ( isActive ) {
            $('li[tab-target="#'+ pageName +'"]').trigger('click');
        }

        $.ajax({
            url: "/easel/sites/" + siteName + "/getPageHTML/" + pageName + '/',
            method: "GET",
            dataType: "html",
            success: function(html) {
                console.log('successfully retrieve html for ' + pageName);
                $('#page-content > div#' + pageName).empty().append(html);
                initializeEditable();
                initializeMode(editMode);
            },
            error: function(jqXHR, textStatus) {
                console.log("error in loading page", pageName, textStatus);
                new_el.remove(); // remove the opened tab
                content_div.remove();
                var new_active_tab = $('.cr-tabs > li').last();
                new_active_tab.trigger('click');
                checkTabPresent();
                // TODO display error message
            }
        });
        changePageStatus(pageName, true, true);
    }

    function changePageStatus(pageName, isOpened, isActive) {
        $.ajax({
            url: "/easel/sites/" + siteName + "/changePageStatus/" + pageName + '/',
            method: "POST",
            data: { isOpened: isOpened, isActive: isActive },
            success: function(data) {
                console.log("successfully changed page status", pageName);
            },
            error: function(jqXHR, textStatus) {
                console.log("error in changing page status", pageName, textStatus);
                // TODO display server down error message
            }
        });
    }

    function doneLoading() {
      $('.preload').remove();
    };

    function addLoading(el) {
        $( el ).append(
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

    function changeStyleOnMode(isEdit) {
        if (isEdit) {
            $('#editable-mode').addClass('selected');
            $("#sortable-mode").removeClass('selected');
            $('#page-preview').css('cursor', 'text');
        }
        else {
            $('#editable-mode').removeClass('selected');
            $("#sortable-mode").addClass('selected');
            $('#page-preview').css('cursor', 'move');
        }
    }

    function addModeSwitcher() {
        /* editable vs sortable mode */
        $(".sortable").sortable({disabled: true});
        $("#editable-mode").click(function() {
            console.log("editable mode on");
            editMode = "editable";
            $(".sortable").sortable( "option", "disabled", true );
            changeStyleOnMode(true);
        })
        $("#sortable-mode").click(function() {
            console.log("sortable mode on");
            editMode = "sortable";
            $(".sortable").sortable( "option", "disabled", false );
            changeStyleOnMode(false);
        })
    }

    function initializeMode(mode) {
        $(".sortable").sortable({disabled: true});
        if (mode=="editable") {
            $(".sortable").sortable( "option", "disabled", true );
        } else if (mode=="sortable") {
            $(".sortable").sortable( "option", "disabled", false );
        } else {
            console.error("Unrecognizable error mode", mode)
        }
    }

    // check if there is any tab currently open
    function noTab() {
        return ($('.cr-tabs').children().length === 0);
    }

    // append empty message if no tab is open
    function checkTabPresent() {
        if (noTab()) {
            $('#empty-workspace-msg').removeClass('hidden');
        }
        else {
            if (!$('#empty-workspace-msg').hasClass('hidden')) {
                $('#empty-workspace-msg').addClass('hidden');
            }
        }
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
