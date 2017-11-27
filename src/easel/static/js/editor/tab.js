/*
 * tab.js - user interaction with page tab. Closing, opening, organizing tabs.
 */


// getCurrentActivePageName : return the page name of active tab
function getCurrentActivePageName() {
    for (let page in pagesInfo) {
      if (page['active']) {
        return page['name'];
      }
    }
}

// noTab : check if there is any tab currently open, returns bool
function noTab() {
    return ($('.cr-tabs').children().length === 0);
}

// checkTabPresent : append empty message if no tab open
function checkTabPresent() {
    if (noTab()) {
        $('#empty-workspace-msg').removeClass('hidden');
    } else {
        if (!$('#empty-workspace-msg').hasClass('hidden')) {
            $('#empty-workspace-msg').addClass('hidden');
        }
    }
}

// open tab: click handler for opening page tab
function openTabHandler(e) {
    // get the unactivated tab
    var unactivated_tab = $('.cr-tabs').find('.active');
    var unactivated_tab_content = unactivated_tab.attr('tab-target');
    $(unactivated_tab_content).addClass('hidden');
    $('.cr-tabs > li').removeClass('active');

    // replace page review with target tab
    $(this).addClass('active');
    var activated_tab = $(this).attr('tab-target');
    $(activated_tab).removeClass('hidden');
}

// get the active page tab content
function getActivePageTabContentId() {
    return $( '.cr-tabs>li.active' ).attr('tab-target');
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

function closeTabHandler(e) {
    e.preventDefault();
    e.stopPropagation(); // stops event listener for clicking new tab
    var pageName = $(this).prev().html();
    var close_li = $(this).closest('li');
    var isRemovingActive = close_li.hasClass('active');
    closeTab(pageName, close_li, isRemovingActive, false);
}
