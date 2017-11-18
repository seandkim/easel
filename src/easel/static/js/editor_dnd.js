'use strict';

$(function() {

    $('.drag-component').draggable({
        scroll: false,
        distance: 0,
        zIndex: 1000000,
        revert : false,
        cursorAt: { left: 50, top: 50 },
        helper: 'clone',
        appendTo: "body"
    });
    $('#page-content').draggable();

    $(".drag-component").draggable({
        connectToSortable: "#page-content",
        helper: "clone",
        revert: "invalid"
    });

    $("#page-content").droppable({
        accept: ".drag-component",
        drop: function(event, ui) {
            console.log('you dropped haha!');
        }
    });

    // TODO: currently hard coded, need to replace with real example
    $("#sortable1").sortable({
        connectWith: '#sortable2, #component-tab'
    });
    $("#sortable2").sortable({

    });
});