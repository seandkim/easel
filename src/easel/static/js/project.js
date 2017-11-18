$(document).ready(function() {

    // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
  $('.modal').modal();

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

  loadProject();

  function loadProject() {
      $.get("/easel/getProjects/").done(function(data) {
          //console.log(data);
          var projects = data.projects;
          var project_list = $('#project-tab');

          if (projects.length == 0) {
              project_list.append('<div class="header-text medium-text">No projects currently. Try adding new project?</div>');
          }
          for (var i = 0; i < projects.length; i++) {
              var project = projects[i];

              var li = $('<li class="tab col s3"></li>');
              var a = $('<a></a>').attr('href', '#' + project.id).html(project.name);
              if (i == 0) {
                  li.addClass('active');
              }
              li.append(a);
              project_list.append(li);

              //console.log(project.description);
              loadMedia(project.id, project.description);
          }
      })
  }

  function loadMedia(projectID, description) {
      //console.log(description);

      $.get("/easel/getMedia/" + projectID).done(function(data) {
          /* create project description bar */
          var detail_bar = $("<div></div>").addClass("project-detail-bar").addClass("col").addClass("s12");
          detail_bar.append($('<span class="description"><strong>Description: </strong>' + description + '</span>'));
          detail_bar.append($('<br>'));
          detail_bar.append($('<a href="/easel/projects/' + projectID + '/addMedia"><button class="dark-btn-alt"><i class="material-icons tab-icon">file_upload</i> UPLOAD</button></a>'));

          detail_bar.append($('<a class="modal-trigger" href="#delete-project-modal" projectid="' + projectID + '">' +
                '<button class="dark-btn-alt">' +
                  '<i class="material-icons tab-icon">delete</i>' +
                  'DELETE' +
                '</button>' +
              '</a>'));

          $(document).on('click', '.modal-trigger', function() {
              var projectID = $(this).attr('projectid');
              //console.log(projectID + ' is clicked');
              $('#delete-submit').attr('href', projectID + '/delete/');
          });


          /* create media div */
          var media_div = $("<div></div>").addClass("media-list").addClass("col").addClass("s12");
          media_div.addClass("media-list").attr("id", projectID);
          media_div.append(detail_bar);
          media_div.append($('<div class="row item-list"></div>'));
          media_div.attr('style', "display: none;");
          $('.project-list > .row').append(media_div);

          var media = data.media;
          var media_list = $('.media-list#' + projectID + ' > .row');

          for (var i = 0; i < media.length; i++) {
              var medium = media[i];

              var a = $('<a></a>').attr('href', '/easel/projects/' + projectID + '/editMedia/' + medium.id);
              var col = $('<div class="col m4"></div>');
              var card = $('<div class="project-card"></div>');

              var img_container = $('<div class="project-img-container"></div>');
              var img = $('<img>').attr("src", "/easel/getPhoto/media/" + medium.id + '/');
              img_container.append(img);

              var name = $('<div class="project-title"></div>').html(medium.name);
              var description_div = $('<div class="project-description"></div>').html(medium.caption);
              a.append(card);
              card.append(img_container);
              card.append(name);
              card.append(description_div);
              col.append(a);
              media_list.append(col);
          }
      })
  }
  });