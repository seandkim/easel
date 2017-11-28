$(document).ready(function() {
  // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
  $('.modal').modal();

  // add site form
  $("#add-site-modal").on('click', 'button', function(e) {
    e.preventDefault();
    const fieldNames = ['siteName', 'description'];
    const values = getFormValues($(this).closest('form'), fieldNames);

    function successHandler(data) {
        window.location.href = '/easel/sites/'+ values['siteName'] +'/editor/';
    }

    modalSubmitHandler('add-site-modal', "/easel/sites/addSite/", 'POST',
                       values, successHandler);
  });
});
