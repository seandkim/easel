'use strict';

var editMode = "editable";
var pageTree = [];
var files;

// TODO update sitename
const siteName = 'dummy';

// get new all exisitng pages
function initializeAddNewPageModal() {
    var pages;
    var el = $('#existing-page');

    el.empty();
    pages = pageTree;

    // add page name to selection
    el.append('<ul>');
    for (var i = 0; i < pages.length; i++) {
        el.append(
            '<li>' +
                '<a href="#">' +
                    '<i class="icon-file-o"></i>' + pages[i] +
                '</a>' +
            '</li>'
        );
    }
    el.append('</ul>');

    // open madal
    $('#link-page-modal').modal('open');
}

function updatePageTree(handler) {
    pageTree = [];
    $.ajax({
        url: "/easel/sites/" + siteName + "/getAllPageNames/",
        method: "POST",
        success: function(data) {
            var pages = data["pages"];
            var len = pages.length;
            for (var i = 0; i < len; i++) {
                pageTree.push(pages[i]["name"]);
            }
            if (handler) { handler() };
        },
        error: function(e) {
            console.error("failed to load the page tree: ", e);
        }
    });
}

/* react to after user pasting an url for an image */
function addPastedURLimgCmp(e) {
    e.preventDefault();
    var url = $(this).find('input[name="url"]').val();
    createImgComponent(url);
}

function addSelectedLibraryMedia() {
    var url = $(this).find('img').attr('src');
    createImgComponent(url);
}

/* upload file data */
function uploadMedia(e) {
    e.preventDefault();
    var formData = new FormData($(this)[0]);
    var mediaName = formData.get('name');
    var caption = formData.get('caption');
    var username = $('#page-preview').data()['username'];
    formData.append('username', username);

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
            console.log('media cannot be uploaded');
        }
    });
    return false;
}

