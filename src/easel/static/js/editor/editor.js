'use strict';

/* initializations */
var hiddenTabs = {'pages': true, 'tools': true, 'components': true, 'styles': true}; // right side tabs
var editor; // TODO needed?
var editMode = "editable"; // editable vs sortable
var pagesInfo = {}; //initialized in loadpages
var initializedLibraryUpload = false;
var focusElement;
var customizableAttr = ['margin-left', 'margin-right', 'margin-top', 'margin-bottom',
                        'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
                        'color', 'background-color', 'font-family', 'letter-spacing', 'width',
                        'height', 'border-style', 'border-color', 'border-width', 'border-radius'];

$(function() {
  	/* initialization */
  	setupAjax();
    doneLoading();
    addModeSwitcher(); // event listener to switch editable/sortable mode
    changeStyleOnMode(true);
    initializePagesInfo();
    initializeEditable();
    initializeEditMode(editMode);

    /*
     * ------------------------ Editor Bar Tab
     */
    $('#component-tab').on('click', componentToggle);
    $('#page-tab').on('click', pageToggle);
    $('#tool-tab').on('click', toolToggle);
    $('#style-tab').on('click', styleToggle);
    $('#page-list, #tool-list, #component-list, #style-list').hide();

    /* add close modal handler */
    $("#link-page-modal").modal({
        complete : function() {
        	console.log('you closed modal');
        	$('#link-page-target').removeAttr('id');
        }
    });

    /*
     * ------------------------ Page Menu (Copy and Delete)
     */
    $(document).on("contextmenu", ".file", showPageOptionMenu);		// show menu
    $(document).bind("mousedown", hidePageOptionMenu);				// close menu
    $(".custom-menu li").click(pageOptionHandler);					// menu option clicked
    $("#enter-full-screen").click(enterFullScreen);
    $(document).on('click', "#exit-full-screen", exitFullScreen);

    /*
     * ------------------------ Site Menu (Switch between sites)
     */
    $('#current-site').click(function() { $('#site-menu').removeClass('hidden'); });
    $('#close-site-menu').click(function() { $('#site-menu').addClass('hidden'); });

    /*
     * ------------------------ Components
     */
    // image component
    $('#exteral-url-opt, #existing-page-opt').on('click', showUploadForm);
    $('#local-opt, #library-opt, #link-opt').on('click', showUploadForm);
    $("#upload-media-form").submit(uploadMedia);
    $("#paste-url-form").submit(addPastedURLimgCmp);
    $(".close-img-upload").click(resetImgForm);
    $('#media-library-trigger').click(loadAllProject);
    $(document).on('input', '.nav-opt', navEditChangeHandler);
    $(document).on('change', '.nav-opt', navEditChangeHandler);
    $('#add-nav-btn').on('click', addNavButton);
    $(document).on('click', '.img-to-upload', addSelectedLibraryMedia);
    $(document).on("mousedown", '#page-content', deselectFocusElement);
    $(document).on('click', '#page-content nav', initializeEditNavModal);
    $(document).on('click', '.delete-nav-button', deleteButtonHandler);

    /* open new tab */
    // $(document).on('click', '.page-choice', function() {
    //     var url = $(this).attr('url-target');
    //     addHrefToAnchor(url);
    // });
    var dm = document.getElementsByClassName('dragme');
	for (var i = 0; i < dm.length; i++) {
	    dm[i].addEventListener('dragstart', drag_start, false);
	    document.body.addEventListener('dragover', drag_over, false);
	    document.body.addEventListener('drop', drop, false);
	}

    // ------------------------ Page Tab
    $(document).on('click', '.file', openPageEventHandler);  	// open file
    $(document).on("click", ".close-tab", closeTabHandler);		// close tab
    $(document).on("click", ".cr-tabs > li", switchTabHandler);	// switch active tab
    $( ".cr-tabs" ).sortable({ revert: true }); // allow tabs to be sortable
    $( ".cr-tabs" ).disableSelection();

    // ------------------------ Page Save and Publishing
    $(document).on("keydown", keyboardHandler);		// cmd+s save page
    $(document).on("keyup", keyUpHandler);
    $('#preview-button').click(function() {viewSiteHandler(true)});
    $('#open-site-button').click(function() {viewSiteHandler(false)});
    $('#save-button').click(function() {savePages(Object.keys(pagesInfo))});

    // ------------------------ Add Page
    $('#add-page-modal form').submit(addNewPageModalHandler);

    // ------------------------ Prevent navigation link
    $('nav').on('click', 'a', function (e) {
        e.preventDefault();
    })

    // ------------------------ Editable
    $('#select-link-page-form').submit(selectExistingPageHandler);

    // ------------------------ User Defined (ud) Components
    $(document).on('click', '.delete-ud', function() {
        var ud_to_close = $(this).closest('.ud');
        ud_to_close.remove();
    });
    $(document).on('click', '.ud', focusudHandler);
    $('.style-input').change(styleChangeHandler);

    $(".drag-component").draggable({
        connectToSortable: "#page-content",
        helper: "clone",
        revert: false,

        scroll: false,
        distance: 0,
        zIndex: 1000,
        cursorAt: { left: 50, top: 50 },
        appendTo: 'body',

        connectToSortable: ".sortable",
        helper: function(e, a, b, c) {
            $('#sortable-mode').trigger('click');
            return $(this).clone();
        },
    });
});
