/* TODO @Tiffany update the header file.js - file operations: handling opening, saving, and deleting files */

// updatePages : update the tab/page/icon element after `pagesInfo` changes.
// when page status changes, you should update `pagesInfo` and call this method
// instead of changing elements directly.
// ex) see openTabHandler/closeTabHandler
function updatePages() {
    const unsaved_icon = 'icon-asterisk' // TODO change to diff icon?

    // delete any page that is not in pagesInfo
    const icons = $('#page-list').children();
    const deleteNames = []
    if (Object.keys(pagesInfo).length != icons.length) {
        for (let i = 0; i < icons.length; i++) {
            const name = $(icons[i]).attr('file-name');
            if (!(name in pagesInfo)) {
                deleteNames.push(name);
            }
        }
    }

    for (let i = 0; i < deleteNames.length; i++) {
        const name = deleteNames[i];
        get$tab(name).remove();
        get$content(name).remove();
        get$icon(name).remove();
    }

    // if there is opened pages and no active page, make the first opened page active
    if (!getActivePageName()) {
        for (let name in pagesInfo) {
            if (pagesInfo[name]['opened']) {
                pagesInfo[name]['active'] = true;
                break;
            }
        }
    }

    for (let name in pagesInfo) {
        // create closed icon if not created (for page that has been created)
        if (get$icon(name).length == 0) {
            var file = $('<div class="file" file-name="' + name + '">' + '<i class="' + name + ' icon icon-file"></i> ' + '<span class="page-name">' + name + '</span>' + '</div>');
            $('#page-list').append(file);
        }

        // close any unclosed page (closed but present in tabs)
        if (!pagesInfo[name]['opened'] && $('#page-content > #' + name + '').length == 1) {
            get$tab(name).remove();
            get$content(name).remove();
            //TODO use get$icon!
            get$icon(name).find('i').removeClass('icon-file-o').addClass('icon-file');
            changePageStatus(name, false, false); // ajax call to server
        }
        // open any unopened page
        if (pagesInfo[name]['opened'] && $('#page-content > #' + name + '').length == 0) {
            get$icon(name).find('i').removeClass('icon-file').addClass('icon-file-o');
            openPage(siteName, name);
        }

        // remove dot for saved tab
        if (pagesInfo[name]['saved']) {
          let span = get$tab(name).find('span');
          $(span).removeClass(unsaved_icon);
          $(span).addClass('icon-close');
          $(span).off('mouseenter mouseleave'); // remove hover event of toggling icon
        }
    }

    // update active tab
    // get the unactivated tab
    $('#page-content > div').addClass('hidden');
    $('.cr-tabs > li').removeClass('active');

    // replace page review with target tab
    const activeName = getActivePageName();
    if (activeName) {
        if (!pagesInfo[activeName]['saved']) {
          // display dot for unsaved tab
          let span = get$tab(activeName).find('span');
          $(span).removeClass('icon-close');
          $(span).addClass(unsaved_icon);
          $(span).hover(function() {
              $(span).toggleClass('icon-close '+unsaved_icon);
          });
        }

        get$tab(activeName).addClass('active');
        get$content(activeName).removeClass('hidden');
        changePageStatus(activeName, true, true); // ajax call to server TODO every time?
    } else {
        $('div.empty-workspace-msg').removeClass('hidden');
    }
}

function getCurrSiteName() {
    return $('#page-preview').data()['sitename'];
}

function getCurrUsername() {
    return $('#page-preview').data()['username'];
}

function getAllPageNames() {
    const names = [];
    const list = $('#page-list div');
    for (let i=0; i<list.length; i++) {
        names.push($(list[i]).attr('file-name'));
    }
    return names;
}

