'use strict';

var editable_settings = {
    anchorPreview: {
        /* These are the default options for anchor preview,
           if nothing is passed this is what it used */
        hideDelay: 500,
        previewValueSelector: 'a'
    },
    anchor: {
        placeholderText: 'Type or paste url',
        contentDefault: '<i class="md-sm-text icon-link-bold"></i>',
        linkValidation: true
    },
    indent: {
        contentDefault: '<i class="md-sm-text icon-indent"></i>'
    },
    outdent: {
        contentDefault: '<i class="md-sm-text icon-indent"></i>'
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
            label: '<i class="md-sm-text icon-link"></i>',
            action: function(html, mark, parent) {
                //$('#page-preview').trigger('click');
                updatePageTree(initializeAddNewPageModal);
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

function getCurrentActivePageName() {
    let current_page = document.getElementsByClassName("active");
    return $($(current_page).children()[0]).html();
}

// check if there is any tab currently open
function noTab() {
    return ($('.cr-tabs').children().length === 0);
}

// append empty message if no tab is open
function checkTabPresent() {
    if (noTab()) {
        $('#empty-workspace-msg').removeClass('hidden');
    } else {
        if (!$('#empty-workspace-msg').hasClass('hidden')) {
            $('#empty-workspace-msg').addClass('hidden');
        }
    }
}


/* --------------- editable setting ------------- */
var editor;

function initializeEditable() {
    editor = new MediumEditor('.editable', editable_settings);
    /* change icon content */
    $('.medium-editor-action-justifyLeft').html('<i class="md-sm-text icon-align-left"></i>');
    $('.medium-editor-action-justifyRight').html('<i class="md-sm-text icon-align-right"></i>');
    $('.medium-editor-action-justifyCenter').html('<i class="md-sm-text icon-align-center"></i>');
    $('.medium-editor-action-indent').html('<i class="md-sm-text icon-indent"></i>');
    $('.medium-editor-action-outdent').html('<i class="md-sm-text icon-outdent"></i>');
}

$(function() {
    /* initializations */
    var componentTabHidden = true;
    var pageTabHidden = true;
    var toolTabHidden = true;
    var temp_count = 0;

    /* event listeners */
    $('#component-tab').on('click', componentToggle);
    $('#page-tab').on('click', pageToggle);
    $('#tool-tab').on('click', toolToggle);
    $('#page-list, #tool-list, #component-list').hide();

    /* img upload modal */
    $('#exteral-url-opt, #existing-page-opt').on('click', showUploadForm);
    $('#local-opt, #library-opt, #link-opt').on('click', showUploadForm);
    initializeEditable();

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

    $(document).on("contextmenu", ".file", function(event) {
        // Avoid the real one
        event.preventDefault();
        // add attr to custom-menu
        console.log($(this).find('.page-name').text());
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
        var targetPage = $( this ).attr('page-name'); 
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