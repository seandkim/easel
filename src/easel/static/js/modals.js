// initializes & helper function for general modals/links
// excludes modal used only in site editor, such as addPageModal, copyPageModal,
// component modals

$(document).ready(function() {
    // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();

    // initialize publish site form
    $('#publish-site-button').click(function() {
        const pageNames = getAllPageNames();
        $checkboxes = $('#publish-site-modal').find('div.boxes')
        $checkboxes.empty()
        for (let i = 0; i < pageNames.length; i++) {
            const name = pageNames[i];
            const id_name = 'checkbox_' + name;
            var box;
            if (name != 'instruction'){
                box = $('<p>' + '<input type="checkbox" checked="checked" id="' + id_name + '" />' + '<label for="' + id_name + '">' + name + '</label>' + '</p>');
            }
            else{
                box = $('<p>' + '<input type="checkbox" id="' + id_name + '" />' + '<label for="' + id_name + '">' + name + '</label>' + '</p>');
            }
            $checkboxes.prepend(box);

        }
    });

    $('#publish-site-modal').on('click', 'button:not(.modal-close)', function(e) {
        e.preventDefault();
        const pageNames = getAllPageNames();
        const publishes = [];
        // get checked pages
        for (let i = 0; i < pageNames.length; i++) {
            const name = pageNames[i];
            const box = $('input[id="checkbox_' + name + '"]');
            if (box.prop('checked')) {
                publishes.push(name);
            }
        }

        if (publishes.length == 0) {
            $('.modal').modal('close');
            showAlertMsg("No pages were published.");
            return;
        }

        savePages(publishes, function() {
            $.ajax({
                url: "/easel/sites/" + getCurrSiteName() + "/publish/",
                method: "POST",
                data: {
                    pageNames: publishes
                },
                success: function(data) {
                    showAlertMsg("Successfully publish site.");
                    $('.modal').modal('close');
                    $('#open-site-button').trigger('click');
                },
                error: function(jqXHR) {
                    showAlertMsg("Error in publishing.");
                }
            })
        })
    });

    // add site form
    $("#add-site-modal").on('click', 'button', function(e) {
        e.preventDefault();
        const fieldNames = ['siteName', 'description'];
        const values = getFormValues($(this).closest('form'), fieldNames);

        function successHandler(data) {
            window.location.href = '/easel/sites/' + values['siteName'] + '/editor/';
        }

        modalSubmitHandler('add-site-modal', "/easel/sites/addSite/", 'POST', values, successHandler);
    });

    // delete site form
    $('.delete-button-icon').click(function(e) {
        const deleteName = $(this).closest('div.card').data()['sitename'];
        $('#delete-site-modal').data('deleteName', deleteName);
        debugger;
    });

    $('#delete-site-modal').on('click', 'button:not(.cancel)', function(e) {
        e.preventDefault();
        const deleteName = $('#delete-site-modal').data('deleteName');

        function successHandler(data) {
            const card = $('div.card[data-sitename="' + deleteName + '"]')
            card.closest('.card-wrapper').remove();
        }

        modalSubmitHandler('delete-site-modal', '/easel/sites/deleteSite/', 'POST', {
            siteName: deleteName
        }, successHandler);
    });

    // edit site form
    $('.edit-button-icon').click(function(e) {
        const siteName = $(this).closest('div.card').data()['sitename'];

        $.ajax({
            url: '/easel/sites/' + siteName + '/siteInfo/',
            method: 'GET',
            success: function(data) {
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

    $("#edit-site-modal").on('click', 'button:not(.cancel)', function(e) {
        e.preventDefault();
        const fieldNames = ['siteName', 'description'];
        const values = getFormValues($(this).closest('form'), fieldNames);
        const oldName = $('#edit-site-modal').data('oldname');

        function successHandler(data) {
            window.location.href = '/easel/sites/';
        }

        modalSubmitHandler('edit-site-modal', '/easel/sites/' + oldName + '/siteInfo/', 'POST', {
            siteName: values.siteName,
            description: values.description,
            oldName: oldName
        }, successHandler);
    });

    // add project form
    $("#add-project-modal").on('click', 'button', function(e) {
        e.preventDefault();
        const fieldNames = ['projectName', 'description', 'username'];
        const values = getFormValues($(this).closest('form'), fieldNames);

        function successHandler(data) {
            loadProject(data['projects'][0], true);
        }

    modalSubmitHandler('add-project-modal', '/easel/projects/addProject/',
                       'POST', values, successHandler);
    });

    $("#edit-project-modal").on('click', 'button:not(.cancel)', function(e) {
        e.preventDefault();
        const fieldNames = ['projectName', 'description'];
        const values = getFormValues($(this).closest('form'), fieldNames);
        const oldName = $('#edit-project-modal').data('oldname');

        function successHandler(data) {
            window.location.href = '/easel/projects/';
        }

        modalSubmitHandler('edit-project-modal', '/easel/projects/' + oldName + '/projectInfo/', 'POST', {
            projectName: values.projectName,
            description: values.description,
            oldName: oldName
        }, successHandler);
    });

    // nav modal TODO where is the nav modal open event? should move to here
    $('#nav-modal').on('click', 'button:not(.cancel)', function(e) {
        const url = '/easel/sites/'+getCurrSiteName()+'/updateNav/';
        const nav_html = $('#nav-modal #nav-preview').html();

        function reloadAllPages() {
            for (let name in pagesInfo) {
                if (pagesInfo[name]['opened']) {
                    loadPageHTML(getCurrSiteName(), name, null);
                }
            }
        }

        modalSubmitHandler('nav-modal', url, 'POST', {'nav_html': nav_html},
                           reloadAllPages);
    })
});

// for submit button; makes a ajax call and calls successhandler or displays
// error message on modal
// ex) `createPage` in page.js
function modalSubmitHandler(modalID, url, method, requestData, successHandler, errorHandler) {
    setupAjax();
    const $modal = $('#' + modalID);
    $.ajax({
        url: url,
        method: method,
        data: requestData,
        success: function(data) {
            $modal.find('ul.errorlist').parent().parent().remove()
            if (successHandler) {
                successHandler(data);
            }
            $modal.find('input').val('');
            $modal.modal('close');
        },
        error: function(jqXHR) {
            console.error("ajax call failed", jqXHR);
            let errors = ['Cannot connect to the server. Check your internet connection.'];
            if (jqXHR.responseJSON != undefined) {
                errors = jqXHR.responseJSON['errors']; // array of error messages
            }
            // remove existing error message TODO don't hardcode; is removing all tr necessary?
            $modal.find('ul.errorlist').parent().parent().remove()
            const error_list = $('<tr><td colspan="2"><ul class="errorlist nonfield"></ul></td></tr>');
            for (let key in errors) {
                let error = errors[key];
                if (error == "This field is required.") {
                    var label = $('label[for="id_' + key + '"]').html();
                    if (label != null) {
                        label = label.substring(0, label.length - 1);
                        error = label + " is required.";
                    }
                }
                error_list.find("ul").append("<li>" + error + "</li>");
            }
            $modal.find('tbody').prepend(error_list);
            if (errorHandler) {
                errorHandler();
            }
        }
    })
}

function initializeEditNavModal() {
    /* clone current nav bar */
    var nav = $('nav').first().clone();
    var el = $('#nav-preview').empty().append(nav);

    /* update nav content to show in editor */
    updateButtonList();

    /* updated style selection menu */
    var brand_logo = nav.find('.brand-logo').text();
    var bg_color = rgb2hex(nav.css('background-color'));
    var color = rgb2hex(nav.css('color'));
    var opacity = nav.css('opacity');

    $('#nav-customize input[name=brand-logo]').val(brand_logo);
    $('#nav-customize input[name=background-color]').val(bg_color);
    $('#nav-customize input[name=color]').val(color);
    $('#nav-customize input[name=opacity]').val(opacity);

    /* initialize modal */
    $('#nav-modal').modal({
        ready: function() {
            /* initialize tabs */
            $('#nav-control ul.tabs').tabs('select_tab', 'content');
        }
    });
    $('#nav-modal').modal('open');
}
