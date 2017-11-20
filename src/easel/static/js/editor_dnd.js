'use strict';

$(function() {

    var initializedLibraryUpload = false;
    var focusElement;

    $(document).on('click', '.delete-ud', function() {
        var ud_to_close = $(this).closest('.ud');
        ud_to_close.remove();
    });
    $(document).on('click', '.ud', function() {
        if (focusElement) {
            focusElement.find('.delete-ud-wrapper').remove();
        }
        $( this ).append(
            '<div class="right-top circle-icon delete-ud-wrapper cursor-pointer">' +
                '<div class="delete-ud" href="#" title="Delete Component">' +
                    '<i class="medium-text icon-garbage"></i>' +
                '</div>' +
            '</div>'
        );
        focusElement = $( this );
    });

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
        drop: function(event, ui) {
            var cmp = ui.draggable.prop('id');
            var active_id_name = getActivePageTabContentId();
            var activeId = $(active_id_name).find('.editable').first();
            if (cmp === "img-cmp") {
                open_img_selection();
            }
            else if (cmp === 'textbox-cmp') {
                activeId.prepend(
                    '<div class="editable header-text ud">Lorem Ipsom some text ksdfbgljfa.</div>'
                );
                var editor = new MediumEditor('.editable');
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
            console.log('you dropped ' + ui.draggable.prop('id') +' into the page preview!');
        }
    });

    // get the active page tab content
    function getActivePageTabContentId() {
        return $( '.cr-tabs>li.active' ).attr('tab-target');
    }

    // open image selection modal
    function open_img_selection() {
        if (!initializedLibraryUpload) {
            initializeLibraryUploadForm();
            initializedLibraryUpload = true;
        }
        $('#select-img-modal').modal('open');
    }

    // initialize tab which allows user to upload through library
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
});
