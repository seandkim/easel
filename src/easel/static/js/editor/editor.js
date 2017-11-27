'use strict';

/* initializations */
var hiddenTabs = {'pages': true, 'tools': true, 'components': true}; // right side tabs
var editor; // TODO needed?
var editMode = "editable"; // editable vs sortable
var pagesInfo = {}; //initialized in loadpages
var initializedLibraryUpload = false;
var focusElement;

// TODO update sitename
const siteName = 'dummy';

$(function() {
  	/* initialization */
  	setupAjax();
    doneLoading();
    addModeSwitcher(); // event listener to switch editable/sortable mode
    changeStyleOnMode(true);
    initializePagesInfo();
    initializeEditable();

    /*
     * ------------------------ Editor Bar Tab
     */
    $('#component-tab').on('click', componentToggle);
    $('#page-tab').on('click', pageToggle);
    $('#tool-tab').on('click', toolToggle);
    $('#page-list, #tool-list, #component-list').hide();

    /* add close modal handler */
    // TODO: fix the fact that closing doesn't trigger complete
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


    /*
     * ------------------------ Components
     */
    // image component
    $('#exteral-url-opt, #existing-page-opt').on('click', showUploadForm);
    $('#local-opt, #library-opt, #link-opt').on('click', showUploadForm);
    $("#upload-media-form").submit(uploadMedia);
    $("#paste-url-form").submit(addPastedURLimgCmp);
    $(".close-img-upload").click(resetImgForm);
    $(document).on('click', '.img-to-upload', addSelectedLibraryMedia);

    /* open new tab */
    // $(document).on('click', '.page-choice', function() {
    //     var url = $(this).attr('url-target');
    //     addHrefToAnchor(url);
    // });

    // ------------------------ Page Tab
    $(document).on('click', '.file', openPageEventHandler);  	// open file
    $(document).on("click", ".close-tab", closeTabHandler);		// close tab
    $(document).on("click", ".cr-tabs > li", switchTabHandler);	// switch active tab

    // ------------------------ Page Save and Publishing
    $(document).on("keydown", shortcutKeyboardHandler);		// cmd+s save page
    $('#view-site-button').click(viewSiteHandler);
    $('#publish-button').click(function() {savePage(getActivePageName(), true)}); // TODO publish only the current active page
    $('#save-button').click(function() {
      // save all opened pages
      for (var name in pagesInfo) {
        if (pagesInfo[name]['opened']) {savePage(name, false);}
      }});

    // ------------------------ Add Page
    $('#add-page-modal form').submit(addNewPageFormHandler);

    // ------------------------ Editable
    $('#select-link-page-form').submit(selectExistingPageHandler);


    // ------------------------ User Defined (ud) Components
    $(document).on('click', '.delete-ud', function() {
        var ud_to_close = $(this).closest('.ud');
        ud_to_close.remove();
    });

    // allow delete component on hover
    $('.ud').mouseenter(addTrashcanButton);
    $('.ud').mouseleave(deleteTrashcanButton)

    $('.drag-component').draggable({
        scroll: false,
        distance: 0,
        zIndex: 1000,
        revert : false,
        cursorAt: { left: 50, top: 50 },
        helper: 'clone',
        appendTo: 'body'
    });

    $(".drag-component").draggable({
        connectToSortable: "#page-content",
        helper: "clone",
        revert: "invalid"
    });

    $("#page-content").droppable({
        accept: ".drag-component",
        activeClass: "ui-state-default",
        hoverClass: "ui-state-hover",
        drop: componentDropHandler
    });

});
