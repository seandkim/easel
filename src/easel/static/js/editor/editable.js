
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


/* open add new page modal, initializing all page options */
function initializeLinkNewPageModal() {
    var pages = pageTree;
    var menu = $('#page-opt-list').empty();
    var settings = {};

    // // add page name to selection
    // var el = $('<ul class="page-selection"></ul>');
    // for (var i = 0; i < pages.length; i++) {
    //     var name = pages[i];
    //     el.append(
    //         '<li>' +
    //             '<a href="#" class="page-choice" url-target="#' + name + '">' +
    //                 '<i class="icon-file"></i> ' + 
    //                 '<span class="page-name">' + name + '</span>' +
    //             '</a>' +
    //         '</li>'
    //     );
    // }
    // menu.append(el);
    for (var i = 0; i < pages.length; i++) {
        var name = pages[i];
        settings[name] = null;
    }

    $('input.autocomplete').autocomplete({
        data: settings,
        limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
        onAutocomplete: function(val) {
          // Callback function when value is autcompleted.
        },
        minLength: 0, // The minimum length of the input for the autocomplete to start. Default: 1.
    });
       
    // open modal
    $('#link-page-modal').modal('open');
}


/* add newly chosen href to the anchor tag */
function addHrefToAnchor(url) {
    var el = $('#link-page-target');
    el.attr('href', url);
    el.removeAttr('id');
    $('#link-page-modal').modal('close');
}

