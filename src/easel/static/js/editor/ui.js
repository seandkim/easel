
/* 
 * ui.js - handling page interactions 
 */

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
    $(".sortable").sortable({ disabled: true });
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
    $(".sortable").sortable({ disabled: true });
    if (mode == "editable") {
        $(".sortable").sortable("option", "disabled", true);
    } else if (mode == "sortable") {
        $(".sortable").sortable("option", "disabled", false);
    } else {
        console.error("Unrecognizable error mode", mode);
    }
}