/* update the page tree of current user */
function initializePagesInfo() {
    siteName = getCurrSiteName();
    $.ajax({
        url: "/easel/sites/" + siteName + "/getAllPageNames/",
        method: "POST",
        success: function(data) {
            var pages = data["pages"];
            for (var i = 0; i < pages.length; i++) {
                let name = pages[i]['name'];
                let info = {
                    'opened': pages[i]['opened'] == 'True',
                    'active': pages[i]['active'] == 'True',
                    'saved': true
                }
                pagesInfo[name] = info;
            }
            updatePages();
        },
        error: function(e) {
            console.error("failed to load the page tree: ", e);
        }
    });
}

function openPage(siteName, pageName) {
    // create tab instantly and add it to page tab
    var $new_el = $($.parseHTML('<li tab-target="#' + pageName + '">' + '<a href=#>' + pageName + '</a>' + '<a href="#" class="close-tab"><span class="icon-close"></span></a>' + '</li>'));
    $('.cr-tabs').prepend($new_el);

    // append new active tab with empty content
    var $div_page = $('<div id="' + pageName + '" class="hidden"></div>')
    $('#page-content').append($div_page);
    loadPageHTML(siteName, pageName, function(jqXHR, textStatus) {
        // TODO what should be done in error case?
        $new_el.remove(); // remove the opened tab
        $div_page.remove();
        pagesInfo[pageName]['opened'] = false;
        pagesInfo[pageName]['active'] = false;
        updatePages()
    });
}

function loadPageHTML(siteName, pageName, errorHandler) {
    // add preloader until done loading
    addLoading('#' + pageName);
    $.ajax({
        url: "/easel/sites/" + siteName + "/getPageHTML/" + pageName + '/',
        method: "GET",
        dataType: "json",
        success: function(json) {
            console.log('successfully retrieve html for ' + pageName);
            console.log(json.content_html);
            const html = json.nav_html + "\n" + json.content_html;
            $('#page-content > div#' + pageName).empty().append(html);
            initializeEditable();
            initializeEditMode(editMode);
        },
        error: function(jqXHR, textStatus) {
            showAlertMsg("Error in loading page " + pageName);
            if (errorHandler) {
                errorHandler(jqXHR, textStatus);
            }
        }
    });
}

function changePageStatus(pageName, isOpened, isActive) {
    setupAjax();
    $.ajax({
        url: "/easel/sites/" + siteName + "/changePageStatus/" + pageName + '/',
        method: "POST",
        data: {
            isOpened: isOpened,
            isActive: isActive
        },
        success: function(data) {
            console.log("successfully changed page status", pageName);
        },
        error: function(jqXHR, textStatus) {
            console.log("error in changing page status", pageName, textStatus);
            // TODO display server down error message
        }
    });
}

// handler after file name in file tab is clicked
function openPageEventHandler(e) {
    e.preventDefault();
    for (let name in pagesInfo) {
        pagesInfo[name]['active'] = false;
    }

    // open first, then make it active by calling switchTabHandler
    const pageName = $(this).find('.page-name').html();
    pagesInfo[pageName]['opened'] = true;
    pagesInfo[pageName]['active'] = true;
    updatePages();
}

function keyboardHandler(e) {
    const cmdPressed = navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey

    // cmd+s in mac and ctrl+s in other platform
    if (cmdPressed) {
        if (e.keyCode == 83) {
            e.preventDefault();
            var pageName = getActivePageName();
            savePages([pageName]);
        }

    // mark active page as unsaved TODO only when meta key is not pressed?
    } else {
        console.log("keyboard handler else case")
        let activePage = pagesInfo[getActivePageName()];
        if (activePage && activePage['saved']) {
            activePage['saved'] = false;
            updatePages();
        }
    }
}

