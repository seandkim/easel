'use strict';

$(function() {

    var initializedLibraryUpload = false;

    $('.drag-component').draggable({
        scroll: false,
        distance: 0,
        zIndex: 1000000,
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
        drop: function(event, ui) {
            var cmp = ui.draggable.prop('id');
            var activeId = getActivePageTabContentId();
            if (cmp === "img-cmp") {
                open_img_selection();
            }
            else if (cmp === 'textbox-cmp') {
                $(activeId).prepend(
                    '<div class="editable header-text ud">Lorem Ipsom some text ksdfbgljfa.</div>'
                );
                var editor = new MediumEditor('.editable');
            }
            else if (cmp === 'rule-cmp') {
                $(activeId).prepend(
                    '<br><hr class="ud"><br>'
                );
            }
            else if (cmp === 'space-cmp') {
                $(activeId).prepend(
                    '<div class="ud space"></div>'
                );
            }
            else if (cmp === 'quote-cmp') {
                $(activeId).prepend(
                    '<quoteblock class="ud">Some code block.</quoteblock>'
                );
            }
            else if (cmp === 'embed-cmp') {
                $('#general-modal').modal('open');
                $(activeId).prepend(
                    '<quoteblock class="ud">Some code block.</quoteblock>'
                );
            }
            else if (cmp === 'video-cmp') {
                $(activeId).prepend(
                    '<quoteblock class="ud">Some code block.</quoteblock>'
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
        var media_library;
        // media_library = $('.project-list').clone();
        // $('#media-library-upload').empty();
        if (!initializedLibraryUpload) {
            initializeLibraryUploadForm();
            initializedLibraryUpload = true;
        }
        // $('ul.tabs').tabs();
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

    // TODO: currently hard coded, need to replace with real example
    $("#sortable1").sortable({
        connectWith: '#sortable2, #component-tab'
    });
    $("#sortable2").sortable({});
});
