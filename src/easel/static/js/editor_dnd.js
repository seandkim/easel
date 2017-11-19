'use strict';

$(function() {

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
            console.log('active page is ' + activeId);
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

    function getActivePageTabContentId() {
        return $( '.cr-tabs>li.active' ).attr('tab-target');
    }

    function open_img_selection() {
        console.log('in img selection');
        var media_library;
        media_library = $('.project-list').clone();
        $('#cloned-medias').html("");
        //console.log('html: ' + $('#media-library-upload').html());
        $('#cloned-medias').append(media_library);
        $('ul.tabs').tabs();
        $('#select-img-modal').modal('open');
    }

    // TODO: currently hard coded, need to replace with real example
    $("#sortable1").sortable({
        connectWith: '#sortable2, #component-tab'
    });
    $("#sortable2").sortable({});
});