'use strict';

$(function() {

  /* drag start handler */
  function handleDragStart(e) {
    $( this ).css('opacity', '0.4');
  }

  function handleDragOver(e) {
    $( this ).css('opacity', '0.4');
  }

  function handleDragEnter(e) {
    $( this ).css('opacity', '0.4');
  }

  function handleDragLeave(e) {
    $( this ).css('opacity', '0.4');
  }

  $( '.drag-component' ).on('dragstart', handleDragStart);
  //$( '.drag-component' ).on('dragover', handleDragOver);
  //$( '.drag-component' ).on('dragenter', handleDragEnter);
  //$( '.drag-component' ).on('dragleave', handleDragLeave);

  // TODO: currently hard coded, need to replace with real example
  $( "#sortable1" ).sortable({
    connectWith: '#sortable2, #component-tab'
  });
  $( "#sortable2" ).sortable({

  });
});
