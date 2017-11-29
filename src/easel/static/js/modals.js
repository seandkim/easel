// initializes & helper function for general modals/links
// excludes modal used only in site editor, such as addPageModal, copyPageModal,
// component modals

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

  // for communication between delete button and delete site
  var deleteName;
  $('.delete-button-icon').click(function(e) {
      const deleteName = $(this).closest('div.card').data()['sitename'];
  });

  $('#delete-site-modal').on('click', 'button:not(.cancel)', function(e) {
      e.preventDefault();

      function successHandler(data) {
          const card = $('div.card[data-sitename="'+deleteName+'"]')
          card.closest('.card-wrapper').remove();
          deleteName = null;
          // TODO if no sites are left, display new site form
      }

      modalSubmitHandler('delete-site-modal', '/easel/sites/deleteSite/', 'POST',
                         {siteName: deleteName}, successHandler);
  });

  //TODO @Stella insert edit media form here
  $('.edit-button-icon').click(function(e) {
      const siteName = $(this).closest('div.card').data()['sitename'];

      $.ajax({
        url: '/easel/sites/' + siteName + '/siteInfo/',
        method: 'GET',
        success: function(data) {
            console.log('data=', data);
            //TODO fill in modal fields
            $('#edit-site-modal').data('oldname', siteName);
            $('#edit-site-modal #id_siteName').val(data.siteName);
            $('#edit-site-modal #id_description').val(data.description);
            $('#edit-site-modal').modal('open');
        },
        error: function(jqXHR) {
            console.error("ajax call failed", jqXHR);
        }
    });
  });

    
  $("#edit-site-modal").on('click',  'button:not(.cancel)', function(e) {
    e.preventDefault();
    const fieldNames = ['siteName', 'description'];
    const values = getFormValues($(this).closest('form'), fieldNames);
    const oldName = $('#edit-site-modal').data('oldname');
      
    function successHandler(data) {
        window.location.href = '/easel/sites/';
    }
      
    modalSubmitHandler('edit-site-modal', '/easel/sites/' + oldName + '/siteInfo/', 'POST',
                       {siteName: values.siteName, description: values.description, oldName: oldName}, successHandler);
  });

});