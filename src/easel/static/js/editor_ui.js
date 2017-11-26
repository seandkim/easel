'use strict';

/* editor_ui.js - handling page interactions */

/* initializations */
var componentTabHidden = true;
var pageTabHidden = true;
var toolTabHidden = true;
var editor;

/* --------------- editable setting ------------- */
var editable_settings = {
    anchorPreview: {
        hideDelay: 500,
        previewValueSelector: 'a'
    },
    anchor: {
        placeholderText: 'Type or paste url',
        contentDefault: '<i class="md-sm-text icon-link-bold"></i>',
        linkValidation: true
    },
    justifyLeft: {
        contentDefault: '<i class="md-sm-text icon-align-left"></i>'
    },
    toolbar: {
        buttons: ['b', 'i', 'u',
            'h1', 'h3', 'h5',
            'anchor', 'link',
            'justifyLeft', 'justifyRight', 'justifyCenter',
            'indent', 'outdent'
        ]
    },
    extensions: {
        // compact
        'b': new MediumButton({
            label: '<i class="md-sm-text icon-bold"></i>',
            start: '<b>',
            end: '</b>'
        }),
        'i': new MediumButton({
            label: '<i class="md-sm-text icon-italic"></i>',
            start: '<i>',
            end: '</i>'
        }),
        'u': new MediumButton({
            label: '<i class="md-sm-text icon-underline"></i>',
            start: '<u>',
            end: '</u>'
        }),
        'link': new MediumButton({
            label: '<i class="md-sm-text icon-file-o"></i>',
            action: function(html, mark, parent) {
                //$('#page-preview').trigger('click');
                // console.log(html);
                // console.log(mark);
                // console.log(parent);
                updatePageTree(initializeLinkNewPageModal);
                return '<a id="link-page-target" href="#">' + html + '</html>';
            }
        }),
        'left': new MediumButton({
            label: '<i class="md-sm-text icon-align-left"></i>',
            start: '<div class="text-left">',
            end: '</div>'
        }),
        'right': new MediumButton({
            label: '<i class="md-sm-text icon-align-right"></i>',
            start: '<div class="text-right">',
            end: '</div>'
        }),
        'center': new MediumButton({
            label: '<i class="md-sm-text icon-align-center"></i>',
            start: '<div class="text-center">',
            end: '</div>'
        }),
        'margin': new MediumButton({
            label: '<i class="md-sm-text icon-margin"></i>',
            start: '<div class="margin-container">',
            end: '</div>'
        }),
        'width': new MediumButton({
            label: '<i class="md-sm-text icon-arrows-h"></i>',
            start: '<div class="margin-container">',
            end: '</div>'
        }),
        'height': new MediumButton({
            label: '<i class="md-sm-text icon-arrows-v"></i>',
            start: '<div class="margin-container">',
            end: '</div>'
        }),

        // expanded
        'warning': new MediumButton({
            label: '<i class="icon-link-streamline"></i>',
            start: '<div class="warning">',
            end: '</div>'
        }),

        // with JavaScript
        'pop': new MediumButton({
            label: 'POP',
            action: function(html, mark, parent) {
                alert('hello :)')
                return html
            }
        })
    }
};

/* initialize editable area in page preview */
function initializeEditable() {
    editor = new MediumEditor('.editable', editable_settings);
    /* change icon content */
    $('.medium-editor-action-justifyLeft').html('<i class="md-sm-text icon-align-left"></i>');
    $('.medium-editor-action-justifyRight').html('<i class="md-sm-text icon-align-right"></i>');
    $('.medium-editor-action-justifyCenter').html('<i class="md-sm-text icon-align-center"></i>');
    $('.medium-editor-action-indent').html('<i class="md-sm-text icon-outdent"></i>');
    $('.medium-editor-action-outdent').html('<i class="md-sm-text icon-indent"></i>');
    $('.medium-editor-toolbar-save').html('<i class="md-sm-text light-text icon-check"></i>');
    $('.medium-editor-toolbar-close').html('<i class="md-sm-text light-text icon-close"></i>')
                                     .css('color', '#fff');
}

/* return html string of a given icon name */
function getLabel(iconName) {
    return '<i class="md-sm-text icon-' + iconName + '></i>';
}


/* --------------- Page Tab ------------- */
/*
 * activateTab: activate page tab programmatically
 * 
 * input: el - tab li element to be activated
 */
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

/*
 * getCurrentActivePageName : return the page name of active tab
 */
function getCurrentActivePageName() {
    let current_page = $("active");
    return $(current_page.children()[0]).html();
}


/*
 * noTab : check if there is any tab currently open, returns bool
 */
function noTab() {
    return ($('.cr-tabs').children().length === 0);
}

/*
 * checkTabPresent : append empty message if no tab open
 */
function checkTabPresent() {
    if (noTab()) {
        $('#empty-workspace-msg').removeClass('hidden');
    } else {
        if (!$('#empty-workspace-msg').hasClass('hidden')) {
            $('#empty-workspace-msg').addClass('hidden');
        }
    }
}

/* display upload form for image component */
function showUploadForm(e) {
    // hide menu
    $('.upload-option').removeClass('selected');
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


$(function() {

    /* event listeners */
    $('#component-tab').on('click', componentToggle);
    $('#page-tab').on('click', pageToggle);
    $('#tool-tab').on('click', toolToggle);
    $('#page-list, #tool-list, #component-list').hide();

    /* img upload modal */
    $('#exteral-url-opt, #existing-page-opt').on('click', showUploadForm);
    $('#local-opt, #library-opt, #link-opt').on('click', showUploadForm);

    /* initialize editable */
    initializeEditable();

    /* add close modal handler */
    // TODO: fix the fact that closing doesn't trigger complete
    $("#link-page-modal").modal({
        complete : function() { console.log('you closed modal'); $('#link-page-target').removeAttr('id'); }
    });

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

    /* page list: right click shows menu */
    $(document).on("contextmenu", ".file", function(event) {
        // Avoid the real one
        event.preventDefault();
        // add attr to custom-menu
        $(".custom-menu > li").attr('page-name', $(this).find('.page-name').text());
        // Show contextmenu
        $(".custom-menu").finish().toggle(100).
        // In the right position (the mouse)
        css({
            top: event.pageY + "px",
            left: event.pageX + "px"
        });
    });

    // If the document is clicked somewhere
    $(document).bind("mousedown", function(e) {
        // If the clicked element is not the menu
        if (!$(e.target).parents(".custom-menu").length > 0) {
            $(".custom-menu").hide(100);
        }
    });

    // If the menu element is clicked
    $(".custom-menu li").click(function() {
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
    });
});