function savePages(allPageNames, successHandler, errorHandler) {
    if (!allPageNames) {
        console.error("wrong pageNames");
        return;
    }
    setupAjax();

    const pageNames = []; // save only opened pages
    for (let i=0; i<allPageNames.length; i++) {
        const name = allPageNames[i];
        if (pagesInfo[name]['opened']) {
            pageNames.push(name)
        }
    }

    const htmls = [];
    for (let i=0; i<pageNames.length; i++) {
        const pageName = pageNames[i];
        const $content = $('#page-content > #' + pageName).find('.content-html')
        const html = ($('<div>').append($content.clone())).html(); // TODO inefficient?
        if (html) {
            htmls.push(html)
        } else {
            showAlertMsg("could not save page.");
            if (errorHandler) {
                errorHandler(jqXHR);
            }
            return;
        }
    }

    $('.delete-ud-wrapper').remove(); //gets rid of all trashCans
    $('#ud-focus').removeAttr('id');
    $.ajax({
        url: "/easel/sites/" + siteName + "/savePages/",
        method: "POST",
        data: {
            pageNames: pageNames,
            htmls: htmls
        },
        dataType: 'json',
        success: function(data) {
            showAlertMsg("Page saved");
            for (let i=0; i<pageNames.length; i++) {
                if (!pagesInfo[pageNames[i]]['saved']) {
                    pagesInfo[pageNames[i]]['saved'] = true;
                }
            }
            updatePages();
            if (successHandler) {
              successHandler(data);
            }
        },
        error: function(jqXHR) {
            showAlertMsg("could not save page.");
            if (errorHandler) {
                errorHandler(jqXHR);
            }
        }
    });
}

function deletePage(pageName) {
    setupAjax();
    $.ajax({
        url: "/easel/sites/" + siteName + "/deletePage/",
        method: "POST",
        data: {
            pageName: pageName
        },
        success: function(data) {
            const res = delete pagesInfo[pageName];
            console.assert(res);
            showAlertMsg("Deleted page - " + pageName);
            updatePages();
        },
        error: function(jqXHR, textStatus) {
            console.error("failed to delete the page", textStatus);
            showAlertMsg("Error occured when deleting page. <br> Please try again.");
        }
    });
}

// viewSiteHandler : visit the site
// @param private : if true, view saved page; if false, view published site
function viewSiteHandler(private) {
    let pageName = getActivePageName();
    let username = getCurrUsername();
    let siteName = getCurrSiteName();
    let scope = private ? 'private/' : 'public/'
    let path = "/easel/" + scope + username + '/' + siteName + '/' + pageName;
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
            copyPageModalHandler(targetPage);
            break;
    }
    // Hide it after the action was triggered
    $(".custom-menu").hide(100);
}

function createPage(pageName, copyPageName) {
    function successHandler(data) {
        console.log("successfully added the page");
        // create new entry in pagesInfo
        const newPage = data['pages'][0];
        let name = newPage['name'];
        let info = {
            'opened': newPage['opened'] == 'True',
            'active': newPage['active'] == 'True',
            'saved': true
        }
        pagesInfo[name] = info;
        updatePages();

        get$icon(name).trigger('click');
        // TODO possible bug?
        if ($('#page-tab').find('i').hasClass('icon-right-dir')) {
            $('#page-tab').trigger('click');
        }
    }

    const modal_id = copyPageName ? 'copy-page-modal' : 'add-page-modal';

    const requestData = {pageName: pageName, copyPageName: copyPageName}
    modalSubmitHandler(modal_id, "/easel/sites/"+getCurrSiteName()+"/addPage/",
                      'POST', requestData, successHandler);
}

function addNewPageModalHandler(e) {
    e.preventDefault();
    var pageName = $(this).find('input#id_pageName').val();
    createPage(pageName, "");
}

function copyPageModalHandler(copyPageName) {
    // store page to copy in form
    $("#page-to-copy-stored").val(copyPageName);
    $('#copy-page-modal').modal('open');
    // get new page name and create it
    $('#copy-page-form').submit(function(e) {
        e.preventDefault();
        const pageName = $('#copy-page-new-name').val();
        createPage(pageName, copyPageName);
    });
}

function selectExistingPageHandler(e) {
    var targetPage = $('#autocomplete-input').val();
    var username = getCurrUsername();
    var site = getCurrSiteName();
    var url = "/easel/public/" + username + "/" + site + "/" + targetPage;
    e.preventDefault();
    addHrefToAnchor(url);
}
