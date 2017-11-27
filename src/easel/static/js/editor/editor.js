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
            copyPage(targetPage);
            break;
    }
    // Hide it after the action was triggered
    $(".custom-menu").hide(100);
}



function savePage(e) {
	// TODO: sloppy element getter, might have multiple active tab
    var current_page = $(".active");
    var pageName = $(current_page.children()[0]).html().toLowerCase()

    // cmd+s in mac and ctrl+s in other platform
    if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        saveCurrentPage();
    }
}

function closeTabHandler(e) {
	e.preventDefault();
    e.stopPropagation(); // stops event listener for clicking new tab
    var pageName = $(this).prev().html();
    var close_li = $(this).closest('li');
    var isRemovingActive = close_li.hasClass('active');
    closeTab(pageName, close_li, isRemovingActive, false);
}

function addNewPageFormHandler(e, data) {
    e.preventDefault()
    // TODO for efficiency, better to append tab beforehand and handle error case
    var pageName = $(this).find('input#id_pageName').val();
    var username = $(this).find('input[name="username"]:not(#id_username)').attr('value')

    $('#add-page-modal').modal('close');
    $.ajax({
        url: "/easel/sites/" + siteName + "/addPage/",
        method: "POST",
        data: { username: username, pageName: pageName },
        success: function(data) {
            console.log("successfully added the page");
            openFile(pageName);
        },
        error: function(jqXHR, textStatus) {
            console.error("failed to add the page", textStatus);
        }
    });
}

function selectExistingPageHandler(e) {
    var url = "#" + $('#autocomplete-input').val();
    e.preventDefault();
    addHrefToAnchor(url);
}

$(function() {
  	/* initialization */
  	setupAjax();
    doneLoading();
    checkTabPresent();
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
    $(document).on("click", ".cr-tabs > li", openTabHandler);	// switch active tab

    // ------------------------ Page Save and Publishing
    $(document).on("keydown", savePage);		// cmd+s save page
    $('#view-site-button').click(viewSiteHandler);
    $('#publish-button').click(publishPageHandler);
    // TODO save all pages
    $('#save-button').click(saveCurrentPage);

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
