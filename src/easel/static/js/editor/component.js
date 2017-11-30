/*
 * component.js - initialization and interaction of drag-drop components
 */


// handler after components are dropped onto page
function componentDropHandler(event, ui) {
	const $item = $(ui.item);
	if (!$item.hasClass('drag-component')) {
		// if it is not dragged from the side; do nothing
		return;
	}

	// remove leftover #just-dropped-down element, which could have spawned
	// from creating component with modal
	let cnt = 0;
	while ($("#just-dropped-down").length != 0) {
		$div = $("#just-dropped-down");
		$div.removeAttr('id');
		if ($div.html() == "") {
			$div.remove();
		}
		cnt++; // avoid infinite loop for some reason. should always run only 1 time.
		if (cnt > 5) {
			console.error('Fatal error: infinite loop in removing just-dropped-down!')
			break;
		}
	}

	var cmp = $item.attr('id');
	$item.empty();
	$item.removeAttr("style");
	$item.removeAttr("class");
	$item.off();
	$item.addClass('ud');
	$item.attr("id", "just-dropped-down"); // TODO drop to this element & remove later
    if (cmp === "img-cmp") {
        open_img_selection();
    }
    else if (cmp === 'textbox-cmp') {
		$item.append($('<div class="editable">'+
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Dictum at tempor commodo ullamcorper. Ac turpis egestas maecenas pharetra convallis posuere morbi. Neque viverra justo nec ultrices. Commodo odio aenean sed adipiscing diam donec. Habitant morbi tristique senectus et netus et malesuada fames ac. Iaculis nunc sed augue lacus viverra. Cras sed felis eget velit aliquet sagittis id consectetur. Nunc scelerisque viverra mauris in aliquam. Vel fringilla est ullamcorper eget nulla facilisi etiam dignissim.'+
					  '</div>'));
        editor = new MediumEditor('.editable', editable_settings);
    }
    else if (cmp === 'rule-cmp') {
        $item.append('<div class="ud"><br><hr><br></div>');
    }
    else if (cmp === 'space-cmp') {
        $item.append('<div class="ud space"></div>');
    }
    else if (cmp === 'quote-cmp') {
        $item.append(
            '<blockquote class="ud">' +
                '<span class="editable ud">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eget leo nunc, nec tempus mi? Curabitur id nisl mi, ut vulputate urna. Quisque porta facilisis tortor, vitae bibendum velit fringilla vitae! Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eget leo nunc, nec tempus mi? Curabitur id nisl mi, ut vulputate urna. Quisque porta facilisis tortor, vitae bibendum velit fringilla vitae!</span>' +
                '<cite class="editable ud">Somebody famous</cite>' +
            '</blockquote>'
        );
        initializeEditable();
    }
    else if (cmp === 'embed-cmp') {
        resetGeneralModal();
        $('#add-general-input').click(addTargetEmbed);
        $('#general-modal .modal-header').text('ADD EMBED HTML CONTENT');
        $('#general-modal').modal('open');
    }
	// TODO add row back again?
    else if (cmp === 'row-cmp') {
        $item.append(
            '<div class="row">' +
            	'<div class="col s4">' +
            		'<div class="editable ud">This a column. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor</div>' +
            	'</div>' +
            	'<div class="col s4">' +
            		'<div class="editable ud">This a column. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor</div>' +
            	'</div>' +
            	'<div class="col s4">' +
            		'<div class="editable ud">This a column. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor</div>' +
            	'</div>' +
            '</div>'
        );
        initializeEditable();
    }
    console.log('you dropped ' + cmp +' into the page preview!');
}

function removeUnusedCmpPlaceholder(el) {
    if (el.attr('added') === 'false') {
        el.remove();
    }
    else {
        el.removeAttr('id');
    }
}

function resetGeneralModal() {
    /* clean up embed component form */
    $('#add-general-input').unbind('click', addTargetEmbed);
    removeUnusedCmpPlaceholder($('#embed-target'));
}

