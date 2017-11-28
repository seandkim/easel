$(document).ready(function() {
  // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
  $('.modal').modal();

  function getFormValues(formElem, fieldNames) {
    var values = {};
    for (var i=0; i<fieldNames.length; i++) {
      var field = fieldNames[i];
      var inputElem = formElem.find('input[name="'+ field +'"]');
      var value = inputElem.val();
      if (value == "") {
        // TODO very hacky. Is there a way to avoid double username field?
        value = $(inputElem[1]).attr('value');
      }
      values[field] = value;
    }
    return values;
  }

  // add site form
  $("#add-site-modal").on('click', 'button', function(e) {
    debugger;
    e.preventDefault();
    const fieldNames = ['siteName', 'description', 'username'];
    const values = getFormValues($(this).closest('add-site-form'), fieldNames);
    console.log('im here')
    console.log('values = ', values)
    $.ajax({
        url: "/easel/sites/addSite/",
        method: "POST",
        data: values,
        success: function(data) {
            console.log('what')
            $('.modal').modal('close');
        },
        error: function(jqXHR, textStatus) {
            // TODO server error failure;
            // remove existing error message
            $('#add-site-modal ul.errorlist').parent().parent().remove()

            const data = jqXHR.responseJSON; // array of error messages
            console.error("failed to add the site", data);
            const error_list = $('<tr><td colspan="2"><ul class="errorlist nonfield"></ul></td></tr>');
            for (let i=0; i<data['errors'].length; i++) {
              const error = data['errors'][i];
              error_list.find("ul").append("<li>"+ error +"</li>");
            }
            $('#add-site-modal tbody').prepend(error_list);
        }
    });
  });
});
