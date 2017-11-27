'use strict';

/* 
 * editor-bar.js - controlling tabs in site editor side bar 
 */

/* slide up and down of editor tab */
function componentToggle() {
    var ind = $('#component-tab').find('.tab-indicator');
    if (componentTabHidden) {
        $('#component-list').slideDown('swing');
        ind.html('<i class="icon icon-down-dir"></i>');
    } else {
        $('#component-list').slideUp('swing');
        ind.html('<i class="icon icon-right-dir"></i>');
    }
    componentTabHidden = !componentTabHidden;
}

/* toggle page tab in editor-bar */
function pageToggle() {
    var ind = $('#page-tab').find('.tab-indicator');
    if (pageTabHidden) {
        $('#page-list').slideDown('swing');
        ind.html('<i class="icon icon-down-dir"></i>');
    } else {
        $('#page-list').slideUp('swing');
        ind.html('<i class="icon icon-right-dir"></i>');
    }
    pageTabHidden = !pageTabHidden;
}

/* toggle tool tab in editor-bar */
function toolToggle() {
    var ind = $('#tool-tab').find('.tab-indicator');
    if (toolTabHidden) {
        $('#tool-list').slideDown('swing');
        ind.html('<i class="icon icon-down-dir"></i>');
    } else {
        $('#tool-list').slideUp('swing');
        ind.html('<i class="icon icon-right-dir"></i>');
    }
    toolTabHidden = !toolTabHidden;
}

