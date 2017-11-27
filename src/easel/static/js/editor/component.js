/*
 * component.js - initialization and interaction of drag-drop components
 */


// handler after components are dropped onto page
function componentDropHandler(event, ui) {
	var cmp = ui.draggable.prop('id');
    var active_id_name = '#' + getActivePageName();
    var activeId = $(active_id_name).find('.editable').first();
    if (cmp === "img-cmp") {
        open_img_selection();
    }
    else if (cmp === 'textbox-cmp') {
        activeId.prepend(
            '<div class="editable header-text ud">Lorem Ipsom some text ksdfbgljfa.</div>'
        );
        editor = new MediumEditor('.editable', editable_settings);
    }
    else if (cmp === 'rule-cmp') {
        activeId.prepend(
            '<div class="ud"><br><hr><br></div>'
        );
    }
    else if (cmp === 'space-cmp') {
        activeId.prepend(
            '<div class="ud space"></div>'
        );
    }
    else if (cmp === 'quote-cmp') {
        activeId.prepend(
            '<div class="ud"><quoteblock class="ud">Some code block.</quoteblock></div>'
        );
    }
    else if (cmp === 'embed-cmp') {
        $('#general-modal').modal('open');
        activeId.prepend(
            '<div class="ud"><quoteblock class="ud">Some embed text</quoteblock></div>'
        );
    }
    else if (cmp === 'video-cmp') {
        activeId.prepend(
            '<div class="ud"><<video class="ud">Some code block.</video></div>'
        );
    }
    else if (cmp === 'row-cmp') {
        activeId.prepend(
            '<div class="row selector">' +
            	'<div class="col s3">' +
            		'<div class="editable ud">This is a column</div>' +
            	'</div>' +
            	'<div class="col s3">' +
            		'<div class="editable ud">This is a column</div>' +
            	'</div>' +
            	'<div class="col s3">' +
            		'<div class="editable ud">This is a column</div>' +
            	'</div>' +
            '</div>'
        );
        $( ".selector" ).sortable({
		  appendTo: document.body
		});
    }
    console.log('you dropped ' + ui.draggable.prop('id') +' into the page preview!');
}


/* --------------------- Img Component */
 // img component local upload
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

 // img component upload from library
function initializeLibraryUploadForm() {
    var tab_bar = $('#library-project-tabs');
    var content = $('#library-contents');
    // loop through projects stored in lubrary tree
    for (var project in media_tree) {
        var li = ('<li class="tab col s3">' +
                    '<a href="#' + project + '-lib">' + project + '</a>' +
                    '</li>');
        tab_bar.append(li);
        var tab_content = $('<div id="' + project + '-lib" class="row"></div>');
        if (media_tree.hasOwnProperty(project)) {
            var medias = media_tree[project];
            for (var i = 0; i < medias.length; i++) {
                var media = medias[i];
                var img_url = media['path'];
                var name = media['name'];
                var caption = media['caption'];
                tab_content.append(
                    '<div class="col s4">' +
                        '<a href="#" class="img-to-upload">' +
                            '<img class="block-elmt" src="' + img_url + '">' +
                            '<div class="media-caption">' + name + ": " + caption + "</div>" +
                        '</a>' +
                    '</div>'
                );
            }
        }
        content.append(tab_content);
    }
    tab_bar.tabs();
}

// open image selection modal for library upload
function open_img_selection() {
    if (!initializedLibraryUpload) {
        initializeLibraryUploadForm();
        initializedLibraryUpload = true;
    }
    $('#select-img-modal').modal('open');
}

/* create img component from pasted url */
function addPastedURLimgCmp(e) {
    e.preventDefault();
    var url = $(this).find('input[name="url"]').val();
    createImgComponent(url);
}

/* create img component from media library */
function addSelectedLibraryMedia() {
    var url = $(this).find('img').attr('src');
    createImgComponent(url);
}

/* reset the form for image upload */
function resetImgForm() {
    $('#local-opt, #library-opt, #link-opt').removeClass('selected');
    $('#local-upload, #library-upload, #link-upload').addClass('hidden');
}


/* upload media into ungrouped file */
function uploadMedia(e) {
    e.preventDefault();
    var formData = new FormData($(this)[0]);
    var mediaName = formData.get('name');
    var caption = formData.get('caption');
    var username = $('#page-preview').data()['username'];
    formData.append('username', username);

    $.ajax({
        url: $(this).attr('action'),
        type: $(this).attr('method'),
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        success: function(data) {
            showAlertMsg('successfully uploaded file');
            // TODO harcoded img path
            var url = '/easel/projects/ungrouped/getMediaPhoto/' + mediaName;
            createImgComponent(url);
        },
        error: function(data) {
            // TODO error handling
            console.log('media cannot be uploaded');
        }
    });
    return false;
}

/* create image component to page preview */
function createImgComponent(url) {
    var active_tab = $('.cr-tabs>li.active').attr('tab-target');
    var active_tab_content = $(active_tab).find('.editable').first();
    console.log('creating component ' + '<img src="' + url + '"> in ' + active_tab);
    active_tab_content.prepend(
        '<div class="ud"><img class="ud" src="' + url + '"><div>'
    );
    $('#select-img-modal').modal('close');
    resetImgForm();
}

/* --------------------------- allow deletion of element */

// add trashcan button to focus element
function addTrashcanButton() {
	const radius = 70;
    const left = $(this).position()['left'] + $(this).width() - radius;
    const top = $('#page-content').scrollTop() + $(this).position()['top']
                + $(this).height() - radius;

    const styleStr = 'style="position: absolute; left:' +
                    left + 'px; top:' + top +'px;"';

    const trashCan = $('<div class="delete-ud-wrapper" contenteditable="false">' +
    '<div class="right-top circle-icon cursor-pointer" ' +
        styleStr + '>' +
        '<div class="delete-ud" href="#" title="Delete Component">' +
            '<i class="medium-text icon-garbage"></i>' +
        '</div>' +
    '</div></div>');
    trashCan.hide();
    $(this).append(trashCan);
    trashCan.fadeIn('fast', 'swing');
    focusElement = $( this );
}

function deleteTrashcanButton() {
	if (focusElement) {
        const trashCan = focusElement.find('.delete-ud-wrapper');
        trashCan.fadeOut('fast', 'swing', function() {
            trashCan.remove();
        });
    }
}
