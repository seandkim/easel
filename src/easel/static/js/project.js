// stored structure of loaded media
var media_tree = {};

$(document).ready(function() {
  // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
  $('.modal').modal();

  // TODO make ajax form use this function
  // takes in jquery element and returns a dictionary based on fieldNames
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

  $("#add-project-modal").on('click', 'button', function(e) {
    e.preventDefault();
    const fieldNames = ['projectName', 'description', 'username'];
    const values = getFormValues($(this).closest('form'), fieldNames);

    $.ajax({
        url: "/easel/projects/addProject/",
        method: "POST",
        data: values,
        success: function(data) {
            console.log("successfully added the project");
        },
        error: function(jqXHR, textStatus) {
            console.error("failed to add the project", textStatus);
        }
    });
  });

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
      $.get("/easel/projects/getAllProjects/").done(function(data) {
          //console.log(data);
          var projects = data.projects;
          var project_list = $('#project-tab');

          if (projects.length == 0) {
              project_list.append('<div class="header-text medium-text">No projects currently. Try adding new project?</div>');
          }
          for (var i = 0; i < projects.length; i++) {
              var project = projects[i];
              media_tree[project.name] = [];
              var li = $('<li class="tab col s3"></li>');
              var a = $('<a></a>').attr('href', '#' + project.name).html(project.name);
              if (i == 0) {
                  li.addClass('active');
              }
              li.append(a);
              project_list.append(li);

              //console.log(project.description);
              loadMedia(project.name, project.description, i);
          }
      });
  }

  function loadMedia(projectName, description) {
      var path = "/easel/projects/"+projectName+'/getAllMedias/';
      var project_list = media_tree[projectName];
      $.get(path).done(function(data) {
          /* create project description bar */
          var detail_bar = $("<div></div>").addClass("project-detail-bar").addClass("col").addClass("s12");
          detail_bar.append($('<span class="description"><strong>Description: </strong>' + description + '</span>'));
          detail_bar.append($('<br>'));
          detail_bar.append($('<a href="/easel/projects/' + projectName + '/addMedia"><button class="dark-btn-alt"><i class="material-icons tab-icon">file_upload</i> UPLOAD</button></a>'));
          detail_bar.append($('<a class="delete-project modal-trigger" href="#delete-project-modal" projectName="' + projectName + '">' +
              '<button class="dark-btn-alt">' +
                '<i class="material-icons tab-icon">delete</i>' +
                'DELETE' +
              '</button>' +
            '</a>'));

          $(document).on('click', '.delete-project.modal-trigger', function() {
              var deletename = $(this).attr('projectname')
              $('#delete-submit').attr('href', deletename + '/deleteProject/');
          });

          /* create media div */
          var medias_div = $("<div></div>").addClass("media-list").addClass("col").addClass("s12");
          medias_div.addClass("media-list").attr("id", projectName);
          medias_div.append(detail_bar);
          medias_div.append($('<div class="row item-list"></div>'));
          medias_div.attr('style', "display: none;");
          $('.project-list > .row').append(medias_div);

          var medias = data.medias;
          var medias_list = $('.media-list#' + projectName + ' > .row');

          for (var i = 0; i < medias.length; i++) {
              var media = medias[i];

              var a = $('<a></a>').attr('href', '/easel/projects/' + projectName + '/editMedia/' + media.name);
              var col = $('<div class="col m4"></div>');
              var card = $('<div class="project-card"></div>');

              var img_container = $('<div class="project-img-container"></div>');
              var imgPath = "/easel/projects/"+projectName+"/getMediaPhoto/"+media.name;
              var img = $('<img>').attr("src", imgPath);
              img_container.append(img);

              var name = $('<div class="project-title"></div>').html(media.name);
              var description_div = $('<div class="project-description"></div>').html(media.caption);
              a.append(card);
              card.append(img_container);
              card.append(name);
              card.append(description_div);
              col.append(a);
              medias_list.append(col);
              project_list.push({path: imgPath, name: media.name, caption: media.caption});
          }

          if (i == 0) {
              $('ul.tabs').tabs('select_tab', projectName);
          }
      }).fail(function() {
          // TODO display fail message
      })
  }
  });