function createImgComponent(url) {
    var active_tab = $('.cr-tabs>li.active').attr('tab-target');
    var active_tab_content = $(active_tab).find('.editable').first();
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

function resetUrlForm() {
    $('#exteral-url-opt, #existing-page-opt').removeClass('selected');
    $('#external-url, #existing-page').addClass('hidden');
}

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
    if (isActive) {
        $('li[tab-target="#' + pageName + '"]').trigger('click');
    }

    $.ajax({
        url: "/easel/sites/" + siteName + "/getPageHTML/" + pageName + '/',
        method: "GET",
        dataType: "html",
        success: function(html) {
            console.log('successfully retrieve html for ' + pageName);
            $('#page-content > div#' + pageName).empty().append(html);
            initializeEditable();
            initializeEditMode(editMode);
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

// remove preloader
function doneLoading() {
    $('.preload').remove();
};

function addLoading(el) {
    $(el).append(
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

// check styling depending on page editing mode
function changeStyleOnMode(isEdit) {
    if (isEdit) {
        $('#editable-mode').addClass('selected');
        $("#sortable-mode").removeClass('selected');
        $('#page-preview').css('cursor', 'text');
    } else {
        $('#editable-mode').removeClass('selected');
        $("#sortable-mode").addClass('selected');
        $('#page-preview').css('cursor', 'move');
    }
}

// add logic for editing mode switiching
function addModeSwitcher() {
    /* editable vs sortable mode */
    $(".sortable").sortable({ disabled: true });
    $("#editable-mode").click(function() {
        console.log("editable mode on");
        editMode = "editable";
        $(".sortable").sortable("option", "disabled", true);
        changeStyleOnMode(true);
    })
    $("#sortable-mode").click(function() {
        console.log("sortable mode on");
        editMode = "sortable";
        $(".sortable").sortable("option", "disabled", false);
        changeStyleOnMode(false);
    })
}

function initializeEditMode(mode) {
    $(".sortable").sortable({ disabled: true });
    if (mode == "editable") {
        $(".sortable").sortable("option", "disabled", true);
    } else if (mode == "sortable") {
        $(".sortable").sortable("option", "disabled", false);
    } else {
        console.error("Unrecognizable error mode", mode)
    }
}

function initializeButtons() {
    $('#view-site-button').click(function() {
        let pageName = getCurrentActivePageName();
        let username = $('#page-preview').data()['username'];
        let siteName = $('#page-preview').data()['sitename'];
        let path = "/easel/public/" + username + '/' + siteName + '/' + pageName;
        let url = window.location.origin + path;
        var redirectWindow = window.open(url, '_blank');
        redirectWindow.location;
    });

    $('#publish-button').click(function() {
        saveCurrentPage(function() {
            // TODO add loading animation
            var pagesToPublish = [];
            $.ajax({
                url: "/easel/sites/dummy/publish/",
                method: "POST",
                data: { pages: pagesToPublish },
                success: function(data) {
                    showAlertMsg("Successfully publish site.");
                },
                error: function(e) {
                    showAlertMsg("Error in publishing.");
                }
            });
        })
    })

    // TODO save all pages
    $('#save-button').click(saveCurrentPage);
}

// TODO refactor successhandler (used in publishing)
function saveCurrentPage(successHandler) {
    let pageName = getCurrentActivePageName();
    $.ajax({
        url: "/easel/sites/dummy/savePage/",
        method: "POST",
        data: {
            pageName: pageName,
            html: $('#page-content > #'+pageName).html()
        },
        success: function(data) {
            showAlertMsg("Page saved");
            if (successHandler != null) {
                successHandler();
            }
        },
        error: function(e) {
            // TODO add error handling
            showAlertMsg("could not save page.");
        }
    });
}

// handler for copying existing page
function copyPage(pageToCopy) {
    var pageName;
    // store page to copy in form
    $("#page-to-copy-stored").val(pageToCopy);
    $('#copy-page-modal').modal('open');
    // get new page name and create it
    $('#copy-page-form').submit(function(e) {
        e.preventDefault();
        pageName = $('#copy-page-new-name').val();
        $.ajax({
            url: "/easel/sites/" + siteName + "/copyPage/",
            method: "POST",
            data: { pageName: pageName, pageToCopy: pageToCopy},
            success: function(data) {
                // delete page from workspace
                showAlertMsg("Added new page: " + pageName);
                openFile(pageName);
            },
            error: function(jqXHR, textStatus) {
                console.error("failed to create new page", textStatus);
                showAlertMsg("Error occured when copying page. <br> Please try again.");
            }
        });
    });
}

function deletePage(pageName) {
    var close_li, isRemovingActive;
    close_li = $('.cr-tabs > li[tab-target="#' + pageName + '"]');
    isRemovingActive = close_li.hasClass('active');
    $.ajax({
        url: "/easel/sites/" + siteName + "/deletePage/",
        method: "POST",
        data: { pageName: pageName },
        success: function(data) {
            // delete page from workspace
            closeTab(pageName, close_li, isRemovingActive, true);
            showAlertMsg("Deleted page - " + pageName);
        },
        error: function(jqXHR, textStatus) {
            console.error("failed to delete the page", textStatus);
            showAlertMsg("Error occured when deleting page. <br> Please try again.");
        }
    });
}

function closeTab(pageName, close_li, isRemovingActive, isDelete) {
    // remove content and tab indicator
    $('#page-content > div#' + pageName).remove();
    close_li.remove();
    // change file icon to closed
    if (isDelete) {
        // delete pageTab
        $('.file[file-name="' + pageName + '"]').remove();
    }
    else {
        $('#page-list i.' + pageName).removeClass('icon-file-o').addClass('icon-file');
        changePageStatus(pageName, false, false); // ajax call to server
    }
    
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
}

function openFile(pageName) {
    var file = $('<div class="file" file-name="' + pageName +'">' +
                    '<i class="' + pageName + ' icon icon-file"></i> ' +
                    '<span class="page-name">' + pageName + '</span>' +
                    '</div>');
    $('#page-list').append(file);
    file.trigger('click');
    // if `pages` menu is closed, open it
    // TODO bug: doesn't work the second time
    if ($('#page-tab').find('i').hasClass('icon-right-dir')) {
        $('#page-tab').trigger('click');
    }
}

// on page load
$(document).ready(function() {
    setupAjax();
    doneLoading();
    checkTabPresent();
    addModeSwitcher(); // event listener to switch editable/sortable mode
    initializeButtons();
    changeStyleOnMode(true);
    updatePageTree();

    $("#upload-media-form").submit(uploadMedia);
    $("#paste-url-form").submit(addPastedURLimgCmp);
    $(".close-img-upload").click(resetImgForm);
    $(document).on('click', '.img-to-upload', addSelectedLibraryMedia);

    /* open new tab */
    $(document).on('click', '.file', function(event) {
        event.preventDefault();
        const pageName = $(this).find('.page-name').html();
        $('#page-list i.' + pageName).removeClass('icon-file').addClass('icon-file-o')
        const openedTabs = $('ul.cr-tabs a:not(.close-tab)')
        const tabnames = []
        for (var i = 0; i < openedTabs.length; i++) {
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
        var pageName = $(this).prev().html();
        var close_li = $(this).closest('li');
        var isRemovingActive = close_li.hasClass('active');
        closeTab(pageName, close_li, isRemovingActive, false);
    });

    /* saving by cmd+s */
    document.addEventListener("keydown", function(e) {
        var current_page = document.getElementsByClassName("active")
        var pageName = $($(current_page).children()[0]).html().toLowerCase()

        // cmd+s in mac and ctrl+s in other platform
        if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            saveCurrentPage();
        }
    });

    /* when you add page */
    $('#add-page-modal form').submit(function(e, data) {
        e.preventDefault()
        // TODO for efficiency, better to append tab beforehand and handle error case
        var pageName = $(this).find('input#id_pageName').val();
        var username = $(this).find('input[name="username"]:not(#id_username)').attr('value')

        $('#add-page-modal').modal('close');
        $.ajax({
            url: "/easel/sites/" + siteName + "/addPage/",
            method: "POST",
            data: { username: username, pageName: pageName },
            success: function(data) {
                console.log("successfully added the page");
                openFile(pageName);
            },
            error: function(jqXHR, textStatus) {
                console.error("failed to add the page", textStatus);
            }
        });
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
