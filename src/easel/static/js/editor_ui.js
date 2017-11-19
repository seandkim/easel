'use strict';

$(function() {

    /* initializations */
    var editor = new MediumEditor('.editable');
    var componentTabHidden = true;
    var pageTabHidden = true;
    var toolTabHidden = true;

    /* event listeners */
    $('#component-tab').on('click', componentToggle);
    $('#page-tab').on('click', pageToggle);
    $('#tool-tab').on('click', toolToggle);
    $('#page-list, #tool-list, #component-list').hide();

    /* img upload modal */
    $('#local-opt, #library-opt, #link-opt').on('click', showUploadForm);

    function showUploadForm(e) {
        // hide menu
        $('.upload-option').removeClass('selected');
        $('#item-menu').addClass('hidden');
        $(this).addClass('selected');
        // show form
        var upload_form_id = $(this).attr('opt-target');
        var upload_form = $(upload_form_id);
        $('.upload-opt-div').addClass('hidden');
        upload_form.removeClass('hidden');
    }

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

    /* page tab: open and close on active and inactive */
    $(document).on("click", ".cr-tabs > li", function(e) {
        // get the unactivated tab
        var unactivated_tab = $('.cr-tabs').find('.active');
        var unactivated_tab_content = unactivated_tab.attr('tab-target');
        $(unactivated_tab_content).addClass('hidden');
        $('.cr-tabs > li').removeClass('active');

        // replace page review with target tab
        $(this).addClass('active');
        var activated_tab = $(this).attr('tab-target');
        $(activated_tab).removeClass('hidden');
    });

    // TODO: fix the hovering bug
    var cr_tabs = $('.cr_tabs>li');
    cr_tabs.hover(function() {
        cr_tabs.removeClass('hover');
        $(this).addClass('hover');
    }, function() {
        cr_tabs.removeClass('hover');
    });

    // TODO fix the hovering state of the button
    /* hovering event of add page button */
    // $('#add-page').hover(function() {
    //     $(this).find('a').html('<i class="icon-plus-circle"></i>');
    // }, function() {
    //     $(this).find('a').html('<i class="icon-plus"></i>');
    // });

    /* activate page tab programmatically */
    function activateTab(el) {
        var cr_tabs = $('.cr-tabs > li');
        // get the unactivated tab
        var unactivated_tab = $('.cr-tabs').find('.active').attr('tab-target');
        $(unactivated_tab).addClass('hidden');
        cr_tabs.removeClass('active');

        // replace page review with target tab
        el.addClass('active');
        var activated_tab = el.attr('tab-target');
        $(activated_tab).removeClass('hidden');
    }

});