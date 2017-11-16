$(document).ready(function() {
  // Periodically refresh stream page
  // CSRF set-up copied from Django docs
  // from code provided during class
  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) == (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  var csrftoken = getCookie('csrftoken');
  $.ajaxSetup({
    beforeSend: function(xhr, settings) {
      xhr.setRequestHeader("X-CSRFToken", csrftoken);
    }
  });

  loadMedias()

  function loadMedias() {
    projects = $('.project')
    for (var i=0; i<projects.length; i++) {
      project = projects[i]

      $.get("/easel/getMedia/" + project.getAttribute('id')).done(function(data) {
        console.log(data)
        media = data.media
        projectID = data.projectID

        row = $('.project#'+projectID).find('.row')

        for (var i=0; i<media.length; i++) {
          var medium = media[i]

          img_path = '/easel/getPhoto/media/' + medium.id
          row.append('<div class="col m6"> \
                          <div class="asset"> \
                            <img class="img-editor" src=' + img_path + '> \
                            <div class="asset-description">' + medium.name + '</div> \
                          </div> \
                        </div> ')
        }
      })
    }

    // '''<div class="col m6">
    //   <div class="asset">
    //     <img class="img-editor" src="{% url \'getPhoto\' \'media\' media.id %}">
    //     <div class="asset-description">{{media.name}}</div>
    //   </div>
    // </div>'''
  }
});
