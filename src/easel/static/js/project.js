// stored structure of loaded media
var media_tree = {};
// delete project form
function initializeDeleteButton($button, projectName) {
    $button.click(function() {
        $deleteBtn = $("#delete-project-modal button:not(.modal-close)");
        $deleteBtn.off(); // removes all event handlers

        $deleteBtn.click(function() {
            $.ajax({
                url: "/easel/projects/deleteProject/",
                method: "POST",
                data: {projectName: projectName},
                success: function(data) {
                  $("li a[href='#" + projectName + "']").parent().remove();
                  $("div#"+projectName).remove();
                  $('ul.tabs').tabs('select_tab', 'ungrouped');
                  $('.modal').modal('close');
                },
                error: function(jqXHR, textStatus) {
                    console.log('error');
                  // display error message
                }
            });
        });
    });
}

function loadAllProject() {
    // load projects
    $.get("/easel/projects/getAllProjects/").done(function(data) {
        $('#project-tab').empty();
        var projects = data.projects;
        if (projects.length == 0) {
            $('#project-tab').append('<div class="header-text medium-text">No projects currently. Try adding new project?</div>');
        }
        for (var i = 0; i < projects.length; i++) {
            var project = projects[i];
            const isSelected = (i == 0) ? true : false;
            loadProject(project, isSelected);
        }
    });
}

// helper function that loads one project
function loadProject(project, isSelected) {
    media_tree[project.name] = [];
    var li = $('<li class="tab col s3"></li>');
    var a = $('<a></a>').attr('href', '#' + project.name).html(project.name);
    li.append(a);
    $('#project-tab').append(li);
    loadMedia(project.name, project.description, isSelected);
}

// helper function that loads all the media within one project
function loadMedia(projectName, description, isSelected) {
    var path = "/easel/projects/" + projectName + '/getAllMedias/';
    var project_list = media_tree[projectName];
    $.get(path).done(function(data) {
        /* create project description bar */
        var detail_bar = $("<div></div>").addClass("project-detail-bar").addClass("col").addClass("s12");
        detail_bar.append($('<span class="description"><strong>Description: </strong>' + description + '</span>'));
        detail_bar.append($('<br>'));
        detail_bar.append($('<a href="/easel/projects/' + projectName + '/addMedia"><button class="dark-btn-alt"><i class="material-icons tab-icon">file_upload</i> UPLOAD</button></a>'));
        if (projectName != "ungrouped") {
            detail_bar.append($('<a class="delete-project modal-trigger" href="#delete-project-modal" projectName="' + projectName + '">' +
                '<button class="dark-btn-alt">' +
                '<i class="material-icons tab-icon">delete</i>' +
                'DELETE' +
                '</button>' +
                '</a>'));
        }
        if (projectName != "ungrouped") {
            detail_bar.append($('<a class="edit-project-icon" href="#" projectName="' + projectName + '">' +
                '<button class="dark-btn-alt edit-project-icon">' +
                '<i class="material-icons tab-icon">edit</i>' +
                'EDIT' +
                '</button>' +
                '</a>'));
        }
        
        // delete project button
        initializeDeleteButton(detail_bar.find('button'), projectName);

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
            var imgPath = "/easel/projects/" + projectName + "/getMediaPhoto/" + media.name;
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
            project_list.push({ path: imgPath, name: media.name, caption: media.caption });
        }
        if (isSelected) {
            $('ul.tabs').tabs('select_tab', projectName);
        }
    }).fail(function() {
        // TODO display fail message
    })
}

$(document).ready(function() {
    // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();
    loadAllProject();
    setupAjax();
    
    // add project form
//    $("#add-project-modal").on('click', 'button', function(e) {
//        e.preventDefault();
//        const fieldNames = ['projectName', 'description', 'username'];
//        const values = getFormValues($(this).closest('form'), fieldNames);
//
//        function successHandler(data) {
//            loadProject(data['projects'][0], true);
//        }
//
//    modalSubmitHandler('add-project-modal', '/easel/projects/addProject/',
//                       'POST', values, successHandler);
//    });
});
