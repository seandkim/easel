
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
    toolbar: {
        buttons: ['b', 'i', 'u',
            'anchor', 'link',
            'left', 'right', 'center',
            'indent', 'outdent'
        ]
    },
    extensions: {
        // compact
        'b': new MediumButton({
            label: '<i class="md-sm-text icon-bold"></i>',
            action: function(html, mark, parent) {
                return '<strong>' + html + '</strong>';
            }
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
                initializeLinkNewPageModal();
                $('#link-page-target').removeAttr('id'); // removed uncleaned up ids
                return '<a id="link-page-target" href="#">' + html + '</html>';
            }
        }),
        'left': new MediumButton({
            label: '<i class="md-sm-text icon-align-left"></i>',
            action: function(html, mark, parent) {
                $(parent).css('text-align', 'left');
                return html;
            }
        }),
        'right': new MediumButton({
            label: '<i class="md-sm-text icon-align-right"></i>',
            action: function(html, mark, parent) {
                $(parent).css('text-align', 'right');
                return html;
            }
        }),
        'center': new MediumButton({
            label: '<i class="md-sm-text icon-align-center"></i>',
             action: function(html, mark, parent) {
                $(parent).css('text-align', 'center');
                return html;
            }
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
        'color': new MediumButton({
            label: '<i class="md-sm-text icon-palette"></i>',
            action: function(html, mark, parent) {
                initializeLinkNewPageModal();
                return '<a id="link-page-target" href="#">' + html + '</html>';
            }
        }),
    }
};

/* initialize editable area in page preview */
function initializeEditable() {
    editor = new MediumEditor('.editable', editable_settings);
    /* change icon content */
    $('.medium-editor-action-indent').html('<i class="md-sm-text icon-outdent"></i>');
    $('.medium-editor-action-outdent').html('<i class="md-sm-text icon-indent"></i>');
    $('.medium-editor-toolbar-save').html('<i class="md-sm-text light-text icon-check"></i>');
    $('.medium-editor-toolbar-close').html('<i class="md-sm-text light-text icon-close"></i>')
                                     .css('color', '#fff');
}


/* ------------------ Linking anchor tag to exiting page or url */
/* open add new page modal, initializing all page options */
function initializeLinkNewPageModal() {
    var menu = $('#page-opt-list').empty();
    var settings = getPagesSetting();

    $('input.autocomplete').autocomplete({
        data: settings,
        limit: 20,
        onAutocomplete: function(val) {
        },
        minLength: 0,
    });

    // open modal
    $('#link-page-modal').modal('open');
}

// refactor this with component.js nav editor
function getPagesSetting() {
    var pages = [];
    for (let key in pagesInfo) {
      pages.push(key);
    }
    var settings = {};
    for (var i = 0; i < pages.length; i++) {
        var name = pages[i];
        settings[name] = null;
    }
    for (var i = 0; i < pages.length; i++) {
        var name = pages[i];
        settings[name] = null;
    }
    return settings;
}


/* add newly chosen href to the anchor tag */
function addHrefToAnchor(url) {
    var el = $('#link-page-target');
    el.attr('href', url);
    el.removeAttr('id');
    $('#link-page-modal').modal('close');
}


function resetUrlForm() {
    $('#exteral-url-opt, #existing-page-opt').removeClass('selected');
    $('#external-url, #existing-page').addClass('hidden');
}
