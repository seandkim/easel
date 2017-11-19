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
            open_img_selection();
            console.log('you dropped ' + ui.draggable.prop('id') +' into the page preview!');
        }
    });

    function open_img_selection() {
        console.log('in img selection');
        var media_library;
        media_library = $('.project-list').clone();
        debugger;
        $('#media-library-upload').empty();
        console.log('html: ' + $('#media-library-upload').html());
        $('#media-library-upload').append(media_library);
        $('ul.tabs').tabs();
        $('#select-img-modal').modal('open');
    }

    // TODO: currently hard coded, need to replace with real example
    $("#sortable1").sortable({
        connectWith: '#sortable2, #component-tab'
    });
    $("#sortable2").sortable({});
});