function addTargetEmbed(e) {
    e.preventDefault;
	var html = $('#general-input-field').val();
	$('#just-dropped-down').append(html);
    $('#general-modal').modal('close');
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
    var $item = $('#just-dropped-down');
    console.log('creating component ' + '<img src="' + url + '"> in ' + $item);
    $item.append(
        '<img class="ud" src="' + url + '">'
    );
    $('#select-img-modal').modal('close');
    resetImgForm();
}

/* --------------------------- allow deletion of element */

// add trashcan button to focus element
function addTrashcanButton(el) {
	const radius = 70;
    const left = el.position()['left'] + el.width() - radius;
    const top = $('#page-content').scrollTop() + el.position()['top']
                + el.height() - radius;

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
    el.append(trashCan);
    trashCan.fadeIn('fast', 'swing');
    focusElement = el;
}

function deleteTrashcanButton(el) {
    const trashCan = el.find('.delete-ud-wrapper');
    trashCan.fadeOut('fast', 'swing', function() {
        trashCan.remove();
    });
}


/* --------------------------- styler */
function drag_start(e) {
    var style = window.getComputedStyle(e.target, null);
    e.dataTransfer.setData("text/plain", (parseInt(style.getPropertyValue("left"), 10) - e.clientX) + ',' + (parseInt(style.getPropertyValue("top"), 10) - e.clientY) + ',' + e.target.getAttribute('data-item'));
}

function drag_over(e) {
    e.preventDefault();
    return false;
}

function drop(e) {
    var offset = e.dataTransfer.getData("text/plain").split(',');
    var dm = document.getElementsByClassName('dragme');
    dm[parseInt(offset[2])].style.left = (e.clientX + parseInt(offset[0], 10)) + 'px';
    dm[parseInt(offset[2])].style.top = (e.clientY + parseInt(offset[1], 10)) + 'px';
    e.preventDefault();
    return false;
}

function focusudHandler() {
    var oldEl, newEl;
    newEl = $( this );
    oldEl = $( '#ud-focus' );
    if (newEl.attr('id') == 'ud-focus') {
        return;
    }
    deleteTrashcanButton($('#ud-focus'));
    oldEl.removeAttr('id');
    newEl.attr('id', 'ud-focus');
    addTrashcanButton(newEl);

    /* initialize styler */
    updateStylerAttr(newEl);
}

function getFocusElement() {
    return $('#ud-focus');
}

// if user clicked else where, remove focus element
function deselectFocusElement(e) {
    if (!$(e.target).parents("#ud-focus").length > 0) {
        var el = getFocusElement();
        deleteTrashcanButton(el);
        el.removeAttr('id');
    }
}

function updateStylerAttr(el) {
    var attrName, attrVal;
    var attr = ['margin-left', 'margin-right', 'margin-top', 'margin-bottom',
                'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
                'color', 'background-color', 'font-family', 'letter-spacing', 'width',
                'height', 'border-style', 'border-color', 'border-width'];
    for (var i = 0; i < attr.length; i++) {
        attrName = attr[i];
        attrVal = el.css(attrName);
        $('input[name=' + attrName +']').val(attrVal);
    }
}

var hexDigits = "0123456789abcdef".split('');

//Function to convert rgb color to hex format
function rgb2hex(rgb) {
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 try {
    return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
 }
 catch (e) {
    return '000';
 }
}

function hex(x) {
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
 }

