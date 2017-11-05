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

  loadProject()

  function loadProject() {
    $.get("/easel/getProjects/").done(function(data) {
      console.log(data);
      var projects = data.projects
      var project_list = $('ul.tabs.header-text')

      for (var i=0; i<projects.length; i++) {
        var project = projects[i]

        var li = $('<li class="tab col s3"></li>')
        var a = $('<a></a>').attr('href', '#'+project.id).html(project.name)
        if (i==0) {
          // a.addClass('active') TODO
        }
        li.append(a)
        project_list.append(li)

        loadMedia(project.id)
      }
    })
  }

  function loadMedia(projectID) {
    $.get("/easel/getMedia/" + projectID).done(function(data) {
      console.log(data);

      var media_div = $("<div></div>").addClass("media-list").addClass("col").addClass("s12")
      media_div.addClass("media-list").attr("id", projectID)
      media_div.append($('<div class="row item-list"></div>'))
      media_div.attr('style', "display: none;")
      media_div.append($('<a href="/easel/projects/'+projectID+'/addMedia">Add Media</a>'))
      $('.project-list > .row').append(media_div)

      var media = data.media
      var media_list = $('.media-list#'+projectID+' > .row')

      for (var i=0; i<media.length; i++) {
        var medium = media[i]

        var col = $('<div class="col m6"></div>')
        var card = $('<div class="project-card"></div>')

        var img_container = $('<div class="project-img-container"></div>')
        var img = $('<img>').attr("src", "{% static 'img/placeholders/church.png' %}")
        img_container.append(img)

        var name = $('<div class="project-title"></div>').html(medium.name)
        var description = $('<div class="project-description"></div>').html(medium.description)
        card.append(img_container)
        card.append(name)
        card.append(description)
        col.append(card)
        media_list.append(col)
      }
    })
  }
});
