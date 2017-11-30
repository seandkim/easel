
/*
 * ui.js - handling page interactions
 */

 var previewStyle = {
            "position": "absolute",
            "width": "100%",
            "height": "100%",
            "top": "40px",
            "left": "initial",
            "overflow-y": "scroll"
        };
var fullScreenStyle = {
        "position": "fixed",
        "width": "100%",
        "height": "100%",
        "top": "0",
        "left": "0"
    };

/* return html string of a given icon name */
function getLabel(iconName) {
    return '<i class="md-sm-text icon-' + iconName + '></i>';
}

// check styling depending on page editing mode
function changeStyleOnMode(isEdit) {
    if (isEdit) {
        $('#editable-mode').addClass('selected');
        $("#sortable-mode").removeClass('selected');
        $('#page-preview').css('cursor', 'text');
    } else {
        $('#editable-mode').removeClass('selected');
        $("#sortable-mode").addClass('selected');
        $('#page-preview').css('cursor', 'move');
    }
}

// add logic for editing mode switiching
function addModeSwitcher() {
    /* editable vs sortable mode */
    $("#editable-mode").click(function() {
        console.log("editable mode on");
        editMode = "editable";
        $(".sortable").sortable("option", "disabled", true);
        changeStyleOnMode(true);
    })
    $("#sortable-mode").click(function() {
        console.log("sortable mode on");
        editMode = "sortable";
        $(".sortable").sortable("option", "disabled", false);
        changeStyleOnMode(false);
    })
}

function initializeEditMode(mode) {
    $(".sortable").sortable({
        disabled: true,
        placeholder: 'block-placeholder',
        update: componentDropHandler,
    });
    if (mode == "editable") {
        $(".sortable").sortable("option", "disabled", true);
    } else if (mode == "sortable") {
        $(".sortable").sortable("option", "disabled", false);
    } else {
        console.error("Unrecognizable error mode", mode);
    }
}

function exitFullScreen() {
    $('#exit-full-screen').remove();
    $('#page-content').css(previewStyle);
    $('.editor-bar').fadeIn();
    $('#sidebar').fadeIn();
}

function enterFullScreen() {
    $('#page-content').css(fullScreenStyle);
        $('.editor-bar').fadeOut();
        $('#sidebar').fadeOut();
        $('#page-content').append(
           '<div class="circle-icon cursor-pointer margin-container fixed-left-bottom hover-solid" id="exit-full-screen">' +
                '<div class="delete-ud" href="#" title="Delete Component">' +
                    '<i class="medium-text icon-minimize"></i>' +
                '</div>' +
            '</div>');
}