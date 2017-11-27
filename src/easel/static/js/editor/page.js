/*
 * TODO @Tiffany update the header
 * file.js - file operations: handling opening, saving, and deleting files
 */

 // updatePages : update the tab/page/icon element after `pagesInfo` changes.
 // when page status changes, you should update `pagesInfo` and call this method
 // instead of changing elements directly.
 // ex) see openTabHandler/closeTabHandler
 function updatePages() {
   // if there is opened pages and no active page, make the first opened page active
   if (!getActivePageName()) {
      for (let name in pagesInfo) {
        if (pagesInfo[name]['opened']) {
          pagesInfo[name]['active'] = true;
          break;
        }
      }
   }

   // close any unclosed page
   for (let name in pagesInfo) {
     // if closed but present in tabs, remove it
     if (!pagesInfo[name]['opened'] && $('#page-content > #'+name+'').length == 1) {
       get$tab(name).remove();
       get$content(name).remove();
       $('#page-list i.' + name).removeClass('icon-file-o').addClass('icon-file');
       changePageStatus(name, false, false); // ajax call to server
     }
   }

   // update active tab
   // get the unactivated tab
   $('#page-content > div').addClass('hidden');
   $('.cr-tabs > li').removeClass('active');

   // replace page review with target tab
   const activeName = getActivePageName();
   if (activeName) {
     get$tab(activeName).addClass('active');
     get$content(activeName).removeClass('hidden');
   } else {
     $('div.empty-workspace-msg').removeClass('hidden');
   }
 }

// handler after file name in file tab is clicked
function openPageEventHandler(e) {
    e.preventDefault();
    const pageName = $(this).find('.page-name').html();
    $('#page-list i.' + pageName).removeClass('icon-file').addClass('icon-file-o');
    const openedTabs = $('ul.cr-tabs a:not(.close-tab)');
    const tabnames = [];
    for (var i = 0; i < openedTabs.length; i++) {
        tabnames.push(openedTabs[i].innerHTML);
    }
    if (!tabnames.includes(pageName)) {
        loadPageHTML(siteName, pageName, true, true);
    }
}

/* update the page tree of current user */
function initializePagesInfo() {
    $.ajax({
        url: "/easel/sites/" + siteName + "/getAllPageNames/",
        method: "POST",
        success: function(data) {
            var pages = data["pages"];
            for (var i = 0; i < pages.length; i++) {
                let name = pages[i]['name'];
                let info = {'opened': pages[i]['opened'] == 'True',
                            'active': pages[i]['active'] == 'True',
                            'saved': true}
                pagesInfo[name] = info;
            }
        },
        error: function(e) {
            console.error("failed to load the page tree: ", e);
        }
    });
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
    // TODO check that it is correct (previously true, true)
    changePageStatus(pageName, isOpened, isActive);
}


// TODO refactor successhandler (used in publishing)
function saveCurrentPage(successHandler) {
    $('.delete-ud-wrapper').remove(); //gets rid of trashCan
    let pageName = getActivePageName();
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


/* handling page event when user opens new file */
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

function publishPageHandler() {
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
}

function viewSiteHandler() {
    let pageName = getActivePageName();
    let username = $('#page-preview').data()['username'];
    let siteName = $('#page-preview').data()['sitename'];
    let path = "/easel/public/" + username + '/' + siteName + '/' + pageName;
    let url = window.location.origin + path;
    var redirectWindow = window.open(url, '_blank');
    redirectWindow.location;
}


function showPageOptionMenu(e) {
    e.preventDefault();
    // add attr to custom-menu
    $(".custom-menu > li").attr('page-name', $(this).find('.page-name').text());
    // Show contextmenu
    $(".custom-menu").finish().toggle(100).
    // In the right position (the mouse)
    css({
        top: e.pageY + "px",
        left: e.pageX + "px"
    });
}

function hidePageOptionMenu(e) {
    // If the clicked element is not the menu
    if (!$(e.target).parents(".custom-menu").length > 0) {
        $(".custom-menu").hide(100);
    }
}

function pageOptionHandler(e) {
    var targetPage = $(this).attr('page-name');
    switch ($(this).attr("data-action")) {
        case "delete":
            console.log('clicked delete ' + targetPage);
            deletePage(targetPage);
            break;
        case "copy":
            console.log('clicked copy ' + targetPage);
            copyPage(targetPage);
            break;
    }
    // Hide it after the action was triggered
    $(".custom-menu").hide(100);
}


function savePage(e) {
    // TODO: sloppy element getter, might have multiple active tab
    var current_page = $(".active");
    var pageName = $(current_page.children()[0]).html().toLowerCase()

    // cmd+s in mac and ctrl+s in other platform
    if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        saveCurrentPage();
    }
}


function addNewPageFormHandler(e, data) {
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
}

function selectExistingPageHandler(e) {
    var url = "#" + $('#autocomplete-input').val();
    e.preventDefault();
    addHrefToAnchor(url);
}