function initializeEditNavModal() {
    /* clone current nav bar */
    var nav = $('nav').first().clone();
    var el = $('#nav-preview').empty().append(nav);

    /* update nav content to show in editor */
    updateButtonList();

    /* updated style selection menu */
    var brand_logo = nav.find('.brand-logo').text();
    var bg_color = rgb2hex(nav.css('background-color'));
    var color = rgb2hex(nav.css('color'));
    var opacity = nav.css('opacity');

    $('#nav-customize input[name=brand-logo]').val(brand_logo);
    $('#nav-customize input[name=background-color]').val(bg_color);
    $('#nav-customize input[name=color]').val(color);
    $('#nav-customize input[name=opacity]').val(opacity);

    /* initialize modal */
    $('#nav-modal').modal({
        ready: function() {
            /* initialize tabs */
            $('#nav-control ul.tabs').tabs('select_tab', 'content');
        }
    });
    $('#nav-modal').modal('open');
}

function getButtonWithId(i, text, href) {
    return ('<li>' +
                '<div class="row">' +
                    '<div class="col s3">' +
                        '<input target="#btn' + i + '" type="text" name="btn-name" class="nav-opt" value="' + text + '"/>' +
                    '</div>' +
                    '<div class="col s8">' +
                        '<input target="#btn' + i + '" type="text" name="btn-url" class="nav-opt page-autocomplete" value="' + href + '"/>' +
                    '</div>' +
                    '<div class="col s1">' +
                        '<a target="#btn' + i + '" class="delete-nav-button" href="#"><i class="icon-close"></i></a>' +
                    '</div>' +
                '</div>' +
            '</li>'
    );
}

function updateButtonList() {
    var btn, count, el, a, i;
    el = $('#nav-preview nav');
    btn = el.find('#nav-mobile li');
    count = btn.length;
    $('#button-list').empty();
    i = 0;
    btn.each(function() {
        $(this).attr('id', 'btn' + i);
        a = $(this).find('a');
        $('#button-list').append(getButtonWithId(i, a.text(), a.attr('href')));
        i++;
    });
    initializePagesAutoComplete();
}

function deleteButtonHandler(e) {
    e.preventDefault();
    var target = $(this).attr('target');
    $(target).remove();
    $(this).closest('.row').remove();
}

function navEditChangeHandler(e) {
    var attrName, attrVal, el, count, diff, input, btn, target;
    console.log("change nav" , $( this ).attr('name'), $(this).val());
    el = $('#nav-preview nav');
    attrName = $( this ).attr('name');
    attrVal = $(this).val();
    if (attrName === 'brand-logo') {
        el.find('.brand-logo').html(attrVal);
    }
    else if (attrName === 'color') {
        el.css('color', '#' + attrVal);
        el.find('a').css('color', '#' + attrVal);
        el.find('.brand-logo').css('color', '#' + attrVal);
    }
    else if (attrName === 'background-color') {
        el.css('background-color', '#' + attrVal);
    }
    else if (attrName === 'opacity') {
        el.css('opacity', attrVal);
    }
    else if (attrName === 'logo-font-family') {
        el.find('.brand-logo').css('font-family', attrVal);
    }
    else if (attrName === 'a-font-family') {
        el.find('li a').css('font-family', attrVal);
    }
    else if (attrName == "btn-name") {
        target = $(this).attr('target');
        $(target + " a").text(attrVal);
    }
    else if (attrName == "btn-url") {
        target = $(this).attr('target');
        $(target + " a").attr('href', attrVal);
    }
    if (el.length) {
        el.css(attrName, attrVal);
    }
}

function initializePagesAutoComplete() {
    var settings = getPagesSetting();
    $('.page-autocomplete').autocomplete({
        data: settings,
        limit: 20,
        onAutocomplete: function(val) {
            var username = getCurrUsername();
            var site = getCurrSiteName();
            var targetPage = $(this).val();
            var url = "/easel/public/" + username + "/" + site + "/" + val;
            $(this).text(url);
        },
        minLength: 0,
    });
}

function addNavButton() {
    var btn, count, el, a, i;
    btn = $('#nav-preview #nav-mobile li');
    i = btn.length;
    $('#button-list').append(getButtonWithId(i, 'NEW', '#'));
    $('#nav-preview #nav-mobile').append('<li id="btn'+ i +'"><a href="#">NEW</a></li>');
}
